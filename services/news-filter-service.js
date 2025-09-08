// KaiTech Voice of Time - Advanced News Filtering Service
// Comprehensive filtering system for news articles with user preferences, categories, and regions

const NewsAPIService = require('./news-api-service');
const GoogleNewsService = require('./google-news-service');
const GeolocationService = require('./geolocation-service');

class NewsFilterService {
    constructor() {
        this.newsAPI = new NewsAPIService();
        this.googleNews = new GoogleNewsService();
        this.geolocation = new GeolocationService();
        
        // Filter categories with detailed keywords
        this.categoryFilters = {
            'ai-technology': {
                keywords: ['artificial intelligence', 'AI', 'machine learning', 'deep learning', 'neural networks', 'chatgpt', 'openai', 'automation', 'robotics', 'computer vision', 'nlp', 'natural language processing'],
                sources: ['techcrunch', 'wired', 'ars-technica', 'the-verge'],
                boost: 2.0
            },
            'technology': {
                keywords: ['technology', 'tech', 'startup', 'innovation', 'software', 'hardware', 'digital', 'internet', 'mobile', 'app', 'platform', 'cloud computing', 'cybersecurity'],
                sources: ['techcrunch', 'wired', 'ars-technica', 'engadget'],
                boost: 1.5
            },
            'business': {
                keywords: ['business', 'economy', 'market', 'finance', 'investment', 'company', 'corporate', 'earnings', 'stock', 'trading', 'merger', 'acquisition', 'ipo'],
                sources: ['bloomberg', 'reuters', 'financial-times', 'wall-street-journal'],
                boost: 1.3
            },
            'science': {
                keywords: ['science', 'research', 'study', 'discovery', 'scientist', 'experiment', 'breakthrough', 'innovation', 'medical', 'climate', 'space', 'physics', 'biology'],
                sources: ['nature', 'science-magazine', 'scientific-american'],
                boost: 1.4
            },
            'health': {
                keywords: ['health', 'medical', 'healthcare', 'medicine', 'doctor', 'hospital', 'disease', 'vaccine', 'treatment', 'therapy', 'wellness', 'fitness'],
                sources: ['medical-news-today', 'webmd', 'healthline'],
                boost: 1.2
            },
            'politics': {
                keywords: ['politics', 'political', 'government', 'election', 'president', 'minister', 'policy', 'parliament', 'congress', 'senate', 'legislation', 'democracy'],
                sources: ['cnn', 'bbc-news', 'reuters', 'associated-press'],
                boost: 1.1
            },
            'sports': {
                keywords: ['sports', 'sport', 'football', 'basketball', 'soccer', 'tennis', 'olympics', 'championship', 'league', 'tournament', 'athlete', 'team'],
                sources: ['espn', 'bbc-sport', 'sports-illustrated'],
                boost: 1.0
            },
            'entertainment': {
                keywords: ['entertainment', 'movie', 'film', 'music', 'celebrity', 'actor', 'actress', 'streaming', 'netflix', 'hollywood', 'award', 'festival'],
                sources: ['entertainment-weekly', 'variety', 'the-hollywood-reporter'],
                boost: 0.9
            },
            'cryptocurrency': {
                keywords: ['cryptocurrency', 'crypto', 'bitcoin', 'blockchain', 'ethereum', 'nft', 'defi', 'web3', 'digital currency', 'mining', 'token'],
                sources: ['coindesk', 'cointelegraph'],
                boost: 1.6
            },
            'climate': {
                keywords: ['climate', 'environment', 'green', 'renewable energy', 'sustainability', 'carbon', 'emission', 'global warming', 'solar', 'wind energy'],
                sources: ['reuters', 'bbc-news', 'guardian'],
                boost: 1.3
            }
        };

        // Sentiment keywords for content analysis
        this.sentimentKeywords = {
            positive: ['breakthrough', 'success', 'achievement', 'growth', 'innovation', 'progress', 'victory', 'win', 'advance', 'improve', 'benefit'],
            negative: ['crisis', 'failure', 'decline', 'problem', 'concern', 'disaster', 'tragedy', 'conflict', 'death', 'loss', 'crash', 'scandal'],
            urgent: ['breaking', 'urgent', 'alert', 'emergency', 'critical', 'immediate', 'developing', 'live']
        };

        // Trending topic detection
        this.trendingKeywords = new Map();
        this.keywordTrends = new Map();
    }

