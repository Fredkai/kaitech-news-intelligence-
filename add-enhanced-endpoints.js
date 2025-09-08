// Add these endpoints to server-with-auth.js after line 158 (after breaking news endpoint)

// AI news from Asia endpoint (your example use case!)
app.get('/api/news/ai-asia', async (req, res) => {
    try {
        if (!googleNewsService) {
            return res.status(503).json({
                error: 'Enhanced news service not available',
                message: 'Google News service not initialized'
            });
        }
        
        const result = await googleNewsService.getAINewsFromAsia();
        
        res.json({
            success: true,
            ...result,
            description: 'AI-related news from Asian countries',
            user_authenticated: req.isAuthenticated()
        });
    } catch (error) {
        console.error('AI Asia news error:', error);
        res.status(500).json({
            error: 'Failed to fetch AI news from Asia',
            message: error.message
        });
    }
});

// Enhanced news search endpoint
app.get('/api/news/search', async (req, res) => {
    try {
        const {
            q,
            pageSize = 20,
            category = null,
            region = null
        } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Query parameter is required',
                example: '/api/news/search?q=artificial%20intelligence'
            });
        }

        let results = [];

        // Use Google News for search
        if (googleNewsService) {
            try {
                const googleResult = await googleNewsService.searchNews(q, {
                    region: region || 'global',
                    language: 'en'
                });
                results.push(...(googleResult.articles || []));
            } catch (error) {
                console.warn('Google News search failed:', error.message);
            }
        }

        // Remove duplicates and limit results
        const uniqueResults = removeDuplicates(results);
        const limitedResults = uniqueResults.slice(0, parseInt(pageSize));

        res.json({
            success: true,
            query: q,
            articles: limitedResults,
            totalResults: limitedResults.length,
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('News search error:', error);
        res.status(500).json({
            error: 'Search failed',
            message: error.message
        });
    }
});

// Get news options endpoint
app.get('/api/news/options', (req, res) => {
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

        res.json({
            success: true,
            options: options,
            services: {
                newsapi: newsAPIService ? newsAPIService.isConfigured() : false,
                google: !!googleNewsService,
                geolocation: !!geolocationService
            }
        });

    } catch (error) {
        console.error('Options endpoint error:', error);
        res.status(500).json({
            error: 'Failed to get options',
            message: error.message
        });
    }
});

// Get user location endpoint
app.get('/api/news/location', async (req, res) => {
    try {
        if (!geolocationService) {
            return res.json({
                success: true,
                location: { newsRegion: 'global', country: 'Unknown' },
                recommendations: { categories: ['technology', 'business'], regions: ['global'] }
            });
        }
        
        const userLocation = await geolocationService.getLocationFromIP('auto');
        
        res.json({
            success: true,
            location: userLocation,
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Location detection error:', error);
        res.json({
            success: true,
            location: { newsRegion: 'global', country: 'Unknown' },
            error: 'Location detection failed'
        });
    }
});

// Trending topics endpoint
app.get('/api/news/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        
        // Get recent articles for trending analysis
        let recentArticles = [];
        
        try {
            const rssNews = await aggregateAllNews();
            recentArticles.push(...rssNews);
        } catch (error) {
            console.warn('RSS news fetch for trending failed:', error.message);
        }

        // Simple trending topic extraction
        const topicCounts = new Map();
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

        recentArticles.forEach(article => {
            const publishDate = new Date(article.publishedAt || article.pubDate);
            if (publishDate < cutoffTime) return;

            const content = (article.title + ' ' + (article.description || '')).toLowerCase();
            const words = content.split(/\s+/);

            // Extract potential topics (2-word phrases)
            for (let i = 0; i < words.length - 1; i++) {
                const phrase = words.slice(i, i + 2).join(' ');
                if (phrase.length > 5) {
                    topicCounts.set(phrase, (topicCounts.get(phrase) || 0) + 1);
                }
            }
        });

        // Sort by frequency and return top topics
        const trendingTopics = Array.from(topicCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([topic, count]) => ({ topic, count, trending: count > 3 }));

        res.json({
            success: true,
            trending_topics: trendingTopics,
            timeWindow: 24,
            articlesAnalyzed: recentArticles.length,
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Trending topics error:', error);
        res.status(500).json({
            error: 'Failed to get trending topics',
            message: error.message
        });
    }
});

// Helper function for removing duplicates
function removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
        const key = article.title + (article.source?.name || '');
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
