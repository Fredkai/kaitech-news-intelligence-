// KaiTech Voice of Time - Translation API Endpoints
// Add these endpoints to server-with-auth.js after the existing news endpoints

const translationService = require('./services/translation-service');

// =============================================
// TRANSLATION API ENDPOINTS
// =============================================

// Get supported languages
app.get('/api/translation/languages', (req, res) => {
    try {
        const languages = translationService.getSupportedLanguages();
        
        res.json({
            success: true,
            languages: languages,
            count: Object.keys(languages).length
        });
    } catch (error) {
        console.error('Get languages error:', error);
        res.status(500).json({
            error: 'Failed to get supported languages',
            message: error.message
        });
    }
});

// Detect language of text
app.post('/api/translation/detect', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                error: 'Text is required',
                example: { text: 'Hello world' }
            });
        }

        const detectedLang = translationService.detectLanguage(text);
        const languageInfo = translationService.getLanguageInfo(detectedLang);

        res.json({
            success: true,
            detected: {
                code: detectedLang,
                ...languageInfo
            },
            text_sample: text.substring(0, 100)
        });
    } catch (error) {
        console.error('Language detection error:', error);
        res.status(500).json({
            error: 'Language detection failed',
            message: error.message
        });
    }
});

// Translate text
app.post('/api/translation/translate', async (req, res) => {
    try {
        const { 
            text, 
            targetLang, 
            sourceLang = null 
        } = req.body;

        if (!text || !targetLang) {
            return res.status(400).json({
                error: 'Text and target language are required',
                example: {
                    text: 'Hello world',
                    targetLang: 'es',
                    sourceLang: 'en' // optional
                }
            });
        }

        if (!translationService.isLanguageSupported(targetLang)) {
            return res.status(400).json({
                error: `Unsupported target language: ${targetLang}`,
                supportedLanguages: Object.keys(translationService.getSupportedLanguages())
            });
        }

        const result = await translationService.translateText(text, targetLang, sourceLang);

        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_translation_text', {
                source_lang: result.sourceLang,
                target_lang: result.targetLang,
                text_length: text.length,
                cached: result.cached,
                provider: result.provider
            });
        }

        res.json({
            success: true,
            ...result,
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({
            error: 'Translation failed',
            message: error.message
        });
    }
});

// Translate news article
app.post('/api/translation/article', async (req, res) => {
    try {
        const { 
            article, 
            targetLang 
        } = req.body;

        if (!article || !targetLang) {
            return res.status(400).json({
                error: 'Article object and target language are required',
                example: {
                    article: {
                        title: 'News title',
                        description: 'News description',
                        url: 'https://example.com/news'
                    },
                    targetLang: 'es'
                }
            });
        }

        if (!translationService.isLanguageSupported(targetLang)) {
            return res.status(400).json({
                error: `Unsupported target language: ${targetLang}`,
                supportedLanguages: Object.keys(translationService.getSupportedLanguages())
            });
        }

        const translatedArticle = await translationService.translateArticle(article, targetLang);

        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_translation_article', {
                original_lang: translatedArticle.originalLanguage,
                target_lang: translatedArticle.targetLanguage,
                cached: translatedArticle.cached,
                provider: translatedArticle.translationProvider,
                has_error: !!translatedArticle.translationError
            });
        }

        res.json({
            success: true,
            article: translatedArticle,
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Article translation error:', error);
        res.status(500).json({
            error: 'Article translation failed',
            message: error.message
        });
    }
});

// Batch translate multiple articles
app.post('/api/translation/articles', async (req, res) => {
    try {
        const { 
            articles, 
            targetLang,
            maxConcurrent = 5,
            includeOriginal = false
        } = req.body;

        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            return res.status(400).json({
                error: 'Articles array is required',
                example: {
                    articles: [
                        { title: 'News 1', description: 'Description 1' },
                        { title: 'News 2', description: 'Description 2' }
                    ],
                    targetLang: 'es',
                    maxConcurrent: 5,
                    includeOriginal: false
                }
            });
        }

        if (!targetLang || !translationService.isLanguageSupported(targetLang)) {
            return res.status(400).json({
                error: `Invalid or unsupported target language: ${targetLang}`,
                supportedLanguages: Object.keys(translationService.getSupportedLanguages())
            });
        }

        // Limit batch size for performance
        const maxBatchSize = 50;
        if (articles.length > maxBatchSize) {
            return res.status(400).json({
                error: `Batch size too large. Maximum ${maxBatchSize} articles per request`,
                received: articles.length,
                maxAllowed: maxBatchSize
            });
        }

        let processedCount = 0;
        const onProgress = (processed, total) => {
            processedCount = processed;
            console.log(`Translation progress: ${processed}/${total}`);
        };

        const results = await translationService.translateArticles(articles, targetLang, {
            maxConcurrent: Math.min(maxConcurrent, 10),
            includeOriginal: includeOriginal,
            onProgress: onProgress
        });

        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_translation_batch', {
                target_lang: targetLang,
                articles_count: articles.length,
                processed_count: processedCount,
                include_original: includeOriginal,
                max_concurrent: maxConcurrent
            });
        }

        res.json({
            success: true,
            results: results,
            summary: {
                total: articles.length,
                processed: processedCount,
                targetLanguage: targetLang,
                includeOriginal: includeOriginal
            },
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Batch translation error:', error);
        res.status(500).json({
            error: 'Batch translation failed',
            message: error.message
        });
    }
});

