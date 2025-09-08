// KaiTech Voice of Time - Node.js Development Server
// Supports both local and external device access

// Load environment variables
require('dotenv').config();

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');
const axios = require('axios');
const DesignStylesDatabase = require('./services/design-styles-database');

// Import enhanced news services (if available)
let GoogleNewsService;
try {
    GoogleNewsService = require('./services/google-news-service');
    console.log('✅ Enhanced news services loaded');
} catch (error) {
    console.warn('⚠️ Enhanced news services not available:', error.message);
}

// Import translation services
let translationService, TranslationCacheDB;
try {
    translationService = require('./services/translation-service');
    TranslationCacheDB = require('./database/translation-cache');
    console.log('✅ Translation services loaded');
} catch (error) {
    console.warn('⚠️ Translation services not available:', error.message);
}

// Import cloud solutions service
let CloudSolutionsService;
try {
    CloudSolutionsService = require('./services/cloud-solutions-service');
    console.log('✅ Cloud solutions service loaded');
} catch (error) {
    console.warn('⚠️ Cloud solutions service not available:', error.message);
}

// Import cloud data integration service
let CloudDataIntegration;
try {
    CloudDataIntegration = require('./services/cloud-data-integration');
    console.log('✅ Cloud data integration service loaded');
} catch (error) {
    console.warn('⚠️ Cloud data integration service not available:', error.message);
}

// Initialize cloud services
let cloudService, cloudDataService;
if (CloudSolutionsService) {
    cloudService = new CloudSolutionsService();
}
if (CloudDataIntegration) {
    cloudDataService = new CloudDataIntegration();
}

// Initialize translation cache database
let translationCacheDB;
if (TranslationCacheDB) {
    translationCacheDB = new TranslationCacheDB();
    translationCacheDB.initialize().catch(console.error);
    console.log('✅ Translation cache database initializing...');
}

// Configuration
const HTTP_PORT = process.env.PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces for external access

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
    
    // AI-powered categorization and enhancement (limit to reduce API calls)
    console.log('Enhancing news with AI analysis...');
    const enhancedNews = await Promise.all(allNews.slice(0, 30).map(async (article, index) => {
        try {
            // Batch process to avoid rate limits
            const delay = index * 100; // 100ms delay between requests
            await new Promise(resolve => setTimeout(resolve, delay));
            
            const [aiCategory, sentiment, aiSummary] = await Promise.all([
                categorizeWithAI(article.title + ' ' + article.description),
                analyzeSentiment(article.title),
                summarizeNewsArticle(article.title, article.description)
            ]);
            
            return {
                ...article,
                aiCategory,
                sentiment,
                aiSummary,
                trending: calculateTrendingScore(article),
                enhanced: true
            };
        } catch (error) {
            console.error(`Error enhancing article ${index}:`, error.message);
            return {
                ...article,
                aiCategory: 'General',
                sentiment: 'neutral',
                aiSummary: `Summary: ${article.title.substring(0, 80)}...`,
                trending: calculateTrendingScore(article),
                enhanced: false
            };
        }
    }));
    
    NEWS_CACHE.set(cacheKey, {
        data: enhancedNews,
        timestamp: Date.now()
    });
    
    return enhancedNews;
}

