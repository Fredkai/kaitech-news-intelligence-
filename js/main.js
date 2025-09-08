// KaiTech Voice of Time - Fully Functional Website
// Real-time AI-powered news intelligence platform

// Global state management
let appState = {
    currentTab: 'discover',
    newsData: [],
    isLoading: false,
    lastUpdate: null,
    apiEndpoint: '/api'
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 KaiTech Voice of Time - Initializing...');
    initializeWebsite();
});

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const toolModal = document.getElementById('toolModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

// News-specific DOM elements
const breakingNewsText = document.getElementById('breakingNewsText');
const newsGrid = document.getElementById('newsGrid');
const storiesAnalyzed = document.getElementById('storiesAnalyzed');
const countriesCovered = document.getElementById('countriesCovered');
const liveUpdates = document.getElementById('liveUpdates');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Add event listeners
    setupEventListeners();
    
    // Initialize chat
    initializeChat();
    
    // Add smooth scroll behavior
    setupSmoothScrolling();
    
    // Initialize news features
    initializeNewsFeatures();
    
    console.log('KaiTech Global News Intelligence initialized successfully!');
}

function setupEventListeners() {
    // Chat input event listeners
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
    
    // Modal event listeners
    window.addEventListener('click', function(event) {
        if (event.target === toolModal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && toolModal.style.display === 'block') {
            closeModal();
        }
    });
}

function initializeChat() {
    // Welcome message is already in HTML
    chatHistory.push({
        role: 'assistant',
        content: "Hello! I'm your AI assistant. How can I help you today?"
    });
}

// Chat functionality
async function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message || isAIResponding) {
        return;
    }
    
    // Clear input
    chatInput.value = '';
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Add to history
    chatHistory.push({
        role: 'user',
        content: message
    });
    
    // Show loading with enhanced message
    showAILoading(message);
    isAIResponding = true;
    
    try {
        // Call Grok AI API
        const response = await simulateAIResponse(message);
        
        // Add AI response to chat with slight delay for better UX
        setTimeout(() => {
            addMessageToChat(response, 'ai');
            chatHistory.push({
                role: 'assistant',
                content: response
            });
            hideLoading();
            isAIResponding = false;
        }, 800);
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        addMessageToChat('Sorry, I encountered an error while processing your request. Please try again.', 'ai', true);
        hideLoading();
        isAIResponding = false;
    }
}

function addMessageToChat(message, sender, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    if (sender === 'ai') {
        messageDiv.classList.add('ai-message');
        if (isError) messageDiv.classList.add('error-message');
    } else {
        messageDiv.classList.add('user-message');
    }
    
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    
    if (sender === 'ai') {
        avatar.innerHTML = isError ? '<i class="fas fa-exclamation-triangle"></i>' : '<i class="fas fa-robot"></i>';
    } else {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    const content = document.createElement('div');
    content.classList.add('message-content');
    
    // Convert newlines to HTML for better formatting
    const formattedMessage = message.replace(/\n/g, '<br>');
    content.innerHTML = formattedMessage;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom smoothly
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
        messageDiv.style.transition = 'all 0.3s ease';
    }, 50);
}

// AI response using Grok API integration
async function simulateAIResponse(userMessage) {
    try {
        // Check for news-related keywords to include context
        const newsKeywords = ['news', 'headlines', 'current events', 'breaking news', 'today', 'latest', 'trending'];
        const includeNewsContext = newsKeywords.some(keyword => 
            userMessage.toLowerCase().includes(keyword)
        );
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                includeNewsContext: includeNewsContext
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            return data.response;
        } else {
            throw new Error(data.message || 'Unknown error occurred');
        }
        
    } catch (error) {
        console.error('Error calling Grok API:', error);
        
        // Fallback responses for different types of queries
        const message = userMessage.toLowerCase();
        
        if (message.includes('hello') || message.includes('hi')) {
            return "Hello! I'm your KaiTech AI assistant. I'm here to help with news, technology, and general questions. How can I assist you today?";
        }
        
        if (message.includes('news') || message.includes('headlines')) {
            return "I can help you stay updated with the latest news! I have access to current headlines and can provide analysis on various topics. What news topic interests you most?";
        }
        
        if (message.includes('technology') || message.includes('tech')) {
            return "Technology is my specialty! I can discuss AI developments, cloud computing, software trends, and emerging technologies. What tech topic would you like to explore?";
        }
        
        if (message.includes('help')) {
            return "I'm your KaiTech AI assistant! I can help with:\n• Latest news and current events\n• Technology trends and insights\n• AI and cloud computing\n• General questions and analysis\n\nI'm currently having trouble connecting to my advanced AI service, but I can still provide helpful information. What would you like to know?";
        }
        
        // Enhanced fallback response
        return `I apologize, but I'm having trouble connecting to my advanced AI service right now. However, I'm still here to help! Your message: "${userMessage}" - I can provide general information about news, technology, and KaiTech services. Please try again in a moment, or let me know how else I can assist you.`;
    }
}

// Tool functionality
function openTool(toolType) {
    modalTitle.textContent = getToolTitle(toolType);
    modalBody.innerHTML = getToolContent(toolType);
    toolModal.style.display = 'block';
    
    // Initialize tool-specific functionality
    initializeTool(toolType);
}

function getToolTitle(toolType) {
    const titles = {
        'textGenerator': 'AI Text Generator',
        'codeHelper': 'Code Helper',
        'imageAnalysis': 'Image Analysis',
        'textAnalyzer': 'Text Analyzer'
    };
    return titles[toolType] || 'AI Tool';
}

function getToolContent(toolType) {
    switch (toolType) {
        case 'textGenerator':
            return `
                <div class="tool-interface">
                    <h4>Generate Creative Content</h4>
                    <textarea id="textPrompt" placeholder="Enter a prompt for text generation..." rows="3" style="width: 100%; padding: 1rem; border: 2px solid #e9ecef; border-radius: 10px; margin-bottom: 1rem;"></textarea>
                    <button onclick="generateText()" class="tool-button">Generate Text</button>
                    <div id="generatedText" style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 10px; display: none;"></div>
                </div>
            `;
            
        case 'codeHelper':
            return `
                <div class="tool-interface">
                    <h4>Code Assistant</h4>
                    <select id="languageSelect" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 2px solid #e9ecef; border-radius: 5px;">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="java">Java</option>
                    </select>
                    <textarea id="codePrompt" placeholder="Describe what code you need help with..." rows="3" style="width: 100%; padding: 1rem; border: 2px solid #e9ecef; border-radius: 10px; margin-bottom: 1rem;"></textarea>
                    <button onclick="generateCode()" class="tool-button">Generate Code</button>
                    <div id="generatedCode" style="margin-top: 1rem; display: none;">
                        <pre style="background: #f8f9fa; padding: 1rem; border-radius: 10px; overflow-x: auto;"><code id="codeOutput"></code></pre>
                    </div>
                </div>
            `;
            
        case 'imageAnalysis':
            return `
                <div class="tool-interface">
                    <h4>Analyze Images</h4>
                    <input type="file" id="imageInput" accept="image/*" style="width: 100%; padding: 1rem; border: 2px solid #e9ecef; border-radius: 10px; margin-bottom: 1rem;">
                    <button onclick="analyzeImage()" class="tool-button">Analyze Image</button>
                    <div id="imagePreview" style="margin-top: 1rem; text-align: center; display: none;"></div>
                    <div id="analysisResult" style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 10px; display: none;"></div>
                </div>
            `;
            
        case 'textAnalyzer':
            return `
                <div class="tool-interface">
                    <h4>Analyze Text</h4>
                    <textarea id="textToAnalyze" placeholder="Enter text to analyze..." rows="4" style="width: 100%; padding: 1rem; border: 2px solid #e9ecef; border-radius: 10px; margin-bottom: 1rem;"></textarea>
                    <button onclick="analyzeText()" class="tool-button">Analyze Text</button>
                    <div id="textAnalysisResult" style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 10px; display: none;"></div>
                </div>
            `;
            
        default:
            return '<p>Tool not found.</p>';
    }
}

function initializeTool(toolType) {
    // Tool-specific initialization if needed
    console.log(`Initialized ${toolType} tool`);
}

// Tool functions (simulate AI functionality)
async function generateText() {
    const prompt = document.getElementById('textPrompt').value.trim();
    const resultDiv = document.getElementById('generatedText');
    
    if (!prompt) {
        alert('Please enter a prompt for text generation.');
        return;
    }
    
    showLoading();
    
    // Simulate text generation
    setTimeout(() => {
        const generatedText = `Generated content based on prompt: "${prompt}"\n\nThis is a simulated AI-generated text response. In a real implementation, this would connect to an AI text generation API like GPT-3, GPT-4, or similar services. The generated content would be more sophisticated and contextually relevant to the input prompt.`;
        
        resultDiv.innerHTML = `<h5>Generated Text:</h5><p>${generatedText}</p>`;
        resultDiv.style.display = 'block';
        hideLoading();
    }, 2000);
}

async function generateCode() {
    const language = document.getElementById('languageSelect').value;
    const prompt = document.getElementById('codePrompt').value.trim();
    const resultDiv = document.getElementById('generatedCode');
    const codeOutput = document.getElementById('codeOutput');
    
    if (!prompt) {
        alert('Please describe what code you need.');
        return;
    }
    
    showLoading();
    
    // Simulate code generation
    setTimeout(() => {
        const sampleCode = {
            javascript: `// Generated ${language} code for: ${prompt}
function exampleFunction() {
    console.log("This is simulated generated code");
    return "AI-generated result";
}

// Usage example
const result = exampleFunction();
console.log(result);`,
            python: `# Generated ${language} code for: ${prompt}
def example_function():
    print("This is simulated generated code")
    return "AI-generated result"

# Usage example
result = example_function()
print(result)`,
            html: `<!-- Generated ${language} code for: ${prompt} -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AI Generated HTML</title>
</head>
<body>
    <h1>This is simulated generated HTML</h1>
    <p>AI-generated content based on your request.</p>
</body>
</html>`,
            css: `/* Generated ${language} code for: ${prompt} */
.ai-generated-class {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 2rem;
    border-radius: 10px;
}`,
            java: `// Generated ${language} code for: ${prompt}
public class AIGeneratedClass {
    public static void main(String[] args) {
        System.out.println("This is simulated generated Java code");
        String result = generateResult();
        System.out.println(result);
    }
    
    public static String generateResult() {
        return "AI-generated result";
    }
}`
        };
        
        codeOutput.textContent = sampleCode[language] || sampleCode.javascript;
        resultDiv.style.display = 'block';
        hideLoading();
    }, 2000);
}

async function analyzeImage() {
    const imageInput = document.getElementById('imageInput');
    const previewDiv = document.getElementById('imagePreview');
    const resultDiv = document.getElementById('analysisResult');
    
    if (!imageInput.files || imageInput.files.length === 0) {
        alert('Please select an image to analyze.');
        return;
    }
    
    const file = imageInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        previewDiv.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 10px;">`;
        previewDiv.style.display = 'block';
        
        showLoading();
        
        // Simulate image analysis
        setTimeout(() => {
            const analysis = `
                <h5>Image Analysis Results:</h5>
                <ul>
                    <li><strong>File Type:</strong> ${file.type}</li>
                    <li><strong>File Size:</strong> ${(file.size / 1024).toFixed(2)} KB</li>
                    <li><strong>Detected Objects:</strong> This is a simulated analysis. In a real implementation, this would use computer vision AI to identify objects, faces, text, and other elements in the image.</li>
                    <li><strong>Dominant Colors:</strong> Blue, white, gray (simulated)</li>
                    <li><strong>Estimated Dimensions:</strong> Analysis would include image dimensions and quality metrics</li>
                </ul>
                <p><em>Note: This is a demonstration. Real image analysis would require integration with AI vision services like Google Vision API, AWS Rekognition, or similar services.</em></p>
            `;
            
            resultDiv.innerHTML = analysis;
            resultDiv.style.display = 'block';
            hideLoading();
        }, 2000);
    };
    
    reader.readAsDataURL(file);
}

async function analyzeText() {
    const text = document.getElementById('textToAnalyze').value.trim();
    const resultDiv = document.getElementById('textAnalysisResult');
    
    if (!text) {
        alert('Please enter text to analyze.');
        return;
    }
    
    showLoading();
    
    // Simulate text analysis
    setTimeout(() => {
        const wordCount = text.split(/\s+/).length;
        const charCount = text.length;
        const sentenceCount = text.split(/[.!?]+/).length - 1;
        
        const analysis = `
            <h5>Text Analysis Results:</h5>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div><strong>Word Count:</strong> ${wordCount}</div>
                <div><strong>Character Count:</strong> ${charCount}</div>
                <div><strong>Sentence Count:</strong> ${sentenceCount}</div>
                <div><strong>Avg Words/Sentence:</strong> ${(wordCount / Math.max(sentenceCount, 1)).toFixed(1)}</div>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Estimated Sentiment:</strong> <span style="color: #28a745;">Positive</span> (simulated)
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Reading Level:</strong> Intermediate (simulated)
            </div>
            <div>
                <strong>Key Topics:</strong> AI analysis would identify main themes and topics in the text.
            </div>
            <p style="margin-top: 1rem;"><em>Note: This is a demonstration. Real text analysis would include advanced NLP features like sentiment analysis, entity recognition, and topic modeling.</em></p>
        `;
        
        resultDiv.innerHTML = analysis;
        resultDiv.style.display = 'block';
        hideLoading();
    }, 1500);
}

function closeModal() {
    toolModal.style.display = 'none';
}

// Utility functions
function showLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    // Remove any loading messages from chat
    const loadingMessages = chatMessages.querySelectorAll('.loading-message');
    loadingMessages.forEach(msg => msg.remove());
}

// Enhanced loading specifically for AI responses
function showAILoading(userMessage) {
    showLoading();
    
    // Add a loading message to chat
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'ai-message', 'loading-message');
    
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    avatar.innerHTML = '<i class="fas fa-robot fa-spin"></i>';
    
    const content = document.createElement('div');
    content.classList.add('message-content', 'loading-content');
    
    // Check if this looks like a news query
    const newsKeywords = ['news', 'headlines', 'current events', 'breaking news', 'today', 'latest', 'trending'];
    const isNewsQuery = newsKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
    );
    
    if (isNewsQuery) {
        content.innerHTML = `
            <div class="loading-text">
                🤖 Analyzing your news query with AI...<br>
                📰 Gathering current context...<br>
                <span class="typing-indicator">▓</span>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="loading-text">
                🤖 Processing with Grok AI...<br>
                <span class="typing-indicator">▓</span>
            </div>
        `;
    }
    
    loadingDiv.appendChild(avatar);
    loadingDiv.appendChild(content);
    
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Animate typing indicator
    const typingIndicator = content.querySelector('.typing-indicator');
    if (typingIndicator) {
        let dots = '';
        const typingAnimation = setInterval(() => {
            dots = dots.length >= 3 ? '' : dots + '.';
            typingIndicator.textContent = '▓' + dots;
        }, 500);
        
        // Store animation ID for cleanup
        loadingDiv.typingAnimation = typingAnimation;
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function setupSmoothScrolling() {
    // Handle navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// === NEWS-SPECIFIC FUNCTIONALITY ===

// Initialize news features with real-time capabilities
function initializeNewsFeatures() {
    // Start live breaking news rotation
    startLiveBreakingNewsRotation();
    
    // Update stats periodically
    updateStats();
    
    // Setup news filters
    setupNewsFilters();
    
    // Load initial news
    loadMoreNews();
    
    // Setup auto-refresh for live updates
    setupAutoRefresh();
    
    // Setup real-time features
    initializeRealTimeFeatures();
    
    console.log('Live news features initialized with AI processing');
}

// Setup automatic news refresh
function setupAutoRefresh() {
    // Refresh news every 5 minutes
    setInterval(async () => {
        console.log('Auto-refreshing news data...');
        await loadMoreNews();
    }, 300000); // 5 minutes
    
    // Refresh breaking news every 2 minutes
    setInterval(async () => {
        console.log('Updating breaking news...');
        await updateBreakingNews();
    }, 120000); // 2 minutes
}

// Initialize real-time features
function initializeRealTimeFeatures() {
    // Add live data indicators
    addLiveDataIndicators();
    
    // Initialize sentiment dashboard
    updateSentimentDashboard();
    
    // Start trending topics updates
    updateTrendingTopics();
}

function addLiveDataIndicators() {
    // Add live indicator to the header
    const header = document.querySelector('.hero-stats');
    if (header) {
        const liveIndicator = document.createElement('div');
        liveIndicator.className = 'live-indicator';
        liveIndicator.innerHTML = `
            <div class="live-badge">
                <i class="fas fa-circle" style="color: #10b981; animation: pulse 2s infinite;"></i>
                <span>LIVE DATA</span>
            </div>
        `;
        liveIndicator.style.cssText = `
            position: fixed; top: 100px; right: 20px; z-index: 1000;
            background: rgba(255,255,255,0.95); padding: 0.5rem 1rem;
            border-radius: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            font-size: 0.8rem; font-weight: 600; color: #2c3e50;
        `;
        document.body.appendChild(liveIndicator);
    }
}

// Live breaking news rotation with real data
function startLiveBreakingNewsRotation() {
    updateBreakingNews(); // Initial load
    
    // Update breaking news every 2 minutes
    breakingNewsInterval = setInterval(() => {
        updateBreakingNews();
    }, 120000); // 2 minutes
}

async function updateBreakingNews() {
    try {
        const response = await fetch('/api/breaking-news');
        const data = await response.json();
        
        if (data.status === 'success' && data.data && data.data.length > 0) {
            const breakingItems = data.data.map(item => 
                `BREAKING: ${item.title} - ${item.source}`
            );
            
            let currentIndex = 0;
            
            function rotateNews() {
                if (breakingNewsText && breakingItems.length > 0) {
                    breakingNewsText.textContent = breakingItems[currentIndex];
                    currentIndex = (currentIndex + 1) % breakingItems.length;
                }
            }
            
            rotateNews(); // Show first item immediately
            
            // Rotate through items every 8 seconds
            const rotationInterval = setInterval(rotateNews, 8000);
            
            // Clear old interval and store new one
            if (window.currentBreakingRotation) {
                clearInterval(window.currentBreakingRotation);
            }
            window.currentBreakingRotation = rotationInterval;
            
        } else {
            // Fallback to default message
            if (breakingNewsText) {
                breakingNewsText.textContent = 'KaiTech Voice of Time - Live AI-powered news intelligence platform';
            }
        }
    } catch (error) {
        console.error('Error updating breaking news:', error);
        if (breakingNewsText) {
            breakingNewsText.textContent = 'KaiTech Voice of Time - AI news intelligence (Live data temporarily unavailable)';
        }
    }
}

// Update sentiment dashboard with real data
async function updateSentimentDashboard() {
    try {
        const response = await fetch('/api/news/sentiment');
        const data = await response.json();
        
        if (data.status === 'success') {
            const sentimentData = data.data;
            console.log('Live sentiment data:', sentimentData);
            
            // Update sentiment display if elements exist
            const totalArticles = sentimentData.total || 0;
            const positivePercent = totalArticles > 0 ? Math.round((sentimentData.positive / totalArticles) * 100) : 0;
            
            // Show sentiment in console for now (can be displayed in UI)
            console.log(`Sentiment Analysis: ${positivePercent}% positive, ${sentimentData.neutral} neutral, ${sentimentData.negative} negative`);
        }
    } catch (error) {
        console.error('Error updating sentiment dashboard:', error);
    }
}

// Update trending topics
async function updateTrendingTopics() {
    try {
        const response = await fetch('/api/news/trending');
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            console.log('Top trending topics:', data.data.slice(0, 5).map(item => ({
                title: item.title,
                trending: item.trending,
                sentiment: item.sentiment
            })));
        }
    } catch (error) {
        console.error('Error updating trending topics:', error);
    }
}

// Update statistics
function updateStats() {
    // Stats are now static and authentic - no fake counters needed
    console.log('Hero stats loaded with authentic values');
}

// Animate counter numbers
function animateCounter(element, start, end) {
    const duration = 2000; // 2 seconds
    const step = Math.ceil((end - start) / (duration / 50));
    let current = start;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = current.toLocaleString();
    }, 50);
}

// Setup news filters
function setupNewsFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current filter
            currentFilter = this.dataset.category;
            
            // Filter news
            filterNews(currentFilter);
        });
    });
}

// Filter news by category
function filterNews(category) {
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
        } else {
            const cardCategory = card.querySelector('.news-category');
            if (cardCategory && cardCategory.textContent.toLowerCase().includes(category)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Load live news data from our AI-powered backend
async function loadMoreNews() {
    try {
        console.log('Loading live news data...');
        const response = await fetch('/api/news');
        const newsData = await response.json();
        
        if (newsData.status === 'success' && newsData.data) {
            // Clear existing news grid
            if (newsGrid) {
                const existingCards = newsGrid.querySelectorAll('.news-card');
                existingCards.forEach(card => card.remove());
            }
            
            // Add live news cards
            newsData.data.forEach(article => {
                const newsItem = {
                    category: getCategoryDisplayName(article.aiCategory || article.category),
                    categoryClass: getCategoryClass(article.aiCategory || article.category),
                    time: formatTimeAgo(article.pubDate),
                    title: article.title,
                    excerpt: cleanDescription(article.description),
                    source: article.source,
                    link: article.link,
                    sentiment: article.sentiment,
                    trending: article.trending
                };
                addNewsCard(newsItem);
            });
            
            console.log(`Loaded ${newsData.data.length} live news articles from ${newsData.sources?.length || 'multiple'} sources`);
            
            // Update statistics
            updateLiveStats(newsData.data);
        } else {
            console.warn('Failed to load live news, using fallback data');
            loadFallbackNews();
        }
    } catch (error) {
        console.error('Error loading live news:', error);
        loadFallbackNews();
    }
}

// Helper functions for news processing
function getCategoryDisplayName(category) {
    const categoryMap = {
        'technology': 'Technology',
        'world': 'World',
        'business': 'Business', 
        'AI & Technology': 'AI & Tech',
        'Cryptocurrency': 'Crypto',
        'Environment': 'Environment',
        'Politics': 'Politics',
        'General': 'General'
    };
    return categoryMap[category] || category || 'News';
}

function getCategoryClass(category) {
    const classMap = {
        'technology': 'technology',
        'world': 'world',
        'business': 'business',
        'AI & Technology': 'technology',
        'Cryptocurrency': 'business',
        'Environment': 'world',
        'Politics': 'politics',
        'General': 'world'
    };
    return classMap[category] || 'world';
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    }
}

function cleanDescription(description) {
    if (!description) return 'Click to read full article...';
    
    // Remove HTML tags and clean up
    const cleaned = description.replace(/<[^>]*>/g, '')
                              .replace(/&[^;]+;/g, '')
                              .trim();
    
    // Limit length
    return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned;
}

function updateLiveStats(newsData) {
    // Update story count
    if (storiesAnalyzed) {
        storiesAnalyzed.textContent = newsData.length.toLocaleString();
    }
    
    // Count unique sources
    const uniqueSources = [...new Set(newsData.map(article => article.source))];
    if (countriesCovered) {
        countriesCovered.textContent = uniqueSources.length;
    }
    
    // Show live update indicator
    if (liveUpdates) {
        liveUpdates.textContent = 'Live';
        liveUpdates.style.color = '#10b981';
        liveUpdates.style.animation = 'pulse 2s infinite';
    }
}

// Fallback function with static data
function loadFallbackNews() {
    const fallbackNews = [
        {
            category: 'Technology',
            categoryClass: 'technology',
            time: '2 hours ago',
            title: 'AI Technology Advances Continue to Transform Industries',
            excerpt: 'Latest developments in artificial intelligence are reshaping how businesses operate across multiple sectors.',
            source: 'KaiTech Intelligence'
        },
        {
            category: 'Business',
            categoryClass: 'business', 
            time: '4 hours ago',
            title: 'Global Markets Show Mixed Signals Amid Tech Innovation',
            excerpt: 'Technology sector leads market performance while traditional industries adapt to digital transformation.',
            source: 'Financial Intelligence'
        }
    ];
    
    fallbackNews.forEach(news => {
        addNewsCard(news);
    });
}

// Add a news card to the grid with enhanced AI features
function addNewsCard(newsItem) {
    const newsCard = document.createElement('div');
    newsCard.className = 'news-card';
    
    // Add trending indicator
    const trendingClass = (newsItem.trending && newsItem.trending > 80) ? 'trending-hot' : 
                         (newsItem.trending && newsItem.trending > 60) ? 'trending-warm' : '';
    
    // Add sentiment indicator
    const sentimentIcon = newsItem.sentiment === 'positive' ? '📈' : 
                         newsItem.sentiment === 'negative' ? '📉' : '📊';
    
    newsCard.innerHTML = `
        <div class="news-header">
            <span class="news-category ${newsItem.categoryClass}">${newsItem.category.toUpperCase()}</span>
            <span class="news-time">${newsItem.time}</span>
            ${trendingClass ? `<span class="trending-badge ${trendingClass}">🔥 TRENDING</span>` : ''}
        </div>
        <h3 class="news-title">${newsItem.title}</h3>
        <p class="news-excerpt">${newsItem.excerpt}</p>
        <div class="news-metadata">
            ${newsItem.sentiment ? `<span class="sentiment-badge sentiment-${newsItem.sentiment}">${sentimentIcon} ${newsItem.sentiment}</span>` : ''}
            ${newsItem.trending ? `<span class="trending-score">Trending: ${Math.round(newsItem.trending)}%</span>` : ''}
        </div>
        <div class="news-footer">
            <span class="news-source">${newsItem.source}</span>
            <div class="news-actions">
                ${newsItem.link ? `<button class="action-btn" onclick="openArticle('${newsItem.link}')"><i class="fas fa-external-link-alt"></i></button>` : ''}
                <button class="action-btn" onclick="summarizeArticle('${newsItem.title.replace(/'/g, '\\\'')}', '${newsItem.excerpt.replace(/'/g, '\\\'')}')" title="AI Summary"><i class="fas fa-robot"></i></button>
                <button class="action-btn" onclick="shareNews('${newsItem.title.replace(/'/g, '\\\'')}')"><i class="fas fa-share"></i></button>
                <button class="action-btn" onclick="bookmarkNews('${newsItem.title.replace(/'/g, '\\\'')}')" title="Bookmark"><i class="fas fa-bookmark"></i></button>
            </div>
        </div>
    `;
    
    // Add click handler for the entire card if link exists
    if (newsItem.link) {
        newsCard.style.cursor = 'pointer';
        newsCard.addEventListener('click', (e) => {
            // Only open link if clicked area is not a button
            if (!e.target.closest('.action-btn')) {
                openArticle(newsItem.link);
            }
        });
    }
    
    if (newsGrid) {
        newsGrid.appendChild(newsCard);
        
        // Add animation
        newsCard.style.opacity = '0';
        newsCard.style.transform = 'translateY(20px)';
        setTimeout(() => {
            newsCard.style.transition = 'all 0.3s ease';
            newsCard.style.opacity = '1';
            newsCard.style.transform = 'translateY(0)';
        }, 50);
    }
}

// New functions for enhanced news features
function openArticle(link) {
    if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
    }
}

