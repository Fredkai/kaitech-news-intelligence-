// KaiTech Voice of Time - Multi-Provider Translation Service
// Supports Google Translate API, LibreTranslate, and fallback mechanisms

const translate = require('@vitalets/google-translate-api');
const franc = require('franc');

class TranslationService {
    constructor() {
        this.supportedLanguages = {
            'en': { name: 'English', flag: '🇺🇸', rtl: false },
            'es': { name: 'Español', flag: '🇪🇸', rtl: false },
            'fr': { name: 'Français', flag: '🇫🇷', rtl: false },
            'de': { name: 'Deutsch', flag: '🇩🇪', rtl: false },
            'it': { name: 'Italiano', flag: '🇮🇹', rtl: false },
            'pt': { name: 'Português', flag: '🇵🇹', rtl: false },
            'ru': { name: 'Русский', flag: '🇷🇺', rtl: false },
            'ja': { name: '日本語', flag: '🇯🇵', rtl: false },
            'ko': { name: '한국어', flag: '🇰🇷', rtl: false },
            'zh': { name: '中文', flag: '🇨🇳', rtl: false },
            'ar': { name: 'العربية', flag: '🇸🇦', rtl: true },
            'hi': { name: 'हिंदी', flag: '🇮🇳', rtl: false },
            'nl': { name: 'Nederlands', flag: '🇳🇱', rtl: false },
            'sv': { name: 'Svenska', flag: '🇸🇪', rtl: false },
            'no': { name: 'Norsk', flag: '🇳🇴', rtl: false },
            'da': { name: 'Dansk', flag: '🇩🇰', rtl: false },
            'fi': { name: 'Suomi', flag: '🇫🇮', rtl: false },
            'pl': { name: 'Polski', flag: '🇵🇱', rtl: false },
            'tr': { name: 'Türkçe', flag: '🇹🇷', rtl: false },
            'cs': { name: 'Čeština', flag: '🇨🇿', rtl: false },
            'hu': { name: 'Magyar', flag: '🇭🇺', rtl: false },
            'ro': { name: 'Română', flag: '🇷🇴', rtl: false },
            'bg': { name: 'Български', flag: '🇧🇬', rtl: false },
            'hr': { name: 'Hrvatski', flag: '🇭🇷', rtl: false },
            'sk': { name: 'Slovenčina', flag: '🇸🇰', rtl: false },
            'sl': { name: 'Slovenščina', flag: '🇸🇮', rtl: false },
            'et': { name: 'Eesti', flag: '🇪🇪', rtl: false },
            'lv': { name: 'Latviešu', flag: '🇱🇻', rtl: false },
            'lt': { name: 'Lietuvių', flag: '🇱🇹', rtl: false },
            'uk': { name: 'Українська', flag: '🇺🇦', rtl: false },
            'el': { name: 'Ελληνικά', flag: '🇬🇷', rtl: false },
            'he': { name: 'עברית', flag: '🇮🇱', rtl: true },
            'th': { name: 'ไทย', flag: '🇹🇭', rtl: false },
            'vi': { name: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
            'id': { name: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
            'ms': { name: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
            'tl': { name: 'Filipino', flag: '🇵🇭', rtl: false }
        };

        this.translationCache = new Map();
        this.cacheTimeout = 3600000; // 1 hour
        this.providers = {
            google: true,
            libretranslate: false
        };

        this.rateLimits = {
            google: { requests: 0, resetTime: Date.now() + 60000, limit: 100 }
        };

        console.log('🌐 Translation Service initialized with', Object.keys(this.supportedLanguages).length, 'supported languages');
    }

    /**
     * Detect the language of a text
     */
    detectLanguage(text) {
        try {
            if (!text || text.length < 10) {
                return 'en'; // Default to English for short texts
            }

            const detected = franc(text);
            
            // Convert franc language codes to our supported codes
            const francToSupported = {
                'eng': 'en', 'spa': 'es', 'fra': 'fr', 'deu': 'de', 'ita': 'it',
                'por': 'pt', 'rus': 'ru', 'jpn': 'ja', 'kor': 'ko', 'cmn': 'zh',
                'arb': 'ar', 'hin': 'hi', 'nld': 'nl', 'swe': 'sv', 'nor': 'no',
                'dan': 'da', 'fin': 'fi', 'pol': 'pl', 'tur': 'tr', 'ces': 'cs',
                'hun': 'hu', 'ron': 'ro', 'bul': 'bg', 'hrv': 'hr', 'slk': 'sk',
                'slv': 'sl', 'est': 'et', 'lav': 'lv', 'lit': 'lt', 'ukr': 'uk',
                'ell': 'el', 'heb': 'he', 'tha': 'th', 'vie': 'vi', 'ind': 'id',
                'msa': 'ms', 'tgl': 'tl'
            };

            const langCode = francToSupported[detected] || 'en';
            
            if (this.supportedLanguages[langCode]) {
                console.log(`🔍 Detected language: ${langCode} (${this.supportedLanguages[langCode].name})`);
                return langCode;
            }

            return 'en'; // Default fallback
        } catch (error) {
            console.warn('Language detection failed:', error.message);
            return 'en';
        }
    }

    /**
     * Translate text from source language to target language
     */
    async translateText(text, targetLang, sourceLang = null) {
        try {
            // Validate input
            if (!text || !text.trim()) {
                throw new Error('Text is required for translation');
            }

            if (!this.supportedLanguages[targetLang]) {
                throw new Error(`Unsupported target language: ${targetLang}`);
            }

            // Detect source language if not provided
            if (!sourceLang) {
                sourceLang = this.detectLanguage(text);
            }

            // Skip translation if source and target are the same
            if (sourceLang === targetLang) {
                return {
                    text: text,
                    sourceLang: sourceLang,
                    targetLang: targetLang,
                    cached: false,
                    provider: 'none'
                };
            }

            // Check cache first
            const cacheKey = this.getCacheKey(text, sourceLang, targetLang);
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return {
                    text: cached.text,
                    sourceLang: sourceLang,
                    targetLang: targetLang,
                    cached: true,
                    provider: cached.provider
                };
            }

            let translatedText = null;
            let usedProvider = null;

            // Try Google Translate first
            if (this.canUseProvider('google')) {
                try {
                    const result = await this.translateWithGoogle(text, targetLang, sourceLang);
                    translatedText = result.text;
                    usedProvider = 'google';
                    
                    // Update rate limit
                    this.updateRateLimit('google');
                    
                    console.log(`📝 Translated "${text.substring(0, 50)}..." from ${sourceLang} to ${targetLang} using Google Translate`);
                } catch (error) {
                    console.warn('Google Translate failed:', error.message);
                }
            }

            // Fallback to other providers if needed
            if (!translatedText && this.canUseProvider('libretranslate')) {
                try {
                    translatedText = await this.translateWithLibreTranslate(text, targetLang, sourceLang);
                    usedProvider = 'libretranslate';
                    console.log(`📝 Translated using LibreTranslate fallback`);
                } catch (error) {
                    console.warn('LibreTranslate failed:', error.message);
                }
            }

            if (!translatedText) {
                throw new Error('All translation providers failed');
            }

            // Cache the result
            this.cacheTranslation(cacheKey, translatedText, usedProvider);

            return {
                text: translatedText,
                sourceLang: sourceLang,
                targetLang: targetLang,
                cached: false,
                provider: usedProvider
            };

        } catch (error) {
            console.error('Translation error:', error);
            throw new Error(`Translation failed: ${error.message}`);
        }
    }

    /**
     * Translate using Google Translate API
     */
    async translateWithGoogle(text, targetLang, sourceLang) {
        try {
            const result = await translate(text, { from: sourceLang, to: targetLang });
            return { text: result.text };
        } catch (error) {
            throw new Error(`Google Translate error: ${error.message}`);
        }
    }

    /**
     * Translate using LibreTranslate (fallback)
     */
    async translateWithLibreTranslate(text, targetLang, sourceLang) {
        // This would require a LibreTranslate server setup
        // For now, return a placeholder indicating it's not available
        throw new Error('LibreTranslate not configured');
    }

    /**
     * Translate an entire news article
     */
    async translateArticle(article, targetLang) {
        try {
            const originalLang = this.detectLanguage(article.title + ' ' + (article.description || ''));
            
            if (originalLang === targetLang) {
                return {
                    ...article,
                    translatedTitle: article.title,
                    translatedDescription: article.description,
                    originalLanguage: originalLang,
                    targetLanguage: targetLang,
                    cached: false
                };
            }

            // Translate title
            const titleResult = await this.translateText(article.title, targetLang, originalLang);
            
            // Translate description if available
            let descriptionResult = null;
            if (article.description) {
                descriptionResult = await this.translateText(article.description, targetLang, originalLang);
            }

            return {
                ...article,
                translatedTitle: titleResult.text,
                translatedDescription: descriptionResult ? descriptionResult.text : article.description,
                originalLanguage: originalLang,
                targetLanguage: targetLang,
                translationProvider: titleResult.provider,
                cached: titleResult.cached && (descriptionResult ? descriptionResult.cached : true)
            };

        } catch (error) {
            console.error('Article translation error:', error);
            return {
                ...article,
                translatedTitle: article.title,
                translatedDescription: article.description,
                originalLanguage: this.detectLanguage(article.title),
                targetLanguage: targetLang,
                translationError: error.message
            };
        }
    }

    /**
     * Batch translate multiple articles
     */
    async translateArticles(articles, targetLang, options = {}) {
        const { 
            maxConcurrent = 5, 
            includeOriginal = true,
            onProgress = null 
        } = options;

        const results = [];
        const chunks = this.chunkArray(articles, maxConcurrent);

        let processed = 0;
        const total = articles.length;

        for (const chunk of chunks) {
            const promises = chunk.map(async (article) => {
                try {
                    const translated = await this.translateArticle(article, targetLang);
                    processed++;
                    
                    if (onProgress) {
                        onProgress(processed, total);
                    }

                    return includeOriginal ? {
                        original: article,
                        translated: translated
                    } : translated;
                } catch (error) {
                    console.error('Batch translation error for article:', error);
                    processed++;
                    if (onProgress) {
                        onProgress(processed, total);
                    }
                    return includeOriginal ? {
                        original: article,
                        translated: article,
                        error: error.message
                    } : { ...article, translationError: error.message };
                }
            });

            const chunkResults = await Promise.all(promises);
            results.push(...chunkResults);

            // Add delay between chunks to avoid rate limiting
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await this.delay(1000);
            }
        }

        return results;
    }

    /**
     * Get supported languages list
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * Check if a language is supported
     */
    isLanguageSupported(langCode) {
        return !!this.supportedLanguages[langCode];
    }

    /**
     * Get language info by code
     */
    getLanguageInfo(langCode) {
        return this.supportedLanguages[langCode] || null;
    }

    /**
     * Cache management
     */
    getCacheKey(text, sourceLang, targetLang) {
        return `${sourceLang}-${targetLang}-${Buffer.from(text.substring(0, 100)).toString('base64')}`;
    }

    cacheTranslation(key, text, provider) {
        this.translationCache.set(key, {
            text: text,
            provider: provider,
            timestamp: Date.now()
        });
    }

    getFromCache(key) {
        const cached = this.translationCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached;
        }
        if (cached) {
            this.translationCache.delete(key);
        }
        return null;
    }

