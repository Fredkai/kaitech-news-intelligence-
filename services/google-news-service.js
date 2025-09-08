// KaiTech Voice of Time - Google News RSS Integration Service
// Provides Google News RSS feeds with advanced filtering capabilities

const axios = require('axios');
const xml2js = require('xml2js');

class GoogleNewsService {
    constructor() {
        this.baseURL = 'https://news.google.com/rss';
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
        this.parser = new xml2js.Parser();
        
        // Google News supported regions/countries (ISO 3166-1 alpha-2)
        this.supportedRegions = {
            'global': '', // Global news
            'us': 'US', // United States
            'gb': 'GB', // United Kingdom
            'ca': 'CA', // Canada
            'au': 'AU', // Australia
            'de': 'DE', // Germany
            'fr': 'FR', // France
            'it': 'IT', // Italy
            'es': 'ES', // Spain
            'nl': 'NL', // Netherlands
            'jp': 'JP', // Japan
            'kr': 'KR', // South Korea
            'cn': 'CN', // China
            'in': 'IN', // India
            'br': 'BR', // Brazil
            'mx': 'MX', // Mexico
            'ru': 'RU', // Russia
            'za': 'ZA', // South Africa
            'eg': 'EG', // Egypt
            'ng': 'NG', // Nigeria
            'ae': 'AE', // UAE
            'sg': 'SG', // Singapore
            'th': 'TH', // Thailand
            'id': 'ID', // Indonesia
            'my': 'MY', // Malaysia
            'ph': 'PH', // Philippines
            'vn': 'VN', // Vietnam
        };

        // Google News supported languages
        this.supportedLanguages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'th': 'Thai',
            'vi': 'Vietnamese'
        };

