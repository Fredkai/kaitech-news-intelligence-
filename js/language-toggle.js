/**
 * KaiTech News - Language Toggle & Translation System
 * Enhanced multi-language support with AI-powered translations
 */

// Language configuration with comprehensive language data
const LANGUAGES = {
    'en': {
        code: 'en',
        name: 'English',
        native: 'English',
        flag: '🇺🇸',
        rtl: false,
        enabled: true
    },
    'fr': {
        code: 'fr',
        name: 'French',
        native: 'Français',
        flag: '🇫🇷',
        rtl: false,
        enabled: true
    },
    'es': {
        code: 'es',
        name: 'Spanish',
        native: 'Español',
        flag: '🇪🇸',
        rtl: false,
        enabled: true
    },
    'de': {
        code: 'de',
        name: 'German',
        native: 'Deutsch',
        flag: '🇩🇪',
        rtl: false,
        enabled: true
    },
    'zh': {
        code: 'zh',
        name: 'Chinese',
        native: '中文',
        flag: '🇨🇳',
        rtl: false,
        enabled: true
    },
    'ar': {
        code: 'ar',
        name: 'Arabic',
        native: 'العربية',
        flag: '🇸🇦',
        rtl: true,
        enabled: true
    },
    'ja': {
        code: 'ja',
        name: 'Japanese',
        native: '日本語',
        flag: '🇯🇵',
        rtl: false,
        enabled: true
    },
    'ko': {
        code: 'ko',
        name: 'Korean',
        native: '한국어',
        flag: '🇰🇷',
        rtl: false,
        enabled: true
    },
    'it': {
        code: 'it',
        name: 'Italian',
        native: 'Italiano',
        flag: '🇮🇹',
        rtl: false,
        enabled: true
    },
    'pt': {
        code: 'pt',
        name: 'Portuguese',
        native: 'Português',
        flag: '🇵🇹',
        rtl: false,
        enabled: true
    },
    'ru': {
        code: 'ru',
        name: 'Russian',
        native: 'Русский',
        flag: '🇷🇺',
        rtl: false,
        enabled: true
    },
    'hi': {
        code: 'hi',
        name: 'Hindi',
        native: 'हिन्दी',
        flag: '🇮🇳',
        rtl: false,
        enabled: true
    }
};

class LanguageToggle {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'en';
        this.translationCache = new Map();
        this.isTranslating = false;
        this.observerInitialized = false;
        