    clearCache() {
        this.translationCache.clear();
        console.log('🗑️ Translation cache cleared');
    }

    getCacheStats() {
        return {
            size: this.translationCache.size,
            timeout: this.cacheTimeout / 1000 / 60 // in minutes
        };
    }

    /**
     * Rate limiting
     */
    canUseProvider(provider) {
        if (!this.providers[provider]) return false;
        
        const rateLimit = this.rateLimits[provider];
        if (!rateLimit) return true;

        if (Date.now() > rateLimit.resetTime) {
            rateLimit.requests = 0;
            rateLimit.resetTime = Date.now() + 60000;
        }

        return rateLimit.requests < rateLimit.limit;
    }

    updateRateLimit(provider) {
        const rateLimit = this.rateLimits[provider];
        if (rateLimit) {
            rateLimit.requests++;
        }
    }

    /**
     * Utility functions
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const testResult = await this.translateText('Hello world', 'es', 'en');
            return {
                status: 'healthy',
                providers: {
                    google: this.canUseProvider('google'),
                    libretranslate: this.canUseProvider('libretranslate')
                },
                cache: this.getCacheStats(),
                testTranslation: testResult
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                providers: {
                    google: this.canUseProvider('google'),
                    libretranslate: this.canUseProvider('libretranslate')
                },
                cache: this.getCacheStats()
            };
        }
    }
}

// Singleton instance
const translationService = new TranslationService();

module.exports = translationService;
