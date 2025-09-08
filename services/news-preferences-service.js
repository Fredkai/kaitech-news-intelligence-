// KaiTech Voice of Time - News Preferences Management Service
// Handles user preferences for categories, regions, sources, and personalization settings

class NewsPreferencesService {
    constructor(userDatabase) {
        this.userDb = userDatabase;
        
        // Default preferences for new users
        this.defaultPreferences = {
            categories: ['technology', 'business', 'science'],
            regions: ['global'],
            languages: ['en'],
            sources: [],
            excludeSources: [],
            keywords: [],
            excludeKeywords: ['celebrity', 'gossip', 'sports'],
            sentiment: null, // null = all sentiments
            maxAge: 24, // hours
            itemsPerPage: 20,
            sortBy: 'relevance', // relevance, date, popularity
            autoRefresh: true,
            refreshInterval: 300000, // 5 minutes
            breakingNewsAlerts: true,
            emailDigest: false,
            pushNotifications: false,
            locationBased: true,
            personalizedFeed: true,
            savedSearches: [],
            blockedDomains: [],
            preferredSources: []
        };

        // Category mappings for different services
        this.categoryMappings = {
            'ai-technology': {
                display: 'AI & Technology',
                keywords: ['artificial intelligence', 'AI', 'machine learning', 'automation'],
                color: '#00D4FF'
            },
            'technology': {
                display: 'Technology',
                keywords: ['tech', 'software', 'hardware', 'innovation'],
                color: '#00A8FF'
            },
            'business': {
                display: 'Business',
                keywords: ['business', 'economy', 'finance', 'market'],
                color: '#4CAF50'
            },
            'science': {
                display: 'Science',
                keywords: ['science', 'research', 'study', 'discovery'],
                color: '#9C27B0'
            },
            'health': {
                display: 'Health',
                keywords: ['health', 'medical', 'healthcare', 'medicine'],
                color: '#FF5722'
            },
            'politics': {
                display: 'Politics',
                keywords: ['politics', 'government', 'election', 'policy'],
                color: '#FF9800'
            },
            'sports': {
                display: 'Sports',
                keywords: ['sports', 'football', 'basketball', 'olympics'],
                color: '#607D8B'
            },
            'entertainment': {
                display: 'Entertainment',
                keywords: ['entertainment', 'movie', 'music', 'celebrity'],
                color: '#E91E63'
            },
            'climate': {
                display: 'Climate & Environment',
                keywords: ['climate', 'environment', 'green', 'sustainability'],
                color: '#8BC34A'
            },
            'cryptocurrency': {
                display: 'Cryptocurrency',
                keywords: ['crypto', 'bitcoin', 'blockchain', 'ethereum'],
                color: '#FFC107'
            }
        };

        // Region preferences with display names
        this.regionMappings = {
            'global': { display: 'Global', flag: '🌍' },
            'north-america': { display: 'North America', flag: '🌎' },
            'europe': { display: 'Europe', flag: '🇪🇺' },
            'asia': { display: 'Asia', flag: '🌏' },
            'africa': { display: 'Africa', flag: '🌍' },
            'south-america': { display: 'South America', flag: '🌎' },
            'oceania': { display: 'Oceania', flag: '🇦🇺' },
            'middle-east': { display: 'Middle East', flag: '🕌' }
        };
    }

    /**
     * Get user preferences, creating defaults if none exist
     */
    async getUserPreferences(userId) {
        try {
            if (!this.userDb) {
                throw new Error('User database not available');
            }

            const user = await this.userDb.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // If user has no preferences, create defaults based on their profile
            if (!user.preferences) {
                const defaultPrefs = await this.createDefaultPreferences(user);
                await this.updateUserPreferences(userId, defaultPrefs);
                return defaultPrefs;
            }

            // Merge with defaults to ensure all properties exist
            return {
                ...this.defaultPreferences,
                ...user.preferences
            };

        } catch (error) {
            console.error('Error getting user preferences:', error);
            return this.defaultPreferences;
        }
    }

    /**
     * Update user preferences
     */
    async updateUserPreferences(userId, preferences) {
        try {
            if (!this.userDb) {
                throw new Error('User database not available');
            }

            // Validate preferences
            const validatedPreferences = this.validatePreferences(preferences);

            // Update in database
            await this.userDb.updateUserPreferences(userId, validatedPreferences);

            // Log the update
            await this.userDb.recordUserInteraction(userId, 'preferences_updated', {
                updated_fields: Object.keys(preferences),
                timestamp: new Date().toISOString()
            });

            return validatedPreferences;

        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw error;
        }
    }

    /**
     * Create default preferences based on user profile and behavior
     */
    async createDefaultPreferences(user) {
        const preferences = { ...this.defaultPreferences };

        try {
            // Analyze user's reading history for personalized defaults
            const interactions = await this.userDb.getUserInteractions(user.id);
            
            if (interactions && interactions.length > 0) {
                // Extract preferred categories from reading history
                const categoryFreq = {};
                const keywordFreq = {};

                interactions.forEach(interaction => {
                    if (interaction.action_type === 'article_view' && interaction.metadata) {
                        const meta = JSON.parse(interaction.metadata);
                        if (meta.category) {
                            categoryFreq[meta.category] = (categoryFreq[meta.category] || 0) + 1;
                        }
                        if (meta.keywords) {
                            meta.keywords.forEach(keyword => {
                                keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
                            });
                        }
                    }
                });

                // Set top categories as preferences
                const topCategories = Object.entries(categoryFreq)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category]) => category);