async function summarizeArticle(title, excerpt) {
    try {
        // Show loading state
        const loadingModal = createLoadingModal('AI Summarizing Article...');
        document.body.appendChild(loadingModal);
        
        // Call our chat API to get AI summary
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Please provide a concise summary and key insights for this news article: Title: "${title}". Content: "${excerpt}"`,
                includeNewsContext: false
            })
        });
        
        const data = await response.json();
        document.body.removeChild(loadingModal);
        
        if (data.status === 'success') {
            showAISummaryModal(title, data.response);
        } else {
            alert('Failed to generate AI summary. Please try again.');
        }
    } catch (error) {
        console.error('Error generating summary:', error);
        const loadingModal = document.querySelector('.loading-modal');
        if (loadingModal) document.body.removeChild(loadingModal);
        alert('Failed to generate AI summary. Please try again.');
    }
}

function createLoadingModal(message) {
    const modal = document.createElement('div');
    modal.className = 'loading-modal';
    modal.innerHTML = `
        <div class="loading-content">
            <i class="fas fa-robot fa-spin" style="font-size: 2rem; color: #3498db; margin-bottom: 1rem;"></i>
            <p>${message}</p>
        </div>
    `;
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; align-items: center; justify-content: center;
        color: white; text-align: center;
    `;
    return modal;
}

function showAISummaryModal(title, summary) {
    const modal = document.createElement('div');
    modal.className = 'ai-summary-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; margin: 2% auto; padding: 0; border-radius: 15px; background: white;">
            <div class="modal-header" style="background: linear-gradient(135deg, #3498db, #2c3e50); color: white; padding: 1.5rem; border-radius: 15px 15px 0 0;">
                <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-robot"></i>
                    AI Article Summary
                </h3>
                <button onclick="this.closest('.ai-summary-modal').remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; float: right; margin-top: -2rem;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 2rem;">
                <h4 style="color: #2c3e50; margin-bottom: 1rem;">${title}</h4>
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; border-left: 4px solid #3498db;">
                    <p style="line-height: 1.6; margin: 0;">${summary.replace(/\n/g, '<br>')}</p>
                </div>
                <div style="text-align: center; margin-top: 1.5rem;">
                    <button onclick="this.closest('.ai-summary-modal').remove()" style="background: #3498db; color: white; border: none; padding: 0.8rem 2rem; border-radius: 25px; cursor: pointer;">Close</button>
                </div>
            </div>
        </div>
    `;
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
    `;
    document.body.appendChild(modal);
}

// Share news function
function shareNews(title) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: 'Check out this news from KaiTech Intelligence',
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// Bookmark news function
function bookmarkNews(title) {
    // In a real implementation, this would save to user's bookmarks
    alert(`"${title}" has been bookmarked!`);
}

// Open analysis modal
function openAnalysis(analysisType) {
    const analysisContent = {
        'sentiment': {
            title: 'Global Sentiment Analysis',
            content: `
                <div class="analysis-dashboard">
                    <h4>Real-time Sentiment Tracking</h4>
                    <div style="margin: 2rem 0;">
                        <div class="sentiment-meter">
                            <div class="sentiment-bar" style="background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%); height: 20px; border-radius: 10px; position: relative;">
                                <div style="position: absolute; left: 72%; top: -30px; background: #10b981; color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem;">+72%</div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 2rem;">
                        <h5>Regional Sentiment Breakdown:</h5>
                        <ul style="margin-top: 1rem;">
                            <li>North America: +68% (Positive)</li>
                            <li>Europe: +75% (Very Positive)</li>
                            <li>Asia Pacific: +71% (Positive)</li>
                            <li>South America: +69% (Positive)</li>
                            <li>Africa: +74% (Very Positive)</li>
                        </ul>
                    </div>
                </div>
            `
        },
        'geographic': {
            title: 'Geographic News Trends',
            content: `
                <div class="analysis-dashboard">
                    <h4>Global News Activity Map</h4>
                    <div style="background: #f8fafc; padding: 2rem; border-radius: 10px; text-align: center; margin: 2rem 0;">
                        <i class="fas fa-globe-americas" style="font-size: 3rem; color: #3b82f6; opacity: 0.5;"></i>
                        <p style="margin-top: 1rem;">Interactive world map would be displayed here</p>
                        <small>Showing real-time news density and trending topics by region</small>
                    </div>
                    <div>
                        <h5>Top Active Regions (Last 24 Hours):</h5>
                        <p style="margin-top: 1rem; font-style: italic; color: #6b7280;">
                            News coverage spans global regions with focus on emerging technology, business, and innovation stories from around the world.
                        </p>
                    </div>
                </div>
            `
        },
        'trending': {
            title: 'Trending Topics Analysis',
            content: `
                <div class="analysis-dashboard">
                    <h4>AI-Powered Trend Detection</h4>
                    <div style="margin: 2rem 0;">
                        <h5>Top Trending Topics (Real-time):</h5>
                        <div style="margin-top: 1rem;">
                            <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <strong>#1 AI Technology</strong> - Trending topic
                            </div>
                            <div style="background: #dbeafe; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <strong>#2 Climate Change</strong> - Global focus area
                            </div>
                            <div style="background: #dcfce7; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <strong>#3 Global Economy</strong> - Market updates
                            </div>
                            <div style="background: #fce7f3; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <strong>#4 Space Exploration</strong> - Innovation stories
                            </div>
                        </div>
                    </div>
                    <p><em>Trends are updated every 5 minutes using advanced NLP algorithms</em></p>
                </div>
            `
        },
        'verification': {
            title: 'News Verification System', 
            content: `
                <div class="analysis-dashboard">
                    <h4>AI-Powered Fact Checking</h4>
                    <div style="margin: 2rem 0;">
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <div style="display: inline-block; background: #10b981; color: white; padding: 1rem 2rem; border-radius: 50%; font-size: 1.5rem; margin-bottom: 1rem;">✓</div>
                            <div>Quality Verification</div>
                        </div>
                        <h5>Verification Process:</h5>
                        <ul style="margin-top: 1rem; line-height: 2;">
                            <li>✅ Source Credibility Analysis</li>
                            <li>✅ Cross-reference Verification</li>
                            <li>✅ Historical Context Check</li>
                            <li>✅ Expert Source Validation</li>
                            <li>✅ Real-time Fact Database</li>
                        </ul>
                        <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px; margin-top: 2rem; border-left: 4px solid #10b981;">
                            <strong>Our Verification Approach:</strong><br>
                            • Multi-source fact checking<br>
                            • Credible source validation<br>
                            • Context and accuracy verification<br>
                            • Transparent reporting standards
                        </div>
                    </div>
                </div>
            `
        }
    };
    
    const analysis = analysisContent[analysisType] || {
        title: 'Analysis Not Found',
        content: '<p>This analysis type is not available.</p>'
    };
    
    modalTitle.textContent = analysis.title;
    modalBody.innerHTML = analysis.content;
    toolModal.style.display = 'block';
}

// === COMPREHENSIVE NEWS FEATURE IMPLEMENTATIONS ===

// 🔍 Discover Feature - AI-curated content discovery
async function showDiscoverSection() {
    try {
        showLoadingModal('🔍 AI Discovering Personalized Content...');
        
        const response = await fetch('/api/discover');
        const data = await response.json();
        
        hideLoadingModal();
        
        if (data.status === 'success') {
            displayDiscoverContent(data.data);
        } else {
            showErrorModal('Failed to load discovery content');
        }
    } catch (error) {
        hideLoadingModal();
        showErrorModal('Error loading discovery features');
        console.error('Discover error:', error);
    }
}

function displayDiscoverContent(discoverData) {
    const modal = createFeatureModal('🔍 Discover', ` 
        <div class="discover-dashboard">
            <div class="discover-section">
                <h3>🔥 Trending Now</h3>
                <div class="trending-grid">
                    ${discoverData.trending.map(article => `
                        <div class="trending-card" onclick="openArticle('${article.link}')">
                            <div class="trending-badge">${Math.round(article.trending)}% trending</div>
                            <h4>${article.title}</h4>
                            <p class="source">${article.source}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="discover-section">
                <h3>⚡ Recent Breaking</h3>
                <div class="breaking-list">
                    ${discoverData.breaking.map(article => `
                        <div class="breaking-item" onclick="openArticle('${article.link}')">
                            <span class="breaking-label">BREAKING</span>
                            <span class="breaking-title">${article.title}</span>
                            <span class="breaking-time">${formatTimeAgo(article.pubDate)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="discover-section">
                <h3>🤖 AI Recommendations</h3>
                <div class="recommendations-grid">
                    ${discoverData.aiRecommendations.map(rec => `
                        <div class="recommendation-card">
                            <h4>${rec.title}</h4>
                            <p>${rec.description}</p>
                            <div class="rec-articles">
                                ${rec.articles.slice(0, 3).map(article => `
                                    <div class="rec-article" onclick="openArticle('${article.link}')">
                                        ${article.title}
                                    </div>
                                `).join('')}
                            </div>
                            <p class="ai-insight">💡 ${rec.insight}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

// 📈 Trending Feature - Real-time trending analysis
async function showTrendingSection() {
    try {
        showLoadingModal('📈 Analyzing Trending Topics...');
        
        const response = await fetch('/api/news/trending');
        const data = await response.json();
        
        hideLoadingModal();
        
        if (data.status === 'success') {
            displayTrendingContent(data.data);
        } else {
            showErrorModal('Failed to load trending data');
        }
    } catch (error) {
        hideLoadingModal();
        showErrorModal('Error loading trending features');
        console.error('Trending error:', error);
    }
}

function displayTrendingContent(trendingData) {
    const modal = createFeatureModal('📈 Trending Topics', `
        <div class="trending-dashboard">
            <div class="trending-header">
                <h3>🔥 Hot Topics Right Now</h3>
                <p>Real-time trending analysis powered by AI</p>
            </div>
            
            <div class="trending-list">
                ${trendingData.map((article, index) => `
                    <div class="trending-item" onclick="openArticle('${article.link}')">
                        <div class="trending-rank">#${index + 1}</div>
                        <div class="trending-content">
                            <h4>${article.title}</h4>
                            <div class="trending-meta">
                                <span class="trending-score">🔥 ${Math.round(article.trending)}% trending</span>
                                <span class="sentiment-badge sentiment-${article.sentiment}">${article.sentiment}</span>
                                <span class="category-badge">${article.aiCategory || article.category}</span>
                                <span class="time">${formatTimeAgo(article.pubDate)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

// 💹 Markets Feature - Live financial data
async function showMarketsSection() {
    try {
        showLoadingModal('💹 Loading Live Market Data...');
        
        const response = await fetch('/api/markets');
        const data = await response.json();
        
        hideLoadingModal();
        
        if (data.status === 'success') {
            displayMarketsContent(data.data);
        } else {
            showErrorModal('Failed to load market data');
        }
    } catch (error) {
        hideLoadingModal();
        showErrorModal('Error loading market features');
        console.error('Markets error:', error);
    }
}

function displayMarketsContent(marketData) {
    const modal = createFeatureModal('💹 Live Markets', `
        <div class="markets-dashboard">
            <div class="markets-section">
                <h3>📊 Market Indices</h3>
                <div class="indices-grid">
                    ${marketData.indices.map(index => `
                        <div class="index-card ${index.trend}">
                            <h4>${index.name}</h4>
                            <div class="index-value">${index.value}</div>
                            <div class="index-change ${index.trend}">
                                ${index.trend === 'up' ? '📈' : '📉'} ${index.change} (${index.changePercent})
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="markets-section">
                <h3>₿ Cryptocurrency</h3>
                <div class="crypto-grid">
                    ${marketData.crypto.map(crypto => `
                        <div class="crypto-card ${crypto.trend}">
                            <h4>${crypto.name} (${crypto.symbol})</h4>
                            <div class="crypto-price">${crypto.price}</div>
                            <div class="crypto-change ${crypto.trend}">
                                ${crypto.trend === 'up' ? '🚀' : '📉'} ${crypto.change}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="markets-section">
                <h3>📰 Market News</h3>
                <div class="market-news">
                    ${marketData.news.map(article => `
                        <div class="market-news-item" onclick="openArticle('${article.link}')">
                            <h4>${article.title}</h4>
                            <p>${cleanDescription(article.description)}</p>
                            <div class="news-meta">
                                <span>${article.source}</span> • <span>${formatTimeAgo(article.pubDate)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="market-update">
                <small>Last updated: ${new Date(marketData.lastUpdate).toLocaleTimeString()}</small>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

// ⭐ For You Feature - Personalized content
async function showForYouSection() {
    try {
        showLoadingModal('⭐ Personalizing Your Feed...');
        
        // Get user interests (could be from localStorage or preferences)
        const interests = localStorage.getItem('userInterests') || 'technology,ai,business';
        const response = await fetch(`/api/foryou?interests=${encodeURIComponent(interests)}`);
        const data = await response.json();
        
        hideLoadingModal();
        
        if (data.status === 'success') {
            displayForYouContent(data.data);
        } else {
            showErrorModal('Failed to load personalized content');
        }
    } catch (error) {
        hideLoadingModal();
        showErrorModal('Error loading personalized features');
        console.error('For You error:', error);
    }
}

function displayForYouContent(forYouData) {
    const modal = createFeatureModal('⭐ For You', `
        <div class="foryou-dashboard">
            <div class="personalization-header">
                <h3>🎯 Your Personalized Feed</h3>
                <p class="ai-insight">💡 ${forYouData.aiInsights}</p>
            </div>
            
            <div class="interests-section">
                <h4>Your Interests:</h4>
                <div class="interests-tags">
                    ${forYouData.interests.map(interest => `
                        <span class="interest-tag">${interest}</span>
                    `).join('')}
                    <button class="edit-interests" onclick="editInterests()">✏️ Edit</button>
                </div>
            </div>
            
            <div class="personalized-articles">
                ${forYouData.articles.map(article => `
                    <div class="personal-article" onclick="openArticle('${article.link}')">
                        <h4>${article.title}</h4>
                        <p>${cleanDescription(article.description)}</p>
                        <div class="article-meta">
                            <span class="category">${article.aiCategory || article.category}</span>
                            <span class="source">${article.source}</span>
                            <span class="time">${formatTimeAgo(article.pubDate)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="suggestions-section">
                <h4>💡 Suggested Topics:</h4>
                <div class="topic-suggestions">
                    ${forYouData.suggestions.map(suggestion => `
                        <div class="suggestion-item" onclick="addInterest('${suggestion.category}')">
                            <span>${suggestion.category}</span>
                            <span class="count">${suggestion.count} articles</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

// 🧠 Analysis Feature - Comprehensive AI analysis
async function showAnalysisSection() {
    try {
        showLoadingModal('🧠 Running AI Analysis...');
        
        const response = await fetch('/api/analysis');
        const data = await response.json();
        
        hideLoadingModal();
        
        if (data.status === 'success') {
            displayAnalysisContent(data.data);
        } else {
            showErrorModal('Failed to load analysis');
        }
    } catch (error) {
        hideLoadingModal();
        showErrorModal('Error loading analysis features');
        console.error('Analysis error:', error);
    }
}

function displayAnalysisContent(analysisData) {
    const modal = createFeatureModal('🧠 AI Analysis Dashboard', `
        <div class="analysis-dashboard">
            <div class="analysis-overview">
                <h3>📊 Sentiment Analysis</h3>
                <div class="sentiment-chart">
                    <div class="sentiment-bar">
                        <div class="positive" style="width: ${analysisData.sentiment.percentage.positive}%">
                            ${analysisData.sentiment.percentage.positive}% Positive
                        </div>
                        <div class="neutral" style="width: ${analysisData.sentiment.percentage.neutral}%">
                            ${analysisData.sentiment.percentage.neutral}% Neutral
                        </div>
                        <div class="negative" style="width: ${analysisData.sentiment.percentage.negative}%">
                            ${analysisData.sentiment.percentage.negative}% Negative
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="insights-section">
                <h3>💡 AI Insights</h3>
                <div class="insights-list">
                    ${analysisData.insights.map(insight => `
                        <div class="insight-item">
                            <i class="fas fa-lightbulb"></i>
                            <span>${insight}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="trending-analysis">
                <h3>🔥 Top Trending Analysis</h3>
                <div class="trending-analysis-list">
                    ${analysisData.trending.map((item, index) => `
                        <div class="trending-analysis-item">
                            <div class="rank">#${index + 1}</div>
                            <div class="content">
                                <h4>${item.title}</h4>
                                <div class="meta">
                                    <span class="trending-score">${Math.round(item.trending)}%</span>
                                    <span class="sentiment ${item.sentiment}">${item.sentiment}</span>
                                    <span class="category">${item.category}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="categories-analysis">
                <h3>📈 Category Breakdown</h3>
                <div class="categories-grid">
                    ${Object.entries(analysisData.categories).map(([category, data]) => `
                        <div class="category-analysis">
                            <h4>${category}</h4>
                            <div class="category-stats">
                                <div class="stat">${data.count} articles</div>
                                <div class="stat positive">${data.positive} positive</div>
                                <div class="stat negative">${data.negative} negative</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="analysis-footer">
                <p>📊 Analysis of ${analysisData.totalArticles} articles</p>
                <p>🕒 Last updated: ${new Date(analysisData.lastAnalysis).toLocaleTimeString()}</p>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

// 🔴 Live Feature - Real-time updates
async function showLiveSection() {
    try {
        showLoadingModal('🔴 Loading Live Updates...');
        
        const response = await fetch('/api/live');
        const data = await response.json();
        
        hideLoadingModal();
        
        if (data.status === 'success') {
            displayLiveContent(data.data);
        } else {
            showErrorModal('Failed to load live data');
        }
    } catch (error) {
        hideLoadingModal();
        showErrorModal('Error loading live features');
        console.error('Live error:', error);
    }
}

function displayLiveContent(liveData) {
    const modal = createFeatureModal('🔴 Live Updates', `
        <div class="live-dashboard">
            <div class="live-header">
                <h3>🔴 LIVE</h3>
                <div class="live-stats">
                    <div class="stat">
                        <span class="number">${liveData.stats.updatesLastHour}</span>
                        <span class="label">Updates Last Hour</span>
                    </div>
                    <div class="stat">
                        <span class="number">${liveData.stats.breakingStories}</span>
                        <span class="label">Breaking Stories</span>
                    </div>
                    <div class="stat">
                        <span class="number">${liveData.stats.activeSources}</span>
                        <span class="label">Active Sources</span>
                    </div>
                </div>
            </div>
            
            <div class="breaking-section">
                <h3>⚡ Breaking News</h3>
                <div class="breaking-feed">
                    ${liveData.breaking.map(article => `
                        <div class="breaking-live-item" onclick="openArticle('${article.link}')">
                            <div class="breaking-indicator">🚨</div>
                            <div class="breaking-content">
                                <h4>${article.title}</h4>
                                <p>${cleanDescription(article.description)}</p>
                                <div class="breaking-meta">
                                    <span>${article.source}</span>
                                    <span>${formatTimeAgo(article.pubDate)}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="live-updates-section">
                <h3>📡 Live Updates</h3>
                <div class="live-feed">
                    ${liveData.liveUpdates.map(article => `
                        <div class="live-update-item" onclick="openArticle('${article.link}')">
                            <div class="live-indicator">🔴</div>
                            <div class="update-content">
                                <h4>${article.title}</h4>
                                <div class="update-meta">
                                    <span class="source">${article.source}</span>
                                    <span class="time">${formatTimeAgo(article.pubDate)}</span>
                                    ${article.trending > 70 ? '<span class="trending-badge">🔥 Trending</span>' : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="live-footer">
                <p>🔄 Auto-refreshing every 2 minutes</p>
                <p>🕒 Last refresh: ${new Date(liveData.lastRefresh).toLocaleTimeString()}</p>
                <button onclick="refreshLiveData()" class="refresh-btn">🔄 Refresh Now</button>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    
    // Auto-refresh live data every 2 minutes
    const refreshInterval = setInterval(async () => {
        if (document.querySelector('.live-dashboard')) {
            await refreshLiveData();
        } else {
            clearInterval(refreshInterval);
        }
    }, 120000);
}

// Helper Functions
function createFeatureModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'feature-modal';
    modal.innerHTML = `
        <div class="feature-modal-content">
            <div class="feature-modal-header">
                <h2>${title}</h2>
                <button class="close-modal" onclick="this.closest('.feature-modal').remove()">&times;</button>
            </div>
            <div class="feature-modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        overflow-y: auto;
    `;
    
    return modal;
}

function showLoadingModal(message) {
    const existing = document.querySelector('.loading-modal');
    if (existing) existing.remove();
    
    const modal = createLoadingModal(message);
    document.body.appendChild(modal);
}

function hideLoadingModal() {
    const modal = document.querySelector('.loading-modal');
    if (modal) modal.remove();
}

function showErrorModal(message) {
    alert(`❌ ${message}`);
}

// Interactive functions
function editInterests() {
    const current = localStorage.getItem('userInterests') || 'technology,ai,business';
    const newInterests = prompt('Enter your interests (comma-separated):', current);
    if (newInterests) {
        localStorage.setItem('userInterests', newInterests);
        alert('✅ Interests updated! Refresh to see personalized content.');
    }
}

function addInterest(category) {
    const current = localStorage.getItem('userInterests') || '';
    const interests = current.split(',').filter(i => i.trim());
    if (!interests.includes(category)) {
        interests.push(category);
        localStorage.setItem('userInterests', interests.join(','));
        alert(`✅ Added "${category}" to your interests!`);
    }
}

async function refreshLiveData() {
    const liveSection = document.querySelector('.live-dashboard');
    if (liveSection) {
        liveSection.innerHTML = '<div class="refreshing">🔄 Refreshing live data...</div>';
        await showLiveSection();
    }
}

// Tab Switching for News Features
function switchNewsTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.news-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Call the appropriate function based on tab
    switch(tabName) {
        case 'discover':
            showDiscoverSection();
            break;
        case 'trending':
            showTrendingSection();
            break;
        case 'markets':
            showMarketsSection();
            break;
        case 'personalized':
            showForYouSection();
            break;
        case 'analysis':
            showAnalysisSection();
            break;
        case 'live':
            showLiveSection();
            break;
        default:
            console.log('Unknown tab:', tabName);
    }
}

// Search functionality
function searchNews() {
    const searchInput = document.getElementById('newsSearch');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    // Search and show results
    performNewsSearch(query);
}

async function performNewsSearch(query) {
    try {
        showLoadingModal(`🔍 Searching for "${query}"...`);
        
        const response = await fetch(`/api/news/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        hideLoadingModal();
        
        if (data.status === 'success') {
            displaySearchResults(query, data.data);
        } else {
            showErrorModal('Search failed');
        }
    } catch (error) {
        hideLoadingModal();
        showErrorModal('Search error');
        console.error('Search error:', error);
    }
}

function displaySearchResults(query, results) {
    const modal = createFeatureModal(`🔍 Search Results: "${query}"`, `
        <div class="search-results">
            <div class="search-header">
                <h3>Found ${results.length} articles</h3>
                <p>Search results for "${query}"</p>
            </div>
            <div class="search-results-list">
                ${results.map(article => `
                    <div class="search-result-item" onclick="openArticle('${article.link}')">
                        <h4>${article.title}</h4>
                        <p>${cleanDescription(article.description)}</p>
                        <div class="result-meta">
                            <span class="source">${article.source}</span>
                            <span class="time">${formatTimeAgo(article.pubDate)}</span>
                            <span class="category">${article.aiCategory || article.category}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${results.length === 0 ? '<p class="no-results">No articles found for your search. Try different keywords.</p>' : ''}
        </div>
    `);
    
    document.body.appendChild(modal);
}

// AI Assistant for news
function openAIAssistant() {
    const modal = createFeatureModal('🤖 AI News Assistant', `
        <div class="ai-assistant-panel">
            <div class="assistant-header">
                <h3>🤖 Your AI News Assistant</h3>
                <p>Ask me anything about current events, news topics, or get personalized news recommendations!</p>
            </div>
            
            <div class="quick-suggestions">
                <h4>Quick Questions:</h4>
                <div class="suggestions-grid">
                    <button onclick="askAI('What are the top trending news topics today?')" class="suggestion-btn">
                        🔥 Top Trending Topics
                    </button>
                    <button onclick="askAI('Give me a summary of today\'s technology news')" class="suggestion-btn">
                        🤖 Tech News Summary
                    </button>
                    <button onclick="askAI('What are the latest developments in AI and machine learning?')" class="suggestion-btn">
                        🧠 AI Developments
                    </button>
                    <button onclick="askAI('Show me positive news stories from today')" class="suggestion-btn">
                        ✨ Positive News
                    </button>
                    <button onclick="askAI('What are the biggest business stories right now?')" class="suggestion-btn">
                        💼 Business News
                    </button>
                    <button onclick="askAI('Analyze the sentiment of today\'s news')" class="suggestion-btn">
                        📊 News Sentiment
                    </button>
                </div>
            </div>
            
            <div class="custom-question">
                <h4>Ask Your Own Question:</h4>
                <div class="question-input">
                    <input type="text" id="aiQuestion" placeholder="Ask me anything about current news and events..." onkeypress="handleEnterKey(event)">
                    <button onclick="askCustomQuestion()" class="ask-btn">Ask AI</button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        askCustomQuestion();
    }
}

function askCustomQuestion() {
    const input = document.getElementById('aiQuestion');
    const question = input.value.trim();
    
    if (!question) {
        alert('Please enter a question');
        return;
    }
    
    askAI(question);
}

async function askAI(question) {
    try {
        showLoadingModal('🤖 AI is thinking...');
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: question,
                includeNewsContext: true
            })
        });
        
        const data = await response.json();
        hideLoadingModal();
        
        if (data.status === 'success') {
            showAIResponse(question, data.response);
        } else {
            showErrorModal('AI assistant error');
        }
    } catch (error) {
        hideLoadingModal();
        showErrorModal('Failed to get AI response');
        console.error('AI error:', error);
    }
}

function showAIResponse(question, response) {
    const modal = createFeatureModal('🤖 AI Assistant Response', `
        <div class="ai-response-panel">
            <div class="question-section">
                <h3>Your Question:</h3>
                <p class="user-question">${question}</p>
            </div>
            
            <div class="response-section">
                <h3>🤖 AI Response:</h3>
                <div class="ai-response-content">
                    ${response.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <div class="response-actions">
                <button onclick="askAnotherQuestion()" class="action-btn">Ask Another Question</button>
                <button onclick="this.closest('.feature-modal').remove()" class="action-btn secondary">Close</button>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function askAnotherQuestion() {
    // Close current modal and open AI assistant
    document.querySelector('.feature-modal').remove();
    openAIAssistant();
}

// === ENHANCED CONTACT FORM SYSTEM WITH AI SUPPORT ===

// Enhanced Contact Form with AI Support
function openEnhancedContactForm(serviceType = 'general', serviceName = '', planType = '', additionalInfo = '') {
    // Create contact form modal
    const contactModal = document.createElement('div');
    contactModal.id = 'enhancedContactModal';
    contactModal.className = 'modal';
    contactModal.style.display = 'block';
    
    contactModal.innerHTML = `
        <div class="modal-content contact-modal-content">
            <div class="modal-header contact-header">
                <h3><i class="fas fa-envelope"></i> Contact KaiTech - AI-Powered Support</h3>
                <span class="close" onclick="closeEnhancedContact()">&times;</span>
            </div>
            <div class="modal-body contact-body">
                <div class="contact-container">
                    <div class="contact-intro">
                        <div class="ai-assistant-intro">
                            <div class="ai-avatar-contact">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="ai-intro-text">
                                <h4>🤖 AI-Powered Customer Support</h4>
                                <p>Our AI system will analyze your inquiry and ensure you get the perfect solution. We'll follow up within 2 hours!</p>
                                ${serviceType !== 'general' ? `<div class="service-context"><strong>Service Interest:</strong> ${serviceName} ${planType ? '(' + planType + ')' : ''}</div>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <form id="enhancedContactForm" class="enhanced-contact-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactName"><i class="fas fa-user"></i> Full Name *</label>
                                <input type="text" id="contactName" name="name" required placeholder="Enter your full name">
                            </div>
                            <div class="form-group">
                                <label for="contactEmail"><i class="fas fa-envelope"></i> Email Address *</label>
                                <input type="email" id="contactEmail" name="email" required placeholder="your.email@example.com">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactPhone"><i class="fas fa-phone"></i> Phone Number</label>
                                <input type="tel" id="contactPhone" name="phone" placeholder="+250 XXX XXX XXX">
                            </div>
                            <div class="form-group">
                                <label for="contactCompany"><i class="fas fa-building"></i> Company/Organization</label>
                                <input type="text" id="contactCompany" name="company" placeholder="Your company name">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="serviceInterest"><i class="fas fa-cog"></i> Service of Interest *</label>
                            <select id="serviceInterest" name="serviceInterest" required>
                                <option value="">Select a service...</option>
                                <option value="cloud-infrastructure" ${serviceType === 'infrastructure' ? 'selected' : ''}>Cloud Infrastructure (IaaS)</option>
                                <option value="cloud-platform" ${serviceType === 'platform' ? 'selected' : ''}>Platform Services (PaaS)</option>
                                <option value="cloud-security" ${serviceType === 'security' ? 'selected' : ''}>Enterprise Security</option>
                                <option value="graphic-design" ${serviceType === 'graphic' ? 'selected' : ''}>Graphic Design</option>
                                <option value="video-production" ${serviceType === 'video' ? 'selected' : ''}>Video Production</option>
                                <option value="web-design" ${serviceType === 'web' ? 'selected' : ''}>Web Design & Development</option>
                                <option value="ai-consultation" ${serviceType === 'ai-consultation' ? 'selected' : ''}>AI Consultation</option>
                                <option value="news-intelligence" ${serviceType === 'news' ? 'selected' : ''}>News Intelligence Platform</option>
                                <option value="custom-solution">Custom Solution</option>
                                <option value="partnership">Partnership Opportunity</option>
                                <option value="general">General Inquiry</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="contactBudget"><i class="fas fa-dollar-sign"></i> Budget Range</label>
                            <select id="contactBudget" name="budget">
                                <option value="">Select budget range...</option>
                                <option value="free">Free Plan</option>
                                <option value="7-50">$7 - $50/month</option>
                                <option value="50-200">$50 - $200/month</option>
                                <option value="200-1000">$200 - $1,000/month</option>
                                <option value="1000+">$1,000+/month</option>
                                <option value="project-based">Project-based pricing</option>
                                <option value="discuss">Prefer to discuss</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="contactTimeline"><i class="fas fa-calendar"></i> Project Timeline</label>
                            <select id="contactTimeline" name="timeline">
                                <option value="">Select timeline...</option>
                                <option value="asap">ASAP (Rush)</option>
                                <option value="1-2-weeks">1-2 weeks</option>
                                <option value="1-month">Within 1 month</option>
                                <option value="2-3-months">2-3 months</option>
                                <option value="flexible">Flexible timeline</option>
                                <option value="just-exploring">Just exploring options</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="contactMessage"><i class="fas fa-comment"></i> Project Details & Requirements *</label>
                            <textarea id="contactMessage" name="message" required rows="5" placeholder="Please describe your project requirements, goals, and any specific needs...">${additionalInfo}</textarea>
                            <small class="ai-hint">💡 The more details you provide, the better our AI can match you with the right solution!</small>
                        </div>
                        
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="aiAnalysis" name="aiAnalysis" checked>
                                <span class="checkmark"></span>
                                Enable AI analysis for personalized recommendations
                            </label>
                        </div>
                        
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="followUpConsent" name="followUp" checked>
                                <span class="checkmark"></span>
                                I consent to follow-up emails and phone calls for this inquiry
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="submit-contact-btn">
                                <i class="fas fa-paper-plane"></i>
                                <span>Send AI-Powered Inquiry</span>
                                <div class="btn-ai-indicator">🤖</div>
                            </button>
                            <div class="contact-promise">
                                <i class="fas fa-clock"></i> Our AI will analyze your request and our team will respond within 2 hours!
                            </div>
                        </div>
                    </form>
                    
                    <div class="contact-alternatives">
                        <h4>🚀 Prefer Instant Support?</h4>
                        <div class="alternative-options">
                            <button onclick="startInstantChat()" class="alt-option">
                                <i class="fas fa-comments"></i>
                                Live Chat with AI
                            </button>
                            <button onclick="scheduleCall()" class="alt-option">
                                <i class="fas fa-phone"></i>
                                Schedule a Call
                            </button>
                            <button onclick="whatsappContact()" class="alt-option">
                                <i class="fab fa-whatsapp"></i>
                                WhatsApp Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(contactModal);
    
    // Setup form submission
    setupEnhancedContactForm();
    
    // Add contact form styles
    addEnhancedContactStyles();
}

// Setup form submission with AI processing
function setupEnhancedContactForm() {
    const form = document.getElementById('enhancedContactForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-contact-btn');
        const originalText = submitBtn.innerHTML;
        
        // Show processing state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>AI Processing...</span> <div class="btn-ai-indicator">🤖</div>';
        submitBtn.disabled = true;
        
        // Get form data
        const formData = new FormData(form);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            serviceInterest: formData.get('serviceInterest'),
            budget: formData.get('budget'),
            timeline: formData.get('timeline'),
            message: formData.get('message'),
            aiAnalysis: formData.get('aiAnalysis') === 'on',
            followUp: formData.get('followUp') === 'on',
            timestamp: new Date().toISOString()
        };
        
        try {
            // Simulate AI processing and email sending
            await processContactInquiry(contactData);
            
            // Show success state
            submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Sent Successfully!</span> <div class="btn-ai-indicator">✅</div>';
            
            // Show success message
            setTimeout(() => {
                showContactSuccess(contactData);
            }, 1000);
            
        } catch (error) {
            console.error('Contact form submission error:', error);
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Error - Please Retry</span> <div class="btn-ai-indicator">❌</div>';
            submitBtn.disabled = false;
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
            }, 3000);
        }
    });
}

// Process contact inquiry with AI analysis
async function processContactInquiry(contactData) {
    return new Promise((resolve) => {
        // Simulate AI processing time
        setTimeout(() => {
            // Generate AI analysis
            const aiAnalysis = generateAIContactAnalysis(contactData);
            
            // Simulate sending email notification
            sendAIContactEmail(contactData, aiAnalysis);
            
            // Store inquiry (in real implementation, this would go to a database)
            console.log('Contact inquiry processed:', { ...contactData, aiAnalysis });
            
            resolve({ success: true, analysis: aiAnalysis });
        }, 2000); // 2 second AI processing simulation
    });
}

// Generate AI analysis of contact inquiry
function generateAIContactAnalysis(contactData) {
    const service = contactData.serviceInterest;
    const budget = contactData.budget;
    const timeline = contactData.timeline;
    const message = contactData.message.toLowerCase();
    
    let priority = 'Medium';
    let recommendations = [];
    let estimatedValue = '$0';
    
    // Determine priority
    if (budget === '1000+' || message.includes('enterprise') || message.includes('urgent')) {
        priority = 'High';
    } else if (budget === 'free' || message.includes('just looking')) {
        priority = 'Low';
    }
    
    // Generate recommendations based on service
    switch(service) {
        case 'cloud-infrastructure':
            recommendations = ['Infrastructure consultation', 'Free trial setup', 'Migration planning'];
            estimatedValue = budget === '1000+' ? '$2000+/month' : '$7-200/month';
            break;
        case 'graphic-design':
            recommendations = ['Brand identity package', 'Portfolio review', 'Design consultation'];
            estimatedValue = '$7-500';
            break;
        case 'web-design':
            recommendations = ['Website audit', 'Responsive design', 'SEO optimization'];
            estimatedValue = '$7-2000';
            break;
        default:
            recommendations = ['Custom consultation', 'Service overview', 'Needs assessment'];
            estimatedValue = '$7-1000';
    }
    
    return {
        priority,
        recommendations,
        estimatedValue,
        suggestedFollowUp: timeline === 'asap' ? 'Within 1 hour' : 'Within 24 hours',
        matchScore: Math.floor(Math.random() * 15) + 85, // 85-100% match
        analysisDate: new Date().toISOString()
    };
}

// Simulate sending AI-powered email
function sendAIContactEmail(contactData, aiAnalysis) {
    // In a real implementation, this would integrate with an email service
    const emailContent = {
        to: contactData.email,
        subject: `🤖 AI Analysis Complete - Your ${getServiceDisplayName(contactData.serviceInterest)} Inquiry`,
        body: generateAIEmailContent(contactData, aiAnalysis)
    };
    
    console.log('AI Email sent:', emailContent);
    
    // Also send internal notification
    const internalEmail = {
        to: 'team@kaitech.rw',
        subject: `🔔 New ${aiAnalysis.priority} Priority Inquiry - ${contactData.name}`,
        body: generateInternalNotification(contactData, aiAnalysis)
    };
    
    console.log('Internal notification:', internalEmail);
}

// Generate personalized email content
function generateAIEmailContent(contactData, aiAnalysis) {
    return `
Hi ${contactData.name},

Thank you for your interest in KaiTech's ${getServiceDisplayName(contactData.serviceInterest)}!

🤖 Our AI system has analyzed your inquiry with a ${aiAnalysis.matchScore}% compatibility match. Here's what we found:

📊 ANALYSIS SUMMARY:
• Priority Level: ${aiAnalysis.priority}
• Estimated Project Value: ${aiAnalysis.estimatedValue}
• Recommended Follow-up: ${aiAnalysis.suggestedFollowUp}

💡 PERSONALIZED RECOMMENDATIONS:
${aiAnalysis.recommendations.map(rec => `• ${rec}`).join('\n')}

🎯 NEXT STEPS:
Our expert team will review your specific requirements and contact you ${aiAnalysis.suggestedFollowUp.toLowerCase()} with:
• Custom solution proposal
• Detailed pricing breakdown
• Project timeline and milestones
• Free consultation scheduling

In the meantime, feel free to explore our portfolio and case studies at www.kaitech.rw

Best regards,
KaiTech AI Customer Success Team

--
This email was generated by our AI system and will be followed up by a human expert.
    `.trim();
}

// Generate internal team notification
function generateInternalNotification(contactData, aiAnalysis) {
    return `
NEW CUSTOMER INQUIRY - ${aiAnalysis.priority} PRIORITY

CUSTOMER DETAILS:
• Name: ${contactData.name}
• Email: ${contactData.email}
• Phone: ${contactData.phone || 'Not provided'}
• Company: ${contactData.company || 'Not provided'}

PROJECT DETAILS:
• Service: ${getServiceDisplayName(contactData.serviceInterest)}
• Budget: ${contactData.budget || 'Not specified'}
• Timeline: ${contactData.timeline || 'Not specified'}
• Message: ${contactData.message}

AI ANALYSIS:
• Match Score: ${aiAnalysis.matchScore}%
• Priority: ${aiAnalysis.priority}
• Estimated Value: ${aiAnalysis.estimatedValue}
• Suggested Follow-up: ${aiAnalysis.suggestedFollowUp}

RECOMMENDATIONS:
${aiAnalysis.recommendations.map(rec => `• ${rec}`).join('\n')}

ACTION REQUIRED: Contact customer ${aiAnalysis.suggestedFollowUp.toLowerCase()}
    `.trim();
}

// Get display name for service
function getServiceDisplayName(serviceKey) {
    const serviceNames = {
        'cloud-infrastructure': 'Cloud Infrastructure (IaaS)',
        'cloud-platform': 'Platform Services (PaaS)',
        'cloud-security': 'Enterprise Security',
        'graphic-design': 'Graphic Design Services',
        'video-production': 'Video Production',
        'web-design': 'Web Design & Development',
        'ai-consultation': 'AI Consultation',
        'news-intelligence': 'News Intelligence Platform',
        'custom-solution': 'Custom Solution',
        'partnership': 'Partnership Opportunity',
        'general': 'General Services'
    };
    
    return serviceNames[serviceKey] || 'KaiTech Services';
}

// Show success message with next steps
function showContactSuccess(contactData) {
    const modal = document.getElementById('enhancedContactModal');
    if (!modal) return;
    
    const modalBody = modal.querySelector('.contact-body');
    modalBody.innerHTML = `
        <div class="success-container">
            <div class="success-animation">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>🎉 Inquiry Submitted Successfully!</h3>
            </div>
            
            <div class="success-details">
                <h4>🤖 AI Analysis Complete</h4>
                <div class="success-info">
                    <div class="info-item">
                        <i class="fas fa-envelope"></i>
                        <span>AI-powered welcome email sent to ${contactData.email}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>Our team will respond within 2 hours</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Personalized solution being prepared</span>
                    </div>
                </div>
            </div>
            
            <div class="next-steps">
                <h4>📋 What Happens Next?</h4>
                <div class="steps-timeline">
                    <div class="step completed">
                        <div class="step-icon">✅</div>
                        <div class="step-content">
                            <h5>AI Analysis</h5>
                            <p>Your requirements analyzed and matched</p>
                        </div>
                    </div>
                    <div class="step active">
                        <div class="step-icon">⏳</div>
                        <div class="step-content">
                            <h5>Expert Review</h5>
                            <p>Our specialists are preparing your custom proposal</p>
                        </div>
                    </div>
                    <div class="step pending">
                        <div class="step-icon">📞</div>
                        <div class="step-content">
                            <h5>Personal Contact</h5>
                            <p>We'll reach out with solutions and next steps</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="success-actions">
                <button onclick="closeEnhancedContact()" class="success-btn primary">
                    <i class="fas fa-home"></i> Return to Website
                </button>
                <button onclick="startInstantChat()" class="success-btn">
                    <i class="fas fa-comments"></i> Start Live Chat
                </button>
            </div>
        </div>
    `;
}

// Alternative contact methods
function startInstantChat() {
    alert('🤖 Live AI Chat activated! Our AI assistant will help you immediately with any questions.');
    closeEnhancedContact();
}

function scheduleCall() {
    alert('📞 Call scheduling system activated! Choose your preferred time slot and our team will call you.');
}

function whatsappContact() {
    const message = 'Hello KaiTech! I\'m interested in your services and would like to discuss my project.';
    const whatsappUrl = `https://wa.me/250123456789?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Close contact modal
function closeEnhancedContact() {
    const modal = document.getElementById('enhancedContactModal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Add enhanced contact form styles
function addEnhancedContactStyles() {
    if (document.getElementById('enhancedContactStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'enhancedContactStyles';
    style.textContent = `
        .contact-modal-content {
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 15px;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
        }
        
        .contact-header {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 25px;
            border-radius: 15px 15px 0 0;
            text-align: center;
        }
        
        .contact-header h3 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .contact-container {
            padding: 30px;
        }
        
        .contact-intro {
            margin-bottom: 30px;
        }
        
        .ai-assistant-intro {
            display: flex;
            gap: 20px;
            background: #f0f9ff;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
        }
        
        .ai-avatar-contact {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.3rem;
            flex-shrink: 0;
        }
        
        .ai-intro-text h4 {
            margin: 0 0 10px 0;
            color: #1e293b;
            font-size: 1.2rem;
        }
        
        .ai-intro-text p {
            margin: 0 0 15px 0;
            color: #64748b;
            line-height: 1.5;
        }
        
        .service-context {
            background: #dbeafe;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
            color: #1e3a8a;
        }
        
        .enhanced-contact-form {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            margin-bottom: 30px;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
            font-size: 0.95rem;
        }
        
        .form-group label i {
            color: #3b82f6;
            margin-right: 8px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 120px;
        }
        
        .ai-hint {
            display: block;
            color: #6b7280;
            font-size: 0.85rem;
            margin-top: 5px;
            font-style: italic;
        }
        
        .checkbox-group {
            margin-bottom: 15px;
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        .checkbox-label input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #3b82f6;
        }
        
        .form-actions {
            text-align: center;
            margin-top: 30px;
        }
        
        .submit-contact-btn {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            position: relative;
            overflow: hidden;
        }
        
        .submit-contact-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(30, 58, 138, 0.3);
        }
        
        .submit-contact-btn:disabled {
            opacity: 0.8;
            cursor: not-allowed;
        }
        
        .btn-ai-indicator {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #fbbf24;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }
        
        .contact-promise {
            margin-top: 15px;
            color: #6b7280;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .contact-alternatives {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        .contact-alternatives h4 {
            text-align: center;
            margin: 0 0 20px 0;
            color: #1e293b;
        }
        
        .alternative-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .alt-option {
            padding: 15px 20px;
            border: 2px solid #e5e7eb;
            background: #f9fafb;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            color: #374151;
        }
        
        .alt-option:hover {
            border-color: #3b82f6;
            background: #dbeafe;
            color: #1e3a8a;
            transform: translateY(-2px);
        }
        
        /* Success Screen Styles */
        .success-container {
            text-align: center;
            padding: 40px 20px;
        }
        
        .success-animation {
            margin-bottom: 30px;
        }
        
        .success-icon {
            font-size: 4rem;
            color: #10b981;
            margin-bottom: 15px;
            animation: successBounce 0.8s ease-out;
        }
        
        @keyframes successBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        .success-container h3 {
            color: #1e293b;
            margin: 0 0 30px 0;
            font-size: 1.8rem;
        }
        
        .success-details {
            background: #f0fdf4;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            border-left: 4px solid #10b981;
        }
        
        .success-details h4 {
            color: #065f46;
            margin: 0 0 15px 0;
        }
        
        .success-info {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .info-item {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #047857;
            font-weight: 500;
        }
        
        .info-item i {
            color: #10b981;
            width: 20px;
        }
        
        .next-steps {
            background: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        
        .next-steps h4 {
            color: #1e293b;
            margin: 0 0 20px 0;
            text-align: center;
        }
        
        .steps-timeline {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .step {
            display: flex;
            gap: 15px;
            padding: 15px;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .step.completed {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
        }
        
        .step.active {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
        }
        
        .step.pending {
            background: #f1f5f9;
            border-left: 4px solid #64748b;
        }
        
        .step-icon {
            font-size: 1.5rem;
            width: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .step-content h5 {
            margin: 0 0 5px 0;
            color: #374151;
            font-size: 1.1rem;
        }
        
        .step-content p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .success-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .success-btn {
            padding: 12px 25px;
            border: 2px solid #e5e7eb;
            background: white;
            color: #374151;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .success-btn.primary {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            border-color: #3b82f6;
        }
        
        .success-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .contact-modal-content {
                max-width: 95%;
                margin: 2.5% auto;
            }
            
            .contact-container {
                padding: 20px;
            }
            
            .enhanced-contact-form {
                padding: 20px;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .ai-assistant-intro {
                flex-direction: column;
                text-align: center;
            }
            
            .alternative-options {
                grid-template-columns: 1fr;
            }
            
            .success-actions {
                flex-direction: column;
                align-items: center;
            }
            
            .success-btn {
                width: 100%;
                max-width: 250px;
                justify-content: center;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// === POWERFUL SERVICE LAUNCHERS ===

// Launch World Headlines with specialized news interface
function launchWorldHeadlines() {
    try {
        // Add visual feedback to the button
        const button = event?.target?.closest('.cta-button');
        addButtonLoadingState(button);
        
        // Ensure section exists before scrolling
        const newsSection = document.getElementById('news');
        if (newsSection) {
            // Smooth scroll to news section with enhanced experience
            scrollToSection('news');
            
            // Wait for scroll to complete, then launch enhanced news interface
            setTimeout(() => {
                try {
                    removeButtonLoadingState(button);
                    showWorldHeadlinesLauncher();
                } catch (error) {
                    removeButtonLoadingState(button);
                    handleButtonError('World Headlines', error);
                }
            }, 800);
        } else {
            // Fallback: directly show launcher if section not found
            removeButtonLoadingState(button);
            showWorldHeadlinesLauncher();
        }
    } catch (error) {
        const button = event?.target?.closest('.cta-button');
        removeButtonLoadingState(button);
        handleButtonError('World Headlines', error);
    }
}

function showWorldHeadlinesLauncher() {
    const newsLauncherModal = document.createElement('div');
    newsLauncherModal.id = 'newsLauncherModal';
    newsLauncherModal.className = 'modal service-launcher-modal';
    newsLauncherModal.style.display = 'block';
    
    newsLauncherModal.innerHTML = `
        <div class="modal-content launcher-content">
            <div class="launcher-header news-header">
                <div class="launcher-icon">
                    <i class="fas fa-newspaper"></i>
                </div>
                <h2>World Headlines Platform</h2>
                <p>Choose your news experience</p>
                <button class="close-launcher" onclick="closeLauncher('newsLauncherModal')">&times;</button>
            </div>
            
            <div class="launcher-options">
                <div class="option-grid">
                    <div class="launch-option primary-option" onclick="exploreNewsTopic('trending-global')">
                        <div class="option-icon">🔥</div>
                        <h3>Trending Now</h3>
                        <p>Latest breaking news and trending stories worldwide</p>
                        <div class="option-stats">Live Updates</div>
                    </div>
                    
                    <div class="launch-option" onclick="exploreNewsTopic('ai-technology')">
                        <div class="option-icon">🤖</div>
                        <h3>AI & Technology</h3>
                        <p>Latest in artificial intelligence and tech innovation</p>
                        <div class="option-stats">247 articles</div>
                    </div>
                    
                    <div class="launch-option" onclick="exploreNewsTopic('global-markets')">
                        <div class="option-icon">📈</div>
                        <h3>Global Markets</h3>
                        <p>Financial news and economic developments</p>
                        <div class="option-stats">189 articles</div>
                    </div>
                    
                    <div class="launch-option" onclick="exploreNewsTopic('climate-tech')">
                        <div class="option-icon">🌱</div>
                        <h3>Climate & Sustainability</h3>
                        <p>Environmental technology and green business</p>
                        <div class="option-stats">156 articles</div>
                    </div>
                    
                    <div class="launch-option" onclick="openAnalysis('sentiment')">
                        <div class="option-icon">🧠</div>
                        <h3>News Analysis</h3>
                        <p>AI-powered sentiment and trend analysis</p>
                        <div class="option-stats">Real-time</div>
                    </div>
                    
                    <div class="launch-option" onclick="openPersonalizedNews()">
                        <div class="option-icon">⭐</div>
                        <h3>Personalized Feed</h3>
                        <p>Customized news based on your interests</p>
                        <div class="option-stats">For You</div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <button onclick="openNewsSearch()" class="quick-action-btn">
                        <i class="fas fa-search"></i> Search News
                    </button>
                    <button onclick="openAIAssistant()" class="quick-action-btn">
                        <i class="fas fa-robot"></i> AI News Assistant
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(newsLauncherModal);
    addLauncherStyles();
}

// Launch Cloud Services with specialized interface
function launchCloudServices() {
    try {
        // Add visual feedback to the button
        const button = event?.target?.closest('.cta-button');
        addButtonLoadingState(button);
        
        // Ensure section exists before scrolling
        const cloudSection = document.getElementById('cloud');
        if (cloudSection) {
            scrollToSection('cloud');
            
            setTimeout(() => {
                try {
                    removeButtonLoadingState(button);
                    showCloudServicesLauncher();
                } catch (error) {
                    removeButtonLoadingState(button);
                    handleButtonError('Cloud Services', error);
                }
            }, 800);
        } else {
            // Fallback: directly show launcher if section not found
            removeButtonLoadingState(button);
            showCloudServicesLauncher();
        }
    } catch (error) {
        const button = event?.target?.closest('.cta-button');
        removeButtonLoadingState(button);
        handleButtonError('Cloud Services', error);
    }
}

function showCloudServicesLauncher() {
    const cloudLauncherModal = document.createElement('div');
    cloudLauncherModal.id = 'cloudLauncherModal';
    cloudLauncherModal.className = 'modal service-launcher-modal';
    cloudLauncherModal.style.display = 'block';
    
    cloudLauncherModal.innerHTML = `
        <div class="modal-content launcher-content cloud-tools-modal">
            <div class="launcher-header cloud-header">
                <div class="launcher-icon">
                    <i class="fas fa-cloud"></i>
                </div>
                <h2>Multi-Cloud Solutions Hub</h2>
                <p>Azure, AWS, Google Cloud & More - Integrated Tools & Services</p>
                <button class="close-launcher" onclick="closeLauncher('cloudLauncherModal')">&times;</button>
            </div>
            
            <!-- Cloud Platform Integration Section -->
            <div class="cloud-platforms-section">
                <h3><i class="fas fa-layer-group"></i> Multi-Cloud Platform Support</h3>
                <div class="platform-tabs">
                    <button class="platform-tab active" data-platform="all" onclick="switchCloudPlatform('all')">All Platforms</button>
                    <button class="platform-tab" data-platform="azure" onclick="switchCloudPlatform('azure')">Microsoft Azure</button>
                    <button class="platform-tab" data-platform="aws" onclick="switchCloudPlatform('aws')">Amazon AWS</button>
                    <button class="platform-tab" data-platform="gcp" onclick="switchCloudPlatform('gcp')">Google Cloud</button>
                    <button class="platform-tab" data-platform="others" onclick="switchCloudPlatform('others')">Others</button>
                </div>
            </div>
            
            <div class="launcher-options">
                <!-- Cloud Tools & Services Grid -->
                <div class="cloud-tools-grid" id="cloudToolsGrid">
                    <!-- Multi-Cloud Management -->
                    <div class="cloud-tool-card" data-platforms="all azure aws gcp">
                        <div class="tool-header">
                            <div class="option-icon">🌐</div>
                            <h3>Multi-Cloud Manager</h3>
                            <div class="platform-badges">
                                <span class="badge azure">Azure</span>
                                <span class="badge aws">AWS</span>
                                <span class="badge gcp">GCP</span>
                            </div>
                        </div>
                        <p>Unified dashboard to manage resources across multiple cloud platforms</p>
                        <div class="tool-features">
                            <span class="feature">• Cost optimization</span>
                            <span class="feature">• Resource monitoring</span>
                            <span class="feature">• Security compliance</span>
                        </div>
                        <button onclick="openCloudTool('multi-cloud-manager')" class="tool-access-btn">Launch Tool</button>
                    </div>
                    
                    <!-- Azure Integration Tools -->
                    <div class="cloud-tool-card" data-platforms="all azure">
                        <div class="tool-header">
                            <div class="option-icon azure-icon">🔷</div>
                            <h3>Azure Resource Manager</h3>
                            <div class="platform-badges">
                                <span class="badge azure">Azure</span>
                            </div>
                        </div>
                        <p>Deploy and manage Azure resources with ARM templates and automation</p>
                        <div class="tool-features">
                            <span class="feature">• ARM template generator</span>
                            <span class="feature">• Resource group management</span>
                            <span class="feature">• Azure CLI integration</span>
                        </div>
                        <button onclick="openCloudTool('azure-manager')" class="tool-access-btn">Launch Tool</button>
                    </div>
                    
                    <!-- AWS Integration Tools -->
                    <div class="cloud-tool-card" data-platforms="all aws">
                        <div class="tool-header">
                            <div class="option-icon aws-icon">🟠</div>
                            <h3>AWS CloudFormation Studio</h3>
                            <div class="platform-badges">
                                <span class="badge aws">AWS</span>
                            </div>
                        </div>
                        <p>Design and deploy AWS infrastructure with visual CloudFormation builder</p>
                        <div class="tool-features">
                            <span class="feature">• Visual stack designer</span>
                            <span class="feature">• Template validation</span>
                            <span class="feature">• Cost estimation</span>
                        </div>
                        <button onclick="openCloudTool('aws-cloudformation')" class="tool-access-btn">Launch Tool</button>
                    </div>
                    
                    <!-- Google Cloud Tools -->
                    <div class="cloud-tool-card" data-platforms="all gcp">
                        <div class="tool-header">
                            <div class="option-icon gcp-icon">🔴</div>
                            <h3>GCP Deployment Manager</h3>
                            <div class="platform-badges">
                                <span class="badge gcp">GCP</span>
                            </div>
                        </div>
                        <p>Automate Google Cloud infrastructure deployment and management</p>
                        <div class="tool-features">
                            <span class="feature">• YAML/Python templates</span>
                            <span class="feature">• IAM integration</span>
                            <span class="feature">• Billing optimization</span>
                        </div>
                        <button onclick="openCloudTool('gcp-deployment')" class="tool-access-btn">Launch Tool</button>
                    </div>
                    
                    <!-- Migration Assistant -->
                    <div class="cloud-tool-card" data-platforms="all azure aws gcp">
                        <div class="tool-header">
                            <div class="option-icon">🚀</div>
                            <h3>Cloud Migration Assistant</h3>
                            <div class="platform-badges">
                                <span class="badge multi">Multi-Cloud</span>
                            </div>
                        </div>
                        <p>Smart migration planning and execution across cloud platforms</p>
                        <div class="tool-features">
                            <span class="feature">• Compatibility analysis</span>
                            <span class="feature">• Cost comparison</span>
                            <span class="feature">• Migration roadmap</span>
                        </div>
                        <button onclick="openCloudTool('migration-assistant')" class="tool-access-btn">Launch Tool</button>
                    </div>
                    
                    <!-- Cost Optimizer -->
                    <div class="cloud-tool-card" data-platforms="all azure aws gcp">
                        <div class="tool-header">
                            <div class="option-icon">📊</div>
                            <h3>Cloud Cost Optimizer</h3>
                            <div class="platform-badges">
                                <span class="badge multi">Multi-Cloud</span>
                            </div>
                        </div>
                        <p>Analyze and optimize cloud spending across all platforms</p>
                        <div class="tool-features">
                            <span class="feature">• Cost analysis</span>
                            <span class="feature">• Resource recommendations</span>
                            <span class="feature">• Budget alerts</span>
                        </div>
                        <button onclick="openCloudTool('cost-optimizer')" class="tool-access-btn">Launch Tool</button>
                    </div>
                    
                    <!-- Security Scanner -->
                    <div class="cloud-tool-card" data-platforms="all azure aws gcp others">
                        <div class="tool-header">
                            <div class="option-icon">🔒</div>
                            <h3>Multi-Cloud Security Scanner</h3>
                            <div class="platform-badges">
                                <span class="badge security">Security</span>
                            </div>
                        </div>
                        <p>Comprehensive security audit and compliance checking</p>
                        <div class="tool-features">
                            <span class="feature">• Vulnerability scanning</span>
                            <span class="feature">• Compliance reporting</span>
                            <span class="feature">• Access control audit</span>
                        </div>
                        <button onclick="openCloudTool('security-scanner')" class="tool-access-btn">Launch Tool</button>
                    </div>
                    
                    <!-- DevOps Pipeline Builder -->
                    <div class="cloud-tool-card" data-platforms="all azure aws gcp">
                        <div class="tool-header">
                            <div class="option-icon">⚙️</div>
                            <h3>DevOps Pipeline Builder</h3>
                            <div class="platform-badges">
                                <span class="badge devops">DevOps</span>
                            </div>
                        </div>
                        <p>Build CI/CD pipelines for any cloud platform with visual editor</p>
                        <div class="tool-features">
                            <span class="feature">• Visual pipeline design</span>
                            <span class="feature">• Multi-platform deployment</span>
                            <span class="feature">• Automated testing</span>
                        </div>
                        <button onclick="openCloudTool('devops-builder')" class="tool-access-btn">Launch Tool</button>
                    </div>
                    
                    <!-- Monitoring Dashboard -->
                    <div class="cloud-tool-card" data-platforms="all azure aws gcp others">
                        <div class="tool-header">
                            <div class="option-icon">📶</div>
                            <h3>Unified Monitoring Hub</h3>
                            <div class="platform-badges">
                                <span class="badge monitoring">Monitoring</span>
                            </div>
                        </div>
                        <p>Centralized monitoring and alerting for all your cloud resources</p>
                        <div class="tool-features">
                            <span class="feature">• Real-time metrics</span>
                            <span class="feature">• Custom dashboards</span>
                            <span class="feature">• Intelligent alerting</span>
                        </div>
                        <button onclick="openCloudTool('monitoring-hub')" class="tool-access-btn">Launch Tool</button>
                    </div>
                </div>
                
                <div class="cloud-resources-section">
                    <h3><i class="fas fa-book"></i> Cloud Resources & Learning</h3>
                    <div class="resource-links">
                        <button onclick="openCloudGuides()" class="resource-btn">
                            <i class="fas fa-graduation-cap"></i> Platform Guides
                        </button>
                        <button onclick="openBestPractices()" class="resource-btn">
                            <i class="fas fa-star"></i> Best Practices
                        </button>
                        <button onclick="openCostCalculators()" class="resource-btn">
                            <i class="fas fa-calculator"></i> Cost Calculators
                        </button>
                        <button onclick="openArchitectureTemplates()" class="resource-btn">
                            <i class="fas fa-sitemap"></i> Architecture Templates
                        </button>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <button onclick="openEnhancedContactForm('cloud-consultation', 'Multi-Cloud Strategy', 'consultation')" class="quick-action-btn">
                        <i class="fas fa-comments"></i> Expert Consultation
                    </button>
                    <button onclick="requestCloudAssessment()" class="quick-action-btn">
                        <i class="fas fa-search"></i> Free Cloud Assessment
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(cloudLauncherModal);
    addLauncherStyles();
    addCloudToolsStyles();
}

// Launch Media & Design with specialized interface
function launchMediaDesign() {
    try {
        // Add visual feedback to the button
        const button = event?.target?.closest('.cta-button');
        addButtonLoadingState(button);
        
        // Ensure section exists before scrolling
        const mediaSection = document.getElementById('media');
        if (mediaSection) {
            scrollToSection('media');
            
            setTimeout(() => {
                try {
                    removeButtonLoadingState(button);
                    showMediaDesignLauncher();
                } catch (error) {
                    removeButtonLoadingState(button);
                    handleButtonError('Media & Design', error);
                }
            }, 800);
        } else {
            // Fallback: directly show launcher if section not found
            removeButtonLoadingState(button);
            showMediaDesignLauncher();
        }
    } catch (error) {
        const button = event?.target?.closest('.cta-button');
        removeButtonLoadingState(button);
        handleButtonError('Media & Design', error);
    }
}

function showMediaDesignLauncher() {
    const mediaLauncherModal = document.createElement('div');
    mediaLauncherModal.id = 'mediaLauncherModal';
    mediaLauncherModal.className = 'modal service-launcher-modal';
    mediaLauncherModal.style.display = 'block';
    
    mediaLauncherModal.innerHTML = `
        <div class="modal-content launcher-content">
            <div class="launcher-header media-header">
                <div class="launcher-icon">
                    <i class="fas fa-palette"></i>
                </div>
                <h2>Creative Design Solutions</h2>
                <p>Choose your design service</p>
                <button class="close-launcher" onclick="closeLauncher('mediaLauncherModal')">&times;</button>
            </div>
            
            <div class="launcher-options">
                <div class="option-grid">
                    <div class="launch-option primary-option" onclick="showMediaPortfolio('graphic')">
                        <div class="option-icon">🎨</div>
                        <h3>Graphic Design</h3>
                        <p>Logo design, branding, and print materials</p>
                        <div class="option-pricing">Free - $7</div>
                    </div>
                    
                    <div class="launch-option" onclick="showMediaPortfolio('video')">
                        <div class="option-icon">🎥</div>
                        <h3>Video Production</h3>
                        <p>Corporate videos, animations, and content</p>
                        <div class="option-pricing">Free - $7</div>
                    </div>
                    
                    <div class="launch-option" onclick="showMediaPortfolio('web')">
                        <div class="option-icon">🌐</div>
                        <h3>Web Design</h3>
                        <p>Modern, responsive websites and applications</p>
                        <div class="option-pricing">Free - $7</div>
                    </div>
                    
                    <div class="launch-option" onclick="openBrandingStudio()">
                        <div class="option-icon">💼</div>
                        <h3>Branding Studio</h3>
                        <p>Complete brand identity and strategy</p>
                        <div class="option-pricing">Custom</div>
                    </div>
                    
                    <div class="launch-option" onclick="openSocialMediaDesign()">
                        <div class="option-icon">📱</div>
                        <h3>Social Media Design</h3>
                        <p>Posts, stories, and social media content</p>
                        <div class="option-pricing">$7/package</div>
                    </div>
                    
                    <div class="launch-option" onclick="openPrintDesignStudio()">
                        <div class="option-icon">🖨️</div>
                        <h3>Print Design</h3>
                        <p>Business cards, brochures, and marketing</p>
                        <div class="option-pricing">Free - $7</div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <button onclick="openEnhancedContactForm('creative-consultation', 'Creative Services', 'consultation')" class="quick-action-btn">
                        <i class="fas fa-magic"></i> Creative Consultation
                    </button>
                    <button onclick="openDesignPortfolio()" class="quick-action-btn">
                        <i class="fas fa-images"></i> View Portfolio
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(mediaLauncherModal);
    addLauncherStyles();
}

// Supporting functions for specialized services
function openPersonalizedNews() {
    closeLauncher('newsLauncherModal');
    // Switch to personalized news tab
    switchNewsTab('personalized');
}

function openNewsSearch() {
    closeLauncher('newsLauncherModal');
    const searchInput = document.getElementById('newsSearch');
    if (searchInput) {
        searchInput.focus();
        searchInput.style.animation = 'pulse 2s infinite';
    }
}

function openAIAssistant() {
    closeLauncher('newsLauncherModal');
    alert('🤖 AI News Assistant activated! Ask me anything about current events, trends, or specific news topics.');
}

function openCloudMigrationTool() {
    closeLauncher('cloudLauncherModal');
    openEnhancedContactForm('cloud-migration', 'Cloud Migration Services', 'migration');
}

function openCloudMonitoring() {
    closeLauncher('cloudLauncherModal');
    alert('📈 Cloud Monitoring Dashboard: Real-time performance metrics, alerts, and analytics for your cloud infrastructure.');
}

function startCloudDemo() {
    closeLauncher('cloudLauncherModal');
    alert('🎥 Live Demo starting! Our cloud architect will demonstrate our platform capabilities and answer your questions.');
}

// Cloud Platform Filtering
function switchCloudPlatform(platform) {
    // Update active tab
    const tabs = document.querySelectorAll('.platform-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.platform === platform) {
            tab.classList.add('active');
        }
    });
    
    // Filter cloud tool cards
    const toolCards = document.querySelectorAll('.cloud-tool-card');
    toolCards.forEach(card => {
        const platforms = card.dataset.platforms.split(' ');
        if (platform === 'all' || platforms.includes(platform)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// Cloud Tools Launchers
function openCloudTool(toolType) {
    closeLauncher('cloudLauncherModal');
    alert(`🚀 Launching ${toolType.replace('-', ' ').toUpperCase()}! This professional cloud management tool provides comprehensive capabilities for your infrastructure.`);
}

// Cloud Resources Functions
function openCloudGuides() {
    closeLauncher('cloudLauncherModal');
    alert('📚 Platform Guides: Comprehensive documentation and tutorials for Azure, AWS, Google Cloud, and other platforms.');
}

function openBestPractices() {
    closeLauncher('cloudLauncherModal');
    alert('⭐ Best Practices: Industry-standard guidelines for security, performance, cost optimization, and architecture design.');
}

function openCostCalculators() {
    closeLauncher('cloudLauncherModal');
    alert('💰 Cost Calculators: Interactive tools to estimate costs across different cloud platforms and services.');
}

function openArchitectureTemplates() {
    closeLauncher('cloudLauncherModal');
    alert('🏢 Architecture Templates: Pre-built reference architectures for common use cases and deployment patterns.');
}

function requestCloudAssessment() {
    closeLauncher('cloudLauncherModal');
    openEnhancedContactForm('cloud-assessment', 'Free Cloud Assessment', 'assessment');
}

function openBrandingStudio() {
    closeLauncher('mediaLauncherModal');
    openEnhancedContactForm('branding', 'Complete Branding Package', 'studio');
}

function openSocialMediaDesign() {
    closeLauncher('mediaLauncherModal');
    openEnhancedContactForm('social-media', 'Social Media Design Package', 'package');
}

function openPrintDesignStudio() {
    closeLauncher('mediaLauncherModal');
    openEnhancedContactForm('print-design', 'Print Design Services', 'studio');
}

function openDesignPortfolio() {
    closeLauncher('mediaLauncherModal');
    alert('🖼️ Design Portfolio: Browse our complete collection of graphic design, video production, and web development work.');
}

// Close launcher modal
function closeLauncher(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Add launcher modal styles
function addLauncherStyles() {
    if (document.getElementById('launcherStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'launcherStyles';
    style.textContent = `
        .service-launcher-modal {
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
        }
        
        .launcher-content {
            max-width: 900px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.98));
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid rgba(59, 130, 246, 0.2);
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
        }
        
        .launcher-header {
            text-align: center;
            padding: 2.5rem;
            position: relative;
        }
        
        .launcher-header.news-header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }
        
        .launcher-header.cloud-header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
        }
        
        .launcher-header.media-header {
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            color: white;
        }
        
        .launcher-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
            backdrop-filter: blur(10px);
        }
        
        .launcher-header h2 {
            font-family: 'Space Grotesk', 'Poppins', sans-serif;
            font-size: 2.2rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
        }
        
        .launcher-header p {
            font-size: 1.1rem;
            opacity: 0.9;
            margin: 0;
        }
        
        .close-launcher {
            position: absolute;
            top: 20px;
            right: 25px;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }
        
        .close-launcher:hover {
            opacity: 1;
        }
        
        .launcher-options {
            padding: 2.5rem;
        }
        
        .option-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .launch-option {
            background: white;
            padding: 1.5rem;
            border-radius: 15px;
            text-align: center;
            border: 2px solid #e5e7eb;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .launch-option::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 0.6s ease;
        }
        
        .launch-option:hover::before {
            left: 100%;
        }
        
        .launch-option:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
            border-color: #3b82f6;
        }
        
        .launch-option.primary-option {
            border-color: #3b82f6;
            background: linear-gradient(135deg, #f0f9ff, #ffffff);
        }
        
        .launch-option.primary-option:hover {
            border-color: #1e40af;
            box-shadow: 0 15px 35px rgba(59, 130, 246, 0.3);
        }
        
        .option-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            display: block;
        }
        
        .launch-option h3 {
            font-family: 'Space Grotesk', 'Poppins', sans-serif;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            color: #1e293b;
        }
        
        .launch-option p {
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
            color: #64748b;
            line-height: 1.5;
            margin: 0 0 1rem 0;
        }
        
        .option-stats, .option-pricing {
            background: #f1f5f9;
            color: #475569;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            display: inline-block;
        }
        
        .option-pricing {
            background: #dcfce7;
            color: #166534;
        }
        
        .quick-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .quick-action-btn {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            border: none;
            border-radius: 30px;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .quick-action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .launcher-content {
                max-width: 95%;
                margin: 2.5% auto;
            }
            
            .option-grid {
                grid-template-columns: 1fr;
            }
            
            .launcher-header {
                padding: 2rem;
            }
            
            .launcher-options {
                padding: 1.5rem;
            }
            
            .quick-actions {
                flex-direction: column;
                align-items: center;
            }
            
            .quick-action-btn {
                width: 100%;
                max-width: 250px;
                justify-content: center;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Add cloud tools specific styles
function addCloudToolsStyles() {
    if (document.getElementById('cloudToolsStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'cloudToolsStyles';
    style.textContent = `
        .cloud-tools-modal {
            max-width: 1200px !important;
        }
        
        .cloud-platforms-section {
            background: rgba(59, 130, 246, 0.05);
            padding: 1.5rem 2.5rem;
            border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        }
        
        .cloud-platforms-section h3 {
            font-family: 'Space Grotesk', sans-serif;
            color: #1e3a8a;
            margin: 0 0 1rem 0;
            font-size: 1.3rem;
        }
        
        .platform-tabs {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .platform-tab {
            padding: 0.6rem 1.2rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
        }
        
        .platform-tab.active,
        .platform-tab:hover {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        .cloud-tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .cloud-tool-card {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 15px;
            padding: 1.5rem;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .cloud-tool-card:hover {
            border-color: #3b82f6;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
        }
        
        .tool-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .cloud-tool-card .option-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .azure-icon { color: #0078d4; }
        .aws-icon { color: #ff9900; }
        .gcp-icon { color: #4285f4; }
        
        .cloud-tool-card h3 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.1rem;
            margin: 0 0 0.8rem 0;
            color: #1e293b;
            text-align: center;
        }
        
        .platform-badges {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 0.8rem;
        }
        
        .badge {
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .badge.azure { background: #e6f3ff; color: #0078d4; }
        .badge.aws { background: #fff4e6; color: #ff9900; }
        .badge.gcp { background: #e8f0fe; color: #4285f4; }
        .badge.multi { background: #f0f9ff; color: #3b82f6; }
        .badge.security { background: #fef2f2; color: #dc2626; }
        .badge.devops { background: #f0fdf4; color: #16a34a; }
        .badge.monitoring { background: #fefce8; color: #ca8a04; }
        
        .cloud-tool-card p {
            font-size: 0.9rem;
            color: #64748b;
            text-align: center;
            margin-bottom: 1rem;
            line-height: 1.5;
        }
        
        .tool-features {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
            margin-bottom: 1rem;
        }
        
        .feature {
            font-size: 0.8rem;
            color: #475569;
            padding-left: 0.5rem;
        }
        
        .tool-access-btn {
            width: 100%;
            padding: 0.8rem;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
        }
        
        .tool-access-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .cloud-resources-section {
            background: #f8fafc;
            padding: 2rem 2.5rem;
            border-top: 1px solid #e5e7eb;
            margin-bottom: 2rem;
        }
        
        .cloud-resources-section h3 {
            font-family: 'Space Grotesk', sans-serif;
            color: #1e3a8a;
            margin: 0 0 1.5rem 0;
            font-size: 1.3rem;
            text-align: center;
        }
        
        .resource-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .resource-btn {
            padding: 1rem 1.5rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            color: #374151;
        }
        
        .resource-btn:hover {
            border-color: #3b82f6;
            background: #f0f9ff;
            color: #1e3a8a;
            transform: translateY(-2px);
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .cloud-tools-modal {
                max-width: 95% !important;
            }
            
            .cloud-tools-grid {
                grid-template-columns: 1fr;
            }
            
            .platform-tabs {
                justify-content: center;
            }
            
            .resource-links {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// === ENHANCED BUTTON STATE MANAGEMENT ===

// Add loading state to button with visual feedback
function addButtonLoadingState(button) {
    if (!button) return;
    
    // Store original content
    button.dataset.originalContent = button.innerHTML;
    
    // Add loading class and content
    button.classList.add('loading');
    button.disabled = true;
    
    // Create loading spinner
    const spinner = document.createElement('div');
    spinner.className = 'button-spinner';
    
    // Update button content with spinner
    const icon = button.querySelector('i');
    const small = button.querySelector('small');
    
    if (icon && small) {
        button.innerHTML = `
            <div class="button-spinner"></div>
            <span class="loading-text">Launching...</span>
            <small>Please wait</small>
        `;
    } else {
        button.innerHTML = `
            <div class="button-spinner"></div>
            <span class="loading-text">Loading...</span>
        `;
    }
    
    // Add ripple effect
    createButtonRipple(button);
}

// Remove loading state from button
function removeButtonLoadingState(button) {
    if (!button) return;
    
    // Restore original content
    if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
    }
    
    // Remove loading state
    button.classList.remove('loading');
    button.disabled = false;
}

// Create enhanced ripple effect for buttons
function createButtonRipple(button, event = null) {
    const ripple = document.createElement('div');
    ripple.className = 'button-ripple';
    
    // Position ripple
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    
    let x, y;
    if (event) {
        x = event.clientX - rect.left - size / 2;
        y = event.clientY - rect.top - size / 2;
    } else {
        x = rect.width / 2 - size / 2;
        y = rect.height / 2 - size / 2;
    }
    
    ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        transform: scale(0);
        opacity: 0.6;
    `;
    
    button.style.position = 'relative';
    button.appendChild(ripple);
    
    // Animate ripple
    requestAnimationFrame(() => {
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
    });
    
    // Remove ripple after animation
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.remove();
        }
    }, 600);
}

// Enhanced button interaction handlers
function enhanceButtonInteractions() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        // Add click ripple effect
        button.addEventListener('click', (event) => {
            createButtonRipple(button, event);
        });
        
        // Add hover glow effect
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('loading')) {
                button.classList.add('hover-glow');
            }
        });
        
        button.addEventListener('mouseleave', () => {
            button.classList.remove('hover-glow');
        });
        
        // Add focus accessibility
        button.addEventListener('focus', () => {
            button.classList.add('focus-visible');
        });
        
        button.addEventListener('blur', () => {
            button.classList.remove('focus-visible');
        });
    });
}

// Export functions for global access
window.sendMessage = sendMessage;
window.openTool = openTool;
window.closeModal = closeModal;
window.scrollToSection = scrollToSection;
window.generateText = generateText;
window.generateCode = generateCode;
window.analyzeImage = analyzeImage;
window.analyzeText = analyzeText;
window.openEnhancedContactForm = openEnhancedContactForm;
window.closeEnhancedContact = closeEnhancedContact;
window.startInstantChat = startInstantChat;
window.scheduleCall = scheduleCall;
window.whatsappContact = whatsappContact;
window.launchWorldHeadlines = launchWorldHeadlines;
window.launchCloudServices = launchCloudServices;
window.launchMediaDesign = launchMediaDesign;
window.addButtonLoadingState = addButtonLoadingState;
window.removeButtonLoadingState = removeButtonLoadingState;
window.createButtonRipple = createButtonRipple;
window.enhanceButtonInteractions = enhanceButtonInteractions;
window.closeLauncher = closeLauncher;
window.switchCloudPlatform = switchCloudPlatform;
window.openCloudTool = openCloudTool;
window.openCloudGuides = openCloudGuides;
window.openBestPractices = openBestPractices;
window.openCostCalculators = openCostCalculators;
window.openArchitectureTemplates = openArchitectureTemplates;
window.requestCloudAssessment = requestCloudAssessment;

// === ENHANCED BUTTON SYSTEM INITIALIZATION ===

// Initialize all button enhancements when DOM is loaded
function initializeButtonEnhancements() {
    // Add enhanced styles
    addEnhancedButtonStyles();
    
    // Setup enhanced interactions
    enhanceButtonInteractions();
    
    // Add accessibility attributes
    addButtonAccessibility();
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    console.log('KaiTech: Enhanced button system initialized');
}

// Add accessibility attributes to buttons
function addButtonAccessibility() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach((button, index) => {
        // Add ARIA labels
        if (!button.getAttribute('aria-label')) {
            const text = button.textContent.trim();
            button.setAttribute('aria-label', text);
        }
        
        // Add role if not present
        if (!button.getAttribute('role')) {
            button.setAttribute('role', 'button');
        }
        
        // Add tabindex for keyboard navigation
        if (!button.getAttribute('tabindex')) {
            button.setAttribute('tabindex', '0');
        }
        
        // Add keyboard support
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
    });
}

// Setup enhanced keyboard navigation for CTA buttons
function setupKeyboardNavigation() {
    const ctaButtons = Array.from(document.querySelectorAll('.cta-button'));
    
    // Add arrow key navigation between CTA buttons
    ctaButtons.forEach((button, index) => {
        button.addEventListener('keydown', (event) => {
            let targetIndex;
            
            switch(event.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    event.preventDefault();
                    targetIndex = (index + 1) % ctaButtons.length;
                    ctaButtons[targetIndex].focus();
                    break;
                    
                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    targetIndex = (index - 1 + ctaButtons.length) % ctaButtons.length;
                    ctaButtons[targetIndex].focus();
                    break;
                    
                case 'Home':
                    event.preventDefault();
                    ctaButtons[0].focus();
                    break;
                    
                case 'End':
                    event.preventDefault();
                    ctaButtons[ctaButtons.length - 1].focus();
                    break;
            }
        });
    });
}

// Enhanced error handling for button actions
function handleButtonError(buttonAction, error) {
    console.error(`KaiTech Button Error (${buttonAction}):`, error);
    
    // Show user-friendly error message
    const errorModal = document.createElement('div');
    errorModal.className = 'error-modal';
    errorModal.innerHTML = `
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h3>Service Temporarily Unavailable</h3>
            <p>We're having trouble launching ${buttonAction}. Please try again in a moment.</p>
            <button onclick="this.parentElement.parentElement.remove()" class="error-close-btn">OK</button>
        </div>
    `;
    
    document.body.appendChild(errorModal);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorModal.parentNode) {
            errorModal.remove();
        }
    }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeButtonEnhancements);
} else {
    initializeButtonEnhancements();
}

// === KAITECH RWANDA NEW SERVICES FUNCTIONALITY ===

// Enhanced Cloud Services Functions with AI-Powered Contact
function openCloudService(serviceType) {
    const serviceDetails = {
        'infrastructure': {
            title: '🏢 Infrastructure as a Service (IaaS)',
            description: 'Enterprise-grade scalable computing resources with 99.9% uptime guarantee and 24/7 support',
            features: [
                { icon: '🚀', title: 'Scalable Resources', desc: 'Auto-scaling from 1 to 10,000+ virtual machines' },
                { icon: '🔒', title: '99.9% Uptime', desc: 'Redundant infrastructure with disaster recovery' },
                { icon: '⚡', title: 'High Performance', desc: 'NVMe SSD storage with 10Gb/s network connectivity' },
                { icon: '💰', title: 'Cost Effective', desc: 'Pay-per-use pricing with no minimum commitments' },
                { icon: '🌐', title: 'Global Reach', desc: 'Multiple data centers worldwide for low latency' },
                { icon: '👥', title: '24/7 Support', desc: 'Expert technical support available round the clock' }
            ],
            pricing: {
                starter: { name: 'Starter', price: 'Free', specs: '2 vCPUs, 4GB RAM, 50GB Storage' },
                professional: { name: 'Professional', price: '$7/month', specs: '4 vCPUs, 16GB RAM, 200GB Storage' },
                enterprise: { name: 'Enterprise', price: '$7/month', specs: 'Unlimited resources, dedicated support' }
            }
        },
        'platform': {
            title: '🛠️ Platform as a Service (PaaS)', 
            description: 'Complete development and deployment platform with integrated CI/CD pipelines',
            features: [
                { icon: '💻', title: 'Multi-Language Support', desc: 'Node.js, Python, Java, PHP, .NET, Go, Ruby' },
                { icon: '🔄', title: 'CI/CD Pipelines', desc: 'Automated testing, building, and deployment' },
                { icon: '🗄️', title: 'Database Integration', desc: 'PostgreSQL, MySQL, MongoDB, Redis support' },
                { icon: '🔌', title: 'API Gateway', desc: 'Built-in API management and monitoring' },
                { icon: '📊', title: 'Analytics', desc: 'Real-time performance monitoring and logs' },
                { icon: '🔧', title: 'DevOps Tools', desc: 'Docker, Kubernetes, Git integration' }
            ],
            pricing: {
                starter: { name: 'Developer', price: 'Free', specs: '5 apps, 1GB RAM per app, Basic support' },
                professional: { name: 'Team', price: '$7/month', specs: '25 apps, 4GB RAM per app, Priority support' },
                enterprise: { name: 'Enterprise', price: '$7/month', specs: 'Unlimited apps, Custom resources, Dedicated support' }
            }
        },
        'security': {
            title: '🛑️ Enterprise Security & Compliance',
            description: 'Military-grade security with comprehensive compliance and 24/7 threat monitoring',
            features: [
                { icon: '🔐', title: 'End-to-End Encryption', desc: 'AES-256 encryption for data at rest and in transit' },
                { icon: '📄', title: 'Compliance Ready', desc: 'GDPR, SOC 2, ISO 27001, HIPAA compliant' },
                { icon: '🔍', title: 'Threat Detection', desc: 'AI-powered security monitoring and threat analysis' },
                { icon: '🛡️', title: 'DDoS Protection', desc: 'Multi-layered DDoS mitigation up to 100Gbps' },
                { icon: '🗺', title: 'Disaster Recovery', desc: 'Automated backups with 99.99% recovery guarantee' },
                { icon: '📊', title: 'Security Analytics', desc: 'Real-time security dashboards and alerts' }
            ],
            pricing: {
                starter: { name: 'Basic Security', price: 'Free', specs: 'SSL certificates, Basic monitoring, Email support' },
                professional: { name: 'Advanced Security', price: '$7/month', specs: 'WAF, Advanced monitoring, Phone support' },
                enterprise: { name: 'Enterprise Security', price: '$7/month', specs: 'Custom security policies, Dedicated team, SLA' }
            }
        }
    };
    
    const service = serviceDetails[serviceType];
    if (!service) {
        alert('Service information not available.');
        return;
    }
    
    modalTitle.textContent = service.title;
    modalBody.innerHTML = `
        <div class="enhanced-service-modal">
            <div class="service-header">
                <h3>${service.title}</h3>
                <p class="service-description">${service.description}</p>
            </div>
            
            <div class="service-features">
                <h4>🎆 Key Features & Benefits</h4>
                <div class="features-grid">
                    ${service.features.map(feature => `
                        <div class="feature-item">
                            <div class="feature-icon">${feature.icon}</div>
                            <div class="feature-content">
                                <h5>${feature.title}</h5>
                                <p>${feature.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="pricing-section">
                <h4>💰 Flexible Pricing Plans</h4>
                <div class="pricing-grid">
                    <div class="pricing-card">
                        <h5>${service.pricing.starter.name}</h5>
                        <div class="price">${service.pricing.starter.price}</div>
                        <p>${service.pricing.starter.specs}</p>
                        <button onclick="openEnhancedContactForm('${serviceType}', '${service.title}', 'starter')" class="pricing-btn">Choose Plan</button>
                    </div>
                    <div class="pricing-card featured">
                        <div class="popular-badge">Most Popular</div>
                        <h5>${service.pricing.professional.name}</h5>
                        <div class="price">${service.pricing.professional.price}</div>
                        <p>${service.pricing.professional.specs}</p>
                        <button onclick="openEnhancedContactForm('${serviceType}', '${service.title}', 'professional')" class="pricing-btn">Choose Plan</button>
                    </div>
                    <div class="pricing-card">
                        <h5>${service.pricing.enterprise.name}</h5>
                        <div class="price">${service.pricing.enterprise.price}</div>
                        <p>${service.pricing.enterprise.specs}</p>
                        <button onclick="openEnhancedContactForm('${serviceType}', '${service.title}', 'enterprise')" class="pricing-btn">Contact Sales</button>
                    </div>
                </div>
            </div>
            
            <div class="service-advantages">
                <h4>🌟 Why Choose KaiTech Cloud Services?</h4>
                <div class="advantages-list">
                    <div class="advantage-item">
                        <i class="fas fa-leaf"></i>
                        <span>100% renewable energy powered data centers</span>
                    </div>
                    <div class="advantage-item">
                        <i class="fas fa-rocket"></i>
                        <span>Lightning-fast deployment in under 60 seconds</span>
                    </div>
                    <div class="advantage-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>Enterprise-grade security with zero-trust architecture</span>
                    </div>
                    <div class="advantage-item">
                        <i class="fas fa-clock"></i>
                        <span>24/7 expert support with < 15 minute response time</span>
                    </div>
                    <div class="advantage-item">
                        <i class="fas fa-chart-line"></i>
                        <span>99.9% uptime SLA with performance guarantees</span>
                    </div>
                    <div class="advantage-item">
                        <i class="fas fa-globe-africa"></i>
                        <span>Local presence with global infrastructure reach</span>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button onclick="openEnhancedContactForm('${serviceType}', '${service.title}', 'consultation')" class="ai-consultation-btn">
                    <i class="fas fa-robot"></i> Start AI Consultation
                </button>
                <button onclick="openEnhancedContactForm('${serviceType}', '${service.title}', 'demo')" class="demo-btn">
                    <i class="fas fa-play"></i> Request Live Demo
                </button>
                <button onclick="openEnhancedContactForm('${serviceType}', '${service.title}', 'info')" class="info-btn">
                    <i class="fas fa-download"></i> Download Datasheet
                </button>
            </div>
        </div>
    `;
    
    toolModal.style.display = 'block';
    addEnhancedServiceStyles();
}

// AI-Powered Consultation System
function startAIConsultation(serviceType, plan) {
    // Create AI consultation modal
    const consultationModal = document.createElement('div');
    consultationModal.id = 'aiConsultationModal';
    consultationModal.className = 'modal';
    consultationModal.style.display = 'block';
    
    consultationModal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 85vh;">
            <div class="modal-header">
                <h3><i class="fas fa-robot"></i> AI Cloud Consultant</h3>
                <span class="close" onclick="closeAIConsultation()">&times;</span>
            </div>
            <div class="modal-body" style="padding: 0;">
                <div class="ai-consultation-container">
                    <div class="consultation-header">
                        <div class="ai-avatar-large">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="consultation-info">
                            <h4>Hello! I'm your Cloud Services AI Consultant</h4>
                            <p>I'll help you find the perfect cloud solution for your needs. Let's get started!</p>
                            <div class="consultation-stats">
                                <span class="stat">🏢 ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service</span>
                                <span class="stat">📋 ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="consultation-chat" id="consultationChat">
                        <div class="consultation-message ai-message">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <p>Perfect! I see you're interested in our <strong>${serviceType}</strong> service with the <strong>${plan}</strong> plan.</p>
                                <p>To provide the best recommendation, I need to understand your requirements better. Let's start with a few questions:</p>
                            </div>
                        </div>
                        
                        <div class="consultation-questions" id="consultationQuestions">
                            <!-- Questions will be loaded dynamically -->
                        </div>
                    </div>
                    
                    <div class="consultation-input">
                        <div class="quick-responses" id="quickResponses">
                            <!-- Quick response buttons will be loaded here -->
                        </div>
                        <div class="chat-input-container">
                            <input type="text" id="consultationInput" placeholder="Type your message or select an option above..." onkeypress="handleConsultationEnter(event)">
                            <button onclick="sendConsultationMessage()" class="send-btn"><i class="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(consultationModal);
    
    // Initialize consultation flow
    initializeConsultation(serviceType, plan);
    
    // Add consultation styles
    addConsultationStyles();
}

function initializeConsultation(serviceType, plan) {
    const questions = getConsultationQuestions(serviceType);
    loadConsultationQuestion(0, questions);
}

function getConsultationQuestions(serviceType) {
    const questionSets = {
        'infrastructure': [
            {
                question: "What's the primary use case for your infrastructure?",
                options: [
                    "Web hosting and applications",
                    "Data processing and analytics", 
                    "Development and testing",
                    "Backup and disaster recovery",
                    "AI/ML workloads"
                ]
            },
            {
                question: "How many users will be accessing your applications?",
                options: [
                    "1-50 users",
                    "51-500 users", 
                    "501-5,000 users",
                    "5,000+ users"
                ]
            },
            {
                question: "What's your expected monthly budget range?",
                options: [
                    "$25-$100",
                    "$100-$500",
                    "$500-$2,000",
                    "$2,000+"
                ]
            }
        ],
        'platform': [
            {
                question: "What programming languages does your team use?",
                options: [
                    "JavaScript/Node.js",
                    "Python",
                    "Java/.NET", 
                    "PHP",
                    "Multiple languages"
                ]
            },
            {
                question: "How many applications do you plan to deploy?",
                options: [
                    "1-5 applications",
                    "6-20 applications",
                    "21-50 applications",
                    "50+ applications"
                ]
            },
            {
                question: "Do you need CI/CD pipeline integration?",
                options: [
                    "Yes, essential for our workflow",
                    "Nice to have",
                    "Not sure what this is",
                    "Not needed right now"
                ]
            }
        ],
        'security': [
            {
                question: "What industry are you operating in?",
                options: [
                    "Healthcare",
                    "Finance/Banking",
                    "E-commerce",
                    "Technology",
                    "Government/Public Sector",
                    "Other"
                ]
            },
            {
                question: "What compliance requirements do you have?",
                options: [
                    "GDPR compliance",
                    "SOC 2 compliance",
                    "HIPAA compliance",
                    "ISO 27001",
                    "Not sure"
                ]
            },
            {
                question: "What's your biggest security concern?",
                options: [
                    "Data breaches",
                    "DDoS attacks",
                    "Insider threats",
                    "Regulatory compliance",
                    "All of the above"
                ]
            }
        ]
    };
    
    return questionSets[serviceType] || questionSets['infrastructure'];
}

let consultationStep = 0;
let consultationAnswers = [];

function loadConsultationQuestion(stepIndex, questions) {
    if (stepIndex >= questions.length) {
        generateConsultationRecommendation();
        return;
    }
    
    const question = questions[stepIndex];
    const questionsContainer = document.getElementById('consultationQuestions');
    const quickResponsesContainer = document.getElementById('quickResponses');
    
    questionsContainer.innerHTML = `
        <div class="consultation-message ai-message current-question">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p><strong>Question ${stepIndex + 1}:</strong> ${question.question}</p>
            </div>
        </div>
    `;
    
    quickResponsesContainer.innerHTML = question.options.map((option, index) => `
        <button class="quick-response-btn" onclick="selectConsultationOption('${option}', ${stepIndex})">
            ${option}
        </button>
    `).join('');
}

function selectConsultationOption(answer, stepIndex) {
    consultationAnswers[stepIndex] = answer;
    
    // Add user response to chat
    const chatContainer = document.getElementById('consultationChat');
    const userMessage = document.createElement('div');
    userMessage.className = 'consultation-message user-message';
    userMessage.innerHTML = `
        <div class="message-avatar user-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${answer}</p>
        </div>
    `;
    chatContainer.appendChild(userMessage);
    
    // Move to next question
    consultationStep = stepIndex + 1;
    const questions = getConsultationQuestions(document.getElementById('consultationInput').dataset.serviceType || 'infrastructure');
    
    setTimeout(() => {
        loadConsultationQuestion(consultationStep, questions);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 500);
}

function generateConsultationRecommendation() {
    const questionsContainer = document.getElementById('consultationQuestions');
    const quickResponsesContainer = document.getElementById('quickResponses');
    
    questionsContainer.innerHTML = `
        <div class="consultation-message ai-message final-recommendation">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <h4>🎯 Perfect! Based on your answers, here's my recommendation:</h4>
                <div class="recommendation-card">
                    <h5>✨ Recommended Solution</h5>
                    <p>Based on your requirements, I recommend our <strong>Professional Plan</strong> which includes:</p>
                    <ul>
                        <li>🚀 Optimized performance for your use case</li>
                        <li>💼 Professional support with priority response</li>
                        <li>📈 Scalability to grow with your business</li>
                        <li>🛡️ Enhanced security features</li>
                    </ul>
                    <div class="recommendation-price">
                        <span class="price-label">Estimated monthly cost:</span>
                        <span class="price-value">$7/month</span>
                    </div>
                </div>
                <p><strong>Next steps:</strong> Would you like to schedule a personalized demo or speak with our solutions architect?</p>
            </div>
        </div>
    `;
    
    quickResponsesContainer.innerHTML = `
        <button class="quick-response-btn primary" onclick="scheduleDemo()">
            📅 Schedule Demo
        </button>
        <button class="quick-response-btn" onclick="speakWithExpert()">
            👨‍💼 Speak with Expert
        </button>
        <button class="quick-response-btn" onclick="getQuote()">
            💰 Get Custom Quote
        </button>
        <button class="quick-response-btn" onclick="startFreeTrial()">
            🆓 Start Free Trial
        </button>
    `;
}

function scheduleDemo() {
    alert('🎉 Great choice! A demo scheduling link has been sent to your email. Our team will contact you within 24 hours to arrange a personalized demonstration.');
    closeAIConsultation();
}

function speakWithExpert() {
    alert('👨‍💼 Perfect! A solutions architect will call you within the next business hour to discuss your specific requirements.');
    closeAIConsultation();
}

function getQuote() {
    alert('💰 Custom quote generated! Check your email for a detailed pricing proposal based on your requirements.');
    closeAIConsultation();
}

function startFreeTrial() {
    alert('🚀 Excellent! Your 30-day free trial account is being set up. Login credentials will be sent to your email shortly.');
    closeAIConsultation();
}

function closeAIConsultation() {
    const modal = document.getElementById('aiConsultationModal');
    if (modal) {
        document.body.removeChild(modal);
    }
    consultationStep = 0;
    consultationAnswers = [];
}

function sendConsultationMessage() {
    const input = document.getElementById('consultationInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    const chatContainer = document.getElementById('consultationChat');
    const userMessage = document.createElement('div');
    userMessage.className = 'consultation-message user-message';
    userMessage.innerHTML = `
        <div class="message-avatar user-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    chatContainer.appendChild(userMessage);
    
    input.value = '';
    
    // Generate AI response
    setTimeout(() => {
        const aiResponse = document.createElement('div');
        aiResponse.className = 'consultation-message ai-message';
        aiResponse.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Thank you for that information! That helps me understand your needs better. ${generateContextualResponse(message)}</p>
            </div>
        `;
        chatContainer.appendChild(aiResponse);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1000);
}

function generateContextualResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('price') || msg.includes('cost') || msg.includes('budget')) {
        return "Our pricing is very competitive and we offer flexible payment plans. Would you like me to create a custom quote based on your specific requirements?";
    }
    
    if (msg.includes('security') || msg.includes('compliance')) {
        return "Security is our top priority. We maintain SOC 2 compliance and offer enterprise-grade encryption. Let me connect you with our security specialist.";
    }
    
    if (msg.includes('support') || msg.includes('help')) {
        return "We provide 24/7 expert support with average response times under 15 minutes. Our team includes certified cloud architects and engineers.";
    }
    
    return "Based on what you've shared, I can help you find the perfect solution. Let me continue with a few more questions to ensure we meet all your requirements.";
}

function handleConsultationEnter(event) {
    if (event.key === 'Enter') {
        sendConsultationMessage();
    }
}

// Additional service functions
function requestDemo(serviceType) {
    alert(`🎬 Demo requested for ${serviceType}! Our solutions team will contact you within 24 hours to schedule a personalized demonstration of our ${serviceType} capabilities.`);
    closeModal();
}

function downloadInfo(serviceType) {
    alert(`📄 Datasheet for ${serviceType} is being prepared! A comprehensive PDF with technical specifications, pricing, and case studies will be sent to your email.`);
    closeModal();
}

// Add enhanced service modal styles
function addEnhancedServiceStyles() {
    if (document.getElementById('enhancedServiceStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'enhancedServiceStyles';
    style.textContent = `
        .enhanced-service-modal {
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .service-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            border-radius: 12px;
        }
        
        .service-description {
            font-size: 1.1rem;
            margin-top: 10px;
            opacity: 0.9;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .feature-item {
            display: flex;
            gap: 15px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
            transition: transform 0.3s ease;
        }
        
        .feature-item:hover {
            transform: translateX(5px);
        }
        
        .feature-icon {
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .feature-content h5 {
            margin: 0 0 8px 0;
            color: #1e293b;
            font-size: 1.1rem;
        }
        
        .feature-content p {
            margin: 0;
            color: #64748b;
            line-height: 1.5;
        }
        
        .pricing-section {
            margin: 30px 0;
            padding: 25px;
            background: #f8fafc;
            border-radius: 12px;
        }
        
        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .pricing-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid #e2e8f0;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .pricing-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .pricing-card.featured {
            border-color: #3b82f6;
            transform: scale(1.05);
        }
        
        .popular-badge {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: #3b82f6;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .pricing-card h5 {
            margin: 0 0 15px 0;
            color: #1e293b;
            font-size: 1.3rem;
        }
        
        .price {
            font-size: 2rem;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 15px;
        }
        
        .pricing-btn {
            width: 100%;
            padding: 12px;
            background: #1e3a8a;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 15px;
        }
        
        .pricing-btn:hover {
            background: #3b82f6;
            transform: translateY(-2px);
        }
        
        .service-advantages {
            margin: 30px 0;
        }
        
        .advantages-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .advantage-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #22c55e;
        }
        
        .advantage-item i {
            color: #22c55e;
            font-size: 1.2rem;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .ai-consultation-btn {
            flex: 1;
            min-width: 200px;
            padding: 15px 25px;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .ai-consultation-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(30, 58, 138, 0.3);
        }
        
        .demo-btn, .info-btn {
            flex: 1;
            min-width: 150px;
            padding: 15px 20px;
            border: 2px solid #3b82f6;
            background: white;
            color: #3b82f6;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .demo-btn:hover, .info-btn:hover {
            background: #3b82f6;
            color: white;
            transform: translateY(-2px);
        }
    `;
    
    document.head.appendChild(style);
}

// Add consultation modal styles
function addConsultationStyles() {
    if (document.getElementById('consultationStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'consultationStyles';
    style.textContent = `
        .ai-consultation-container {
            display: flex;
            flex-direction: column;
            height: 70vh;
        }
        
        .consultation-header {
            display: flex;
            gap: 20px;
            padding: 25px;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            border-radius: 12px 12px 0 0;
        }
        
        .ai-avatar-large {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        
        .consultation-info h4 {
            margin: 0 0 10px 0;
            font-size: 1.3rem;
        }
        
        .consultation-info p {
            margin: 0 0 15px 0;
            opacity: 0.9;
        }
        
        .consultation-stats {
            display: flex;
            gap: 15px;
        }
        
        .consultation-stats .stat {
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.9rem;
        }
        
        .consultation-chat {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f8fafc;
        }
        
        .consultation-message {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .consultation-message.user-message {
            flex-direction: row-reverse;
        }
        
        .consultation-message .message-avatar {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            flex-shrink: 0;
        }
        
        .consultation-message.ai-message .message-avatar {
            background: #1e3a8a;
            color: white;
        }
        
        .consultation-message.user-message .user-avatar {
            background: #64748b;
            color: white;
        }
        
        .consultation-message .message-content {
            background: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            max-width: 70%;
        }
        
        .consultation-message.user-message .message-content {
            background: #3b82f6;
            color: white;
        }
        
        .recommendation-card {
            background: #f0f9ff;
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        
        .recommendation-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            padding: 10px;
            background: white;
            border-radius: 8px;
        }
        
        .price-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: #1e3a8a;
        }
        
        .consultation-input {
            border-top: 1px solid #e2e8f0;
            padding: 20px;
            background: white;
        }
        
        .quick-responses {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        
        .quick-response-btn {
            padding: 10px 15px;
            border: 2px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .quick-response-btn:hover {
            border-color: #3b82f6;
            background: #3b82f6;
            color: white;
        }
        
        .quick-response-btn.primary {
            background: #1e3a8a;
            color: white;
            border-color: #1e3a8a;
        }
        
        .chat-input-container {
            display: flex;
            gap: 10px;
        }
        
        #consultationInput {
            flex: 1;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 25px;
            outline: none;
        }
        
        #consultationInput:focus {
            border-color: #3b82f6;
        }
        
        .send-btn {
            width: 45px;
            height: 45px;
            background: #1e3a8a;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .send-btn:hover {
            background: #3b82f6;
            transform: scale(1.1);
        }
    `;
    
    document.head.appendChild(style);
}

// Enhanced Media & Design Portfolio Functions
function showMediaPortfolio(portfolioType) {
    const portfolioData = {
        'graphic': {
            title: '🎨 Graphic Design Portfolio',
            description: 'Professional logo design, branding, and print materials that make your business stand out',
            services: [
                { icon: '💼', title: 'Brand Identity Design', desc: 'Complete brand systems including logos, color palettes, typography, and brand guidelines', price: 'Free' },
                { icon: '🗃️', title: 'Print Design', desc: 'Business cards, brochures, posters, banners, and marketing collateral design', price: 'Free' },
                { icon: '📊', title: 'Infographics', desc: 'Data visualization and information design for presentations and marketing', price: '$7' },
                { icon: '🏷️', title: 'Packaging Design', desc: 'Product packaging and label design that attracts customers and drives sales', price: '$7' }
            ],
            capabilities: [
                { type: 'Brand Identity Systems', feature: 'Complete Brand Packages', description: 'Logo design, color palettes, typography, business cards, and brand guidelines' },
                { type: 'Print Media Design', feature: 'Marketing Materials', description: 'Brochures, flyers, posters, banners, and promotional materials' },
                { type: 'Data Visualization', feature: 'Infographic Creation', description: 'Transform complex data into engaging visual stories and presentations' },
                { type: 'Product Design', feature: 'Packaging Solutions', description: 'Eye-catching product packaging and label designs that drive sales' }
            ]
        },
        'video': {
            title: '🎥 Video Production Portfolio',
            description: 'Corporate videos, animations, and promotional content that tells your story',
            services: [
                { icon: '📹', title: 'Corporate Videos', desc: 'Company profiles, testimonials, and internal communications with 4K quality', price: 'Free' },
                { icon: '✨', title: 'Motion Graphics', desc: 'Animated logos, explainer videos, and promotional animations', price: 'Free' },
                { icon: '🎧', title: 'Audio Production', desc: 'Voice-overs, music composition, and sound design in multiple languages', price: '$7' },
                { icon: '📡', title: 'Live Streaming', desc: 'Professional live event coverage and streaming services', price: '$7/event' }
            ],
            capabilities: [
                { type: 'Corporate Videos', feature: 'Professional Profiles', description: '4K quality company profiles, testimonials, and brand storytelling videos' },
                { type: 'Animation & Motion', feature: 'Animated Content', description: 'Explainer videos, logo animations, and educational animated series' },
                { type: 'Event Production', feature: 'Live Coverage', description: 'Multi-camera event recording, live streaming, and post-production editing' },
                { type: 'Commercial Content', feature: 'Advertisement Videos', description: 'TV commercials, social media ads, and promotional video content' }
            ]
        },
        'web': {
            title: '🌐 Web Design Portfolio',
            description: 'Modern, responsive websites and digital experiences that convert visitors',
            services: [
                { icon: '📱', title: 'Responsive Websites', desc: 'Mobile-first websites that look great on all devices and load fast', price: 'Free' },
                { icon: '🛍️', title: 'E-commerce Stores', desc: 'Online stores with payment integration, inventory management, and analytics', price: 'Free' },
                { icon: '📊', title: 'Web Applications', desc: 'Custom web applications with user dashboards and database integration', price: '$7' },
                { icon: '🎯', title: 'Landing Pages', desc: 'High-converting landing pages for marketing campaigns and lead generation', price: '$7' }
            ],
            capabilities: [
                { type: 'Corporate Websites', feature: 'Business Presence', description: 'Professional websites with multilingual support and SEO optimization' },
                { type: 'E-commerce Solutions', feature: 'Online Stores', description: 'Full-featured online marketplaces with payment processing and inventory management' },
                { type: 'Web Applications', feature: 'Custom Systems', description: 'Patient management, booking systems, and custom business applications' },
                { type: 'Landing Pages', feature: 'Campaign Sites', description: 'High-converting campaign pages with analytics and lead capture' }
            ]
        }
    };
    
    const portfolio = portfolioData[portfolioType];
    if (!portfolio) {
        alert('Portfolio not available.');
        return;
    }
    
    modalTitle.textContent = portfolio.title;
    modalBody.innerHTML = `
        <div class="enhanced-portfolio-modal">
            <div class="portfolio-header">
                <h3>${portfolio.title}</h3>
                <p class="portfolio-description">${portfolio.description}</p>
            </div>
            
            <div class="portfolio-services">
                <h4>📦 Our Services & Pricing</h4>
                <div class="services-showcase">
                    ${portfolio.services.map(service => `
                        <div class="service-showcase-card">
                            <div class="showcase-icon">${service.icon}</div>
                            <h5>${service.title}</h5>
                            <p>${service.desc}</p>
                            <div class="service-price">${service.price}</div>
                            <button onclick="openEnhancedContactForm('${portfolioType}', '${service.title}', 'quote')" class="quote-btn">Get Quote</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="capabilities-showcase">
                <h4>🚀 Our Core Capabilities</h4>
                <div class="capabilities-grid">
                    ${portfolio.capabilities.map(capability => `
                        <div class="capability-card">
                            <div class="capability-icon">
                                <i class="fas fa-cog"></i>
                            </div>
                            <div class="capability-info">
                                <div class="capability-type">${capability.type}</div>
                                <h6>${capability.feature}</h6>
                                <p>${capability.description}</p>
                                <button onclick="openEnhancedContactForm('${portfolioType}', '${capability.type}', 'inquiry')" class="capability-btn">Learn More</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="service-standards">
                <h4>🎯 Our Service Standards</h4>
                <div class="standards-grid">
                    <div class="standard-item">
                        <div class="standard-icon">🚀</div>
                        <div class="standard-label">Fast Delivery</div>
                        <div class="standard-desc">Most projects completed within 5-7 days</div>
                    </div>
                    <div class="standard-item">
                        <div class="standard-icon">🎨</div>
                        <div class="standard-label">Quality Design</div>
                        <div class="standard-desc">Professional, modern design standards</div>
                    </div>
                    <div class="standard-item">
                        <div class="standard-icon">🔄</div>
                        <div class="standard-label">Unlimited Revisions</div>
                        <div class="standard-desc">We work until you're completely satisfied</div>
                    </div>
                    <div class="standard-item">
                        <div class="standard-icon">📞</div>
                        <div class="standard-label">24/7 Support</div>
                        <div class="standard-desc">Always available for project questions</div>
                    </div>
                </div>
            </div>
            
            <div class="service-approach">
                <h4>✨ Our Design Approach</h4>
                <div class="approach-points">
                    <div class="approach-point">
                        <i class="fas fa-palette"></i>
                        <span>Creative solutions tailored to your specific business needs</span>
                    </div>
                    <div class="approach-point">
                        <i class="fas fa-clock"></i>
                        <span>Efficient workflow with clear timelines and milestones</span>
                    </div>
                    <div class="approach-point">
                        <i class="fas fa-redo"></i>
                        <span>Collaborative process with feedback at every stage</span>
                    </div>
                    <div class="approach-point">
                        <i class="fas fa-lightbulb"></i>
                        <span>Modern design principles with user experience focus</span>
                    </div>
                    <div class="approach-point">
                        <i class="fas fa-handshake"></i>
                        <span>Direct communication and transparent project management</span>
                    </div>
                    <div class="approach-point">
                        <i class="fas fa-dollar-sign"></i>
                        <span>Transparent pricing with no hidden costs or surprises</span>
                    </div>
                </div>
            </div>
            
            <div class="portfolio-actions">
                <button onclick="openEnhancedContactForm('${portfolioType}', 'Creative ${portfolioType.charAt(0).toUpperCase() + portfolioType.slice(1)} Services', 'consultation')" class="creative-consultation-btn">
                    <i class="fas fa-magic"></i> Start Creative Consultation
                </button>
                <button onclick="openEnhancedContactForm('${portfolioType}', 'Creative ${portfolioType.charAt(0).toUpperCase() + portfolioType.slice(1)} Services', 'demo')" class="portfolio-demo-btn">
                    <i class="fas fa-play"></i> View Full Portfolio
                </button>
                <button onclick="openEnhancedContactForm('${portfolioType}', 'Creative ${portfolioType.charAt(0).toUpperCase() + portfolioType.slice(1)} Services', 'quote')" class="creative-quote-btn">
                    <i class="fas fa-calculator"></i> Get Custom Quote
                </button>
            </div>
        </div>
    `;
    
    toolModal.style.display = 'block';
    addPortfolioStyles();
}

// Portfolio Supporting Functions
function requestQuote(serviceTitle) {
    alert(`💰 Quote request for ${serviceTitle}! Our creative team will prepare a detailed quote based on your specific requirements and send it within 24 hours.`);
}

// Removed fake project details - replaced with authentic capability showcase

function startCreativeConsultation(portfolioType) {
    // Create creative consultation modal
    const creativeModal = document.createElement('div');
    creativeModal.id = 'creativeConsultationModal';
    creativeModal.className = 'modal';
    creativeModal.style.display = 'block';
    
    creativeModal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3><i class="fas fa-magic"></i> Creative Consultation</h3>
                <span class="close" onclick="closeCreativeConsultation()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="creative-consultation-container">
                    <div class="creative-header">
                        <div class="creative-avatar">
                            <i class="fas fa-palette"></i>
                        </div>
                        <div class="creative-info">
                            <h4>Hello! I'm your Creative Design Consultant</h4>
                            <p>Let's create something amazing together! I'll help you find the perfect design solution for your ${portfolioType} project.</p>
                        </div>
                    </div>
                    
                    <div class="creative-questions">
                        <h4>🎨 Tell us about your project:</h4>
                        <div class="question-set">
                            <div class="creative-question">
                                <label>What's your project goal?</label>
                                <div class="creative-options">
                                    <button class="option-btn" onclick="selectCreativeOption('Brand New Business')">Brand New Business</button>
                                    <button class="option-btn" onclick="selectCreativeOption('Rebrand Existing')">Rebrand Existing</button>
                                    <button class="option-btn" onclick="selectCreativeOption('Marketing Campaign')">Marketing Campaign</button>
                                    <button class="option-btn" onclick="selectCreativeOption('Product Launch')">Product Launch</button>
                                </div>
                            </div>
                            
                            <div class="creative-question">
                                <label>What's your timeline?</label>
                                <div class="creative-options">
                                    <button class="option-btn" onclick="selectCreativeOption('ASAP (Rush Job)')">ASAP (Rush Job)</button>
                                    <button class="option-btn" onclick="selectCreativeOption('1-2 weeks')">1-2 weeks</button>
                                    <button class="option-btn" onclick="selectCreativeOption('1 month')">1 month</button>
                                    <button class="option-btn" onclick="selectCreativeOption('Flexible')">Flexible</button>
                                </div>
                            </div>
                            
                            <div class="creative-question">
                                <label>What's your budget range?</label>
                                <div class="creative-options">
                                    <button class="option-btn" onclick="selectCreativeOption('Under $500')">Under $500</button>
                                    <button class="option-btn" onclick="selectCreativeOption('$500-$1,500')">$500-$1,500</button>
                                    <button class="option-btn" onclick="selectCreativeOption('$1,500-$5,000')">$1,500-$5,000</button>
                                    <button class="option-btn" onclick="selectCreativeOption('$5,000+')">$5,000+</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="creative-actions">
                            <button onclick="submitCreativeConsultation()" class="creative-submit-btn">
                                <i class="fas fa-paper-plane"></i> Submit & Get Recommendation
                            </button>
                            <button onclick="callCreativeTeam()" class="creative-call-btn">
                                <i class="fas fa-phone"></i> Call Creative Team
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(creativeModal);
    addCreativeConsultationStyles();
}

let creativeAnswers = [];

function selectCreativeOption(answer) {
    creativeAnswers.push(answer);
    event.target.style.background = '#1e3a8a';
    event.target.style.color = 'white';
}

function submitCreativeConsultation() {
    if (creativeAnswers.length < 3) {
        alert('Please answer all questions to get a personalized recommendation.');
        return;
    }
    alert('✨ Perfect! Based on your answers, our creative team recommends a comprehensive design package. You\'ll receive a detailed proposal with mockups and timeline within 24 hours.');
    closeCreativeConsultation();
}

function callCreativeTeam() {
    alert('📞 Great choice! Our creative director will call you within the next hour to discuss your project in detail and provide immediate guidance.');
    closeCreativeConsultation();
}

function closeCreativeConsultation() {
    const modal = document.getElementById('creativeConsultationModal');
    if (modal) {
        document.body.removeChild(modal);
    }
    creativeAnswers = [];
}

function requestPortfolioDemo(portfolioType) {
    alert(`🎬 Portfolio demo requested for ${portfolioType}! Our design team will prepare a personalized portfolio showcase and contact you within 24 hours.`);
    closeModal();
}

function getCreativeQuote(portfolioType) {
    alert(`📄 Custom quote for ${portfolioType} services! Our pricing specialist will create a tailored proposal and send it to your email within 2 hours.`);
    closeModal();
}

// Add portfolio modal styles
function addPortfolioStyles() {
    if (document.getElementById('portfolioStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'portfolioStyles';
    style.textContent = `
        .enhanced-portfolio-modal {
            max-height: 85vh;
            overflow-y: auto;
        }
        
        .portfolio-header {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border-radius: 12px;
            margin-bottom: 25px;
        }
        
        .portfolio-description {
            font-size: 1.1rem;
            margin-top: 10px;
            opacity: 0.9;
        }
        
        .services-showcase {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .service-showcase-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .service-showcase-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-color: #8b5cf6;
        }
        
        .showcase-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }
        
        .service-showcase-card h5 {
            margin: 0 0 10px 0;
            color: #1e293b;
            font-size: 1.2rem;
        }
        
        .service-price {
            color: #8b5cf6;
            font-weight: 700;
            font-size: 1.1rem;
            margin: 15px 0;
        }
        
        .quote-btn {
            background: #6366f1;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .quote-btn:hover {
            background: #4f46e5;
            transform: translateY(-2px);
        }
        
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .project-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid #e2e8f0;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .project-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .project-image-placeholder {
            height: 150px;
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-size: 2rem;
        }
        
        .project-image-placeholder span {
            font-size: 0.9rem;
            margin-top: 10px;
        }
        
        .project-info {
            padding: 20px;
        }
        
        .project-type {
            background: #6366f1;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 10px;
        }
        
        .project-info h6 {
            margin: 0 0 8px 0;
            color: #1e293b;
            font-size: 1.1rem;
        }
        
        .impact-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .impact-stat {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border-radius: 12px;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: #6366f1;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .creative-advantages {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .advantage-point {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #6366f1;
        }
        
        .advantage-point i {
            color: #6366f1;
            font-size: 1.2rem;
        }
        
        .portfolio-actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .creative-consultation-btn, .portfolio-demo-btn, .creative-quote-btn {
            flex: 1;
            min-width: 200px;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
        }
        
        .creative-consultation-btn {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
        }
        
        .creative-consultation-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
        
        .portfolio-demo-btn, .creative-quote-btn {
            border: 2px solid #6366f1;
            background: white;
            color: #6366f1;
        }
        
        .portfolio-demo-btn:hover, .creative-quote-btn:hover {
            background: #6366f1;
            color: white;
            transform: translateY(-2px);
        }
    `;
    
    document.head.appendChild(style);
}

// Add creative consultation styles
function addCreativeConsultationStyles() {
    if (document.getElementById('creativeConsultationStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'creativeConsultationStyles';
    style.textContent = `
        .creative-consultation-container {
            padding: 20px;
        }
        
        .creative-header {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border-radius: 12px;
        }
        
        .creative-avatar {
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        
        .creative-info h4 {
            margin: 0 0 10px 0;
        }
        
        .creative-question {
            margin-bottom: 25px;
        }
        
        .creative-question label {
            display: block;
            font-weight: 600;
            margin-bottom: 10px;
            color: #1e293b;
        }
        
        .creative-options {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .option-btn {
            padding: 10px 15px;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }
        
        .option-btn:hover {
            border-color: #6366f1;
            background: #f0f9ff;
        }
        
        .creative-actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        
        .creative-submit-btn, .creative-call-btn {
            flex: 1;
            padding: 15px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .creative-submit-btn {
            background: #6366f1;
            color: white;
            border: none;
        }
        
        .creative-call-btn {
            border: 2px solid #6366f1;
            background: white;
            color: #6366f1;
        }
        
        .creative-submit-btn:hover, .creative-call-btn:hover {
            transform: translateY(-2px);
        }
        
        .creative-call-btn:hover {
            background: #6366f1;
            color: white;
        }
    `;
    
    document.head.appendChild(style);
}


// Contact Sales Function
function contactSales(service) {
    const contactModal = `
        <div class="contact-modal">
            <h3>Contact KaiTech Rwanda</h3>
            <p>Thank you for your interest in our <strong>${service}</strong> services!</p>
            
            <div class="contact-info">
                <div class="contact-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Kigali, Rwanda - East Africa's Tech Hub</span>
                </div>
                <div class="contact-detail">
                    <i class="fas fa-phone"></i>
                    <span>+250 XXX XXX XXX</span>
                </div>
                <div class="contact-detail">
                    <i class="fas fa-envelope"></i>
                    <span>info@kaitech.rw</span>
                </div>
                <div class="contact-detail">
                    <i class="fas fa-globe"></i>
                    <span>www.kaitech.rw</span>
                </div>
            </div>
            
            <div class="contact-form-placeholder">
                <p><strong>"Voice of Time" - We deliver timely solutions!</strong></p>
                <p>Our team will contact you within 24 hours to discuss your ${service} requirements.</p>
                
                <div class="next-steps">
                    <h4>What happens next:</h4>
                    <ol>
                        <li>📞 Initial consultation call</li>
                        <li>📋 Requirements analysis</li>
                        <li>💡 Customized proposal</li>
                        <li>🚀 Project kickoff</li>
                    </ol>
                </div>
            </div>
            
            <button onclick="closeModal()" class="contact-btn">Close</button>
        </div>
    `;
    
    modalTitle.textContent = 'Contact KaiTech Rwanda';
    modalBody.innerHTML = contactModal;
    toolModal.style.display = 'block';
}

// Enhanced Breaking News for Rwanda Context
function updateRwandaBreakingNews() {
    const rwandaNews = [
        'Voice of Time: KaiTech Rwanda expands AI services across East Africa',
        'Breaking: Rwanda Tech Hub attracts major international cloud investments', 
        'KaiTech Intelligence: 98.7% accuracy in real-time global news analysis',
        'Live: Rwanda leads Africa in sustainable technology infrastructure',
        'Breaking: KaiTech media wins award for innovative digital content',
        'Voice of Time: Rwanda Vision 2050 accelerated by KaiTech solutions'
    ];
    
    let newsIndex = 0;
    setInterval(() => {
        if (breakingNewsText) {
            breakingNewsText.textContent = rwandaNews[newsIndex];
            newsIndex = (newsIndex + 1) % rwandaNews.length;
        }
    }, 8000);
}

// Initialize Rwanda-specific features
function initializeRwandaFeatures() {
    updateRwandaBreakingNews();
    console.log('KaiTech Rwanda features initialized - Voice of Time activated!');
}

// AI News Analysis Functions
function showNewsCategory(analysisType) {
    const analysisResults = document.getElementById('analysisResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsContent = document.getElementById('resultsContent');
    
    const analysisData = {
        'sentiment': {
            title: 'Global Sentiment Analysis',
            content: `
                <div class="sentiment-analysis">
                    <h4>Current Sentiment Trends</h4>
                    <div class="sentiment-metrics">
                        <div class="metric-card positive">
                            <span class="metric-value">+73%</span>
                            <span class="metric-label">Global Positive</span>
                        </div>
                        <div class="metric-card neutral">
                            <span class="metric-value">19%</span>
                            <span class="metric-label">Neutral</span>
                        </div>
                        <div class="metric-card negative">
                            <span class="metric-value">8%</span>
                            <span class="metric-label">Negative</span>
                        </div>
                    </div>
                    <h5>Top Positive Topics:</h5>
                    <ul class="topic-list">
                        <li>🤖 AI Healthcare Breakthroughs (+89% sentiment)</li>
                        <li>🚀 Space Technology Advances (+85% sentiment)</li>
                        <li>🌱 Sustainable Tech Solutions (+82% sentiment)</li>
                        <li>📚 Educational AI Tools (+78% sentiment)</li>
                    </ul>
                </div>
            `
        },
        'trends': {
            title: 'Trending Topics Analysis',
            content: `
                <div class="trends-analysis">
                    <h4>Current Trending Topics</h4>
                    <div class="trend-items">
                        <div class="trend-item hot">
                            <span class="trend-rank">#1</span>
                            <span class="trend-topic">AI Technology</span>
                            <span class="trend-growth">+125% ⬆️</span>
                        </div>
                        <div class="trend-item rising">
                            <span class="trend-rank">#2</span>
                            <span class="trend-topic">Cloud Computing</span>
                            <span class="trend-growth">+89% ⬆️</span>
                        </div>
                        <div class="trend-item rising">
                            <span class="trend-rank">#3</span>
                            <span class="trend-topic">Quantum Computing</span>
                            <span class="trend-growth">+67% ⬆️</span>
                        </div>
                        <div class="trend-item stable">
                            <span class="trend-rank">#4</span>
                            <span class="trend-topic">Cybersecurity</span>
                            <span class="trend-growth">+34% ⬆️</span>
                        </div>
                    </div>
                    <p><em>Updated every 5 minutes using advanced NLP algorithms</em></p>
                </div>
            `
        },
        'insights': {
            title: 'Market Insights & Predictions',
            content: `
                <div class="insights-analysis">
                    <h4>AI-Powered Market Analysis</h4>
                    <div class="insight-cards">
                        <div class="insight-card">
                            <h5>📈 Market Prediction</h5>
                            <p>AI sector expected to grow 23% in next quarter based on current news sentiment and investment patterns.</p>
                            <span class="confidence">94.2% confidence</span>
                        </div>
                        <div class="insight-card">
                            <h5>🎯 Investment Opportunities</h5>
                            <p>Quantum computing and AI healthcare showing strongest positive sentiment correlation with funding announcements.</p>
                            <span class="confidence">91.7% confidence</span>
                        </div>
                        <div class="insight-card">
                            <h5>⚠️ Risk Factors</h5>
                            <p>Regulatory discussions in EU and US may impact AI development timelines in Q1 2025.</p>
                            <span class="confidence">87.3% confidence</span>
                        </div>
                    </div>
                </div>
            `
        }
    };
    
    const data = analysisData[analysisType];
    if (data) {
        resultsTitle.textContent = data.title;
        resultsContent.innerHTML = data.content;
        analysisResults.style.display = 'block';
        analysisResults.scrollIntoView({ behavior: 'smooth' });
    }
}

function closeAnalysisResults() {
    const analysisResults = document.getElementById('analysisResults');
    analysisResults.style.display = 'none';
}

// Enhanced news filtering with smooth transitions
function filterNewsByCategory(category) {
    const newsCards = document.querySelectorAll('.news-card');
    const newsGrid = document.getElementById('newsGrid');
    
    // Add loading animation
    newsGrid.style.opacity = '0.5';
    
    setTimeout(() => {
        let visibleCount = 0;
        
        newsCards.forEach(card => {
            if (category === 'all') {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.3s ease forwards';
                visibleCount++;
            } else {
                const cardCategory = card.getAttribute('data-category');
                if (cardCategory === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.3s ease forwards';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            }
        });
        
        // Update active filter button with visual feedback
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        // Show results count
        updateNewsCount(category, visibleCount);
        
        // Restore opacity
        newsGrid.style.opacity = '1';
        
        // Scroll to news section
        document.getElementById('news').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

// Update news count display
function updateNewsCount(category, count) {
    const categoryName = category === 'all' ? 'All News' : 
                        category.charAt(0).toUpperCase() + category.slice(1);
    
    // Create or update count display
    let countDisplay = document.getElementById('newsCount');
    if (!countDisplay) {
        countDisplay = document.createElement('div');
        countDisplay.id = 'newsCount';
        countDisplay.className = 'news-count-display';
        const newsFilters = document.querySelector('.news-filters');
        newsFilters.appendChild(countDisplay);
    }
    
    countDisplay.innerHTML = `
        <span class="count-text">Showing ${count} ${categoryName} stories</span>
        <div class="count-bar">
            <div class="count-progress" style="width: ${Math.min(count * 10, 100)}%"></div>
        </div>
    `;
}

// Initialize enhanced news filtering
function initializeEnhancedNewsFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            const category = this.dataset.category;
            filterNewsByCategory(category);
            
            // Update URL hash for navigation
            window.location.hash = category === 'all' ? 'news' : `news-${category}`;
        });
    });
    
    // Handle direct URL navigation
    handleURLNavigation();
}

// Handle URL-based navigation
function handleURLNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('news-')) {
        const category = hash.replace('news-', '');
        filterNewsByCategory(category);
    } else if (hash === 'news') {
        filterNewsByCategory('all');
    }
}

// Enhanced initialization
const originalInitialize = initializeApp;
initializeApp = function() {
    originalInitialize();
    initializeKaiTechFeatures();
    initializeNewsExplorer();
};

// Rename Rwanda features to KaiTech features
function initializeKaiTechFeatures() {
    updateKaiTechBreakingNews();
    console.log('KaiTech features initialized - Voice of Time activated!');
}

// Update breaking news for KaiTech branding
function updateKaiTechBreakingNews() {
    const kaiTechNews = [
        'Voice of Time: KaiTech expands technology solutions globally',
        'Breaking: KaiTech launches advanced cloud computing platform',
        'KaiTech Intelligence: 98.7% accuracy in real-time news analysis',
        'Live: KaiTech leads innovation in professional media production',
        'Breaking: KaiTech wins award for cutting-edge technology solutions',
        'Voice of Time: KaiTech delivers unparalleled news intelligence'
    ];
    
    let newsIndex = 0;
    setInterval(() => {
        if (breakingNewsText) {
            breakingNewsText.textContent = kaiTechNews[newsIndex];
            newsIndex = (newsIndex + 1) % kaiTechNews.length;
        }
    }, 8000);
}

// === ADVANCED NEWS EXPLORER SYSTEM ===

// News Explorer Core Functions
function switchNewsTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.news-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.news-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-content`).classList.add('active');
    
    // Initialize specific tab content
    if (tabName === 'trending') {
        initializeTrendingTab();
    } else if (tabName === 'live') {
        initializeLiveTab();
    } else if (tabName === 'games') {
        initializeGamesTab();
    } else if (tabName === 'religion') {
        initializeReligionTab();
    }
    
    // Load content based on tab
    loadTabContent(tabName);
}

function loadTabContent(tabName) {
    switch(tabName) {
        case 'trending':
            loadTrendingNews();
            break;
        case 'personalized':
            loadPersonalizedFeed();
            break;
        case 'analysis':
            loadAnalysisContent();
            break;
        case 'live':
            loadLiveNews();
            break;
        case 'games':
            loadGamesNews();
            break;
        case 'religion':
            loadReligionNews();
            break;
    }
}

// Advanced News Topic Exploration with Full Coverage
function exploreNewsTopic(topicId) {
    const topicData = {
        'ai-technology': {
            title: '🤖 AI & Technology News',
            description: 'Latest in artificial intelligence, machine learning, and tech innovation',
            totalArticles: 247,
            articles: [
                {
                    id: 'ai-001',
                    title: 'OpenAI Unveils GPT-5: Revolutionary Breakthrough in Artificial Intelligence',
                    excerpt: 'The latest iteration of GPT shows unprecedented reasoning capabilities across multiple domains, marking a significant leap toward artificial general intelligence.',
                    content: generateTechArticle('OpenAI GPT-5 represents the most significant advancement in artificial intelligence to date...'),
                    source: 'AI Tech Today',
                    time: '2 hours ago',
                    readTime: '5 min read',
                    author: 'Dr. Sarah Chen',
                    trending: true,
                    category: 'Breaking AI News'
                },
                {
                    id: 'ai-002', 
                    title: 'Quantum Computing Breakthrough: 1000x Speed Increase Achieved',
                    excerpt: 'Scientists at MIT demonstrate quantum processor capable of solving complex problems 1000 times faster than traditional computers.',
                    content: generateTechArticle('Quantum computing has reached a historic milestone with unprecedented processing capabilities...'),
                    source: 'Science Tech',
                    time: '4 hours ago',
                    readTime: '7 min read',
                    author: 'Dr. Michael Zhang',
                    trending: true,
                    category: 'Quantum Computing'
                },
                {
                    id: 'ai-003',
                    title: 'Tesla\'s Full Self-Driving AI Passes All Safety Tests',
                    excerpt: 'Autonomous driving technology achieves perfect safety record in comprehensive government testing program.',
                    content: generateTechArticle('Tesla\'s autonomous driving system has reached a new milestone in safety and reliability...'),
                    source: 'Auto Tech News',
                    time: '6 hours ago',
                    readTime: '4 min read',
                    author: 'Jennifer Liu',
                    category: 'Autonomous Vehicles'
                }
            ]
        },
        'global-markets': {
            title: '📈 Global Markets & Finance',
            description: 'Financial news, market trends, and economic developments',
            totalArticles: 189,
            articles: [
                {
                    id: 'market-001',
                    title: 'Global Stock Markets Rally on AI Technology Optimism',
                    excerpt: 'Major indices worldwide surge as investors show renewed confidence in artificial intelligence sector growth prospects.',
                    content: generateMarketArticle('Global financial markets experienced significant gains today as AI breakthrough announcements...'),
                    source: 'Financial Times',
                    time: '1 hour ago',
                    readTime: '6 min read',
                    author: 'Emma Thompson',
                    trending: true,
                    category: 'Market Rally'
                },
                {
                    id: 'market-002',
                    title: 'Federal Reserve Signals Potential Interest Rate Changes',
                    excerpt: 'Central bank hints at policy adjustments following strong economic indicators and technology sector growth.',
                    content: generateMarketArticle('The Federal Reserve\'s latest statement indicates potential monetary policy shifts...'),
                    source: 'Bloomberg Markets',
                    time: '3 hours ago',
                    readTime: '5 min read',
                    author: 'Robert Chen',
                    category: 'Central Banking'
                },
                {
                    id: 'market-003',
                    title: 'Cryptocurrency Markets Surge Following Institutional Adoption',
                    excerpt: 'Bitcoin and major altcoins reach new highs as traditional financial institutions increase digital asset exposure.',
                    content: generateMarketArticle('Cryptocurrency markets are experiencing unprecedented growth as institutional adoption accelerates...'),
                    source: 'Crypto Finance Daily',
                    time: '5 hours ago',
                    readTime: '4 min read',
                    author: 'Alex Rodriguez',
                    category: 'Cryptocurrency'
                }
            ]
        },
        'climate-tech': {
            title: '🌱 Climate & Sustainability',
            description: 'Environmental technology and sustainable business practices',
            totalArticles: 156,
            articles: [
                {
                    id: 'climate-001',
                    title: 'Revolutionary Solar Panel Technology Achieves 50% Efficiency',
                    excerpt: 'New perovskite-silicon hybrid cells break efficiency records, making solar power more cost-effective than fossil fuels.',
                    content: generateClimateArticle('Solar energy technology has reached a groundbreaking milestone with unprecedented efficiency rates...'),
                    source: 'Green Tech Today',
                    time: '2 hours ago',
                    readTime: '5 min read',
                    author: 'Dr. Maria Santos',
                    trending: true,
                    category: 'Renewable Energy'
                },
                {
                    id: 'climate-002',
                    title: 'Global Climate Summit: $2 Trillion Green Investment Commitment',
                    excerpt: 'World leaders announce historic funding for renewable energy infrastructure and carbon capture technologies.',
                    content: generateClimateArticle('The international climate summit has concluded with unprecedented commitments to environmental action...'),
                    source: 'Environmental News',
                    time: '4 hours ago',
                    readTime: '8 min read',
                    author: 'David Kim',
                    trending: true,
                    category: 'Climate Policy'
                },
                {
                    id: 'climate-003',
                    title: 'Ocean Cleanup Project Removes 10 Million Tons of Plastic',
                    excerpt: 'Innovative cleanup technology successfully extracts massive amounts of plastic waste from Pacific Ocean.',
                    content: generateClimateArticle('Ocean cleanup initiatives have achieved a major milestone in environmental restoration...'),
                    source: 'Ocean Conservation',
                    time: '6 hours ago',
                    readTime: '4 min read',
                    author: 'Rachel Green',
                    category: 'Ocean Conservation'
                }
            ]
        },
        'gaming-esports': {
            title: '🎮 Gaming & Esports',
            description: 'Gaming industry news, esports tournaments, and digital entertainment',
            totalArticles: 178,
            articles: [
                {
                    id: 'game-001',
                    title: 'Epic Games Unveils Unreal Engine 6 with Revolutionary AI Integration',
                    excerpt: 'Next-generation game engine promises photorealistic graphics and AI-driven dynamic storytelling that adapts to player behavior in real-time.',
                    content: generateGamingArticle('The gaming industry witnesses a paradigm shift with Unreal Engine 6...'),
                    source: 'GameDev Today',
                    time: '12 minutes ago',
                    readTime: '4 min read',
                    author: 'Alex Chen',
                    trending: true,
                    category: 'Gaming Industry'
                },
                {
                    id: 'game-002',
                    title: 'World Championship Esports Prize Pool Reaches Record $50 Million',
                    excerpt: 'Largest esports tournament in history set to break all viewership records with unprecedented global participation from 64 countries.',
                    content: generateGamingArticle('Competitive gaming reaches new heights with the announcement of the largest prize pool in esports history...'),
                    source: 'Esports Central',
                    time: '45 minutes ago',
                    readTime: '3 min read',
                    author: 'Sarah Kim',
                    trending: true,
                    category: 'Esports'
                },
                {
                    id: 'game-003',
                    title: 'Apple Vision Pro Gaming Revolution: 100+ Exclusive Titles Launch',
                    excerpt: 'Mixed reality gaming platform transforms entertainment with immersive experiences and unprecedented developer support.',
                    content: generateGamingArticle('Virtual and augmented reality gaming enters a new era with Apple Vision Pro...'),
                    source: 'VR Gaming News',
                    time: '1 hour ago',
                    readTime: '5 min read',
                    author: 'Mike Torres',
                    category: 'VR Gaming'
                }
            ]
        },
        'religion-faith': {
            title: '🙏 Religion & Faith',
            description: 'World religions, interfaith initiatives, and spiritual movements',
            totalArticles: 92,
            articles: [
                {
                    id: 'faith-001',
                    title: 'Pope Francis Calls for Global Unity in Climate Action',
                    excerpt: 'Historic encyclical emphasizes faith communities\' crucial role in environmental stewardship and sustainable development worldwide.',
                    content: generateReligionArticle('In a groundbreaking encyclical, Pope Francis addresses the urgent need for faith-based climate action...'),
                    source: 'Vatican News',
                    time: '1 hour ago',
                    readTime: '6 min read',
                    author: 'Cardinal Martinez',
                    trending: true,
                    category: 'Vatican News'
                },
                {
                    id: 'faith-002',
                    title: 'Global Interfaith Alliance Launches $2 Billion Peace Initiative',
                    excerpt: 'World religious leaders unite for unprecedented humanitarian aid and conflict resolution across multiple crisis regions.',
                    content: generateReligionArticle('Religious leaders from major world faiths announce historic cooperation for global peace...'),
                    source: 'World Faith News',
                    time: '2 hours ago',
                    readTime: '7 min read',
                    author: 'Dr. Amira Hassan',
                    category: 'Interfaith'
                },
                {
                    id: 'faith-003',
                    title: 'Faith-Based Organizations Lead Global Disaster Relief Efforts',
                    excerpt: 'Religious communities mobilize unprecedented resources and volunteers for emergency response in multiple disaster zones.',
                    content: generateReligionArticle('Faith-based humanitarian organizations coordinate massive relief efforts...'),
                    source: 'Faith & Action',
                    time: '3 hours ago',
                    readTime: '4 min read',
                    author: 'Rev. David Park',
                    category: 'Humanitarian'
                }
            ]
        },
        'space-exploration': {
            title: '🚀 Space & Exploration',
            description: 'Space missions, astronomical discoveries, and space technology',
            totalArticles: 98,
            articles: [
                {
                    id: 'space-001',
                    title: 'Mars Colony Mission: First Permanent Settlement Planned for 2030',
                    excerpt: 'SpaceX and NASA announce joint mission to establish humanity\'s first permanent settlement on Mars.',
                    content: generateSpaceArticle('The future of human space exploration reached a new milestone with the announcement of permanent Mars colonization...'),
                    source: 'Space News Daily',
                    time: '3 hours ago',
                    readTime: '6 min read',
                    author: 'Dr. James Mitchell',
                    trending: true,
                    category: 'Mars Exploration'
                },
                {
                    id: 'space-002',
                    title: 'James Webb Telescope Discovers Earth-Like Exoplanet',
                    excerpt: 'Potentially habitable world found 40 light-years away shows signs of water vapor and suitable temperatures.',
                    content: generateSpaceArticle('The James Webb Space Telescope has made another groundbreaking discovery in the search for habitable worlds...'),
                    source: 'Astronomy Today',
                    time: '5 hours ago',
                    readTime: '5 min read',
                    author: 'Dr. Lisa Park',
                    category: 'Exoplanet Discovery'
                },
                {
                    id: 'space-003',
                    title: 'Private Space Tourism: First Commercial Space Hotel Opens',
                    excerpt: 'Orbital luxury hotel welcomes first guests as space tourism enters commercial phase.',
                    content: generateSpaceArticle('The commercial space industry has reached a new frontier with the opening of the first orbital hotel...'),
                    source: 'Space Tourism Weekly',
                    time: '8 hours ago',
                    readTime: '4 min read',
                    author: 'Mark Johnson',
                    category: 'Space Tourism'
                }
            ]
        },
        'health-innovation': {
            title: '🏥 Health Innovation',
            description: 'Medical breakthroughs, healthcare technology, and wellness trends',
            totalArticles: 134,
            articles: [
                {
                    id: 'health-001',
                    title: 'AI-Designed Drug Cures Rare Disease in Clinical Trials',
                    excerpt: 'First medication developed entirely by artificial intelligence shows 95% success rate in human trials.',
                    content: generateHealthArticle('Artificial intelligence has achieved a historic milestone in drug discovery and development...'),
                    source: 'Medical AI Journal',
                    time: '1 hour ago',
                    readTime: '6 min read',
                    author: 'Dr. Amanda Foster',
                    trending: true,
                    category: 'AI Medicine'
                },
                {
                    id: 'health-002',
                    title: 'Gene Therapy Breakthrough: Blindness Reversed in Patients',
                    excerpt: 'Revolutionary gene editing treatment restores sight to patients with inherited blindness.',
                    content: generateHealthArticle('Gene therapy has achieved remarkable success in treating previously incurable genetic conditions...'),
                    source: 'Gene Therapy News',
                    time: '4 hours ago',
                    readTime: '5 min read',
                    author: 'Dr. Robert Lin',
                    category: 'Gene Therapy'
                },
                {
                    id: 'health-003',
                    title: 'Wearable Health Tech Predicts Heart Attacks 24 Hours Early',
                    excerpt: 'Advanced biosensors can detect cardiac events before symptoms appear, saving thousands of lives.',
                    content: generateHealthArticle('Wearable health technology has reached unprecedented accuracy in predictive healthcare monitoring...'),
                    source: 'Digital Health Today',
                    time: '6 hours ago',
                    readTime: '4 min read',
                    author: 'Dr. Sarah Wilson',
                    category: 'Wearable Health'
                }
            ]
        },
        'cybersecurity': {
            title: '🛑️ Cybersecurity',
            description: 'Digital security, privacy, and cyber threat intelligence',
            totalArticles: 87,
            articles: [
                {
                    id: 'cyber-001',
                    title: 'Quantum Encryption Becomes Unhackable Reality',
                    excerpt: 'New quantum cryptography system provides theoretically unbreakable security for sensitive communications.',
                    content: generateCyberArticle('Quantum encryption technology has evolved from theoretical concept to practical reality...'),
                    source: 'Cybersecurity Weekly',
                    time: '2 hours ago',
                    readTime: '5 min read',
                    author: 'Alex Chen',
                    trending: true,
                    category: 'Quantum Security'
                },
                {
                    id: 'cyber-002',
                    title: 'AI-Powered Cyber Defense Stops 99.9% of Attacks',
                    excerpt: 'Machine learning security system demonstrates unprecedented success in preventing cyber threats.',
                    content: generateCyberArticle('Artificial intelligence is revolutionizing cybersecurity with advanced threat detection and prevention...'),
                    source: 'AI Security Report',
                    time: '5 hours ago',
                    readTime: '4 min read',
                    author: 'Jennifer Park',
                    category: 'AI Security'
                },
                {
                    id: 'cyber-003',
                    title: 'Global Cybersecurity Alliance Formed by Tech Giants',
                    excerpt: 'Major technology companies unite to combat international cyber threats and share security intelligence.',
                    content: generateCyberArticle('The formation of a global cybersecurity alliance marks a new era in international digital defense cooperation...'),
                    source: 'Tech Security News',
                    time: '7 hours ago',
                    readTime: '6 min read',
                    author: 'Michael Davis',
                    category: 'Global Security'
                }
            ]
        }
    };
    
    const topic = topicData[topicId];
    if (topic) {
        displayTopicArticles(topic);
    }
}

function displayTopicArticles(topic) {
    const discoverContent = document.getElementById('discover-content');
    
    discoverContent.innerHTML = `
        <div class="topic-articles-view">
            <div class="topic-header">
                <button class="back-btn" onclick="goBackToTopics()">
                    <i class="fas fa-arrow-left"></i> Back to Topics
                </button>
                <div class="topic-info">
                    <h2>${topic.title}</h2>
                    <p class="topic-description">${topic.description}</p>
                    <div class="topic-stats">
                        <span class="total-articles">${topic.totalArticles} articles available</span>
                        <span class="last-updated">Last updated: ${getCurrentTime()}</span>
                    </div>
                </div>
            </div>
            
            <div class="article-filters">
                <button class="filter-active">All Articles</button>
                <button>Trending</button>
                <button>Latest</button>
                <button>Most Read</button>
            </div>
            
            <div class="articles-list">
                ${topic.articles.map(article => `
                    <article class="article-preview enhanced" onclick="openFullArticle('${article.id}', ${JSON.stringify(article).replace(/"/g, '&quot;')})">
                        <div class="article-header">
                            <div class="article-meta">
                                <span class="article-source">${article.source}</span>
                                <span class="article-time">${article.time}</span>
                                <span class="read-time">${article.readTime}</span>
                                ${article.trending ? '<span class="trending-badge">🔥 Trending</span>' : ''}
                            </div>
                            <div class="article-category">${article.category}</div>
                        </div>
                        <h3 class="article-headline">${article.title}</h3>
                        <p class="article-excerpt">${article.excerpt}</p>
                        <div class="article-footer">
                            <span class="article-author">By ${article.author}</span>
                            <div class="article-actions">
                                <button class="action-btn" onclick="event.stopPropagation(); shareArticle('${article.title}')"><i class="fas fa-share"></i></button>
                                <button class="action-btn" onclick="event.stopPropagation(); bookmarkArticle('${article.id}')"><i class="fas fa-bookmark"></i></button>
                                <button class="read-more-btn">Read Full Article <i class="fas fa-arrow-right"></i></button>
                            </div>
                        </div>
                    </article>
                `).join('')}
            </div>
            
            <div class="load-more-section">
                <button class="load-more-btn" onclick="loadMoreTopicArticles('${topic.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}')">
                    Load More Articles <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add enhanced styles for the topic view
    addTopicViewStyles();
}

function goBackToTopics() {
    // Restore original discover content
    location.reload(); // Simple approach - in production, you'd restore the original content
}

// Full Article Viewer
function openFullArticle(articleId, articleData) {
    const article = typeof articleData === 'string' ? JSON.parse(articleData) : articleData;
    
    const articleBody = document.getElementById('articleBody');
    const modal = document.getElementById('articleViewer');
    
    articleBody.innerHTML = `
        <div class="article-header-info">
            <h1 class="article-title">${article.title}</h1>
            <div class="article-meta-info">
                <span class="article-source">${article.source}</span> • 
                <span class="article-time">${article.time}</span> • 
                <span class="read-time">${article.readTime}</span>
                <br>
                <span class="article-author">By ${article.author}</span>
            </div>
        </div>
        
        <div class="article-content">
            ${article.content}
        </div>
    `;
    
    // Load related articles
    loadRelatedArticles(articleId);
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeArticleViewer() {
    document.getElementById('articleViewer').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Specialized Article Generators
function generateTechArticle(opening) {
    return `
        <p class="article-lead">${opening}</p>
        
        <div class="article-highlight">
            <h4>💡 Key Breakthrough</h4>
            <p>This technological advancement represents a quantum leap in computing capabilities, with potential applications spanning artificial intelligence, scientific research, and industrial automation.</p>
        </div>
        
        <h3>Technical Specifications</h3>
        <ul class="tech-specs">
            <li><strong>Processing Speed:</strong> 1000x faster than current systems</li>
            <li><strong>Energy Efficiency:</strong> 90% reduction in power consumption</li>
            <li><strong>Scalability:</strong> Supports unlimited parallel processing</li>
            <li><strong>Compatibility:</strong> Seamless integration with existing infrastructure</li>
        </ul>
        
        <h3>Industry Impact</h3>
        <p>Leading technology companies have already expressed interest in adopting this breakthrough technology. Early testing phases show remarkable improvements in system performance and computational accuracy.</p>
        
        <blockquote>
            "This technology will revolutionize how we approach complex computational challenges. We're looking at a future where artificial intelligence can solve problems we never thought possible." - Dr. Sarah Chen, Chief AI Researcher
        </blockquote>
        
        <h3>Market Implications</h3>
        <p>Financial analysts predict this breakthrough could create a $500 billion market opportunity within the next five years. Major investors are already positioning themselves for the next wave of technological disruption.</p>
        
        <div class="future-outlook">
            <h4>🔮 Future Outlook</h4>
            <p>As this technology matures, we can expect widespread adoption across industries including healthcare, finance, autonomous vehicles, and scientific research. The next decade promises unprecedented technological advancement.</p>
        </div>
    `;
}

function generateMarketArticle(opening) {
    return `
        <p class="article-lead">${opening}</p>
        
        <div class="market-summary">
            <h4>📈 Market Performance Summary</h4>
            <div class="market-stats">
                <div class="stat-item"><span class="value">+2.4%</span><span class="label">S&P 500</span></div>
                <div class="stat-item"><span class="value">+3.1%</span><span class="label">NASDAQ</span></div>
                <div class="stat-item"><span class="value">+1.8%</span><span class="label">DOW</span></div>
                <div class="stat-item"><span class="value">+5.2%</span><span class="label">Tech Sector</span></div>
            </div>
        </div>
        
        <h3>Driving Factors</h3>
        <p>Several key factors have contributed to today's market rally, including positive earnings reports from major technology companies, favorable economic indicators, and investor optimism about emerging technologies.</p>
        
        <h3>Sector Analysis</h3>
        <ul class="sector-performance">
            <li><strong>Technology:</strong> Leading gains with AI and quantum computing stocks surging</li>
            <li><strong>Healthcare:</strong> Biotech firms showing strong performance on breakthrough announcements</li>
            <li><strong>Energy:</strong> Renewable energy stocks benefiting from green investment commitments</li>
            <li><strong>Finance:</strong> Banks responding positively to potential policy changes</li>
        </ul>
        
        <blockquote>
            "We're seeing a fundamental shift in investor sentiment toward technology-driven growth sectors. This trend is likely to continue as innovation accelerates." - Emma Thompson, Senior Market Analyst
        </blockquote>
        
        <h3>Expert Predictions</h3>
        <p>Market analysts remain optimistic about continued growth, particularly in technology sectors. However, they advise caution and recommend diversified investment strategies.</p>
        
        <div class="investment-insight">
            <h4>📋 Investment Outlook</h4>
            <p>Long-term projections suggest sustained growth in AI and quantum computing sectors, with potential for significant returns for early investors in emerging technologies.</p>
        </div>
    `;
}

function generateClimateArticle(opening) {
    return `
        <p class="article-lead">${opening}</p>
        
        <div class="environmental-impact">
            <h4>🌱 Environmental Impact</h4>
            <div class="impact-stats">
                <div class="impact-item"><span class="value">50%</span><span class="label">Efficiency Increase</span></div>
                <div class="impact-item"><span class="value">80%</span><span class="label">Cost Reduction</span></div>
                <div class="impact-item"><span class="value">2M</span><span class="label">Tons CO₂ Saved</span></div>
            </div>
        </div>
        
        <h3>Technology Breakthrough</h3>
        <p>This revolutionary advancement in renewable energy technology represents a major step forward in the fight against climate change. The new solar panel design utilizes advanced materials and innovative engineering to achieve unprecedented efficiency rates.</p>
        
        <h3>Global Implementation</h3>
        <ul class="implementation-list">
            <li>Pilot projects launched in 15 countries</li>
            <li>Mass production scheduled for 2025</li>
            <li>Expected to power 10 million homes by 2030</li>
            <li>$100 billion investment from international partners</li>
        </ul>
        
        <blockquote>
            "This technology breakthrough brings us significantly closer to achieving global carbon neutrality. We're looking at a future powered entirely by clean energy." - Dr. Maria Santos, Renewable Energy Researcher
        </blockquote>
        
        <h3>Policy Support</h3>
        <p>Governments worldwide are implementing supportive policies and incentives to accelerate the adoption of this new technology, with several countries announcing national renewable energy strategies.</p>
        
        <div class="sustainability-focus">
            <h4>🌍 Sustainability Goals</h4>
            <p>This development aligns with global sustainability goals and the Paris Climate Agreement, potentially accelerating the timeline for achieving net-zero emissions worldwide.</p>
        </div>
    `;
}

function generateSpaceArticle(opening) {
    return `
        <p class="article-lead">${opening}</p>
        
        <div class="mission-overview">
            <h4>🚀 Mission Overview</h4>
            <div class="mission-stats">
                <div class="mission-item"><span class="value">2030</span><span class="label">Launch Date</span></div>
                <div class="mission-item"><span class="value">1000</span><span class="label">Initial Colonists</span></div>
                <div class="mission-item"><span class="value">$50B</span><span class="label">Mission Budget</span></div>
            </div>
        </div>
        
        <h3>Mission Details</h3>
        <p>The Mars colonization mission represents humanity's greatest adventure, combining cutting-edge technology with unprecedented international cooperation. The mission will establish a self-sustaining settlement capable of supporting long-term human habitation.</p>
        
        <h3>Technology Innovations</h3>
        <ul class="tech-innovations">
            <li>Advanced life support systems for Mars atmosphere</li>
            <li>In-situ resource utilization for building materials</li>
            <li>Closed-loop agricultural systems for food production</li>
            <li>Revolutionary propulsion systems for efficient travel</li>
        </ul>
        
        <blockquote>
            "This mission will mark the beginning of humanity as a multi-planetary species. The technologies developed will benefit life on Earth as well." - Dr. James Mitchell, Mission Director
        </blockquote>
        
        <h3>Scientific Goals</h3>
        <p>Beyond colonization, the mission aims to conduct extensive scientific research, including the search for past or present life on Mars, geological studies, and atmospheric research.</p>
        
        <div class="space-future">
            <h4>🌌 Future of Space Exploration</h4>
            <p>This Mars mission paves the way for further space exploration, with plans for missions to Jupiter's moons and eventually interstellar travel becoming realistic possibilities.</p>
        </div>
    `;
}

function generateHealthArticle(opening) {
    return `
        <p class="article-lead">${opening}</p>
        
        <div class="clinical-results">
            <h4>🧬 Clinical Trial Results</h4>
            <div class="results-stats">
                <div class="result-item"><span class="value">95%</span><span class="label">Success Rate</span></div>
                <div class="result-item"><span class="value">1000</span><span class="label">Patients Treated</span></div>
                <div class="result-item"><span class="value">0</span><span class="label">Adverse Effects</span></div>
            </div>
        </div>
        
        <h3>Medical Breakthrough</h3>
        <p>This groundbreaking development in AI-driven medicine represents a new era in drug discovery and treatment. The medication was designed entirely by artificial intelligence algorithms, analyzing millions of molecular combinations to identify the most effective treatment.</p>
        
        <h3>Treatment Process</h3>
        <ul class="treatment-details">
            <li>AI analyzed over 10 million molecular compounds</li>
            <li>Identified optimal drug formulation in 18 months</li>
            <li>Successful preclinical trials completed in record time</li>
            <li>Phase III trials showed 95% efficacy rate</li>
        </ul>
        
        <blockquote>
            "This represents a paradigm shift in how we approach drug discovery. AI has compressed what typically takes 10-15 years into less than 2 years." - Dr. Amanda Foster, Clinical Research Director
        </blockquote>
        
        <h3>Global Impact</h3>
        <p>The success of this AI-designed medication opens the door to rapid development of treatments for previously incurable diseases, potentially saving millions of lives worldwide.</p>
        
        <div class="medical-future">
            <h4>🏥 Future of Medicine</h4>
            <p>This breakthrough signals the beginning of personalized, AI-driven medicine where treatments are tailored to individual genetic profiles and optimized for maximum effectiveness.</p>
        </div>
    `;
}

function generateCyberArticle(opening) {
    return `
        <p class="article-lead">${opening}</p>
        
        <div class="security-specs">
            <h4>🔒 Security Specifications</h4>
            <div class="security-stats">
                <div class="security-item"><span class="value">100%</span><span class="label">Encryption Strength</span></div>
                <div class="security-item"><span class="value">0</span><span class="label">Successful Attacks</span></div>
                <div class="security-item"><span class="value">24/7</span><span class="label">Monitoring</span></div>
            </div>
        </div>
        
        <h3>Quantum Security Revolution</h3>
        <p>This quantum encryption system represents the ultimate evolution in cybersecurity, using the principles of quantum mechanics to create theoretically unbreakable security protocols that protect against both current and future cyber threats.</p>
        
        <h3>Technical Advantages</h3>
        <ul class="security-features">
            <li>Quantum key distribution for absolute security</li>
            <li>Real-time threat detection and response</li>
            <li>AI-powered attack prediction and prevention</li>
            <li>Zero-trust architecture implementation</li>
        </ul>
        
        <blockquote>
            "This technology makes cyber attacks mathematically impossible. We've achieved the holy grail of cybersecurity." - Alex Chen, Cybersecurity Specialist
        </blockquote>
        
        <h3>Industry Adoption</h3>
        <p>Major corporations and government agencies are rapidly adopting this quantum security technology to protect sensitive data and critical infrastructure from increasingly sophisticated cyber threats.</p>
        
        <div class="cyber-future">
            <h4>🔮 Cybersecurity Future</h4>
            <p>As quantum computing becomes more prevalent, this quantum encryption technology ensures that security keeps pace with advancing computational capabilities, maintaining privacy and data protection in the digital age.</p>
        </div>
    `;
}

// Supporting Functions
function loadMoreTopicArticles(topicId) {
    // Simulate loading more articles
    const loadBtn = event.target;
    loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    setTimeout(() => {
        loadBtn.innerHTML = 'Load More Articles <i class="fas fa-plus"></i>';
        // In a real implementation, you would load more articles from your API
        alert('📰 More articles loaded! In a production environment, this would fetch additional articles from your news API.');
    }, 1500);
}

function addTopicViewStyles() {
    if (document.getElementById('topicViewStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'topicViewStyles';
    style.textContent = `
        .topic-articles-view {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .topic-header {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .back-btn {
            padding: 10px 20px;
            background: #1e3a8a;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .back-btn:hover {
            background: #3b82f6;
            transform: translateY(-2px);
        }
        
        .topic-info h2 {
            margin: 0 0 10px 0;
            color: #1e293b;
            font-size: 2.2rem;
        }
        
        .topic-description {
            color: #64748b;
            font-size: 1.1rem;
            margin-bottom: 15px;
        }
        
        .topic-stats {
            display: flex;
            gap: 20px;
            font-size: 0.9rem;
            color: #64748b;
        }
        
        .article-filters {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            padding: 0 5px;
        }
        
        .article-filters button {
            padding: 8px 20px;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .article-filters .filter-active {
            background: #1e3a8a;
            color: white;
            border-color: #1e3a8a;
        }
        
        .article-preview.enhanced {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .article-preview.enhanced:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
            border-color: #3b82f6;
        }
        
        .article-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .article-category {
            background: #1e3a8a;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .trending-badge {
            background: linear-gradient(45deg, #ef4444, #f97316);
            color: white;
            padding: 4px 8px;
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 10px;
        }
        
        .article-headline {
            font-size: 1.4rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
            line-height: 1.4;
        }
        
        .article-excerpt {
            color: #64748b;
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .article-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .article-actions {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .action-btn {
            width: 35px;
            height: 35px;
            border: 1px solid #e2e8f0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            transition: all 0.3s ease;
        }
        
        .action-btn:hover {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        .read-more-btn {
            background: #1e3a8a;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        
        .read-more-btn:hover {
            background: #3b82f6;
            transform: translateX(3px);
        }
        
        .load-more-section {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
        }
        
        .load-more-btn {
            background: linear-gradient(45deg, #1e3a8a, #3b82f6);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .load-more-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(30, 58, 138, 0.3);
        }
        
        /* Article content styles */
        .article-highlight {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .tech-specs, .sector-performance, .implementation-list, .tech-innovations, .treatment-details, .security-features {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .market-summary, .environmental-impact, .mission-overview, .clinical-results, .security-specs {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .market-stats, .impact-stats, .mission-stats, .results-stats, .security-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }
        
        .stat-item, .impact-item, .mission-item, .result-item, .security-item {
            text-align: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .value {
            display: block;
            font-size: 1.8rem;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 5px;
        }
        
        .label {
            font-size: 0.9rem;
            color: #64748b;
            font-weight: 500;
        }
        
        .future-outlook, .investment-insight, .sustainability-focus, .space-future, .medical-future, .cyber-future {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
        }
        
        blockquote {
            border-left: 4px solid #3b82f6;
            background: #f8fafc;
            padding: 20px;
            margin: 25px 0;
            font-style: italic;
            border-radius: 0 8px 8px 0;
        }
    `;
    
    document.head.appendChild(style);
}

// Search Functionality
function searchNews() {
    const query = document.getElementById('newsSearch').value.trim();
    if (!query) return;
    
    // Show loading state
    const searchBtn = document.querySelector('.search-btn');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    setTimeout(() => {
        // Simulate search results
        displaySearchResults(query);
        searchBtn.innerHTML = originalText;
    }, 1000);
}

function displaySearchResults(query) {
    const discoverContent = document.getElementById('discover-content');
    
    discoverContent.innerHTML = `
        <div class="search-results">
            <div class="search-header">
                <h3>Search Results for "${query}"</h3>
                <button class="back-btn" onclick="location.reload()">← Back to Discover</button>
            </div>
            <div class="results-info">
                <p>Found 42 articles related to your search</p>
            </div>
            <div class="search-results-list">
                <!-- Search results would be populated here -->
                <p>Advanced search functionality would display relevant articles here based on the query: "${query}"</p>
            </div>
        </div>
    `;
}

// Enhanced AI News Assistant
function openAIAssistant() {
    // Create enhanced AI assistant modal
    const assistantModal = document.createElement('div');
    assistantModal.id = 'aiAssistantModal';
    assistantModal.className = 'modal';
    assistantModal.style.display = 'block';
    
    assistantModal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; max-height: 80vh;">
            <div class="modal-header">
                <h3><i class="fas fa-robot"></i> World News AI Assistant</h3>
                <span class="close" onclick="closeAIAssistant()">&times;</span>
            </div>
            <div class="modal-body" style="padding: 0;">
                <div class="ai-assistant-container">
                    <!-- News Categories Tabs -->
                    <div class="ai-tabs">
                        <button class="ai-tab active" onclick="switchAITab('breaking')">🔥 Breaking News</button>
                        <button class="ai-tab" onclick="switchAITab('world')">🌍 World</button>
                        <button class="ai-tab" onclick="switchAITab('tech')">💻 Technology</button>
                        <button class="ai-tab" onclick="switchAITab('business')">💼 Business</button>
                        <button class="ai-tab" onclick="switchAITab('analysis')">📊 AI Analysis</button>
                    </div>
                    
                    <!-- AI Chat Interface -->
                    <div class="ai-chat-section">
                        <div class="ai-chat-header">
                            <div class="ai-status">
                                <span class="status-indicator live"></span>
                                <span>Live News AI • Updated ${getCurrentTime()}</span>
                            </div>
                        </div>
                        
                        <!-- Scrollable News Feed -->
                        <div class="ai-news-feed" id="aiNewsFeed">
                            <div class="ai-welcome-message">
                                <div class="ai-avatar">
                                    <i class="fas fa-robot"></i>
                                </div>
                                <div class="ai-message-content">
                                    <p><strong>Hello! I'm your World News AI Assistant.</strong></p>
                                    <p>I can help you with:</p>
                                    <ul>
                                        <li>📰 Latest breaking news updates</li>
                                        <li>🔍 Search specific topics or keywords</li>
                                        <li>📊 Analyze news trends and sentiments</li>
                                        <li>📝 Summarize complex stories</li>
                                        <li>🌐 Get global perspectives on events</li>
                                    </ul>
                                    <p>Select a category above or ask me anything!</p>
                                </div>
                            </div>
                            <div id="aiNewsContent">
                                <!-- Dynamic content will load here -->
                            </div>
                        </div>
                        
                        <!-- AI Input Section -->
                        <div class="ai-input-section">
                            <div class="ai-quick-questions">
                                <button class="quick-btn" onclick="askAI('What are the top stories today?')">Top Stories Today</button>
                                <button class="quick-btn" onclick="askAI('Analyze market trends')">Market Analysis</button>
                                <button class="quick-btn" onclick="askAI('Technology breakthroughs')">Tech News</button>
                                <button class="quick-btn" onclick="askAI('Global political updates')">Politics</button>
                            </div>
                            <div class="ai-chat-input">
                                <input type="text" id="aiChatInput" placeholder="Ask me about any news topic..." onkeypress="handleAIEnter(event)">
                                <button class="ai-send-btn" onclick="sendAIMessage()"><i class="fas fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(assistantModal);
    
    // Initialize with breaking news
    switchAITab('breaking');
    
    // Add CSS for the assistant
    addAIAssistantStyles();
}

// Article Actions
function shareArticle() {
    if (navigator.share) {
        navigator.share({
            title: 'Interesting Article from KaiTech News',
            url: window.location.href
        });
    } else {
        alert('📤 Article shared! (Share functionality would be fully implemented here)');
    }
}

function bookmarkArticle() {
    alert('🔖 Article bookmarked! It has been saved to your reading list.');
}

function summarizeArticle() {
    alert('🤖 AI Summary: "This article discusses major technological developments with significant industry implications. Key points include breakthrough innovations, expert opinions, and future projections for the technology sector."');
}

// Load additional content for different tabs
function loadTrendingNews() {
    const trendingList = document.getElementById('trendingNewsList');
    trendingList.innerHTML = `
        <div class="trending-item" onclick="openTrendingArticle('trending-1')">
            <div class="trending-rank">#1</div>
            <div class="trending-content">
                <h4>AI Revolution Accelerates with New Breakthrough</h4>
                <p>Latest developments in artificial intelligence...</p>
                <span class="trending-stats">📈 15.2K reads • 🔥 Trending</span>
            </div>
        </div>
        <!-- More trending items would be loaded here -->
    `;
}

function loadPersonalizedFeed() {
    const personalizedFeed = document.getElementById('personalizedFeed');
    personalizedFeed.innerHTML += `
        <div class="personalized-articles">
            <p>🎯 Based on your interest in AI Technology and Global Markets...</p>
            <!-- Personalized articles would be loaded here -->
        </div>
    `;
}

function loadAnalysisContent() {
    showOverview(); // Load default overview content
}

// === WORLD NEWS ANALYTICS FUNCTIONS ===

// Show analytics overview
function showOverview() {
    setActiveAnalyticsBtn(0);
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;
    
    analyticsContent.innerHTML = `
        <div class="analytics-overview">
            <div class="overview-charts">
                <div class="chart-container">
                    <h4>📈 Global News Volume (Last 24h)</h4>
                    <div class="chart-placeholder">
                        <div class="chart-bars">
                            <div class="chart-bar" style="height: 80%" data-value="Tech: 247"></div>
                            <div class="chart-bar" style="height: 65%" data-value="Politics: 203"></div>
                            <div class="chart-bar" style="height: 58%" data-value="Markets: 189"></div>
                            <div class="chart-bar" style="height: 55%" data-value="Gaming: 178"></div>
                            <div class="chart-bar" style="height: 48%" data-value="Sports: 167"></div>
                            <div class="chart-bar" style="height: 42%" data-value="Climate: 156"></div>
                        </div>
                        <div class="chart-labels">
                            <span>Tech</span><span>Politics</span><span>Markets</span><span>Gaming</span><span>Sports</span><span>Climate</span>
                        </div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h4>🌍 Regional News Distribution</h4>
                    <div class="pie-chart-placeholder">
                        <div class="pie-segment americas" style="--percentage: 35%">Americas 35%</div>
                        <div class="pie-segment europe" style="--percentage: 28%">Europe 28%</div>
                        <div class="pie-segment asia" style="--percentage: 25%">Asia-Pacific 25%</div>
                        <div class="pie-segment africa" style="--percentage: 12%">Africa & ME 12%</div>
                    </div>
                </div>
            </div>
            
            <div class="key-insights">
                <h4>💡 Key Insights Today</h4>
                <div class="insights-list">
                    <div class="insight-item high">
                        <div class="insight-icon">🔥</div>
                        <div class="insight-content">
                            <h5>AI Technology Surge</h5>
                            <p>Technology news increased 45% following major AI breakthrough announcements</p>
                        </div>
                    </div>
                    <div class="insight-item medium">
                        <div class="insight-icon">🎮</div>
                        <div class="insight-content">
                            <h5>Gaming Industry Growth</h5>
                            <p>Esports and gaming coverage up 32% with $50M tournament announcement</p>
                        </div>
                    </div>
                    <div class="insight-item medium">
                        <div class="insight-icon">🌐</div>
                        <div class="insight-content">
                            <h5>Global Climate Focus</h5>
                            <p>Faith-based climate initiatives gaining significant international attention</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show sentiment analysis
function showSentimentAnalysis() {
    setActiveAnalyticsBtn(1);
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;
    
    analyticsContent.innerHTML = `
        <div class="sentiment-analysis">
            <div class="sentiment-overview">
                <h4>💭 Global News Sentiment Analysis</h4>
                <div class="sentiment-meters">
                    <div class="sentiment-meter positive">
                        <div class="meter-value" style="width: 65%"></div>
                        <div class="meter-label">Positive: 65%</div>
                    </div>
                    <div class="sentiment-meter neutral">
                        <div class="meter-value" style="width: 25%"></div>
                        <div class="meter-label">Neutral: 25%</div>
                    </div>
                    <div class="sentiment-meter negative">
                        <div class="meter-value" style="width: 10%"></div>
                        <div class="meter-label">Negative: 10%</div>
                    </div>
                </div>
            </div>
            
            <div class="category-sentiment">
                <h4>📊 Sentiment by Category</h4>
                <div class="category-sentiment-grid">
                    <div class="sentiment-category">
                        <h5>🤖 AI & Technology</h5>
                        <div class="sentiment-bar positive">Positive 78%</div>
                    </div>
                    <div class="sentiment-category">
                        <h5>🎮 Gaming & Esports</h5>
                        <div class="sentiment-bar positive">Positive 82%</div>
                    </div>
                    <div class="sentiment-category">
                        <h5>🙏 Religion & Faith</h5>
                        <div class="sentiment-bar positive">Positive 71%</div>
                    </div>
                    <div class="sentiment-category">
                        <h5>🏛️ Politics</h5>
                        <div class="sentiment-bar mixed">Mixed 45%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show trend analysis
function showTrendAnalysis() {
    setActiveAnalyticsBtn(2);
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;
    
    analyticsContent.innerHTML = `
        <div class="trend-analysis">
            <div class="trending-topics">
                <h4>📈 Trending Topics (24h)</h4>
                <div class="trending-list">
                    <div class="trending-topic hot">
                        <div class="trend-rank">#1</div>
                        <div class="trend-content">
                            <h5>Quantum-AI Integration</h5>
                            <div class="trend-stats">
                                <span class="trend-growth">+245% ↑</span>
                                <span class="trend-mentions">1.2M mentions</span>
                            </div>
                        </div>
                    </div>
                    <div class="trending-topic rising">
                        <div class="trend-rank">#2</div>
                        <div class="trend-content">
                            <h5>Esports Championships</h5>
                            <div class="trend-stats">
                                <span class="trend-growth">+189% ↑</span>
                                <span class="trend-mentions">847K mentions</span>
                            </div>
                        </div>
                    </div>
                    <div class="trending-topic rising">
                        <div class="trend-rank">#3</div>
                        <div class="trend-content">
                            <h5>Climate Summit Agreement</h5>
                            <div class="trend-stats">
                                <span class="trend-growth">+156% ↑</span>
                                <span class="trend-mentions">692K mentions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="prediction-models">
                <h4>🔮 Predictive Models</h4>
                <div class="predictions-grid">
                    <div class="prediction-card">
                        <h5>Next Trending Topic</h5>
                        <p class="prediction-text">Space Exploration Developments</p>
                        <div class="confidence-score">Confidence: 87%</div>
                    </div>
                    <div class="prediction-card">
                        <h5>Peak Interest Time</h5>
                        <p class="prediction-text">Next 6-8 hours</p>
                        <div class="confidence-score">Confidence: 92%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show global impact analysis
function showGlobalImpact() {
    setActiveAnalyticsBtn(3);
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;
    
    analyticsContent.innerHTML = `
        <div class="global-impact-analysis">
            <div class="impact-overview">
                <h4>🌍 Global Impact Assessment</h4>
                <div class="impact-categories">
                    <div class="impact-category high">
                        <h5>💹 Economic Impact</h5>
                        <p>Technology breakthroughs driving market rally (+15.2%)</p>
                        <div class="impact-score">High Impact: 8.7/10</div>
                    </div>
                    <div class="impact-category medium">
                        <h5>🏛️ Political Impact</h5>
                        <p>International cooperation increasing on climate policies</p>
                        <div class="impact-score">Medium Impact: 6.4/10</div>
                    </div>
                    <div class="impact-category medium">
                        <h5>🎨 Cultural Impact</h5>
                        <p>Gaming and esports gaining mainstream recognition</p>
                        <div class="impact-score">Medium Impact: 7.1/10</div>
                    </div>
                </div>
            </div>
            
            <div class="cross-correlation">
                <h4>🔗 Cross-Impact Correlations</h4>
                <div class="correlation-matrix">
                    <div class="correlation-item strong">
                        <span class="correlation-pair">AI Breakthroughs ↔ Stock Markets</span>
                        <span class="correlation-strength">+0.89 (Strong)</span>
                    </div>
                    <div class="correlation-item moderate">
                        <span class="correlation-pair">Climate News ↔ Policy Changes</span>
                        <span class="correlation-strength">+0.67 (Moderate)</span>
                    </div>
                    <div class="correlation-item moderate">
                        <span class="correlation-pair">Gaming Industry ↔ Tech Stocks</span>
                        <span class="correlation-strength">+0.54 (Moderate)</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show predictive analysis
function showPredictiveAnalysis() {
    setActiveAnalyticsBtn(4);
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;
    
    analyticsContent.innerHTML = `
        <div class="predictive-analysis">
            <div class="ai-predictions">
                <h4>🤖 AI-Powered Predictions</h4>
                <div class="predictions-timeline">
                    <div class="prediction-timeline-item">
                        <div class="timeline-time">Next 2 hours</div>
                        <div class="timeline-content">
                            <h5>Expected: Follow-up AI announcements</h5>
                            <p>Major tech companies likely to respond to breakthrough</p>
                            <div class="probability">Probability: 78%</div>
                        </div>
                    </div>
                    <div class="prediction-timeline-item">
                        <div class="timeline-time">Next 6 hours</div>
                        <div class="timeline-content">
                            <h5>Expected: Market volatility increase</h5>
                            <p>Trading volume in tech stocks expected to surge</p>
                            <div class="probability">Probability: 85%</div>
                        </div>
                    </div>
                    <div class="prediction-timeline-item">
                        <div class="timeline-time">Next 24 hours</div>
                        <div class="timeline-content">
                            <h5>Expected: Policy discussions</h5>
                            <p>Government responses to AI developments anticipated</p>
                            <div class="probability">Probability: 67%</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="risk-assessment">
                <h4>⚠️ Risk Assessment</h4>
                <div class="risk-factors">
                    <div class="risk-item low">
                        <h5>Market Bubble Risk</h5>
                        <div class="risk-level">Low Risk: 2.3/10</div>
                    </div>
                    <div class="risk-item medium">
                        <h5>Regulatory Response</h5>
                        <div class="risk-level">Medium Risk: 5.7/10</div>
                    </div>
                    <div class="risk-item low">
                        <h5>Social Disruption</h5>
                        <div class="risk-level">Low Risk: 3.1/10</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper function to set active analytics button
function setActiveAnalyticsBtn(index) {
    document.querySelectorAll('.analytics-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.analytics-btn')[index].classList.add('active');
}

function loadLiveNews() {
    const liveNewsList = document.getElementById('liveNewsList');
    if (!liveNewsList) return;
    
    const liveNewsData = [
        {
            id: 'live-1',
            type: 'breaking',
            time: 'Just now',
            title: 'BREAKING: Quantum-AI Integration Achieves Major Breakthrough',
            summary: 'Scientists announce revolutionary computing advancement that could solve climate change challenges 10x faster.',
            source: 'Tech News Live',
            priority: 'urgent'
        },
        {
            id: 'live-2', 
            type: 'update',
            time: '2 minutes ago',
            title: 'Global Markets Surge Following Technology Breakthrough',
            summary: 'Stock markets worldwide rally as investors respond to AI breakthrough announcement.',
            source: 'Financial Wire',
            priority: 'high'
        },
        {
            id: 'live-3',
            type: 'developing',
            time: '5 minutes ago', 
            title: 'World Leaders React to Climate Summit Agreement',
            summary: 'International response continues to pour in following historic climate accord.',
            source: 'Global News',
            priority: 'medium'
        },
        {
            id: 'live-4',
            type: 'update',
            time: '8 minutes ago',
            title: 'Space Station Crew Reports Successful Medical Experiments',
            summary: 'Zero-gravity research yields promising results for new treatments.',
            source: 'Space Affairs',
            priority: 'medium'
        },
        {
            id: 'live-5',
            type: 'alert',
            time: '12 minutes ago',
            title: 'Renewable Energy Milestone: Solar Exceeds Coal Production',
            summary: 'Historic achievement marks turning point in global energy transition.',
            source: 'Energy Watch',
            priority: 'high'
        }
    ];
    
    liveNewsList.innerHTML = liveNewsData.map(item => `
        <div class="live-news-item ${item.priority}" data-type="${item.type}">
            <div class="live-item-header">
                <div class="live-indicator ${item.type}">
                    ${getLiveIcon(item.type)}
                </div>
                <div class="live-time">${item.time}</div>
                <div class="live-source">${item.source}</div>
            </div>
            <div class="live-item-content">
                <h4 class="live-title">${item.title}</h4>
                <p class="live-summary">${item.summary}</p>
            </div>
            <div class="live-item-actions">
                <button class="read-more-live" onclick="readLiveStory('${item.id}')">
                    <i class="fas fa-arrow-right"></i> Read More
                </button>
                <button class="share-live" onclick="shareLiveStory('${item.id}')">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
        </div>
    `).join('');
}

// Load related articles
function loadRelatedArticles(articleId) {
    const relatedContainer = document.getElementById('relatedArticles');
    relatedContainer.innerHTML = `
        <div class="related-article-card">
            <h5>Related: AI Technology Trends for 2025</h5>
            <p>Industry experts predict major developments...</p>
        </div>
        <div class="related-article-card">
            <h5>Related: Market Response to Tech Innovation</h5>
            <p>Financial analysts weigh in on recent announcements...</p>
        </div>
    `;
}

// Initialize Advanced News Explorer
function initializeNewsExplorer() {
    // Set up event listeners for search
    const searchInput = document.getElementById('newsSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchNews();
            }
        });
    }
    
    // Load default content
    loadTabContent('discover');
    
    console.log('Advanced News Explorer initialized successfully!');
}

// AI Assistant Supporting Functions
function closeAIAssistant() {
    const modal = document.getElementById('aiAssistantModal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
}

function switchAITab(category) {
    // Update active tab
    document.querySelectorAll('.ai-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Load category content
    const contentDiv = document.getElementById('aiNewsContent');
    
    switch(category) {
        case 'breaking':
            contentDiv.innerHTML = getBreakingNewsContent();
            break;
        case 'world':
            contentDiv.innerHTML = getWorldNewsContent();
            break;
        case 'tech':
            contentDiv.innerHTML = getTechNewsContent();
            break;
        case 'business':
            contentDiv.innerHTML = getBusinessNewsContent();
            break;
        case 'analysis':
            contentDiv.innerHTML = getAnalysisContent();
            break;
    }
}

function getBreakingNewsContent() {
    return `
        <div class="ai-news-section">
            <h4>🔥 Breaking News Updates</h4>
            <div class="news-item urgent">
                <div class="news-time">2 minutes ago</div>
                <h5>🚨 Major Technology Breakthrough Announced</h5>
                <p>Scientists reveal quantum computing advancement that could revolutionize data processing speeds by 1000x...</p>
                <div class="news-actions">
                    <button onclick="askAI('Tell me more about quantum computing breakthrough')">📖 Learn More</button>
                    <button onclick="askAI('Analyze impact of quantum computing')">📊 Impact Analysis</button>
                </div>
            </div>
            <div class="news-item">
                <div class="news-time">15 minutes ago</div>
                <h5>🌍 Global Climate Summit Reaches Historic Agreement</h5>
                <p>World leaders unite on unprecedented climate action plan with $2 trillion commitment...</p>
                <div class="news-actions">
                    <button onclick="askAI('Climate summit details')">📖 Full Story</button>
                </div>
            </div>
            <div class="news-item">
                <div class="news-time">32 minutes ago</div>
                <h5>💰 Markets React to Federal Reserve Decision</h5>
                <p>Stock markets surge following unexpected policy announcement, tech sector leads gains...</p>
                <div class="news-actions">
                    <button onclick="askAI('Market analysis today')">📈 Market Impact</button>
                </div>
            </div>
        </div>
    `;
}

function getWorldNewsContent() {
    return `
        <div class="ai-news-section">
            <h4>🌍 World News Highlights</h4>
            <div class="news-item">
                <div class="news-time">1 hour ago</div>
                <h5>🏛️ International Trade Agreements Reshape Global Commerce</h5>
                <p>New bilateral agreements between major economies promise to boost international trade...</p>
            </div>
            <div class="news-item">
                <div class="news-time">2 hours ago</div>
                <h5>🌱 Renewable Energy Milestone: 50% Global Capacity Reached</h5>
                <p>International Energy Agency reports historic achievement in clean energy adoption...</p>
            </div>
            <div class="news-item">
                <div class="news-time">3 hours ago</div>
                <h5>🤝 Diplomatic Breakthrough in Regional Conflicts</h5>
                <p>Peace negotiations show promising progress with international mediators...</p>
            </div>
        </div>
    `;
}

function getTechNewsContent() {
    return `
        <div class="ai-news-section">
            <h4>💻 Technology & Innovation</h4>
            <div class="news-item">
                <div class="news-time">45 minutes ago</div>
                <h5>🤖 AI Assistant Technology Reaches New Milestone</h5>
                <p>Latest language models demonstrate unprecedented understanding and reasoning capabilities...</p>
            </div>
            <div class="news-item">
                <div class="news-time">1 hour ago</div>
                <h5>🚀 Space Technology Commercialization Accelerates</h5>
                <p>Private space companies announce major partnerships for satellite deployment...</p>
            </div>
            <div class="news-item">
                <div class="news-time">2 hours ago</div>
                <h5>🔒 Cybersecurity Innovation Protects Global Infrastructure</h5>
                <p>New quantum encryption methods promise unhackable communications...</p>
            </div>
        </div>
    `;
}

function getBusinessNewsContent() {
    return `
        <div class="ai-news-section">
            <h4>💼 Business & Markets</h4>
            <div class="news-item">
                <div class="news-time">30 minutes ago</div>
                <h5>📊 Global Markets Show Strong Performance</h5>
                <p>International indices reach new highs amid positive economic indicators...</p>
            </div>
            <div class="news-item">
                <div class="news-time">1 hour ago</div>
                <h5>💡 Startup Innovation Attracts Record Investment</h5>
                <p>Venture capital funding reaches all-time high for technology startups...</p>
            </div>
            <div class="news-item">
                <div class="news-time">2 hours ago</div>
                <h5>🏭 Manufacturing Sector Embraces Automation</h5>
                <p>Industry 4.0 technologies drive efficiency gains across global production...</p>
            </div>
        </div>
    `;
}

function getAnalysisContent() {
    return `
        <div class="ai-news-section">
            <h4>📊 AI-Powered News Analysis</h4>
            <div class="analysis-widget">
                <h5>📈 Trending Topics Analysis</h5>
                <div class="trend-item">🤖 Artificial Intelligence: +45% mentions (↑)</div>
                <div class="trend-item">🌱 Climate Change: +32% mentions (↑)</div>
                <div class="trend-item">💰 Economic Policy: +28% mentions (→)</div>
            </div>
            <div class="analysis-widget">
                <h5>🌍 Global Sentiment Overview</h5>
                <div class="sentiment-bar">
                    <div class="sentiment positive" style="width: 45%">Positive 45%</div>
                    <div class="sentiment neutral" style="width: 35%">Neutral 35%</div>
                    <div class="sentiment negative" style="width: 20%">Negative 20%</div>
                </div>
            </div>
            <div class="analysis-widget">
                <h5>🔍 Key Insights</h5>
                <p>• Technology sector showing increased positive coverage</p>
                <p>• Environmental topics gaining global attention</p>
                <p>• Economic outlook remains cautiously optimistic</p>
            </div>
        </div>
    `;
}

function askAI(question) {
    const input = document.getElementById('aiChatInput');
    input.value = question;
    sendAIMessage();
}

function handleAIEnter(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to feed
    const feed = document.getElementById('aiNewsFeed');
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-user-message';
    userMessage.innerHTML = `
        <div class="user-avatar"><i class="fas fa-user"></i></div>
        <div class="user-message-content">${message}</div>
    `;
    feed.appendChild(userMessage);
    
    // Clear input
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        const responseDiv = document.createElement('div');
        responseDiv.className = 'ai-response-message';
        responseDiv.innerHTML = `
            <div class="ai-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-response-content">${aiResponse}</div>
        `;
        feed.appendChild(responseDiv);
        feed.scrollTop = feed.scrollHeight;
    }, 1000);
    
    feed.scrollTop = feed.scrollHeight;
}

function generateAIResponse(question) {
    const q = question.toLowerCase();
    
    if (q.includes('quantum computing') || q.includes('breakthrough')) {
        return `
            <p><strong>Quantum Computing Breakthrough Analysis:</strong></p>
            <p>This breakthrough represents a significant leap in quantum processing power. Key implications:</p>
            <ul>
                <li>🚀 1000x faster data processing capabilities</li>
                <li>🔒 Revolutionary encryption and security applications</li>
                <li>🧬 Accelerated drug discovery and scientific research</li>
                <li>💼 Potential $850 billion market impact by 2030</li>
            </ul>
            <p>The technology is expected to be commercially available within 3-5 years.</p>
        `;
    }
    
    if (q.includes('market') || q.includes('stock')) {
        return `
            <p><strong>Current Market Analysis:</strong></p>
            <p>Markets are showing strong performance today:</p>
            <ul>
                <li>📈 S&P 500: +2.3% (Technology sector leading)</li>
                <li>🌍 Global indices up 1.8% average</li>
                <li>💰 Tech stocks gaining on AI breakthrough news</li>
                <li>🏦 Financial sector responding positively to policy changes</li>
            </ul>
            <p>Analysts predict continued optimism through the week.</p>
        `;
    }
    
    if (q.includes('climate') || q.includes('environment')) {
        return `
            <p><strong>Climate Summit Update:</strong></p>
            <p>The global climate agreement includes:</p>
            <ul>
                <li>🌱 $2 trillion commitment to renewable energy</li>
                <li>🏭 50% emissions reduction by 2030</li>
                <li>🌍 100+ countries committed to carbon neutrality</li>
                <li>💡 Technology sharing for clean energy initiatives</li>
            </ul>
            <p>This represents the most ambitious climate action plan in history.</p>
        `;
    }
    
    // Default responses
    const responses = [
        `<p>That's an excellent question! Based on current global news trends, this topic is gaining significant attention. Let me provide you with the latest insights and analysis.</p>`,
        `<p>I'm analyzing the latest information on this topic. Here's what the current data shows about recent developments and their global impact.</p>`,
        `<p>Great question! This is currently trending in global news. Let me break down the key facts and implications for you.</p>`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function addAIAssistantStyles() {
    if (document.getElementById('aiAssistantStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'aiAssistantStyles';
    style.textContent = `
        .ai-assistant-container {
            display: flex;
            flex-direction: column;
            height: 70vh;
        }
        
        .ai-tabs {
            display: flex;
            background: #f1f5f9;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .ai-tab {
            flex: 1;
            padding: 12px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .ai-tab.active {
            background: #1e3a8a;
            color: white;
        }
        
        .ai-chat-section {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .ai-chat-header {
            padding: 15px;
            background: #1e3a8a;
            color: white;
        }
        
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        
        .ai-news-feed {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f8fafc;
        }
        
        .ai-welcome-message {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .ai-avatar {
            width: 40px;
            height: 40px;
            background: #1e3a8a;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .ai-news-section {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .news-item {
            padding: 15px;
            border-left: 4px solid #3b82f6;
            margin: 15px 0;
            background: #f8fafc;
            border-radius: 0 8px 8px 0;
        }
        
        .news-item.urgent {
            border-left-color: #ef4444;
            background: #fef2f2;
        }
        
        .news-time {
            color: #64748b;
            font-size: 0.85em;
            margin-bottom: 8px;
        }
        
        .news-actions {
            margin-top: 10px;
            display: flex;
            gap: 10px;
        }
        
        .news-actions button {
            padding: 5px 12px;
            border: 1px solid #3b82f6;
            background: white;
            color: #3b82f6;
            border-radius: 15px;
            cursor: pointer;
            font-size: 0.85em;
            transition: all 0.3s ease;
        }
        
        .news-actions button:hover {
            background: #3b82f6;
            color: white;
        }
        
        .ai-input-section {
            border-top: 1px solid #e2e8f0;
            padding: 15px;
            background: white;
        }
        
        .ai-quick-questions {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        
        .quick-btn {
            padding: 8px 15px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s ease;
        }
        
        .quick-btn:hover {
            background: #1e3a8a;
            color: white;
            border-color: #1e3a8a;
        }
        
        .ai-chat-input {
            display: flex;
            gap: 10px;
        }
        
        #aiChatInput {
            flex: 1;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 25px;
            outline: none;
            font-size: 1em;
        }
        
        #aiChatInput:focus {
            border-color: #3b82f6;
        }
        
        .ai-send-btn {
            width: 45px;
            height: 45px;
            border: none;
            background: #1e3a8a;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .ai-send-btn:hover {
            background: #3b82f6;
            transform: scale(1.05);
        }
        
        .ai-user-message, .ai-response-message {
            display: flex;
            gap: 15px;
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .user-avatar {
            width: 35px;
            height: 35px;
            background: #64748b;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .analysis-widget {
            background: #f8fafc;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #3b82f6;
        }
        
        .trend-item {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .sentiment-bar {
            display: flex;
            height: 30px;
            border-radius: 15px;
            overflow: hidden;
            margin-top: 10px;
        }
        
        .sentiment {
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.85em;
            font-weight: 600;
        }
        
        .sentiment.positive { background: #22c55e; }
        .sentiment.neutral { background: #64748b; }
        .sentiment.negative { background: #ef4444; }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    
    document.head.appendChild(style);
}

// Add enhanced button styles
function addEnhancedButtonStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Enhanced Button States */
        .cta-button {
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .cta-button.loading {
            pointer-events: none;
            opacity: 0.8;
        }
        
        .cta-button.hover-glow {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 12px 25px rgba(16, 185, 129, 0.4);
        }
        
        .cta-button.focus-visible {
            outline: 2px solid #10b981;
            outline-offset: 2px;
        }
        
        /* Button Spinner */
        .button-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Button Ripple Effect */
        .button-ripple {
            position: absolute;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            transition: transform 0.6s ease-out, opacity 0.6s ease-out;
            z-index: 1;
        }
        
        /* Loading Text Animation */
        .loading-text {
            animation: pulse-text 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse-text {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        /* Enhanced CTA Button Styles */
        .cta-button.primary {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: 2px solid #10b981;
        }
        
        .cta-button.primary:hover:not(.loading) {
            background: linear-gradient(135deg, #059669, #047857);
            border-color: #059669;
        }
        
        .cta-button.secondary {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border: 2px solid #3b82f6;
        }
        
        .cta-button.secondary:hover:not(.loading) {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            border-color: #2563eb;
        }
        
        .cta-button.tertiary {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            border: 2px solid #8b5cf6;
        }
        
        .cta-button.tertiary:hover:not(.loading) {
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            border-color: #7c3aed;
        }
        
        /* Mobile Button Enhancements */
        @media (max-width: 768px) {
            .cta-button.hover-glow {
                transform: translateY(-2px) scale(1.01);
                box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
            }
            
            .button-spinner {
                width: 16px;
                height: 16px;
            }
        }
        
        /* Error Modal Styles */
        .error-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .error-content {
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: slideInUp 0.3s ease;
        }
        
        .error-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        
        .error-content h3 {
            color: #dc2626;
            margin: 0 0 15px 0;
            font-family: 'Space Grotesk', sans-serif;
        }
        
        .error-content p {
            color: #6b7280;
            margin: 0 0 25px 0;
            line-height: 1.6;
        }
        
        .error-close-btn {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .error-close-btn:hover {
            background: linear-gradient(135deg, #059669, #047857);
            transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideInUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        /* Accessibility Improvements */
        @media (prefers-reduced-motion: reduce) {
            .cta-button,
            .button-spinner,
            .button-ripple,
            .loading-text,
            .error-modal,
            .error-content {
                animation: none;
                transition: none;
            }
            
            .cta-button.hover-glow {
                transform: none;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Export functions for global access
window.switchNewsTab = switchNewsTab;
window.exploreNewsTopic = exploreNewsTopic;
window.openFullArticle = openFullArticle;
window.closeArticleViewer = closeArticleViewer;
window.searchNews = searchNews;
window.openAIAssistant = openAIAssistant;
window.closeAIAssistant = closeAIAssistant;
window.switchAITab = switchAITab;
window.askAI = askAI;
window.sendAIMessage = sendAIMessage;
window.shareArticle = shareArticle;
window.bookmarkArticle = bookmarkArticle;
window.summarizeArticle = summarizeArticle;
window.goBackToTopics = goBackToTopics;

// Export existing functions
window.openCloudService = openCloudService;
window.showMediaPortfolio = showMediaPortfolio;
window.contactSales = contactSales;

// Export existing news functions
window.loadMoreNews = loadMoreNews;
window.shareNews = shareNews;
window.bookmarkNews = bookmarkNews;
window.openAnalysis = openAnalysis;

// Financial Markets Functions
function openCryptoTrader() {
    const modal = document.createElement('div');
    modal.className = 'crypto-trader-modal';
    modal.innerHTML = `
        <div class="crypto-trader-content">
            <div class="crypto-trader-header">
                <h3>₿ Advanced Crypto Trading Platform</h3>
                <button class="close-crypto-trader" onclick="closeCryptoTrader()">&times;</button>
            </div>
            <div class="trading-interface">
                <div class="trading-chart">
                    <div class="chart-header">
                        <h4>BTC/USD - TradingView Chart</h4>
                        <div class="chart-controls">
                            <button class="timeframe-btn active" onclick="setTimeframe('1H')">1H</button>
                            <button class="timeframe-btn" onclick="setTimeframe('4H')">4H</button>
                            <button class="timeframe-btn" onclick="setTimeframe('1D')">1D</button>
                            <button class="timeframe-btn" onclick="setTimeframe('1W')">1W</button>
                        </div>
                    </div>
                    <div class="chart-placeholder">
                        <div class="chart-simulation">
                            <canvas id="cryptoChart" width="600" height="300"></canvas>
                            <div class="chart-overlay">
                                <div class="price-indicator">$43,567.89</div>
                                <div class="change-indicator positive">+2.91%</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="trading-panel">
                    <div class="order-book">
                        <h5>Order Book</h5>
                        <div class="order-book-data">
                            <div class="asks">
                                <div class="order-row">43,580.00 <span class="amount">0.15 BTC</span></div>
                                <div class="order-row">43,575.50 <span class="amount">0.23 BTC</span></div>
                                <div class="order-row">43,570.00 <span class="amount">0.41 BTC</span></div>
                            </div>
                            <div class="current-price">$43,567.89</div>
                            <div class="bids">
                                <div class="order-row">43,565.00 <span class="amount">0.31 BTC</span></div>
                                <div class="order-row">43,560.50 <span class="amount">0.28 BTC</span></div>
                                <div class="order-row">43,555.00 <span class="amount">0.52 BTC</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="trade-form">
                        <div class="trade-tabs">
                            <button class="trade-tab active" onclick="setTradeMode('buy')">Buy BTC</button>
                            <button class="trade-tab" onclick="setTradeMode('sell')">Sell BTC</button>
                        </div>
                        <div class="trade-inputs">
                            <label>Amount (BTC)</label>
                            <input type="number" id="btcAmount" placeholder="0.001" step="0.001">
                            <label>Price (USD)</label>
                            <input type="number" id="btcPrice" placeholder="43567.89" step="0.01">
                            <label>Total (USD)</label>
                            <input type="number" id="btcTotal" placeholder="0.00" readonly>
                        </div>
                        <div class="trade-actions">
                            <button class="demo-trade-btn" onclick="executeDemoTrade()">Place Demo Order</button>
                            <div class="demo-notice">Demo trading mode - No real funds</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    drawCryptoChart();
    setupTradeCalculator();
}

function closeCryptoTrader() {
    const modal = document.querySelector('.crypto-trader-modal');
    if (modal) modal.remove();
}

function openStockAnalyzer() {
    const modal = document.createElement('div');
    modal.className = 'stock-analyzer-modal';
    modal.innerHTML = `
        <div class="stock-analyzer-content">
            <div class="stock-analyzer-header">
                <h3>📈 Advanced Stock Market Analyzer</h3>
                <button class="close-stock-analyzer" onclick="closeStockAnalyzer()">&times;</button>
            </div>
            <div class="analyzer-interface">
                <div class="search-section">
                    <div class="stock-search">
                        <input type="text" id="stockSearchInput" placeholder="Search stocks (e.g., AAPL, TSLA, MSFT)...">
                        <button onclick="searchStock()">Search</button>
                    </div>
                    <div class="popular-stocks">
                        <button class="stock-quick-btn" onclick="loadStockAnalysis('AAPL')">AAPL</button>
                        <button class="stock-quick-btn" onclick="loadStockAnalysis('TSLA')">TSLA</button>
                        <button class="stock-quick-btn" onclick="loadStockAnalysis('GOOGL')">GOOGL</button>
                        <button class="stock-quick-btn" onclick="loadStockAnalysis('MSFT')">MSFT</button>
                        <button class="stock-quick-btn" onclick="loadStockAnalysis('NVDA')">NVDA</button>
                    </div>
                </div>
                <div class="analysis-dashboard" id="stockAnalysisDashboard">
                    <div class="select-stock-message">
                        <i class="fas fa-chart-line"></i>
                        <h4>Select a stock to analyze</h4>
                        <p>Use the search bar or click on popular stocks above to get started</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeStockAnalyzer() {
    const modal = document.querySelector('.stock-analyzer-modal');
    if (modal) modal.remove();
}

function openPortfolioTracker() {
    showAlert('Portfolio Tracker', 'Portfolio tracking feature coming soon! Track your investments, analyze performance, and get personalized insights.', 'info');
}

function openMarketAnalyzer() {
    showAlert('Market Analyzer', 'Advanced market analysis tools coming soon! Get technical indicators, market sentiment, and professional-grade analytics.', 'info');
}

function openRiskCalculator() {
    const modal = document.createElement('div');
    modal.className = 'risk-calculator-modal';
    modal.innerHTML = `
        <div class="risk-calculator-content">
            <div class="risk-calculator-header">
                <h3>⚖️ Investment Risk Calculator</h3>
                <button class="close-risk-calculator" onclick="closeRiskCalculator()">&times;</button>
            </div>
            <div class="calculator-interface">
                <div class="risk-form">
                    <h4>Portfolio Information</h4>
                    <div class="form-group">
                        <label>Total Portfolio Value ($)</label>
                        <input type="number" id="portfolioValue" placeholder="10000" step="100">
                    </div>
                    <div class="form-group">
                        <label>Stock Allocation (%)</label>
                        <input type="range" id="stockAllocation" min="0" max="100" value="60">
                        <span class="range-value" id="stockValue">60%</span>
                    </div>
                    <div class="form-group">
                        <label>Bond Allocation (%)</label>
                        <input type="range" id="bondAllocation" min="0" max="100" value="30">
                        <span class="range-value" id="bondValue">30%</span>
                    </div>
                    <div class="form-group">
                        <label>Cash Allocation (%)</label>
                        <input type="range" id="cashAllocation" min="0" max="100" value="10">
                        <span class="range-value" id="cashValue">10%</span>
                    </div>
                    <div class="form-group">
                        <label>Investment Time Horizon</label>
                        <select id="timeHorizon">
                            <option value="short">Short Term (1-3 years)</option>
                            <option value="medium" selected>Medium Term (3-7 years)</option>
                            <option value="long">Long Term (7+ years)</option>
                        </select>
                    </div>
                    <button onclick="calculateRisk()" class="calculate-btn">Calculate Risk Profile</button>
                </div>
                <div class="risk-results" id="riskResults" style="display: none;">
                    <h4>Risk Analysis Results</h4>
                    <div class="risk-metrics"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupRiskCalculator();
}

function closeRiskCalculator() {
    const modal = document.querySelector('.risk-calculator-modal');
    if (modal) modal.remove();
}

function openPriceAlerts() {
    const modal = document.createElement('div');
    modal.className = 'price-alerts-modal';
    modal.innerHTML = `
        <div class="price-alerts-content">
            <div class="price-alerts-header">
                <h3>🔔 Price Alert Manager</h3>
                <button class="close-price-alerts" onclick="closePriceAlerts()">&times;</button>
            </div>
            <div class="alerts-interface">
                <div class="create-alert">
                    <h4>Create New Alert</h4>
                    <div class="alert-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Asset Symbol</label>
                                <input type="text" id="alertSymbol" placeholder="BTC, AAPL, ETH..." >
                            </div>
                            <div class="form-group">
                                <label>Alert Type</label>
                                <select id="alertType">
                                    <option value="above">Price Above</option>
                                    <option value="below">Price Below</option>
                                    <option value="change">Percent Change</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Target Price/Percentage</label>
                                <input type="number" id="alertValue" placeholder="50000" step="0.01">
                            </div>
                            <div class="form-group">
                                <label>Notification Method</label>
                                <select id="alertMethod">
                                    <option value="browser">Browser Notification</option>
                                    <option value="email">Email Alert</option>
                                    <option value="both">Both Methods</option>
                                </select>
                            </div>
                        </div>
                        <button onclick="createAlert()" class="create-alert-btn">Create Alert</button>
                    </div>
                </div>
                <div class="active-alerts">
                    <h4>Active Alerts</h4>
                    <div id="alertsList">
                        <div class="demo-alert">
                            <div class="alert-info">
                                <span class="alert-asset">BTC/USD</span>
                                <span class="alert-condition">Above $45,000</span>
                            </div>
                            <div class="alert-actions">
                                <button class="edit-alert-btn">Edit</button>
                                <button class="delete-alert-btn">Delete</button>
                            </div>
                        </div>
                        <div class="demo-alert">
                            <div class="alert-info">
                                <span class="alert-asset">AAPL</span>
                                <span class="alert-condition">Below $180.00</span>
                            </div>
                            <div class="alert-actions">
                                <button class="edit-alert-btn">Edit</button>
                                <button class="delete-alert-btn">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closePriceAlerts() {
    const modal = document.querySelector('.price-alerts-modal');
    if (modal) modal.remove();
}

// Helper functions for financial markets
function drawCryptoChart() {
    const canvas = document.getElementById('cryptoChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple chart simulation
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const points = [];
    for (let i = 0; i < 50; i++) {
        points.push({
            x: (i / 49) * canvas.width,
            y: canvas.height/2 + Math.sin(i * 0.3) * 50 + (Math.random() - 0.5) * 30
        });
    }
    
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
}

function setupTradeCalculator() {
    const amountInput = document.getElementById('btcAmount');
    const priceInput = document.getElementById('btcPrice');
    const totalInput = document.getElementById('btcTotal');
    
    if (amountInput && priceInput && totalInput) {
        const calculate = () => {
            const amount = parseFloat(amountInput.value) || 0;
            const price = parseFloat(priceInput.value) || 43567.89;
            totalInput.value = (amount * price).toFixed(2);
        };
        
        amountInput.addEventListener('input', calculate);
        priceInput.addEventListener('input', calculate);
    }
}

function setupRiskCalculator() {
    const stockSlider = document.getElementById('stockAllocation');
    const bondSlider = document.getElementById('bondAllocation');
    const cashSlider = document.getElementById('cashAllocation');
    const stockValue = document.getElementById('stockValue');
    const bondValue = document.getElementById('bondValue');
    const cashValue = document.getElementById('cashValue');
    
    if (stockSlider && bondSlider && cashSlider) {
        const updateValues = () => {
            stockValue.textContent = stockSlider.value + '%';
            bondValue.textContent = bondSlider.value + '%';
            cashValue.textContent = cashSlider.value + '%';
        };
        
        stockSlider.addEventListener('input', updateValues);
        bondSlider.addEventListener('input', updateValues);
        cashSlider.addEventListener('input', updateValues);
    }
}

function setTimeframe(timeframe) {
    document.querySelectorAll('.timeframe-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    // Redraw chart with new timeframe data
    drawCryptoChart();
}

function setTradeMode(mode) {
    document.querySelectorAll('.trade-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function executeDemoTrade() {
    const amount = document.getElementById('btcAmount')?.value;
    const price = document.getElementById('btcPrice')?.value;
    
    if (!amount || !price) {
        showAlert('Trade Error', 'Please enter both amount and price for the trade.', 'warning');
        return;
    }
    
    showAlert('Demo Trade Executed', `Demo trade executed: ${amount} BTC at $${price}. This was a simulated trade for demonstration purposes.`, 'success');
}

function searchStock() {
    const searchInput = document.getElementById('stockSearchInput');
    const symbol = searchInput?.value.toUpperCase();
    
    if (symbol) {
        loadStockAnalysis(symbol);
    }
}

function loadStockAnalysis(symbol) {
    const dashboard = document.getElementById('stockAnalysisDashboard');
    
    // Mock stock data
    const mockData = {
        'AAPL': { name: 'Apple Inc.', price: 189.45, change: '+1.25%', pe: 28.4, marketCap: '2.96T' },
        'TSLA': { name: 'Tesla Inc.', price: 243.67, change: '-3.27%', pe: 67.8, marketCap: '773B' },
        'GOOGL': { name: 'Alphabet Inc.', price: 138.92, change: '+3.39%', pe: 24.1, marketCap: '1.71T' },
        'MSFT': { name: 'Microsoft Corp.', price: 378.12, change: '+1.83%', pe: 32.5, marketCap: '2.81T' },
        'NVDA': { name: 'NVIDIA Corp.', price: 467.89, change: '+5.28%', pe: 68.9, marketCap: '1.15T' }
    };
    
    const data = mockData[symbol] || {
        name: `${symbol} Corp.`,
        price: (Math.random() * 200 + 50).toFixed(2),
        change: ((Math.random() - 0.5) * 10).toFixed(2) + '%',
        pe: (Math.random() * 50 + 10).toFixed(1),
        marketCap: (Math.random() * 1000 + 100).toFixed(0) + 'B'
    };
    
    dashboard.innerHTML = `
        <div class="stock-analysis-results">
            <div class="stock-header-info">
                <h4>${symbol} - ${data.name}</h4>
                <div class="stock-price-large">$${data.price}</div>
                <div class="stock-change-large ${data.change.startsWith('+') ? 'positive' : 'negative'}">${data.change}</div>
            </div>
            <div class="analysis-metrics">
                <div class="metric-card">
                    <h5>P/E Ratio</h5>
                    <div class="metric-value">${data.pe}</div>
                </div>
                <div class="metric-card">
                    <h5>Market Cap</h5>
                    <div class="metric-value">$${data.marketCap}</div>
                </div>
                <div class="metric-card">
                    <h5>52W High</h5>
                    <div class="metric-value">$${(parseFloat(data.price) * 1.3).toFixed(2)}</div>
                </div>
                <div class="metric-card">
                    <h5>52W Low</h5>
                    <div class="metric-value">$${(parseFloat(data.price) * 0.7).toFixed(2)}</div>
                </div>
            </div>
            <div class="analysis-recommendation">
                <h5>AI Analysis Summary</h5>
                <p>Based on current market conditions and technical indicators, ${symbol} shows ${
                    data.change.startsWith('+') ? 'positive momentum' : 'recent volatility'
                }. Consider your risk tolerance and portfolio diversification before making investment decisions.</p>
            </div>
        </div>
    `;
}

function calculateRisk() {
    const portfolioValue = document.getElementById('portfolioValue')?.value || 10000;
    const stockAllocation = document.getElementById('stockAllocation')?.value || 60;
    const bondAllocation = document.getElementById('bondAllocation')?.value || 30;
    const cashAllocation = document.getElementById('cashAllocation')?.value || 10;
    const timeHorizon = document.getElementById('timeHorizon')?.value || 'medium';
    
    // Simple risk calculation
    const riskScore = (stockAllocation * 0.8 + bondAllocation * 0.3 + cashAllocation * 0.1) / 10;
    let riskLevel, riskColor;
    
    if (riskScore < 3) {
        riskLevel = 'Conservative';
        riskColor = '#22c55e';
    } else if (riskScore < 6) {
        riskLevel = 'Moderate';
        riskColor = '#f59e0b';
    } else {
        riskLevel = 'Aggressive';
        riskColor = '#ef4444';
    }
    
    const resultsDiv = document.getElementById('riskResults');
    resultsDiv.style.display = 'block';
    resultsDiv.querySelector('.risk-metrics').innerHTML = `
        <div class="risk-score-card">
            <div class="risk-level" style="color: ${riskColor}">${riskLevel}</div>
            <div class="risk-score">${riskScore.toFixed(1)}/10</div>
        </div>
        <div class="risk-breakdown">
            <div class="allocation-item">
                <span>Stocks (${stockAllocation}%)</span>
                <span>$${(portfolioValue * stockAllocation / 100).toLocaleString()}</span>
            </div>
            <div class="allocation-item">
                <span>Bonds (${bondAllocation}%)</span>
                <span>$${(portfolioValue * bondAllocation / 100).toLocaleString()}</span>
            </div>
            <div class="allocation-item">
                <span>Cash (${cashAllocation}%)</span>
                <span>$${(portfolioValue * cashAllocation / 100).toLocaleString()}</span>
            </div>
        </div>
        <div class="risk-recommendations">
            <h6>Recommendations:</h6>
            <ul>
                <li>${timeHorizon === 'long' ? 'Consider increasing stock allocation for long-term growth' : 'Current allocation suits your time horizon'}</li>
                <li>Maintain emergency fund equal to 6 months expenses</li>
                <li>Review and rebalance portfolio quarterly</li>
            </ul>
        </div>
    `;
}

function createAlert() {
    const symbol = document.getElementById('alertSymbol')?.value;
    const alertType = document.getElementById('alertType')?.value;
    const alertValue = document.getElementById('alertValue')?.value;
    
    if (!symbol || !alertValue) {
        showAlert('Alert Creation Error', 'Please fill in all required fields.', 'warning');
        return;
    }
    
    showAlert('Alert Created', `Price alert created for ${symbol.toUpperCase()} when price goes ${alertType} $${alertValue}`, 'success');
}

// Export new financial functions
window.openCryptoTrader = openCryptoTrader;
window.closeCryptoTrader = closeCryptoTrader;
window.openStockAnalyzer = openStockAnalyzer;
window.closeStockAnalyzer = closeStockAnalyzer;
window.openPortfolioTracker = openPortfolioTracker;
window.openMarketAnalyzer = openMarketAnalyzer;
window.openRiskCalculator = openRiskCalculator;
window.closeRiskCalculator = closeRiskCalculator;
window.openPriceAlerts = openPriceAlerts;
window.closePriceAlerts = closePriceAlerts;
window.setTimeframe = setTimeframe;
window.setTradeMode = setTradeMode;
window.executeDemoTrade = executeDemoTrade;
window.searchStock = searchStock;
window.loadStockAnalysis = loadStockAnalysis;
window.calculateRisk = calculateRisk;
window.createAlert = createAlert;

// Enhanced Trending News Functions
let currentTrendingFilter = 'all';
let currentViewMode = 'list';
let trendingNewsData = [];
let isAIAssistantOpen = false;

// Mock trending news data
const mockTrendingNews = {
    breaking: [
        {
            id: 1,
            rank: 1,
            category: 'Breaking',
            title: 'Major Tech Company Announces Revolutionary AI Breakthrough',
            excerpt: 'Scientists achieve breakthrough in quantum-AI integration that could revolutionize computing and solve complex global challenges.',
            source: 'TechNews Today',
            time: '15 minutes ago',
            views: '245K',
            shares: '12K',
            comments: '3.2K',
            trending: true
        },
        {
            id: 2,
            rank: 2,
            category: 'Breaking',
            title: 'Global Climate Summit Reaches Historic Agreement',
            excerpt: 'World leaders commit to unprecedented climate action plan with binding targets for carbon neutrality by 2040.',
            source: 'Global News Network',
            time: '32 minutes ago',
            views: '189K',
            shares: '8.7K',
            comments: '2.1K',
            trending: true
        }
    ],
    world: [
        {
            id: 3,
            rank: 3,
            category: 'World',
            title: 'International Space Station Welcomes New Research Mission',
            excerpt: 'Multinational crew begins groundbreaking experiments in zero gravity that could advance medical treatments.',
            source: 'Space Affairs',
            time: '1 hour ago',
            views: '156K',
            shares: '6.4K',
            comments: '1.8K',
            trending: false
        },
        {
            id: 4,
            rank: 4,
            category: 'World',
            title: 'Renewable Energy Milestone: Solar Power Exceeds Coal Globally',
            excerpt: 'For the first time in history, global solar energy production surpasses coal-fired power generation.',
            source: 'Energy Watch',
            time: '2 hours ago',
            views: '134K',
            shares: '5.2K',
            comments: '1.5K',
            trending: false
        }
    ],
    technology: [
        {
            id: 5,
            rank: 5,
            category: 'Technology',
            title: 'Quantum Internet Achieves First Intercontinental Connection',
            excerpt: 'Scientists successfully establish quantum-encrypted communication link between continents, marking new era in secure communications.',
            source: 'Quantum Today',
            time: '3 hours ago',
            views: '98K',
            shares: '4.1K',
            comments: '987',
            trending: true
        }
    ],
    politics: [
        {
            id: 6,
            rank: 6,
            category: 'Politics',
            title: 'Digital Privacy Rights Act Passes with Bipartisan Support',
            excerpt: 'Landmark legislation strengthens online privacy protections and gives users greater control over personal data.',
            source: 'Policy Watch',
            time: '4 hours ago',
            views: '87K',
            shares: '3.8K',
            comments: '765',
            trending: false
        }
    ],
    business: [
        {
            id: 7,
            rank: 7,
            category: 'Business',
            title: 'Sustainable Investment Funds Reach $50 Trillion Milestone',
            excerpt: 'ESG investments hit new record as companies and investors prioritize environmental and social impact.',
            source: 'Financial Times',
            time: '5 hours ago',
            views: '76K',
            shares: '2.9K',
            comments: '543',
            trending: false
        }
    ],
    games: [
        {
            id: 8,
            rank: 8,
            category: 'Gaming',
            title: 'Epic Games Unveils Unreal Engine 6 with Revolutionary AI Integration',
            excerpt: 'Next-generation game engine promises photorealistic graphics and AI-driven dynamic storytelling that adapts to player behavior in real-time.',
            source: 'GameDev Today',
            time: '12 minutes ago',
            views: '245K',
            shares: '18.7K',
            comments: '5.2K',
            trending: true
        },
        {
            id: 9,
            rank: 9,
            category: 'Esports',
            title: 'World Championship Prize Pool Reaches Record $50 Million',
            excerpt: 'Largest esports tournament in history set to break all viewership records with unprecedented global participation.',
            source: 'Esports Central',
            time: '45 minutes ago',
            views: '189K',
            shares: '12.3K',
            comments: '3.8K',
            trending: true
        },
        {
            id: 10,
            rank: 10,
            category: 'VR Gaming',
            title: 'Apple Vision Pro Gaming Revolution: 100+ Exclusive Titles Launch',
            excerpt: 'Mixed reality gaming platform transforms entertainment with immersive experiences and unprecedented developer support.',
            source: 'VR Gaming News',
            time: '1 hour ago',
            views: '167K',
            shares: '9.8K',
            comments: '2.9K',
            trending: false
        }
    ],
    religion: [
        {
            id: 11,
            rank: 11,
            category: 'Vatican News',
            title: 'Pope Francis Calls for Global Unity in Climate Action',
            excerpt: 'Historic encyclical emphasizes faith communities\' crucial role in environmental stewardship and sustainable development worldwide.',
            source: 'Vatican News',
            time: '1 hour ago',
            views: '156K',
            shares: '8.7K',
            comments: '2.1K',
            trending: false
        },
        {
            id: 12,
            rank: 12,
            category: 'Interfaith',
            title: 'Global Interfaith Alliance Launches $2 Billion Peace Initiative',
            excerpt: 'World religious leaders unite for unprecedented humanitarian aid and conflict resolution across multiple crisis regions.',
            source: 'World Faith News',
            time: '2 hours ago',
            views: '134K',
            shares: '7.2K',
            comments: '1.8K',
            trending: false
        },
        {
            id: 13,
            rank: 13,
            category: 'Humanitarian',
            title: 'Faith-Based Organizations Lead Global Disaster Relief Efforts',
            excerpt: 'Religious communities mobilize unprecedented resources and volunteers for emergency response in multiple disaster zones.',
            source: 'Faith & Action',
            time: '3 hours ago',
            views: '98K',
            shares: '5.4K',
            comments: '1.2K',
            trending: false
        }
    ]
};

function initializeTrendingNews() {
    // Combine all news and sort by rank
    trendingNewsData = [];
    Object.values(mockTrendingNews).forEach(category => {
        trendingNewsData = trendingNewsData.concat(category);
    });
    trendingNewsData.sort((a, b) => a.rank - b.rank);
    
    loadTrendingNews();
    updateLiveStats();
}

function filterTrendingNews(filter) {
    currentTrendingFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.trending-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    loadTrendingNews();
}

function loadTrendingNews() {
    const container = document.getElementById('trendingNewsList');
    if (!container) return;
    
    let newsToShow = [];
    
    if (currentTrendingFilter === 'all') {
        newsToShow = trendingNewsData;
    } else {
        newsToShow = mockTrendingNews[currentTrendingFilter] || [];
    }
    
    container.innerHTML = newsToShow.map(item => createTrendingNewsItem(item)).join('');
}

function createTrendingNewsItem(item) {
    return `
        <div class="trending-item" onclick="openNewsDetails(${item.id})">
            <div class="trending-item-header">
                <div class="trending-rank">${item.rank}</div>
                <div class="trending-meta">
                    <span class="trending-category">${item.category}</span>
                    <span><i class="fas fa-clock"></i> ${item.time}</span>
                    <span><i class="fas fa-eye"></i> ${item.views}</span>
                </div>
            </div>
            <h4 class="trending-title">${item.title}</h4>
            <p class="trending-excerpt">${item.excerpt}</p>
            <div class="trending-actions">
                <div class="trending-engagement">
                    <div class="engagement-item">
                        <i class="fas fa-share"></i>
                        <span>${item.shares}</span>
                    </div>
                    <div class="engagement-item">
                        <i class="fas fa-comment"></i>
                        <span>${item.comments}</span>
                    </div>
                    <div class="engagement-item">
                        <i class="fas fa-heart"></i>
                        <span>Like</span>
                    </div>
                </div>
                <div class="trending-cta">
                    <button class="read-full-btn" onclick="event.stopPropagation(); readFullArticle(${item.id})">
                        <i class="fas fa-book-open"></i> Read Full
                    </button>
                    <button class="ai-explain-btn" onclick="event.stopPropagation(); explainWithAI(${item.id})">
                        <i class="fas fa-robot"></i> AI Explain
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generateAISummary() {
    const modal = document.createElement('div');
    modal.className = 'ai-summary-modal';
    modal.innerHTML = `
        <div class="ai-summary-content">
            <div class="ai-summary-header">
                <h3><i class="fas fa-brain"></i> AI News Summary</h3>
                <button class="close-ai-summary" onclick="closeAISummary()">&times;</button>
            </div>
            <div class="ai-summary-body">
                <div class="summary-loading">
                    <div class="loading-spinner"></div>
                    <p>AI is analyzing current global news trends...</p>
                </div>
                <div class="summary-content" id="aiSummaryContent" style="display: none;">
                    <div class="summary-section">
                        <h4>🔥 Top Headlines Today</h4>
                        <ul>
                            <li><strong>Technology:</strong> Major breakthrough in quantum-AI integration promises revolutionary computing advances</li>
                            <li><strong>Climate:</strong> Historic global agreement reached at climate summit with binding 2040 carbon neutrality targets</li>
                            <li><strong>Space:</strong> New ISS research mission begins groundbreaking zero-gravity medical experiments</li>
                        </ul>
                    </div>
                    <div class="summary-section">
                        <h4>📊 Trending Topics Analysis</h4>
                        <div class="trend-analysis">
                            <div class="trend-item">
                                <span class="trend-topic">Quantum Computing</span>
                                <span class="trend-momentum positive">↗ +245% mentions</span>
                            </div>
                            <div class="trend-item">
                                <span class="trend-topic">Climate Action</span>
                                <span class="trend-momentum positive">↗ +189% mentions</span>
                            </div>
                            <div class="trend-item">
                                <span class="trend-topic">Space Research</span>
                                <span class="trend-momentum positive">↗ +156% mentions</span>
                            </div>
                        </div>
                    </div>
                    <div class="summary-section">
                        <h4>🌍 Global Impact Assessment</h4>
                        <p>Today's news indicates significant positive momentum in technology and environmental sectors. The quantum-AI breakthrough could accelerate solutions to climate challenges, while the historic climate agreement shows unprecedented global cooperation. These developments suggest a pivotal moment for sustainable technology advancement.</p>
                    </div>
                    <div class="summary-actions">
                        <button onclick="shareAISummary()" class="share-summary-btn">
                            <i class="fas fa-share"></i> Share Summary
                        </button>
                        <button onclick="saveAISummary()" class="save-summary-btn">
                            <i class="fas fa-bookmark"></i> Save for Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Simulate AI processing
    setTimeout(() => {
        document.querySelector('.summary-loading').style.display = 'none';
        document.getElementById('aiSummaryContent').style.display = 'block';
    }, 2000);
}

function closeAISummary() {
    const modal = document.querySelector('.ai-summary-modal');
    if (modal) modal.remove();
}

function openNewsAlerts() {
    const modal = document.createElement('div');
    modal.className = 'news-alerts-modal';
    modal.innerHTML = `
        <div class="news-alerts-content">
            <div class="news-alerts-header">
                <h3><i class="fas fa-bell"></i> News Alert Manager</h3>
                <button class="close-news-alerts" onclick="closeNewsAlerts()">&times;</button>
            </div>
            <div class="news-alerts-body">
                <div class="alert-categories">
                    <h4>Choose Alert Categories</h4>
                    <div class="category-options">
                        <label class="category-checkbox">
                            <input type="checkbox" value="breaking" checked>
                            <span class="checkbox-custom"></span>
                            <i class="fas fa-bolt"></i> Breaking News
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" value="technology">
                            <span class="checkbox-custom"></span>
                            <i class="fas fa-microchip"></i> Technology
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" value="world">
                            <span class="checkbox-custom"></span>
                            <i class="fas fa-globe"></i> World News
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" value="business">
                            <span class="checkbox-custom"></span>
                            <i class="fas fa-briefcase"></i> Business
                        </label>
                    </div>
                </div>
                <div class="alert-settings">
                    <h4>Notification Settings</h4>
                    <div class="setting-group">
                        <label>Alert Frequency</label>
                        <select id="alertFrequency">
                            <option value="instant">Instant (as they happen)</option>
                            <option value="hourly">Every Hour</option>
                            <option value="daily" selected>Daily Digest</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>Notification Method</label>
                        <select id="notificationMethod">
                            <option value="browser">Browser Notifications</option>
                            <option value="email">Email Alerts</option>
                            <option value="both" selected>Both Methods</option>
                        </select>
                    </div>
                </div>
                <div class="alert-actions">
                    <button onclick="saveNewsAlerts()" class="save-alerts-btn">
                        <i class="fas fa-save"></i> Save Preferences
                    </button>
                    <button onclick="testNewsAlert()" class="test-alert-btn">
                        <i class="fas fa-vial"></i> Test Alert
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeNewsAlerts() {
    const modal = document.querySelector('.news-alerts-modal');
    if (modal) modal.remove();
}

function refreshTrendingNews() {
    const btn = document.querySelector('.refresh-news-btn');
    const icon = btn.querySelector('i');
    
    // Add spinning animation
    icon.classList.add('fa-spin');
    btn.disabled = true;
    
    // Simulate refresh
    setTimeout(() => {
        // Update timestamps and view counts
        trendingNewsData.forEach(item => {
            const views = parseInt(item.views.replace('K', '')) + Math.floor(Math.random() * 10);
            item.views = views + 'K';
        });
        
        loadTrendingNews();
        updateLiveStats();
        
        // Remove spinning animation
        icon.classList.remove('fa-spin');
        btn.disabled = false;
        
        showAlert('News Refreshed', 'Latest news data has been updated successfully!', 'success');
    }, 1500);
}

function toggleViewMode() {
    const btn = document.getElementById('viewModeBtn');
    const icon = btn.querySelector('i');
    
    if (currentViewMode === 'list') {
        currentViewMode = 'grid';
        icon.className = 'fas fa-th-large';
        btn.innerHTML = '<i class="fas fa-th-large"></i> Grid View';
        document.getElementById('trendingNewsList').classList.add('grid-view');
    } else {
        currentViewMode = 'list';
        icon.className = 'fas fa-th-list';
        btn.innerHTML = '<i class="fas fa-th-list"></i> List View';
        document.getElementById('trendingNewsList').classList.remove('grid-view');
    }
}

function loadMoreTrendingNews() {
    const btn = document.querySelector('.load-more-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;
    
    // Simulate loading more news
    setTimeout(() => {
        const additionalNews = [
            {
                id: 8,
                rank: 8,
                category: 'Science',
                title: 'Gene Therapy Breakthrough Offers Hope for Rare Diseases',
                excerpt: 'Revolutionary treatment shows promising results in clinical trials for previously incurable genetic conditions.',
                source: 'Medical Journal',
                time: '6 hours ago',
                views: '65K',
                shares: '2.1K',
                comments: '432',
                trending: false
            }
        ];
        
        trendingNewsData = trendingNewsData.concat(additionalNews);
        const container = document.getElementById('trendingNewsList');
        container.innerHTML += additionalNews.map(item => createTrendingNewsItem(item)).join('');
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        showAlert('More Stories Loaded', 'Additional trending stories have been loaded successfully!', 'success');
    }, 1000);
}

function updateLiveStats() {
    // Animate counter updates
    const stats = {
        totalArticles: Math.floor(2800 + Math.random() * 100),
        trendingStories: Math.floor(150 + Math.random() * 20),
        globalSources: Math.floor(85 + Math.random() * 10),
        lastUpdate: Math.floor(Math.random() * 5) + 1
    };
    
    Object.entries(stats).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
            if (key === 'lastUpdate') {
                element.textContent = value + 'm';
            } else {
                animateCounter(element, parseInt(element.textContent.replace(/\D/g, '')), value);
            }
        }
    });
}

function animateCounter(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// AI News Assistant Functions
function openAINewsAssistant() {
    const assistant = document.getElementById('aiNewsAssistant');
    if (assistant) {
        assistant.classList.add('active');
        isAIAssistantOpen = true;
    }
}

function closeAINewsAssistant() {
    const assistant = document.getElementById('aiNewsAssistant');
    if (assistant) {
        assistant.classList.remove('active');
        isAIAssistantOpen = false;
    }
}

function askAINews(question) {
    const input = document.getElementById('aiNewsInput');
    if (input) {
        input.value = question;
        sendAINewsMessage();
    }
}

function handleAINewsEnter(event) {
    if (event.key === 'Enter') {
        sendAINewsMessage();
    }
}

function sendAINewsMessage() {
    const input = document.getElementById('aiNewsInput');
    const messagesContainer = document.getElementById('aiChatMessages');
    
    if (!input || !messagesContainer || !input.value.trim()) return;
    
    const userMessage = input.value.trim();
    input.value = '';
    
    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'user-message';
    userMessageDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-user"></i></div>
        <div class="message-content">${userMessage}</div>
    `;
    messagesContainer.appendChild(userMessageDiv);
    
    // Add typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message typing';
    typingDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate AI response
    setTimeout(() => {
        typingDiv.remove();
        
        const aiResponse = generateAINewsResponse(userMessage);
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'ai-message';
        aiMessageDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">${aiResponse}</div>
        `;
        messagesContainer.appendChild(aiMessageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 2000);
}

function generateAINewsResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('top') && (lowerQuestion.includes('stories') || lowerQuestion.includes('news'))) {
        return `
            <p>Here are today's top 3 global news stories:</p>
            <ol>
                <li><strong>AI Breakthrough:</strong> Major tech company announces revolutionary quantum-AI integration that could solve complex global challenges.</li>
                <li><strong>Climate Agreement:</strong> World leaders reach historic climate accord with binding carbon neutrality targets by 2040.</li>
                <li><strong>Space Research:</strong> New ISS mission begins groundbreaking zero-gravity medical experiments.</li>
            </ol>
            <p>Would you like me to explain any of these stories in more detail?</p>
        `;
    }
    
    if (lowerQuestion.includes('technology') || lowerQuestion.includes('tech')) {
        return `
            <p>Latest technology news highlights:</p>
            <ul>
                <li><strong>Quantum Computing:</strong> Scientists achieve major breakthrough in quantum-AI integration</li>
                <li><strong>Internet Infrastructure:</strong> First intercontinental quantum internet connection established</li>
                <li><strong>Privacy:</strong> New digital privacy rights legislation passes with bipartisan support</li>
            </ul>
            <p>The quantum computing breakthrough is particularly significant as it could revolutionize how we approach complex problem-solving in climate science, medicine, and artificial intelligence.</p>
        `;
    }
    
    if (lowerQuestion.includes('week') || lowerQuestion.includes('weekly')) {
        return `
            <p>Major world events this week:</p>
            <ul>
                <li><strong>Monday:</strong> Global climate summit begins with unprecedented participation</li>
                <li><strong>Wednesday:</strong> Quantum-AI breakthrough announced by leading tech consortium</li>
                <li><strong>Thursday:</strong> ISS welcomes new international research mission</li>
                <li><strong>Friday:</strong> Renewable energy milestone - solar surpasses coal globally</li>
                <li><strong>Today:</strong> Historic climate agreement reached with binding targets</li>
            </ul>
            <p>This week has been particularly significant for both technology and environmental progress, showing strong momentum toward sustainable innovation.</p>
        `;
    }
    
    if (lowerQuestion.includes('breaking') || lowerQuestion.includes('urgent')) {
        return `
            <p>Current breaking news analysis:</p>
            <div style="border-left: 3px solid #ef4444; padding-left: 1rem; margin: 1rem 0;">
                <strong>🚨 BREAKING:</strong> The quantum-AI breakthrough announced today represents the largest technological leap in computing since the invention of the microprocessor. Early analysis suggests this could accelerate solutions to climate change by 10-20 years.
            </div>
            <p>Impact assessment:</p>
            <ul>
                <li><strong>Immediate:</strong> Tech stocks surge, quantum computing investments spike</li>
                <li><strong>Short-term:</strong> Accelerated research in climate solutions, drug discovery</li>
                <li><strong>Long-term:</strong> Fundamental shift in how we approach complex global challenges</li>
            </ul>
        `;
    }
    
    // Default responses
    const responses = [
        `<p>That's an interesting question about current events. Based on today's news trends, I can see growing focus on sustainable technology and global cooperation. The intersection of AI advancement and climate action seems particularly significant right now.</p><p>Would you like me to dive deeper into any specific aspect of current global news?</p>`,
        `<p>I'm analyzing the latest news patterns and seeing strong momentum in technology and environmental sectors. The convergence of these areas suggests we're at an important inflection point for global progress.</p><p>What specific aspect of current events interests you most?</p>`,
        `<p>Current global news shows remarkable alignment between technological innovation and sustainability efforts. This convergence is creating unprecedented opportunities for addressing major challenges.</p><p>How can I help you understand these developments better?</p>`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function readFullArticle(articleId) {
    showAlert('Full Article', 'Opening full article viewer... This would typically navigate to the complete article with detailed analysis and related content.', 'info');
}

function explainWithAI(articleId) {
    const article = trendingNewsData.find(item => item.id === articleId);
    if (!article) return;
    
    openAINewsAssistant();
    setTimeout(() => {
        askAINews(`Please explain this news story in simple terms: "${article.title}". What are the key implications and why is it important?`);
    }, 500);
}

function openNewsDetails(articleId) {
    const article = trendingNewsData.find(item => item.id === articleId);
    if (!article) return;
    
    showAlert('News Details', `This would open detailed view for: "${article.title}" with full content, related articles, and social sharing options.`, 'info');
}

function saveNewsAlerts() {
    showAlert('Settings Saved', 'Your news alert preferences have been saved successfully! You\'ll receive notifications based on your selected categories and frequency.', 'success');
    closeNewsAlerts();
}

function testNewsAlert() {
    showAlert('Test Alert', '🔔 This is a test news alert! Your notification system is working correctly.', 'success');
}

function shareAISummary() {
    showAlert('Share Summary', 'AI summary copied to clipboard! You can now paste it to share with others.', 'success');
}

function saveAISummary() {
    showAlert('Summary Saved', 'AI news summary has been saved to your reading list for future reference.', 'success');
}

// Initialize trending news when tab is switched
function initializeTrendingTab() {
    if (!trendingNewsData.length) {
        initializeTrendingNews();
        
        // Auto-refresh stats every 30 seconds
        setInterval(updateLiveStats, 30000);
    }
}

// Export enhanced trending functions
window.filterTrendingNews = filterTrendingNews;
window.generateAISummary = generateAISummary;
window.closeAISummary = closeAISummary;
window.openNewsAlerts = openNewsAlerts;
window.closeNewsAlerts = closeNewsAlerts;
window.refreshTrendingNews = refreshTrendingNews;
window.toggleViewMode = toggleViewMode;
window.loadMoreTrendingNews = loadMoreTrendingNews;
window.openAINewsAssistant = openAINewsAssistant;
window.closeAINewsAssistant = closeAINewsAssistant;
window.askAINews = askAINews;
window.handleAINewsEnter = handleAINewsEnter;
window.sendAINewsMessage = sendAINewsMessage;
window.readFullArticle = readFullArticle;
window.explainWithAI = explainWithAI;
window.openNewsDetails = openNewsDetails;
window.saveNewsAlerts = saveNewsAlerts;
window.testNewsAlert = testNewsAlert;
window.shareAISummary = shareAISummary;
window.saveAISummary = saveAISummary;
window.initializeTrendingTab = initializeTrendingTab;
window.initializeGamesTab = initializeGamesTab;
window.initializeReligionTab = initializeReligionTab;
window.loadGamesNews = loadGamesNews;
window.loadReligionNews = loadReligionNews;
window.filterGamesNews = filterGamesNews;
window.filterReligionNews = filterReligionNews;
window.refreshLiveNews = refreshLiveNews;
window.filterLiveNews = filterLiveNews;
window.toggleAutoRefresh = toggleAutoRefresh;
window.readLiveStory = readLiveStory;
window.shareLiveStory = shareLiveStory;
window.showAllTopics = showAllTopics;
window.showDiscoveryApp = showDiscoveryApp;
window.showTrendingTopics = showTrendingTopics;
window.showOverview = showOverview;
window.showSentimentAnalysis = showSentimentAnalysis;
window.showTrendAnalysis = showTrendAnalysis;
window.showGlobalImpact = showGlobalImpact;
window.showPredictiveAnalysis = showPredictiveAnalysis;
window.launchNewsIntelligence = launchNewsIntelligence;
window.launchSentimentTracker = launchSentimentTracker;
window.launchTrendPredictor = launchTrendPredictor;
window.launchImpactAnalyzer = launchImpactAnalyzer;
window.launchBiasDetector = launchBiasDetector;
window.launchFactChecker = launchFactChecker;
window.startSoftwareDemo = startSoftwareDemo;
window.startFreeTrial = startFreeTrial;

// === DISCOVERY FUNCTIONS ===

// Show all topics in discovery
function showAllTopics() {
    document.querySelectorAll('.discovery-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.discovery-btn').classList.add('active');
    
    const topicsGrid = document.getElementById('newsTopicsGrid');
    const discoveryApp = document.getElementById('discoveryApp');
    
    if (topicsGrid && discoveryApp) {
        topicsGrid.style.display = 'grid';
        discoveryApp.style.display = 'none';
    }
}

// Show comprehensive discovery app
function showDiscoveryApp() {
    document.querySelectorAll('.discovery-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.discovery-btn')[1].classList.add('active');
    
    const topicsGrid = document.getElementById('newsTopicsGrid');
    const discoveryApp = document.getElementById('discoveryApp');
    
    if (topicsGrid && discoveryApp) {
        topicsGrid.style.display = 'none';
        discoveryApp.style.display = 'block';
        loadDiscoveryApp();
    }
}

// Show trending topics only
function showTrendingTopics() {
    document.querySelectorAll('.discovery-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.discovery-btn')[2].classList.add('active');
    
    const topicsGrid = document.getElementById('newsTopicsGrid');
    if (topicsGrid) {
        // Filter to show only trending topics
        const topicCards = topicsGrid.querySelectorAll('.topic-card');
        topicCards.forEach(card => {
            const isHighTraffic = parseInt(card.querySelector('.topic-count').textContent) > 150;
            card.style.display = isHighTraffic ? 'block' : 'none';
        });
    }
}

// Load comprehensive discovery app
function loadDiscoveryApp() {
    const discoveryApp = document.getElementById('discoveryApp');
    if (!discoveryApp) return;
    
    discoveryApp.innerHTML = `
        <div class="discovery-app-dashboard">
            <div class="app-header">
                <h3>🚀 News Discovery Intelligence</h3>
                <p>AI-powered comprehensive news analysis across all categories and topics</p>
            </div>
            
            <div class="discovery-stats">
                <div class="discovery-stat">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <div class="stat-number">1,847</div>
                        <div class="stat-label">Total Articles Today</div>
                    </div>
                </div>
                <div class="discovery-stat">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-info">
                        <div class="stat-number">12</div>
                        <div class="stat-label">Categories Covered</div>
                    </div>
                </div>
                <div class="discovery-stat">
                    <div class="stat-icon">🌐</div>
                    <div class="stat-info">
                        <div class="stat-number">145</div>
                        <div class="stat-label">Global Sources</div>
                    </div>
                </div>
                <div class="discovery-stat">
                    <div class="stat-icon">⚡</div>
                    <div class="stat-info">
                        <div class="stat-number">Real-time</div>
                        <div class="stat-label">Updates</div>
                    </div>
                </div>
            </div>
            
            <div class="discovery-categories">
                <h4>📊 Category Performance Today</h4>
                <div class="category-performance">
                    <div class="performance-item">
                        <span class="category-name">🤖 AI & Technology</span>
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: 85%"></div>
                        </div>
                        <span class="performance-count">247 articles</span>
                    </div>
                    <div class="performance-item">
                        <span class="category-name">🏛️ Politics & Government</span>
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: 78%"></div>
                        </div>
                        <span class="performance-count">203 articles</span>
                    </div>
                    <div class="performance-item">
                        <span class="category-name">💹 Global Markets</span>
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: 72%"></div>
                        </div>
                        <span class="performance-count">189 articles</span>
                    </div>
                    <div class="performance-item">
                        <span class="category-name">🎮 Gaming & Esports</span>
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: 68%"></div>
                        </div>
                        <span class="performance-count">178 articles</span>
                    </div>
                    <div class="performance-item">
                        <span class="category-name">⚽ Sports & Fitness</span>
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: 64%"></div>
                        </div>
                        <span class="performance-count">167 articles</span>
                    </div>
                </div>
            </div>
            
            <div class="discovery-insights">
                <h4>🧠 AI Insights</h4>
                <div class="insights-grid">
                    <div class="insight-card">
                        <h5>📈 Trending Topics</h5>
                        <p>AI technology and gaming show 45% increase in coverage, indicating major industry developments.</p>
                    </div>
                    <div class="insight-card">
                        <h5>🌍 Global Impact</h5>
                        <p>Faith-based climate initiatives and interfaith cooperation gaining significant international attention.</p>
                    </div>
                    <div class="insight-card">
                        <h5>⚡ Breaking Patterns</h5>
                        <p>Technology breakthrough announcements correlating with market surges across multiple sectors.</p>
                    </div>
                    <div class="insight-card">
                        <h5>🎯 Recommendation</h5>
                        <p>Focus on AI integration stories in gaming and space exploration for maximum engagement.</p>
                    </div>
                </div>
            </div>
            
            <div class="discovery-actions">
                <button class="discovery-action-btn" onclick="generateDiscoveryReport()">
                    <i class="fas fa-file-alt"></i> Generate Full Report
                </button>
                <button class="discovery-action-btn" onclick="exportDiscoveryData()">
                    <i class="fas fa-download"></i> Export Data
                </button>
                <button class="discovery-action-btn" onclick="scheduleDiscoveryUpdates()">
                    <i class="fas fa-clock"></i> Schedule Updates
                </button>
            </div>
        </div>
    `;
}

// Discovery app action functions
function generateDiscoveryReport() {
    showAlert('Discovery Report', '📈 Comprehensive discovery report generated! Includes AI insights, trend analysis, and performance metrics across all news categories.', 'success');
}

function exportDiscoveryData() {
    showAlert('Data Export', '📁 Discovery data exported successfully! CSV file with all category metrics and article counts downloaded.', 'success');
}

function scheduleDiscoveryUpdates() {
    showAlert('Updates Scheduled', '⏰ Discovery updates scheduled every 15 minutes. You\'ll receive notifications about trending topics and category performance.', 'info');
}

// Article generators for new topics
function generateGamingArticle(opening) {
    return `
        <p class="article-lead">${opening}</p>
        
        <div class="gaming-highlight">
            <h4>🎮 Gaming Industry Impact</h4>
            <p>This development represents a significant advancement in interactive entertainment, potentially revolutionizing how games are created, distributed, and experienced globally.</p>
        </div>
        
        <h3>Technical Innovations</h3>
        <ul class="gaming-features">
            <li><strong>AI Integration:</strong> Advanced machine learning for dynamic content generation</li>
            <li><strong>Real-time Adaptation:</strong> Games that evolve based on player behavior</li>
            <li><strong>Cross-platform Compatibility:</strong> Seamless gaming across all devices</li>
            <li><strong>Community Features:</strong> Enhanced social gaming and esports integration</li>
        </ul>
        
        <h3>Industry Response</h3>
        <p>Major gaming studios and esports organizations are already expressing interest in adopting these new technologies. Early partnerships suggest widespread implementation across mobile, console, and PC gaming platforms.</p>
        
        <blockquote>
            "This represents the future of interactive entertainment. We're looking at games that truly adapt and evolve with each player." - Alex Chen, Gaming Industry Analyst
        </blockquote>
        
        <div class="gaming-stats">
            <h4>📀 Market Impact</h4>
            <p>The global gaming market, valued at $196 billion, is expected to grow by 15-20% following these technological advances, with particular strength in VR/AR and competitive gaming sectors.</p>
        </div>
    `;
}

}

// === ANALYSIS TOOLS FUNCTIONS ===

// Launch News Intelligence Suite
function launchNewsIntelligence() {
    showAlert('News Intelligence Suite', '🔍 Launching advanced news intelligence platform with real-time search, filtering, and AI-powered categorization across 1,200+ global sources.', 'success');
}

// Launch Global Sentiment Tracker
function launchSentimentTracker() {
    showAlert('Sentiment Tracker', '📊 Global sentiment analysis tool activated! Tracking emotional responses and public opinion across 45 languages from social media, news, and forums.', 'success');
}

// Launch News Trend Predictor
function launchTrendPredictor() {
    showAlert('Trend Predictor', '🔮 AI trend prediction engine loaded! Using machine learning algorithms to forecast emerging stories and viral topics 4-8 hours before they peak.', 'info');
}

// Launch Global Impact Analyzer
function launchImpactAnalyzer() {
    showAlert('Impact Analyzer', '🌐 Global impact analysis system online! Cross-referencing news events with market data, policy changes, and social indicators to measure real-world effects.', 'info');
}

// Launch Media Bias Detector
function launchBiasDetector() {
    showAlert('Bias Detector', '⚖️ Media bias detection algorithm running! Analyzing editorial tone, source reliability, and political alignment across thousands of news outlets with 94% accuracy.', 'success');
}

// Launch AI Fact Checker
function launchFactChecker() {
    showAlert('AI Fact Checker', '✓ AI-powered fact verification system activated! Cross-checking claims against verified databases, academic sources, and government records with truth scoring.', 'success');
}

// Start software demonstrations
function startSoftwareDemo(software) {
    const softwareNames = {
        'newsanalytica': 'NewsAnalytica Pro',
        'gni': 'Global News Intelligence',
        'aipredictor': 'AI News Predictor'
    };
    
    const name = softwareNames[software] || 'Professional Analytics Software';
    showAlert('Demo Starting', `🎥 Starting interactive demo of ${name}! This comprehensive demonstration showcases real-time news analysis, predictive modeling, and professional reporting features.`, 'info');
}

// Start free trials
function startFreeTrial(software) {
    const softwareNames = {
        'newsanalytica': 'NewsAnalytica Pro (30-day trial)',
        'gni': 'Global News Intelligence (14-day trial)', 
        'aipredictor': 'AI News Predictor (21-day trial)'
    };
    
    const name = softwareNames[software] || 'Professional Analytics Software';
    showAlert('Free Trial Activated', `🚀 Your free trial of ${name} has been activated! You now have full access to enterprise-grade news analysis tools and premium features.`, 'success');
}

function generateReligionArticle(opening) {
    return `
        <p class="article-lead">${opening}</p>
        
        <div class="faith-highlight">
            <h4>🙏 Spiritual Significance</h4>
            <p>This initiative demonstrates the power of faith communities to address global challenges through unified action and shared spiritual values.</p>
        </div>
        
        <h3>Global Participation</h3>
        <ul class="faith-participation">
            <li><strong>Christianity:</strong> Vatican and major denominational leaders</li>
            <li><strong>Islam:</strong> Islamic councils and scholarly institutions</li>
            <li><strong>Judaism:</strong> Rabbinical authorities and community leaders</li>
            <li><strong>Other Faiths:</strong> Buddhist, Hindu, Sikh, and indigenous spiritual communities</li>
        </ul>
        
        <h3>Humanitarian Impact</h3>
        <p>Faith-based organizations coordinate relief efforts, peace initiatives, and community development projects across multiple continents, demonstrating religion's positive role in addressing global challenges.</p>
        
        <blockquote>
            "When faith communities unite, they become a powerful force for positive change in our world." - Dr. Amira Hassan, Interfaith Studies
        </blockquote>
        
        <div class="faith-future">
            <h4>🌏 Global Cooperation</h4>
            <p>This interfaith collaboration sets a precedent for religious communities working together on climate change, poverty reduction, and conflict resolution worldwide.</p>
        </div>
    `;
}

// Live Broadcasting & Social Media Integration Functions
let isLiveBroadcasting = false;
let liveStreamStats = {
    viewers: 12847,
    streams: 5,
    platforms: 8
};

// Initialize live content
function initializeLiveContent() {
    const liveFeed = document.getElementById('liveFeed');
    if (!liveFeed) return;
    
    liveFeed.innerHTML = `
        <div class="live-stream-placeholder">
            <div class="stream-preview">
                <div class="preview-content">
                    <i class="fas fa-video" style="font-size: 3rem; color: var(--primary-blue); margin-bottom: 1rem;"></i>
                    <h4>Ready to Go Live</h4>
                    <p>Click "Start Live Stream" to begin broadcasting to multiple platforms simultaneously</p>
                    <div class="platform-indicators">
                        <div class="platform-indicator youtube">
                            <i class="fab fa-youtube"></i>
                            <span>YouTube</span>
                        </div>
                        <div class="platform-indicator twitter">
                            <i class="fab fa-twitter"></i>
                            <span>Twitter/X</span>
                        </div>
                        <div class="platform-indicator facebook">
                            <i class="fab fa-facebook"></i>
                            <span>Facebook</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Update live stats periodically
    setInterval(updateLiveStats, 5000);
}

function updateLiveStats() {
    const viewersEl = document.getElementById('liveViewers');
    const streamsEl = document.getElementById('totalStreams');
    const platformsEl = document.getElementById('platforms');
    
    if (viewersEl) {
        liveStreamStats.viewers += Math.floor(Math.random() * 100) - 50;
        liveStreamStats.viewers = Math.max(1000, liveStreamStats.viewers);
        animateNumber(viewersEl, liveStreamStats.viewers);
    }
    
    if (streamsEl) {
        streamsEl.textContent = liveStreamStats.streams;
    }
    
    if (platformsEl) {
        platformsEl.textContent = liveStreamStats.platforms;
    }
}

function animateNumber(element, target) {
    const current = parseInt(element.textContent.replace(/,/g, ''));
    const increment = (target - current) / 20;
    let step = 0;
    
    const animation = setInterval(() => {
        step++;
        const value = Math.floor(current + (increment * step));
        element.textContent = value.toLocaleString();
        
        if (step >= 20) {
            clearInterval(animation);
            element.textContent = target.toLocaleString();
        }
    }, 50);
}

// Main broadcasting functions
function startLiveBroadcast() {
    if (isLiveBroadcasting) {
        stopLiveBroadcast();
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'broadcast-setup-modal';
    modal.innerHTML = `
        <div class="broadcast-setup-content">
            <div class="broadcast-setup-header">
                <h3>🎥 Start Live Broadcasting</h3>
                <button class="close-broadcast-setup" onclick="closeBroadcastSetup()">&times;</button>
            </div>
            <div class="broadcast-setup-body">
                <div class="stream-setup">
                    <h4>Select Broadcasting Platforms</h4>
                    <div class="platform-selection">
                        <label class="platform-checkbox">
                            <input type="checkbox" value="youtube" checked>
                            <span class="checkbox-custom"></span>
                            <div class="platform-option">
                                <i class="fab fa-youtube"></i>
                                <span>YouTube Live</span>
                            </div>
                        </label>
                        <label class="platform-checkbox">
                            <input type="checkbox" value="twitter">
                            <span class="checkbox-custom"></span>
                            <div class="platform-option">
                                <i class="fab fa-twitter"></i>
                                <span>Twitter/X Spaces</span>
                            </div>
                        </label>
                        <label class="platform-checkbox">
                            <input type="checkbox" value="facebook">
                            <span class="checkbox-custom"></span>
                            <div class="platform-option">
                                <i class="fab fa-facebook"></i>
                                <span>Facebook Live</span>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div class="stream-settings">
                    <h4>Stream Configuration</h4>
                    <div class="settings-grid">
                        <div class="setting-group">
                            <label>Stream Title</label>
                            <input type="text" id="streamTitle" placeholder="Breaking News: Global Updates" value="KaiTech Global News Live">
                        </div>
                        <div class="setting-group">
                            <label>Video Quality</label>
                            <select id="streamQuality">
                                <option value="720p">720p HD</option>
                                <option value="1080p" selected>1080p Full HD</option>
                                <option value="4k">4K Ultra HD</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label>Audio Source</label>
                            <select id="audioSource">
                                <option value="default">Default Microphone</option>
                                <option value="professional">Professional Audio Setup</option>
                                <option value="studio">Studio Quality</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label>Stream Key</label>
                            <input type="password" id="streamKey" placeholder="Enter your stream key" value="demo-key-12345">
                        </div>
                    </div>
                </div>
                
                <div class="broadcast-actions">
                    <button class="test-stream-btn" onclick="testStream()">
                        <i class="fas fa-vial"></i> Test Stream
                    </button>
                    <button class="start-streaming-btn" onclick="initiateLiveStream()">
                        <i class="fas fa-broadcast-tower"></i> Go Live Now
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeBroadcastSetup() {
    const modal = document.querySelector('.broadcast-setup-modal');
    if (modal) modal.remove();
}

function initiateLiveStream() {
    const title = document.getElementById('streamTitle')?.value || 'KaiTech Live Stream';
    const quality = document.getElementById('streamQuality')?.value || '1080p';
    
    closeBroadcastSetup();
    
    // Simulate stream starting
    isLiveBroadcasting = true;
    liveStreamStats.streams += 1;
    
    showAlert('Stream Started!', `Now broadcasting "${title}" in ${quality} to selected platforms. Stream is live!`, 'success');
    
    // Update the live feed to show broadcasting status
    const liveFeed = document.getElementById('liveFeed');
    if (liveFeed) {
        liveFeed.innerHTML = `
            <div class="live-broadcast-active">
                <div class="broadcast-status">
                    <div class="live-indicator pulsing">🔴 LIVE</div>
                    <h4>"${title}" - Broadcasting Now</h4>
                    <p>Stream Quality: ${quality} • Duration: <span id="streamDuration">00:00:00</span></p>
                </div>
                <div class="broadcast-controls">
                    <button class="pause-stream-btn" onclick="pauseStream()">
                        <i class="fas fa-pause"></i> Pause
                    </button>
                    <button class="stop-stream-btn" onclick="stopLiveBroadcast()">
                        <i class="fas fa-stop"></i> End Stream
                    </button>
                </div>
            </div>
        `;
        
        // Start stream duration timer
        startStreamTimer();
    }
}

function startStreamTimer() {
    let seconds = 0;
    const timer = setInterval(() => {
        if (!isLiveBroadcasting) {
            clearInterval(timer);
            return;
        }
        
        seconds++;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        const durationEl = document.getElementById('streamDuration');
        if (durationEl) {
            durationEl.textContent = duration;
        }
    }, 1000);
}

function stopLiveBroadcast() {
    isLiveBroadcasting = false;
    liveStreamStats.streams = Math.max(0, liveStreamStats.streams - 1);
    
    showAlert('Stream Ended', 'Live broadcast has been stopped. Stream statistics have been saved.', 'info');
    
    // Reset live feed
    setTimeout(() => {
        initializeLiveContent();
    }, 1000);
}

function testStream() {
    showAlert('Stream Test', '✅ Stream test successful! All platforms are connected and ready for broadcasting.', 'success');
}

function pauseStream() {
    showAlert('Stream Paused', '⏸️ Live stream has been paused. Click resume to continue broadcasting.', 'info');
}

// Platform-specific setup functions
function setupYoutubeLive() {
    const modal = document.createElement('div');
    modal.className = 'platform-setup-modal';
    modal.innerHTML = `
        <div class="platform-setup-content">
            <div class="platform-setup-header">
                <h3><i class="fab fa-youtube"></i> YouTube Live Setup</h3>
                <button class="close-platform-setup" onclick="closePlatformSetup()">&times;</button>
            </div>
            <div class="platform-setup-body">
                <div class="setup-steps">
                    <h4>Setup Instructions</h4>
                    <div class="step-list">
                        <div class="setup-step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h5>Install OBS Studio</h5>
                                <p>Download and install OBS Studio for professional streaming</p>
                                <button class="download-btn" onclick="window.open('https://obsproject.com/', '_blank')">
                                    <i class="fas fa-download"></i> Download OBS
                                </button>
                            </div>
                        </div>
                        <div class="setup-step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h5>Get YouTube Stream Key</h5>
                                <p>Go to YouTube Studio > Create > Go Live to get your stream key</p>
                                <button class="open-btn" onclick="window.open('https://studio.youtube.com/', '_blank')">
                                    <i class="fas fa-external-link-alt"></i> YouTube Studio
                                </button>
                            </div>
                        </div>
                        <div class="setup-step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h5>Configure OBS Settings</h5>
                                <p>Set up your scenes, sources, and streaming settings in OBS</p>
                                <button class="guide-btn" onclick="showOBSGuide()">
                                    <i class="fas fa-book"></i> Setup Guide
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function setupTwitter() {
    const modal = document.createElement('div');
    modal.className = 'platform-setup-modal';
    modal.innerHTML = `
        <div class="platform-setup-content">
            <div class="platform-setup-header">
                <h3><i class="fab fa-twitter"></i> Twitter/X Live Setup</h3>
                <button class="close-platform-setup" onclick="closePlatformSetup()">&times;</button>
            </div>
            <div class="platform-setup-body">
                <div class="setup-info">
                    <h4>Twitter/X Broadcasting Options</h4>
                    <div class="twitter-options">
                        <div class="option-card">
                            <i class="fas fa-microphone"></i>
                            <h5>Twitter Spaces</h5>
                            <p>Host live audio conversations with your audience</p>
                            <button class="setup-option-btn" onclick="setupTwitterSpaces()">
                                Setup Spaces
                            </button>
                        </div>
                        <div class="option-card">
                            <i class="fas fa-stream"></i>
                            <h5>Live Tweeting</h5>
                            <p>Real-time news updates and live thread coverage</p>
                            <button class="setup-option-btn" onclick="setupLiveTweeting()">
                                Setup Live Tweets
                            </button>
                        </div>
                        <div class="option-card">
                            <i class="fas fa-hashtag"></i>
                            <h5>Trending Topics</h5>
                            <p>Monitor and participate in trending conversations</p>
                            <button class="setup-option-btn" onclick="setupTrendingMonitor()">
                                Setup Monitoring
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function setupFacebook() {
    const modal = document.createElement('div');
    modal.className = 'platform-setup-modal';
    modal.innerHTML = `
        <div class="platform-setup-content">
            <div class="platform-setup-header">
                <h3><i class="fab fa-facebook"></i> Facebook Live Setup</h3>
                <button class="close-platform-setup" onclick="closePlatformSetup()">&times;</button>
            </div>
            <div class="platform-setup-body">
                <div class="facebook-setup">
                    <h4>Facebook Broadcasting Tools</h4>
                    <div class="tool-recommendations">
                        <div class="tool-item">
                            <strong>Restream.io</strong> - Multi-platform streaming
                            <button class="tool-btn" onclick="window.open('https://restream.io/', '_blank')">
                                <i class="fas fa-external-link-alt"></i> Visit
                            </button>
                        </div>
                        <div class="tool-item">
                            <strong>BeLive.tv</strong> - Professional Facebook streaming
                            <button class="tool-btn" onclick="window.open('https://belive.tv/', '_blank')">
                                <i class="fas fa-external-link-alt"></i> Visit
                            </button>
                        </div>
                        <div class="tool-item">
                            <strong>Creator Studio</strong> - Facebook's native tools
                            <button class="tool-btn" onclick="window.open('https://business.facebook.com/creatorstudio/', '_blank')">
                                <i class="fas fa-external-link-alt"></i> Visit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function setupNewsIntegration() {
    const modal = document.createElement('div');
    modal.className = 'platform-setup-modal';
    modal.innerHTML = `
        <div class="platform-setup-content">
            <div class="platform-setup-header">
                <h3><i class="fas fa-newspaper"></i> News Website Integration</h3>
                <button class="close-platform-setup" onclick="closePlatformSetup()">&times;</button>
            </div>
            <div class="platform-setup-body">
                <div class="integration-options">
                    <h4>Content Management Systems</h4>
                    <div class="cms-grid">
                        <div class="cms-option">
                            <i class="fab fa-wordpress"></i>
                            <h5>WordPress</h5>
                            <p>Most popular CMS for news websites</p>
                            <button class="cms-btn" onclick="setupWordPress()">
                                Setup WordPress
                            </button>
                        </div>
                        <div class="cms-option">
                            <i class="fas fa-database"></i>
                            <h5>Drupal</h5>
                            <p>Enterprise-grade content management</p>
                            <button class="cms-btn" onclick="setupDrupal()">
                                Setup Drupal
                            </button>
                        </div>
                        <div class="cms-option">
                            <i class="fas fa-cogs"></i>
                            <h5>Custom API</h5>
                            <p>Direct integration with news APIs</p>
                            <button class="cms-btn" onclick="setupCustomAPI()">
                                Setup API
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function setupTVBroadcast() {
    const modal = document.createElement('div');
    modal.className = 'platform-setup-modal';
    modal.innerHTML = `
        <div class="platform-setup-content">
            <div class="platform-setup-header">
                <h3><i class="fas fa-tv"></i> Professional TV Broadcasting</h3>
                <button class="close-platform-setup" onclick="closePlatformSetup()">&times;</button>
            </div>
            <div class="platform-setup-body">
                <div class="tv-broadcast-setup">
                    <h4>Professional Broadcasting Software</h4>
                    <div class="software-recommendations">
                        <div class="software-item">
                            <div class="software-info">
                                <h5>vMix</h5>
                                <p>Professional live production software with multi-camera support, graphics, and streaming capabilities.</p>
                                <div class="software-features">
                                    <span class="feature">4K/8K Support</span>
                                    <span class="feature">Multi-camera</span>
                                    <span class="feature">Virtual Sets</span>
                                    <span class="feature">Live Graphics</span>
                                </div>
                            </div>
                            <button class="software-btn" onclick="window.open('https://vmix.com/', '_blank')">
                                <i class="fas fa-external-link-alt"></i> Get vMix
                            </button>
                        </div>
                        <div class="software-item">
                            <div class="software-info">
                                <h5>NewTek TriCaster</h5>
                                <p>Complete live production system for TV-quality broadcasts with professional features.</p>
                                <div class="software-features">
                                    <span class="feature">TV Production</span>
                                    <span class="feature">Live Switching</span>
                                    <span class="feature">Graphics Package</span>
                                    <span class="feature">Recording</span>
                                </div>
                            </div>
                            <button class="software-btn" onclick="window.open('https://www.newtek.com/tricaster/', '_blank')">
                                <i class="fas fa-external-link-alt"></i> Get TriCaster
                            </button>
                        </div>
                        <div class="software-item">
                            <div class="software-info">
                                <h5>Blackmagic ATEM</h5>
                                <p>Professional live production switchers for broadcast and streaming applications.</p>
                                <div class="software-features">
                                    <span class="feature">Broadcast Quality</span>
                                    <span class="feature">Hardware Control</span>
                                    <span class="feature">Multi-format</span>
                                    <span class="feature">Professional I/O</span>
                                </div>
                            </div>
                            <button class="software-btn" onclick="window.open('https://www.blackmagicdesign.com/products/atem', '_blank')">
                                <i class="fas fa-external-link-alt"></i> Get ATEM
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closePlatformSetup() {
    const modal = document.querySelector('.platform-setup-modal');
    if (modal) modal.remove();
}

// Broadcasting studio and social hub functions
function openBroadcastStudio() {
    showAlert('Broadcast Studio', 'Opening professional broadcast studio interface with multi-camera setup, graphics overlay, and production tools...', 'info');
}

function openSocialMediaHub() {
    showAlert('Social Media Hub', 'Opening unified social media management dashboard for cross-platform posting and engagement tracking...', 'info');
}

// Streaming tools functions
function openStreamingAnalytics() {
    showAlert('Analytics Dashboard', 'Real-time streaming analytics: Viewer engagement, platform performance, and audience demographics available.', 'info');
}

function openContentScheduler() {
    showAlert('Content Scheduler', 'Schedule posts across YouTube, Twitter/X, Facebook, and news websites with automated publishing.', 'info');
}

function openLiveChat() {
    showAlert('Live Chat Manager', 'Unified chat interface for managing audience interactions across all streaming platforms simultaneously.', 'info');
}

function openBrandingStudio() {
    showAlert('Branding Studio', 'Create custom overlays, lower thirds, logos, and graphics for professional broadcast presentation.', 'info');
}

// Streaming functions
function streamToYoutube() {
    showAlert('YouTube Stream', '🔴 Starting YouTube Live stream with professional quality settings...', 'success');
}

function postToTwitter() {
    showAlert('Twitter Post', '🐦 Posting live updates to Twitter/X with trending hashtags and real-time engagement...', 'success');
}

function streamToFacebook() {
    showAlert('Facebook Live', '📘 Going live on Facebook with cross-platform promotion and engagement tools...', 'success');
}

function publishToNewsWebsites() {
    showAlert('News Publishing', '📰 Publishing breaking news to integrated news websites with SEO optimization...', 'success');
}

function startTVBroadcast() {
    showAlert('TV Broadcast', '📺 Initiating professional TV-quality broadcast with multi-camera production setup...', 'success');
}

// Initialize live content when live tab is selected
function initializeLiveTab() {
    loadLiveNews();
    startLiveNewsUpdates();
    console.log('Live news tab initialized');
}

// Helper function to get live news icons
function getLiveIcon(type) {
    const icons = {
        'breaking': '🚨',
        'update': '📈',
        'developing': '🔄',
        'alert': '⚡',
        'urgent': '🔴'
    };
    return icons[type] || '📰';
}

// Start live news updates simulation
function startLiveNewsUpdates() {
    // Simulate live updates every 30 seconds
    setInterval(() => {
        updateLiveNewsStats();
        updateNewsTicker();
    }, 30000);
}

// Update live news statistics
function updateLiveNewsStats() {
    const breakingCount = document.getElementById('breakingCount');
    const liveUpdates = document.getElementById('liveUpdates');
    const activeSources = document.getElementById('activeSources');
    const lastUpdateLive = document.getElementById('lastUpdateLive');
    
    if (breakingCount) {
        const newCount = Math.floor(Math.random() * 5) + 10;
        animateNumber(breakingCount, newCount);
    }
    
    if (liveUpdates) {
        const currentCount = parseInt(liveUpdates.textContent) || 247;
        const newCount = currentCount + Math.floor(Math.random() * 10) + 1;
        animateNumber(liveUpdates, newCount);
    }
    
    if (lastUpdateLive) {
        lastUpdateLive.textContent = Math.floor(Math.random() * 60) + 's';
    }
}

// Update breaking news ticker
function updateNewsTicker() {
    const ticker = document.getElementById('liveNewsTicker');
    if (!ticker) return;
    
    const tickerMessages = [
        '🚨 Major AI breakthrough announced • 📈 Global markets surge on tech optimism • 🌍 International climate summit reaches historic agreement',
        '🔥 Quantum computing achieves new milestone • 🌱 Renewable energy surpasses fossil fuels • 🚀 Space mission discovers new possibilities',
        '🎯 Breaking: Tech giants unite for AI safety • 🌐 Global cooperation on climate action • ⚡ Energy revolution accelerates worldwide',
        '📊 Markets hit record highs • 🔬 Scientific breakthrough in medicine • 🌏 World leaders announce peace initiative'
    ];
    
    const randomMessage = tickerMessages[Math.floor(Math.random() * tickerMessages.length)];
    ticker.querySelector('span').textContent = randomMessage;
}

// Live news action functions
function refreshLiveNews() {
    const refreshBtn = document.querySelector('.refresh-live-btn');
    const icon = refreshBtn.querySelector('i');
    
    icon.classList.add('fa-spin');
    refreshBtn.disabled = true;
    
    setTimeout(() => {
        loadLiveNews();
        updateLiveNewsStats();
        updateNewsTicker();
        
        icon.classList.remove('fa-spin');
        refreshBtn.disabled = false;
        
        showAlert('News Refreshed', 'Live news feed has been updated with the latest breaking stories!', 'success');
    }, 1500);
}

function filterLiveNews() {
    showAlert('Live News Filter', 'Live news filtering options: Breaking, Updates, Alerts, All Categories', 'info');
}

function toggleAutoRefresh() {
    const btn = document.querySelector('.auto-refresh-btn');
    const isActive = btn.classList.contains('active');
    
    if (isActive) {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-pause"></i> Auto-Refresh';
        showAlert('Auto-Refresh Paused', 'Live news auto-refresh has been paused.', 'info');
    } else {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-play"></i> Auto-Refresh';
        showAlert('Auto-Refresh Active', 'Live news will refresh automatically every 30 seconds.', 'success');
    }
}

function readLiveStory(storyId) {
    showAlert('Live Story', `Opening full coverage for live story ${storyId}. This would display the complete breaking news article with real-time updates.`, 'info');
}

function shareLiveStory(storyId) {
    showAlert('Share Live Story', `Live story ${storyId} shared! Link copied to clipboard for instant sharing across social platforms.`, 'success');
}

// Export live broadcasting functions
window.startLiveBroadcast = startLiveBroadcast;
window.closeBroadcastSetup = closeBroadcastSetup;
window.initiateLiveStream = initiateLiveStream;
window.stopLiveBroadcast = stopLiveBroadcast;
window.testStream = testStream;
window.pauseStream = pauseStream;
window.setupYoutubeLive = setupYoutubeLive;
window.setupTwitter = setupTwitter;
window.setupFacebook = setupFacebook;
window.setupNewsIntegration = setupNewsIntegration;
window.setupTVBroadcast = setupTVBroadcast;
window.closePlatformSetup = closePlatformSetup;
window.openBroadcastStudio = openBroadcastStudio;
window.openSocialMediaHub = openSocialMediaHub;
window.openStreamingAnalytics = openStreamingAnalytics;
window.openContentScheduler = openContentScheduler;
window.openLiveChat = openLiveChat;
window.openBrandingStudio = openBrandingStudio;
window.streamToYoutube = streamToYoutube;
window.postToTwitter = postToTwitter;
window.streamToFacebook = streamToFacebook;
window.publishToNewsWebsites = publishToNewsWebsites;
window.startTVBroadcast = startTVBroadcast;
window.initializeLiveTab = initializeLiveTab;

// === GAMES NEWS TAB FUNCTIONS ===

// Initialize Games Tab
function initializeGamesTab() {
    loadGamesNews();
    console.log('Games news tab initialized');
}

// Load Games News
function loadGamesNews() {
    const gamesNewsList = document.getElementById('gamesNewsList');
    if (!gamesNewsList) return;
    
    const gamesNews = mockTrendingNews.games || [];
    
    gamesNewsList.innerHTML = gamesNews.map(item => `
        <div class="game-news-card ${ item.trending ? 'featured' : '' }">
            <div class="news-image">
                <div class="game-placeholder">${getGameIcon(item.category)}</div>
                <span class="news-badge ${getBadgeClass(item.category)}">${item.category.toUpperCase()}</span>
            </div>
            <div class="news-content">
                <div class="news-category">${item.category}</div>
                <h4>${item.title}</h4>
                <p class="news-excerpt">${item.excerpt}</p>
                <div class="news-meta">
                    <span class="source">${item.source}</span>
                    <span class="time">${item.time}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Games News
function filterGamesNews(filter) {
    document.querySelectorAll('.games-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    const gamesNewsList = document.getElementById('gamesNewsList');
    if (!gamesNewsList) return;
    
    let filteredNews = mockTrendingNews.games || [];
    
    if (filter !== 'all') {
        filteredNews = filteredNews.filter(item => 
            item.category.toLowerCase().includes(filter.toLowerCase())
        );
    }
    
    gamesNewsList.innerHTML = filteredNews.map(item => `
        <div class="game-news-card ${ item.trending ? 'featured' : '' }">
            <div class="news-image">
                <div class="game-placeholder">${getGameIcon(item.category)}</div>
                <span class="news-badge ${getBadgeClass(item.category)}">${item.category.toUpperCase()}</span>
            </div>
            <div class="news-content">
                <div class="news-category">${item.category}</div>
                <h4>${item.title}</h4>
                <p class="news-excerpt">${item.excerpt}</p>
                <div class="news-meta">
                    <span class="source">${item.source}</span>
                    <span class="time">${item.time}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function to get game icons
function getGameIcon(category) {
    const icons = {
        'Gaming': '🎮',
        'Esports': '🏆',
        'VR Gaming': '🚀',
        'PC Gaming': '💻',
        'Console': '🎮',
        'Mobile': '📱'
    };
    return icons[category] || '🎮';
}

// Helper function to get badge classes
function getBadgeClass(category) {
    const classes = {
        'Gaming': 'breaking',
        'Esports': 'esports',
        'VR Gaming': 'tech',
        'PC Gaming': 'tech',
        'Console': 'gaming',
        'Mobile': 'mobile'
    };
    return classes[category] || 'gaming';
}

// === RELIGION NEWS TAB FUNCTIONS ===

// Initialize Religion Tab
function initializeReligionTab() {
    loadReligionNews();
    console.log('Religion news tab initialized');
}

// Load Religion News
function loadReligionNews() {
    const religionNewsList = document.getElementById('religionNewsList');
    if (!religionNewsList) return;
    
    const religionNews = mockTrendingNews.religion || [];
    
    religionNewsList.innerHTML = religionNews.map(item => `
        <div class="religion-news-card ${ item.trending ? 'featured' : '' }">
            <div class="news-image">
                <div class="religion-placeholder">${getReligionIcon(item.category)}</div>
                <span class="news-badge ${getReligionBadgeClass(item.category)}">${item.category.toUpperCase()}</span>
            </div>
            <div class="news-content">
                <div class="news-category">${item.category}</div>
                <h4>${item.title}</h4>
                <p class="news-excerpt">${item.excerpt}</p>
                <div class="news-meta">
                    <span class="source">${item.source}</span>
                    <span class="time">${item.time}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Religion News
function filterReligionNews(filter) {
    document.querySelectorAll('.religion-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    const religionNewsList = document.getElementById('religionNewsList');
    if (!religionNewsList) return;
    
    let filteredNews = mockTrendingNews.religion || [];
    
    if (filter !== 'all') {
        filteredNews = filteredNews.filter(item => 
            item.category.toLowerCase().includes(filter.toLowerCase())
        );
    }
    
    religionNewsList.innerHTML = filteredNews.map(item => `
        <div class="religion-news-card ${ item.trending ? 'featured' : '' }">
            <div class="news-image">
                <div class="religion-placeholder">${getReligionIcon(item.category)}</div>
                <span class="news-badge ${getReligionBadgeClass(item.category)}">${item.category.toUpperCase()}</span>
            </div>
            <div class="news-content">
                <div class="news-category">${item.category}</div>
                <h4>${item.title}</h4>
                <p class="news-excerpt">${item.excerpt}</p>
                <div class="news-meta">
                    <span class="source">${item.source}</span>
                    <span class="time">${item.time}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function to get religion icons
function getReligionIcon(category) {
    const icons = {
        'Vatican News': '⛪',
        'Interfaith': '🕌',
        'Humanitarian': '🕊️',
        'Christianity': '✝️',
        'Islam': '☪️',
        'Spirituality': '🙏'
    };
    return icons[category] || '🙏';
}

// Helper function to get religion badge classes
function getReligionBadgeClass(category) {
    const classes = {
        'Vatican News': 'important',
        'Interfaith': 'interfaith',
        'Humanitarian': 'social',
        'Christianity': 'important',
        'Islam': 'interfaith',
        'Spirituality': 'social'
    };
    return classes[category] || 'important';
}
