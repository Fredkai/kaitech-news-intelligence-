# KaiTech Voice of Time - Real-Time News API Integration

## 🚀 Overview

This project now includes a comprehensive real-time news integration system that provides advanced filtering, geolocation-based personalization, and multi-source news aggregation. The system integrates with NewsAPI, Google News, and provides sophisticated content filtering and personalization capabilities.

## 📊 Features

### Core Features
- **Real-time News Aggregation**: Integration with multiple news sources (NewsAPI, Google News, RSS feeds)
- **Advanced Filtering**: Filter by category, region, sentiment, keywords, sources, and more
- **Geolocation-based Personalization**: Automatically detect user location and provide relevant regional news
- **User Preferences Management**: Store and manage user preferences for personalized news experiences
- **Breaking News Detection**: Real-time identification and prioritization of breaking news
- **Trending Topics Analysis**: Automatic extraction and display of trending topics
- **Multi-language Support**: Support for multiple languages and regional content

### Example Use Cases
- **"Show me AI-related news from Asia"** - Automatically filters AI news from Asian countries
- **Regional News**: Get personalized news based on your location
- **Category Filtering**: Focus on specific topics like technology, business, health, etc.
- **Breaking News Alerts**: Real-time updates for urgent news
- **Trending Analysis**: See what topics are gaining traction

## 🛠️ Installation & Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure your API keys:

```bash
cp .env.example .env
```

#### Required API Keys:

1. **NewsAPI** (Primary news source)
   - Sign up at: https://newsapi.org/
   - Free tier: 1,000 requests/day
   - Add to `.env`: `NEWSAPI_KEY=your_key_here`

#### Optional API Keys:

2. **Additional News Services** (for redundancy)
   - Currents API: https://currentsapi.services/
   - NewsData.io: https://newsdata.io/
   - GNews: https://gnews.io/

3. **Enhanced Geolocation** (for better location detection)
   - IPStack: https://ipstack.com/
   - MaxMind GeoIP2: https://www.maxmind.com/

### 2. Install Dependencies

```bash
npm install
```

All required dependencies are already listed in `package.json`.

### 3. Start the Server

```bash
npm start
```

The server will start with the enhanced news capabilities.

## 🔧 API Endpoints

### Core News Endpoints

#### Get Headlines with Filtering
```
GET /api/news/headlines?country=us&category=technology&pageSize=50
```

#### Search News
```
GET /api/news/search?q=artificial%20intelligence&region=asia&language=en
```

#### Get AI News from Asia (Example)
```
GET /api/news/ai-asia
```

#### Advanced Filtered News
```
GET /api/news/filtered?categories=technology,business&regions=asia&sentiment=positive&maxAge=24&sortBy=relevance
```

#### Breaking News (Enhanced)
```
GET /api/news/breaking-enhanced?region=global&language=en
```

#### Trending Topics
```
GET /api/news/trending?timeWindow=24&limit=20
```

#### User Location & Recommendations
```
GET /api/news/location
```

#### Available Options
```
GET /api/news/options
```

### Personalized News (Authenticated Users)

#### Personalized Feed
```
GET /api/news/personalized
```

#### User Preferences
```
GET /auth/preferences
POST /auth/preferences
```

## 📱 Frontend Integration

### Include the Enhanced News JavaScript

Add to your HTML:

```html
<script src="js/enhanced-news.js"></script>
```

### HTML Structure

The system expects these elements in your HTML:

```html
<!-- News Search -->
<input type="text" id="newsSearch" placeholder="Search news...">
<button class="search-btn"><i class="fas fa-search"></i></button>
<button class="ai-assistant-btn"><i class="fas fa-robot"></i> AI Assistant</button>

<!-- News Tabs -->
<div class="news-tabs">
    <button class="news-tab active" data-tab="discover">🔍 Discover</button>
    <button class="news-tab" data-tab="trending">📈 Trending</button>
    <button class="news-tab" data-tab="markets">💹 Markets</button>
    <button class="news-tab" data-tab="personalized">⭐ For You</button>
    <button class="news-tab" data-tab="analysis">🧠 Analysis</button>
    <button class="news-tab" data-tab="live">🔴 Live</button>
</div>

<!-- Content Areas -->
<div id="discover-content" class="news-tab-content active"></div>
<div id="trending-content" class="news-tab-content"></div>
<div id="markets-content" class="news-tab-content"></div>
<div id="personalized-content" class="news-tab-content"></div>
<div id="analysis-content" class="news-tab-content"></div>
<div id="live-content" class="news-tab-content"></div>

<!-- Filter Controls -->
<div id="categoryFilters"></div>
<div id="regionFilters"></div>
<select id="sortBy">
    <option value="relevance">Most Relevant</option>
    <option value="date">Most Recent</option>
    <option value="popularity">Most Popular</option>
</select>
<select id="sentimentFilter">
    <option value="">All Sentiments</option>
    <option value="positive">Positive</option>
    <option value="negative">Critical</option>
    <option value="neutral">Neutral</option>
    <option value="urgent">Breaking</option>
</select>

<!-- Location Display -->
<div id="userLocationDisplay"></div>
```

### Automatic Initialization

