// KaiTech Voice of Time - Enhanced News API Endpoints
// Add these endpoints to server-with-auth.js after the existing breaking news endpoint

// =============================================
// ENHANCED REAL-TIME NEWS API ENDPOINTS
// =============================================

// NewsAPI integration - get headlines with advanced filtering
app.get('/api/news/headlines', async (req, res) => {
    try {
        const {
            country = null,
            category = null,
            sources = null,
            q = null,
            pageSize = 50,
            page = 1,
            region = null
        } = req.query;

        if (newsAPIService.isConfigured()) {
            const result = await newsAPIService.getTopHeadlines({
                country,
                category,
                sources,
                q,
                pageSize: parseInt(pageSize),
                page: parseInt(page),
                region
            });

            // Record user interaction if authenticated
            if (req.isAuthenticated() && authManager.userDb) {
                await authManager.userDb.recordUserInteraction(req.user.id, 'api_news_headlines', {
                    filters: { country, category, sources, q, region },
                    result_count: result.articles.length
                });
            }

            res.json({
                success: true,
                ...result,
                enhanced: true,
                user_authenticated: req.isAuthenticated()
            });
        } else {
            res.status(503).json({
                error: 'NewsAPI service not configured',
                message: 'Please configure NEWSAPI_KEY environment variable'
            });
        }
    } catch (error) {
        console.error('NewsAPI headlines error:', error);
        res.status(500).json({
            error: 'Failed to fetch headlines',
            message: error.message
        });
    }
});

// Search news with advanced filtering
app.get('/api/news/search', async (req, res) => {
    try {
        const {
            q,
            sources = null,
            domains = null,
            from = null,
            to = null,
            language = 'en',
            sortBy = 'publishedAt',
            pageSize = 50,
            page = 1,
            category = null,
            region = null,
            service = 'auto' // 'newsapi', 'google', 'auto'
        } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Query parameter is required',
                example: '/api/news/search?q=artificial%20intelligence'
            });
        }

        let results = [];

        // Use NewsAPI if available and requested
        if ((service === 'newsapi' || service === 'auto') && newsAPIService.isConfigured()) {
            try {
                const newsAPIResult = await newsAPIService.searchEverything({
                    q,
                    sources,
                    domains,
                    from,
                    to,
                    language,
                    sortBy,
                    pageSize: parseInt(pageSize),
                    page: parseInt(page),
                    category,
                    region
                });
                results.push(...(newsAPIResult.articles || []));
            } catch (error) {
                console.warn('NewsAPI search failed:', error.message);
            }
        }

        // Use Google News as fallback or if requested
        if (service === 'google' || (service === 'auto' && results.length === 0)) {
            try {
                const googleResult = await googleNewsService.searchNews(q, {
                    region,
                    language,
                    sortBy: 'date',
                    when: from ? 'd' : null
                });
                results.push(...(googleResult.articles || []));
            } catch (error) {
                console.warn('Google News search failed:', error.message);
            }
        }

        // Remove duplicates and limit results
        const uniqueResults = removeDuplicates(results);
        const limitedResults = uniqueResults.slice(0, parseInt(pageSize));

        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_news_search', {
                query: q,
                filters: { sources, category, region, language },
                result_count: limitedResults.length,
                service: service
            });
        }

        res.json({
            success: true,
            query: q,
            articles: limitedResults,
            totalResults: limitedResults.length,
            source: results.length > 0 ? 'multiple' : 'none',
            filters: {
                category,
                region,
                language,
                sources,
                service
            },
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

// Get AI-related news from Asia (example from user request)
app.get('/api/news/ai-asia', async (req, res) => {
    try {
        const result = await googleNewsService.getAINewsFromAsia();
        
        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_news_ai_asia', {
                result_count: result.articles.length
            });
        }

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

// Advanced filtered news endpoint
app.get('/api/news/filtered', async (req, res) => {
    try {
        const {
            categories = null,
            regions = null,
            keywords = null,
            excludeKeywords = null,
            languages = 'en',
            sentiment = null,
            minRelevanceScore = 0,
            maxAge = 24, // hours
            sources = null,
            excludeSources = null,
            sortBy = 'relevance',
            limit = 50,
            includeLocation = 'true'
        } = req.query;

        // Get base articles from multiple sources
        let allArticles = [];
        
        try {
            // Get from existing RSS sources
            const rssNews = await aggregateAllNews();
            allArticles.push(...rssNews);
        } catch (error) {
            console.warn('RSS news fetch failed:', error.message);
        }

        // Add NewsAPI results if available
        if (newsAPIService.isConfigured()) {
            try {
                const newsAPIResults = await newsAPIService.getTopHeadlines({
                    pageSize: 50,
                    region: regions ? regions.split(',')[0] : null
                });
                allArticles.push(...(newsAPIResults.articles || []));
            } catch (error) {
                console.warn('NewsAPI fetch failed:', error.message);
            }
        }

        // Get user location if requested
        let userLocation = null;
        if (includeLocation === 'true') {
            try {
                userLocation = await geolocationService.getLocationFromIP(
                    req.ip || req.connection.remoteAddress
                );
            } catch (error) {
                console.warn('Geolocation failed:', error.message);
            }
        }

        // Apply advanced filtering
        const filters = {
            categories: categories ? categories.split(',') : null,
            regions: regions ? regions.split(',') : null,
            keywords: keywords ? keywords.split(',') : null,
            excludeKeywords: excludeKeywords ? excludeKeywords.split(',') : null,
            languages: languages.split(','),
            sentiment,
            minRelevanceScore: parseInt(minRelevanceScore),
            maxAge: parseInt(maxAge),
            sources: sources ? sources.split(',') : null,
            excludeSources: excludeSources ? excludeSources.split(',') : null,
            userLocation,
            sortBy,
            limit: parseInt(limit)
        };

        const filteredArticles = await newsFilterService.filterNews(allArticles, filters);

        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_news_filtered', {
                filters: filters,
                result_count: filteredArticles.length,
                user_location: userLocation ? {
                    country: userLocation.country,
                    region: userLocation.newsRegion
                } : null
            });
        }

        res.json({
            success: true,
            articles: filteredArticles,
            totalResults: filteredArticles.length,
            filters: filters,
            userLocation: userLocation,
            processing: {
                source_articles: allArticles.length,
                filtered_articles: filteredArticles.length,
                filter_efficiency: Math.round((filteredArticles.length / Math.max(allArticles.length, 1)) * 100)
            },
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Filtered news error:', error);
        res.status(500).json({
            error: 'Failed to fetch filtered news',
            message: error.message
        });
    }
});

// Enhanced breaking news with multiple sources
app.get('/api/news/breaking-enhanced', async (req, res) => {
    try {
        const region = req.query.region || 'global';
        const language = req.query.language || 'en';
        
        let breakingNews = [];

        // Get breaking news from Google News
        try {
            const googleBreaking = await googleNewsService.getBreakingNews(region, language);
            breakingNews.push(...(googleBreaking.articles || []));
        } catch (error) {
            console.warn('Google breaking news failed:', error.message);
        }

        // Get breaking news from NewsAPI if available
        if (newsAPIService.isConfigured()) {
            try {
                const newsAPIBreaking = await newsAPIService.getBreakingNews(region);
                breakingNews.push(...(newsAPIBreaking.articles || []));
            } catch (error) {
                console.warn('NewsAPI breaking news failed:', error.message);
            }
        }

        // Remove duplicates and sort by relevance
        const uniqueBreaking = [...new Map(breakingNews.map(article => 
            [article.title, article]
        )).values()];

        const sortedBreaking = uniqueBreaking.sort((a, b) => 
            new Date(b.publishedAt || b.pubDate) - new Date(a.publishedAt || a.pubDate)
        ).slice(0, 20);

        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_news_breaking_enhanced', {
                region,
                language,
                result_count: sortedBreaking.length
            });
        }

        res.json({
            success: true,
            articles: sortedBreaking,
            totalResults: sortedBreaking.length,
            region,
            language,
            sources: ['google-news', newsAPIService.isConfigured() ? 'newsapi' : null].filter(Boolean),
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Enhanced breaking news error:', error);
        res.status(500).json({
            error: 'Failed to fetch breaking news',
            message: error.message
        });
    }
});