    /**
     * Main filtering method - combines all filtering capabilities
     */
    async filterNews(articles, filters = {}) {
        if (!articles || !Array.isArray(articles)) return [];

        const {
            categories = null,
            regions = null,
            keywords = null,
            excludeKeywords = null,
            languages = ['en'],
            sentiment = null,
            minRelevanceScore = 0,
            maxAge = null, // hours
            sources = null,
            excludeSources = null,
            userLocation = null,
            userPreferences = {},
            sortBy = 'relevance', // relevance, date, popularity
            limit = 100
        } = filters;

        let filteredArticles = [...articles];

        // 1. Category filtering
        if (categories && categories.length > 0) {
            filteredArticles = this.filterByCategories(filteredArticles, categories);
        }

        // 2. Keyword filtering
        if (keywords && keywords.length > 0) {
            filteredArticles = this.filterByKeywords(filteredArticles, keywords, excludeKeywords);
        }

        // 3. Language filtering
        if (languages && languages.length > 0) {
            filteredArticles = this.filterByLanguage(filteredArticles, languages);
        }

        // 4. Source filtering
        if (sources || excludeSources) {
            filteredArticles = this.filterBySources(filteredArticles, sources, excludeSources);
        }

        // 5. Age filtering
        if (maxAge) {
            filteredArticles = this.filterByAge(filteredArticles, maxAge);
        }

        // 6. Sentiment filtering
        if (sentiment) {
            filteredArticles = this.filterBySentiment(filteredArticles, sentiment);
        }

        // 7. Regional filtering (if location provided)
        if (regions && regions.length > 0) {
            filteredArticles = this.filterByRegions(filteredArticles, regions);
        }

        // 8. Location-based filtering (if user location provided)
        if (userLocation) {
            filteredArticles = this.geolocation.filterNewsByLocation(
                filteredArticles, 
                userLocation, 
                userPreferences
            );
        }

        // 9. Calculate relevance scores
        filteredArticles = this.calculateRelevanceScores(filteredArticles, filters);

        // 10. Apply minimum relevance threshold
        if (minRelevanceScore > 0) {
            filteredArticles = filteredArticles.filter(article => 
                (article.relevanceScore || 0) >= minRelevanceScore
            );
        }

        // 11. Sort articles
        filteredArticles = this.sortArticles(filteredArticles, sortBy);

        // 12. Apply limit
        if (limit > 0) {
            filteredArticles = filteredArticles.slice(0, limit);
        }

        return filteredArticles;
    }

    /**
     * Filter by categories with advanced keyword matching
     */
    filterByCategories(articles, categories) {
        return articles.filter(article => {
            const content = (article.title + ' ' + (article.description || '') + ' ' + (article.content || '')).toLowerCase();
            
            return categories.some(category => {
                // Direct category match
                if (article.category && article.category.toLowerCase() === category.toLowerCase()) {
                    return true;
                }

                // Keyword-based category detection
                const categoryConfig = this.categoryFilters[category.toLowerCase()];
                if (categoryConfig && categoryConfig.keywords) {
                    return categoryConfig.keywords.some(keyword => 
                        content.includes(keyword.toLowerCase())
                    );
                }

                return false;
            });
        });
    }

    /**
     * Filter by keywords with exclusion support
     */
    filterByKeywords(articles, includeKeywords, excludeKeywords = []) {
        return articles.filter(article => {
            const content = (article.title + ' ' + (article.description || '') + ' ' + (article.content || '')).toLowerCase();
            
            // Check if article contains any required keywords
            const hasIncludeKeywords = includeKeywords.some(keyword => 
                content.includes(keyword.toLowerCase())
            );
            
            // Check if article contains any excluded keywords
            const hasExcludeKeywords = excludeKeywords.some(keyword => 
                content.includes(keyword.toLowerCase())
            );
            
            return hasIncludeKeywords && !hasExcludeKeywords;
        });
    }

    /**
     * Filter by language
     */
    filterByLanguage(articles, languages) {
        return articles.filter(article => {
            if (!article.language) return true; // Include if language not specified
            return languages.includes(article.language.toLowerCase());
        });
    }

    /**
     * Filter by news sources
     */
    filterBySources(articles, includeSources = null, excludeSources = null) {
        return articles.filter(article => {
            const sourceName = article.source?.name?.toLowerCase() || '';
            const sourceId = article.source?.id?.toLowerCase() || '';
            
            // Check exclude list first
            if (excludeSources && excludeSources.length > 0) {
                const isExcluded = excludeSources.some(source => 
                    sourceName.includes(source.toLowerCase()) || 
                    sourceId.includes(source.toLowerCase())
                );
                if (isExcluded) return false;
            }
            
            // Check include list
            if (includeSources && includeSources.length > 0) {
                return includeSources.some(source => 
                    sourceName.includes(source.toLowerCase()) || 
                    sourceId.includes(source.toLowerCase())
                );
            }
            
            return true;
        });
    }

