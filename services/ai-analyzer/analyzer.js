const express = require('express');
const Redis = require('redis');
const { Pool } = require('pg');
const cron = require('node-cron');
const natural = require('natural');

const app = express();
app.use(express.json());

// AI Analysis Configuration
const SENTIMENT_ANALYZER = new natural.SentimentAnalyzer('English', 
    natural.PorterStemmer, 'afinn');
const TOKENIZER = new natural.WordTokenizer();
const TF_IDF = new natural.TfIdf();

// Topic classification keywords
const TOPIC_KEYWORDS = {
    technology: ['tech', 'ai', 'artificial intelligence', 'machine learning', 'blockchain', 'cryptocurrency', 'software', 'internet', 'digital', 'innovation', 'startup'],
    business: ['economy', 'finance', 'market', 'stock', 'investment', 'company', 'earnings', 'revenue', 'profit', 'merger', 'acquisition', 'trade'],
    politics: ['government', 'election', 'president', 'congress', 'senate', 'policy', 'law', 'legislation', 'democrat', 'republican', 'voting'],
    sports: ['game', 'match', 'championship', 'tournament', 'player', 'team', 'score', 'win', 'loss', 'olympics', 'football', 'basketball'],
    health: ['health', 'medical', 'disease', 'treatment', 'hospital', 'doctor', 'vaccine', 'medicine', 'wellness', 'fitness', 'covid'],
    entertainment: ['movie', 'film', 'music', 'celebrity', 'actor', 'singer', 'concert', 'album', 'tv show', 'streaming', 'hollywood'],
    games: ['gaming', 'esports', 'video game', 'console', 'pc gaming', 'mobile game', 'tournament', 'streamer', 'twitch', 'steam'],
    science: ['research', 'study', 'discovery', 'space', 'climate', 'environment', 'scientist', 'experiment', 'breakthrough', 'nasa']
};

