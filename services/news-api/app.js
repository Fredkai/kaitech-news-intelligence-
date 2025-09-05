const express = require('express');
const cors = require('cors');
const Redis = require('redis');
const { Pool } = require('pg');
const axios = require('axios');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Redis connection for real-time caching
const redis = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://newsuser:newspass@localhost:5432/newsdb'
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

// Store active WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected. Total clients:', clients.size);
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected. Total clients:', clients.size);
    });
});

// Broadcast breaking news to all connected clients
function broadcastBreakingNews(newsItem) {
    const message = JSON.stringify({
        type: 'breaking-news',
        data: newsItem
    });
    
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Initialize connections
async function initializeConnections() {
    try {
        await redis.connect();
        console.log('Connected to Redis');
        
        await pool.connect();
        console.log('Connected to PostgreSQL');
    } catch (error) {
        console.error('Connection error:', error);
    }
}

// API Routes

// Get latest breaking news
app.get('/api/breaking-news', async (req, res) => {
    try {
        // Check cache first
        const cached = await redis.get('breaking-news');
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        
        // Fetch from database if not cached
        const result = await pool.query(`
            SELECT * FROM news_articles 
            WHERE is_breaking = true 
            ORDER BY published_at DESC 
            LIMIT 10
        `);
        
        const breakingNews = result.rows;
        
        // Cache for 1 minute
        await redis.setEx('breaking-news', 60, JSON.stringify(breakingNews));
        
        res.json(breakingNews);
    } catch (error) {
        console.error('Error fetching breaking news:', error);
        res.status(500).json({ error: 'Failed to fetch breaking news' });
    }
});

// Get news by category
app.get('/api/news/:category', async (req, res) => {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    try {
        const cacheKey = `news-${category}-${limit}-${offset}`;
        const cached = await redis.get(cacheKey);
        
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        
        const result = await pool.query(`
            SELECT * FROM news_articles 
            WHERE category = $1 
            ORDER BY published_at DESC 
            LIMIT $2 OFFSET $3
        `, [category, limit, offset]);
        
        const news = result.rows;
        
        // Cache for 5 minutes
        await redis.setEx(cacheKey, 300, JSON.stringify(news));
        
        res.json(news);
    } catch (error) {
        console.error('Error fetching news by category:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Get trending news
app.get('/api/trending', async (req, res) => {
    try {
        const cached = await redis.get('trending-news');
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        
        const result = await pool.query(`
            SELECT *, 
                (engagement_score * freshness_score) as trending_score
            FROM news_articles 
            WHERE published_at > NOW() - INTERVAL '24 hours'
            ORDER BY trending_score DESC 
            LIMIT 15
        `);
        
        const trendingNews = result.rows;
        
        // Cache for 2 minutes
        await redis.setEx('trending-news', 120, JSON.stringify(trendingNews));
        
        res.json(trendingNews);
    } catch (error) {
        console.error('Error fetching trending news:', error);
        res.status(500).json({ error: 'Failed to fetch trending news' });
    }
});

// Get news analytics
app.get('/api/analytics', async (req, res) => {
    try {
        const cached = await redis.get('news-analytics');
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        
        const analytics = await Promise.all([
            // Total articles today
            pool.query(`
                SELECT COUNT(*) as total_articles 
                FROM news_articles 
                WHERE DATE(published_at) = CURRENT_DATE
            `),
            // Articles by category
            pool.query(`
                SELECT category, COUNT(*) as count 
                FROM news_articles 
                WHERE published_at > NOW() - INTERVAL '24 hours'
                GROUP BY category 
                ORDER BY count DESC
            `),
            // Sentiment distribution
            pool.query(`
                SELECT sentiment, COUNT(*) as count 
                FROM news_articles 
                WHERE published_at > NOW() - INTERVAL '24 hours'
                GROUP BY sentiment
            `),
            // Breaking news count
            pool.query(`
                SELECT COUNT(*) as breaking_count 
                FROM news_articles 
                WHERE is_breaking = true 
                AND published_at > NOW() - INTERVAL '24 hours'
            `)
        ]);
        
        const analyticsData = {
            totalArticles: analytics[0].rows[0].total_articles,
            categoryCounts: analytics[1].rows,
            sentimentDistribution: analytics[2].rows,
            breakingCount: analytics[3].rows[0].breaking_count,
            lastUpdated: new Date().toISOString()
        };
        
        // Cache for 5 minutes
        await redis.setEx('news-analytics', 300, JSON.stringify(analyticsData));
        
        res.json(analyticsData);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Real-time news search
app.get('/api/search', async (req, res) => {
    const { q, category, sentiment, limit = 20 } = req.query;
    
    if (!q) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    try {
        let query = `
            SELECT *, 
                ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $1)) as relevance_score
            FROM news_articles 
            WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
        `;
        const params = [q];
        let paramIndex = 2;
        
        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        
        if (sentiment) {
            query += ` AND sentiment = $${paramIndex}`;
            params.push(sentiment);
            paramIndex++;
        }
        
        query += ` ORDER BY relevance_score DESC, published_at DESC LIMIT $${paramIndex}`;
        params.push(limit);
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching news:', error);
        res.status(500).json({ error: 'Failed to search news' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
    console.log(`News API service running on port ${port}`);
    initializeConnections();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await redis.disconnect();
    await pool.end();
    process.exit(0);
});
