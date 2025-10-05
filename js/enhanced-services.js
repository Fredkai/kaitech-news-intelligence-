// Enhanced Services JavaScript - Cloud Services & Media Design
// Interactive functions for the redesigned sections

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Enhanced Services JavaScript loaded');
    initializeEnhancedServices();
});

function initializeEnhancedServices() {
    // Initialize service category switching
    initServiceCategorySwitching();
    
    // Initialize showcase switching for media section
    initShowcaseSwitching();
    
    // Initialize interactive elements
    initInteractiveElements();
    
    // Initialize animations
    initServicesAnimations();
}

// =============================================
// CLOUD SERVICES FUNCTIONS
// =============================================

// Switch between service categories (Infrastructure, Platform, Security, Analytics)
function switchServiceCategory(category) {
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Update active content
    document.querySelectorAll('.service-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${category}-services`).classList.add('active');
    
    console.log(`Switched to ${category} services`);
}

// Initialize service category switching
function initServiceCategorySwitching() {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            switchServiceCategory(category);
        });
    });
}

// Cloud service selection
function selectCloudService(service) {
    const services = {
        compute: {
            title: 'Compute Engine',
            description: 'High-performance virtual machines with auto-scaling capabilities',
            features: ['GPU Support', 'Auto-Scaling', 'Load Balancing'],
            pricing: 'Starting at $49/month',
            action: 'Get started with our compute engine and scale your applications instantly.'
        },
        storage: {
            title: 'Cloud Storage',
            description: 'Unlimited scalable storage with multi-region replication',
            features: ['256-bit Encryption', 'CDN Integration', 'Backup & Recovery'],
            pricing: 'Only $0.02/GB/month',
            action: 'Store your data securely with enterprise-grade cloud storage.'
        },
        networking: {
            title: 'Virtual Networking',
            description: 'Private networks with advanced traffic management',
            features: ['VPN Gateway', 'Firewall Protection', 'DDoS Mitigation'],
            pricing: 'Starting at $29/month',
            action: 'Build secure, scalable network infrastructure for your applications.'
        },
        devops: {
            title: 'DevOps Platform',
            description: 'Complete CI/CD pipeline with automated testing and deployment',
            features: ['Git Integration', 'Docker Support', 'Kubernetes Orchestration'],
            pricing: 'Starting at $99/month',
            action: 'Accelerate your development workflow with our DevOps platform.'
        },
        serverless: {
            title: 'Serverless Computing',
            description: 'Run code without managing servers - pay only for execution time',
            features: ['Auto-Scaling', 'Event-Driven Architecture', 'Multi-Language Support'],
            pricing: 'Pay-per-use pricing',
            action: 'Deploy functions instantly without server management overhead.'
        },
        api: {
            title: 'API Management',
            description: 'Design, deploy, and manage APIs with advanced analytics',
            features: ['Rate Limiting', 'Authentication', 'Real-time Analytics'],
            pricing: 'Starting at $79/month',
            action: 'Build and manage robust APIs with enterprise-grade security.'
        },
        security: {
            title: 'Security Center',
            description: 'Advanced threat detection and security monitoring platform',
            features: ['AI-Powered Detection', '24/7 Monitoring', 'Compliance Reports'],
            pricing: 'Starting at $199/month',
            action: 'Protect your infrastructure with advanced security monitoring.'
        },
        identity: {
            title: 'Identity & Access Management',
            description: 'Centralized identity management with single sign-on',
            features: ['Single Sign-On', 'Multi-Factor Authentication', 'Directory Sync'],
            pricing: '$5/user/month',
            action: 'Secure user access with enterprise identity management.'
        },
        compliance: {
            title: 'Compliance Suite',
            description: 'Automated compliance monitoring for GDPR, SOC 2, and more',
            features: ['GDPR Compliance', 'SOC 2 Certification', 'ISO 27001'],
            pricing: 'Starting at $149/month',
            action: 'Ensure regulatory compliance with automated monitoring.'
        },
        ai: {
            title: 'AI & Machine Learning',
            description: 'Pre-trained models and custom ML pipelines for your business',
            features: ['AutoML Platform', 'GPU Training', 'Model Deployment'],
            pricing: 'Starting at $299/month',
            action: 'Build intelligent applications with our ML platform.'
        },
        bi: {
            title: 'Business Intelligence',
            description: 'Advanced analytics and visualization for data-driven decisions',
            features: ['Real-time Analytics', 'Interactive Dashboards', 'Custom Reports'],
            pricing: 'Starting at $129/month',
            action: 'Turn your data into actionable business insights.'
        },
        pipeline: {
            title: 'Data Pipeline',
            description: 'Real-time data processing and ETL workflows at scale',
            features: ['Stream Processing', 'ETL Tools', 'Data Lake Integration'],
            pricing: 'Starting at $89/month',
            action: 'Process and analyze data streams in real-time.'
        }
    };
    
    const selectedService = services[service];
    if (selectedService) {
        showServiceModal(selectedService);
    }
}

