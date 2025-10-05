#!/usr/bin/env python3
"""
KaiTech AI Service
Advanced AI analysis service for content processing and recommendations
"""

import os
import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import hashlib

import redis
from fastapi import FastAPI, HTTPException, Depends, Query, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import httpx
import openai
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
HUGGING_FACE_API_KEY = os.getenv("HUGGING_FACE_API_KEY", "")
CACHE_TTL = int(os.getenv("AI_CACHE_TTL", "3600"))  # 1 hour default
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))

# Redis setup
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
    logger.info("✅ AI Service Redis connection established")
except Exception as e:
    logger.error(f"❌ AI Service Redis connection failed: {e}")
    redis_client = None

# FastAPI app
app = FastAPI(
    title="KaiTech AI Service",
    description="Advanced AI analysis and content processing service",
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

# Initialize AI models (lazy loading)
sentiment_model = None
summarization_model = None
classification_model = None

# Pydantic models
class TextInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    language: str = Field("en", description="Language code (en, es, fr, etc.)")
    
    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()

class ChatMessage(BaseModel):
    role: str = Field(..., regex="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)

class ChatInput(BaseModel):
    messages: List[ChatMessage] = Field(..., min_items=1)
    model: str = Field("gpt-3.5-turbo", description="AI model to use")
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(1000, ge=1, le=4000)
    include_context: bool = Field(False, description="Include news context")

class AnalysisInput(BaseModel):
    text: str = Field(..., min_length=10, max_length=50000)
    analysis_type: str = Field("comprehensive", regex="^(sentiment|summary|category|keywords|comprehensive)$")
    options: Optional[Dict[str, Any]] = Field({})

class AIResponse(BaseModel):
    status: str = "success"
    result: Any
    model_used: Optional[str] = None
    cached: bool = False
    processing_time: float = 0.0
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Cache utilities
def generate_cache_key(prefix: str, data: str) -> str:
    """Generate cache key from data hash"""
    data_hash = hashlib.md5(data.encode()).hexdigest()
    return f"ai:{prefix}:{data_hash}"

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
        logger.error(f"AI Cache read error for key {key}: {e}")
        return None

async def set_cache(key: str, data: Dict, ttl: int = CACHE_TTL) -> bool:
    """Set data in Redis cache"""
    if not redis_client:
        return False
    
    try:
        redis_client.setex(key, ttl, json.dumps(data, default=str))
        return True
    except Exception as e:
        logger.error(f"AI Cache write error for key {key}: {e}")
        return False

# AI Model Management
def load_sentiment_model():
    """Load sentiment analysis model"""
    global sentiment_model
    if sentiment_model is None:
        try:
            sentiment_model = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                return_all_scores=True
            )
            logger.info("✅ Sentiment model loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load sentiment model: {e}")
            sentiment_model = pipeline("sentiment-analysis")
    return sentiment_model

def load_summarization_model():
    """Load text summarization model"""
    global summarization_model
    if summarization_model is None:
        try:
            summarization_model = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                max_length=130,
                min_length=30,
                do_sample=False
            )
            logger.info("✅ Summarization model loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load summarization model: {e}")
            summarization_model = pipeline("summarization")
    return summarization_model

def load_classification_model():
    """Load text classification model"""
    global classification_model
    if classification_model is None:
        try:
            classification_model = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli"
            )
            logger.info("✅ Classification model loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load classification model: {e}")
            classification_model = None
    return classification_model