        // Regional groupings for broader coverage
        this.regionGroups = {
            'asia': ['jp', 'kr', 'cn', 'in', 'sg', 'th', 'id', 'my', 'ph', 'vn'],
            'europe': ['gb', 'de', 'fr', 'it', 'es', 'nl', 'ru'],
            'north-america': ['us', 'ca', 'mx'],
            'south-america': ['br'],
            'africa': ['za', 'eg', 'ng'],
            'middle-east': ['ae'],
            'oceania': ['au']
        };
    }

    /**
     * Get top stories with filtering options
     */
    async getTopStories(options = {}) {
        const {
            region = 'global',
            language = 'en',
            category = null,
            topic = null
        } = options;

        const cacheKey = `top_stories_${JSON.stringify(options)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            let url = this.baseURL;
            
            // Add region/country parameter
            if (region && region !== 'global' && this.supportedRegions[region]) {
                url += `?gl=${this.supportedRegions[region]}`;
            } else {
                url += '?gl=US'; // Default to US for global
            }

            // Add language parameter
            if (language && this.supportedLanguages[language]) {
                url += `&hl=${language}`;
            }

            // Add topic/category if specified
            if (topic) {
                url = `${this.baseURL}/topics/${topic}`;
                if (region && region !== 'global') {
                    url += `?gl=${this.supportedRegions[region]}`;
                }
                if (language) {
                    url += url.includes('?') ? '&' : '?';
                    url += `hl=${language}`;
                }
            } else if (category) {
                url = this.getCategoryURL(category, region, language);
            }

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'KaiTech News Intelligence Bot 2.0'
                },
                timeout: 10000
            });

            const result = await this.parser.parseStringPromise(response.data);
            const items = result.rss?.channel?.[0]?.item || [];

            const articles = items.map((item, index) => this.formatArticle(item, index, 'google-news-top'));

            const formattedResult = {
                status: 'ok',
                totalResults: articles.length,
                articles: articles,
                source: 'google-news',
                filters: options,
                url: url
            };

            this.setCache(cacheKey, formattedResult);
            return formattedResult;

        } catch (error) {
            console.error('Google News error:', error.message);
            throw new Error(`Failed to fetch Google News: ${error.message}`);
        }
    }

    /**
     * Search Google News with query
     */
    async searchNews(query, options = {}) {
        const {
            region = 'global',
            language = 'en',
            sortBy = 'date', // date, relevance
            when = null, // h (hour), d (day), w (week), m (month), y (year)
        } = options;

        if (!query) {
            throw new Error('Search query is required');
        }

        const cacheKey = `search_${query}_${JSON.stringify(options)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            let url = `${this.baseURL}/search`;
            const params = new URLSearchParams();
            
            params.append('q', query);
            
            if (region && region !== 'global' && this.supportedRegions[region]) {
                params.append('gl', this.supportedRegions[region]);
            }
            
            if (language && this.supportedLanguages[language]) {
                params.append('hl', language);
            }

            if (when) {
                params.append('when', when);
            }

            if (sortBy === 'date') {
                params.append('sort', 'date');
            }

            url += `?${params.toString()}`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'KaiTech News Intelligence Bot 2.0'
                },
                timeout: 10000
            });

            const result = await this.parser.parseStringPromise(response.data);
            const items = result.rss?.channel?.[0]?.item || [];

            const articles = items.map((item, index) => this.formatArticle(item, index, 'google-news-search'));

            const formattedResult = {
                status: 'ok',
                totalResults: articles.length,
                articles: articles,
                source: 'google-news-search',
                query: query,
                filters: options,
                url: url
            };

            this.setCache(cacheKey, formattedResult);
            return formattedResult;

        } catch (error) {
            console.error('Google News search error:', error.message);
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    /**
     * Get AI-related news from Asia (as requested in the example)
     */
    async getAINewsFromAsia() {
        const asianCountries = this.regionGroups.asia;
        const aiQueries = ['AI', 'artificial intelligence', 'machine learning', 'technology'];
        
        const allResults = [];

        // Search for AI news from multiple Asian countries
        for (const country of asianCountries.slice(0, 5)) { // Limit to 5 countries to avoid too many requests
            for (const query of aiQueries.slice(0, 2)) { // Limit queries
                try {
                    const results = await this.searchNews(query, {
                        region: country,
                        language: 'en',
                        when: 'd' // Last day
                    });
                    
                    if (results.articles) {
                        allResults.push(...results.articles);
                    }
                } catch (error) {
                    console.warn(`Failed to fetch AI news from ${country}: ${error.message}`);
                }
            }
        }

        // Remove duplicates and sort by date
        const uniqueArticles = this.removeDuplicates(allResults);
        const sortedArticles = uniqueArticles.sort((a, b) => 
            new Date(b.publishedAt) - new Date(a.publishedAt)
        );

        return {
            status: 'ok',
            totalResults: sortedArticles.length,
            articles: sortedArticles.slice(0, 50), // Limit to 50 articles
            source: 'google-news-ai-asia',
            regions: asianCountries.slice(0, 5),
            query: 'AI-related news from Asia'
        };
    }

    /**
     * Get news by category and region
     */
    async getCategoryNews(category, region = 'global', language = 'en') {
        const categoryMappings = {
            'world': 'WORLD',
            'nation': 'NATION', 
            'business': 'BUSINESS',
            'technology': 'TECHNOLOGY',
            'entertainment': 'ENTERTAINMENT',
            'sports': 'SPORTS',
            'science': 'SCIENCE',
            'health': 'HEALTH'
        };

        const googleCategory = categoryMappings[category.toLowerCase()];
        if (!googleCategory) {
            throw new Error(`Unsupported category: ${category}`);
        }

        return await this.getTopStories({
            region,
            language,
            topic: googleCategory
        });
    }

    /**
     * Get breaking news
     */
    async getBreakingNews(region = 'global', language = 'en') {
        try {
            // Search for breaking news keywords
            const breakingQueries = ['breaking news', 'urgent', 'developing story', 'live'];
            const allResults = [];

            for (const query of breakingQueries) {
                try {
                    const results = await this.searchNews(query, {
                        region,
                        language,
                        when: 'h', // Last hour
                        sortBy: 'date'
                    });
                    
                    if (results.articles) {
                        allResults.push(...results.articles);
                    }
                } catch (error) {
                    console.warn(`Failed to fetch breaking news for query ${query}: ${error.message}`);
                }
            }

            // Also get recent top stories
            const topStories = await this.getTopStories({ region, language });
            if (topStories.articles) {
                allResults.push(...topStories.articles);
            }

            // Filter for recent articles and breaking keywords
            const recentArticles = allResults.filter(article => {
                const hoursOld = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
                const hasBreakingKeywords = /breaking|urgent|live|developing|alert/i.test(article.title + ' ' + (article.description || ''));
                return hoursOld < 2 || hasBreakingKeywords;
            });

            const uniqueArticles = this.removeDuplicates(recentArticles);
            const sortedArticles = uniqueArticles.sort((a, b) => 
                new Date(b.publishedAt) - new Date(a.publishedAt)
            );

            return {
                status: 'ok',
                totalResults: sortedArticles.length,
                articles: sortedArticles.slice(0, 30),
                source: 'google-news-breaking',
                region,
                language
            };

        } catch (error) {
            console.error('Breaking news error:', error.message);
            throw error;
        }
    }

    /**
     * Helper methods
     */
    formatArticle(item, index, source) {
        // Extract publication date
        let pubDate = new Date().toISOString();
        if (item.pubDate && item.pubDate[0]) {
            pubDate = new Date(item.pubDate[0]).toISOString();
        }

        // Extract source information from GUID or source
        let sourceName = 'Google News';
        if (item.source && item.source[0] && item.source[0]._) {
            sourceName = item.source[0]._;
        }

        // Clean up title and description
        const title = Array.isArray(item.title) ? item.title[0] : item.title || 'No Title';
        const description = Array.isArray(item.description) ? item.description[0] : item.description || '';
        
        // Remove HTML tags from description
        const cleanDescription = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim();

        return {
            id: `google_news_${index}_${Date.now()}`,
            title: title,
            description: cleanDescription,
            content: cleanDescription,
            url: Array.isArray(item.link) ? item.link[0] : item.link || '',
            urlToImage: this.extractImageFromDescription(description),
            publishedAt: pubDate,
            source: {
                id: source,
                name: sourceName
            },
            category: this.categorizeByKeywords(title + ' ' + cleanDescription),
            region: this.detectRegion(title + ' ' + cleanDescription),
            language: 'en' // Default, could be enhanced with language detection
        };
    }

    extractImageFromDescription(description) {
        // Try to extract image URL from HTML in description
        const imgMatch = description.match(/<img[^>]+src="([^"]+)"/);
        return imgMatch ? imgMatch[1] : null;
    }

    categorizeByKeywords(text) {
        const keywords = text.toLowerCase();
        
        if (keywords.includes('ai') || keywords.includes('artificial intelligence') || keywords.includes('machine learning') || keywords.includes('technology')) {
            return 'technology';
        }
        if (keywords.includes('business') || keywords.includes('economy') || keywords.includes('market') || keywords.includes('finance')) {
            return 'business';
        }
        if (keywords.includes('health') || keywords.includes('medical') || keywords.includes('covid') || keywords.includes('vaccine')) {
            return 'health';
        }
        if (keywords.includes('sports') || keywords.includes('football') || keywords.includes('basketball') || keywords.includes('olympics')) {
            return 'sports';
        }
        if (keywords.includes('politics') || keywords.includes('election') || keywords.includes('government')) {
            return 'politics';
        }
        if (keywords.includes('entertainment') || keywords.includes('movie') || keywords.includes('music') || keywords.includes('celebrity')) {
            return 'entertainment';
        }
        if (keywords.includes('science') || keywords.includes('research') || keywords.includes('study')) {
            return 'science';
        }
        
        return 'general';
    }

    detectRegion(text) {
        const lowerText = text.toLowerCase();
        
        // Asia
        if (lowerText.match(/\b(asia|china|japan|korea|india|singapore|thailand|vietnam|indonesia|malaysia|philippines)\b/)) {
            return 'asia';
        }
        // Europe
        if (lowerText.match(/\b(europe|germany|france|uk|britain|spain|italy|netherlands|russia)\b/)) {
            return 'europe';
        }
        // North America
        if (lowerText.match(/\b(america|usa|united states|canada|mexico|north america)\b/)) {
            return 'north-america';
        }
        // Other regions...
        
        return 'global';
    }

    getCategoryURL(category, region, language) {
        const categoryMappings = {
            'world': 'WORLD',
            'business': 'BUSINESS',
            'technology': 'TECHNOLOGY',
            'entertainment': 'ENTERTAINMENT',
            'sports': 'SPORTS',
            'science': 'SCIENCE',
            'health': 'HEALTH'
        };

        const googleCategory = categoryMappings[category.toLowerCase()];
        if (!googleCategory) {
            return this.baseURL; // Default to top stories
        }

        let url = `${this.baseURL}/topics/${googleCategory}`;
        
        if (region && region !== 'global' && this.supportedRegions[region]) {
            url += `?gl=${this.supportedRegions[region]}`;
        }
        
        if (language && this.supportedLanguages[language]) {
            url += url.includes('?') ? '&' : '?';
            url += `hl=${language}`;
        }

        return url;
    }

    removeDuplicates(articles) {
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

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getAvailableRegions() {
        return this.supportedRegions;
    }

    getAvailableLanguages() {
        return this.supportedLanguages;
    }

    getRegionGroups() {
        return this.regionGroups;
    }
}

module.exports = GoogleNewsService;
