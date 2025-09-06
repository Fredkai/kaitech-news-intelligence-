// KaiTech Voice of Time - Node.js Development Server
// Supports both local and external device access

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');
const axios = require('axios');

// Configuration
const HTTP_PORT = 8080;
const HTTPS_PORT = 8443;
const HOST = '0.0.0.0'; // Bind to all interfaces for external access

// Grok AI Configuration 
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_API_KEY = process.env.GROK_API_KEY || 'your-grok-api-key-here';

// Live News Configuration
const xml2js = require('xml2js');
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

// MIME types for proper content serving
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav'
};

// Get local network IP addresses
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

// Helper function to get request body for POST requests
function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Live News Processing Functions
async function fetchRSSFeed(source) {
    try {
        const response = await axios.get(source.url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'KaiTech News Intelligence Bot 1.0'
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
    
    // AI-powered categorization and enhancement
    const enhancedNews = await Promise.all(allNews.slice(0, 50).map(async (article) => {
        const aiCategory = await categorizeWithAI(article.title + ' ' + article.description);
        return {
            ...article,
            aiCategory,
            sentiment: await analyzeSentiment(article.title),
            trending: calculateTrendingScore(article)
        };
    }));
    
    NEWS_CACHE.set(cacheKey, {
        data: enhancedNews,
        timestamp: Date.now()
    });
    
    return enhancedNews;
}

async function categorizeWithAI(text) {
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
    
    return 'General';
}

async function analyzeSentiment(text) {
    const positiveWords = ['breakthrough', 'success', 'growth', 'positive', 'achievement', 'innovation', 'progress'];
    const negativeWords = ['crisis', 'failure', 'decline', 'negative', 'problem', 'concern', 'issue'];
    
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

// AI-Powered Discovery Feed Generation
async function generateDiscoveryFeed(allNews) {
    const categories = {};
    const topTrending = allNews.filter(a => a.trending > 70).slice(0, 5);
    const recentBreaking = allNews.filter(a => 
        a.title.toLowerCase().includes('breaking') || 
        (Date.now() - new Date(a.pubDate).getTime()) < 7200000 // 2 hours
    ).slice(0, 10);
    
    // Group by AI categories
    allNews.forEach(article => {
        const cat = article.aiCategory || 'General';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(article);
    });
    
    // Limit each category
    Object.keys(categories).forEach(cat => {
        categories[cat] = categories[cat].slice(0, 8);
    });
    
    return {
        trending: topTrending,
        breaking: recentBreaking,
        categories: categories,
        featured: allNews.filter(a => a.sentiment === 'positive').slice(0, 6),
        aiRecommendations: await generateAIRecommendations(allNews.slice(0, 20))
    };
}

// Generate AI-powered recommendations
async function generateAIRecommendations(articles) {
    const recommendations = [];
    
    // Technology focus
    const techArticles = articles.filter(a => 
        a.aiCategory === 'AI & Technology' || 
        a.category === 'technology'
    );
    
    if (techArticles.length > 0) {
        recommendations.push({
            title: '🤖 AI & Technology Focus',
            description: 'Latest breakthroughs in artificial intelligence and technology',
            articles: techArticles.slice(0, 5),
            insight: `${techArticles.length} technology articles analyzed. Focus on AI innovation and tech developments.`
        });
    }
    
    // Market movers
    const businessArticles = articles.filter(a => 
        a.aiCategory === 'Business' || a.aiCategory === 'Cryptocurrency'
    );
    
    if (businessArticles.length > 0) {
        recommendations.push({
            title: '📈 Market Movers',
            description: 'Business and financial news that matters',
            articles: businessArticles.slice(0, 5),
            insight: `${businessArticles.length} business stories identified. Market sentiment appears ${businessArticles.filter(a => a.sentiment === 'positive').length > businessArticles.length / 2 ? 'positive' : 'cautious'}.`
        });
    }
    
    return recommendations;
}

// Market Data Processing
async function getMarketData() {
    // Simulated market data - in production, integrate with financial APIs
    const marketData = {
        indices: [
            { name: 'S&P 500', value: '4,567.89', change: '+12.34', changePercent: '+0.27%', trend: 'up' },
            { name: 'NASDAQ', value: '14,234.56', change: '+45.67', changePercent: '+0.32%', trend: 'up' },
            { name: 'DOW', value: '34,567.12', change: '-23.45', changePercent: '-0.07%', trend: 'down' },
            { name: 'FTSE 100', value: '7,456.78', change: '+18.90', changePercent: '+0.25%', trend: 'up' }
        ],
        crypto: [
            { name: 'Bitcoin', symbol: 'BTC', price: '$43,567.89', change: '+2.3%', trend: 'up' },
            { name: 'Ethereum', symbol: 'ETH', price: '$2,456.78', change: '+1.8%', trend: 'up' },
            { name: 'Solana', symbol: 'SOL', price: '$98.45', change: '-0.5%', trend: 'down' }
        ],
        news: await getMarketNews(),
        lastUpdate: new Date().toISOString()
    };
    
    return marketData;
}

// Get market-specific news
async function getMarketNews() {
    try {
        const allNews = await aggregateAllNews();
        return allNews.filter(article => {
            const text = (article.title + ' ' + article.description).toLowerCase();
            return text.includes('market') || text.includes('stock') || text.includes('crypto') || 
                   text.includes('bitcoin') || text.includes('economy') || text.includes('financial');
        }).slice(0, 10);
    } catch (error) {
        return [];
    }
}

// Generate Personalized Feed
async function generatePersonalizedFeed(allNews, interests) {
    const interestList = interests ? interests.split(',') : ['technology', 'ai', 'business'];
    
    const personalizedArticles = allNews.filter(article => {
        const content = (article.title + ' ' + article.description).toLowerCase();
        return interestList.some(interest => 
            content.includes(interest.toLowerCase()) ||
            article.aiCategory?.toLowerCase().includes(interest.toLowerCase())
        );
    });
    
    return {
        articles: personalizedArticles.slice(0, 20),
        interests: interestList,
        totalMatches: personalizedArticles.length,
        suggestions: await generateInterestSuggestions(allNews),
        aiInsights: `Based on your interests in ${interestList.join(', ')}, we found ${personalizedArticles.length} relevant articles.`
    };
}

// Generate interest suggestions
async function generateInterestSuggestions(allNews) {
    const categoryCount = {};
    allNews.forEach(article => {
        const cat = article.aiCategory || article.category || 'General';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([category, count]) => ({ category, count }));
}

// Comprehensive Analysis
async function generateComprehensiveAnalysis(allNews) {
    const sentimentCounts = {
        positive: allNews.filter(a => a.sentiment === 'positive').length,
        neutral: allNews.filter(a => a.sentiment === 'neutral').length,
        negative: allNews.filter(a => a.sentiment === 'negative').length
    };
    
    const categoryAnalysis = {};
    allNews.forEach(article => {
        const cat = article.aiCategory || 'General';
        if (!categoryAnalysis[cat]) {
            categoryAnalysis[cat] = { count: 0, positive: 0, negative: 0, trending: [] };
        }
        categoryAnalysis[cat].count++;
        if (article.sentiment === 'positive') categoryAnalysis[cat].positive++;
        if (article.sentiment === 'negative') categoryAnalysis[cat].negative++;
        if (article.trending > 75) categoryAnalysis[cat].trending.push(article.title);
    });
    
    const topTrending = allNews
        .sort((a, b) => b.trending - a.trending)
        .slice(0, 10)
        .map(article => ({
            title: article.title,
            trending: article.trending,
            sentiment: article.sentiment,
            category: article.aiCategory
        }));
    
    return {
        sentiment: {
            overview: sentimentCounts,
            percentage: {
                positive: Math.round((sentimentCounts.positive / allNews.length) * 100),
                neutral: Math.round((sentimentCounts.neutral / allNews.length) * 100),
                negative: Math.round((sentimentCounts.negative / allNews.length) * 100)
            }
        },
        categories: categoryAnalysis,
        trending: topTrending,
        insights: await generateAIInsights(allNews),
        totalArticles: allNews.length,
        lastAnalysis: new Date().toISOString()
    };
}

// Generate AI insights
async function generateAIInsights(allNews) {
    const insights = [];
    
    const positivePercent = (allNews.filter(a => a.sentiment === 'positive').length / allNews.length) * 100;
    insights.push(`Overall sentiment is ${positivePercent > 60 ? 'optimistic' : positivePercent > 40 ? 'balanced' : 'cautious'} with ${positivePercent.toFixed(1)}% positive coverage.`);
    
    const techArticles = allNews.filter(a => a.aiCategory === 'AI & Technology').length;
    if (techArticles > allNews.length * 0.2) {
        insights.push(`Technology dominates headlines with ${techArticles} AI and tech stories.`);
    }
    
    const breakingCount = allNews.filter(a => a.title.toLowerCase().includes('breaking')).length;
    if (breakingCount > 0) {
        insights.push(`${breakingCount} breaking news stories detected in current feed.`);
    }
    
    return insights;
}

// Live News Data
async function getLiveNewsData() {
    const allNews = await aggregateAllNews();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    const liveUpdates = allNews.filter(article => 
        new Date(article.pubDate) > oneHourAgo
    ).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    const breakingNews = allNews.filter(article => 
        article.title.toLowerCase().includes('breaking') ||
        article.title.toLowerCase().includes('urgent') ||
        article.trending > 85
    ).slice(0, 5);
    
    return {
        liveUpdates: liveUpdates.slice(0, 15),
        breaking: breakingNews,
        stats: {
            updatesLastHour: liveUpdates.length,
            breakingStories: breakingNews.length,
            totalStories: allNews.length,
            activeSources: [...new Set(allNews.map(a => a.source))].length
        },
        lastRefresh: now.toISOString()
    };
}

// Grok API interaction function
async function chatWithGrok(userMessage, newsContext = null) {
    try {
        const systemPrompt = `You are a helpful AI assistant for KaiTech Voice of Time, a news and technology platform. You help users understand news, technology trends, and provide insightful analysis. Be professional, informative, and engaging.${newsContext ? ` Here's some current news context: ${JSON.stringify(newsContext)}` : ''}`;
        
        const response = await axios.post(GROK_API_URL, {
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Grok API Error:', error.response?.data || error.message);
        
        // Fallback response if Grok API is not available
        return `I apologize, but I'm having trouble connecting to the AI service right now. However, I can help you with general information about news and technology. Your message: "${userMessage}" - Please try again in a moment, or feel free to browse our news sections for the latest updates.`;
    }
}

// Request handler
function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    
    // Security headers
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Powered-By', 'KaiTech Voice of Time');
    
    // CORS headers for external device access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Default to index.html for root requests
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // API endpoints
    if (pathname.startsWith('/api/')) {
        handleAPIRequest(req, res, pathname, parsedUrl.query);
        return;
    }
    
    // Static file serving
    const filePath = path.join(__dirname, pathname);
    
    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('403 Forbidden: Access denied');
        return;
    }
    
    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (err) {
            // Try to serve index.html for SPA routing
            if (pathname !== '/index.html') {
                const indexPath = path.join(__dirname, 'index.html');
                serveFile(indexPath, req, res);
            } else {
                res.writeHead(404);
                res.end('404 Not Found');
            }
            return;
        }
        
        if (stats.isDirectory()) {
            // Try to serve index.html in directory
            const indexPath = path.join(filePath, 'index.html');
            serveFile(indexPath, req, res);
        } else {
            serveFile(filePath, req, res);
        }
    });
}

// Serve static files
function serveFile(filePath, req, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
            return;
        }
        
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        res.setHeader('Content-Type', contentType);
        
        // Cache headers for static assets
        if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'].includes(ext)) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
            res.setHeader('Expires', new Date(Date.now() + 86400000).toUTCString());
        } else if (ext === '.html') {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
        
        // Enable compression for text files
        if (contentType.includes('text') || contentType.includes('javascript') || contentType.includes('json')) {
            res.setHeader('Vary', 'Accept-Encoding');
        }
        
        res.writeHead(200);
        res.end(data);
    });
}

