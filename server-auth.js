// KaiTech Voice of Time - Enhanced Node.js Server with Authentication
// Supports user profiles, OAuth, and personalized news experience

// Load environment variables
require('dotenv').config();

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const UserRoutes = require('./auth/user-routes');
const SimpleAuthenticationManager = require('./auth/simple-auth');

// Import existing news functionality
const axios = require('axios');
const xml2js = require('xml2js');
const os = require('os');

// Configuration
const HTTP_PORT = process.env.HTTP_PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const HOST = '0.0.0.0';

// Initialize Express App
const app = express();

// Initialize Authentication
const authManager = new SimpleAuthenticationManager();
const userRoutes = new UserRoutes();

// Security and Middleware Setup
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "wss:", "ws:"]
        }
    }
}));

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'https://localhost:8443',
            'https://127.0.0.1:8443'
        ];
        
        // Add network IPs to allowed origins
        const localIPs = getLocalIPs();
        localIPs.forEach(ip => {
            allowedOrigins.push(`http://${ip}:8080`);
            allowedOrigins.push(`https://${ip}:8443`);
        });
        
        callback(null, true); // Allow all origins for development
    },
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session and Authentication Middleware
app.use(authManager.getSessionConfig());
app.use(passport.initialize());
app.use(passport.session());

// Static file serving
app.use(express.static('.', {
    index: 'index.html',
    setHeaders: (res, filePath) => {
        // Cache control for static assets
        if (filePath.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        }
    }
}));

// API Routes

// Authentication Routes
app.use('/auth', userRoutes.getRouter());

// Enhanced API Routes with User Context
app.use('/api', (req, res, next) => {
    // Add user context to all API requests
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    next();
});

// Existing news API with user personalization
const NEWS_CACHE = new Map();
const CACHE_DURATION = 300000; // 5 minutes

// RSS News Sources
const RSS_SOURCES = [
    { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'world' },
    { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews', category: 'world' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'technology' },
    { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', category: 'world' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'technology' }
];

// API endpoint for personalized news feed
app.get('/api/news/personalized', authManager.requireAuth.bind(authManager), async (req, res) => {
    try {
        const user = req.user;
        const allNews = await aggregateAllNews();
        
        // Filter based on user preferences
        let personalizedNews = allNews;
        
        if (user.preferences && user.preferences.news_categories && user.preferences.news_categories.length > 0) {
            personalizedNews = allNews.filter(article => {
                const articleCategories = [article.category, article.aiCategory].map(c => c?.toLowerCase());
                return user.preferences.news_categories.some(pref => 
                    articleCategories.includes(pref.toLowerCase())
                );
            });
        }
        
        // Record user interaction for personalization
        if (authManager.userDb) {
            await authManager.userDb.recordUserInteraction(user.id, 'news_feed_view', {
                articles_count: personalizedNews.length,
                categories_viewed: [...new Set(personalizedNews.map(a => a.aiCategory))],
                timestamp: new Date().toISOString()
            });
        }
        
        const itemsPerPage = (user.preferences && user.preferences.items_per_page) || 20;
        const page = parseInt(req.query.page) || 1;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        res.json({
            success: true,
            articles: personalizedNews.slice(startIndex, endIndex),
            pagination: {
                page,
                per_page: itemsPerPage,
                total: personalizedNews.length,
                total_pages: Math.ceil(personalizedNews.length / itemsPerPage)
            },
            user_preferences: user.preferences
        });
        
    } catch (error) {
        console.error('Personalized news error:', error);
        res.status(500).json({
            error: 'Failed to fetch personalized news',
            message: error.message
        });
    }
});

// Existing API endpoints (with optional user context)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        server: 'KaiTech Voice of Time',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        authenticated: req.isAuthenticated(),
        user_id: req.user ? req.user.id : null
    });
});

app.get('/api/server-info', (req, res) => {
    const localIPs = getLocalIPs();
    res.json({
        server_name: 'KaiTech Voice of Time',
        version: '2.0.0',
        node_version: process.version,
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        local_ips: localIPs,
        ports: {
            http: HTTP_PORT,
            https: HTTPS_PORT
        },
        features: {
            authentication: true,
            oauth: true,
            personalization: true,
            saved_articles: true
        },
        authenticated: req.isAuthenticated(),
        user: req.user ? {
            id: req.user.id,
            username: req.user.username,
            display_name: req.user.display_name
        } : null
    });
});

// All news endpoint
app.get('/api/news', async (req, res) => {
    try {
        const allNews = await aggregateAllNews();
        res.json({
            success: true,
            articles: allNews,
            count: allNews.length,
            cached: true,
            last_updated: new Date().toISOString()
        });
    } catch (error) {
        console.error('News API error:', error);
        res.status(500).json({
            error: 'Failed to fetch news',
            message: error.message
        });
    }
});

