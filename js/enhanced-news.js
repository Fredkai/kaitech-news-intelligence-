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
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Enhanced News Interface');
        
        // Load user location
        await this.getUserLocation();
        
        // Load available options
        await this.loadAvailableOptions();
        
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

            const response = await fetch(`/api/news/filtered?${params}`);
            const data = await response.json();

            if (data.success) {
                this.renderArticles('discover-content', data.articles, 'Discover');
                this.cacheResult('discover', data.articles);
            } else {
                this.showError('discover-content', 'Failed to load news');
            }
        } catch (error) {
            console.error('Error loading discover news:', error);
            this.showError('discover-content', 'Error loading news');
        }
    }

    async loadTrendingNews() {
        try {
            this.showLoadingState('trending-content');

            const response = await fetch('/api/news/trending?limit=20');
            const data = await response.json();

            if (data.success) {
                this.renderTrendingTopics('trending-content', data.trending_topics);
                this.cacheResult('trending', data.trending_topics);
            } else {
                this.showError('trending-content', 'Failed to load trending topics');
            }
        } catch (error) {
            console.error('Error loading trending news:', error);
            this.showError('trending-content', 'Error loading trending topics');
        }
    }

    async loadMarketNews() {
        try {
            this.showLoadingState('markets-content');

            const response = await fetch('/api/news/search?q=market+economy+finance+business&category=business&sortBy=date&pageSize=25');
            const data = await response.json();

            if (data.success) {
                this.renderArticles('markets-content', data.articles, 'Market News');
            } else {
                this.showError('markets-content', 'Failed to load market news');
            }
        } catch (error) {
            console.error('Error loading market news:', error);
            this.showError('markets-content', 'Error loading market news');
        }
    }

    async loadPersonalizedNews() {
        try {
            this.showLoadingState('personalized-content');

            const response = await fetch('/api/news/personalized');
            const data = await response.json();

            if (data.success) {
                this.renderArticles('personalized-content', data.articles, 'Your Personalized Feed');
                this.renderUserStats('personalized-content', data);
            } else {
                this.showError('personalized-content', 'Please log in for personalized news');
            }
        } catch (error) {
            console.error('Error loading personalized news:', error);
            this.showError('personalized-content', 'Error loading personalized news');
        }
    }

    async loadAnalysisNews() {
        try {
            this.showLoadingState('analysis-content');

            const response = await fetch('/api/news/search?q=analysis+report+study&sortBy=relevance&pageSize=20');
            const data = await response.json();

            if (data.success) {
                this.renderArticles('analysis-content', data.articles, 'News Analysis');
            } else {
                this.showError('analysis-content', 'Failed to load analysis');
            }
        } catch (error) {
            console.error('Error loading analysis news:', error);
            this.showError('analysis-content', 'Error loading analysis');
        }
    }

    async loadLiveNews() {
        try {
            this.showLoadingState('live-content');

            const response = await fetch('/api/news/breaking-enhanced?region=' + (this.userLocation?.newsRegion || 'global'));
            const data = await response.json();

            if (data.success) {
                this.renderLiveNews('live-content', data.articles);
                this.cacheResult('live', data.articles);
            } else {
                this.showError('live-content', 'Failed to load live news');
            }
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
                this.renderSearchResults(data.articles, query);
            } else {
                this.showError('search-results', `No results found for "${query}"`);
            }
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
        
        return `
            <div class="article-card" onclick="openArticle('${article.url || article.link}')">
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" loading="lazy" onerror="this.style.display='none'">` : ''}
                <div class="article-content">
                    <div class="article-category">${category}</div>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-description">${(article.description || '').substring(0, 150)}...</p>
                    <div class="article-meta">
                        <span class="source">${article.source?.name || article.source || 'Unknown'}</span>
                        <span class="time">${timeAgo}</span>
                        ${relevanceScore > 0 ? `<span class="relevance">${relevanceScore}% relevant</span>` : ''}
                    </div>
                </div>
                <div class="article-actions">
                    <button class="save-btn" onclick="saveArticle(event, '${article.id || article.link}')">
                        <i class="fas fa-bookmark"></i>
                    </button>
                    <button class="share-btn" onclick="shareArticle(event, '${article.url || article.link}')">
                        <i class="fas fa-share"></i>
                    </button>
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