// Handle API requests
async function handleAPIRequest(req, res, pathname, query) {
    res.setHeader('Content-Type', 'application/json');
    
    switch (pathname) {
        case '/api/health':
            res.writeHead(200);
            res.end(JSON.stringify({
                status: 'healthy',
                server: 'KaiTech Voice of Time',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                node_version: process.version,
                local_ips: getLocalIPs()
            }, null, 2));
            break;
            
        case '/api/server-info':
            res.writeHead(200);
            res.end(JSON.stringify({
                name: 'KaiTech Voice of Time',
                version: '1.0.0',
                description: 'Professional technology solutions with real-time world headlines coverage',
                endpoints: {
                    health: '/api/health',
                    'server-info': '/api/server-info',
                    'breaking-news': '/api/breaking-news'
                },
                access: {
                    local: `http://localhost:${HTTP_PORT}`,
                    network: getLocalIPs().map(ip => `http://${ip}:${HTTP_PORT}`)
                }
            }, null, 2));
            break;
            
        case '/api/breaking-news':
        case '/api/news':
            try {
                const allNews = await aggregateAllNews();
                const breakingNews = allNews.filter(article => 
                    article.trending > 70 || 
                    article.title.toLowerCase().includes('breaking') ||
                    (Date.now() - new Date(article.pubDate).getTime()) < 3600000
                ).slice(0, 10);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: breakingNews,
                    total: breakingNews.length,
                    timestamp: new Date().toISOString(),
                    sources: RSS_SOURCES.map(s => s.name)
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to fetch news data',
                    timestamp: new Date().toISOString()
                }, null, 2));
            }
            break;
            
        case '/api/news/trending':
            try {
                const allNews = await aggregateAllNews();
                const trending = allNews.sort((a, b) => b.trending - a.trending).slice(0, 20);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: trending,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to fetch trending news'
                }, null, 2));
            }
            break;
            
        case '/api/news/categories':
            try {
                const allNews = await aggregateAllNews();
                const categories = {};
                
                allNews.forEach(article => {
                    const cat = article.aiCategory || article.category || 'General';
                    if (!categories[cat]) categories[cat] = [];
                    categories[cat].push(article);
                });
                
                // Limit each category to top 10 articles
                Object.keys(categories).forEach(cat => {
                    categories[cat] = categories[cat].slice(0, 10);
                });
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: categories,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to fetch categorized news'
                }, null, 2));
            }
            break;
            
        case '/api/news/sentiment':
            try {
                const allNews = await aggregateAllNews();
                const sentimentData = {
                    positive: allNews.filter(a => a.sentiment === 'positive').length,
                    neutral: allNews.filter(a => a.sentiment === 'neutral').length,
                    negative: allNews.filter(a => a.sentiment === 'negative').length,
                    total: allNews.length,
                    articles: {
                        positive: allNews.filter(a => a.sentiment === 'positive').slice(0, 5),
                        negative: allNews.filter(a => a.sentiment === 'negative').slice(0, 5)
                    }
                };
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: sentimentData,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to analyze sentiment'
                }, null, 2));
            }
            break;
            
        case '/api/news/search':
            try {
                const searchQuery = query.q || '';
                if (!searchQuery.trim()) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        status: 'error',
                        message: 'Search query is required (use ?q=your_search)'
                    }, null, 2));
                    return;
                }
                
                const allNews = await aggregateAllNews();
                const searchResults = allNews.filter(article => 
                    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    article.description.toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, 20);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    query: searchQuery,
                    data: searchResults,
                    total: searchResults.length,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to search news'
                }, null, 2));
            }
            break;
            
        case '/api/chat':
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end(JSON.stringify({
                    error: 'Method not allowed',
                    message: 'Chat endpoint only accepts POST requests'
                }, null, 2));
                return;
            }
            
            try {
                const body = await getRequestBody(req);
                const { message, includeNewsContext } = body;
                
                if (!message || message.trim() === '') {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        error: 'Bad request',
                        message: 'Message is required'
                    }, null, 2));
                    return;
                }
                
                // Get current news context if requested
                let newsContext = null;
                if (includeNewsContext) {
                    try {
                        const allNews = await aggregateAllNews();
                        newsContext = allNews.slice(0, 5).map(article => ({
                            title: article.title,
                            summary: article.description,
                            category: article.aiCategory || article.category,
                            sentiment: article.sentiment,
                            source: article.source,
                            timestamp: article.pubDate
                        }));
                    } catch (error) {
                        console.error('Failed to get news context for chat:', error);
                        // Fallback context
                        newsContext = [{
                            title: "Live news data temporarily unavailable",
                            summary: "AI assistant is working with cached information",
                            category: "System",
                            timestamp: new Date().toISOString()
                        }];
                    }
                }
                
                const aiResponse = await chatWithGrok(message, newsContext);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    response: aiResponse,
                    timestamp: new Date().toISOString(),
                    context_included: !!newsContext
                }, null, 2));
                
            } catch (error) {
                console.error('Chat API Error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Internal server error',
                    message: 'Failed to process chat request'
                }, null, 2));
            }
            break;
            
        case '/api/discover':
            try {
                const allNews = await aggregateAllNews();
                const discoveryFeed = await generateDiscoveryFeed(allNews);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: discoveryFeed,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to generate discovery feed'
                }, null, 2));
            }
            break;
            
        case '/api/markets':
            try {
                const marketData = await getMarketData();
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: marketData,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to fetch market data'
                }, null, 2));
            }
            break;
            
        case '/api/foryou':
            try {
                const allNews = await aggregateAllNews();
                const personalizedFeed = await generatePersonalizedFeed(allNews, query.interests);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: personalizedFeed,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to generate personalized feed'
                }, null, 2));
            }
            break;
            
        case '/api/analysis':
            try {
                const allNews = await aggregateAllNews();
                const analysisData = await generateComprehensiveAnalysis(allNews);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: analysisData,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to generate analysis'
                }, null, 2));
            }
            break;
            
        case '/api/live':
            try {
                const liveData = await getLiveNewsData();
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: liveData,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to fetch live data'
                }, null, 2));
            }
            break;
            
        default:
            res.writeHead(404);
            res.end(JSON.stringify({
                error: 'API endpoint not found',
                available_endpoints: [
                    '/api/health', '/api/server-info', '/api/breaking-news', '/api/news', 
                    '/api/news/trending', '/api/news/sentiment', '/api/news/search',
                    '/api/discover', '/api/markets', '/api/foryou', '/api/analysis', '/api/live', '/api/chat'
                ]
            }, null, 2));
    }
}

