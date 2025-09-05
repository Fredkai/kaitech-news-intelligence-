const axios = require('axios');
const cheerio = require('cheerio');
const Redis = require('redis');
const { Pool } = require('pg');
const cron = require('node-cron');

// News sources configuration
const NEWS_SOURCES = [
    {
        name: 'BBC News',
        url: 'https://feeds.bbci.co.uk/news/rss.xml',
        type: 'rss',
        category: 'world'
    },
    {
        name: 'Reuters',
        url: 'https://www.reuters.com/arc/outboundfeeds/rss/category/world/',
        type: 'rss',
        category: 'world'
    },
    {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        type: 'rss',
        category: 'technology'
    },
    {
        name: 'CNN Business',
        url: 'http://rss.cnn.com/rss/money_latest.rss',
        type: 'rss',
        category: 'business'
    },
    {
        name: 'ESPN',
        url: 'https://www.espn.com/espn/rss/news',
        type: 'rss',
        category: 'sports'
    },
    {
        name: 'Gaming News',
        url: 'https://www.gamespot.com/feeds/news/',
        type: 'rss',
        category: 'gaming'
    }
];

// Breaking news keywords
const BREAKING_KEYWORDS = [
    'breaking', 'urgent', 'alert', 'developing', 'just in',
    'exclusive', 'first', 'confirmed', 'official', 'announced'
];