    /**
     * Filter by article age
     */
    filterByAge(articles, maxAgeHours) {
        const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
        
        return articles.filter(article => {
            const publishDate = new Date(article.publishedAt || article.pubDate);
            return publishDate >= cutoffTime;
        });
    }

    /**
     * Filter by sentiment
     */
    filterBySentiment(articles, targetSentiment) {
        return articles.filter(article => {
            const sentiment = this.analyzeSentiment(article);
            return sentiment === targetSentiment.toLowerCase();
        });
    }

    /**
     * Filter by regions
     */
    filterByRegions(articles, regions) {
        return articles.filter(article => {
            const content = (article.title + ' ' + (article.description || '')).toLowerCase();
            
            return regions.some(region => {
                // Check if article mentions region-specific keywords
                const regionKeywords = this.geolocation.getRegionalKeywords(region);
                return regionKeywords.some(keyword => 
                    content.includes(keyword.toLowerCase())
                );
            });
        });
    }

    /**
     * Calculate relevance scores for articles
     */
    calculateRelevanceScores(articles, filters) {
        return articles.map(article => {
            let score = 0;
            const content = (article.title + ' ' + (article.description || '') + ' ' + (article.content || '')).toLowerCase();
            
            // Base score from publication date (newer = higher)
            const hoursOld = (Date.now() - new Date(article.publishedAt || article.pubDate)) / (1000 * 60 * 60);
            score += Math.max(0, 100 - hoursOld); // Max 100 points for recency
            
            // Category relevance boost
            if (filters.categories) {
                filters.categories.forEach(category => {
                    const categoryConfig = this.categoryFilters[category.toLowerCase()];
                    if (categoryConfig) {
                        const keywordMatches = categoryConfig.keywords.filter(keyword => 
                            content.includes(keyword.toLowerCase())
                        ).length;
                        score += keywordMatches * 10 * (categoryConfig.boost || 1);
                    }
                });
            }

            // Keyword relevance
            if (filters.keywords) {
                const keywordMatches = filters.keywords.filter(keyword => 
                    content.includes(keyword.toLowerCase())
                ).length;
                score += keywordMatches * 20;
            }

            // Source quality boost
            const sourceName = article.source?.name?.toLowerCase() || '';
            if (this.isHighQualitySource(sourceName)) {
                score += 25;
            }

            // Location relevance (if available)
            if (article.locationRelevance) {
                score += article.locationRelevance;
            }

            // Title keyword density
            const titleWords = article.title.toLowerCase().split(' ');
            if (filters.keywords) {
                const titleKeywordMatches = filters.keywords.filter(keyword => 
                    titleWords.some(word => word.includes(keyword.toLowerCase()))
                ).length;
                score += titleKeywordMatches * 15; // Higher weight for title matches
            }

            // Breaking news boost
            if (this.isBreakingNews(article)) {
                score += 50;
            }

            return {
                ...article,
                relevanceScore: Math.round(score)
            };
        });
    }

    /**
     * Sort articles by different criteria
     */
    sortArticles(articles, sortBy) {
        switch (sortBy.toLowerCase()) {
            case 'date':
                return articles.sort((a, b) => 
                    new Date(b.publishedAt || b.pubDate) - new Date(a.publishedAt || a.pubDate)
                );
            
            case 'relevance':
                return articles.sort((a, b) => 
                    (b.relevanceScore || 0) - (a.relevanceScore || 0)
                );
            
            case 'popularity':
                // Sort by a combination of source reputation and engagement
                return articles.sort((a, b) => {
                    const aScore = this.calculatePopularityScore(a);
                    const bScore = this.calculatePopularityScore(b);
                    return bScore - aScore;
                });
            
            default:
                return articles;
        }
    }

    /**
     * Analyze sentiment of an article
     */
    analyzeSentiment(article) {
        const content = (article.title + ' ' + (article.description || '')).toLowerCase();
        
        let positiveScore = 0;
        let negativeScore = 0;
        let urgentScore = 0;

        // Count sentiment keywords
        this.sentimentKeywords.positive.forEach(word => {
            if (content.includes(word)) positiveScore++;
        });

        this.sentimentKeywords.negative.forEach(word => {
            if (content.includes(word)) negativeScore++;
        });

        this.sentimentKeywords.urgent.forEach(word => {
            if (content.includes(word)) urgentScore++;
        });

        // Determine overall sentiment
        if (urgentScore > 0) return 'urgent';
        if (positiveScore > negativeScore) return 'positive';
        if (negativeScore > positiveScore) return 'negative';
        return 'neutral';
    }