// Check for SSL certificates
let useHTTPS = false;
let sslOptions = {};

try {
    sslOptions = {
        key: fs.readFileSync(path.join(__dirname, 'ssl', 'kaitech-local.key')),
        cert: fs.readFileSync(path.join(__dirname, 'ssl', 'kaitech-local.crt'))
    };
    useHTTPS = true;
    console.log('🔒 SSL certificates found - HTTPS server will be available');
} catch (error) {
    console.log('⚠️  SSL certificates not found - HTTP server only');
    console.log('💡 Run generate-ssl-certs.ps1 to enable HTTPS');
}

// Create servers
const httpServer = http.createServer(handleRequest);
let httpsServer;

if (useHTTPS) {
    httpsServer = https.createServer(sslOptions, handleRequest);
}

// Start servers
const localIPs = getLocalIPs();

httpServer.listen(HTTP_PORT, HOST, () => {
    console.log('');
    console.log('🚀 KaiTech Voice of Time - Development Server');
    console.log('============================================');
    console.log(`📅 Started: ${new Date().toLocaleString()}`);
    console.log(`💻 Node.js: ${process.version}`);
    console.log('');
    console.log('🌐 HTTP Server Running:');
    console.log(`   - Local: http://localhost:${HTTP_PORT}`);
    console.log(`   - Local: http://127.0.0.1:${HTTP_PORT}`);
    
    if (localIPs.length > 0) {
        console.log('');
        console.log('📱 External Access (phones, tablets):');
        localIPs.forEach(ip => {
            console.log(`   - Network: http://${ip}:${HTTP_PORT}`);
        });
    }
});

