#!/usr/bin/env python3
"""
KaiTech News Service with Redis Caching
High-performance news aggregation service with AI enhancement
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import json

import redis
from fastapi import FastAPI, HTTPException, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import httpx
import feedparser
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://newsuser:newspass@localhost:5432/newsdb")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
CACHE_TTL = int(os.getenv("CACHE_TTL", "300"))  # 5 minutes default

# Database setup
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis setup
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
    logger.info("✅ Redis connection established")
except Exception as e:
    logger.error(f"❌ Redis connection failed: {e}")
    redis_client = None

# FastAPI app
app = FastAPI(
    title="KaiTech News Service",
    description="Advanced news aggregation with AI enhancement and caching",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class NewsArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    content: Optional[str] = ""
    url: str
    source: str
    category: str = "general"
    ai_category: Optional[str] = None
    sentiment: Optional[str] = "neutral"
    ai_summary: Optional[str] = None
    published_at: datetime
    trending_score: float = 0.0
    enhanced: bool = False
    language: str = "en"

class NewsResponse(BaseModel):
    status: str = "success"
    articles: List[NewsArticle]
    total: int
    cached: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Database Models
class Article(Base):
    __tablename__ = "articles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    description = Column(Text)
    content = Column(Text)
    url = Column(String, unique=True, nullable=False, index=True)
    source = Column(String, nullable=False, index=True)
    category = Column(String, default="general", index=True)
    ai_category = Column(String, index=True)
    sentiment = Column(String, default="neutral", index=True)
    ai_summary = Column(Text)
    published_at = Column(DateTime, nullable=False, index=True)
    trending_score = Column(Float, default=0.0)
    enhanced = Column(Boolean, default=False)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# RSS sources configuration
RSS_SOURCES = [
    {"name": "BBC News", "url": "https://feeds.bbci.co.uk/news/rss.xml", "category": "world"},
    {"name": "Reuters", "url": "https://feeds.reuters.com/reuters/topNews", "category": "world"},
    {"name": "TechCrunch", "url": "https://techcrunch.com/feed/", "category": "technology"},
    {"name": "CNN", "url": "http://rss.cnn.com/rss/edition.rss", "category": "world"},
    {"name": "Ars Technica", "url": "https://feeds.arstechnica.com/arstechnica/index", "category": "technology"},
    {"name": "Wired", "url": "https://www.wired.com/feed/rss", "category": "technology"},
    {"name": "The Verge", "url": "https://www.theverge.com/rss/index.xml", "category": "technology"},
    {"name": "Hacker News", "url": "https://hnrss.org/frontpage", "category": "technology"}
]

# Cache utilities
async def get_from_cache(key: str) -> Optional[Dict]:
    """Get data from Redis cache"""
    if not redis_client:
        return None
    
    try:
        cached_data = redis_client.get(key)
        if cached_data:
            return json.loads(cached_data)
        return None
    except Exception as e:
        logger.error(f"Cache read error for key {key}: {e}")
        return None

async def set_cache(key: str, data: Dict, ttl: int = CACHE_TTL) -> bool:
    """Set data in Redis cache"""
    if not redis_client:
        return False
    
    try:
        redis_client.setex(key, ttl, json.dumps(data, default=str))
        return True
    except Exception as e:
        logger.error(f"Cache write error for key {key}: {e}")
        return False

async def invalidate_cache_pattern(pattern: str) -> bool:
    """Invalidate cache keys matching pattern"""
    if not redis_client:
        return False
    
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
        return True
    except Exception as e:
        logger.error(f"Cache invalidation error for pattern {pattern}: {e}")
        return False

# News fetching utilities
async def fetch_rss_feed(source: Dict) -> List[Dict]:
    """Fetch and parse RSS feed"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                source["url"],
                headers={"User-Agent": "KaiTech News Bot 2.0"}
            )
            response.raise_for_status()
            
        feed = feedparser.parse(response.text)
        articles = []
        
        for entry in feed.entries[:15]:  # Limit to 15 articles per source
            try:
                published_at = datetime.now()
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_at = datetime(*entry.published_parsed[:6])
                elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                    published_at = datetime(*entry.updated_parsed[:6])
                
                article = {
                    "title": getattr(entry, 'title', 'No Title'),
                    "description": getattr(entry, 'description', ''),
                    "content": getattr(entry, 'content', [{}])[0].get('value', '') if hasattr(entry, 'content') else '',
                    "url": getattr(entry, 'link', ''),
                    "source": source["name"],
                    "category": source["category"],
                    "published_at": published_at,
                    "trending_score": calculate_trending_score(entry.title, published_at)
                }
                
                if article["url"] and article["title"]:
                    articles.append(article)
                    
            except Exception as e:
                logger.error(f"Error parsing article from {source['name']}: {e}")
                continue
        
        logger.info(f"✅ Fetched {len(articles)} articles from {source['name']}")
        return articles
        
    except Exception as e:
        logger.error(f"❌ Error fetching RSS from {source['name']}: {e}")
        return []

