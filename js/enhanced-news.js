// KaiTech Voice of Time - Enhanced News Interface
// Advanced news filtering, search, and personalization functionality

class EnhancedNewsInterface {
    constructor() {
        this.currentView = 'discover';
        this.userLocation = null;
        this.availableOptions = null;
        this.newsCache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
        this.refreshInterval = null;
        this.currentFilters = {
            categories: [],
            regions: [],
            keywords: [],
            sentiment: null,
            sortBy: 'relevance'
        };
        
        // Translation properties
        this.translationService = null;
        this.currentLanguage = 'en';
        this.autoTranslateEnabled = true;
        this.translationCache = new Map();
        this.languageToggle = null;
        
        // Mock news data for immediate display
        this.mockNewsData = this.getMockNewsData();
        
        this.init();
    }

    getMockNewsData() {
        return {
            discover: [
                {
                    id: 'tech1',
                    title: 'AI Revolution: New Language Models Break Barriers',
                    description: 'Revolutionary AI models are transforming how we communicate across languages, making real-time translation more accurate than ever before.',
                    category: 'Technology',
                    source: 'TechNews Today',
                    time: '2 hours ago',
                    image: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=AI+Tech',
                    trending: 95,
                    sentiment: 'positive'
                },
                {
                    id: 'world1',
                    title: 'Global Climate Summit Reaches Historic Agreement',
                    description: 'World leaders unite on ambitious climate goals, promising revolutionary changes in renewable energy and sustainability practices.',
                    category: 'World News',
                    source: 'Global Report',
                    time: '4 hours ago',
                    image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Climate',
                    trending: 88,
                    sentiment: 'positive'
                },
                {
                    id: 'business1',
                    title: 'Cryptocurrency Market Sees Major Innovation Wave',
                    description: 'New blockchain technologies are reshaping digital finance with improved security and efficiency for global transactions.',
                    category: 'Business',
                    source: 'Financial Times',
                    time: '1 hour ago',
                    image: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Crypto',
                    trending: 92,
                    sentiment: 'positive'
                }
            ],
            trending: [
                {
                    id: 'trend1',
                    title: 'Breaking: Space Technology Breakthrough Announced',
                    description: 'Scientists achieve major milestone in space exploration technology, opening new possibilities for interplanetary travel.',
                    category: 'Science',
                    source: 'Space Daily',
                    time: '30 minutes ago',
                    image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Space',
                    trending: 98,
                    sentiment: 'positive'
                },
                {
                    id: 'trend2',
                    title: 'Revolutionary Medical Treatment Shows Promise',
                    description: 'New medical breakthrough offers hope for treating previously incurable conditions with innovative gene therapy approaches.',
                    category: 'Health',
                    source: 'Medical Journal',
                    time: '1 hour ago',
                    image: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=Medical',
                    trending: 94,
                    sentiment: 'positive'
                }
            ],
            markets: [
                {
                    id: 'market1',
                    title: 'Tech Stocks Rally on Innovation News',
                    description: 'Technology sector sees significant gains as investors react positively to breakthrough announcements and future growth prospects.',
                    category: 'Markets',
                    source: 'Market Watch',
                    time: '45 minutes ago',
                    image: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Stocks',
                    trending: 87,
                    sentiment: 'positive'
                }
            ],
            foryou: [
                {
                    id: 'personal1',
                    title: 'AI-Powered Language Learning Revolution',
                    description: 'New artificial intelligence technologies are making language learning more personalized and effective for millions of users worldwide.',
                    category: 'Technology',
                    source: 'EdTech Weekly',
                    time: '3 hours ago',
                    image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=AI+Learn',
                    trending: 89,
                    sentiment: 'positive'
                }
            ],
            analysis: [
                {
                    id: 'analysis1',
                    title: 'Deep Dive: The Future of Multi-Language Communication',
                    description: 'Comprehensive analysis of how emerging technologies are breaking down language barriers and creating a more connected world.',
                    category: 'Analysis',
                    source: 'Tech Analysis',
                    time: '5 hours ago',
                    image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Analysis',
                    trending: 85,
                    sentiment: 'neutral'
                }
            ],
            live: [
                {
                    id: 'live1',
                    title: 'LIVE: Global Tech Conference 2025',
                    description: 'Follow live updates from the world\'s largest technology conference featuring groundbreaking announcements and innovations.',
                    category: 'Live',
                    source: 'Live News',
                    time: 'Live now',
                    image: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=LIVE',
                    trending: 96,
                    sentiment: 'positive',
                    isLive: true
                }
            ]
        };
    }