class AIAnalyzer {
    constructor() {
        this.redis = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://newsuser:newspass@localhost:5432/newsdb'
        });

        this.port = process.env.PORT || 3003;
    }

    async initialize() {
        try {
            await this.redis.connect();
            console.log('AI Analyzer connected to Redis');
            
            await this.pool.connect();
            console.log('AI Analyzer connected to PostgreSQL');

            this.setupRoutes();
            this.startScheduledAnalysis();
            
            app.listen(this.port, () => {
                console.log(`AI Analyzer service running on port ${this.port}`);
            });
        } catch (error) {
            console.error('AI Analyzer initialization error:', error);
        }
    }

    setupRoutes() {
        // Health check
        app.get('/health', (req, res) => {
            res.json({ status: 'healthy', service: 'ai-analyzer' });
        });

        // Get AI insights for articles
        app.get('/insights/:category?', async (req, res) => {
            try {
                const { category } = req.params;
                const { limit = 20, timeframe = '24h' } = req.query;

                const insights = await this.generateInsights(category, limit, timeframe);
                res.json(insights);
            } catch (error) {
                console.error('Error generating insights:', error);
                res.status(500).json({ error: 'Failed to generate insights' });
            }
        });

        // Get trending topics
        app.get('/trending', async (req, res) => {
            try {
                const { period = '24h' } = req.query;
                const trending = await this.getTrendingTopics(period);
                res.json(trending);
            } catch (error) {
                console.error('Error getting trending topics:', error);
                res.status(500).json({ error: 'Failed to get trending topics' });
            }
        });

        // Get sentiment analysis
        app.get('/sentiment/:category?', async (req, res) => {
            try {
                const { category } = req.params;
                const sentiment = await this.getSentimentAnalysis(category);
                res.json(sentiment);
            } catch (error) {
                console.error('Error getting sentiment analysis:', error);
                res.status(500).json({ error: 'Failed to get sentiment analysis' });
            }
        });

        // Analyze specific article
        app.post('/analyze', async (req, res) => {
            try {
                const { title, content } = req.body;
                if (!title && !content) {
                    return res.status(400).json({ error: 'Title or content required' });
                }

                const analysis = await this.analyzeArticle(title, content);
                res.json(analysis);
            } catch (error) {
                console.error('Error analyzing article:', error);
                res.status(500).json({ error: 'Failed to analyze article' });
            }
        });

        // Get breaking news predictions
        app.get('/breaking-predictions', async (req, res) => {
            try {
                const predictions = await this.getBreakingNewsPredictions();
                res.json(predictions);
            } catch (error) {
                console.error('Error getting breaking news predictions:', error);
                res.status(500).json({ error: 'Failed to get predictions' });
            }
        });
    }

    startScheduledAnalysis() {
        console.log('Starting scheduled AI analysis tasks...');

        // Analyze new articles every 5 minutes
        cron.schedule('*/5 * * * *', () => {
            this.analyzeNewArticles();
        });

        // Update trending topics every 15 minutes
        cron.schedule('*/15 * * * *', () => {
            this.updateTrendingTopics();
        });

        // Generate daily insights
        cron.schedule('0 6 * * *', () => {
            this.generateDailyInsights();
        });
    }

    async analyzeNewArticles() {
        try {
            console.log('Analyzing new articles...');

            const client = await this.pool.connect();
            
            // Get unanalyzed articles from the last hour
            const result = await client.query(`
                SELECT id, title, content, category, published_at
                FROM news_articles
                WHERE published_at > NOW() - INTERVAL '1 hour'
                AND ai_analysis IS NULL
                LIMIT 50
            `);

            client.release();

            for (const article of result.rows) {
                try {
                    const analysis = await this.analyzeArticle(article.title, article.content);
                    await this.storeAnalysis(article.id, analysis);
                } catch (error) {
                    console.error(`Error analyzing article ${article.id}:`, error);
                }
            }

            console.log(`Analyzed ${result.rows.length} new articles`);
        } catch (error) {
            console.error('Error in scheduled article analysis:', error);
        }
    }

    async analyzeArticle(title, content) {
        const text = `${title} ${content}`.toLowerCase();
        const tokens = TOKENIZER.tokenize(text);

        // Sentiment analysis
        const sentiment = this.performSentimentAnalysis(tokens);

        // Topic classification
        const topics = this.classifyTopics(text);

        // Entity extraction (simplified)
        const entities = this.extractEntities(text);

        // Engagement prediction
        const engagementScore = this.predictEngagement(title, content, sentiment);

        // Breaking news probability
        const breakingProbability = this.calculateBreakingProbability(title, content);

        return {
            sentiment: {
                score: sentiment.score,
                label: sentiment.label,
                confidence: sentiment.confidence
            },
            topics: topics,
            entities: entities,
            engagement_score: engagementScore,
            breaking_probability: breakingProbability,
            readability_score: this.calculateReadabilityScore(text),
            keywords: this.extractKeywords(tokens),
            analyzed_at: new Date().toISOString()
        };
    }

    performSentimentAnalysis(tokens) {
        const stemmedTokens = tokens.map(token => natural.PorterStemmer.stem(token));
        const score = SENTIMENT_ANALYZER.getSentiment(stemmedTokens);

        let label, confidence;
        if (score > 0.1) {
            label = 'positive';
            confidence = Math.min(score, 1.0);
        } else if (score < -0.1) {
            label = 'negative';
            confidence = Math.min(Math.abs(score), 1.0);
        } else {
            label = 'neutral';
            confidence = 1.0 - Math.abs(score);
        }

        return { score, label, confidence };
    }

    classifyTopics(text) {
        const topicScores = {};

        for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
            let score = 0;
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    score += 1;
                }
            }
            if (score > 0) {
                topicScores[topic] = score / keywords.length;
            }
        }

        // Sort topics by score and return top 3
        return Object.entries(topicScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([topic, score]) => ({ topic, confidence: score }));
    }

    extractEntities(text) {
        // Simplified entity extraction
        const entities = {
            people: [],
            organizations: [],
            locations: [],
            dates: []
        };

        // Extract capitalized words (potential proper nouns)
        const words = text.split(/\s+/);
        const capitalizedWords = words.filter(word => 
            word.length > 2 && 
            word[0] === word[0].toUpperCase() && 
            word.slice(1) === word.slice(1).toLowerCase()
        );

        // Simple classification (would use NER in production)
        capitalizedWords.forEach(word => {
            if (word.match(/\b(Inc|Corp|Ltd|Company|Organization)\b/)) {
                entities.organizations.push(word);
            } else if (word.match(/\b(City|State|Country|Street)\b/)) {
                entities.locations.push(word);
            } else {
                entities.people.push(word);
            }
        });

        // Extract dates
        const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}|\b\d{4}-\d{2}-\d{2}|\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi;
        const dates = text.match(dateRegex) || [];
        entities.dates = dates;

        return entities;
    }

    predictEngagement(title, content, sentiment) {
        let score = 0.5; // Base score

        // Title factors
        const titleLength = title.length;
        if (titleLength >= 30 && titleLength <= 60) score += 0.1;
        if (title.includes('?')) score += 0.1;
        if (title.includes('!')) score += 0.05;
        if (/\d+/.test(title)) score += 0.1; // Numbers in title

        // Content factors
        const contentLength = content.length;
        if (contentLength > 200 && contentLength < 2000) score += 0.1;

        // Sentiment factor
        if (sentiment.label === 'positive') score += 0.1;
        if (sentiment.label === 'negative') score += 0.05; // Negative news can be engaging

        // Breaking news keywords
        const breakingKeywords = ['breaking', 'urgent', 'just in', 'developing'];
        if (breakingKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            score += 0.2;
        }

        return Math.min(score, 1.0);
    }

    calculateBreakingProbability(title, content) {
        const text = `${title} ${content}`.toLowerCase();
        
        const breakingIndicators = [
            'breaking', 'urgent', 'just in', 'developing', 'alert',
            'exclusive', 'confirmed', 'official', 'announced'
        ];

        const urgentWords = [
            'crisis', 'emergency', 'disaster', 'attack', 'death',
            'explosion', 'crash', 'fire', 'earthquake'
        ];

        let probability = 0;

        // Check for breaking indicators
        breakingIndicators.forEach(indicator => {
            if (text.includes(indicator)) probability += 0.2;
        });

        // Check for urgent content
        urgentWords.forEach(word => {
            if (text.includes(word)) probability += 0.1;
        });

        // Check for time indicators (recently published)
        if (text.includes('today') || text.includes('now') || text.includes('minutes ago')) {
            probability += 0.1;
        }

        return Math.min(probability, 1.0);
    }

    calculateReadabilityScore(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);

        if (sentences.length === 0 || words.length === 0) return 0;

        // Flesch Reading Ease Score
        const avgSentenceLength = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        
        const readabilityScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        
        // Convert to 0-1 scale
        return Math.max(0, Math.min(1, readabilityScore / 100));
    }

    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        
        const vowels = 'aeiouy';
        let count = 0;
        let previousWasVowel = false;
        
        for (let i = 0; i < word.length; i++) {
            const currentIsVowel = vowels.includes(word[i]);
            if (currentIsVowel && !previousWasVowel) {
                count++;
            }
            previousWasVowel = currentIsVowel;
        }
        
        if (word.endsWith('e')) count--;
        
        return Math.max(1, count);
    }

    extractKeywords(tokens) {
        // Remove stop words and short words
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
        
        const filteredTokens = tokens
            .filter(token => token.length > 3 && !stopWords.has(token.toLowerCase()))
            .map(token => token.toLowerCase());

        // Count frequency
        const frequency = {};
        filteredTokens.forEach(token => {
            frequency[token] = (frequency[token] || 0) + 1;
        });

        // Return top keywords
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    async storeAnalysis(articleId, analysis) {
        const client = await this.pool.connect();
        
        try {
            await client.query(`
                UPDATE news_articles
                SET ai_analysis = $1, analyzed_at = NOW()
                WHERE id = $2
            `, [JSON.stringify(analysis), articleId]);
        } finally {
            client.release();
        }
    }

    async generateInsights(category, limit, timeframe) {
        const client = await this.pool.connect();
        
        try {
            let timeCondition = '';
            if (timeframe === '1h') timeCondition = "published_at > NOW() - INTERVAL '1 hour'";
            else if (timeframe === '6h') timeCondition = "published_at > NOW() - INTERVAL '6 hours'";
            else if (timeframe === '24h') timeCondition = "published_at > NOW() - INTERVAL '24 hours'";
            else if (timeframe === '7d') timeCondition = "published_at > NOW() - INTERVAL '7 days'";

            let categoryCondition = '';
            if (category) categoryCondition = `AND category = '${category}'`;

            const query = `
                SELECT title, content, category, sentiment, engagement_score, 
                       freshness_score, ai_analysis, published_at, source
                FROM news_articles
                WHERE ${timeCondition} ${categoryCondition}
                AND ai_analysis IS NOT NULL
                ORDER BY (engagement_score * freshness_score) DESC
                LIMIT $1
            `;

            const result = await client.query(query, [limit]);

            return {
                timeframe,
                category: category || 'all',
                total_articles: result.rows.length,
                insights: result.rows.map(article => ({
                    title: article.title,
                    source: article.source,
                    category: article.category,
                    published_at: article.published_at,
                    engagement_score: article.engagement_score,
                    sentiment: article.sentiment,
                    ai_insights: JSON.parse(article.ai_analysis || '{}')
                }))
            };
        } finally {
            client.release();
        }
    }

    async getTrendingTopics(period) {
        const client = await this.pool.connect();
        
        try {
            let timeCondition = '';
            if (period === '1h') timeCondition = "published_at > NOW() - INTERVAL '1 hour'";
            else if (period === '6h') timeCondition = "published_at > NOW() - INTERVAL '6 hours'";
            else if (period === '24h') timeCondition = "published_at > NOW() - INTERVAL '24 hours'";
            else if (period === '7d') timeCondition = "published_at > NOW() - INTERVAL '7 days'";

            const result = await client.query(`
                SELECT category, COUNT(*) as article_count,
                       AVG(engagement_score) as avg_engagement,
                       AVG(freshness_score) as avg_freshness
                FROM news_articles
                WHERE ${timeCondition}
                GROUP BY category
                ORDER BY (COUNT(*) * AVG(engagement_score)) DESC
            `);

            return {
                period,
                trending_topics: result.rows.map(row => ({
                    topic: row.category,
                    article_count: parseInt(row.article_count),
                    avg_engagement: parseFloat(row.avg_engagement),
                    avg_freshness: parseFloat(row.avg_freshness),
                    trend_score: parseInt(row.article_count) * parseFloat(row.avg_engagement)
                }))
            };
        } finally {
            client.release();
        }
    }

    async getSentimentAnalysis(category) {
        const client = await this.pool.connect();
        
        try {
            let categoryCondition = category ? `AND category = '${category}'` : '';

            const result = await client.query(`
                SELECT sentiment, COUNT(*) as count
                FROM news_articles
                WHERE published_at > NOW() - INTERVAL '24 hours' ${categoryCondition}
                GROUP BY sentiment
            `);

            const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);

            return {
                category: category || 'all',
                total_articles: total,
                sentiment_distribution: result.rows.map(row => ({
                    sentiment: row.sentiment,
                    count: parseInt(row.count),
                    percentage: ((parseInt(row.count) / total) * 100).toFixed(1)
                }))
            };
        } finally {
            client.release();
        }
    }

    async getBreakingNewsPredictions() {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(`
                SELECT title, content, category, source, published_at,
                       ai_analysis->>'breaking_probability' as breaking_prob,
                       engagement_score
                FROM news_articles
                WHERE published_at > NOW() - INTERVAL '2 hours'
                AND ai_analysis->>'breaking_probability' IS NOT NULL
                AND CAST(ai_analysis->>'breaking_probability' as FLOAT) > 0.3
                ORDER BY CAST(ai_analysis->>'breaking_probability' as FLOAT) DESC, published_at DESC
                LIMIT 20
            `);

            return {
                predictions: result.rows.map(article => ({
                    title: article.title,
                    category: article.category,
                    source: article.source,
                    published_at: article.published_at,
                    breaking_probability: parseFloat(article.breaking_prob),
                    engagement_score: article.engagement_score,
                    prediction_confidence: this.calculatePredictionConfidence(
                        parseFloat(article.breaking_prob),
                        article.engagement_score
                    )
                }))
            };
        } finally {
            client.release();
        }
    }

    calculatePredictionConfidence(breakingProb, engagementScore) {
        // Combine breaking probability with engagement score
        return (breakingProb * 0.7 + engagementScore * 0.3);
    }

    async updateTrendingTopics() {
        try {
            console.log('Updating trending topics cache...');
            
            const trending = await this.getTrendingTopics('6h');
            
            // Cache trending topics in Redis
            await this.redis.setex('trending-topics', 900, JSON.stringify(trending)); // 15 minutes cache
            
            console.log('Trending topics cache updated');
        } catch (error) {
            console.error('Error updating trending topics:', error);
        }
    }

    async generateDailyInsights() {
        try {
            console.log('Generating daily insights...');
            
            const insights = await this.generateInsights(null, 100, '24h');
            const sentiment = await this.getSentimentAnalysis();
            const trending = await this.getTrendingTopics('24h');
            
            const dailyReport = {
                date: new Date().toISOString().split('T')[0],
                insights,
                sentiment,
                trending,
                generated_at: new Date().toISOString()
            };
            
            // Cache daily insights in Redis
            await this.redis.setex('daily-insights', 86400, JSON.stringify(dailyReport)); // 24 hours cache
            
            console.log('Daily insights generated and cached');
        } catch (error) {
            console.error('Error generating daily insights:', error);
        }
    }
}

// Initialize AI Analyzer
const analyzer = new AIAnalyzer();
analyzer.initialize();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down AI Analyzer...');
    await analyzer.redis.disconnect();
    await analyzer.pool.end();
    process.exit(0);
});