                if (topCategories.length > 0) {
                    preferences.categories = topCategories;
                }

                // Set top keywords as interests
                const topKeywords = Object.entries(keywordFreq)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([keyword]) => keyword);

                if (topKeywords.length > 0) {
                    preferences.keywords = topKeywords;
                }
            }

            // Set location-based preferences if available
            if (user.location_data) {
                const locationData = JSON.parse(user.location_data);
                if (locationData.newsRegion && locationData.newsRegion !== 'global') {
                    preferences.regions = [locationData.newsRegion, 'global'];
                }
                if (locationData.preferredCategories) {
                    preferences.categories = [
                        ...new Set([...preferences.categories, ...locationData.preferredCategories])
                    ].slice(0, 5);
                }
            }

        } catch (error) {
            console.warn('Error creating personalized defaults:', error);
        }

        return preferences;
    }

    /**
     * Validate and sanitize preferences
     */
    validatePreferences(preferences) {
        const validated = {};

        // Validate categories
        if (Array.isArray(preferences.categories)) {
            validated.categories = preferences.categories
                .filter(cat => typeof cat === 'string' && cat.length > 0)
                .slice(0, 10); // Limit to 10 categories
        } else {
            validated.categories = this.defaultPreferences.categories;
        }

        // Validate regions
        if (Array.isArray(preferences.regions)) {
            validated.regions = preferences.regions
                .filter(region => typeof region === 'string' && region.length > 0)
                .slice(0, 5); // Limit to 5 regions
        } else {
            validated.regions = this.defaultPreferences.regions;
        }

        // Validate languages
        if (Array.isArray(preferences.languages)) {
            validated.languages = preferences.languages
                .filter(lang => typeof lang === 'string' && lang.length === 2)
                .slice(0, 3); // Limit to 3 languages
        } else {
            validated.languages = this.defaultPreferences.languages;
        }

        // Validate keywords
        if (Array.isArray(preferences.keywords)) {
            validated.keywords = preferences.keywords
                .filter(keyword => typeof keyword === 'string' && keyword.length > 0)
                .slice(0, 20); // Limit to 20 keywords
        } else {
            validated.keywords = preferences.keywords || [];
        }

        // Validate exclude keywords
        if (Array.isArray(preferences.excludeKeywords)) {
            validated.excludeKeywords = preferences.excludeKeywords
                .filter(keyword => typeof keyword === 'string' && keyword.length > 0)
                .slice(0, 20);
        } else {
            validated.excludeKeywords = preferences.excludeKeywords || [];
        }

        // Validate sources
        if (Array.isArray(preferences.sources)) {
            validated.sources = preferences.sources
                .filter(source => typeof source === 'string' && source.length > 0)
                .slice(0, 20);
        } else {
            validated.sources = preferences.sources || [];
        }

        // Validate numeric values
        validated.maxAge = Math.max(1, Math.min(168, Number(preferences.maxAge) || 24)); // 1 hour to 1 week
        validated.itemsPerPage = Math.max(5, Math.min(100, Number(preferences.itemsPerPage) || 20));
        validated.refreshInterval = Math.max(60000, Number(preferences.refreshInterval) || 300000); // Min 1 minute

        // Validate string values
        const validSortBy = ['relevance', 'date', 'popularity'];
        validated.sortBy = validSortBy.includes(preferences.sortBy) ? preferences.sortBy : 'relevance';

        const validSentiment = [null, 'positive', 'negative', 'neutral', 'urgent'];
        validated.sentiment = validSentiment.includes(preferences.sentiment) ? preferences.sentiment : null;

        // Validate boolean values
        validated.autoRefresh = Boolean(preferences.autoRefresh);
        validated.breakingNewsAlerts = Boolean(preferences.breakingNewsAlerts);
        validated.emailDigest = Boolean(preferences.emailDigest);
        validated.pushNotifications = Boolean(preferences.pushNotifications);
        validated.locationBased = Boolean(preferences.locationBased);
        validated.personalizedFeed = Boolean(preferences.personalizedFeed);

        // Validate arrays
        validated.savedSearches = Array.isArray(preferences.savedSearches) ? 
            preferences.savedSearches.slice(0, 10) : [];
        validated.blockedDomains = Array.isArray(preferences.blockedDomains) ? 
            preferences.blockedDomains.slice(0, 50) : [];
        validated.preferredSources = Array.isArray(preferences.preferredSources) ? 
            preferences.preferredSources.slice(0, 20) : [];

        return validated;
    }

    /**
     * Get preference recommendations based on user behavior
     */
    async getPreferenceRecommendations(userId) {
        try {
            const interactions = await this.userDb.getUserInteractions(userId, 100); // Last 100 interactions
            const recommendations = {
                categories: [],
                keywords: [],
                sources: [],
                regions: []
            };

            if (!interactions || interactions.length === 0) {
                return recommendations;
            }

            const categoryFreq = {};
            const keywordFreq = {};
            const sourceFreq = {};
            const regionFreq = {};

            // Analyze user behavior
            interactions.forEach(interaction => {
                try {
                    const metadata = JSON.parse(interaction.metadata || '{}');
                    
                    if (metadata.category) {
                        categoryFreq[metadata.category] = (categoryFreq[metadata.category] || 0) + 1;
                    }
                    if (metadata.source) {
                        sourceFreq[metadata.source] = (sourceFreq[metadata.source] || 0) + 1;
                    }
                    if (metadata.region) {
                        regionFreq[metadata.region] = (regionFreq[metadata.region] || 0) + 1;
                    }
                    if (metadata.keywords && Array.isArray(metadata.keywords)) {
                        metadata.keywords.forEach(keyword => {
                            keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
                        });
                    }
                } catch (error) {
                    // Skip malformed metadata
                }
            });

            // Generate recommendations
            recommendations.categories = Object.entries(categoryFreq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([category, count]) => ({ category, count }));

            recommendations.keywords = Object.entries(keywordFreq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15)
                .map(([keyword, count]) => ({ keyword, count }));

            recommendations.sources = Object.entries(sourceFreq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([source, count]) => ({ source, count }));

            recommendations.regions = Object.entries(regionFreq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([region, count]) => ({ region, count }));

            return recommendations;

        } catch (error) {
            console.error('Error generating preference recommendations:', error);
            return { categories: [], keywords: [], sources: [], regions: [] };
        }
    }

    /**
     * Export user preferences for backup or transfer
     */
    async exportUserPreferences(userId) {
        try {
            const preferences = await this.getUserPreferences(userId);
            const user = await this.userDb.getUserById(userId);
            
            return {
                user_id: userId,
                username: user.username,
                exported_at: new Date().toISOString(),
                preferences: preferences,
                version: '1.0'
            };

        } catch (error) {
            console.error('Error exporting preferences:', error);
            throw error;
        }
    }

    /**
     * Import user preferences from backup
     */
    async importUserPreferences(userId, importData) {
        try {
            if (!importData.preferences) {
                throw new Error('Invalid import data: missing preferences');
            }

            const validatedPreferences = this.validatePreferences(importData.preferences);
            await this.updateUserPreferences(userId, validatedPreferences);

            // Log the import
            await this.userDb.recordUserInteraction(userId, 'preferences_imported', {
                imported_from: importData.exported_at || 'unknown',
                preferences_count: Object.keys(validatedPreferences).length
            });

            return validatedPreferences;

        } catch (error) {
            console.error('Error importing preferences:', error);
            throw error;
        }
    }

    /**
     * Reset user preferences to defaults
     */
    async resetUserPreferences(userId) {
        try {
            const user = await this.userDb.getUserById(userId);
            const defaultPrefs = await this.createDefaultPreferences(user);
            
            await this.updateUserPreferences(userId, defaultPrefs);
            
            return defaultPrefs;

        } catch (error) {
            console.error('Error resetting preferences:', error);
            throw error;
        }
    }

    /**
     * Get available options for preferences UI
     */
    getAvailableOptions() {
        return {
            categories: this.categoryMappings,
            regions: this.regionMappings,
            languages: {
                'en': { display: 'English', flag: '🇺🇸' },
                'es': { display: 'Spanish', flag: '🇪🇸' },
                'fr': { display: 'French', flag: '🇫🇷' },
                'de': { display: 'German', flag: '🇩🇪' },
                'it': { display: 'Italian', flag: '🇮🇹' },
                'pt': { display: 'Portuguese', flag: '🇵🇹' },
                'ru': { display: 'Russian', flag: '🇷🇺' },
                'ja': { display: 'Japanese', flag: '🇯🇵' },
                'ko': { display: 'Korean', flag: '🇰🇷' },
                'zh': { display: 'Chinese', flag: '🇨🇳' },
                'ar': { display: 'Arabic', flag: '🇸🇦' },
                'hi': { display: 'Hindi', flag: '🇮🇳' }
            },
            sortOptions: [
                { value: 'relevance', display: 'Most Relevant' },
                { value: 'date', display: 'Most Recent' },
                { value: 'popularity', display: 'Most Popular' }
            ],
            sentimentOptions: [
                { value: null, display: 'All Sentiments' },
                { value: 'positive', display: 'Positive News' },
                { value: 'negative', display: 'Critical News' },
                { value: 'neutral', display: 'Neutral News' },
                { value: 'urgent', display: 'Breaking News' }
            ],
            refreshIntervals: [
                { value: 60000, display: '1 minute' },
                { value: 300000, display: '5 minutes' },
                { value: 600000, display: '10 minutes' },
                { value: 1800000, display: '30 minutes' },
                { value: 3600000, display: '1 hour' }
            ]
        };
    }
}

module.exports = NewsPreferencesService;