        // Initialize the language toggle system
        this.init();
    }

    /**
     * Initialize the language toggle system
     */
    init() {
        this.createLanguageToggleUI();
        this.attachEventListeners();
        this.loadLanguagePreferences();
        this.initializeContentObserver();
        
        console.log('KaiTech Language Toggle System initialized');
        console.log(`Current language: ${this.currentLanguage}`);
    }

    /**
     * Create the language toggle UI components
     */
    createLanguageToggleUI() {
        const toggleContainer = document.getElementById('language-toggle-container');
        if (!toggleContainer) {
            console.warn('Language toggle container not found');
            return;
        }

        // Create the toggle button
        const toggleButton = this.createToggleButton();
        const dropdown = this.createLanguageDropdown();

        toggleContainer.appendChild(toggleButton);
        toggleContainer.appendChild(dropdown);
    }

    /**
     * Create the main toggle button
     */
    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'language-toggle-btn';
        button.id = 'language-toggle-btn';
        button.setAttribute('aria-label', 'Toggle language selection');
        
        const currentLang = LANGUAGES[this.currentLanguage];
        
        button.innerHTML = `
            <i class="fas fa-globe" aria-hidden="true"></i>
            <span class="current-language">
                <span class="flag-icon">${currentLang.flag}</span>
                <span class="lang-code">${currentLang.code.toUpperCase()}</span>
            </span>
        `;

        return button;
    }

    /**
     * Create the language dropdown menu
     */
    createLanguageDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'language-dropdown';
        dropdown.id = 'language-dropdown';
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-hidden', 'true');

        // Filter enabled languages
        const enabledLanguages = Object.values(LANGUAGES).filter(lang => lang.enabled);

        enabledLanguages.forEach(language => {
            const option = document.createElement('div');
            option.className = `language-option ${language.code === this.currentLanguage ? 'active' : ''}`;
            option.dataset.lang = language.code;
            option.setAttribute('role', 'menuitem');
            option.setAttribute('tabindex', '0');

            option.innerHTML = `
                <span class="flag-icon">${language.flag}</span>
                <div class="language-text">
                    <span class="language-name">${language.name}</span>
                    <span class="language-native">${language.native}</span>
                </div>
            `;

            dropdown.appendChild(option);
        });

        return dropdown;
    }

    /**
     * Attach event listeners for the language toggle
     */
    attachEventListeners() {
        // Toggle button click
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('#language-toggle-btn');
            const dropdown = document.getElementById('language-dropdown');
            
            if (toggleBtn) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown();
            } else if (!e.target.closest('#language-dropdown')) {
                // Close dropdown if clicking outside
                if (dropdown && dropdown.classList.contains('active')) {
                    this.closeDropdown();
                }
            }
        });

        // Language option selection
        document.addEventListener('click', (e) => {
            const languageOption = e.target.closest('.language-option');
            if (languageOption) {
                const langCode = languageOption.dataset.lang;
                this.changeLanguage(langCode);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const dropdown = document.getElementById('language-dropdown');
            if (dropdown && dropdown.classList.contains('active')) {
                this.handleKeyboardNavigation(e);
            }
        });

        // Handle dynamic content changes
        document.addEventListener('DOMContentLoaded', () => {
            this.translatePage();
        });
    }

    /**
     * Toggle the language dropdown
     */
    toggleDropdown() {
        const dropdown = document.getElementById('language-dropdown');
        const isActive = dropdown.classList.contains('active');
        
        if (isActive) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    /**
     * Open the language dropdown
     */
    openDropdown() {
        const dropdown = document.getElementById('language-dropdown');
        dropdown.classList.add('active');
        dropdown.setAttribute('aria-hidden', 'false');
        
        // Focus first option for accessibility
        const firstOption = dropdown.querySelector('.language-option');
        if (firstOption) {
            firstOption.focus();
        }
    }

    /**
     * Close the language dropdown
     */
    closeDropdown() {
        const dropdown = document.getElementById('language-dropdown');
        dropdown.classList.remove('active');
        dropdown.setAttribute('aria-hidden', 'true');
    }

    /**
     * Handle keyboard navigation in dropdown
     */
    handleKeyboardNavigation(e) {
        const dropdown = document.getElementById('language-dropdown');
        const options = dropdown.querySelectorAll('.language-option');
        const currentFocus = document.activeElement;
        const currentIndex = Array.from(options).indexOf(currentFocus);

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = Math.min(currentIndex + 1, options.length - 1);
                options[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = Math.max(currentIndex - 1, 0);
                options[prevIndex].focus();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (currentFocus && currentFocus.classList.contains('language-option')) {
                    const langCode = currentFocus.dataset.lang;
                    this.changeLanguage(langCode);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.closeDropdown();
                document.getElementById('language-toggle-btn').focus();
                break;
        }
    }

    /**
     * Change the current language
     */
    async changeLanguage(langCode) {
        if (!LANGUAGES[langCode] || !LANGUAGES[langCode].enabled) {
            console.warn(`Language ${langCode} is not supported or enabled`);
            return;
        }

        const previousLanguage = this.currentLanguage;
        this.currentLanguage = langCode;
        
        // Update UI immediately
        this.updateToggleButtonUI();
        this.updateActiveLanguageOption();
        this.closeDropdown();
        
        // Store preference
        this.storeLanguagePreference(langCode);
        
        // Apply RTL if necessary
        this.applyDirectionalChanges();
        
        // Translate page content
        await this.translatePage();
        
        // Dispatch language change event
        this.dispatchLanguageChangeEvent(previousLanguage, langCode);
        
        console.log(`Language changed from ${previousLanguage} to ${langCode}`);
    }

    /**
     * Update the toggle button UI with current language
     */
    updateToggleButtonUI() {
        const toggleBtn = document.getElementById('language-toggle-btn');
        const currentLang = LANGUAGES[this.currentLanguage];
        
        if (toggleBtn) {
            const currentLanguageSpan = toggleBtn.querySelector('.current-language');
            if (currentLanguageSpan) {
                currentLanguageSpan.innerHTML = `
                    <span class="flag-icon">${currentLang.flag}</span>
                    <span class="lang-code">${currentLang.code.toUpperCase()}</span>
                `;
            }
        }
    }

    /**
     * Update active language option in dropdown
     */
    updateActiveLanguageOption() {
        const dropdown = document.getElementById('language-dropdown');
        if (!dropdown) return;
        
        // Remove active class from all options
        dropdown.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to current language
        const currentOption = dropdown.querySelector(`[data-lang="${this.currentLanguage}"]`);
        if (currentOption) {
            currentOption.classList.add('active');
        }
    }

    /**
     * Apply directional changes for RTL languages
     */
    applyDirectionalChanges() {
        const currentLang = LANGUAGES[this.currentLanguage];
        const htmlElement = document.documentElement;
        
        if (currentLang.rtl) {
            htmlElement.setAttribute('dir', 'rtl');
            htmlElement.classList.add('rtl-language');
        } else {
            htmlElement.setAttribute('dir', 'ltr');
            htmlElement.classList.remove('rtl-language');
        }
    }

    /**
     * Translate the entire page content
     */
    async translatePage() {
        if (this.isTranslating) {
            console.log('Translation already in progress...');
            return;
        }

        this.isTranslating = true;
        console.log(`Translating page to ${this.currentLanguage}...`);

        // Show translation indicators
        this.showTranslationLoading();

        try {
            // Get all translatable elements
            const translatableElements = this.getTranslatableElements();
            
            // Translate in batches for better performance
            const batchSize = 10;
            for (let i = 0; i < translatableElements.length; i += batchSize) {
                const batch = translatableElements.slice(i, i + batchSize);
                await this.translateBatch(batch);
                
                // Small delay between batches to prevent overwhelming the browser
                await this.delay(100);
            }

            // Hide translation indicators
            this.hideTranslationLoading();
            
            console.log('Page translation completed');
        } catch (error) {
            console.error('Error translating page:', error);
            this.hideTranslationLoading();
        } finally {
            this.isTranslating = false;
        }
    }

    /**
     * Get all elements that should be translated
     */
    getTranslatableElements() {
        const selectors = [
            'h1, h2, h3, h4, h5, h6',
            'p:not(.no-translate)',
            '.news-title',
            '.news-excerpt',
            '.news-category',
            '.feature-card h3',
            '.feature-card p',
            '.stat-label',
            '.topic-card h3',
            '.topic-card p',
            '.trending-title',
            '.trending-excerpt',
            'button:not(.no-translate)',
            '.cta-button',
            '[data-translate="true"]'
        ];

        const elements = [];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                // Skip if already has translation badge or is marked as no-translate
                if (!el.classList.contains('no-translate') && 
                    !el.querySelector('.translation-badge') &&
                    el.textContent.trim().length > 0) {
                    elements.push(el);
                }
            });
        });

        return elements;
    }

    /**
     * Translate a batch of elements
     */
    async translateBatch(elements) {
        const promises = elements.map(element => this.translateElement(element));
        await Promise.all(promises);
    }

    /**
     * Translate a single element
     */
    async translateElement(element) {
        if (this.currentLanguage === 'en') {
            // If switching back to English, restore original text
            const originalText = element.dataset.originalText;
            if (originalText) {
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        node.textContent = originalText;
                    }
                });
                this.removeTranslationBadge(element);
            }
            return;
        }

        // Store original text if not already stored
        if (!element.dataset.originalText) {
            element.dataset.originalText = element.textContent.trim();
        }

        const originalText = element.dataset.originalText;
        if (!originalText || originalText.length === 0) return;

        // Check cache first
        const cacheKey = `${originalText}_${this.currentLanguage}`;
        if (this.translationCache.has(cacheKey)) {
            const translatedText = this.translationCache.get(cacheKey);
            this.updateElementText(element, translatedText, true);
            return;
        }

        // Simulate translation (in real implementation, this would call a translation API)
        try {
            const translatedText = await this.simulateTranslation(originalText, this.currentLanguage);
            
            // Cache the translation
            this.translationCache.set(cacheKey, translatedText);
            
            // Update the element
            this.updateElementText(element, translatedText, true);
        } catch (error) {
            console.error('Translation failed for element:', error);
        }
    }

    /**
     * Simulate translation (placeholder for real translation service)
     */
    async simulateTranslation(text, targetLanguage) {
        // Simulate API delay
        await this.delay(Math.random() * 500 + 200);
        
        // Mock translations for demonstration
        const mockTranslations = {
            'fr': text => `[FR] ${text}`,
            'es': text => `[ES] ${text}`,
            'de': text => `[DE] ${text}`,
            'zh': text => `[中文] ${text}`,
            'ar': text => `[AR] ${text}`,
            'ja': text => `[日本語] ${text}`,
            'ko': text => `[한국어] ${text}`,
            'it': text => `[IT] ${text}`,
            'pt': text => `[PT] ${text}`,
            'ru': text => `[RU] ${text}`,
            'hi': text => `[हिं] ${text}`
        };

        if (mockTranslations[targetLanguage]) {
            return mockTranslations[targetLanguage](text);
        }

        return text; // Return original if no mock available
    }

    /**
     * Update element text content and add translation badge
     */
    updateElementText(element, translatedText, showBadge = false) {
        // Update text content while preserving child elements
        const textNodes = this.getTextNodes(element);
        if (textNodes.length > 0) {
            textNodes[0].textContent = translatedText;
        } else {
            element.textContent = translatedText;
        }

        // Add or update translation badge
        if (showBadge) {
            this.addTranslationBadge(element);
        } else {
            this.removeTranslationBadge(element);
        }
    }

    /**
     * Get text nodes from an element
     */
    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim().length > 0) {
                textNodes.push(node);
            }
        }

        return textNodes;
    }

    /**
     * Add translation badge to an element
     */
    addTranslationBadge(element) {
        // Remove existing badge
        this.removeTranslationBadge(element);

        const badge = document.createElement('span');
        badge.className = `translation-badge ${this.currentLanguage}`;
        badge.title = `Translated to ${LANGUAGES[this.currentLanguage].name}`;
        badge.innerHTML = '<i class="fas fa-language"></i>';

        element.appendChild(badge);
    }

    /**
     * Remove translation badge from an element
     */
    removeTranslationBadge(element) {
        const existingBadge = element.querySelector('.translation-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    }

    /**
     * Show translation loading indicators
     */
    showTranslationLoading() {
        // Add a subtle loading indicator to the language toggle button
        const toggleBtn = document.getElementById('language-toggle-btn');
        if (toggleBtn) {
            toggleBtn.classList.add('translating');
            const icon = toggleBtn.querySelector('.fa-globe');
            if (icon) {
                icon.classList.add('fa-spin');
            }
        }

        // Show page-level loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'translation-loading';
        loadingIndicator.className = 'translation-loading-overlay';
        loadingIndicator.innerHTML = `
            <div class="loading-content">
                <i class="fas fa-language fa-spin"></i>
                <span>Translating to ${LANGUAGES[this.currentLanguage].name}...</span>
            </div>
        `;
        
        document.body.appendChild(loadingIndicator);
    }

    /**
     * Hide translation loading indicators
     */
    hideTranslationLoading() {
        const toggleBtn = document.getElementById('language-toggle-btn');
        if (toggleBtn) {
            toggleBtn.classList.remove('translating');
            const icon = toggleBtn.querySelector('.fa-globe');
            if (icon) {
                icon.classList.remove('fa-spin');
            }
        }

        const loadingIndicator = document.getElementById('translation-loading');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    /**
     * Initialize content observer for dynamic content
     */
    initializeContentObserver() {
        if (this.observerInitialized) return;

        const observer = new MutationObserver((mutations) => {
            let hasNewContent = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added content contains translatable text
                            const translatableElements = node.querySelectorAll 
                                ? node.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .news-title, .news-excerpt')
                                : [];
                            
                            if (translatableElements.length > 0 || 
                                (node.textContent && node.textContent.trim().length > 10)) {
                                hasNewContent = true;
                            }
                        }
                    });
                }
            });
            
            // Translate new content after a short delay
            if (hasNewContent && this.currentLanguage !== 'en') {
                setTimeout(() => {
                    this.translatePage();
                }, 500);
            }
        });

        // Observe changes to the main content areas
        const contentSelectors = [
            '#trendingNewsList',
            '.news-grid',
            '.news-content-container',
            '.trending-stories'
        ];

        contentSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                observer.observe(element, {
                    childList: true,
                    subtree: true
                });
            }
        });

        this.observerInitialized = true;
        console.log('Content observer initialized for dynamic translations');
    }

    /**
     * Get stored language preference
     */
    getStoredLanguage() {
        return localStorage.getItem('kaitech-language') || 
               navigator.language.split('-')[0] || 'en';
    }

    /**
     * Store language preference
     */
    storeLanguagePreference(langCode) {
        localStorage.setItem('kaitech-language', langCode);
        localStorage.setItem('kaitech-language-timestamp', Date.now().toString());
    }

    /**
     * Load language preferences and apply them
     */
    loadLanguagePreferences() {
        const storedLang = this.getStoredLanguage();
        if (storedLang && LANGUAGES[storedLang] && storedLang !== this.currentLanguage) {
            this.changeLanguage(storedLang);
        }
    }

    /**
     * Dispatch language change event
     */
    dispatchLanguageChangeEvent(previousLanguage, newLanguage) {
        const event = new CustomEvent('languageChanged', {
            detail: {
                previousLanguage,
                newLanguage,
                languageData: LANGUAGES[newLanguage]
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Utility function to create delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get translation statistics
     */
    getTranslationStats() {
        return {
            currentLanguage: this.currentLanguage,
            cacheSize: this.translationCache.size,
            supportedLanguages: Object.keys(LANGUAGES).filter(lang => LANGUAGES[lang].enabled),
            isTranslating: this.isTranslating
        };
    }

    /**
     * Clear translation cache
     */
    clearCache() {
        this.translationCache.clear();
        console.log('Translation cache cleared');
    }

    /**
     * Reset to default language
     */
    resetToDefault() {
        this.changeLanguage('en');
        localStorage.removeItem('kaitech-language');
        localStorage.removeItem('kaitech-language-timestamp');
    }
}

// Initialize the language toggle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if language toggle container exists
    if (document.getElementById('language-toggle-container')) {
        window.languageToggle = new LanguageToggle();
    } else {
        console.warn('Language toggle container not found. Retrying in 1 second...');
        setTimeout(() => {
            if (document.getElementById('language-toggle-container')) {
                window.languageToggle = new LanguageToggle();
            }
        }, 1000);
    }
});

// Add CSS for loading overlay
const loadingStyles = `
.translation-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(5px);
}

.loading-content {
    background: white;
    padding: 2rem 3rem;
    border-radius: 15px;
    text-align: center;
    color: var(--dark-text);
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.loading-content i {
    font-size: 2rem;
    color: var(--primary-blue);
    margin-bottom: 1rem;
}

.loading-content span {
    display: block;
    font-weight: 600;
    font-size: 1.1rem;
}

.language-toggle-btn.translating {
    opacity: 0.8;
    pointer-events: none;
}
`;

// Inject the loading styles
const styleSheet = document.createElement('style');
styleSheet.textContent = loadingStyles;
document.head.appendChild(styleSheet);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageToggle;
}