# AI Processing Functions
async def analyze_sentiment_ai(text: str) -> Dict[str, Any]:
    """Analyze sentiment using local AI model"""
    try:
        start_time = datetime.utcnow()
        model = load_sentiment_model()
        
        # Truncate text if too long
        if len(text) > 500:
            text = text[:497] + "..."
        
        result = model(text)
        
        # Process results
        if isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], list):  # Multiple scores
                scores = result[0]
                sentiment_map = {
                    'LABEL_0': 'negative',
                    'LABEL_1': 'neutral', 
                    'LABEL_2': 'positive',
                    'NEGATIVE': 'negative',
                    'POSITIVE': 'positive'
                }
                
                processed_scores = {}
                for score in scores:
                    label = sentiment_map.get(score['label'], score['label'].lower())
                    processed_scores[label] = score['score']
                
                # Get dominant sentiment
                dominant = max(processed_scores.items(), key=lambda x: x[1])
                
            else:  # Single result
                sentiment_map = {
                    'NEGATIVE': 'negative',
                    'POSITIVE': 'positive'
                }
                dominant_label = sentiment_map.get(result[0]['label'], 'neutral')
                dominant = (dominant_label, result[0]['score'])
                processed_scores = {dominant_label: result[0]['score']}
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        return {
            "sentiment": dominant[0],
            "confidence": round(dominant[1], 3),
            "scores": processed_scores,
            "model": "local_transformer",
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Local sentiment analysis error: {e}")
        return {
            "sentiment": "neutral",
            "confidence": 0.5,
            "scores": {"neutral": 0.5},
            "model": "fallback",
            "processing_time": 0.0,
            "error": str(e)
        }

async def summarize_text_ai(text: str, max_length: int = 130) -> Dict[str, Any]:
    """Summarize text using local AI model"""
    try:
        start_time = datetime.utcnow()
        
        # Check text length
        if len(text) < 50:
            return {
                "summary": text,
                "model": "passthrough",
                "processing_time": 0.0,
                "compression_ratio": 1.0
            }
        
        model = load_summarization_model()
        
        # Truncate text if too long (BART has token limits)
        if len(text) > 1000:
            text = text[:997] + "..."
        
        result = model(text, max_length=max_length, min_length=30, do_sample=False)
        
        summary = result[0]['summary_text']
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        compression_ratio = len(summary) / len(text)
        
        return {
            "summary": summary,
            "model": "facebook/bart-large-cnn",
            "processing_time": processing_time,
            "compression_ratio": round(compression_ratio, 3),
            "original_length": len(text),
            "summary_length": len(summary)
        }
        
    except Exception as e:
        logger.error(f"Local summarization error: {e}")
        # Fallback to simple truncation
        fallback_summary = text[:max_length] + "..." if len(text) > max_length else text
        return {
            "summary": fallback_summary,
            "model": "fallback_truncation",
            "processing_time": 0.0,
            "compression_ratio": len(fallback_summary) / len(text),
            "error": str(e)
        }

async def classify_text_ai(text: str, categories: List[str] = None) -> Dict[str, Any]:
    """Classify text into categories using AI"""
    try:
        start_time = datetime.utcnow()
        
        if categories is None:
            categories = [
                "technology", "business", "politics", "sports", "entertainment",
                "health", "science", "world news", "cryptocurrency", "ai & machine learning"
            ]
        
        model = load_classification_model()
        if model is None:
            # Fallback to keyword-based classification
            return await classify_text_keywords(text, categories)
        
        # Truncate text if too long
        if len(text) > 500:
            text = text[:497] + "..."
        
        result = model(text, categories)
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Process results
        classified_categories = []
        for label, score in zip(result['labels'], result['scores']):
            classified_categories.append({
                "category": label,
                "confidence": round(score, 3)
            })
        
        return {
            "predicted_category": result['labels'][0],
            "confidence": round(result['scores'][0], 3),
            "all_categories": classified_categories,
            "model": "facebook/bart-large-mnli",
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"AI classification error: {e}")
        return await classify_text_keywords(text, categories)

async def classify_text_keywords(text: str, categories: List[str]) -> Dict[str, Any]:
    """Fallback keyword-based classification"""
    text_lower = text.lower()
    
    keyword_map = {
        "technology": ["tech", "ai", "artificial intelligence", "software", "computer", "digital"],
        "business": ["business", "economy", "market", "finance", "company", "corporate"],
        "politics": ["politics", "election", "government", "policy", "politician", "vote"],
        "sports": ["sports", "football", "basketball", "soccer", "tennis", "olympic"],
        "entertainment": ["movie", "music", "celebrity", "hollywood", "entertainment", "film"],
        "health": ["health", "medical", "disease", "hospital", "doctor", "medicine"],
        "science": ["science", "research", "study", "discovery", "scientist", "experiment"],
        "cryptocurrency": ["crypto", "bitcoin", "blockchain", "ethereum", "cryptocurrency"],
        "ai & machine learning": ["ai", "machine learning", "neural network", "deep learning", "ml"]
    }
    
    scores = {}
    for category in categories:
        keywords = keyword_map.get(category.lower(), [])
        score = sum(1 for keyword in keywords if keyword in text_lower)
        scores[category] = score / len(keywords) if keywords else 0
    
    # Find best match
    best_category = max(scores.items(), key=lambda x: x[1]) if scores else ("general", 0.1)
    
    return {
        "predicted_category": best_category[0],
        "confidence": round(best_category[1], 3),
        "all_categories": [{"category": k, "confidence": round(v, 3)} for k, v in scores.items()],
        "model": "keyword_based_fallback",
        "processing_time": 0.0
    }

async def extract_keywords_ai(text: str, num_keywords: int = 10) -> Dict[str, Any]:
    """Extract keywords from text"""
    try:
        # Simple keyword extraction using word frequency
        import re
        from collections import Counter
        
        # Clean and tokenize text
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'what', 'where', 'when', 'why', 'how'
        }
        
        filtered_words = [word for word in words if word not in stop_words and len(word) > 3]
        word_freq = Counter(filtered_words)
        
        # Get top keywords
        top_keywords = word_freq.most_common(num_keywords)
        
        keywords = [{"keyword": word, "frequency": freq, "score": freq / len(filtered_words)} for word, freq in top_keywords]
        
        return {
            "keywords": keywords,
            "total_words": len(words),
            "unique_words": len(set(words)),
            "model": "frequency_based",
            "processing_time": 0.0
        }
        
    except Exception as e:
        logger.error(f"Keyword extraction error: {e}")
        return {
            "keywords": [],
            "model": "error_fallback",
            "error": str(e)
        }