// Get translated news with language preference
app.get('/api/news/translated', async (req, res) => {
    try {
        const {
            lang = 'en',
            category = null,
            region = null,
            q = null,
            pageSize = 20,
            autoTranslate = 'true'
        } = req.query;

        if (!translationService.isLanguageSupported(lang)) {
            return res.status(400).json({
                error: `Unsupported language: ${lang}`,
                supportedLanguages: Object.keys(translationService.getSupportedLanguages())
            });
        }

        // Get news articles first
        let articles = [];
        try {
            // Try to get from existing news endpoints
            const newsParams = new URLSearchParams({
                category: category || '',
                region: region || '',
                q: q || '',
                pageSize: pageSize
            });

            // This assumes your existing news service functions are available
            // You might need to adapt this based on your actual implementation
            if (newsAPIService && newsAPIService.isConfigured()) {
                const newsResult = await newsAPIService.getTopHeadlines({
                    category,
                    country: region,
                    q,
                    pageSize: parseInt(pageSize)
                });
                articles = newsResult.articles || [];
            } else {
                // Fallback to aggregated news
                const aggregatedNews = await aggregateAllNews();
                articles = aggregatedNews.slice(0, parseInt(pageSize));
            }
        } catch (error) {
            console.warn('Failed to fetch news for translation:', error.message);
            articles = [];
        }

        if (articles.length === 0) {
            return res.json({
                success: true,
                articles: [],
                language: lang,
                message: 'No articles found for translation'
            });
        }

        // Translate articles if language is not English and autoTranslate is enabled
        let translatedArticles = articles;
        if (lang !== 'en' && autoTranslate === 'true') {
            try {
                translatedArticles = await translationService.translateArticles(articles, lang, {
                    maxConcurrent: 3,
                    includeOriginal: false
                });
            } catch (error) {
                console.warn('Translation failed, returning original articles:', error.message);
                translatedArticles = articles.map(article => ({
                    ...article,
                    translatedTitle: article.title,
                    translatedDescription: article.description,
                    translationError: error.message
                }));
            }
        }

        // Record user interaction if authenticated
        if (req.isAuthenticated() && authManager.userDb) {
            await authManager.userDb.recordUserInteraction(req.user.id, 'api_news_translated', {
                language: lang,
                auto_translate: autoTranslate === 'true',
                articles_count: articles.length,
                translated_count: translatedArticles.length,
                filters: { category, region, q }
            });
        }

        res.json({
            success: true,
            articles: translatedArticles,
            language: lang,
            languageInfo: translationService.getLanguageInfo(lang),
            autoTranslate: autoTranslate === 'true',
            totalResults: translatedArticles.length,
            filters: { category, region, q },
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Translated news error:', error);
        res.status(500).json({
            error: 'Failed to get translated news',
            message: error.message
        });
    }
});

// Set user language preference
app.post('/api/translation/preferences', async (req, res) => {
    try {
        const { language, autoTranslate = true, defaultRegion = null } = req.body;

        if (!language) {
            return res.status(400).json({
                error: 'Language preference is required',
                example: {
                    language: 'es',
                    autoTranslate: true,
                    defaultRegion: 'es'
                }
            });
        }

        if (!translationService.isLanguageSupported(language)) {
            return res.status(400).json({
                error: `Unsupported language: ${language}`,
                supportedLanguages: Object.keys(translationService.getSupportedLanguages())
            });
        }

        // Save preferences (you might want to store this in database for authenticated users)
        const preferences = {
            language: language,
            autoTranslate: autoTranslate,
            defaultRegion: defaultRegion,
            timestamp: new Date().toISOString()
        };

        // If user is authenticated, save to database
        if (req.isAuthenticated() && authManager.userDb) {
            try {
                await authManager.userDb.updateUserPreferences(req.user.id, {
                    translation: preferences
                });

                await authManager.userDb.recordUserInteraction(req.user.id, 'api_translation_preferences', {
                    language: language,
                    auto_translate: autoTranslate,
                    default_region: defaultRegion
                });
            } catch (error) {
                console.warn('Failed to save translation preferences to database:', error.message);
            }
        }

        res.json({
            success: true,
            preferences: preferences,
            languageInfo: translationService.getLanguageInfo(language),
            user_authenticated: req.isAuthenticated(),
            saved_to_profile: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Set preferences error:', error);
        res.status(500).json({
            error: 'Failed to set translation preferences',
            message: error.message
        });
    }
});

// Get user language preferences
app.get('/api/translation/preferences', async (req, res) => {
    try {
        let preferences = {
            language: 'en',
            autoTranslate: true,
            defaultRegion: null
        };

        // If user is authenticated, get from database
        if (req.isAuthenticated() && authManager.userDb) {
            try {
                const userProfile = await authManager.userDb.getUserProfile(req.user.id);
                if (userProfile && userProfile.preferences && userProfile.preferences.translation) {
                    preferences = {
                        ...preferences,
                        ...userProfile.preferences.translation
                    };
                }
            } catch (error) {
                console.warn('Failed to get translation preferences from database:', error.message);
            }
        }

        res.json({
            success: true,
            preferences: preferences,
            languageInfo: translationService.getLanguageInfo(preferences.language),
            user_authenticated: req.isAuthenticated()
        });

    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            error: 'Failed to get translation preferences',
            message: error.message
        });
    }
});

// Translation service health check
app.get('/api/translation/health', async (req, res) => {
    try {
        const healthStatus = await translationService.healthCheck();
        
        res.json({
            success: true,
            ...healthStatus,
            supportedLanguages: Object.keys(translationService.getSupportedLanguages()).length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Translation health check error:', error);
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Clear translation cache (admin endpoint)
app.delete('/api/translation/cache', async (req, res) => {
    try {
        // This should be protected in production
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'This endpoint requires authentication'
            });
        }

        translationService.clearCache();
        
        res.json({
            success: true,
            message: 'Translation cache cleared',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Clear cache error:', error);
        res.status(500).json({
            error: 'Failed to clear cache',
            message: error.message
        });
    }
});

module.exports = {
    translationService
};