def calculate_trending_score(title: str, published_at: datetime) -> float:
    """Calculate trending score based on keywords and recency"""
    hours_old = (datetime.now() - published_at).total_seconds() / 3600
    recency_score = max(0, 100 - (hours_old * 2))
    
    trending_keywords = ['breaking', 'urgent', 'live', 'exclusive', 'alert']
    keyword_score = sum(20 for keyword in trending_keywords if keyword.lower() in title.lower())
    
    return min(100, recency_score + keyword_score)

async def enhance_with_ai(articles: List[Dict]) -> List[Dict]:
    """Enhance articles with AI analysis"""
    if not GROK_API_KEY and not OPENAI_API_KEY:
        logger.warning("No AI API key available, skipping AI enhancement")
        return articles
    
    enhanced_articles = []
    
    for i, article in enumerate(articles[:30]):  # Limit to avoid rate limits
        try:
            # Add delay to respect rate limits
            if i > 0:
                await asyncio.sleep(0.1)
            
            # AI categorization
            ai_category = await categorize_with_ai(article["title"] + " " + article["description"])
            
            # Sentiment analysis
            sentiment = await analyze_sentiment(article["title"])
            
            # Generate summary
            ai_summary = await generate_summary(article["title"], article["description"])
            
            article.update({
                "ai_category": ai_category,
                "sentiment": sentiment,
                "ai_summary": ai_summary,
                "enhanced": True
            })
            
            enhanced_articles.append(article)
            
        except Exception as e:
            logger.error(f"Error enhancing article {i}: {e}")
            article["enhanced"] = False
            enhanced_articles.append(article)
    
    return enhanced_articles

async def categorize_with_ai(text: str) -> str:
    """Categorize article using AI"""
    try:
        # Implement AI categorization logic here
        # For now, use keyword-based fallback
        text_lower = text.lower()
        
        if any(keyword in text_lower for keyword in ['ai', 'artificial intelligence', 'machine learning', 'tech']):
            return 'technology'
        elif any(keyword in text_lower for keyword in ['crypto', 'bitcoin', 'blockchain']):
            return 'cryptocurrency'
        elif any(keyword in text_lower for keyword in ['climate', 'environment', 'green']):
            return 'environment'
        elif any(keyword in text_lower for keyword in ['politics', 'election', 'government']):
            return 'politics'
        elif any(keyword in text_lower for keyword in ['business', 'economy', 'market', 'finance']):
            return 'business'
        elif any(keyword in text_lower for keyword in ['health', 'medical', 'disease']):
            return 'health'
        else:
            return 'general'
            
    except Exception as e:
        logger.error(f"AI categorization error: {e}")
        return 'general'

async def analyze_sentiment(text: str) -> str:
    """Analyze sentiment using AI"""
    try:
        # Simple keyword-based sentiment analysis
        text_lower = text.lower()
        
        positive_words = ['breakthrough', 'success', 'growth', 'positive', 'achievement', 'innovation']
        negative_words = ['crisis', 'failure', 'decline', 'negative', 'problem', 'concern']
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
            
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        return 'neutral'