if (useHTTPS && httpsServer) {
    httpsServer.listen(HTTPS_PORT, HOST, () => {
        console.log('');
        console.log('🔒 HTTPS Server Running:');
        console.log(`   - Local: https://localhost:${HTTPS_PORT}`);
        console.log(`   - Local: https://127.0.0.1:${HTTPS_PORT}`);
        
        if (localIPs.length > 0) {
            localIPs.forEach(ip => {
                console.log(`   - Network: https://${ip}:${HTTPS_PORT}`);
            });
        }
        
        console.log('');
        console.log('⚠️  Certificate Warning: Accept self-signed cert in browser');
    });
}

console.log('');
console.log('📡 API Endpoints:');
console.log('   - Health Check: /api/health');
console.log('   - Server Info: /api/server-info');
console.log('   - Breaking News: /api/breaking-news');
console.log('   - All News: /api/news');
console.log('   - Trending: /api/news/trending');
console.log('   - Sentiment: /api/news/sentiment');
console.log('   - Search: /api/news/search?q=query');
console.log('   - 🔍 Discover: /api/discover');
console.log('   - 💹 Markets: /api/markets');
console.log('   - ⭐ For You: /api/foryou?interests=tech,ai');
console.log('   - 🧠 Analysis: /api/analysis');
console.log('   - 🔴 Live: /api/live');
console.log('   - 🤖 AI Chat: /api/chat (POST)');

console.log('');
console.log('📱 Mobile Access Instructions:');
console.log('1. Ensure your phone is on the same Wi-Fi network');
if (localIPs.length > 0) {
    console.log(`2. Open browser and go to: http://${localIPs[0]}:${HTTP_PORT}`);
} else {
    console.log('2. Use one of the network URLs above');
}
console.log('3. Enjoy your KaiTech website on mobile!');

console.log('');
console.log('Press Ctrl+C to stop the server');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down KaiTech servers...');
    
    httpServer.close(() => {
        console.log('✅ HTTP server stopped');
        
        if (httpsServer) {
            httpsServer.close(() => {
                console.log('✅ HTTPS server stopped');
                console.log('🎉 All servers stopped gracefully');
                process.exit(0);
            });
        } else {
            console.log('🎉 Server stopped gracefully');
            process.exit(0);
        }
    });
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