// Show service details modal
function showServiceModal(service) {
    const modal = document.createElement('div');
    modal.className = 'service-modal-overlay';
    modal.innerHTML = `
        <div class="service-modal">
            <div class="service-modal-header">
                <h3>${service.title}</h3>
                <button class="close-modal" onclick="closeServiceModal()">&times;</button>
            </div>
            <div class="service-modal-body">
                <p class="service-description">${service.description}</p>
                <div class="service-features-list">
                    <h4>Key Features:</h4>
                    <ul>
                        ${service.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
                <div class="service-pricing-info">
                    <h4>Pricing:</h4>
                    <p class="pricing-text">${service.pricing}</p>
                </div>
                <div class="service-action">
                    <p>${service.action}</p>
                </div>
            </div>
            <div class="service-modal-footer">
                <button class="btn-primary" onclick="startServiceTrial()">
                    <i class="fas fa-rocket"></i> Start Free Trial
                </button>
                <button class="btn-secondary" onclick="contactCloudSales()">
                    <i class="fas fa-phone"></i> Contact Sales
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Close service modal
function closeServiceModal() {
    const modal = document.querySelector('.service-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Pricing plan selection
function selectPricingPlan(plan) {
    const plans = {
        startup: {
            name: 'Startup Plan',
            price: '$99/month',
            features: ['2 CPU Cores', '8GB RAM', '100GB Storage', 'Basic Support', '99.5% SLA'],
            action: 'Perfect for small teams getting started with cloud infrastructure.'
        },
        professional: {
            name: 'Professional Plan',
            price: '$299/month',
            features: ['8 CPU Cores', '32GB RAM', '500GB Storage', 'Priority Support', '99.9% SLA', 'Auto-scaling'],
            action: 'Ideal for growing businesses with scaling requirements.'
        },
        enterprise: {
            name: 'Enterprise Plan',
            price: '$999/month',
            features: ['Unlimited Resources', '24/7 Dedicated Support', '99.99% SLA', 'Custom Solutions', 'Compliance Included'],
            action: 'For large-scale operations requiring maximum performance and support.'
        }
    };
    
    const selectedPlan = plans[plan];
    if (selectedPlan) {
        if (plan === 'enterprise') {
            contactCloudSales();
        } else {
            showPricingModal(selectedPlan);
        }
    }
}

// Show pricing modal
function showPricingModal(plan) {
    const modal = document.createElement('div');
    modal.className = 'pricing-modal-overlay';
    modal.innerHTML = `
        <div class="pricing-modal">
            <div class="pricing-modal-header">
                <h3>${plan.name}</h3>
                <button class="close-modal" onclick="closePricingModal()">&times;</button>
            </div>
            <div class="pricing-modal-body">
                <div class="plan-price-large">${plan.price}</div>
                <p class="plan-action">${plan.action}</p>
                <div class="plan-features-detailed">
                    <h4>What's Included:</h4>
                    <ul>
                        ${plan.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="pricing-modal-footer">
                <button class="btn-primary" onclick="startCloudTrial()">
                    <i class="fas fa-play"></i> Start 30-Day Free Trial
                </button>
                <button class="btn-secondary" onclick="scheduleCloudDemo()">
                    <i class="fas fa-calendar"></i> Schedule Demo
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Close pricing modal
function closePricingModal() {
    const modal = document.querySelector('.pricing-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Cloud consultation
function openCloudConsultation() {
    showNotification('📞 Redirecting to cloud consultation booking...', 'info');
    setTimeout(() => {
        alert('🚀 Cloud Consultation\n\nThank you for your interest! Our cloud experts will contact you within 24 hours to discuss your specific needs and design a customized solution.\n\nWhat to expect:\n• Free 30-minute consultation\n• Custom solution architecture\n• Pricing recommendations\n• Migration planning\n\nContact: cloud@kaitech.com\nPhone: +1 (555) 123-CLOUD');
    }, 500);
}

// Download cloud guide
function downloadCloudGuide() {
    showNotification('📥 Preparing cloud migration guide...', 'info');
    setTimeout(() => {
        alert('📚 Cloud Migration Guide\n\nYour comprehensive cloud migration guide includes:\n\n• Pre-migration checklist\n• Cost optimization strategies\n• Security best practices\n• Performance benchmarking\n• Step-by-step migration process\n\nThe guide has been sent to your email address. Check your inbox for the download link!\n\nFor additional support, contact: cloud@kaitech.com');
    }, 1000);
}

// =============================================
// MEDIA & DESIGN FUNCTIONS
// =============================================

// Switch between showcase categories (Branding, Web, Video, Print)
function switchShowcase(showcase) {
    // Update active tab
    document.querySelectorAll('.showcase-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-showcase="${showcase}"]`).classList.add('active');
    
    // Update active content
    document.querySelectorAll('.showcase-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${showcase}-showcase`).classList.add('active');
    
    console.log(`Switched to ${showcase} showcase`);
}

// Initialize showcase switching
function initShowcaseSwitching() {
    document.querySelectorAll('.showcase-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const showcase = this.dataset.showcase;
            switchShowcase(showcase);
        });
    });
}

// View portfolio item
function viewPortfolioItem(item) {
    const portfolioItems = {
        'tech-startup': {
            title: 'TechFlow Startup - Brand Identity',
            category: 'Branding',
            description: 'Complete brand identity system for an innovative technology startup, including logo design, color palette, typography, and brand guidelines.',
            services: ['Logo Design', 'Brand Guidelines', 'Business Stationery', 'Digital Assets'],
            client: 'TechFlow Inc.',
            duration: '3 weeks',
            year: '2024'
        },
        'restaurant-brand': {
            title: 'Gourmet Bistro - Premium Restaurant Branding',
            category: 'Branding',
            description: 'Elegant brand identity for a high-end restaurant, featuring sophisticated logo, menu design, and complete restaurant collateral.',
            services: ['Logo & Identity', 'Menu Design', 'Interior Signage', 'Website Design'],
            client: 'Gourmet Bistro',
            duration: '4 weeks',
            year: '2024'
        },
        'fitness-brand': {
            title: 'FitLife Gym - Dynamic Fitness Brand',
            category: 'Branding',
            description: 'Energetic brand identity for a modern fitness center, including mobile app design and merchandise branding.',
            services: ['Brand Identity', 'Mobile App Design', 'Merchandise Design', 'Marketing Materials'],
            client: 'FitLife Gym',
            duration: '5 weeks',
            year: '2023'
        },
        'fintech-brand': {
            title: 'CryptoVault Pro - Premium Fintech Platform',
            category: 'Branding',
            description: 'Cutting-edge brand identity for a premium cryptocurrency trading platform, featuring secure, modern design elements and comprehensive digital assets.',
            services: ['Fintech Branding', 'Mobile App Design', 'Security Interface', 'Trading Dashboard', 'Marketing Assets'],
            client: 'CryptoVault Pro',
            duration: '8 weeks',
            year: '2024'
        },
        'ecommerce-site': {
            title: 'Luxury Fashion Store - E-commerce Platform',
            category: 'Web Design',
            description: 'High-end e-commerce website for luxury fashion retailer with advanced filtering and seamless checkout experience.',
            services: ['E-commerce Development', 'UI/UX Design', 'Payment Integration', 'Mobile Optimization'],
            client: 'Luxe Fashion House',
            duration: '8 weeks',
            year: '2024'
        },
        'saas-platform': {
            title: 'Analytics Platform - SaaS Dashboard',
            category: 'Web Design',
            description: 'Comprehensive dashboard interface for business analytics SaaS platform with complex data visualization.',
            services: ['Dashboard Design', 'Data Visualization', 'User Experience', 'Frontend Development'],
            client: 'DataInsight Pro',
            duration: '10 weeks',
            year: '2024'
        },
        'mobile-app': {
            title: 'Health & Fitness App - Mobile Interface',
            category: 'Web Design',
            description: 'Intuitive mobile app design for health tracking with personalized workouts and nutrition planning.',
            services: ['Mobile UI/UX', 'Prototype Design', 'User Testing', 'App Store Assets'],
            client: 'HealthTrack App',
            duration: '6 weeks',
            year: '2023'
        },
        'corporate-site': {
            title: 'Corporate Website - Professional Business Presence',
            category: 'Web Design',
            description: 'Professional corporate website with content management system and SEO optimization.',
            services: ['Corporate Design', 'CMS Development', 'SEO Optimization', 'Content Strategy'],
            client: 'GlobalTech Corp',
            duration: '7 weeks',
            year: '2024'
        }
    };
    
    const portfolio = portfolioItems[item];
    if (portfolio) {
        showPortfolioModal(portfolio);
    }
}

// Show portfolio modal
function showPortfolioModal(portfolio) {
    const modal = document.createElement('div');
    modal.className = 'portfolio-modal-overlay';
    modal.innerHTML = `
        <div class="portfolio-modal">
            <div class="portfolio-modal-header">
                <h3>${portfolio.title}</h3>
                <span class="portfolio-category">${portfolio.category}</span>
                <button class="close-modal" onclick="closePortfolioModal()">&times;</button>
            </div>
            <div class="portfolio-modal-body">
                <p class="portfolio-description">${portfolio.description}</p>
                <div class="portfolio-details">
                    <div class="detail-item">
                        <h4>Services Provided:</h4>
                        <ul class="services-list">
                            ${portfolio.services.map(service => `<li><i class="fas fa-check"></i> ${service}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="portfolio-meta">
                        <div class="meta-item">
                            <strong>Client:</strong> ${portfolio.client}
                        </div>
                        <div class="meta-item">
                            <strong>Duration:</strong> ${portfolio.duration}
                        </div>
                        <div class="meta-item">
                            <strong>Year:</strong> ${portfolio.year}
                        </div>
                    </div>
                </div>
            </div>
            <div class="portfolio-modal-footer">
                <button class="btn-primary" onclick="requestSimilarProject()">
                    <i class="fas fa-handshake"></i> Request Similar Project
                </button>
                <button class="btn-secondary" onclick="viewFullPortfolio()">
                    <i class="fas fa-images"></i> View Full Portfolio
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Close portfolio modal
function closePortfolioModal() {
    const modal = document.querySelector('.portfolio-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Play video demo
function playVideoDemo(video) {
    const videos = {
        'corporate-video': {
            title: 'Corporate Brand Video',
            description: 'Professional corporate video showcasing company values and services with premium production quality.',
            duration: '2:30',
            resolution: '4K Ultra HD'
        },
        'product-launch': {
            title: 'Product Launch Video',
            description: 'Dynamic product launch video with motion graphics and compelling storytelling to drive engagement.',
            duration: '1:45',
            resolution: '4K with Motion Graphics'
        },
        'social-campaign': {
            title: 'Social Media Campaign',
            description: 'Short-form video content optimized for social media platforms with high engagement potential.',
            duration: '0:30',
            resolution: 'Instagram Stories Format'
        },
        'testimonial-video': {
            title: 'Client Testimonials',
            description: 'Professional interview-style testimonial videos that build trust and credibility.',
            duration: '3:20',
            resolution: 'Interview Style HD'
        }
    };
    
    const videoInfo = videos[video];
    if (videoInfo) {
        showVideoModal(videoInfo);
    }
}

// Show video modal
function showVideoModal(video) {
    const modal = document.createElement('div');
    modal.className = 'video-modal-overlay';
    modal.innerHTML = `
        <div class="video-modal">
            <div class="video-modal-header">
                <h3>${video.title}</h3>
                <button class="close-modal" onclick="closeVideoModal()">&times;</button>
            </div>
            <div class="video-modal-body">
                <div class="video-player-placeholder">
                    <div class="video-placeholder-content">
                        <i class="fas fa-play-circle"></i>
                        <h4>Video Preview</h4>
                        <p>${video.description}</p>
                        <div class="video-specs">
                            <span><i class="fas fa-clock"></i> Duration: ${video.duration}</span>
                            <span><i class="fas fa-video"></i> Quality: ${video.resolution}</span>
                        </div>
                    </div>
                </div>
                <div class="video-info-section">
                    <h4>Video Production Services:</h4>
                    <ul>
                        <li><i class="fas fa-camera"></i> Professional filming</li>
                        <li><i class="fas fa-cut"></i> Expert video editing</li>
                        <li><i class="fas fa-magic"></i> Motion graphics & effects</li>
                        <li><i class="fas fa-music"></i> Sound design & mixing</li>
                        <li><i class="fas fa-palette"></i> Color grading</li>
                    </ul>
                </div>
            </div>
            <div class="video-modal-footer">
                <button class="btn-primary" onclick="requestVideoProduction()">
                    <i class="fas fa-video"></i> Request Video Production
                </button>
                <button class="btn-secondary" onclick="viewVideoPortfolio()">
                    <i class="fas fa-film"></i> View Video Portfolio
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Close video modal
function closeVideoModal() {
    const modal = document.querySelector('.video-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Design package selection
function selectDesignPackage(packageType) {
    const packages = {
        starter: {
            name: 'Starter Package',
            price: '$499',
            description: 'Perfect for small businesses and startups looking to establish their brand identity.',
            features: ['Logo Design', 'Business Card Design', 'Basic Brand Guidelines', '3 Revisions', '5 Business Days'],
            includes: ['High-resolution logo files', 'Business card print-ready files', 'Basic brand color palette', 'Font recommendations']
        },
        professional: {
            name: 'Professional Package',
            price: '$1,299',
            description: 'Complete brand identity solution for growing businesses.',
            features: ['Complete Brand Identity', 'Website Design (5 Pages)', 'Marketing Materials', 'Social Media Kit', 'Unlimited Revisions', '10 Business Days'],
            includes: ['Full brand identity system', 'Responsive website design', 'Business stationery suite', 'Social media templates', 'Brand guidelines document']
        },
        enterprise: {
            name: 'Enterprise Package',
            price: '$2,999',
            description: 'Premium comprehensive solution for large businesses.',
            features: ['Full Brand System', 'Website + E-commerce', 'Video Production', 'Photography Shoot', 'Marketing Campaign', 'Dedicated Designer', 'Priority Support'],
            includes: ['Complete brand ecosystem', 'E-commerce website', 'Professional video content', 'Photography assets', 'Multi-channel marketing', 'Ongoing support']
        }
    };
    
    const selectedPackage = packages[packageType];
    if (selectedPackage) {
        if (packageType === 'enterprise') {
            contactDesignTeam();
        } else {
            showPackageModal(selectedPackage);
        }
    }
}

// Show package modal
function showPackageModal(packageInfo) {
    const modal = document.createElement('div');
    modal.className = 'package-modal-overlay';
    modal.innerHTML = `
        <div class="package-modal">
            <div class="package-modal-header">
                <h3>${packageInfo.name}</h3>
                <div class="package-price-large">${packageInfo.price}</div>
                <button class="close-modal" onclick="closePackageModal()">&times;</button>
            </div>
            <div class="package-modal-body">
                <p class="package-description">${packageInfo.description}</p>
                <div class="package-details">
                    <div class="features-section">
                        <h4>Package Features:</h4>
                        <ul>
                            ${packageInfo.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="includes-section">
                        <h4>What's Included:</h4>
                        <ul>
                            ${packageInfo.includes.map(include => `<li><i class="fas fa-star"></i> ${include}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="package-modal-footer">
                <button class="btn-primary" onclick="startDesignProject()">
                    <i class="fas fa-rocket"></i> Start Project
                </button>
                <button class="btn-secondary" onclick="scheduleDesignConsultation()">
                    <i class="fas fa-calendar"></i> Schedule Consultation
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Close package modal
function closePackageModal() {
    const modal = document.querySelector('.package-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Design consultation
function openDesignConsultation() {
    showNotification('🎨 Opening design consultation...', 'info');
    setTimeout(() => {
        alert('🎨 Free Design Consultation\n\nThank you for your interest in our design services!\n\nWhat you'll get:\n• 30-minute creative consultation\n• Project scope discussion\n• Custom design recommendations\n• Portfolio review\n• Pricing estimate\n\nOur design team will contact you within 24 hours to schedule your consultation.\n\nContact: design@kaitech.com\nPhone: +1 (555) DESIGN-1');
    }, 500);
}

// View full portfolio
function viewFullPortfolio() {
    showNotification('📁 Loading complete portfolio...', 'info');
    setTimeout(() => {
        alert('🎨 Complete Design Portfolio\n\nExplore our full portfolio featuring:\n\n• 500+ completed projects\n• Brand identity designs\n• Website & app interfaces\n• Video production work\n• Print & digital materials\n• Client testimonials\n\nPortfolio categories:\n• Technology & SaaS\n• Healthcare & Medical\n• Retail & E-commerce\n• Restaurant & Hospitality\n• Non-profit & Education\n\nVisit: portfolio.kaitech.com\nOr contact us for a personalized portfolio presentation.');
    }, 1000);
}

// =============================================
// SHARED UTILITY FUNCTIONS
// =============================================

// Start service trial
function startServiceTrial() {
    showNotification('🚀 Starting free trial...', 'info');
    setTimeout(() => {
        alert('🚀 Free Trial Started!\n\nYour 30-day free trial is now active!\n\nWhat happens next:\n• Instant access to all features\n• No credit card required\n• Full support included\n• Migration assistance available\n\nAccess your dashboard: dashboard.kaitech.com\nSupport: support@kaitech.com');
    }, 1000);
}

// Contact cloud sales
function contactCloudSales() {
    showNotification('📞 Connecting to cloud sales...', 'info');
    setTimeout(() => {
        alert('☁️ Cloud Sales Team\n\nOur enterprise sales team will help you:\n\n• Custom solution design\n• Volume pricing discounts\n• Migration planning\n• Compliance requirements\n• 24/7 support setup\n\nContact Methods:\n📧 Enterprise: enterprise@kaitech.com\n📞 Direct: +1 (555) 123-CLOUD\n💬 Live Chat: Available now\n📅 Schedule Call: calendly.com/kaitech-cloud');
    }, 500);
}

// Start cloud trial
function startCloudTrial() {
    showNotification('☁️ Activating cloud trial...', 'info');
    setTimeout(() => {
        alert('☁️ 30-Day Cloud Trial Activated!\n\nYour free trial includes:\n• Full platform access\n• $200 usage credits\n• Premium support\n• Migration assistance\n\nGet started:\n1. Check your email for login details\n2. Access dashboard.kaitech.com\n3. Follow the quick start guide\n\nNeed help? Our support team is standing by 24/7.');
    }, 1000);
}

// Schedule cloud demo
function scheduleCloudDemo() {
    showNotification('📅 Scheduling demo...', 'info');
    setTimeout(() => {
        alert('📅 Schedule Your Cloud Demo\n\nPersonalized demo includes:\n• Live platform walkthrough\n• Use case discussion\n• Q&A with cloud architects\n• Custom pricing quote\n\nAvailable time slots:\n• Weekdays: 9 AM - 6 PM EST\n• Duration: 30-45 minutes\n• Format: Video call or phone\n\nSchedule now: calendly.com/kaitech-demo\nOr call: +1 (555) 123-CLOUD');
    }, 500);
}

// Request similar project
function requestSimilarProject() {
    showNotification('🎨 Preparing project request...', 'info');
    setTimeout(() => {
        alert('🎨 Request Similar Project\n\nInterested in a similar design project?\n\nOur process:\n1. Project consultation call\n2. Scope & timeline discussion\n3. Custom proposal creation\n4. Contract & kick-off\n\nProject timeline: 2-8 weeks\nInvestment: Starting at $499\n\nNext steps:\n📞 Schedule consultation\n📧 Email: design@kaitech.com\n💬 Live chat available now');
    }, 500);
}

// Request video production
function requestVideoProduction() {
    showNotification('🎬 Processing video request...', 'info');
    setTimeout(() => {
        alert('🎬 Video Production Request\n\nProfessional video services:\n• Corporate videos\n• Product launches\n• Social media content\n• Training videos\n• Event coverage\n\nProduction includes:\n• Pre-production planning\n• Professional filming\n• Post-production editing\n• Revisions & final delivery\n\nTimeline: 2-6 weeks\nInvestment: Starting at $2,999\n\nContact: video@kaitech.com');
    }, 500);
}

// View video portfolio
function viewVideoPortfolio() {
    showNotification('🎬 Loading video portfolio...', 'info');
    setTimeout(() => {
        alert('🎬 Video Production Portfolio\n\nWatch our latest work:\n\n• Corporate brand videos\n• Product demonstration videos\n• Social media campaigns\n• Client testimonials\n• Animation & motion graphics\n\nPortfolio highlights:\n• 200+ video projects\n• Award-winning content\n• Fortune 500 clients\n• 4.9/5 client satisfaction\n\nView portfolio: video.kaitech.com\nDemo reel: Available upon request');
    }, 1000);
}

// Start design project
function startDesignProject() {
    showNotification('🚀 Initiating design project...', 'info');
    setTimeout(() => {
        alert('🚀 Start Design Project\n\nReady to begin your design project!\n\nNext steps:\n1. Project brief questionnaire\n2. Initial consultation call\n3. Proposal & timeline\n4. Contract & 50% deposit\n5. Project kick-off\n\nPayment options:\n• Credit/debit cards\n• Bank transfer\n• Monthly payment plans\n\nGet started: projects@kaitech.com\nQuestions: +1 (555) DESIGN-1');
    }, 500);
}

// Schedule design consultation
function scheduleDesignConsultation() {
    showNotification('📅 Booking design consultation...', 'info');
    setTimeout(() => {
        alert('📅 Schedule Design Consultation\n\nFree 30-minute consultation includes:\n\n• Project scope discussion\n• Creative direction review\n• Timeline & budget planning\n• Portfolio recommendations\n• Next steps outline\n\nAvailable slots:\n• Weekdays: 9 AM - 6 PM EST\n• Weekends: 10 AM - 4 PM EST\n• Virtual or phone meetings\n\nBook now: calendly.com/kaitech-design\nContact: design@kaitech.com');
    }, 500);
}

// Contact design team
function contactDesignTeam() {
    showNotification('🎨 Connecting to design team...', 'info');
    setTimeout(() => {
        alert('🎨 Enterprise Design Team\n\nFor large-scale design projects:\n\n• Dedicated design team\n• Project manager assigned\n• Custom pricing & terms\n• Priority timeline\n• White-glove service\n\nEnterprise services:\n• Brand system development\n• Multi-channel campaigns\n• Ongoing design support\n• Team training & guidelines\n\nContact:\n📧 enterprise@kaitech.com\n📞 +1 (555) DESIGN-PRO\n💬 Live chat available 24/7');
    }, 500);
}

// Initialize interactive elements
function initInteractiveElements() {
    // Add hover effects for service cards
    document.querySelectorAll('.service-card, .pricing-card, .package-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects for buttons
    document.querySelectorAll('.service-btn, .plan-btn, .package-btn, .contact-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Initialize animations
function initServicesAnimations() {
    // Animate elements on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe service cards, stats, and other elements
    document.querySelectorAll('.service-card, .cloud-stat-card, .creative-stat-card, .portfolio-item, .process-step').forEach(el => {
        observer.observe(el);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, 5000);
}

// Close notification
function closeNotification(closeBtn) {
    const notification = closeBtn.closest('.notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Add CSS for modals and notifications
function injectModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Modal Styles */
        .service-modal-overlay,
        .pricing-modal-overlay,
        .portfolio-modal-overlay,
        .video-modal-overlay,
        .package-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .service-modal-overlay.active,
        .pricing-modal-overlay.active,
        .portfolio-modal-overlay.active,
        .video-modal-overlay.active,
        .package-modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .service-modal,
        .pricing-modal,
        .portfolio-modal,
        .video-modal,
        .package-modal {
            background: white;
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.9) translateY(50px);
            transition: all 0.3s ease;
        }
        
        .service-modal-overlay.active .service-modal,
        .pricing-modal-overlay.active .pricing-modal,
        .portfolio-modal-overlay.active .portfolio-modal,
        .video-modal-overlay.active .video-modal,
        .package-modal-overlay.active .package-modal {
            transform: scale(1) translateY(0);
        }
        
        .service-modal-header,
        .pricing-modal-header,
        .portfolio-modal-header,
        .video-modal-header,
        .package-modal-header {
            padding: 2rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .service-modal-body,
        .pricing-modal-body,
        .portfolio-modal-body,
        .video-modal-body,
        .package-modal-body {
            padding: 2rem;
        }
        
        .service-modal-footer,
        .pricing-modal-footer,
        .portfolio-modal-footer,
        .video-modal-footer,
        .package-modal-footer {
            padding: 2rem;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #64748b;
            transition: color 0.3s ease;
        }
        
        .close-modal:hover {
            color: #ef4444;
        }
        
        .btn-primary,
        .btn-secondary {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border: none;
            text-decoration: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
        }
        
        .btn-primary:hover {
            background: linear-gradient(135deg, #1d4ed8, #1e40af);
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: white;
            color: #3b82f6;
            border: 1px solid #3b82f6;
        }
        
        .btn-secondary:hover {
            background: #3b82f6;
            color: white;
            transform: translateY(-2px);
        }
        
        /* Notification Styles */
        .notification {
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            transform: translateX(100%);
            transition: all 0.3s ease;
            border-left: 4px solid #3b82f6;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-content {
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #64748b;
        }
        
        .notification-close:hover {
            color: #ef4444;
        }
        
        /* Ripple Animation */
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        /* Video Player Placeholder */
        .video-player-placeholder {
            background: linear-gradient(135deg, #1e293b, #475569);
            border-radius: 12px;
            padding: 3rem;
            text-align: center;
            margin-bottom: 2rem;
            color: white;
        }
        
        .video-placeholder-content i {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.8;
        }
        
        .video-specs {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1rem;
        }
        
        .video-specs span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
}

// Initialize modal styles
document.addEventListener('DOMContentLoaded', function() {
    injectModalStyles();
});

// Export functions for global use
window.switchServiceCategory = switchServiceCategory;
window.selectCloudService = selectCloudService;
window.selectPricingPlan = selectPricingPlan;
window.openCloudConsultation = openCloudConsultation;
window.downloadCloudGuide = downloadCloudGuide;
window.switchShowcase = switchShowcase;
window.viewPortfolioItem = viewPortfolioItem;
window.playVideoDemo = playVideoDemo;
window.selectDesignPackage = selectDesignPackage;
window.openDesignConsultation = openDesignConsultation;
window.viewFullPortfolio = viewFullPortfolio;

console.log('✅ Enhanced Services JavaScript ready!');