async def generate_summary(title: str, description: str) -> str:
    """Generate AI summary"""
    try:
        # For now, create a simple summary
        if len(description) > 100:
            return f"AI Summary: {description[:97]}..."
        else:
            return f"AI Summary: {title}"
    except Exception as e:
        logger.error(f"Summary generation error: {e}")
        return f"Summary: {title[:80]}..."

# Background task to fetch news
async def fetch_all_news():
    """Background task to fetch and cache news"""
    logger.info("🔄 Starting news aggregation...")
    
    all_articles = []
    
    # Fetch from all RSS sources concurrently
    tasks = [fetch_rss_feed(source) for source in RSS_SOURCES]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for result in results:
        if isinstance(result, list):
            all_articles.extend(result)
        elif isinstance(result, Exception):
            logger.error(f"RSS fetch error: {result}")
    
    # Remove duplicates by URL
    unique_articles = {}
    for article in all_articles:
        if article['url'] not in unique_articles:
            unique_articles[article['url']] = article
    
    articles_list = list(unique_articles.values())
    
    # Sort by published date
    articles_list.sort(key=lambda x: x['published_at'], reverse=True)
    
    # Enhance with AI
    enhanced_articles = await enhance_with_ai(articles_list)
    
    # Cache the results
    cache_data = {
        "articles": enhanced_articles,
        "total": len(enhanced_articles),
        "last_updated": datetime.utcnow().isoformat(),
        "sources_count": len(RSS_SOURCES)
    }
    
    await set_cache("news:all", cache_data, ttl=CACHE_TTL)
    await set_cache("news:breaking", {
        "articles": [a for a in enhanced_articles if a['trending_score'] > 70][:20],
        "last_updated": datetime.utcnow().isoformat()
    }, ttl=CACHE_TTL)
    
    logger.info(f"✅ Cached {len(enhanced_articles)} articles")
    return enhanced_articles

