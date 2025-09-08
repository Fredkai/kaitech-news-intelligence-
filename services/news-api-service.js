// KaiTech Voice of Time - NewsAPI Integration Service
// Provides real-time news with advanced filtering capabilities

const axios = require('axios');

class NewsAPIService {
    constructor() {
        this.apiKey = process.env.NEWSAPI_KEY || null;
        this.baseURL = 'https://newsapi.org/v2';
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
        
        // NewsAPI supported countries and categories
        this.supportedCountries = {
            'global': null, // All countries
            'us': 'United States',
            'gb': 'United Kingdom',
            'ca': 'Canada',
            'au': 'Australia',
            'de': 'Germany',
            'fr': 'France',
            'it': 'Italy',
            'es': 'Spain',
            'nl': 'Netherlands',
            'jp': 'Japan',
            'kr': 'South Korea',
            'cn': 'China',
            'in': 'India',
            'br': 'Brazil',
            'mx': 'Mexico',
            'ru': 'Russia',
            'za': 'South Africa',
            'eg': 'Egypt',
            'ng': 'Nigeria',
            'ae': 'UAE'
        };

        this.supportedCategories = [
            'business',
            'entertainment',
            'general',
            'health',
            'science',
            'sports',
            'technology'
        ];

        // Regional mapping for better geographic coverage
        this.regionMapping = {
            'north-america': ['us', 'ca', 'mx'],
            'europe': ['gb', 'de', 'fr', 'it', 'es', 'nl', 'ru'],
            'asia': ['jp', 'kr', 'cn', 'in', 'ae'],
            'africa': ['za', 'eg', 'ng'],
            'oceania': ['au'],
            'south-america': ['br']
        };
    }

    /**
     * Get top headlines with filtering options
     */
    async getTopHeadlines(options = {}) {
        const {
            country = null,
            category = null,
            sources = null,
            q = null,
            pageSize = 100,
            page = 1,
            region = null
        } = options;

        // Handle region-based filtering
        let countries = [];
        if (region && this.regionMapping[region]) {
            countries = this.regionMapping[region];
        } else if (country) {
            countries = [country];
        }

        const results = [];

        try {
            // If region specified, fetch from multiple countries
            if (countries.length > 0) {
                const promises = countries.map(countryCode => 
                    this.fetchHeadlines({
                        country: countryCode,
                        category,
                        sources,
                        q,
                        pageSize: Math.ceil(pageSize / countries.length),
                        page
                    })
                );

                const responses = await Promise.allSettled(promises);
                
                responses.forEach(response => {
                    if (response.status === 'fulfilled' && response.value.articles) {
                        results.push(...response.value.articles);
                    }
                });
            } else {
                // Single request for global or specific parameters
                const response = await this.fetchHeadlines({
                    country,
                    category,
                    sources,
                    q,
                    pageSize,
                    page
                });
                
                if (response.articles) {
                    results.push(...response.articles);
                }
            }

            // Sort by publication date and remove duplicates
            const uniqueArticles = this.removeDuplicates(results);
            const sortedArticles = uniqueArticles.sort((a, b) => 
                new Date(b.publishedAt) - new Date(a.publishedAt)
            );

            return {
                status: 'ok',
                totalResults: sortedArticles.length,
                articles: sortedArticles.slice(0, pageSize),
                source: 'newsapi',
                filters: {
                    country,
                    category,
                    region,
                    query: q
                }
            };

        } catch (error) {
            console.error('NewsAPI headlines error:', error.message);
            throw new Error(`Failed to fetch headlines: ${error.message}`);
        }
    }

    /**
     * Search everything endpoint with advanced filtering
     */
    async searchEverything(options = {}) {
        const {
            q,
            sources = null,
            domains = null,
            excludeDomains = null,
            from = null,
            to = null,
            language = 'en',
            sortBy = 'publishedAt',
            pageSize = 100,
            page = 1,
            category = null,
            region = null
        } = options;

        if (!q && !sources && !domains) {
            throw new Error('At least one of q, sources, or domains must be specified');
        }

        const cacheKey = `search_${JSON.stringify(options)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const params = {
                apiKey: this.apiKey,
                q,
                sources,
                domains,
                excludeDomains,
                from,
                to,
                language,
                sortBy,
                pageSize,
                page
            };

            // Remove null/undefined params
            Object.keys(params).forEach(key => 
                params[key] === null || params[key] === undefined ? delete params[key] : {}
            );

            const response = await axios.get(`${this.baseURL}/everything`, { params });

            let articles = response.data.articles || [];

            // Apply additional filtering if needed
            if (category) {
                articles = this.filterByCategory(articles, category);
            }

            if (region) {
                articles = this.filterByRegion(articles, region);
            }

            const result = {
                status: response.data.status,
                totalResults: articles.length,
                articles: articles,
                source: 'newsapi',
                filters: options
            };

            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            if (error.response?.status === 429) {
                throw new Error('NewsAPI rate limit exceeded. Please try again later.');
            }
            console.error('NewsAPI search error:', error.message);
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    /**
     * Get news sources with filtering
     */
    async getSources(options = {}) {
        const {
            category = null,
            language = 'en',
            country = null
        } = options;

        const cacheKey = `sources_${JSON.stringify(options)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const params = {
                apiKey: this.apiKey,
                category,
                language,
                country
            };

            // Remove null params
            Object.keys(params).forEach(key => 
                params[key] === null ? delete params[key] : {}
            );

            const response = await axios.get(`${this.baseURL}/sources`, { params });
            
            const result = response.data;
            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('NewsAPI sources error:', error.message);
            throw new Error(`Failed to fetch sources: ${error.message}`);
        }
    }

