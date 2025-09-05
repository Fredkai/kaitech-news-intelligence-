// KaiTech Futuristic Animations - Smooth & Chill

class FuturisticAnimations {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupScrollEffects();
            this.setupTypingAnimation();
            this.setupStatsAnimation();
            this.setupIntersectionObserver();
            this.setupSmoothScrolling();
            this.setupParallaxOrbs();
        });
    }

    // Smooth scroll effects for navbar
    setupScrollEffects() {
        const navbar = document.getElementById('navbar');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add scrolled class for blur effect
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    // Smooth typing animation for subtitle
    setupTypingAnimation() {
        const subtitleElement = document.getElementById('dynamicSubtitle');
        if (!subtitleElement) return;

        const phrases = [
            'KaiTech - Where Innovation Meets Excellence',
            '🚀 AI-Powered News Intelligence Solutions',
            '☁️ Enterprise Cloud Infrastructure & Services',
            '🎨 Creative Technology & Digital Design',
            '📊 Integrated Business Intelligence Platform',
            '⚡ Real-Time Data Analytics & Insights',
            '🔐 Secure & Scalable Enterprise Solutions'
        ];

        let currentPhraseIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let isPaused = false;

        const typeText = () => {
            const currentPhrase = phrases[currentPhraseIndex];
            
            if (isPaused) {
                setTimeout(typeText, 2000);
                isPaused = false;
                return;
            }

            if (isDeleting) {
                subtitleElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                
                if (currentCharIndex === 0) {
                    isDeleting = false;
                    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                    setTimeout(typeText, 500);
                    return;
                }
            } else {
                subtitleElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                
                if (currentCharIndex === currentPhrase.length) {
                    isPaused = true;
                    isDeleting = true;
                }
            }

            const speed = isDeleting ? 30 : 60;
            setTimeout(typeText, speed);
        };

        setTimeout(typeText, 1000);
    }

    // Smooth counter animation for stats
    setupStatsAnimation() {
        const animateCounter = (element, target, duration = 2000) => {
            const start = 0;
            const startTime = performance.now();
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Smooth easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(start + (target - start) * easeOutQuart);
                
                element.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };
            
            requestAnimationFrame(updateCounter);
        };

        // Intersection Observer for stats
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number[data-target]');
                    statNumbers.forEach((stat, index) => {
                        const target = parseInt(stat.dataset.target);
                        setTimeout(() => {
                            animateCounter(stat, target);
                        }, index * 200);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.hero-stats');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }

    // Smooth intersection observer for elements
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe feature cards and sections
        const elementsToAnimate = document.querySelectorAll('.feature-card, .section-header');
        elementsToAnimate.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
            observer.observe(el);
        });
    }

    // Smooth scrolling for navigation links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const navbarHeight = document.getElementById('navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Subtle parallax effect for floating orbs
    setupParallaxOrbs() {
        const orbs = document.querySelectorAll('.orb');
        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            
            orbs.forEach((orb, index) => {
                const speed = 0.5 + (index * 0.2);
                const yPos = -(scrolled * speed);
                orb.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    // Add smooth hover effects to buttons and cards
    addHoverEffects() {
        // Button hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-3px) scale(1.02)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Card hover effects
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    // Smooth page load animation
    pageLoadAnimation() {
        const hero = document.querySelector('.hero-content');
        const navbar = document.getElementById('navbar');
        
        if (hero) {
            hero.style.opacity = '0';
            hero.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                hero.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                hero.style.opacity = '1';
                hero.style.transform = 'translateY(0)';
            }, 300);
        }
        
        if (navbar) {
            navbar.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                navbar.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                navbar.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // Mouse movement parallax effect (subtle)
    setupMouseParallax() {
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX - window.innerWidth / 2;
            mouseY = e.clientY - window.innerHeight / 2;
        });

        const updateMouseParallax = () => {
            targetX += (mouseX - targetX) * 0.02;
            targetY += (mouseY - targetY) * 0.02;

            const orbs = document.querySelectorAll('.orb');
            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 0.5;
                orb.style.transform += ` translate(${targetX * speed * 0.01}px, ${targetY * speed * 0.01}px)`;
            });

            requestAnimationFrame(updateMouseParallax);
        };

        updateMouseParallax();
    }
}

// Utility functions for smooth animations
const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
};

// Initialize the animations
const animations = new FuturisticAnimations();

// Page load setup
window.addEventListener('load', () => {
    animations.pageLoadAnimation();
    animations.addHoverEffects();
    animations.setupMouseParallax();
});

// Export for global access
window.FuturisticAnimations = FuturisticAnimations;