class NewsCrawler {
    constructor() {
        this.redis = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://newsuser:newspass@localhost:5432/newsdb'
        });
        
        this.crawlInterval = parseInt(process.env.CRAWL_INTERVAL) || 60000; // 1 minute default
    }

    async initialize() {
        try {
            await this.redis.connect();
            console.log('Connected to Redis');
            
            await this.pool.connect();
            console.log('Connected to PostgreSQL');
            
            // Start crawling
            this.startCrawling();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    startCrawling() {
        console.log(`Starting news crawler with ${this.crawlInterval}ms interval`);
        
        // Initial crawl
        this.crawlAllSources();
        
        // Schedule regular crawling every minute
        cron.schedule('* * * * *', () => {
            this.crawlAllSources();
        });
        
        // Schedule intensive crawling every 5 minutes for breaking news
        cron.schedule('*/5 * * * *', () => {
            this.crawlBreakingNews();
        });
    }

    async crawlAllSources() {
        console.log('Starting crawl of all news sources...');
        
        const crawlPromises = NEWS_SOURCES.map(source => 
            this.crawlSource(source).catch(error => {
                console.error(`Error crawling ${source.name}:`, error);
                return null;
            })
        );
        
        const results = await Promise.allSettled(crawlPromises);
        const successfulCrawls = results.filter(result => result.status === 'fulfilled').length;
        
        console.log(`Crawl completed: ${successfulCrawls}/${NEWS_SOURCES.length} sources successful`);
    }

    async crawlSource(source) {
        try {
            const response = await axios.get(source.url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Voice-of-Time-News-Crawler/1.0'
                }
            });

            if (source.type === 'rss') {
                return await this.parseRSSFeed(response.data, source);
            } else {
                return await this.parseHTMLPage(response.data, source);
            }
        } catch (error) {
            console.error(`Error crawling ${source.name}:`, error.message);
            throw error;
        }
    }

    async parseRSSFeed(xmlData, source) {
        const $ = cheerio.load(xmlData, { xmlMode: true });
        const articles = [];

        $('item').each((index, element) => {
            const $item = $(element);
            const title = $item.find('title').text().trim();
            const link = $item.find('link').text().trim();
            const description = $item.find('description').text().trim();
            const pubDate = $item.find('pubDate').text().trim();
            const category = $item.find('category').text().trim() || source.category;

            if (title && link) {
                articles.push({
                    title,
                    url: link,
                    content: description,
                    published_at: new Date(pubDate || Date.now()),
                    source: source.name,
                    category: this.normalizeCategory(category),
                    is_breaking: this.isBreakingNews(title, description),
                    sentiment: this.analyzeSentiment(title, description),
                    engagement_score: this.calculateEngagementScore(title, description),
                    freshness_score: this.calculateFreshnessScore(new Date(pubDate || Date.now()))
                });
            }
        });

        // Store articles in database
        if (articles.length > 0) {
            await this.storeArticles(articles);
            console.log(`Crawled ${articles.length} articles from ${source.name}`);
        }

        return articles;
    }

    async parseHTMLPage(htmlData, source) {
        const $ = cheerio.load(htmlData);
        const articles = [];

        // Generic selectors for common HTML structures
        const selectors = [
            'article h2 a, article h3 a',
            '.news-item h2 a, .news-item h3 a',
            '.story-headline a',
            'h2.headline a, h3.headline a'
        ];

        for (const selector of selectors) {
            $(selector).each((index, element) => {
                const $link = $(element);
                const title = $link.text().trim();
                const url = $link.attr('href');
                
                if (title && url) {
                    const fullUrl = url.startsWith('http') ? url : new URL(url, source.url).href;
                    
                    articles.push({
                        title,
                        url: fullUrl,
                        content: '',
                        published_at: new Date(),
                        source: source.name,
                        category: source.category,
                        is_breaking: this.isBreakingNews(title, ''),
                        sentiment: this.analyzeSentiment(title, ''),
                        engagement_score: this.calculateEngagementScore(title, ''),
                        freshness_score: 1.0
                    });
                }
            });

            if (articles.length > 0) break;
        }

        // Store articles if found
        if (articles.length > 0) {
            await this.storeArticles(articles);
            console.log(`Crawled ${articles.length} articles from ${source.name}`);
        }

        return articles;
    }

    async crawlBreakingNews() {
        console.log('Intensive crawl for breaking news...');
        
        // Add premium news sources for breaking news
        const breakingNewsSources = [
            'https://feeds.bbci.co.uk/news/world/rss.xml',
            'https://www.reuters.com/arc/outboundfeeds/rss/category/breakingviews/',
            'https://rss.cnn.com/rss/edition.rss'
        ];

        for (const sourceUrl of breakingNewsSources) {
            try {
                const response = await axios.get(sourceUrl, {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Voice-of-Time-News-Crawler/1.0'
                    }
                });

                const $ = cheerio.load(response.data, { xmlMode: true });
                const breakingArticles = [];

                $('item').each((index, element) => {
                    const $item = $(element);
                    const title = $item.find('title').text().trim();
                    const link = $item.find('link').text().trim();
                    const description = $item.find('description').text().trim();

                    if (this.isBreakingNews(title, description)) {
                        breakingArticles.push({
                            title,
                            url: link,
                            content: description,
                            published_at: new Date(),
                            source: 'Breaking News Feed',
                            category: 'breaking',
                            is_breaking: true,
                            sentiment: this.analyzeSentiment(title, description),
                            engagement_score: 0.9, // High engagement for breaking news
                            freshness_score: 1.0
                        });
                    }
                });

                if (breakingArticles.length > 0) {
                    await this.storeArticles(breakingArticles);
                    console.log(`Found ${breakingArticles.length} breaking news articles`);
                    
                    // Notify real-time service about breaking news
                    await this.notifyBreakingNews(breakingArticles);
                }
            } catch (error) {
                console.error(`Error crawling breaking news from ${sourceUrl}:`, error.message);
            }
        }
    }

    isBreakingNews(title, content) {
        const text = (title + ' ' + content).toLowerCase();
        return BREAKING_KEYWORDS.some(keyword => text.includes(keyword));
    }

    analyzeSentiment(title, content) {
        const text = (title + ' ' + content).toLowerCase();
        
        const positiveWords = ['good', 'great', 'success', 'win', 'positive', 'growth', 'increase', 'breakthrough'];
        const negativeWords = ['bad', 'crisis', 'fail', 'crash', 'decline', 'war', 'conflict', 'disaster'];
        
        let positiveScore = 0;
        let negativeScore = 0;
        
        positiveWords.forEach(word => {
            if (text.includes(word)) positiveScore++;
        });
        
        negativeWords.forEach(word => {
            if (text.includes(word)) negativeScore++;
        });
        
        if (positiveScore > negativeScore) return 'positive';
        if (negativeScore > positiveScore) return 'negative';
        return 'neutral';
    }

    calculateEngagementScore(title, content) {
        let score = 0.5; // Base score
        
        // Boost for breaking news indicators
        if (this.isBreakingNews(title, content)) score += 0.3;
        
        // Boost for numbers and statistics
        if (/\d+/.test(title)) score += 0.1;
        
        // Boost for question marks (engaging headlines)
        if (title.includes('?')) score += 0.1;
        
        return Math.min(score, 1.0);
    }

    calculateFreshnessScore(publishedDate) {
        const now = new Date();
        const ageInHours = (now - publishedDate) / (1000 * 60 * 60);
        
        if (ageInHours < 1) return 1.0;
        if (ageInHours < 6) return 0.8;
        if (ageInHours < 24) return 0.6;
        if (ageInHours < 72) return 0.4;
        return 0.2;
    }

    normalizeCategory(category) {
        const categoryMap = {
            'tech': 'technology',
            'gaming': 'games',
            'esports': 'games',
            'finance': 'business',
            'economy': 'business',
            'sports': 'sports',
            'entertainment': 'culture',
            'health': 'health',
            'science': 'technology',
            'politics': 'politics',
            'world': 'world'
        };
        
        return categoryMap[category.toLowerCase()] || 'world';
    }

    async storeArticles(articles) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            for (const article of articles) {
                // Check if article already exists
                const existingArticle = await client.query(
                    'SELECT id FROM news_articles WHERE url = $1',
                    [article.url]
                );
                
                if (existingArticle.rows.length === 0) {
                    await client.query(`
                        INSERT INTO news_articles (
                            title, url, content, published_at, source, category,
                            is_breaking, sentiment, engagement_score, freshness_score
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    `, [
                        article.title,
                        article.url,
                        article.content,
                        article.published_at,
                        article.source,
                        article.category,
                        article.is_breaking,
                        article.sentiment,
                        article.engagement_score,
                        article.freshness_score
                    ]);
                }
            }
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error storing articles:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async notifyBreakingNews(articles) {
        try {
            // Store breaking news in Redis for immediate access
            const breakingNewsKey = 'breaking-news-alerts';
            
            for (const article of articles) {
                await this.redis.lpush(breakingNewsKey, JSON.stringify({
                    ...article,
                    timestamp: new Date().toISOString()
                }));
            }
            
            // Keep only the latest 20 breaking news items
            await this.redis.ltrim(breakingNewsKey, 0, 19);
            
            console.log(`Notified about ${articles.length} breaking news articles`);
        } catch (error) {
            console.error('Error notifying breaking news:', error);
        }
    }
}

// Initialize and start crawler
const crawler = new NewsCrawler();
crawler.initialize();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down news crawler...');
    await crawler.redis.disconnect();
    await crawler.pool.end();
    process.exit(0);
});
