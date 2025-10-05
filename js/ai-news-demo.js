// AI News Demo Interactive Functions
// Handles the interactive AI news demonstration showcasing Voice of Time capabilities

document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 AI News Demo initialized');
    initializeAINewsDemo();
});

function initializeAINewsDemo() {
    // Auto-run sentiment analysis demo
    setTimeout(() => {
        animateSentimentAnalysis();
    }, 2000);
    
    // Start periodic updates
    startDemoUpdates();
}

// Switch between AI demo tabs
function showAIDemo(demoType) {
    // Remove active class from all demo buttons
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Remove active class from all demo content
    document.querySelectorAll('.ai-demo-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Show corresponding demo content
    const demoContent = document.getElementById(`${demoType}-demo`);
    if (demoContent) {
        demoContent.classList.add('active');
    }
    
    // Trigger demo-specific animations
    switch(demoType) {
        case 'sentiment':
            setTimeout(() => animateSentimentAnalysis(), 300);
            break;
        case 'summary':
            setTimeout(() => animateSummaryDemo(), 300);
            break;
        case 'trends':
            setTimeout(() => animateTrendsDemo(), 300);
            break;
        case 'personalized':
            setTimeout(() => animatePersonalizationDemo(), 300);
            break;
    }
    
    console.log(`🎯 Showing AI demo: ${demoType}`);
}

// Animate sentiment analysis demo
function animateSentimentAnalysis() {
    const analysisSteps = document.querySelectorAll('.analysis-step');
    const sentimentResults = document.querySelector('.sentiment-results');
    
    // Reset animation
    analysisSteps.forEach(step => step.classList.remove('active'));
    if (sentimentResults) sentimentResults.style.opacity = '0';
    
    // Animate steps sequentially
    analysisSteps.forEach((step, index) => {
        setTimeout(() => {
            step.classList.add('active');
            
            // Show results after all steps
            if (index === analysisSteps.length - 1) {
                setTimeout(() => {
                    if (sentimentResults) {
                        sentimentResults.style.opacity = '1';
                        sentimentResults.style.transition = 'opacity 0.5s ease';
                        
                        // Animate score bar
                        const scoreFill = document.querySelector('.score-fill');
                        if (scoreFill) {
                            scoreFill.style.width = '0%';
                            setTimeout(() => {
                                scoreFill.style.width = '84%';
                            }, 200);
                        }
                    }
                }, 500);
            }
        }, index * 800);
    });
}

// Animate summary demo
function animateSummaryDemo() {
    const aiArrow = document.querySelector('.ai-arrow');
    const processingAnimation = document.querySelector('.processing-animation');
    const aiSummary = document.querySelector('.ai-summary');
    
    // Reset animation
    if (aiSummary) aiSummary.style.opacity = '0';
    
    // Animate processing
    if (aiArrow) {
        aiArrow.style.animation = 'arrowPulse 0.5s ease-in-out infinite';
    }
    
    if (processingAnimation) {
        processingAnimation.style.animation = 'pulse 1s ease-in-out infinite';
    }
    
    // Show summary after processing
    setTimeout(() => {
        if (aiSummary) {
            aiSummary.style.opacity = '1';
            aiSummary.style.transition = 'opacity 0.8s ease';
            
            // Animate key points
            const points = aiSummary.querySelectorAll('.point');
            points.forEach((point, index) => {
                point.style.opacity = '0';
                setTimeout(() => {
                    point.style.opacity = '1';
                    point.style.transition = 'opacity 0.3s ease';
                }, index * 200);
            });
        }
    }, 2000);
}

// Animate trends demo
function animateTrendsDemo() {
    const trendItems = document.querySelectorAll('.trend-item');
    const aiPrediction = document.querySelector('.ai-prediction');
    
    // Reset animation
    trendItems.forEach(item => item.style.opacity = '0');
    if (aiPrediction) aiPrediction.style.opacity = '0';
    
    // Animate trend items
    trendItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.transform = 'translateY(0)';
            
            // Animate trend indicators
            const indicator = item.querySelector('.trend-indicator');
            if (indicator) {
                indicator.style.animation = 'trendBounce 2s ease-in-out infinite';
            }
        }, index * 300);
    });
    
    // Show AI prediction
    setTimeout(() => {
        if (aiPrediction) {
            aiPrediction.style.opacity = '1';
            aiPrediction.style.transition = 'opacity 0.8s ease';
        }
    }, trendItems.length * 300 + 500);
}

