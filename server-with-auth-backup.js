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
const AuthenticationManager = require('./auth/auth');

// Import existing news functionality
const axios = require('axios');
const xml2js = require('xml2js');
const os = require('os');

// Import new news services
let NewsAPIService, GoogleNewsService, GeolocationService, NewsFilterService;
try {
    NewsAPIService = require('./services/news-api-service');
    GoogleNewsService = require('./services/google-news-service');
    GeolocationService = require('./services/geolocation-service');
    NewsFilterService = require('./services/news-filter-service');
    console.log('✅ Enhanced news services loaded successfully');
} catch (error) {
    console.warn('⚠️ Enhanced news services not available:', error.message);
}

// Configuration
const HTTP_PORT = process.env.HTTP_PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const HOST = '0.0.0.0';

// Initialize Express App
const app = express();

// Initialize Authentication
const authManager = new AuthenticationManager();
const userRoutes = new UserRoutes();

// Initialize News Services (if available)
let newsAPIService, googleNewsService, geolocationService, newsFilterService;
if (NewsAPIService && GoogleNewsService && GeolocationService && NewsFilterService) {
    newsAPIService = new NewsAPIService();
    googleNewsService = new GoogleNewsService();
    geolocationService = new GeolocationService();
    newsFilterService = new NewsFilterService();
    console.log('✅ Enhanced news services initialized');
} else {
    console.warn('⚠️ Enhanced news services not initialized - using fallback mode');
}

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
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins for development
        }
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
];\n\n// API endpoint for personalized news feed\napp.get('/api/news/personalized', authManager.requireAuth.bind(authManager), async (req, res) => {\n    try {\n        const user = req.user;\n        const allNews = await aggregateAllNews();\n        \n        // Filter based on user preferences\n        let personalizedNews = allNews;\n        \n        if (user.preferences && user.preferences.news_categories && user.preferences.news_categories.length > 0) {\n            personalizedNews = allNews.filter(article => {\n                const articleCategories = [article.category, article.aiCategory].map(c => c?.toLowerCase());\n                return user.preferences.news_categories.some(pref => \n                    articleCategories.includes(pref.toLowerCase())\n                );\n            });\n        }\n        \n        // Record user interaction for personalization\n        if (authManager.userDb) {\n            await authManager.userDb.recordUserInteraction(user.id, 'news_feed_view', {\n                articles_count: personalizedNews.length,\n                categories_viewed: [...new Set(personalizedNews.map(a => a.aiCategory))],\n                timestamp: new Date().toISOString()\n            });\n        }\n        \n        const itemsPerPage = (user.preferences && user.preferences.items_per_page) || 20;\n        const page = parseInt(req.query.page) || 1;\n        const startIndex = (page - 1) * itemsPerPage;\n        const endIndex = startIndex + itemsPerPage;\n        \n        res.json({\n            success: true,\n            articles: personalizedNews.slice(startIndex, endIndex),\n            pagination: {\n                page,\n                per_page: itemsPerPage,\n                total: personalizedNews.length,\n                total_pages: Math.ceil(personalizedNews.length / itemsPerPage)\n            },\n            user_preferences: user.preferences\n        });\n        \n    } catch (error) {\n        console.error('Personalized news error:', error);\n        res.status(500).json({\n            error: 'Failed to fetch personalized news',\n            message: error.message\n        });\n    }\n});\n\n// Existing API endpoints (with optional user context)\napp.get('/api/health', (req, res) => {\n    res.json({\n        status: 'healthy',\n        server: 'KaiTech Voice of Time',\n        version: '2.0.0',\n        timestamp: new Date().toISOString(),\n        authenticated: req.isAuthenticated(),\n        user_id: req.user ? req.user.id : null\n    });\n});\n\napp.get('/api/server-info', (req, res) => {\n    const localIPs = getLocalIPs();\n    res.json({\n        server_name: 'KaiTech Voice of Time',\n        version: '2.0.0',\n        node_version: process.version,\n        uptime: process.uptime(),\n        memory_usage: process.memoryUsage(),\n        local_ips: localIPs,\n        ports: {\n            http: HTTP_PORT,\n            https: HTTPS_PORT\n        },\n        features: {\n            authentication: true,\n            oauth: true,\n            personalization: true,\n            saved_articles: true\n        },\n        authenticated: req.isAuthenticated(),\n        user: req.user ? {\n            id: req.user.id,\n            username: req.user.username,\n            display_name: req.user.display_name\n        } : null\n    });\n});\n\n// All news endpoint\napp.get('/api/news', async (req, res) => {\n    try {\n        const allNews = await aggregateAllNews();\n        res.json({\n            success: true,\n            articles: allNews,\n            count: allNews.length,\n            cached: true,\n            last_updated: new Date().toISOString()\n        });\n    } catch (error) {\n        console.error('News API error:', error);\n        res.status(500).json({\n            error: 'Failed to fetch news',\n            message: error.message\n        });\n    }\n});\n\n// Breaking news endpoint\napp.get('/api/breaking-news', async (req, res) => {\n    try {\n        const allNews = await aggregateAllNews();\n        const breakingNews = allNews.filter(article => {\n            const hoursOld = (Date.now() - new Date(article.pubDate).getTime()) / (1000 * 60 * 60);\n            return hoursOld < 2 || article.title.toLowerCase().includes('breaking');\n        }).slice(0, 10);\n        \n        res.json({\n            success: true,\n            articles: breakingNews,\n            count: breakingNews.length\n        });\n    } catch (error) {\n        res.status(500).json({ error: 'Failed to fetch breaking news' });\n    }\n});\n\n// User Dashboard Route\napp.get('/dashboard', authManager.requireAuth.bind(authManager), (req, res) => {\n    res.sendFile(path.join(__dirname, 'dashboard.html'));\n});\n\n// Login page route\napp.get('/login', authManager.requireNoAuth.bind(authManager), (req, res) => {\n    res.sendFile(path.join(__dirname, 'login.html'));\n});\n\n// Register page route\napp.get('/register', authManager.requireNoAuth.bind(authManager), (req, res) => {\n    res.sendFile(path.join(__dirname, 'register.html'));\n});\n\n// Profile page route\napp.get('/profile', authManager.requireAuth.bind(authManager), (req, res) => {\n    res.sendFile(path.join(__dirname, 'profile.html'));\n});\n\n// Import existing helper functions\nfunction getLocalIPs() {\n    const interfaces = os.networkInterfaces();\n    const ips = [];\n    \n    Object.keys(interfaces).forEach(interfaceName => {\n        interfaces[interfaceName].forEach(iface => {\n            if (iface.family === 'IPv4' && !iface.internal) {\n                ips.push(iface.address);\n            }\n        });\n    });\n    \n    return ips;\n}\n\n// News processing functions (imported from original server)\nasync function fetchRSSFeed(source) {\n    try {\n        const response = await axios.get(source.url, {\n            timeout: 10000,\n            headers: {\n                'User-Agent': 'KaiTech News Intelligence Bot 2.0'\n            }\n        });\n        \n        const parser = new xml2js.Parser();\n        const result = await parser.parseStringPromise(response.data);\n        \n        const items = result.rss?.channel?.[0]?.item || result.feed?.entry || [];\n        \n        return items.slice(0, 10).map((item, index) => ({\n            id: `${source.name.toLowerCase().replace(/\\s+/g, '_')}_${index}`,\n            title: Array.isArray(item.title) ? item.title[0] : item.title || 'No Title',\n            description: Array.isArray(item.description) ? item.description[0] : item.description || '',\n            link: Array.isArray(item.link) ? item.link[0] : item.link || '',\n            pubDate: Array.isArray(item.pubDate) ? item.pubDate[0] : item.pubDate || new Date().toISOString(),\n            source: source.name,\n            category: source.category,\n            timestamp: Date.now()\n        }));\n    } catch (error) {\n        console.error(`Error fetching RSS from ${source.name}:`, error.message);\n        return [];\n    }\n}\n\nasync function aggregateAllNews() {\n    const cacheKey = 'all_news';\n    const cached = NEWS_CACHE.get(cacheKey);\n    \n    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {\n        return cached.data;\n    }\n    \n    console.log('Fetching fresh news data...');\n    const allNewsPromises = RSS_SOURCES.map(source => fetchRSSFeed(source));\n    const newsArrays = await Promise.all(allNewsPromises);\n    \n    const allNews = newsArrays.flat().sort((a, b) => {\n        const dateA = new Date(a.pubDate);\n        const dateB = new Date(b.pubDate);\n        return dateB - dateA;\n    });\n    \n    // Simple categorization without AI for now (to avoid API costs during development)\n    const enhancedNews = allNews.map(article => {\n        return {\n            ...article,\n            aiCategory: categorizeByKeywords(article.title + ' ' + article.description),\n            sentiment: analyzeSentimentByKeywords(article.title),\n            trending: calculateTrendingScore(article),\n            enhanced: true\n        };\n    });\n    \n    NEWS_CACHE.set(cacheKey, {\n        data: enhancedNews,\n        timestamp: Date.now()\n    });\n    \n    return enhancedNews;\n}\n\n// Simple keyword-based categorization\nfunction categorizeByKeywords(text) {\n    const keywords = text.toLowerCase();\n    \n    if (keywords.includes('ai') || keywords.includes('artificial intelligence') || keywords.includes('machine learning')) {\n        return 'AI & Technology';\n    }\n    if (keywords.includes('crypto') || keywords.includes('blockchain') || keywords.includes('bitcoin')) {\n        return 'Cryptocurrency';\n    }\n    if (keywords.includes('climate') || keywords.includes('environment') || keywords.includes('green')) {\n        return 'Environment';\n    }\n    if (keywords.includes('election') || keywords.includes('politics') || keywords.includes('government')) {\n        return 'Politics';\n    }\n    if (keywords.includes('business') || keywords.includes('economy') || keywords.includes('market')) {\n        return 'Business';\n    }\n    if (keywords.includes('health') || keywords.includes('medical') || keywords.includes('covid')) {\n        return 'Health';\n    }\n    if (keywords.includes('sport') || keywords.includes('football') || keywords.includes('basketball')) {\n        return 'Sports';\n    }\n    if (keywords.includes('movie') || keywords.includes('music') || keywords.includes('celebrity')) {\n        return 'Entertainment';\n    }\n    if (keywords.includes('science') || keywords.includes('research') || keywords.includes('study')) {\n        return 'Science';\n    }\n    \n    return 'General';\n}\n\n// Simple keyword-based sentiment analysis\nfunction analyzeSentimentByKeywords(text) {\n    const positiveWords = ['breakthrough', 'success', 'growth', 'positive', 'achievement', 'innovation', 'progress', 'win', 'victory', 'celebration'];\n    const negativeWords = ['crisis', 'failure', 'decline', 'negative', 'problem', 'concern', 'issue', 'disaster', 'tragedy', 'conflict', 'death'];\n    \n    const lowerText = text.toLowerCase();\n    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;\n    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;\n    \n    if (positiveCount > negativeCount) return 'positive';\n    if (negativeCount > positiveCount) return 'negative';\n    return 'neutral';\n}\n\nfunction calculateTrendingScore(article) {\n    const hoursOld = (Date.now() - new Date(article.pubDate).getTime()) / (1000 * 60 * 60);\n    const recencyScore = Math.max(0, 100 - (hoursOld * 2));\n    const keywordScore = (article.title.toLowerCase().includes('breaking') ? 20 : 0) +\n                        (article.title.toLowerCase().includes('urgent') ? 15 : 0) +\n                        (article.title.toLowerCase().includes('live') ? 10 : 0);\n    \n    return Math.min(100, recencyScore + keywordScore);\n}\n\n// Error handling middleware\napp.use((err, req, res, next) => {\n    console.error('Server error:', err);\n    res.status(500).json({\n        error: 'Internal server error',\n        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'\n    });\n});\n\n// 404 handler\napp.use('*', (req, res) => {\n    if (req.path.startsWith('/api/')) {\n        res.status(404).json({\n            error: 'API endpoint not found',\n            path: req.path\n        });\n    } else {\n        res.status(404).sendFile(path.join(__dirname, '404.html'));\n    }\n});\n\n// Server startup\nfunction startServer() {\n    // HTTP Server\n    const httpServer = http.createServer(app);\n    \n    httpServer.listen(HTTP_PORT, HOST, () => {\n        const localIPs = getLocalIPs();\n        \n        console.log('\\n🚀 KaiTech Voice of Time - Enhanced Server with Authentication');\n        console.log('===============================================================');\n        console.log(`📅 Started: ${new Date().toLocaleString()}`);\n        console.log(`💻 Node.js: ${process.version}`);\n        console.log('');\n        console.log('🌐 HTTP Server Running:');\n        console.log(`   - Local: http://localhost:${HTTP_PORT}`);\n        console.log(`   - Local: http://127.0.0.1:${HTTP_PORT}`);\n        console.log('');\n        console.log('📱 External Access (phones, tablets):');\n        localIPs.forEach(ip => {\n            console.log(`   - Network: http://${ip}:${HTTP_PORT}`);\n        });\n        console.log('');\n        console.log('✨ New Features:');\n        console.log('   - 🔐 User Authentication (Local & OAuth)');\n        console.log('   - 👤 User Profiles & Preferences');\n        console.log('   - 📰 Personalized News Feed');\n        console.log('   - 💾 Save Articles');\n        console.log('   - 🔗 Account Linking (Google, GitHub)');\n        console.log('');\n        console.log('📡 API Endpoints:');\n        console.log('   - Health Check: /api/health');\n        console.log('   - Server Info: /api/server-info');\n        console.log('   - All News: /api/news');\n        console.log('   - Personalized News: /api/news/personalized (auth required)');\n        console.log('   - Breaking News: /api/breaking-news');\n        console.log('');\n        console.log('🔐 Authentication Endpoints:');\n        console.log('   - Register: POST /auth/register');\n        console.log('   - Login: POST /auth/login');\n        console.log('   - Google OAuth: /auth/google');\n        console.log('   - GitHub OAuth: /auth/github');\n        console.log('   - Profile: GET /auth/profile (auth required)');\n        console.log('   - Saved Articles: GET /auth/saved-articles (auth required)');\n        console.log('');\n        console.log('📱 Pages:');\n        console.log('   - Home: /');\n        console.log('   - Login: /login');\n        console.log('   - Register: /register');\n        console.log('   - Dashboard: /dashboard (auth required)');\n        console.log('   - Profile: /profile (auth required)');\n        console.log('');\n        console.log('Press Ctrl+C to stop the server');\n        console.log('');\n    });\n    \n    // HTTPS Server (if certificates exist)\n    const httpsKeyPath = path.join(__dirname, 'ssl', 'server.key');\n    const httpsCertPath = path.join(__dirname, 'ssl', 'server.cert');\n    \n    if (fs.existsSync(httpsKeyPath) && fs.existsSync(httpsCertPath)) {\n        try {\n            const httpsOptions = {\n                key: fs.readFileSync(httpsKeyPath),\n                cert: fs.readFileSync(httpsCertPath)\n            };\n            \n            const httpsServer = https.createServer(httpsOptions, app);\n            \n            httpsServer.listen(HTTPS_PORT, HOST, () => {\n                console.log('🔒 HTTPS Server Running:');\n                console.log(`   - Secure Local: https://localhost:${HTTPS_PORT}`);\n                console.log(`   - Secure Local: https://127.0.0.1:${HTTPS_PORT}`);\n                localIPs.forEach(ip => {\n                    console.log(`   - Secure Network: https://${ip}:${HTTPS_PORT}`);\n                });\n                console.log('');\n            });\n        } catch (error) {\n            console.log('⚠️  HTTPS server failed to start:', error.message);\n        }\n    } else {\n        console.log('⚠️  SSL certificates not found - HTTP server only');\n        console.log('💡 Run generate-ssl-certs.ps1 to enable HTTPS');\n        console.log('');\n    }\n    \n    // Graceful shutdown\n    process.on('SIGTERM', gracefulShutdown);\n    process.on('SIGINT', gracefulShutdown);\n    \n    async function gracefulShutdown(signal) {\n        console.log(`\\n👋 Received ${signal}. Shutting down KaiTech servers...`);\n        \n        // Close authentication manager and database connections\n        try {\n            await authManager.close();\n            await userRoutes.close();\n        } catch (error) {\n            console.error('Error closing authentication services:', error);\n        }\n        \n        httpServer.close(() => {\n            console.log('✅ HTTP server stopped');\n            console.log('🎉 Server stopped gracefully');\n            process.exit(0);\n        });\n    }\n}\n\n// Start the server\nstartServer();\n\nmodule.exports = app;","line_range_start":1,"line_range_end":569}}
</function_results>

<function_calls>
<invoke name="mark_todo_as_done">
<parameter name="todo_ids">["298d9895-f0a0-4d67-b3ea-f319725fe5ff"]
