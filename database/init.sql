-- Voice of Time News Database Initialization Script

-- Create database and user
CREATE USER newsuser WITH PASSWORD 'newspass';
CREATE DATABASE newsdb OWNER newsuser;

-- Connect to the newsdb database
\c newsdb;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE newsdb TO newsuser;

-- Create news articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    url VARCHAR(1000) UNIQUE NOT NULL,
    content TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_breaking BOOLEAN DEFAULT FALSE,
    sentiment VARCHAR(20) DEFAULT 'neutral',
    engagement_score REAL DEFAULT 0.5,
    freshness_score REAL DEFAULT 1.0,
    ai_analysis JSONB,
    analyzed_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_breaking ON news_articles(is_breaking);
CREATE INDEX IF NOT EXISTS idx_news_articles_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_articles_engagement ON news_articles(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_freshness ON news_articles(freshness_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_ai_analysis ON news_articles USING GIN(ai_analysis);

-- Create trending topics table
CREATE TABLE IF NOT EXISTS trending_topics (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(100) NOT NULL,
    article_count INTEGER DEFAULT 0,
    engagement_score REAL DEFAULT 0,
    trend_score REAL DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_period VARCHAR(20) NOT NULL -- '1h', '6h', '24h', '7d'
);

-- Create index for trending topics
CREATE INDEX IF NOT EXISTS idx_trending_topics_period ON trending_topics(time_period, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON trending_topics(trend_score DESC);

-- Create user interactions table for personalization
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    article_id INTEGER REFERENCES news_articles(id),
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'share', 'like', 'bookmark'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER, -- for 'view' interactions
    device_type VARCHAR(50),
    user_agent TEXT
);

-- Create indexes for user interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp DESC);

-- Create breaking news alerts table
CREATE TABLE IF NOT EXISTS breaking_news_alerts (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES news_articles(id),
    alert_type VARCHAR(50) NOT NULL, -- 'breaking', 'urgent', 'developing'
    priority_score REAL DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' -- 'active', 'expired', 'cancelled'
);

-- Create index for breaking news alerts
CREATE INDEX IF NOT EXISTS idx_breaking_news_alerts_status ON breaking_news_alerts(status);
CREATE INDEX IF NOT EXISTS idx_breaking_news_alerts_sent_at ON breaking_news_alerts(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_breaking_news_alerts_priority ON breaking_news_alerts(priority_score DESC);

-- Create news sources table
CREATE TABLE IF NOT EXISTS news_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    url VARCHAR(500) NOT NULL,
    rss_url VARCHAR(500),
    category VARCHAR(100),
    reliability_score REAL DEFAULT 0.5,
    is_active BOOLEAN DEFAULT TRUE,
    crawl_frequency INTEGER DEFAULT 3600, -- seconds
    last_crawled TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default news sources
INSERT INTO news_sources (name, url, rss_url, category, reliability_score) VALUES
('BBC News', 'https://www.bbc.com/news', 'https://feeds.bbci.co.uk/news/rss.xml', 'world', 0.9),
('Reuters', 'https://www.reuters.com', 'https://www.reuters.com/arc/outboundfeeds/rss/category/world/', 'world', 0.95),
('TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/feed/', 'technology', 0.8),
('CNN Business', 'https://www.cnn.com/business', 'http://rss.cnn.com/rss/money_latest.rss', 'business', 0.7),
('ESPN', 'https://www.espn.com', 'https://www.espn.com/espn/rss/news', 'sports', 0.85),
('GameSpot', 'https://www.gamespot.com', 'https://www.gamespot.com/feeds/news/', 'games', 0.75),
('The Guardian', 'https://www.theguardian.com', 'https://www.theguardian.com/world/rss', 'world', 0.85),
('Associated Press', 'https://apnews.com', 'https://apnews.com/apf-topnews', 'world', 0.95)
ON CONFLICT (name) DO NOTHING;

-- Create analytics table
CREATE TABLE IF NOT EXISTS news_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    category VARCHAR(100),
    total_articles INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    avg_engagement_score REAL DEFAULT 0,
    top_keywords JSONB,
    sentiment_distribution JSONB,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_news_analytics_date ON news_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_news_analytics_category ON news_analytics(category);

-- Create function to update article updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for articles table
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON news_articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate trending topics
CREATE OR REPLACE FUNCTION calculate_trending_topics(period_param VARCHAR DEFAULT '24h')
RETURNS TABLE(
    topic VARCHAR,
    article_count BIGINT,
    avg_engagement REAL,
    trend_score REAL
) AS $$
DECLARE
    time_interval INTERVAL;
BEGIN
    -- Set time interval based on period
    CASE period_param
        WHEN '1h' THEN time_interval := '1 hour';
        WHEN '6h' THEN time_interval := '6 hours';
        WHEN '24h' THEN time_interval := '24 hours';
        WHEN '7d' THEN time_interval := '7 days';
        ELSE time_interval := '24 hours';
    END CASE;

    RETURN QUERY
    SELECT 
        na.category as topic,
        COUNT(*) as article_count,
        AVG(na.engagement_score)::REAL as avg_engagement,
        (COUNT(*) * AVG(na.engagement_score))::REAL as trend_score
    FROM news_articles na
    WHERE na.published_at > NOW() - time_interval
    GROUP BY na.category
    ORDER BY trend_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get breaking news candidates
CREATE OR REPLACE FUNCTION get_breaking_news_candidates()
RETURNS TABLE(
    article_id INTEGER,
    title VARCHAR,
    breaking_probability REAL,
    engagement_score REAL,
    published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        na.id as article_id,
        na.title,
        COALESCE((na.ai_analysis->>'breaking_probability')::REAL, 0) as breaking_probability,
        na.engagement_score,
        na.published_at
    FROM news_articles na
    WHERE na.published_at > NOW() - INTERVAL '2 hours'
    AND na.ai_analysis IS NOT NULL
    AND COALESCE((na.ai_analysis->>'breaking_probability')::REAL, 0) > 0.3
    ORDER BY breaking_probability DESC, na.published_at DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to newsuser
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO newsuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO newsuser;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO newsuser;

-- Create some sample data for testing
INSERT INTO news_articles (title, url, content, source, category, is_breaking, sentiment, engagement_score) VALUES
('Breaking: Major Tech Innovation Announced', 'https://example.com/tech-innovation', 'A revolutionary new technology has been unveiled by leading tech companies...', 'TechCrunch', 'technology', true, 'positive', 0.9),
('Sports Championship Finals Begin Today', 'https://example.com/sports-finals', 'The highly anticipated championship finals are starting today with record attendance...', 'ESPN', 'sports', false, 'positive', 0.8),
('Economic Markets Show Strong Growth', 'https://example.com/market-growth', 'Global markets are experiencing unprecedented growth this quarter...', 'Reuters', 'business', false, 'positive', 0.7),
('Gaming Industry Reaches New Milestone', 'https://example.com/gaming-milestone', 'The gaming industry has achieved a new revenue milestone this year...', 'GameSpot', 'games', false, 'positive', 0.75),
('Health Officials Announce New Guidelines', 'https://example.com/health-guidelines', 'New health and safety guidelines have been released by officials...', 'BBC News', 'health', false, 'neutral', 0.6)
ON CONFLICT (url) DO NOTHING;

-- Create view for recent breaking news
CREATE OR REPLACE VIEW recent_breaking_news AS
SELECT 
    na.*,
    COALESCE((na.ai_analysis->>'breaking_probability')::REAL, 0) as breaking_probability
FROM news_articles na
WHERE na.is_breaking = true
OR (
    na.published_at > NOW() - INTERVAL '4 hours'
    AND COALESCE((na.ai_analysis->>'breaking_probability')::REAL, 0) > 0.5
)
ORDER BY na.published_at DESC;

-- Create view for trending content
CREATE OR REPLACE VIEW trending_content AS
SELECT 
    na.*,
    (na.engagement_score * na.freshness_score) as trend_score
FROM news_articles na
WHERE na.published_at > NOW() - INTERVAL '24 hours'
ORDER BY trend_score DESC;

COMMIT;
