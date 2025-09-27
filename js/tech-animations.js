// Advanced Tech Animations and Interactive Features for KaiTech

class TechAnimationSystem {
    constructor() {
        this.particles = [];
        this.particleCount = 50;
        this.isLoaded = false;
        this.typingSpeed = 80;
        this.statsAnimated = false;
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupParticleSystem();
            this.setupScrollEffects();
            this.setupNavigationEffects();
            this.setupTypingAnimation();
            this.setupStatsAnimation();
            this.setupHeroAnimations();
            this.setupNewsCardInteractions();
            this.setupIntersectionObserver();
            this.isLoaded = true;
        });
    }

    // Dynamic Particle System
    setupParticleSystem() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 4 + 2;
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 20 + 10;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            particlesContainer.appendChild(particle);
            this.particles.push({
                element: particle,
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: size
            });
        }

        // Animate particles
        this.animateParticles();
    }

    animateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary collision
            if (particle.x <= 0 || particle.x >= window.innerWidth) particle.vx *= -1;
            if (particle.y <= 0 || particle.y >= window.innerHeight) particle.vy *= -1;
            
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
        });
        
        requestAnimationFrame(() => this.animateParticles());
    }

    // Scroll-based Effects
    setupScrollEffects() {
        const header = document.getElementById('mainHeader');
        const scrollProgress = document.querySelector('.scroll-progress');
        
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.pageYOffset;
                    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const scrollPercent = (scrollY / windowHeight) * 100;
                    
                    // Header scroll effect
                    if (header) {
                        if (scrollY > 100) {
                            header.classList.add('scrolled');
                        } else {
                            header.classList.remove('scrolled');
                        }
                    }
                    
                    // Scroll progress bar
                    if (scrollProgress) {
                        scrollProgress.style.transform = `scaleX(${scrollPercent / 100})`;
                    }
                    
                    // Parallax effects for floating cards
                    this.updateParallaxElements(scrollY);
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateParallaxElements(scrollY) {
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach((card, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = scrollY * speed;
            card.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }

    // Enhanced Navigation Effects
    setupNavigationEffects() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(e.target, e);
            });
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    this.smoothScrollTo(target);
                }
            });
        });
    }

    createRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: -1;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    smoothScrollTo(target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 100;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;
        
        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuart(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };
        
        requestAnimationFrame(animation);
    }

    easeInOutQuart(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    }

    // Typing Animation
    setupTypingAnimation() {
        const typingElement = document.getElementById('typingText');
        if (!typingElement) return;
        
        const texts = [
            '🚀 Next-Generation AI Intelligence Platform',
            '⚡ Real-Time Global News Analysis Engine',
            '🌐 Advanced Cloud Computing & Data Solutions', 
            '🎯 Precision Media & Creative Technology',
            '🔥 Voice of Time - Shaping Tomorrow Today',
            '💎 Where Innovation Transforms Reality',
            '🛡️ Enterprise-Grade Security & Analytics',
            '⭐ Your Gateway to Intelligent Insights'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const typeText = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 40 : this.typingSpeed;
            
            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 3000; // Longer pause to read
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 800; // Smooth transition pause
            }
            
            setTimeout(typeText, typeSpeed);
        };
        
        typeText();
    }

    // Animated Statistics Counter
    setupStatsAnimation() {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.statsAnimated) {
                    this.animateStats();
                    this.statsAnimated = true;
                }
            });
        }, observerOptions);
        
        const statsSection = document.querySelector('.hero-stats');
        if (statsSection) observer.observe(statsSection);
    }

    animateStats() {
        const stats = [
            { element: document.getElementById('storiesAnalyzed'), target: 24567, duration: 2000 },
            { element: document.getElementById('countriesCovered'), target: 195, duration: 1500 }
        ];
        
        stats.forEach(stat => {
            if (!stat.element) return;
            
            let start = 0;
            const increment = stat.target / (stat.duration / 16);
            
            const counter = () => {
                start += increment;
                if (start < stat.target) {
                    stat.element.textContent = Math.floor(start).toLocaleString();
                    requestAnimationFrame(counter);
                } else {
                    stat.element.textContent = stat.target.toLocaleString();
                }
            };
            
            counter();
        });
        
        // Animate progress bars
        const progressBars = document.querySelectorAll('.stat-progress:not(.infinite)');
        progressBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.width = '100%';
            }, index * 200);
        });
    }

    // Hero Section Animations
    setupHeroAnimations() {
        // Animate floating cards on load
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach((card, index) => {
            const delay = parseFloat(card.dataset.delay) * 1000;
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, delay);
        });
        
        // Animate CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach((button, index) => {
            button.addEventListener('mouseenter', () => {
                this.createButtonGlow(button);
            });
            
            button.addEventListener('click', (e) => {
                this.createClickEffect(button, e);
            });
            
            // Stagger animation on load
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 500 + (index * 200));
        });
    }

    createButtonGlow(button) {
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            inset: -2px;
            background: linear-gradient(45deg, var(--cyber-green), var(--quantum-violet));
            border-radius: inherit;
            z-index: -1;
            filter: blur(10px);
            opacity: 0.7;
            animation: glow-pulse 1.5s ease-in-out infinite;
        `;
        
        button.style.position = 'relative';
        button.appendChild(glow);
        
        setTimeout(() => glow.remove(), 1500);
    }

    createClickEffect(button, event) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: click-ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // Intersection Observer for Animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger specific animations
                    if (entry.target.classList.contains('topic-card')) {
                        this.animateTopicCard(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const elements = document.querySelectorAll('.topic-card, .stat-card, .news-tab-content');
        elements.forEach(el => observer.observe(el));
    }

    animateTopicCard(card) {
        const icon = card.querySelector('.topic-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(10deg)';
            setTimeout(() => {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        }
    }

    // Enhanced News Card Interactions
    setupNewsCardInteractions() {
        const newsCards = document.querySelectorAll('.news-card');
        newsCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.createNewsCardClickEffect(card, e);
            });
            
            card.addEventListener('mouseenter', () => {
                this.enhanceNewsCardHover(card);
            });
        });
        
        // Re-setup for dynamically loaded cards
        const observer = new MutationObserver(() => {
            this.setupNewsCardInteractions();
        });
        
        const newsContainer = document.querySelector('.news-grid');
        if (newsContainer) {
            observer.observe(newsContainer, { childList: true, subtree: true });
        }
    }

    createNewsCardClickEffect(card, event) {
        // Prevent multiple simultaneous effects
        if (card.dataset.clicking) return;
        card.dataset.clicking = 'true';
        
        // Create ripple effect
        const rect = card.getBoundingClientRect();
        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height) * 1.5;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: newsCardRipple 0.8s ease-out;
            pointer-events: none;
            z-index: 2;
        `;
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        // Add pulse effect to the entire card
        card.style.animation = 'newsCardClickPulse 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Cleanup
        setTimeout(() => {
            ripple.remove();
            card.style.animation = '';
            delete card.dataset.clicking;
        }, 800);
        
        // Add subtle vibration effect on mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    enhanceNewsCardHover(card) {
        // Prevent multiple hover effects
        if (card.querySelector('.news-card-glow')) return;
        
        const glow = document.createElement('div');
        glow.className = 'news-card-glow';
        glow.style.cssText = `
            position: absolute;
            inset: -3px;
            background: linear-gradient(45deg, var(--electric-blue), var(--primary-blue), var(--electric-cyan), var(--electric-blue));
            border-radius: inherit;
            z-index: -1;
            filter: blur(12px);
            opacity: 0;
            animation: newsCardGlow 2s ease-in-out;
            background-size: 300% 300%;
        `;
        
        card.appendChild(glow);
        
        // Auto-remove after animation
        setTimeout(() => {
            if (glow.parentNode) {
                glow.remove();
            }
        }, 2000);
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Enhanced scroll-to-section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// CSS Keyframe Animations (injected via JavaScript)
const injectKeyframes = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
        }
        
        @keyframes click-ripple {
            to { transform: scale(2); opacity: 0; }
        }
        
        @keyframes glow-pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        
        @keyframes newsCardRipple {
            0% { transform: scale(0); opacity: 0.8; }
            50% { opacity: 0.4; }
            100% { transform: scale(1); opacity: 0; }
        }
        
        @keyframes newsCardClickPulse {
            0% { transform: translateY(-5px) scale(1.05); }
            50% { transform: translateY(-8px) scale(1.08); }
            100% { transform: translateY(-5px) scale(1.05); }
        }
        
        @keyframes newsCardGlow {
            0% { opacity: 0; background-position: 0% 50%; }
            50% { opacity: 0.3; background-position: 100% 50%; }
            100% { opacity: 0; background-position: 200% 50%; }
        }
        
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        .topic-card.animate-in {
            animation: fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        /* Initial states for animated elements */
        .cta-button {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s ease;
        }
        
        .floating-card {
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.8s ease;
        }
    `;
    document.head.appendChild(style);
};

// Initialize the animation system
const techAnimations = new TechAnimationSystem();
injectKeyframes();

// Export for global use
window.TechAnimations = techAnimations;
window.scrollToSection = scrollToSection;