    /**
     * Check if source is considered high quality
     */
    isHighQualitySource(sourceName) {
        const highQualitySources = [
            'bbc', 'reuters', 'associated press', 'cnn', 'new york times',
            'washington post', 'wall street journal', 'financial times',
            'guardian', 'techcrunch', 'wired', 'nature', 'science'
        ];

        return highQualitySources.some(source => 
            sourceName.includes(source.toLowerCase())
        );
    }

    /**
     * Check if article is breaking news
     */
    isBreakingNews(article) {
        const content = (article.title + ' ' + (article.description || '')).toLowerCase();
        const breakingKeywords = ['breaking', 'urgent', 'alert', 'developing', 'live'];
        
        // Check for breaking keywords
        const hasBreakingKeywords = breakingKeywords.some(keyword => 
            content.includes(keyword)
        );

        // Check recency (less than 2 hours old)
        const hoursOld = (Date.now() - new Date(article.publishedAt || article.pubDate)) / (1000 * 60 * 60);
        const isRecent = hoursOld < 2;

        return hasBreakingKeywords || isRecent;
    }

    /**
     * Calculate popularity score for an article
     */
    calculatePopularityScore(article) {
        let score = 0;

        // Source reputation
        if (this.isHighQualitySource(article.source?.name || '')) {
            score += 30;
        }

        // Breaking news bonus
        if (this.isBreakingNews(article)) {
            score += 20;
        }

        // Title engagement factors
        const titleLength = article.title.length;
        if (titleLength > 10 && titleLength < 100) {
            score += 10; // Optimal title length
        }

        return score;
    }

    /**
     * Get trending topics from articles
     */
    extractTrendingTopics(articles, timeWindow = 24) { // hours
        const topicCounts = new Map();
        const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000);

        articles.forEach(article => {
            const publishDate = new Date(article.publishedAt || article.pubDate);
            if (publishDate < cutoffTime) return;

            const content = (article.title + ' ' + (article.description || '')).toLowerCase();
            const words = content.split(/\s+/);

            // Extract potential topics (2-3 word phrases)
            for (let i = 0; i < words.length - 1; i++) {
                const phrase = words.slice(i, i + 2).join(' ');
                if (phrase.length > 5 && !this.isCommonPhrase(phrase)) {
                    topicCounts.set(phrase, (topicCounts.get(phrase) || 0) + 1);
                }
            }
        });

        // Sort by frequency and return top topics
        return Array.from(topicCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([topic, count]) => ({ topic, count, trending: count > 3 }));
    }

    /**
     * Check if phrase is too common to be a trending topic
     */
    isCommonPhrase(phrase) {
        const commonPhrases = [
            'in the', 'on the', 'for the', 'to the', 'of the', 'and the',
            'is a', 'was a', 'has been', 'have been', 'will be', 'can be',
            'this is', 'that is', 'there is', 'it is', 'we are', 'they are'
        ];
        
        return commonPhrases.includes(phrase.toLowerCase()) || phrase.length < 4;
    }

    /**
     * Get personalized filter recommendations
     */
    getPersonalizedRecommendations(userPreferences, userLocation = null, readingHistory = []) {
        const recommendations = {
            categories: [],
            keywords: [],
            sources: [],
            regions: []
        };

        // Base recommendations on reading history
        if (readingHistory.length > 0) {
            const categoryCounts = {};
            const keywordCounts = {};

            readingHistory.forEach(article => {
                if (article.category) {
                    categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
                }
                
                // Extract keywords from titles
                const words = article.title.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 4) {
                        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
                    }
                });
            });

            // Get top categories and keywords
            recommendations.categories = Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([category]) => category);

            recommendations.keywords = Object.entries(keywordCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([keyword]) => keyword);
        }

        // Add location-based recommendations
        if (userLocation) {
            const locationRecs = this.geolocation.getLocationBasedRecommendations(userLocation);
            recommendations.categories.push(...locationRecs.categories);
            recommendations.keywords.push(...locationRecs.keywords);
            recommendations.regions = locationRecs.regions;
            recommendations.sources = locationRecs.localSources;
        }

        // Remove duplicates
        recommendations.categories = [...new Set(recommendations.categories)];
        recommendations.keywords = [...new Set(recommendations.keywords)];
        recommendations.sources = [...new Set(recommendations.sources)];
        recommendations.regions = [...new Set(recommendations.regions)];

        return recommendations;
    }
}

module.exports = NewsFilterService;