// CSS for the language toggle component
const languageToggleCSS = `
.language-toggle {
    position: relative;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.language-toggle.top-right {
    position: fixed;
    top: 20px;
    right: 20px;
}

.language-current {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fff;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.language-current:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0,123,255,0.15);
}

.language-current.loading {
    opacity: 0.7;
    cursor: wait;
}

.lang-flag {
    font-size: 16px;
}

.lang-name {
    color: #333;
}

.toggle-arrow {
    color: #666;
    font-size: 12px;
    transition: transform 0.2s ease;
}

.language-dropdown.show .toggle-arrow {
    transform: rotate(180deg);
}

.language-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 280px;
    background: #fff;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s ease;
    margin-top: 8px;
    max-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.language-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-header {
    padding: 16px;
    border-bottom: 1px solid #e1e5e9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dropdown-header h4 {
    margin: 0;
    font-size: 16px;
    color: #333;
}

.auto-translate-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
}

.toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.2s;
    border-radius: 24px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .toggle-slider {
    background-color: #007bff;
}

input:checked + .toggle-slider:before {
    transform: translateX(20px);
}

.toggle-label {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
}

.language-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}

.language-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s ease;
    border-left: 3px solid transparent;
}

.language-option:hover {
    background-color: #f8f9fa;
}

.language-option.active {
    background-color: #e3f2fd;
    border-left-color: #007bff;
}

.lang-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.lang-code {
    font-size: 11px;
    color: #666;
    font-weight: 600;
}

.active-indicator {
    color: #007bff;
    font-weight: bold;
}

.dropdown-footer {
    padding: 12px 16px;
    border-top: 1px solid #e1e5e9;
    background-color: #f8f9fa;
}

.show-all-languages {
    width: 100%;
    padding: 8px;
    background: none;
    border: 1px solid #e1e5e9;
    border-radius: 6px;
    color: #007bff;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.show-all-languages:hover {
    background-color: #fff;
    border-color: #007bff;
}

.translation-status {
    margin-top: 8px;
    font-size: 11px;
    text-align: center;
}

.status-inactive {
    color: #666;
}

.status-active {
    color: #28a745;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.status-indicator {
    width: 6px;
    height: 6px;
    background: #28a745;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

.language-notification {
    position: absolute;
    bottom: -40px;
    right: 0;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    pointer-events: none;
}

.language-notification.show {
    opacity: 1;
    transform: translateY(0);
}

.language-notification.success {
    background: #28a745;
}

.language-notification.error {
    background: #dc3545;
}

/* RTL support */
[dir="rtl"] .language-toggle.top-right {
    left: 20px;
    right: auto;
}

[dir="rtl"] .language-dropdown {
    left: 0;
    right: auto;
}

[dir="rtl"] .language-option {
    border-left: none;
    border-right: 3px solid transparent;
}

[dir="rtl"] .language-option.active {
    border-right-color: #007bff;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .language-toggle.top-right {
        top: 10px;
        right: 10px;
    }
    
    .language-dropdown {
        min-width: 260px;
        max-height: 300px;
    }
}
`;

// Inject CSS if not already present
if (!document.getElementById('language-toggle-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'language-toggle-styles';
    styleSheet.textContent = languageToggleCSS;
    document.head.appendChild(styleSheet);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageToggle;
} else {
    window.LanguageToggle = LanguageToggle;
}