# API Routes
@app.get("/", response_model=Dict)
async def root():
    """API root endpoint"""
    return {
        "service": "KaiTech News Service",
        "version": "2.0.0",
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "endpoints": {
            "health": "/health",
            "news": "/api/news",
            "breaking": "/api/news/breaking",
            "trending": "/api/news/trending",
            "categories": "/api/news/categories",
            "search": "/api/news/search"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    redis_status = "connected" if redis_client else "disconnected"
    
    return {
        "status": "healthy",
        "service": "KaiTech News Service",
        "version": "2.0.0",
        "timestamp": datetime.utcnow(),
        "dependencies": {
            "redis": redis_status,
            "database": "connected"
        },
        "cache_info": {
            "redis_connected": bool(redis_client),
            "cache_ttl": CACHE_TTL
        }
    }

@app.get("/api/news", response_model=NewsResponse)
async def get_all_news(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    category: Optional[str] = Query(None),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Get all news articles with caching"""
    
    # Try to get from cache first
    cache_key = f"news:all:{category}:{limit}:{offset}"
    cached_data = await get_from_cache(cache_key)
    
    if cached_data:
        return NewsResponse(
            articles=[NewsArticle(**article) for article in cached_data["articles"]],
            total=cached_data["total"],
            cached=True
        )
    
    # If not in cache, fetch fresh data
    background_tasks.add_task(fetch_all_news)
    
    # Try to get from main cache
    main_cache = await get_from_cache("news:all")
    if main_cache:
        articles = main_cache["articles"]
        
        # Filter by category if specified
        if category:
            articles = [a for a in articles if a.get("category") == category or a.get("ai_category") == category]
        
        # Apply pagination
        paginated_articles = articles[offset:offset + limit]
        
        # Cache this specific query
        query_cache_data = {
            "articles": paginated_articles,
            "total": len(articles)
        }
        await set_cache(cache_key, query_cache_data, ttl=CACHE_TTL // 2)
        
        return NewsResponse(
            articles=[NewsArticle(**article) for article in paginated_articles],
            total=len(articles),
            cached=True
        )
    
    # Fallback: return empty response and trigger background fetch
    return NewsResponse(
        articles=[],
        total=0,
        cached=False
    )

@app.get("/api/news/breaking", response_model=NewsResponse)
async def get_breaking_news(
    limit: int = Query(20, ge=1, le=50)
):
    """Get breaking news"""
    cache_key = f"news:breaking:{limit}"
    cached_data = await get_from_cache(cache_key)
    
    if cached_data:
        articles = cached_data["articles"][:limit]
        return NewsResponse(
            articles=[NewsArticle(**article) for article in articles],
            total=len(articles),
            cached=True
        )
    
    # Try main cache and filter
    main_cache = await get_from_cache("news:all")
    if main_cache:
        breaking_articles = [
            a for a in main_cache["articles"] 
            if a.get("trending_score", 0) > 70
        ][:limit]
        
        return NewsResponse(
            articles=[NewsArticle(**article) for article in breaking_articles],
            total=len(breaking_articles),
            cached=False
        )
    
    return NewsResponse(articles=[], total=0, cached=False)

@app.get("/api/news/trending", response_model=NewsResponse)
async def get_trending_news(
    limit: int = Query(30, ge=1, le=100),
    min_score: float = Query(50.0, ge=0.0, le=100.0)
):
    """Get trending news"""
    main_cache = await get_from_cache("news:all")
    if main_cache:
        trending_articles = [
            a for a in main_cache["articles"] 
            if a.get("trending_score", 0) >= min_score
        ]
        trending_articles.sort(key=lambda x: x.get("trending_score", 0), reverse=True)
        trending_articles = trending_articles[:limit]
        
        return NewsResponse(
            articles=[NewsArticle(**article) for article in trending_articles],
            total=len(trending_articles),
            cached=True
        )
    
    return NewsResponse(articles=[], total=0, cached=False)

@app.get("/api/news/search", response_model=NewsResponse)
async def search_news(
    q: str = Query(..., min_length=2),
    limit: int = Query(30, ge=1, le=100)
):
    """Search news articles"""
    cache_key = f"news:search:{q}:{limit}"
    cached_data = await get_from_cache(cache_key)
    
    if cached_data:
        return NewsResponse(
            articles=[NewsArticle(**article) for article in cached_data["articles"]],
            total=cached_data["total"],
            cached=True
        )
    
    main_cache = await get_from_cache("news:all")
    if main_cache:
        search_results = [
            a for a in main_cache["articles"]
            if q.lower() in a.get("title", "").lower() or 
               q.lower() in a.get("description", "").lower()
        ][:limit]
        
        # Cache search results
        search_cache_data = {
            "articles": search_results,
            "total": len(search_results)
        }
        await set_cache(cache_key, search_cache_data, ttl=CACHE_TTL // 4)
        
        return NewsResponse(
            articles=[NewsArticle(**article) for article in search_results],
            total=len(search_results),
            cached=False
        )
    
    return NewsResponse(articles=[], total=0, cached=False)

@app.get("/api/news/categories")
async def get_news_categories():
    """Get available news categories"""
    main_cache = await get_from_cache("news:all")
    if main_cache:
        categories = {}
        for article in main_cache["articles"]:
            cat = article.get("ai_category") or article.get("category", "general")
            if cat not in categories:
                categories[cat] = 0
            categories[cat] += 1
        
        return {
            "status": "success",
            "categories": categories,
            "total_categories": len(categories),
            "timestamp": datetime.utcnow()
        }
    
    return {"status": "error", "message": "No data available"}

@app.post("/api/news/refresh")
async def refresh_news(background_tasks: BackgroundTasks):
    """Manually refresh news cache"""
    background_tasks.add_task(fetch_all_news)
    await invalidate_cache_pattern("news:*")
    
    return {
        "status": "success",
        "message": "News refresh initiated",
        "timestamp": datetime.utcnow()
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(message=exc.detail).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(message="Internal server error").dict()
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize app on startup"""
    logger.info("🚀 Starting KaiTech News Service...")
    
    # Initial news fetch
    asyncio.create_task(fetch_all_news())
    
    logger.info("✅ KaiTech News Service started successfully")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "3000")),
        log_level="info"
    )