// Animate personalization demo
function animatePersonalizationDemo() {
    const profileTags = document.querySelectorAll('.interest-tag');
    const articleCards = document.querySelectorAll('.article-card');
    
    // Reset animation
    profileTags.forEach(tag => tag.style.opacity = '0');
    articleCards.forEach(card => card.style.opacity = '0');
    
    // Animate profile tags
    profileTags.forEach((tag, index) => {
        setTimeout(() => {
            tag.style.opacity = '1';
            tag.style.transition = 'opacity 0.3s ease';
        }, index * 150);
    });
    
    // Animate article cards
    articleCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.transform = 'translateY(0)';
            
            // Animate match score
            const matchScore = card.querySelector('.ai-match-score');
            if (matchScore) {
                matchScore.style.animation = 'pulse 2s ease-in-out infinite';
            }
        }, profileTags.length * 150 + index * 200);
    });
}

// Start demo updates (simulating real-time data)
function startDemoUpdates() {
    // Update processing count every 10 seconds
    setInterval(() => {
        const processingCount = document.querySelector('.processing-count');
        if (processingCount) {
            const currentCount = parseInt(processingCount.textContent.split(' ')[1].replace(',', ''));
            const newCount = currentCount + Math.floor(Math.random() * 50) + 10;
            processingCount.textContent = `Processing ${newCount.toLocaleString()} articles/hour`;
        }
    }, 10000);
    
    // Update trend statistics every 15 seconds
    setInterval(() => {
        const mentionCounts = document.querySelectorAll('.mention-count');
        mentionCounts.forEach(count => {
            const currentValue = parseInt(count.textContent.replace(/[+%]/g, ''));
            const newValue = currentValue + Math.floor(Math.random() * 20) - 10;
            const sign = newValue > 0 ? '+' : '';
            count.textContent = `${sign}${newValue}% mentions`;
        });
    }, 15000);
    
    // Update AI match scores
    setInterval(() => {
        const matchScores = document.querySelectorAll('.ai-match-score');
        matchScores.forEach(score => {
            const currentValue = parseInt(score.textContent.replace('% Match', ''));
            const newValue = Math.max(85, Math.min(99, currentValue + Math.floor(Math.random() * 6) - 3));
            score.textContent = `${newValue}% Match`;
        });
    }, 20000);
}

// Start AI News Trial
function startAINewsTrial() {
    // Show loading animation
    showNotification('🚀 Initializing AI News Trial...', 'info', 3000);
    
    setTimeout(() => {
        // Simulate trial activation
        const trialModal = document.createElement('div');
        trialModal.className = 'ai-trial-modal-overlay';
        trialModal.innerHTML = `
            <div class="ai-trial-modal">
                <div class="modal-header">
                    <div class="ai-avatar">🤖</div>
                    <h3>Welcome to Voice of Time AI</h3>
                    <button onclick="closeAITrialModal()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="trial-welcome">
                        <h4>🎉 Your Free AI Trial is Ready!</h4>
                        <p>Experience the power of AI-driven news intelligence with:</p>
                        <ul class="trial-features">
                            <li>✨ Real-time sentiment analysis</li>
                            <li>📝 Smart article summarization</li>
                            <li>📈 Trend detection & predictions</li>
                            <li>🎯 Personalized news curation</li>
                            <li>📊 Market impact analysis</li>
                        </ul>
                        <div class="trial-stats">
                            <div class="trial-stat">
                                <span class="stat-number">7</span>
                                <span class="stat-label">Days Free</span>
                            </div>
                            <div class="trial-stat">
                                <span class="stat-number">Unlimited</span>
                                <span class="stat-label">AI Analysis</span>
                            </div>
                            <div class="trial-stat">
                                <span class="stat-number">24/7</span>
                                <span class="stat-label">AI Support</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="trial-btn primary" onclick="activateAITrial()">
                        <i class="fas fa-rocket"></i> Activate AI Trial
                    </button>
                    <button class="trial-btn secondary" onclick="closeAITrialModal()">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(trialModal);
        
        // Add animation
        setTimeout(() => {
            trialModal.classList.add('active');
        }, 10);
        
    }, 2000);
}

// Request AI Demo
function requestAIDemo() {
    showNotification('📞 Scheduling AI Demo...', 'info', 3000);
    
    setTimeout(() => {
        const demoModal = document.createElement('div');
        demoModal.className = 'ai-demo-request-modal-overlay';
        demoModal.innerHTML = `
            <div class="ai-demo-request-modal">
                <div class="modal-header">
                    <div class="ai-avatar">🎯</div>
                    <h3>Schedule Your Live AI Demo</h3>
                    <button onclick="closeDemoRequestModal()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="demo-form">
                        <h4>Get a Personalized Demo</h4>
                        <p>See how Voice of Time AI can transform your news and business intelligence workflow</p>
                        
                        <div class="form-group">
                            <label>Your Name</label>
                            <input type="text" placeholder="Enter your name" class="demo-input">
                        </div>
                        
                        <div class="form-group">
                            <label>Business Email</label>
                            <input type="email" placeholder="your@company.com" class="demo-input">
                        </div>
                        
                        <div class="form-group">
                            <label>Company</label>
                            <input type="text" placeholder="Your company name" class="demo-input">
                        </div>
                        
                        <div class="form-group">
                            <label>Industry Focus</label>
                            <select class="demo-select">
                                <option>Technology</option>
                                <option>Finance</option>
                                <option>Healthcare</option>
                                <option>Media & Entertainment</option>
                                <option>Consulting</option>
                                <option>Other</option>
                            </select>
                        </div>
                        
                        <div class="demo-benefits">
                            <h5>What you'll see in the demo:</h5>
                            <div class="benefit-items">
                                <div class="benefit-item">🧠 Live AI sentiment analysis</div>
                                <div class="benefit-item">📊 Real-time market intelligence</div>
                                <div class="benefit-item">🎯 Custom personalization setup</div>
                                <div class="benefit-item">📈 Business impact projections</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="demo-request-btn primary" onclick="submitDemoRequest()">
                        <i class="fas fa-calendar"></i> Schedule Demo
                    </button>
                    <button class="demo-request-btn secondary" onclick="closeDemoRequestModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(demoModal);
        
        setTimeout(() => {
            demoModal.classList.add('active');
        }, 10);
        
    }, 2000);
}