// Breaking news endpoint
app.get('/api/breaking-news', async (req, res) => {
    try {
        const allNews = await aggregateAllNews();
        const breakingNews = allNews.filter(article => {
            const hoursOld = (Date.now() - new Date(article.pubDate).getTime()) / (1000 * 60 * 60);
            return hoursOld < 2 || article.title.toLowerCase().includes('breaking');
        }).slice(0, 10);
        
        res.json({
            success: true,
            articles: breakingNews,
            count: breakingNews.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch breaking news' });
    }
});

// User Dashboard Route
app.get('/dashboard', authManager.requireAuth.bind(authManager), (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Login page route
app.get('/login', authManager.requireNoAuth.bind(authManager), (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Register page route
app.get('/register', authManager.requireNoAuth.bind(authManager), (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Profile page route
app.get('/profile', authManager.requireAuth.bind(authManager), (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

// Import existing helper functions
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    Object.keys(interfaces).forEach(interfaceName => {
        interfaces[interfaceName].forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        });
    });
    
    return ips;
}

// News processing functions (imported from original server)
async function fetchRSSFeed(source) {
    try {
        const response = await axios.get(source.url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'KaiTech News Intelligence Bot 2.0'
            }
        });
        
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);
        
        const items = result.rss?.channel?.[0]?.item || result.feed?.entry || [];
        
        return items.slice(0, 10).map((item, index) => ({
            id: `${source.name.toLowerCase().replace(/\s+/g, '_')}_${index}`,
            title: Array.isArray(item.title) ? item.title[0] : item.title || 'No Title',
            description: Array.isArray(item.description) ? item.description[0] : item.description || '',
            link: Array.isArray(item.link) ? item.link[0] : item.link || '',
            pubDate: Array.isArray(item.pubDate) ? item.pubDate[0] : item.pubDate || new Date().toISOString(),
            source: source.name,
            category: source.category,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error(`Error fetching RSS from ${source.name}:`, error.message);
        return [];
    }
}

async function aggregateAllNews() {
    const cacheKey = 'all_news';
    const cached = NEWS_CACHE.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
    }
    
    console.log('Fetching fresh news data...');
    const allNewsPromises = RSS_SOURCES.map(source => fetchRSSFeed(source));
    const newsArrays = await Promise.all(allNewsPromises);
    
    const allNews = newsArrays.flat().sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB - dateA;
    });
    
    // Simple categorization without AI for now (to avoid API costs during development)
    const enhancedNews = allNews.map(article => {
        return {
            ...article,
            aiCategory: categorizeByKeywords(article.title + ' ' + article.description),
            sentiment: analyzeSentimentByKeywords(article.title),
            trending: calculateTrendingScore(article),
            enhanced: true
        };
    });
    
    NEWS_CACHE.set(cacheKey, {
        data: enhancedNews,
        timestamp: Date.now()
    });
    
    return enhancedNews;
}

// Simple keyword-based categorization
function categorizeByKeywords(text) {
    const keywords = text.toLowerCase();
    
    if (keywords.includes('ai') || keywords.includes('artificial intelligence') || keywords.includes('machine learning')) {
        return 'AI & Technology';
    }
    if (keywords.includes('crypto') || keywords.includes('blockchain') || keywords.includes('bitcoin')) {
        return 'Cryptocurrency';
    }
    if (keywords.includes('climate') || keywords.includes('environment') || keywords.includes('green')) {
        return 'Environment';
    }
    if (keywords.includes('election') || keywords.includes('politics') || keywords.includes('government')) {
        return 'Politics';
    }
    if (keywords.includes('business') || keywords.includes('economy') || keywords.includes('market')) {
        return 'Business';
    }
    if (keywords.includes('health') || keywords.includes('medical') || keywords.includes('covid')) {
        return 'Health';
    }
    if (keywords.includes('sport') || keywords.includes('football') || keywords.includes('basketball')) {
        return 'Sports';
    }
    if (keywords.includes('movie') || keywords.includes('music') || keywords.includes('celebrity')) {
        return 'Entertainment';
    }
    if (keywords.includes('science') || keywords.includes('research') || keywords.includes('study')) {
        return 'Science';
    }
    
    return 'General';
}

// Simple keyword-based sentiment analysis
function analyzeSentimentByKeywords(text) {
    const positiveWords = ['breakthrough', 'success', 'growth', 'positive', 'achievement', 'innovation', 'progress', 'win', 'victory', 'celebration'];
    const negativeWords = ['crisis', 'failure', 'decline', 'negative', 'problem', 'concern', 'issue', 'disaster', 'tragedy', 'conflict', 'death'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

function calculateTrendingScore(article) {
    const hoursOld = (Date.now() - new Date(article.pubDate).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 100 - (hoursOld * 2));
    const keywordScore = (article.title.toLowerCase().includes('breaking') ? 20 : 0) +
                        (article.title.toLowerCase().includes('urgent') ? 15 : 0) +
                        (article.title.toLowerCase().includes('live') ? 10 : 0);
    
    return Math.min(100, recencyScore + keywordScore);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            error: 'API endpoint not found',
            path: req.path
        });
    } else {
        res.status(404).send('<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p><p><a href="/">Go back to home</a></p>');
    }
});

// Server startup
function startServer() {
    // HTTP Server
    const httpServer = http.createServer(app);
    
    httpServer.listen(HTTP_PORT, HOST, () => {
        const localIPs = getLocalIPs();
        
        console.log('\n🚀 KaiTech Voice of Time - Enhanced Server with Authentication');
        console.log('===============================================================');
        console.log(`📅 Started: ${new Date().toLocaleString()}`);
        console.log(`💻 Node.js: ${process.version}`);
        console.log('');
        console.log('🌐 HTTP Server Running:');
        console.log(`   - Local: http://localhost:${HTTP_PORT}`);
        console.log(`   - Local: http://127.0.0.1:${HTTP_PORT}`);
        console.log('');
        console.log('📱 External Access (phones, tablets):');
        localIPs.forEach(ip => {
            console.log(`   - Network: http://${ip}:${HTTP_PORT}`);
        });
        console.log('');
        console.log('✨ New Features:');
        console.log('   - 🔐 User Authentication (Local & OAuth)');
        console.log('   - 👤 User Profiles & Preferences');
        console.log('   - 📰 Personalized News Feed');
        console.log('   - 💾 Save Articles');
        console.log('   - 🔗 Account Linking (Google, GitHub)');
        console.log('');
        console.log('📡 API Endpoints:');
        console.log('   - Health Check: /api/health');
        console.log('   - Server Info: /api/server-info');
        console.log('   - All News: /api/news');
        console.log('   - Personalized News: /api/news/personalized (auth required)');
        console.log('   - Breaking News: /api/breaking-news');
        console.log('');
        console.log('🔐 Authentication Endpoints:');
        console.log('   - Register: POST /auth/register');
        console.log('   - Login: POST /auth/login');
        console.log('   - Google OAuth: /auth/google');
        console.log('   - GitHub OAuth: /auth/github');
        console.log('   - Profile: GET /auth/profile (auth required)');
        console.log('   - Saved Articles: GET /auth/saved-articles (auth required)');
        console.log('');
        console.log('📱 Pages:');
        console.log('   - Home: /');
        console.log('   - Login: /login');
        console.log('   - Register: /register');
        console.log('   - Dashboard: /dashboard (auth required)');
        console.log('   - Profile: /profile (auth required)');
        console.log('');
        console.log('Press Ctrl+C to stop the server');
        console.log('');
    });
    
    // HTTPS Server (if certificates exist)
    const httpsKeyPath = path.join(__dirname, 'ssl', 'server.key');
    const httpsCertPath = path.join(__dirname, 'ssl', 'server.cert');
    
    if (fs.existsSync(httpsKeyPath) && fs.existsSync(httpsCertPath)) {
        try {
            const httpsOptions = {
                key: fs.readFileSync(httpsKeyPath),
                cert: fs.readFileSync(httpsCertPath)
            };
            
            const httpsServer = https.createServer(httpsOptions, app);
            
            httpsServer.listen(HTTPS_PORT, HOST, () => {
                console.log('🔒 HTTPS Server Running:');
                console.log(`   - Secure Local: https://localhost:${HTTPS_PORT}`);
                console.log(`   - Secure Local: https://127.0.0.1:${HTTPS_PORT}`);
                localIPs.forEach(ip => {
                    console.log(`   - Secure Network: https://${ip}:${HTTPS_PORT}`);
                });
                console.log('');
            });
        } catch (error) {
            console.log('⚠️  HTTPS server failed to start:', error.message);
        }
    } else {
        console.log('⚠️  SSL certificates not found - HTTP server only');
        console.log('💡 Run generate-ssl-certs.ps1 to enable HTTPS');
        console.log('');
    }
    
    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
    async function gracefulShutdown(signal) {
        console.log(`\n👋 Received ${signal}. Shutting down KaiTech servers...`);
        
        // Close authentication manager and database connections
        try {
            await authManager.close();
            await userRoutes.close();
        } catch (error) {
            console.error('Error closing authentication services:', error);
        }
        
        httpServer.close(() => {
            console.log('✅ HTTP server stopped');
            console.log('🎉 Server stopped gracefully');
            process.exit(0);
        });
    }
}

// Start the server
startServer();

module.exports = app;