async function categorizeWithAI(text) {
    try {
        const prompt = `Categorize this news text into one of these categories: AI & Technology, Cryptocurrency, Environment, Politics, Business, Health, Sports, Entertainment, Science, or General. Return only the category name.\n\nText: "${text.substring(0, 500)}")`;
        
        const response = await axios.post(GROK_API_URL, {
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: 'You are a news categorization AI. Analyze the given text and return only the most appropriate category name.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 10,
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        const category = response.data.choices[0].message.content.trim();
        return category || 'General';
    } catch (error) {
        console.error('AI Categorization Error:', error.message);
        // Fallback to keyword-based categorization
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
}

async function analyzeSentiment(text) {
    try {
        const prompt = `Analyze the sentiment of this news headline. Return only one word: "positive", "negative", or "neutral".\n\nHeadline: "${text.substring(0, 200)}")`;
        
        const response = await axios.post(GROK_API_URL, {
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: 'You are a sentiment analysis AI. Analyze news headlines and return only: positive, negative, or neutral.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 5,
            temperature: 0.1
        }, {
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 8000
        });
        
        const sentiment = response.data.choices[0].message.content.trim().toLowerCase();
        return ['positive', 'negative', 'neutral'].includes(sentiment) ? sentiment : 'neutral';
    } catch (error) {
        console.error('AI Sentiment Analysis Error:', error.message);
        // Fallback to keyword-based sentiment analysis
        const positiveWords = ['breakthrough', 'success', 'growth', 'positive', 'achievement', 'innovation', 'progress'];
        const negativeWords = ['crisis', 'failure', 'decline', 'negative', 'problem', 'concern', 'issue'];
        
        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
        
        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }
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

// Generate AI insights using Grok
async function generateAIInsights(allNews) {
    try {
        const newsTopics = allNews.slice(0, 20).map(article => 
            `${article.title} (${article.aiCategory}, ${article.sentiment})`
        ).join('\n');
        
        const prompt = `Analyze these current news headlines and provide 3-5 key insights about today's news landscape:\n\n${newsTopics}\n\nProvide insights in bullet points about trends, sentiment, and important themes.`;
        
        const response = await axios.post(GROK_API_URL, {
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: 'You are a news analyst AI. Provide concise, insightful bullet points about current news trends and themes.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 300,
            temperature: 0.6
        }, {
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        
        const aiInsights = response.data.choices[0].message.content
            .split('\n')
            .filter(line => line.trim() && (line.includes('•') || line.includes('-') || line.includes('*')))
            .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
            .filter(insight => insight.length > 10);
        
        return aiInsights.length > 0 ? aiInsights : generateFallbackInsights(allNews);
    } catch (error) {
        console.error('AI Insights Generation Error:', error.message);
        return generateFallbackInsights(allNews);
    }
}

// Fallback insights generation
function generateFallbackInsights(allNews) {
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

// AI-powered news summarization
async function summarizeNewsArticle(title, description) {
    try {
        if (!description || description.length < 50) {
            return `AI Summary: ${title}`; // Return title if no description
        }
        
        const prompt = `Summarize this news article in one concise sentence (max 100 characters):\n\nTitle: ${title}\nDescription: ${description.substring(0, 300)}`;
        
        const response = await axios.post(GROK_API_URL, {
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: 'You are a news summarization AI. Create very concise, informative one-sentence summaries.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 50,
            temperature: 0.4
        }, {
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 8000
        });
        
        const summary = response.data.choices[0].message.content.trim();
        return summary || `AI Summary: ${title.substring(0, 80)}...`;
    } catch (error) {
        console.error('AI Summarization Error:', error.message);
        return `AI Summary: ${title.substring(0, 80)}...`; // Fallback
    }
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

// Fallback AI Asia news function
async function getFallbackAIAsiaNews() {
    try {
        const allNews = await aggregateAllNews();
        const aiAsiaNews = allNews.filter(article => {
            const content = (article.title + ' ' + article.description).toLowerCase();
            const hasAIKeywords = content.includes('ai') || content.includes('artificial intelligence') || 
                                 content.includes('machine learning') || content.includes('technology');
            const hasAsiaKeywords = content.includes('asia') || content.includes('china') || 
                                   content.includes('japan') || content.includes('korea') || 
                                   content.includes('singapore') || content.includes('india');
            return hasAIKeywords && hasAsiaKeywords;
        }).slice(0, 10);
        
        return {
            articles: aiAsiaNews,
            totalResults: aiAsiaNews.length,
            source: 'rss-fallback',
            regions: ['asia'],
            query: 'AI-related news from Asia (fallback)'
        };
    } catch (error) {
        return {
            articles: [],
            totalResults: 0,
            source: 'fallback-error',
            error: 'Unable to fetch fallback data'
        };
    }
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
            
        case '/api/news/ai-enhanced':
            try {
                const allNews = await aggregateAllNews();
                const enhancedNews = allNews.filter(article => article.enhanced && article.aiSummary);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: {
                        articles: enhancedNews,
                        total: enhancedNews.length,
                        ai_processed: enhancedNews.length,
                        features: {
                            ai_summaries: true,
                            ai_categorization: true,
                            sentiment_analysis: true,
                            trending_score: true
                        }
                    },
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to fetch AI-enhanced news'
                }, null, 2));
            }
            break;
            
        case '/api/news/ai-asia':
            try {
                // Initialize Google News service if available
                let googleNewsService;
                if (GoogleNewsService) {
                    googleNewsService = new GoogleNewsService();
                }
                
                if (!googleNewsService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Enhanced news service not available',
                        message: 'Google News service not initialized',
                        fallback_data: await getFallbackAIAsiaNews()
                    }, null, 2));
                    return;
                }
                
                const result = await googleNewsService.getAINewsFromAsia();
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    ...result,
                    description: 'AI-related news from Asian countries',
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                console.error('AI Asia news error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to fetch AI news from Asia',
                    message: error.message,
                    fallback_data: await getFallbackAIAsiaNews()
                }, null, 2));
            }
            break;
            
        case '/api/news/options':
            try {
                const options = {
                    categories: {
                        custom: {
                            'ai-technology': { display: 'AI & Technology', color: '#00D4FF' },
                            'technology': { display: 'Technology', color: '#00A8FF' },
                            'business': { display: 'Business', color: '#4CAF50' },
                            'science': { display: 'Science', color: '#9C27B0' },
                            'health': { display: 'Health', color: '#FF5722' },
                            'politics': { display: 'Politics', color: '#FF9800' },
                            'sports': { display: 'Sports', color: '#607D8B' },
                            'entertainment': { display: 'Entertainment', color: '#E91E63' }
                        }
                    },
                    regions: {
                        groups: ['global', 'north-america', 'europe', 'asia', 'africa', 'south-america', 'oceania'],
                        google: {
                            'global': { display: 'Global', flag: '🌍' },
                            'north-america': { display: 'North America', flag: '🌎' },
                            'europe': { display: 'Europe', flag: '🇪🇺' },
                            'asia': { display: 'Asia', flag: '🌏' },
                            'africa': { display: 'Africa', flag: '🌍' }
                        }
                    },
                    sortOptions: ['relevance', 'date', 'popularity'],
                    sentimentOptions: ['positive', 'negative', 'neutral', 'urgent']
                };

                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    options: options,
                    services: {
                        google: !!GoogleNewsService,
                        enhanced: true
                    },
                    timestamp: new Date().toISOString()
                }, null, 2));

            } catch (error) {
                console.error('Options endpoint error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to get options',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/news/location':
            try {
                // Simple location fallback
                const locationData = {
                    newsRegion: 'global',
                    country: 'Unknown',
                    recommendations: {
                        categories: ['technology', 'business', 'ai-technology'],
                        regions: ['global']
                    }
                };
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    location: locationData,
                    timestamp: new Date().toISOString()
                }, null, 2));

            } catch (error) {
                console.error('Location detection error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to detect location',
                    message: error.message
                }, null, 2));
            }
            break;
            
        // ========== CLOUD SOLUTIONS ENDPOINTS ==========
        case '/api/cloud/recommend':
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end(JSON.stringify({
                    error: 'Method not allowed',
                    message: 'Cloud recommendation endpoint only accepts POST requests'
                }, null, 2));
                return;
            }
            
            try {
                if (!cloudService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Cloud service not available',
                        message: 'Cloud solutions service not initialized'
                    }, null, 2));
                    return;
                }
                
                const body = await getRequestBody(req);
                const requirements = body.requirements || {};
                
                console.log('🌥️ Processing cloud recommendation request:', requirements);
                
                const recommendations = await cloudService.getCloudRecommendations(requirements);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: recommendations,
                    timestamp: new Date().toISOString()
                }, null, 2));
                
            } catch (error) {
                console.error('Cloud recommendation error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to generate cloud recommendations',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/cloud/status':
            try {
                if (!cloudService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Cloud service not available',
                        message: 'Cloud solutions service not initialized'
                    }, null, 2));
                    return;
                }
                
                const cloudStatus = await cloudService.getCloudStatus();
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: cloudStatus,
                    timestamp: new Date().toISOString()
                }, null, 2));
                
            } catch (error) {
                console.error('Cloud status error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to get cloud status',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/cloud/optimize':
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end(JSON.stringify({
                    error: 'Method not allowed',
                    message: 'Cloud optimization endpoint only accepts POST requests'
                }, null, 2));
                return;
            }
            
            try {
                if (!cloudService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Cloud service not available',
                        message: 'Cloud solutions service not initialized'
                    }, null, 2));
                    return;
                }
                
                const body = await getRequestBody(req);
                const currentSetup = body.current_setup || {};
                
                const optimizations = await cloudService.getCostOptimizationSuggestions(currentSetup);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: optimizations,
                    timestamp: new Date().toISOString()
                }, null, 2));
                
            } catch (error) {
                console.error('Cloud optimization error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to generate optimization suggestions',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/cloud/providers':
            try {
                if (!cloudService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Cloud service not available',
                        message: 'Cloud solutions service not initialized'
                    }, null, 2));
                    return;
                }
                
                const providersInfo = {
                    providers: cloudService.cloudProviders,
                    service_categories: ['compute', 'storage', 'database', 'networking', 'ai-ml', 'analytics'],
                    budget_tiers: Object.keys(cloudService.recommendationRules.budget_tiers),
                    workload_types: Object.keys(cloudService.recommendationRules.workload_patterns),
                    available_features: {
                        cost_estimation: true,
                        ai_recommendations: true,
                        comparative_analysis: true,
                        deployment_guidance: true,
                        real_time_status: !!cloudDataService,
                        optimization_suggestions: true
                    }
                };
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: providersInfo,
                    timestamp: new Date().toISOString()
                }, null, 2));
                
            } catch (error) {
                console.error('Cloud providers info error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to get providers information',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/cloud/realtime':
            try {
                if (!cloudDataService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Real-time data service not available',
                        message: 'Cloud data integration service not initialized'
                    }, null, 2));
                    return;
                }
                
                const realTimeData = await cloudDataService.getRealTimeCloudData();
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: realTimeData,
                    timestamp: new Date().toISOString()
                }, null, 2));
                
            } catch (error) {
                console.error('Real-time cloud data error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to get real-time cloud data',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/cloud/pricing':
            try {
                if (!cloudDataService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Real-time data service not available',
                        message: 'Cloud data integration service not initialized'
                    }, null, 2));
                    return;
                }
                
                const body = req.method === 'POST' ? await getRequestBody(req) : {};
                const requirements = body.requirements || {};
                
                const pricingData = await cloudDataService.getOptimizedCostRecommendations(requirements);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: pricingData,
                    timestamp: new Date().toISOString()
                }, null, 2));
                
            } catch (error) {
                console.error('Cloud pricing optimization error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to get pricing optimization',
                    message: error.message
                }, null, 2));
            }
            break;
            
        // ======== DESIGN CONSULTATION ENDPOINT ========
        case '/api/design/consultation':
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end(JSON.stringify({
                    error: 'Method not allowed',
                    message: 'Design consultation endpoint only accepts POST requests'
                }, null, 2));
                return;
            }
            
            try {
                const body = await getRequestBody(req);
                const required = ['projectType', 'industry', 'description', 'budget', 'timeline', 'name', 'email'];
                const missing = required.filter(k => !body[k] || String(body[k]).trim() === '');
                if (missing.length > 0) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        error: 'Bad request',
                        message: `Missing required fields: ${missing.join(', ')}`
                    }, null, 2));
                    return;
                }

                const consultationData = await processDesignConsultation(body);

                // Save lead for follow-up
                await saveDesignLead({
                    contact: { name: body.name, email: body.email, phone: body.phone || '' },
                    requirements: body,
                    recommendations: consultationData,
                    createdAt: new Date().toISOString()
                });

                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'success',
                    data: consultationData,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                console.error('Design consultation error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to process design consultation',
                    message: error.message
                }, null, 2));
            }
            break;

        // ======== TRANSLATION API ENDPOINTS ========
        case '/api/translation/languages':
            try {
                if (!translationService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Translation service not available',
                        message: 'Translation service not initialized'
                    }, null, 2));
                    return;
                }
                
                const languages = translationService.getSupportedLanguages();
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    languages: languages,
                    count: Object.keys(languages).length,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                console.error('Get languages error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to get supported languages',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/translation/translate':
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end(JSON.stringify({
                    error: 'Method not allowed',
                    message: 'Translation endpoint only accepts POST requests'
                }, null, 2));
                return;
            }
            
            try {
                if (!translationService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Translation service not available',
                        message: 'Translation service not initialized'
                    }, null, 2));
                    return;
                }
                
                const body = await getRequestBody(req);
                const { text, targetLang, sourceLang = null } = body;

                if (!text || !targetLang) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        error: 'Text and target language are required',
                        example: {
                            text: 'Hello world',
                            targetLang: 'es',
                            sourceLang: 'en'
                        }
                    }, null, 2));
                    return;
                }

                if (!translationService.isLanguageSupported(targetLang)) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        error: `Unsupported target language: ${targetLang}`,
                        supportedLanguages: Object.keys(translationService.getSupportedLanguages())
                    }, null, 2));
                    return;
                }

                const result = await translationService.translateText(text, targetLang, sourceLang);

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    ...result,
                    timestamp: new Date().toISOString()
                }, null, 2));

            } catch (error) {
                console.error('Translation error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Translation failed',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/translation/article':
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end(JSON.stringify({
                    error: 'Method not allowed',
                    message: 'Article translation endpoint only accepts POST requests'
                }, null, 2));
                return;
            }
            
            try {
                if (!translationService) {
                    res.writeHead(503);
                    res.end(JSON.stringify({
                        error: 'Translation service not available',
                        message: 'Translation service not initialized'
                    }, null, 2));
                    return;
                }
                
                const body = await getRequestBody(req);
                const { article, targetLang } = body;

                if (!article || !targetLang) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        error: 'Article object and target language are required',
                        example: {
                            article: {
                                title: 'News title',
                                description: 'News description',
                                url: 'https://example.com/news'
                            },
                            targetLang: 'es'
                        }
                    }, null, 2));
                    return;
                }

                if (!translationService.isLanguageSupported(targetLang)) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        error: `Unsupported target language: ${targetLang}`,
                        supportedLanguages: Object.keys(translationService.getSupportedLanguages())
                    }, null, 2));
                    return;
                }

                const translatedArticle = await translationService.translateArticle(article, targetLang);

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    article: translatedArticle,
                    timestamp: new Date().toISOString()
                }, null, 2));

            } catch (error) {
                console.error('Article translation error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Article translation failed',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/news/translated':
            try {
                const lang = query.lang || 'en';
                const category = query.category || null;
                const autoTranslate = query.autoTranslate !== 'false';
                const pageSize = parseInt(query.pageSize) || 20;

                if (!translationService || !translationService.isLanguageSupported(lang)) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        error: `Unsupported or unavailable language: ${lang}`,
                        supportedLanguages: translationService ? Object.keys(translationService.getSupportedLanguages()) : []
                    }, null, 2));
                    return;
                }

                // Get news articles first
                const allNews = await aggregateAllNews();
                let articles = category ? 
                    allNews.filter(article => (article.category || '').toLowerCase().includes(category.toLowerCase())) : 
                    allNews;
                    
                articles = articles.slice(0, pageSize);

                // Translate articles if language is not English and autoTranslate is enabled
                if (lang !== 'en' && autoTranslate && translationService) {
                    try {
                        articles = await Promise.all(
                            articles.slice(0, 10).map(async (article) => {
                                return await translationService.translateArticle(article, lang);
                            })
                        );
                    } catch (error) {
                        console.warn('Translation failed, returning original articles:', error.message);
                    }
                }

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    articles: articles,
                    language: lang,
                    languageInfo: translationService ? translationService.getLanguageInfo(lang) : null,
                    autoTranslate: autoTranslate,
                    totalResults: articles.length,
                    filters: { category },
                    timestamp: new Date().toISOString()
                }, null, 2));

            } catch (error) {
                console.error('Translated news error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Failed to get translated news',
                    message: error.message
                }, null, 2));
            }
            break;
            
        case '/api/translation/preferences':
            if (req.method === 'GET') {
                // Get preferences - for now return defaults
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    preferences: {
                        language: 'en',
                        autoTranslate: true,
                        defaultRegion: null
                    },
                    timestamp: new Date().toISOString()
                }, null, 2));
            } else if (req.method === 'POST') {
                // Set preferences - for now just acknowledge
                try {
                    const body = await getRequestBody(req);
                    const { language, autoTranslate = true, defaultRegion = null } = body;

                    if (!language) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            error: 'Language preference is required',
                            example: {
                                language: 'es',
                                autoTranslate: true,
                                defaultRegion: 'es'
                            }
                        }, null, 2));
                        return;
                    }

                    if (!translationService || !translationService.isLanguageSupported(language)) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            error: `Unsupported language: ${language}`,
                            supportedLanguages: translationService ? Object.keys(translationService.getSupportedLanguages()) : []
                        }, null, 2));
                        return;
                    }

                    const preferences = {
                        language: language,
                        autoTranslate: autoTranslate,
                        defaultRegion: defaultRegion,
                        timestamp: new Date().toISOString()
                    };

                    res.writeHead(200);
                    res.end(JSON.stringify({
                        success: true,
                        preferences: preferences,
                        languageInfo: translationService ? translationService.getLanguageInfo(language) : null,
                        timestamp: new Date().toISOString()
                    }, null, 2));

                } catch (error) {
                    console.error('Set preferences error:', error);
                    res.writeHead(500);
                    res.end(JSON.stringify({
                        error: 'Failed to set translation preferences',
                        message: error.message
                    }, null, 2));
                }
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({
                    error: 'Method not allowed',
                    message: 'Preferences endpoint only accepts GET and POST requests'
                }, null, 2));
            }
            break;
            
        default:
            res.writeHead(404);
            res.end(JSON.stringify({
                error: 'API endpoint not found',
                available_endpoints: [
                    '/api/health', '/api/server-info', '/api/breaking-news', '/api/news', 
                    '/api/news/trending', '/api/news/sentiment', '/api/news/search', '/api/news/ai-enhanced',
                    '/api/discover', '/api/markets', '/api/foryou', '/api/analysis', '/api/live', '/api/chat',
                    '/api/news/ai-asia', '/api/news/options', '/api/news/location', '/api/news/translated',
                    '/api/translation/languages', '/api/translation/translate', '/api/translation/article', '/api/translation/preferences',
                    '/api/cloud/recommend', '/api/cloud/status', '/api/cloud/optimize', '/api/cloud/providers',
                    '/api/cloud/realtime', '/api/cloud/pricing'
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

// Helper: Process design consultation
async function processDesignConsultation(requirements) {
    const stylesDB = new DesignStylesDatabase();

    // Normalize styles to array
    if (requirements.styles && !Array.isArray(requirements.styles)) {
        requirements.styles = [requirements.styles];
    }

    const styleRecs = stylesDB.getStyleRecommendations(requirements).map(s => ({
        name: s.name,
        style: s.style,
        reason: `Suitable based on your ${requirements.industry} industry and ${requirements.projectType} project. ${s.description}`,
        characteristics: s.characteristics,
        colors: s.colors,
        examples: s.examples
    }));

    // Optional AI analysis using Grok
    let aiAnalysis = '';
    try {
        const msg = `A user needs design help. Details:\nProject: ${requirements.projectType}\nIndustry: ${requirements.industry}\nBudget: ${requirements.budget}\nTimeline: ${requirements.timeline}\nPreferred styles: ${(requirements.styles || []).join(', ') || 'none specified'}\nDescription: ${requirements.description}\n\nProvide a concise 2-4 sentence analysis of the best design direction and why. Avoid listing styles; focus on rationale and brand goals.`;
        aiAnalysis = await chatWithGrok(msg);
    } catch (e) {
        aiAnalysis = 'Based on your inputs, we recommend focusing on clarity, strong visual hierarchy, and a style that matches your audience expectations.';
    }

    const budgetAdvice = stylesDB.generateBudgetAdvice(requirements);
    const timelineAdvice = stylesDB.generateTimelineAdvice(requirements);
    const nextSteps = stylesDB.generateNextSteps(requirements);

    return {
        aiAnalysis,
        styleRecommendations: styleRecs,
        budgetAdvice,
        timelineAdvice,
        nextSteps
    };
}

// Persist design leads locally for follow-up
async function saveDesignLead(entry) {
    try {
        const dataDir = path.join(__dirname, 'data');
        const filePath = path.join(dataDir, 'design-leads.json');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        let leads = [];
        if (fs.existsSync(filePath)) {
            try {
                const raw = fs.readFileSync(filePath, 'utf-8');
                leads = JSON.parse(raw);
                if (!Array.isArray(leads)) leads = [];
            } catch (_) {
                leads = [];
            }
        }
        leads.push(entry);
        fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error('Failed to save design lead:', e.message);
        return false;
    }
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
console.log('   - 🤖 AI-Enhanced News: /api/news/ai-enhanced');
console.log('   - Trending: /api/news/trending');
console.log('   - Sentiment: /api/news/sentiment');
console.log('   - Search: /api/news/search?q=query');
console.log('   - 🔍 Discover: /api/discover');
console.log('   - 💹 Markets: /api/markets');
console.log('   - ⭐ For You: /api/foryou?interests=tech,ai');
console.log('   - 🧠 Analysis: /api/analysis');
console.log('   - 🔴 Live: /api/live');
console.log('   - 🤖 AI Chat: /api/chat (POST)');
console.log('   - 🎨 Design Consultation: /api/design/consultation (POST)');
console.log('');
console.log('🌐 Translation Services:');
console.log('   - 🗣️ Supported Languages: /api/translation/languages');
console.log('   - 📝 Translate Text: /api/translation/translate (POST)');
console.log('   - 📰 Translate Article: /api/translation/article (POST)');
console.log('   - 🌍 Translated News: /api/news/translated?lang=es');
console.log('   - ⚙️ User Preferences: /api/translation/preferences (GET/POST)');
console.log('');
console.log('🌥️ Cloud Solutions:');
console.log('   - 🎆 Cloud Recommendations: /api/cloud/recommend (POST)');
console.log('   - 🟢 Cloud Status: /api/cloud/status');
console.log('   - 💰 Cost Optimization: /api/cloud/optimize (POST)');
console.log('   - 🏢 Provider Info: /api/cloud/providers');
console.log('   - 🔄 Real-time Data: /api/cloud/realtime');
console.log('   - 📊 Live Pricing: /api/cloud/pricing');

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
