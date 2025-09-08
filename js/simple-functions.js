// Simple functions to make Cloud Computing and Media & Design sections work
// Only the essential functionality requested

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 KaiTech simple functions loaded');
    setupBasicNavigation();
});

function setupBasicNavigation() {
    // Main navigation smooth scrolling
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
    
    // Hero buttons
    const heroButtons = document.querySelectorAll('.cta-button');
    heroButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('primary')) {
                scrollToSection('news');
            } else if (this.classList.contains('secondary')) {
                scrollToSection('cloud');
            } else if (this.classList.contains('tertiary')) {
                scrollToSection('media');
            }
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        console.log(`📍 Navigated to: ${sectionId}`);
    }
}

// Cloud Computing Functions
function openCloudService(service) {
    const services = {
        'infrastructure': {
            title: 'Cloud Infrastructure',
            content: 'Scalable computing resources with 99.9% uptime guarantee. Features include auto-scaling, load balancing, and global deployment.'
        },
        'platform': {
            title: 'Platform Services', 
            content: 'Complete development and deployment platform with CI/CD, containerization, and managed databases.'
        },
        'security': {
            title: 'Enterprise Security',
            content: 'Advanced security features including encryption, access control, compliance monitoring, and threat detection.'
        }
    };
    
    const serviceInfo = services[service];
    if (serviceInfo) {
        alert(`☁️ ${serviceInfo.title}\n\n${serviceInfo.content}\n\nContact us for detailed pricing and implementation.`);
        console.log(`☁️ Opened cloud service: ${service}`);
    }
}

// Media & Design Functions  
function showMediaPortfolio(category) {
    const portfolios = {
        'graphic': {
            title: 'Graphic Design Portfolio',
            content: 'Professional logos, branding materials, business cards, brochures, and marketing collateral for diverse clients across industries.'
        },
        'video': {
            title: 'Video Production Portfolio',
            content: 'Corporate videos, promotional content, animations, training materials, and social media videos with professional editing and motion graphics.'
        },
        'web': {
            title: 'Web Design Portfolio', 
            content: 'Modern, responsive websites, e-commerce platforms, landing pages, and web applications with optimal user experience and SEO optimization.'
        }
    };
    
    const portfolio = portfolios[category];
    if (portfolio) {
        alert(`🎨 ${portfolio.title}\n\n${portfolio.content}\n\nView our full portfolio and request a quote today!`);
        console.log(`🎨 Showed portfolio: ${category}`);
    }
}

// News Tab Functions (keeping existing functionality)
function launchWorldHeadlines() {
    scrollToSection('news');
    console.log('🌍 Launched World Headlines');
}

function launchCloudServices() {
    scrollToSection('cloud');
    console.log('☁️ Launched Cloud Services');
}

function launchMediaDesign() {
    scrollToSection('media');
    console.log('🎨 Launched Media Design');
}

// Export functions for onclick handlers
window.openCloudService = openCloudService;
window.showMediaPortfolio = showMediaPortfolio;
window.launchWorldHeadlines = launchWorldHeadlines;
window.launchCloudServices = launchCloudServices;
window.launchMediaDesign = launchMediaDesign;

console.log('✅ Simple functions ready - Cloud & Media buttons will work!');