async def chat_with_ai(messages: List[Dict], model: str = "gpt-3.5-turbo", **kwargs) -> Dict[str, Any]:
    """Chat with AI using external API"""
    try:
        start_time = datetime.utcnow()
        
        # Try Grok API first if available
        if GROK_API_KEY and "grok" in model.lower():
            response = await chat_with_grok(messages, **kwargs)
        # Try OpenAI if available
        elif OPENAI_API_KEY:
            response = await chat_with_openai(messages, model, **kwargs)
        else:
            # Fallback response
            return {
                "response": "I'm currently running in demo mode. Please configure an AI API key to enable full chat functionality.",
                "model": "demo_mode",
                "processing_time": 0.0,
                "token_usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        response["processing_time"] = processing_time
        
        return response
        
    except Exception as e:
        logger.error(f"Chat AI error: {e}")
        return {
            "response": f"I encountered an error while processing your request: {str(e)}",
            "model": "error_fallback",
            "processing_time": 0.0,
            "error": str(e)
        }

async def chat_with_grok(messages: List[Dict], **kwargs) -> Dict[str, Any]:
    """Chat with Grok API"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "grok-beta",
                    "messages": messages,
                    "max_tokens": kwargs.get("max_tokens", 1000),
                    "temperature": kwargs.get("temperature", 0.7)
                }
            )
            response.raise_for_status()
            
        data = response.json()
        
        return {
            "response": data["choices"][0]["message"]["content"],
            "model": "grok-beta",
            "token_usage": data.get("usage", {})
        }
        
    except Exception as e:
        logger.error(f"Grok API error: {e}")
        raise e

async def chat_with_openai(messages: List[Dict], model: str, **kwargs) -> Dict[str, Any]:
    """Chat with OpenAI API"""
    try:
        openai.api_key = OPENAI_API_KEY
        
        response = await openai.ChatCompletion.acreate(
            model=model,
            messages=messages,
            max_tokens=kwargs.get("max_tokens", 1000),
            temperature=kwargs.get("temperature", 0.7)
        )
        
        return {
            "response": response.choices[0].message.content,
            "model": model,
            "token_usage": dict(response.usage)
        }
        
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise e

# API Routes
@app.get("/", response_model=Dict)
async def root():
    """API root endpoint"""
    return {
        "service": "KaiTech AI Service",
        "version": "2.0.0",
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "capabilities": [
            "sentiment_analysis",
            "text_summarization",
            "content_classification",
            "keyword_extraction",
            "ai_chat",
            "comprehensive_analysis"
        ],
        "endpoints": {
            "health": "/health",
            "sentiment": "/api/ai/sentiment",
            "summarize": "/api/ai/summarize",
            "classify": "/api/ai/classify",
            "keywords": "/api/ai/keywords",
            "chat": "/api/ai/chat",
            "analyze": "/api/ai/analyze"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    redis_status = "connected" if redis_client else "disconnected"
    
    return {
        "status": "healthy",
        "service": "KaiTech AI Service",
        "version": "2.0.0",
        "timestamp": datetime.utcnow(),
        "dependencies": {
            "redis": redis_status,
            "openai": bool(OPENAI_API_KEY),
            "grok": bool(GROK_API_KEY),
            "hugging_face": bool(HUGGING_FACE_API_KEY)
        },
        "models": {
            "sentiment_loaded": sentiment_model is not None,
            "summarization_loaded": summarization_model is not None,
            "classification_loaded": classification_model is not None
        }
    }

@app.post("/api/ai/sentiment", response_model=AIResponse)
async def analyze_sentiment(input_data: TextInput):
    """Analyze sentiment of text"""
    cache_key = generate_cache_key("sentiment", input_data.text)
    
    # Try cache first
    cached_result = await get_from_cache(cache_key)
    if cached_result:
        return AIResponse(
            result=cached_result["result"],
            model_used=cached_result.get("model_used"),
            cached=True
        )
    
    # Perform analysis
    start_time = datetime.utcnow()
    result = await analyze_sentiment_ai(input_data.text)
    processing_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Cache result
    cache_data = {
        "result": result,
        "model_used": result.get("model"),
        "timestamp": datetime.utcnow().isoformat()
    }
    await set_cache(cache_key, cache_data)
    
    return AIResponse(
        result=result,
        model_used=result.get("model"),
        processing_time=processing_time
    )

@app.post("/api/ai/summarize", response_model=AIResponse)
async def summarize_text(input_data: TextInput, max_length: int = Query(130, ge=50, le=500)):
    """Summarize text"""
    cache_key = generate_cache_key(f"summarize:{max_length}", input_data.text)
    
    # Try cache first
    cached_result = await get_from_cache(cache_key)
    if cached_result:
        return AIResponse(
            result=cached_result["result"],
            model_used=cached_result.get("model_used"),
            cached=True
        )
    
    # Perform summarization
    start_time = datetime.utcnow()
    result = await summarize_text_ai(input_data.text, max_length)
    processing_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Cache result
    cache_data = {
        "result": result,
        "model_used": result.get("model"),
        "timestamp": datetime.utcnow().isoformat()
    }
    await set_cache(cache_key, cache_data)
    
    return AIResponse(
        result=result,
        model_used=result.get("model"),
        processing_time=processing_time
    )

@app.post("/api/ai/classify", response_model=AIResponse)
async def classify_text(input_data: TextInput, categories: List[str] = Query(None)):
    """Classify text into categories"""
    cache_key = generate_cache_key(f"classify:{categories}", input_data.text)
    
    # Try cache first
    cached_result = await get_from_cache(cache_key)
    if cached_result:
        return AIResponse(
            result=cached_result["result"],
            model_used=cached_result.get("model_used"),
            cached=True
        )
    
    # Perform classification
    start_time = datetime.utcnow()
    result = await classify_text_ai(input_data.text, categories)
    processing_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Cache result
    cache_data = {
        "result": result,
        "model_used": result.get("model"),
        "timestamp": datetime.utcnow().isoformat()
    }
    await set_cache(cache_key, cache_data)
    
    return AIResponse(
        result=result,
        model_used=result.get("model"),
        processing_time=processing_time
    )

@app.post("/api/ai/keywords", response_model=AIResponse)
async def extract_keywords(input_data: TextInput, num_keywords: int = Query(10, ge=1, le=50)):
    """Extract keywords from text"""
    cache_key = generate_cache_key(f"keywords:{num_keywords}", input_data.text)
    
    # Try cache first
    cached_result = await get_from_cache(cache_key)
    if cached_result:
        return AIResponse(
            result=cached_result["result"],
            model_used=cached_result.get("model_used"),
            cached=True
        )
    
    # Perform keyword extraction
    start_time = datetime.utcnow()
    result = await extract_keywords_ai(input_data.text, num_keywords)
    processing_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Cache result
    cache_data = {
        "result": result,
        "model_used": result.get("model"),
        "timestamp": datetime.utcnow().isoformat()
    }
    await set_cache(cache_key, cache_data)
    
    return AIResponse(
        result=result,
        model_used=result.get("model"),
        processing_time=processing_time
    )

@app.post("/api/ai/chat", response_model=AIResponse)
async def chat_with_ai_endpoint(input_data: ChatInput):
    """Chat with AI"""
    # Convert Pydantic models to dict for processing
    messages = [{"role": msg.role, "content": msg.content} for msg in input_data.messages]
    
    # For chat, we don't cache as conversations are unique
    start_time = datetime.utcnow()
    result = await chat_with_ai(
        messages=messages,
        model=input_data.model,
        temperature=input_data.temperature,
        max_tokens=input_data.max_tokens
    )
    processing_time = (datetime.utcnow() - start_time).total_seconds()
    
    return AIResponse(
        result=result,
        model_used=result.get("model"),
        processing_time=processing_time
    )

@app.post("/api/ai/analyze", response_model=AIResponse)
async def comprehensive_analysis(input_data: AnalysisInput):
    """Comprehensive text analysis"""
    cache_key = generate_cache_key(f"analysis:{input_data.analysis_type}", input_data.text)
    
    # Try cache first
    cached_result = await get_from_cache(cache_key)
    if cached_result:
        return AIResponse(
            result=cached_result["result"],
            model_used=cached_result.get("model_used"),
            cached=True
        )
    
    start_time = datetime.utcnow()
    
    if input_data.analysis_type == "comprehensive":
        # Run multiple analyses
        tasks = [
            analyze_sentiment_ai(input_data.text),
            summarize_text_ai(input_data.text),
            classify_text_ai(input_data.text),
            extract_keywords_ai(input_data.text)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        result = {
            "sentiment": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
            "summary": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
            "classification": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])},
            "keywords": results[3] if not isinstance(results[3], Exception) else {"error": str(results[3])},
            "text_stats": {
                "length": len(input_data.text),
                "words": len(input_data.text.split()),
                "sentences": len(input_data.text.split('.')),
                "characters": len(input_data.text.replace(' ', ''))
            }
        }
        
        model_used = "comprehensive_analysis"
    
    elif input_data.analysis_type == "sentiment":
        result = await analyze_sentiment_ai(input_data.text)
        model_used = result.get("model")
    elif input_data.analysis_type == "summary":
        result = await summarize_text_ai(input_data.text)
        model_used = result.get("model")
    elif input_data.analysis_type == "category":
        result = await classify_text_ai(input_data.text)
        model_used = result.get("model")
    elif input_data.analysis_type == "keywords":
        result = await extract_keywords_ai(input_data.text)
        model_used = result.get("model")
    else:
        raise HTTPException(status_code=400, detail="Invalid analysis type")
    
    processing_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Cache result
    cache_data = {
        "result": result,
        "model_used": model_used,
        "timestamp": datetime.utcnow().isoformat()
    }
    await set_cache(cache_key, cache_data)
    
    return AIResponse(
        result=result,
        model_used=model_used,
        processing_time=processing_time
    )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            message=exc.detail,
            error_code=f"HTTP_{exc.status_code}"
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled AI service exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            message="Internal AI service error",
            error_code="INTERNAL_ERROR"
        ).dict()
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize AI service on startup"""
    logger.info("🚀 Starting KaiTech AI Service...")
    
    # Preload models in background
    asyncio.create_task(preload_models())
    
    logger.info("✅ KaiTech AI Service started successfully")

async def preload_models():
    """Preload AI models in background"""
    try:
        logger.info("🔄 Preloading AI models...")
        load_sentiment_model()
        await asyncio.sleep(1)  # Prevent blocking
        load_summarization_model()
        await asyncio.sleep(1)
        load_classification_model()
        logger.info("✅ AI models preloaded successfully")
    except Exception as e:
        logger.error(f"❌ Failed to preload some AI models: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "3001")),
        log_level="info"
    )