    async init() {
        console.log('🚀 Initializing Enhanced News Interface');
        
        // Load user location
        await this.getUserLocation();
        
        // Load available options
        await this.loadAvailableOptions();
        
        // Initialize translation service
        await this.initializeTranslation();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial news
        await this.loadDiscoverNews();
        
        // Set up auto-refresh if enabled
        this.setupAutoRefresh();
    }

    async getUserLocation() {
        try {
            const response = await fetch('/api/news/location');
            if (response.ok) {
                const data = await response.json();
                this.userLocation = data.location;
                console.log('📍 User location detected:', this.userLocation);
                
                // Update UI with location info
                this.updateLocationDisplay();
            }
        } catch (error) {
            console.warn('Failed to get user location:', error);
        }
    }

    async loadAvailableOptions() {
        try {
            const response = await fetch('/api/news/options');
            if (response.ok) {
                const data = await response.json();
                this.availableOptions = data.options;
                console.log('⚙️ Loaded news options:', this.availableOptions);
                
                // Populate filter UI
                this.populateFilterOptions();
            }
        } catch (error) {
            console.error('Failed to load options:', error);
        }
    }

    setupEventListeners() {
        // News tab switching
        document.querySelectorAll('.news-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.switchNewsTab(tabName);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('newsSearch');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // AI Assistant button
        const aiAssistantBtn = document.querySelector('.ai-assistant-btn');
        if (aiAssistantBtn) {
            aiAssistantBtn.addEventListener('click', () => this.openAIAssistant());
        }

        // Filter controls
        this.setupFilterControls();

        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enableAutoRefresh();
                } else {
                    this.disableAutoRefresh();
                }
            });
        }

        // Category filter chips
        document.addEventListener('click', (e) => {
            if (e.target.matches('.category-chip')) {
                this.toggleCategoryFilter(e.target.dataset.category);
            }
            if (e.target.matches('.region-chip')) {
                this.toggleRegionFilter(e.target.dataset.region);
            }
        });
    }

    setupFilterControls() {
        // Category filters
        const categoryContainer = document.getElementById('categoryFilters');
        if (categoryContainer && this.availableOptions) {
            this.renderCategoryFilters(categoryContainer);
        }

        // Region filters
        const regionContainer = document.getElementById('regionFilters');
        if (regionContainer && this.availableOptions) {
            this.renderRegionFilters(regionContainer);
        }

        // Sort options
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.refreshCurrentView();
            });
        }

        // Sentiment filter
        const sentimentSelect = document.getElementById('sentimentFilter');
        if (sentimentSelect) {
            sentimentSelect.addEventListener('change', (e) => {
                this.currentFilters.sentiment = e.target.value || null;
                this.refreshCurrentView();
            });
        }
    }

    renderCategoryFilters(container) {
        if (!this.availableOptions?.categories?.custom) return;

        const categories = Object.entries(this.availableOptions.categories.custom);
        const filtersHTML = categories.map(([key, config]) => `
            <button class="category-chip" data-category="${key}" style="border-color: ${config.color}">
                <span class="chip-icon" style="background: ${config.color}"></span>
                ${config.display}
            </button>
        `).join('');

        container.innerHTML = `
            <div class="filter-section">
                <h4>📂 Categories</h4>
                <div class="filter-chips">
                    ${filtersHTML}
                </div>
            </div>
        `;
    }

    renderRegionFilters(container) {
        if (!this.availableOptions?.regions?.groups) return;

        const regions = this.availableOptions.regions.groups;
        const filtersHTML = regions.map(region => {
            const config = this.availableOptions.regions.google?.[region] || { display: region, flag: '🌍' };
            return `
                <button class="region-chip" data-region="${region}">
                    <span class="region-flag">${config.flag || '🌍'}</span>
                    ${config.display || region}
                </button>
            `;
        }).join('');

        container.innerHTML = `
            <div class="filter-section">
                <h4>🌍 Regions</h4>
                <div class="filter-chips">
                    ${filtersHTML}
                </div>
            </div>
        `;
    }

    toggleCategoryFilter(category) {
        const index = this.currentFilters.categories.indexOf(category);
        if (index > -1) {
            this.currentFilters.categories.splice(index, 1);
        } else {
            this.currentFilters.categories.push(category);
        }
        
        this.updateFilterUI();
        this.refreshCurrentView();
    }

    toggleRegionFilter(region) {
        const index = this.currentFilters.regions.indexOf(region);
        if (index > -1) {
            this.currentFilters.regions.splice(index, 1);
        } else {
            this.currentFilters.regions.push(region);
        }
        
        this.updateFilterUI();
        this.refreshCurrentView();
    }

    updateFilterUI() {
        // Update category chips
        document.querySelectorAll('.category-chip').forEach(chip => {
            const category = chip.dataset.category;
            chip.classList.toggle('active', this.currentFilters.categories.includes(category));
        });

        // Update region chips
        document.querySelectorAll('.region-chip').forEach(chip => {
            const region = chip.dataset.region;
            chip.classList.toggle('active', this.currentFilters.regions.includes(region));
        });
    }

    updateLocationDisplay() {
        if (!this.userLocation) return;

        const locationDisplay = document.getElementById('userLocationDisplay');
        if (locationDisplay) {
            locationDisplay.innerHTML = `
                <div class="location-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${this.userLocation.city || 'Unknown City'}, ${this.userLocation.country || 'Unknown'}</span>
                    <small>News personalized for ${this.userLocation.newsRegion || 'global'} region</small>
                </div>
            `;
        }
    }

    async switchNewsTab(tabName) {
        // Update active tab
        document.querySelectorAll('.news-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Hide all content panels
        document.querySelectorAll('.news-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected content panel
        const targetContent = document.getElementById(`${tabName}-content`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        this.currentView = tabName;

        // Load content for the tab
        switch (tabName) {
            case 'discover':
                await this.loadDiscoverNews();
                break;
            case 'trending':
                await this.loadTrendingNews();
                break;
            case 'markets':
                await this.loadMarketNews();
                break;
            case 'personalized':
                await this.loadPersonalizedNews();
                break;
            case 'analysis':
                await this.loadAnalysisNews();
                break;
            case 'live':
                await this.loadLiveNews();
                break;
        }
    }

    async loadDiscoverNews() {
        try {
            this.showLoadingState('discover-content');

            const params = new URLSearchParams({
                categories: this.currentFilters.categories.join(','),
                regions: this.currentFilters.regions.join(','),
                sortBy: this.currentFilters.sortBy,
                limit: '30'
            });

            if (this.currentFilters.sentiment) {
                params.append('sentiment', this.currentFilters.sentiment);
            }

            try {
                const response = await fetch(`/api/news/filtered?${params}`);
                const data = await response.json();

                if (data.success) {
                    // Translate articles if needed
                    const articles = await this.translateArticles(data.articles);
                    this.renderArticles('discover-content', articles, 'Discover');
                    this.cacheResult('discover', articles);
                    return;
                }
            } catch (apiError) {
                console.warn('API not available, using mock data:', apiError.message);
            }

            // Fallback to mock data
            const mockArticles = this.mockNewsData.discover;
            const articles = await this.translateArticles(mockArticles);
            this.renderArticles('discover-content', articles, 'Discover News (Demo)');
            this.cacheResult('discover', articles);
            
        } catch (error) {
            console.error('Error loading discover news:', error);
            this.showError('discover-content', 'Error loading news');
        }
    }

    async loadTrendingNews() {
        try {
            this.showLoadingState('trending-content');

            try {
                const response = await fetch('/api/news/trending?limit=20');
                const data = await response.json();

                if (data.success) {
                    this.renderTrendingTopics('trending-content', data.trending_topics);
                    this.cacheResult('trending', data.trending_topics);
                    return;
                }
            } catch (apiError) {
                console.warn('API not available, using mock trending data:', apiError.message);
            }

            // Fallback to mock data
            const mockArticles = this.mockNewsData.trending;
            const articles = await this.translateArticles(mockArticles);
            this.renderArticles('trending-content', articles, 'Trending News (Demo)');
            this.cacheResult('trending', articles);
            
        } catch (error) {
            console.error('Error loading trending news:', error);
            this.showError('trending-content', 'Error loading trending topics');
        }
    }

    async loadMarketNews() {
        try {
            this.showLoadingState('markets-content');

            try {
                const response = await fetch('/api/news/search?q=market+economy+finance+business&category=business&sortBy=date&pageSize=25');
                const data = await response.json();

                if (data.success) {
                    // Translate articles if needed
                    const articles = await this.translateArticles(data.articles);
                    this.renderArticles('markets-content', articles, 'Market News');
                    return;
                }
            } catch (apiError) {
                console.warn('API not available, using mock market data:', apiError.message);
            }

            // Fallback to mock data
            const mockArticles = this.mockNewsData.markets;
            const articles = await this.translateArticles(mockArticles);
            this.renderArticles('markets-content', articles, 'Market News (Demo)');
            
        } catch (error) {
            console.error('Error loading market news:', error);
            this.showError('markets-content', 'Error loading market news');
        }
    }

    async loadPersonalizedNews() {
        try {
            this.showLoadingState('personalized-content');

            try {
                const response = await fetch('/api/news/personalized');
                const data = await response.json();

                if (data.success) {
                    // Translate articles if needed
                    const articles = await this.translateArticles(data.articles);
                    this.renderArticles('personalized-content', articles, 'Your Personalized Feed');
                    this.renderUserStats('personalized-content', data);
                    return;
                }
            } catch (apiError) {
                console.warn('API not available, using mock personalized data:', apiError.message);
            }

            // Fallback to mock data
            const mockArticles = this.mockNewsData.personalized;
            const articles = await this.translateArticles(mockArticles);
            this.renderArticles('personalized-content', articles, 'Personalized News (Demo)');
            
        } catch (error) {
            console.error('Error loading personalized news:', error);
            this.showError('personalized-content', 'Error loading personalized news');
        }
    }

    async loadAnalysisNews() {
        try {
            this.showLoadingState('analysis-content');

            try {
                const response = await fetch('/api/news/search?q=analysis+report+study&sortBy=relevance&pageSize=20');
                const data = await response.json();

                if (data.success) {
                    const articles = await this.translateArticles(data.articles);
                    this.renderArticles('analysis-content', articles, 'News Analysis');
                    return;
                }
            } catch (apiError) {
                console.warn('API not available, using mock analysis data:', apiError.message);
            }

            // Fallback to mock data
            const mockArticles = this.mockNewsData.analysis;
            const articles = await this.translateArticles(mockArticles);
            this.renderArticles('analysis-content', articles, 'News Analysis (Demo)');
            
        } catch (error) {
            console.error('Error loading analysis news:', error);
            this.showError('analysis-content', 'Error loading analysis');
        }
    }

    async loadLiveNews() {
        try {
            this.showLoadingState('live-content');

            try {
                const response = await fetch('/api/news/breaking-enhanced?region=' + (this.userLocation?.newsRegion || 'global'));
                const data = await response.json();

                if (data.success) {
                    // Translate articles if needed
                    const articles = await this.translateArticles(data.articles);
                    this.renderLiveNews('live-content', articles);
                    this.cacheResult('live', articles);
                    return;
                }
            } catch (apiError) {
                console.warn('API not available, using mock live data:', apiError.message);
            }

            // Fallback to mock data
            const mockArticles = this.mockNewsData.live;
            const articles = await this.translateArticles(mockArticles);
            this.renderLiveNews('live-content', articles);
            this.cacheResult('live', articles);
            
        } catch (error) {
            console.error('Error loading live news:', error);
            this.showError('live-content', 'Error loading live news');
        }
    }

    async performSearch() {
        const searchInput = document.getElementById('newsSearch');
        const query = searchInput?.value?.trim();

        if (!query) {
            this.showNotification('Please enter a search query', 'warning');
            return;
        }

        try {
            this.showLoadingState('search-results');

            try {
                const params = new URLSearchParams({
                    q: query,
                    pageSize: '30',
                    sortBy: this.currentFilters.sortBy
                });

                if (this.currentFilters.categories.length > 0) {
                    params.append('category', this.currentFilters.categories[0]);
                }

                if (this.currentFilters.regions.length > 0) {
                    params.append('region', this.currentFilters.regions[0]);
                }

                const response = await fetch(`/api/news/search?${params}`);
                const data = await response.json();

                if (data.success) {
                    // Translate articles if needed
                    const articles = await this.translateArticles(data.articles);
                    this.renderSearchResults(articles, query);
                    return;
                }
            } catch (apiError) {
                console.warn('API not available, using mock search results:', apiError.message);
            }

            // Fallback to filtered mock data based on search query
            const allMockArticles = [
                ...this.mockNewsData.discover,
                ...this.mockNewsData.trending,
                ...this.mockNewsData.markets,
                ...this.mockNewsData.personalized,
                ...this.mockNewsData.analysis,
                ...this.mockNewsData.live
            ];
            
            // Simple search filtering on titles and descriptions
            const filteredArticles = allMockArticles.filter(article => 
                article.title.toLowerCase().includes(query.toLowerCase()) ||
                article.description.toLowerCase().includes(query.toLowerCase())
            );
            
            const articles = await this.translateArticles(filteredArticles.slice(0, 20));
            this.renderSearchResults(articles, `${query} (Demo)`);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('search-results', 'Search failed');
        }
    }

    renderArticles(containerId, articles, title) {
        const container = document.getElementById(containerId);
        if (!container || !articles) return;

        const articlesHTML = articles.map(article => this.createArticleCard(article)).join('');

        container.innerHTML = `
            <div class="news-section-header">
                <h3>${title}</h3>
                <div class="news-meta">
                    <span class="article-count">${articles.length} articles</span>
                    <span class="last-updated">Updated: ${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
            <div class="news-grid">
                ${articlesHTML}
            </div>
        `;
    }

    renderTrendingTopics(containerId, topics) {
        const container = document.getElementById(containerId);
        if (!container || !topics) return;

        const topicsHTML = topics.map(topic => `
            <div class="trending-topic ${topic.trending ? 'hot' : ''}" onclick="searchTopic('${topic.topic}')">
                <div class="topic-info">
                    <h4>${topic.topic}</h4>
                    <span class="topic-count">${topic.count} mentions</span>
                </div>
                <div class="topic-indicator">
                    ${topic.trending ? '🔥' : '📈'}
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="trending-header">
                <h3>📈 Trending Topics</h3>
                <p>What's being talked about right now</p>
            </div>
            <div class="trending-grid">
                ${topicsHTML}
            </div>
        `;
    }

    renderLiveNews(containerId, articles) {
        const container = document.getElementById(containerId);
        if (!container || !articles) return;

        const liveArticlesHTML = articles.map(article => `
            <div class="live-article" onclick="openArticle('${article.url}')">
                <div class="live-indicator">🔴 LIVE</div>
                <div class="live-content">
                    <h4>${article.title}</h4>
                    <p>${article.description || ''}</p>
                    <div class="live-meta">
                        <span class="source">${article.source?.name || 'Unknown'}</span>
                        <span class="time">${this.formatTime(article.publishedAt || article.pubDate)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="live-header">
                <h3>🔴 Breaking News</h3>
                <div class="live-status">
                    <span class="status-indicator"></span>
                    Live updates
                </div>
            </div>
            <div class="live-feed">
                ${liveArticlesHTML}
            </div>
        `;
    }

    createArticleCard(article) {
        const timeAgo = this.formatTimeAgo(article.publishedAt || article.pubDate);
        const relevanceScore = article.relevanceScore || 0;
        const category = article.category || article.aiCategory || 'General';
        
        // Use translated content if available
        const title = article.translatedTitle || article.title;
        const description = article.translatedDescription || article.description || '';
        
        // Show translation indicator
        const isTranslated = article.translatedTitle && article.translatedTitle !== article.title;
        const translationBadge = isTranslated ? `
            <div class="translation-badge" title="Translated from ${article.originalLanguage?.toUpperCase() || 'original language'}">
                <i class="fas fa-language"></i>
                <span>${article.targetLanguage?.toUpperCase() || this.currentLanguage.toUpperCase()}</span>
            </div>
        ` : '';
        
        return `
            <div class="article-card ${isTranslated ? 'translated' : ''}" onclick="openArticle('${article.url || article.link}')">
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${title}" loading="lazy" onerror="this.style.display='none'">` : ''}
                <div class="article-content">
                    <div class="article-header">
                        <div class="article-category">${category}</div>
                        ${translationBadge}
                    </div>
                    <h3 class="article-title">${title}</h3>
                    <p class="article-description">${description.substring(0, 150)}...</p>
                    <div class="article-meta">
                        <span class="source">${article.source?.name || article.source || 'Unknown'}</span>
                        <span class="time">${timeAgo}</span>
                        ${relevanceScore > 0 ? `<span class="relevance">${relevanceScore}% relevant</span>` : ''}
                        ${isTranslated ? `<span class="translation-info">Translated by ${article.translationProvider || 'AI'}</span>` : ''}
                    </div>
                </div>
                <div class="article-actions">
                    <button class="save-btn" onclick="saveArticle(event, '${article.id || article.link}')">
                        <i class="fas fa-bookmark"></i>
                    </button>
                    <button class="share-btn" onclick="shareArticle(event, '${article.url || article.link}')">
                        <i class="fas fa-share"></i>
                    </button>
                    ${isTranslated ? `
                        <button class="translate-btn" onclick="showOriginal(event, '${article.id || article.link}')" title="Show original text">
                            <i class="fas fa-undo"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    showLoadingState(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading latest news...</p>
                </div>
            `;
        }
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-btn">Try Again</button>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation' : 'info'}-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString();
    }

    cacheResult(key, data) {
        this.newsCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    getCachedResult(key) {
        const cached = this.newsCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setupAutoRefresh() {
        // Check if auto-refresh should be enabled based on user preferences
        const autoRefreshEnabled = localStorage.getItem('autoRefresh') !== 'false';
        if (autoRefreshEnabled) {
            this.enableAutoRefresh();
        }
    }

    enableAutoRefresh() {
        if (this.refreshInterval) return;

        this.refreshInterval = setInterval(() => {
            this.refreshCurrentView();
        }, 300000); // 5 minutes

        localStorage.setItem('autoRefresh', 'true');
        console.log('✅ Auto-refresh enabled');
    }

    disableAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }

        localStorage.setItem('autoRefresh', 'false');
        console.log('❌ Auto-refresh disabled');
    }

    async refreshCurrentView() {
        console.log(`🔄 Refreshing ${this.currentView} view`);
        await this.switchNewsTab(this.currentView);
    }

    openAIAssistant() {
        this.showNotification('AI News Assistant opening soon!', 'info');
        // TODO: Implement AI assistant integration
    }

    populateFilterOptions() {
        // This method is called after options are loaded
        const categoryContainer = document.getElementById('categoryFilters');
        const regionContainer = document.getElementById('regionFilters');
        
        if (categoryContainer) {
            this.renderCategoryFilters(categoryContainer);
        }
        
        if (regionContainer) {
            this.renderRegionFilters(regionContainer);
        }
    }

    // =============================================
    // TRANSLATION METHODS
    // =============================================

    async initializeTranslation() {
        try {
            console.log('🌐 Initializing translation service...');
            
            // Load user translation preferences
            try {
                const response = await fetch('/api/translation/preferences');
                if (response.ok) {
                    const data = await response.json();
                    this.currentLanguage = data.preferences.language || 'en';
                    this.autoTranslateEnabled = data.preferences.autoTranslate !== false;
                    console.log('📋 Translation preferences loaded:', data.preferences);
                }
            } catch (prefError) {
                console.warn('Translation preferences API not available, using defaults:', prefError.message);
                this.currentLanguage = 'en';
                this.autoTranslateEnabled = false;
            }
            
            // Initialize language toggle if container exists
            const languageContainer = document.getElementById('languageToggleContainer');
            if (languageContainer && window.LanguageToggle) {
                this.languageToggle = new window.LanguageToggle('#languageToggleContainer', {
                    onLanguageChange: async (newLang, oldLang) => {
                        await this.onLanguageChange(newLang, oldLang);
                    },
                    onAutoTranslateChange: async (enabled) => {
                        await this.onAutoTranslateChange(enabled);
                    }
                });
            }
            
            console.log('✅ Translation service initialized');
        } catch (error) {
            console.warn('Translation initialization failed:', error);
        }
    }

    async onLanguageChange(newLang, oldLang) {
        console.log(`🔄 Language changed from ${oldLang} to ${newLang}`);
        this.currentLanguage = newLang;
        
        // Clear translation cache
        this.translationCache.clear();
        
        // Refresh current view with new language
        if (this.autoTranslateEnabled && newLang !== 'en') {
            await this.refreshCurrentView();
        }
    }

    async onAutoTranslateChange(enabled) {
        console.log(`🔧 Auto-translate ${enabled ? 'enabled' : 'disabled'}`);
        this.autoTranslateEnabled = enabled;
        
        // Refresh current view
        await this.refreshCurrentView();
    }

    async translateArticles(articles) {
        if (!this.autoTranslateEnabled || this.currentLanguage === 'en' || !articles || articles.length === 0) {
            return articles;
        }

        try {
            console.log(`📝 Translating ${articles.length} articles to ${this.currentLanguage}`);
            
            // Check cache first
            const cacheKey = this.getTranslationCacheKey(articles, this.currentLanguage);
            const cached = this.translationCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                console.log('📋 Using cached translations');
                return cached.articles;
            }

            try {
                const response = await fetch('/api/translation/articles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        articles: articles.slice(0, 20), // Limit to 20 articles for performance
                        targetLang: this.currentLanguage,
                        maxConcurrent: 3,
                        includeOriginal: false
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const translatedArticles = data.results || articles;
                    
                    // Cache the results
                    this.translationCache.set(cacheKey, {
                        articles: translatedArticles,
                        timestamp: Date.now()
                    });
                    
                    console.log(`✅ Successfully translated ${translatedArticles.length} articles`);
                    return translatedArticles;
                } else {
                    console.warn('Translation failed, returning original articles');
                    return articles;
                }
            } catch (translationError) {
                console.warn('Translation API not available, returning original articles:', translationError.message);
                return articles;
            }
        } catch (error) {
            console.error('Translation error:', error);
            return articles;
        }
    }

    async translateSingleArticle(article) {
        if (!this.autoTranslateEnabled || this.currentLanguage === 'en' || !article) {
            return article;
        }

        try {
            try {
                const response = await fetch('/api/translation/article', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        article: article,
                        targetLang: this.currentLanguage
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.article || article;
                } else {
                    console.warn('Single article translation failed');
                    return article;
                }
            } catch (translationError) {
                console.warn('Translation API not available for single article:', translationError.message);
                return article;
            }
        } catch (error) {
            console.error('Single article translation error:', error);
            return article;
        }
    }

    getTranslationCacheKey(articles, language) {
        const titles = articles.slice(0, 5).map(a => a.title).join('|');
        return `${language}-${Buffer.from(titles).toString('base64').substring(0, 20)}`;
    }

    // =============================================
    // MODIFIED NEWS LOADING METHODS
    // =============================================
}

// Global helper functions
window.openArticle = function(url) {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

window.saveArticle = function(event, articleId) {
    event.stopPropagation();
    console.log('Saving article:', articleId);
    // TODO: Implement save functionality
};

window.shareArticle = function(event, url) {
    event.stopPropagation();
    if (navigator.share) {
        navigator.share({ url: url });
    } else {
        navigator.clipboard.writeText(url);
        window.enhancedNews?.showNotification('Link copied to clipboard!', 'success');
    }
};

window.searchTopic = function(topic) {
    const searchInput = document.getElementById('newsSearch');
    if (searchInput) {
        searchInput.value = topic;
        window.enhancedNews?.performSearch();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedNews = new EnhancedNewsInterface();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedNewsInterface;
}
