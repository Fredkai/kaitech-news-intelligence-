// KaiTech Global News Intelligence - Main functionality

// Global variables
let chatHistory = [];
let isAIResponding = false;
let newsData = [];
let currentFilter = 'all';
let breakingNewsInterval;

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
    
    // Show loading
    showLoading();
    isAIResponding = true;
    
    try {
        // Simulate AI response (replace with actual AI API call)
        const response = await simulateAIResponse(message);
        
        // Add AI response to chat
        setTimeout(() => {
            addMessageToChat(response, 'ai');
            chatHistory.push({
                role: 'assistant',
                content: response
            });
            hideLoading();
            isAIResponding = false;
        }, 1000);
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
        hideLoading();
        isAIResponding = false;
    }
}

function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    if (sender === 'ai') {
        messageDiv.classList.add('ai-message');
    } else {
        messageDiv.classList.add('user-message');
    }
    
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    
    if (sender === 'ai') {
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
    } else {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    const content = document.createElement('div');
    content.classList.add('message-content');
    content.textContent = message;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulate AI response (replace with actual API integration)
async function simulateAIResponse(userMessage) {
    // Simple response simulation based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
        return "Hello! Nice to meet you. I'm here to help with any questions or tasks you might have.";
    }
    
    if (message.includes('code') || message.includes('programming')) {
        return "I'd be happy to help with coding! I can assist with various programming languages, debugging, code review, and explaining concepts. What specific coding challenge are you working on?";
    }
    
    if (message.includes('ai') || message.includes('artificial intelligence')) {
        return "AI is fascinating! I can help explain AI concepts, discuss different AI technologies, or assist with AI-related projects. What aspect of AI interests you most?";
    }
    
    if (message.includes('website') || message.includes('web development')) {
        return "Web development is exciting! I can help with HTML, CSS, JavaScript, frameworks, responsive design, and more. Are you working on a specific web project?";
    }
    
    if (message.includes('help')) {
        return "I'm here to help! I can assist with:\n• General questions and conversations\n• Programming and code help\n• Web development guidance\n• AI and technology topics\n• Writing and content creation\n• Problem-solving and analysis\n\nWhat would you like help with?";
    }
    
    // Default responses
    const defaultResponses = [
        "That's an interesting question! Let me think about that and provide you with a helpful response.",
        "I understand what you're asking. Here's my perspective on that topic...",
        "Great question! I'd be happy to help you with that.",
        "Thanks for sharing that with me. Here's what I think about it...",
        "That's a topic I can definitely help with. Let me provide some insights."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
    loadingIndicator.style.display = 'flex';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
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

// Initialize news features
function initializeNewsFeatures() {
    // Start breaking news rotation
    startBreakingNewsRotation();
    
    // Update stats periodically
    updateStats();
    
    // Setup news filters
    setupNewsFilters();
    
    // Load initial news
    loadMoreNews();
    
    console.log('News features initialized');
}

// Breaking news rotation
function startBreakingNewsRotation() {
    const breakingNewsItems = [
        'AI Analysis reveals major trends in global markets - powered by KaiTech Intelligence',
        'Breaking: Global technology summit announces new AI partnerships worldwide',
        'KaiTech AI predicts significant weather patterns affecting 50+ countries',
        'Live Update: International trade agreements reach historic milestone',
        'Breaking News: Scientific breakthrough in renewable energy technology',
        'KaiTech Intelligence detects emerging trends in global healthcare sector'
    ];
    
    let currentIndex = 0;
    
    breakingNewsInterval = setInterval(() => {
        if (breakingNewsText) {
            breakingNewsText.textContent = breakingNewsItems[currentIndex];
            currentIndex = (currentIndex + 1) % breakingNewsItems.length;
        }
    }, 8000); // Rotate every 8 seconds
}

// Update statistics
function updateStats() {
    if (storiesAnalyzed) {
        animateCounter(storiesAnalyzed, 24567, 30689);
    }
    if (countriesCovered) {
        animateCounter(countriesCovered, 195, 195); // Static
    }
    
    // Update stories count every 30 seconds
    setInterval(() => {
        if (storiesAnalyzed) {
            const current = parseInt(storiesAnalyzed.textContent.replace(/,/g, ''));
            const increment = Math.floor(Math.random() * 50) + 10;
            animateCounter(storiesAnalyzed, current, current + increment);
        }
    }, 30000);
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

// Load more news (simulated)
function loadMoreNews() {
    const sampleNews = [
        {
            category: 'technology',
            categoryClass: 'technology',
            time: '5 min ago',
            title: 'Revolutionary AI System Transforms Healthcare Diagnostics',
            excerpt: 'New machine learning algorithm shows 95% accuracy in early disease detection, promising to revolutionize medical diagnostics worldwide.',
            source: 'KaiTech Health Intelligence'
        },
        {
            category: 'business',
            categoryClass: 'business', 
            time: '12 min ago',
            title: 'Global Stock Markets Show Positive Response to Tech Innovation',
            excerpt: 'International markets surge as investors show confidence in emerging AI technologies and sustainable energy solutions.',
            source: 'KaiTech Financial Analysis'
        },
        {
            category: 'world',
            categoryClass: 'world',
            time: '18 min ago', 
            title: 'International Climate Summit Reaches Breakthrough Agreement',
            excerpt: 'Historic accord signed by 150+ nations committing to accelerated renewable energy adoption and carbon reduction goals.',
            source: 'KaiTech Global Coverage'
        },
        {
            category: 'politics',
            categoryClass: 'politics',
            time: '25 min ago',
            title: 'New Digital Governance Framework Adopted by EU Nations',
            excerpt: 'Comprehensive legislation addressing AI regulation, data privacy, and digital rights comes into effect across European Union.',
            source: 'KaiTech Policy Tracker'
        }
    ];
    
    // Add sample news cards to the existing grid
    sampleNews.forEach(news => {
        addNewsCard(news);
    });
}

// Add a news card to the grid
function addNewsCard(newsItem) {
    const newsCard = document.createElement('div');
    newsCard.className = 'news-card';
    newsCard.innerHTML = `
        <div class="news-header">
            <span class="news-category ${newsItem.categoryClass}">${newsItem.category.toUpperCase()}</span>
            <span class="news-time">${newsItem.time}</span>
        </div>
        <h3 class="news-title">${newsItem.title}</h3>
        <p class="news-excerpt">${newsItem.excerpt}</p>
        <div class="news-footer">
            <span class="news-source">${newsItem.source}</span>
            <div class="news-actions">
                <button class="action-btn" onclick="shareNews('${newsItem.title}')"><i class="fas fa-share"></i></button>
                <button class="action-btn" onclick="bookmarkNews('${newsItem.title}')"><i class="fas fa-bookmark"></i></button>
            </div>
        </div>
    `;
    
    if (newsGrid) {
        newsGrid.appendChild(newsCard);
    }
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
                        <ol style="margin-top: 1rem;">
                            <li>Asia Pacific - 4,156 stories</li>
                            <li>Europe - 3,291 stories</li>
                            <li>North America - 2,847 stories</li>
                            <li>Middle East - 1,923 stories</li>
                            <li>South America - 1,654 stories</li>
                        </ol>
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
                                <strong>#1 AI Technology</strong> - 45,678 mentions (+125% ↗️)
                            </div>
                            <div style="background: #dbeafe; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <strong>#2 Climate Change</strong> - 32,145 mentions (+89% ↗️)
                            </div>
                            <div style="background: #dcfce7; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <strong>#3 Global Economy</strong> - 28,967 mentions (+67% ↗️)
                            </div>
                            <div style="background: #fce7f3; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <strong>#4 Space Exploration</strong> - 21,334 mentions (+45% ↗️)
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
                            <div style="display: inline-block; background: #10b981; color: white; padding: 1rem 2rem; border-radius: 50%; font-size: 2rem; margin-bottom: 1rem;">98.7%</div>
                            <div>Current Accuracy Rate</div>
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
                            <strong>Today's Verification Stats:</strong><br>
                            • 24,567 articles processed<br>
                            • 127 misleading claims detected<br>
                            • 98.7% accuracy maintained<br>
                            • 15 sources flagged for review
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

// Export functions for global access
window.sendMessage = sendMessage;
window.openTool = openTool;
window.closeModal = closeModal;
window.scrollToSection = scrollToSection;
window.generateText = generateText;
window.generateCode = generateCode;
window.analyzeImage = analyzeImage;
window.analyzeText = analyzeText;

// Export news-specific functions
window.loadMoreNews = loadMoreNews;
window.shareNews = shareNews;
window.bookmarkNews = bookmarkNews;
window.openAnalysis = openAnalysis;
