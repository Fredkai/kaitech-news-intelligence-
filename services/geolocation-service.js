// KaiTech Voice of Time - Geolocation Service
// Provides location-based news filtering and regional detection

const axios = require('axios');

class GeolocationService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 3600000; // 1 hour for geolocation data
        
        // IP to location service (using multiple fallbacks)
        this.ipServiceURLs = [
            'http://ip-api.com/json/',
            'https://ipapi.co/json/',
            'https://freegeoip.app/json/'
        ];
        
        // Country to region mapping for news filtering
        this.countryToRegion = {
            // North America
            'US': 'north-america', 'CA': 'north-america', 'MX': 'north-america',
            
            // Europe
            'GB': 'europe', 'DE': 'europe', 'FR': 'europe', 'IT': 'europe', 
            'ES': 'europe', 'NL': 'europe', 'RU': 'europe', 'PL': 'europe',
            'UA': 'europe', 'RO': 'europe', 'CZ': 'europe', 'GR': 'europe',
            'PT': 'europe', 'BE': 'europe', 'HU': 'europe', 'SE': 'europe',
            'NO': 'europe', 'DK': 'europe', 'FI': 'europe', 'IE': 'europe',
            'AT': 'europe', 'CH': 'europe', 'BG': 'europe', 'SK': 'europe',
            'HR': 'europe', 'SI': 'europe', 'LT': 'europe', 'LV': 'europe',
            'EE': 'europe', 'LU': 'europe', 'MT': 'europe', 'CY': 'europe',
            
            // Asia
            'JP': 'asia', 'KR': 'asia', 'CN': 'asia', 'IN': 'asia',
            'SG': 'asia', 'TH': 'asia', 'ID': 'asia', 'MY': 'asia',
            'PH': 'asia', 'VN': 'asia', 'TW': 'asia', 'HK': 'asia',
            'BD': 'asia', 'PK': 'asia', 'LK': 'asia', 'MM': 'asia',
            'KH': 'asia', 'LA': 'asia', 'MN': 'asia', 'KZ': 'asia',
            'UZ': 'asia', 'KG': 'asia', 'TJ': 'asia', 'TM': 'asia',
            'AF': 'asia', 'NP': 'asia', 'BT': 'asia', 'MV': 'asia',
            
            // Middle East
            'AE': 'middle-east', 'SA': 'middle-east', 'QA': 'middle-east',
            'KW': 'middle-east', 'BH': 'middle-east', 'OM': 'middle-east',
            'TR': 'middle-east', 'IL': 'middle-east', 'JO': 'middle-east',
            'LB': 'middle-east', 'SY': 'middle-east', 'IQ': 'middle-east',
            'IR': 'middle-east', 'YE': 'middle-east',
            
            // Africa
            'ZA': 'africa', 'EG': 'africa', 'NG': 'africa', 'KE': 'africa',
            'ET': 'africa', 'UG': 'africa', 'TZ': 'africa', 'DZ': 'africa',
            'MA': 'africa', 'AO': 'africa', 'MZ': 'africa', 'MG': 'africa',
            'CM': 'africa', 'CI': 'africa', 'NE': 'africa', 'BF': 'africa',
            'ML': 'africa', 'MW': 'africa', 'ZM': 'africa', 'SN': 'africa',
            'SO': 'africa', 'TD': 'africa', 'SL': 'africa', 'TG': 'africa',
            'CF': 'africa', 'LR': 'africa', 'MR': 'africa', 'NA': 'africa',
            'BW': 'africa', 'GA': 'africa', 'LS': 'africa', 'GW': 'africa',
            'GQ': 'africa', 'MU': 'africa', 'SZ': 'africa', 'DJ': 'africa',
            'RW': 'africa', 'BI': 'africa', 'GM': 'africa', 'CV': 'africa',
            'ST': 'africa', 'SC': 'africa', 'KM': 'africa',
            
            // South America
            'BR': 'south-america', 'AR': 'south-america', 'CL': 'south-america',
            'CO': 'south-america', 'PE': 'south-america', 'VE': 'south-america',
            'EC': 'south-america', 'BO': 'south-america', 'PY': 'south-america',
            'UY': 'south-america', 'GY': 'south-america', 'SR': 'south-america',
            'GF': 'south-america',
            
            // Oceania
            'AU': 'oceania', 'NZ': 'oceania', 'FJ': 'oceania', 'PG': 'oceania',
            'NC': 'oceania', 'SB': 'oceania', 'VU': 'oceania', 'WS': 'oceania',
            'KI': 'oceania', 'TO': 'oceania', 'MH': 'oceania', 'PW': 'oceania',
            'NR': 'oceania', 'TV': 'oceania', 'FM': 'oceania'
        };
        
        // Region preferences for news categories
        this.regionNewsPreferences = {
            'north-america': ['technology', 'business', 'sports', 'entertainment'],
            'europe': ['business', 'politics', 'technology', 'sports'],
            'asia': ['technology', 'business', 'science', 'health'],
            'middle-east': ['business', 'politics', 'general', 'sports'],
            'africa': ['general', 'business', 'health', 'sports'],
            'south-america': ['sports', 'business', 'general', 'entertainment'],
            'oceania': ['sports', 'business', 'technology', 'general']
        };
        
        // Timezone to region mapping
        this.timezoneRegions = {
            'America': 'north-america',
            'Europe': 'europe', 
            'Asia': 'asia',
            'Africa': 'africa',
            'Australia': 'oceania',
            'Pacific': 'oceania'
        };
    }

    /**
     * Get user's geolocation from IP address
     */
    async getLocationFromIP(ipAddress = null) {
        const cacheKey = `ip_location_${ipAddress || 'auto'}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        for (const serviceURL of this.ipServiceURLs) {
            try {
                const url = ipAddress ? `${serviceURL}${ipAddress}` : serviceURL;
                const response = await axios.get(url, { timeout: 5000 });
                
                const locationData = {
                    country: response.data.country || response.data.country_name,
                    countryCode: response.data.countryCode || response.data.country_code,
                    region: response.data.regionName || response.data.region,
                    city: response.data.city,
                    lat: response.data.lat || response.data.latitude,
                    lon: response.data.lon || response.data.longitude,
                    timezone: response.data.timezone,
                    isp: response.data.isp,
                    source: serviceURL
                };

                // Add regional mapping
                locationData.newsRegion = this.getNewsRegion(locationData.countryCode);
                locationData.preferredCategories = this.getPreferredCategories(locationData.newsRegion);

                this.setCache(cacheKey, locationData);
                return locationData;

            } catch (error) {
                console.warn(`Failed to get location from ${serviceURL}:`, error.message);
                continue;
            }
        }

        // Fallback to timezone detection
        return this.getLocationFromTimezone();
    }

    /**
     * Get location from browser's timezone
     */
    getLocationFromTimezone() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const parts = timezone.split('/');
            const continent = parts[0];
            
            const locationData = {
                timezone: timezone,
                newsRegion: this.timezoneRegions[continent] || 'global',
                source: 'timezone-fallback'
            };

            locationData.preferredCategories = this.getPreferredCategories(locationData.newsRegion);
            return locationData;

        } catch (error) {
            return {
                newsRegion: 'global',
                preferredCategories: ['general', 'technology', 'business', 'sports'],
                source: 'default-fallback'
            };
        }
    }

    /**
     * Get news region from country code
     */
    getNewsRegion(countryCode) {
        if (!countryCode) return 'global';
        return this.countryToRegion[countryCode.toUpperCase()] || 'global';
    }

    /**
     * Get preferred news categories for a region
     */
    getPreferredCategories(region) {
        return this.regionNewsPreferences[region] || ['general', 'technology', 'business', 'sports'];
    }

    /**
     * Filter news articles by user's location preferences
     */
    filterNewsByLocation(articles, userLocation, preferences = {}) {
        if (!articles || !Array.isArray(articles)) return [];
        if (!userLocation || userLocation.newsRegion === 'global') return articles;

        const {
            prioritizeLocal = true,
            includeGlobal = true,
            categoryPreference = 'auto'
        } = preferences;

        let filteredArticles = [...articles];

        // Apply regional relevance scoring
        filteredArticles = filteredArticles.map(article => {
            let relevanceScore = 0;
            const content = (article.title + ' ' + (article.description || '')).toLowerCase();
            
            // Check for local mentions
            if (userLocation.country && content.includes(userLocation.country.toLowerCase())) {
                relevanceScore += 50;
            }
            if (userLocation.city && content.includes(userLocation.city.toLowerCase())) {
                relevanceScore += 30;
            }
            if (userLocation.region && content.includes(userLocation.region.toLowerCase())) {
                relevanceScore += 20;
            }

            // Check for regional keywords
            const regionKeywords = this.getRegionalKeywords(userLocation.newsRegion);
            regionKeywords.forEach(keyword => {
                if (content.includes(keyword.toLowerCase())) {
                    relevanceScore += 10;
                }
            });

            // Category preference scoring
            if (categoryPreference === 'auto' && userLocation.preferredCategories) {
                if (userLocation.preferredCategories.includes(article.category)) {
                    relevanceScore += 15;
                }
            }

            return {
                ...article,
                locationRelevance: relevanceScore,
                localNews: relevanceScore > 20
            };
        });

        // Sort by relevance if prioritizing local news
        if (prioritizeLocal) {
            filteredArticles.sort((a, b) => {
                // First sort by local relevance
                if (a.locationRelevance !== b.locationRelevance) {
                    return b.locationRelevance - a.locationRelevance;
                }
                // Then by publication date
                return new Date(b.publishedAt) - new Date(a.publishedAt);
            });
        }

        return filteredArticles;
    }

    /**
     * Get regional keywords for content filtering
     */
    getRegionalKeywords(region) {
        const keywords = {
            'north-america': ['america', 'usa', 'canada', 'mexico', 'nafta', 'usmca', 'silicon valley', 'wall street'],
            'europe': ['europe', 'eu', 'brexit', 'euro', 'schengen', 'nato', 'european union'],
            'asia': ['asia', 'asian', 'apac', 'asean', 'pacific rim', 'far east'],
            'middle-east': ['middle east', 'gulf', 'opec', 'persian gulf', 'arab'],
            'africa': ['africa', 'african', 'sahara', 'subsaharan', 'maghreb'],
            'south-america': ['south america', 'latin america', 'amazon', 'andes', 'mercosur'],
            'oceania': ['oceania', 'pacific', 'anzac', 'melanesia', 'polynesia']
        };
        
        return keywords[region] || [];
    }

    /**
     * Get location-based news recommendations
     */
    async getLocationBasedRecommendations(userLocation) {
        if (!userLocation || !userLocation.newsRegion) {
            return {
                categories: ['general', 'technology', 'business', 'sports'],
                keywords: [],
                regions: ['global'],
                languages: ['en']
            };
        }

        const recommendations = {
            categories: this.getPreferredCategories(userLocation.newsRegion),
            keywords: this.getRegionalKeywords(userLocation.newsRegion),
            regions: [userLocation.newsRegion],
            languages: this.getRegionalLanguages(userLocation.countryCode),
            timezone: userLocation.timezone,
            localSources: this.getLocalNewsSources(userLocation.countryCode)
        };

        // Add broader regional coverage
        if (userLocation.newsRegion !== 'global') {
            recommendations.regions.push('global'); // Always include global news
        }

        return recommendations;
    }

    /**
     * Get regional languages
     */
    getRegionalLanguages(countryCode) {
        const languageMap = {
            'US': ['en'], 'CA': ['en', 'fr'], 'MX': ['es'],
            'GB': ['en'], 'DE': ['de'], 'FR': ['fr'], 'IT': ['it'], 'ES': ['es'],
            'JP': ['ja'], 'KR': ['ko'], 'CN': ['zh'], 'IN': ['en', 'hi'],
            'BR': ['pt'], 'RU': ['ru'], 'AE': ['ar', 'en']
        };
        
        return languageMap[countryCode] || ['en'];
    }

    /**
     * Get local news sources for a country
     */
    getLocalNewsSources(countryCode) {
        const sourceMap = {
            'US': ['cnn', 'fox-news', 'nbc-news', 'abc-news', 'cbs-news'],
            'GB': ['bbc-news', 'the-guardian', 'daily-mail', 'telegraph'],
            'DE': ['spiegel-online', 'zeit-online', 'bild'],
            'FR': ['le-monde', 'le-figaro', 'liberation'],
            'JP': ['nikkei', 'asahi-shimbun'],
            'KR': ['yonhap-news'],
            'CN': ['xinhua', 'china-daily'],
            'IN': ['times-of-india', 'hindustan-times'],
            'AU': ['abc-news-au', 'news-com-au'],
            'CA': ['cbc-news', 'global-news-ca']
        };
        
        return sourceMap[countryCode] || [];
    }

    /**
     * Validate coordinates
     */
    isValidCoordinates(lat, lon) {
        return typeof lat === 'number' && typeof lon === 'number' &&
               lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }

    /**
     * Cache management
     */
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

    /**
     * Clear location cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get supported regions
     */
    getSupportedRegions() {
        return Object.keys(this.regionNewsPreferences);
    }

    /**
     * Get country to region mappings
     */
    getCountryRegionMap() {
        return this.countryToRegion;
    }
}

module.exports = GeolocationService;