The system automatically initializes when the DOM is loaded:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedNews = new EnhancedNewsInterface();
});
```

## 🎯 Usage Examples

### 1. Basic News Search
```javascript
// Search for AI news
const searchInput = document.getElementById('newsSearch');
searchInput.value = 'artificial intelligence';
window.enhancedNews.performSearch();
```

### 2. Filter by Category
```javascript
// Filter for technology news
window.enhancedNews.toggleCategoryFilter('technology');
```

### 3. Set Region Filter
```javascript
// Show news from Asia
window.enhancedNews.toggleRegionFilter('asia');
```

### 4. Get User Location
```javascript
// Automatically detect and use user location
await window.enhancedNews.getUserLocation();
```

### 5. Switch News Views
```javascript
// Switch to trending view
await window.enhancedNews.switchNewsTab('trending');
```

## 🔒 Security & Rate Limits

### API Rate Limits
- **NewsAPI Free**: 1,000 requests/day
- **Google News RSS**: No official limits (use responsibly)
- **IP Geolocation Services**: Various limits depending on service

### Security Features
- API keys stored securely in environment variables
- Request rate limiting implemented
- Input validation and sanitization
- User authentication for personalized features
- CORS protection configured

## 🌍 Supported Regions & Languages

### Regions
- **Global**: Worldwide news
- **North America**: US, Canada, Mexico
- **Europe**: 20+ European countries
- **Asia**: Japan, Korea, China, India, Southeast Asia
- **Africa**: South Africa, Nigeria, Egypt, and more
- **South America**: Brazil, Argentina, Chile, and more
- **Oceania**: Australia, New Zealand
- **Middle East**: UAE, Saudi Arabia, Israel, and more

### Languages
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Hindi (hi)

### Categories
- **AI & Technology**: Artificial intelligence, machine learning, automation
- **Technology**: General tech news, startups, innovation
- **Business**: Economy, finance, markets, corporate news
- **Science**: Research, discoveries, studies
- **Health**: Medical news, healthcare, wellness
- **Politics**: Government, elections, policy
- **Sports**: All sports coverage
- **Entertainment**: Movies, music, celebrities
- **Climate**: Environment, sustainability, green tech
- **Cryptocurrency**: Bitcoin, blockchain, digital currencies

## 🧪 Testing the Integration

### 1. Basic Functionality Test
```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Test news options
curl http://localhost:8080/api/news/options
```

### 2. Search Test
```bash
# Search for AI news
curl "http://localhost:8080/api/news/search?q=artificial%20intelligence&pageSize=5"
```

### 3. Regional News Test
```bash
# Get news from Asia
curl "http://localhost:8080/api/news/filtered?regions=asia&limit=10"
```

### 4. Breaking News Test
```bash
# Get breaking news
curl "http://localhost:8080/api/news/breaking-enhanced?region=global"
```

## 📈 Analytics & Monitoring

### User Interaction Tracking
The system automatically tracks user interactions for authenticated users:

- News searches
- Article views
- Filter usage
- Preference changes
- Location detection

### Performance Monitoring
- Response times logged
- Cache hit rates monitored
- API rate limit usage tracked
- Error rates monitored

## 🎨 Customization

### Adding New News Sources
To add new RSS sources, modify the `RSS_SOURCES` array in `server-with-auth.js`:

```javascript
const RSS_SOURCES = [
    { name: 'Your News Source', url: 'https://your-source.com/rss.xml', category: 'technology' },
    // ... existing sources
];
```

### Custom Categories
Add new categories in `services/news-filter-service.js`:

```javascript
this.categoryFilters = {
    'your-category': {
        keywords: ['keyword1', 'keyword2'],
        sources: ['preferred-source'],
        boost: 1.5
    },
    // ... existing categories
};
```

### Styling
The system uses CSS classes that you can style:

```css
.article-card { /* News article cards */ }
.category-chip { /* Category filter buttons */ }
.region-chip { /* Region filter buttons */ }
.trending-topic { /* Trending topic items */ }
.live-article { /* Breaking news items */ }
```

## 🐛 Troubleshooting

### Common Issues

1. **No news loading**: Check if NewsAPI key is configured correctly
2. **Location detection failing**: Ensure geolocation services are accessible
3. **Search not working**: Verify search query format and API connectivity
4. **Filters not applying**: Check that filter parameters are properly formatted

### Error Handling
The system includes comprehensive error handling:
- Fallback to cached data when APIs are unavailable
- Graceful degradation when services are down
- User-friendly error messages
- Automatic retry mechanisms

### Debug Mode
Enable debug logging in `.env`:
```
DEBUG=true
LOG_LEVEL=debug
```

## 🚀 Future Enhancements

Planned features for future releases:

1. **AI-Powered News Analysis**: Automatic sentiment analysis and topic modeling
2. **Real-time Notifications**: Push notifications for breaking news
3. **Social Media Integration**: Include Twitter, Reddit feeds
4. **Advanced Analytics**: User engagement metrics and recommendations
5. **Mobile App**: React Native app for mobile access
6. **Voice Interface**: Voice commands for news interaction
7. **Collaborative Filtering**: Recommendation engine based on user behavior

## 📞 Support

For support and questions:

1. Check the troubleshooting section above
2. Review the API documentation
3. Check server logs for error messages
4. Test with smaller datasets first
5. Verify API key configurations

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Quick Start Example: "Show me AI-related news from Asia"

To test the example use case mentioned in the original request:

```bash
# Via API
curl "http://localhost:8080/api/news/ai-asia"

# Via Frontend
// JavaScript
window.enhancedNews.switchNewsTab('discover');
window.enhancedNews.toggleCategoryFilter('ai-technology');
window.enhancedNews.toggleRegionFilter('asia');
```

This will automatically fetch and display AI-related news from Asian countries, demonstrating the complete integration of real-time APIs with advanced filtering capabilities!