    /**
     * Get AI and technology specific news
     */
    async getAITechNews(region = null) {
        const queries = [
            'artificial intelligence',
            'machine learning',
            'AI breakthrough',
            'neural networks',
            'deep learning',
            'tech innovation',
            'startup funding',
            'tech IPO'
        ];

        const results = [];

        for (const query of queries.slice(0, 3)) { // Limit to avoid API limits
            try {
                const response = await this.searchEverything({
                    q: query,
                    category: 'technology',
                    sortBy: 'publishedAt',
                    pageSize: 10,
                    region
                });
                
                if (response.articles) {
                    results.push(...response.articles);
                }
            } catch (error) {
                console.warn(`Failed to fetch news for query: ${query}`, error.message);
            }
        }

        return {
            status: 'ok',
            totalResults: results.length,
            articles: this.removeDuplicates(results).slice(0, 30),
            source: 'newsapi-ai-tech',
            region
        };
    }

    /**
     * Get breaking news (recent + trending)
     */
    async getBreakingNews(region = null) {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        
        try {
            const response = await this.searchEverything({
                q: 'breaking OR urgent OR live',
                from: twoHoursAgo,
                sortBy: 'publishedAt',
                pageSize: 50,
                region
            });

            // Also get top headlines for immediate breaking news
            const headlines = await this.getTopHeadlines({
                pageSize: 20,
                region
            });

            const combined = [
                ...(response.articles || []),
                ...(headlines.articles || [])
            ];

            const breaking = this.removeDuplicates(combined)
                .filter(article => {
                    const hoursSincePublished = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
                    const hasBreakingKeywords = /breaking|urgent|live|developing/i.test(article.title);
                    return hoursSincePublished < 3 || hasBreakingKeywords;
                })
                .slice(0, 20);

            return {
                status: 'ok',
                totalResults: breaking.length,
                articles: breaking,
                source: 'newsapi-breaking',
                region
            };

        } catch (error) {
            console.error('Breaking news error:', error.message);
            throw error;
        }
    }

    /**
     * Private helper methods
     */
    async fetchHeadlines(params) {
        if (!this.apiKey) {
            throw new Error('NewsAPI key not configured');
        }

        const apiParams = {
            ...params,
            apiKey: this.apiKey
        };

        // Remove null params
        Object.keys(apiParams).forEach(key => 
            apiParams[key] === null || apiParams[key] === undefined ? delete apiParams[key] : {}
        );

        const response = await axios.get(`${this.baseURL}/top-headlines`, {
            params: apiParams,
            timeout: 10000
        });

        return response.data;
    }

    removeDuplicates(articles) {
        const seen = new Set();
        return articles.filter(article => {
            const key = article.title + article.source?.name;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    filterByCategory(articles, category) {
        // Enhanced category filtering using keywords
        const categoryKeywords = {
            technology: ['tech', 'AI', 'artificial intelligence', 'startup', 'innovation', 'software', 'hardware', 'digital'],
            business: ['business', 'economy', 'market', 'finance', 'investment', 'company', 'corporate'],
            health: ['health', 'medical', 'doctor', 'hospital', 'disease', 'vaccine', 'treatment'],
            science: ['science', 'research', 'study', 'discovery', 'scientist', 'experiment'],
            sports: ['sports', 'football', 'basketball', 'soccer', 'tennis', 'olympics'],
            entertainment: ['movie', 'music', 'celebrity', 'entertainment', 'film', 'actor', 'actress'],
            politics: ['politics', 'government', 'election', 'president', 'minister', 'policy']
        };

        const keywords = categoryKeywords[category.toLowerCase()] || [];
        if (keywords.length === 0) return articles;

        return articles.filter(article => {
            const text = (article.title + ' ' + (article.description || '')).toLowerCase();
            return keywords.some(keyword => text.includes(keyword.toLowerCase()));
        });
    }

    filterByRegion(articles, region) {
        // Basic region filtering - can be enhanced with more sophisticated geo-detection
        const regionKeywords = {
            'asia': ['asia', 'china', 'japan', 'korea', 'india', 'singapore', 'thailand', 'vietnam'],
            'europe': ['europe', 'germany', 'france', 'uk', 'britain', 'spain', 'italy', 'netherlands'],
            'north-america': ['america', 'usa', 'united states', 'canada', 'mexico'],
            'africa': ['africa', 'south africa', 'nigeria', 'egypt', 'kenya'],
            'oceania': ['australia', 'new zealand'],
            'south-america': ['brazil', 'argentina', 'chile', 'colombia']
        };

        const keywords = regionKeywords[region.toLowerCase()] || [];
        if (keywords.length === 0) return articles;

        return articles.filter(article => {
            const text = (article.title + ' ' + (article.description || '') + ' ' + (article.content || '')).toLowerCase();
            return keywords.some(keyword => text.includes(keyword.toLowerCase()));
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

    isConfigured() {
        return !!this.apiKey;
    }

    getAvailableCountries() {
        return this.supportedCountries;
    }

    getAvailableCategories() {
        return this.supportedCategories;
    }

    getAvailableRegions() {
        return Object.keys(this.regionMapping);
    }
}

module.exports = NewsAPIService;