// Activate AI Trial
function activateAITrial() {
    showNotification('🎉 AI Trial Activated! Redirecting to dashboard...', 'success', 5000);
    
    // Close modal
    closeAITrialModal();
    
    // Simulate redirect to AI dashboard
    setTimeout(() => {
        console.log('🚀 Redirecting to AI News Dashboard...');
        // In production, this would redirect to the actual AI dashboard
        alert('🤖 Welcome to Voice of Time AI!\\n\\nYour 7-day free trial is now active.\\n\\n✨ Features unlocked:\\n• Real-time AI analysis\\n• Smart summarization\\n• Trend predictions\\n• Personalized feeds\\n\\nCheck your email for setup instructions!');
    }, 2000);
}

// Submit Demo Request
function submitDemoRequest() {
    // Get form values (in production, you'd validate these)
    const inputs = document.querySelectorAll('.demo-input, .demo-select');
    const formData = {};
    
    inputs.forEach(input => {
        if (input.value.trim()) {
            formData[input.placeholder || input.name] = input.value;
        }
    });
    
    showNotification('📅 Demo request submitted! We\'ll contact you within 24 hours.', 'success', 5000);
    
    // Close modal
    closeDemoRequestModal();
    
    // Log demo request
    console.log('📊 Demo request submitted:', formData);
    
    setTimeout(() => {
        alert('🎯 Demo Request Confirmed!\\n\\nThank you for your interest in Voice of Time AI.\\n\\nWhat happens next:\\n• Our AI specialist will contact you within 24 hours\\n• We\'ll schedule a 30-minute personalized demo\\n• You\'ll see live AI analysis of your industry news\\n• Custom setup recommendations for your business\\n\\nContact: ai-demo@kaitech.com');
    }, 1000);
}

// Close AI Trial Modal
function closeAITrialModal() {
    const modal = document.querySelector('.ai-trial-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Close Demo Request Modal
function closeDemoRequestModal() {
    const modal = document.querySelector('.ai-demo-request-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Add some additional AI-powered notifications
function showAIInsightNotification() {
    const insights = [
        '🧠 AI detected: Technology stocks trending upward (+15% mentions)',
        '📈 AI Analysis: Climate tech emerging as major investment sector',
        '🎯 AI Insight: Your reading pattern suggests interest in quantum computing',
        '📊 AI Alert: Breaking news likely to impact your portfolio',
        '🔥 AI Trend: Space technology gaining momentum in headlines'
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    showNotification(randomInsight, 'info', 8000);
}

// Start showing periodic AI insights
setInterval(() => {
    if (Math.random() < 0.3) { // 30% chance every interval
        showAIInsightNotification();
    }
}, 45000); // Every 45 seconds

console.log('🤖 AI News Demo module loaded successfully');