// Get trending topics
app.get('/api/news/trending', async (req, res) => {
    try {
        const timeWindow = parseInt(req.query.timeWindow) || 24; // hours
        const limit = parseInt(req.query.limit) || 20;
        
        // Get recent articles
        let recentArticles = [];
        
        try {
            const rssNews = await aggregateAllNews();
            recentArticles.push(...rssNews);
        } catch (error) {
            console.warn('RSS news fetch for trending failed:', error.message);
        }

        if (newsAPIService.isConfigured()) {
            try {
                const newsAPIResults = await newsAPIService.getTopHeadlines({ pageSize: 100 });
                recentArticles.push(...(newsAPIResults.articles || []));
            } catch (error) {
                console.warn('NewsAPI fetch for trending failed:', error.message);
            }
        }

        // Extract trending topics
        const trendingTopics = newsFilterService.extractTrendingTopics(recentArticles, timeWindow);
        
        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_news_trending', {
                time_window: timeWindow,
                topics_found: trendingTopics.length
            });
        }

        res.json({
            success: true,
            trending_topics: trendingTopics.slice(0, limit),
            timeWindow: timeWindow,
            articlesAnalyzed: recentArticles.length,
            generatedAt: new Date().toISOString(),
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

// Get user's location and news preferences
app.get('/api/news/location', async (req, res) => {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userLocation = await geolocationService.getLocationFromIP(ipAddress);
        
        const recommendations = await geolocationService.getLocationBasedRecommendations(userLocation);
        
        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_news_location', {
                detected_location: {
                    country: userLocation.country,
                    region: userLocation.newsRegion
                }
            });
        }

        res.json({
            success: true,
            location: userLocation,
            recommendations: recommendations,
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Location detection error:', error);
        res.status(500).json({
            error: 'Failed to detect location',
            message: error.message
        });
    }
});

// Get available news categories and regions
app.get('/api/news/options', (req, res) => {
    try {
        const options = {
            categories: {
                newsapi: newsAPIService.getAvailableCategories(),
                google: ['world', 'business', 'technology', 'entertainment', 'sports', 'science', 'health'],
                custom: Object.keys(newsFilterService.categoryFilters)
            },
            regions: {
                newsapi: Object.keys(newsAPIService.getAvailableCountries()),
                google: Object.keys(googleNewsService.getAvailableRegions()),
                groups: geolocationService.getSupportedRegions()
            },
            languages: {
                google: Object.keys(googleNewsService.getAvailableLanguages()),
                supported: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']
            },
            sortOptions: ['relevance', 'date', 'popularity'],
            sentimentOptions: ['positive', 'negative', 'neutral', 'urgent']
        };

        res.json({
            success: true,
            options: options,
            services: {
                newsapi: newsAPIService.isConfigured(),
                google: true,
                geolocation: true,
                filtering: true
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

// Export these functions to be used in the main server file
module.exports = {
    removeDuplicates
};
