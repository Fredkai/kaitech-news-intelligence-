// KaiTech Design Styles Database
// Comprehensive design style definitions for AI recommendations

class DesignStylesDatabase {
    constructor() {
        this.designStyles = {
            minimalist: {
                name: 'Minimalist & Clean',
                description: 'Emphasizes simplicity, white space, and clarity. Clean typography, limited color palette, and uncluttered layouts.',
                characteristics: [
                    'Abundant white space',
                    'Simple, clean typography',
                    'Limited color palette (2-3 colors)',
                    'Geometric shapes and clean lines',
                    'Functional and purposeful elements',
                    'Sans-serif fonts preferred'
                ],
                suitableFor: [
                    'technology', 'healthcare', 'consulting', 'finance', 'education',
                    'software', 'apps', 'saas', 'professional-services'
                ],
                budgetRange: ['500-1500', '1500-5000', '5000-15000'],
                colors: ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#6C757D', '#495057'],
                keywords: ['simple', 'clean', 'minimal', 'professional', 'modern', 'sophisticated'],
                examples: [
                    'Apple product designs',
                    'Google Material Design',
                    'Dropbox branding',
                    'Airbnb interface'
                ]
            },

            futuristic: {
                name: 'Futuristic & Tech',
                description: 'Forward-looking design with cutting-edge aesthetics. Features gradients, neon accents, geometric patterns, and high-tech elements.',
                characteristics: [
                    'Gradient backgrounds and overlays',
                    'Neon and electric color accents',
                    'Geometric and angular shapes',
                    'Holographic and glass effects',
                    'Dark themes with bright accents',
                    'Modern, tech-inspired typography'
                ],
                suitableFor: [
                    'technology', 'artificial-intelligence', 'blockchain', 'gaming',
                    'cybersecurity', 'vr-ar', 'robotics', 'fintech'
                ],
                budgetRange: ['1500-5000', '5000-15000', 'over-15000'],
                colors: ['#0D1421', '#1A73E8', '#00D4FF', '#6C5CE7', '#FF6B9D', '#00CEFF'],
                keywords: ['tech', 'ai', 'future', 'innovative', 'cutting-edge', 'digital', 'sci-fi'],
                examples: [
                    'Tesla interface design',
                    'Microsoft Fluent Design',
                    'Spotify gradients',
                    'Adobe Creative Suite'
                ]
            },

            modern: {
                name: 'Modern & Trendy',
                description: 'Contemporary design following current trends. Bold typography, vibrant colors, asymmetrical layouts, and creative visual elements.',
                characteristics: [
                    'Bold, expressive typography',
                    'Vibrant and saturated colors',
                    'Asymmetrical layouts',
                    'Creative use of photography',
                    'Custom illustrations',
                    'Interactive elements and animations'
                ],
                suitableFor: [
                    'creative-agencies', 'fashion', 'entertainment', 'lifestyle',
                    'marketing', 'social-media', 'startups', 'e-commerce'
                ],
                budgetRange: ['1500-5000', '5000-15000', 'over-15000'],
                colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
                keywords: ['trendy', 'creative', 'bold', 'vibrant', 'innovative', 'stylish'],
                examples: [
                    'Spotify branding',
                    'Instagram visual style',
                    'Behance designs',
                    'Modern agency websites'
                ]
            },

            classic: {
                name: 'Classic & Elegant',
                description: 'Timeless design with sophisticated aesthetics. Traditional typography, refined color schemes, and elegant proportions.',
                characteristics: [
                    'Serif typography for elegance',
                    'Refined, muted color palettes',
                    'Traditional grid layouts',
                    'High-quality imagery',
                    'Ornamental details when appropriate',
                    'Balanced and harmonious composition'
                ],
                suitableFor: [
                    'law-firms', 'luxury-brands', 'financial-services', 'real-estate',
                    'hospitality', 'jewelry', 'wine', 'high-end-retail'
                ],
                budgetRange: ['1500-5000', '5000-15000', 'over-15000'],
                colors: ['#2C3E50', '#34495E', '#8B4513', '#DAA520', '#FFFFFF', '#F8F8FF'],
                keywords: ['elegant', 'sophisticated', 'timeless', 'luxury', 'traditional', 'premium'],
                examples: [
                    'Rolex branding',
                    'The New York Times',
                    'Louis Vuitton',
                    'Traditional law firm websites'
                ]
            },

            playful: {
                name: 'Playful & Creative',
                description: 'Fun and engaging design with creative elements. Bright colors, custom illustrations, organic shapes, and interactive features.',
                characteristics: [
                    'Bright, cheerful color palettes',
                    'Custom illustrations and characters',
                    'Organic and curved shapes',
                    'Playful typography and fonts',
                    'Interactive elements and micro-animations',
                    'Creative use of space and layout'
                ],
                suitableFor: [
                    'children-brands', 'entertainment', 'gaming', 'education',
                    'creative-services', 'food-beverage', 'events', 'toys'
                ],
                budgetRange: ['500-1500', '1500-5000', '5000-15000'],
                colors: ['#FF9A9E', '#FECFEF', '#FFECD2', '#FCB69F', '#A8E6CF', '#FFB3BA'],
                keywords: ['fun', 'playful', 'creative', 'colorful', 'engaging', 'friendly'],
                examples: [
                    'Duolingo branding',
                    'Mailchimp design',
                    'Slack interface',
                    'Nintendo game designs'
                ]
            },

            professional: {
                name: 'Professional & Corporate',
                description: 'Business-focused design emphasizing credibility and trust. Clean lines, professional color schemes, and structured layouts.',
                characteristics: [
                    'Clean, structured layouts',
                    'Professional color schemes (blues, grays)',
                    'Sans-serif typography for clarity',
                    'Consistent visual hierarchy',
                    'Professional photography',
                    'Corporate-appropriate imagery'
                ],
                suitableFor: [
                    'consulting', 'b2b-services', 'finance', 'insurance',
                    'healthcare', 'manufacturing', 'logistics', 'enterprise'
                ],
                budgetRange: ['500-1500', '1500-5000', '5000-15000'],
                colors: ['#2C3E50', '#34495E', '#3498DB', '#95A5A6', '#FFFFFF', '#ECF0F1'],
                keywords: ['professional', 'corporate', 'business', 'reliable', 'trustworthy', 'formal'],
                examples: [
                    'IBM branding',
                    'Microsoft corporate',
                    'McKinsey & Company',
                    'Enterprise software interfaces'
                ]
            }
        };

        this.industryMappings = {
            technology: ['minimalist', 'futuristic', 'modern'],
            healthcare: ['minimalist', 'professional', 'classic'],
            finance: ['professional', 'classic', 'minimalist'],
            education: ['playful', 'modern', 'professional'],
            retail: ['modern', 'playful', 'minimalist'],
            'food-beverage': ['playful', 'modern', 'classic'],
            'real-estate': ['classic', 'professional', 'modern'],
            consulting: ['professional', 'minimalist', 'classic'],
            nonprofit: ['playful', 'modern', 'professional'],
            entertainment: ['playful', 'modern', 'futuristic']
        };

        this.projectTypeMappings = {
            logo: ['minimalist', 'classic', 'modern'],
            website: ['minimalist', 'modern', 'professional'],
            'mobile-app': ['minimalist', 'modern', 'futuristic'],
            branding: ['classic', 'modern', 'minimalist'],
            marketing: ['modern', 'playful', 'futuristic'],
            packaging: ['playful', 'modern', 'classic'],
            other: ['modern', 'minimalist', 'professional']
        };

        this.budgetMappings = {
            'under-500': ['minimalist', 'professional', 'playful'],
            '500-1500': ['minimalist', 'professional', 'playful', 'modern'],
            '1500-5000': ['modern', 'minimalist', 'classic', 'futuristic'],
            '5000-15000': ['classic', 'futuristic', 'modern', 'minimalist'],
            'over-15000': ['classic', 'futuristic', 'modern']
        };
    }

    // Get style recommendations based on user requirements
    getStyleRecommendations(requirements) {
        const scores = {};
        
        // Initialize scores
        Object.keys(this.designStyles).forEach(style => {
            scores[style] = 0;
        });

        // Score based on industry
        if (requirements.industry && this.industryMappings[requirements.industry]) {
            this.industryMappings[requirements.industry].forEach((style, index) => {
                scores[style] += (3 - index) * 2; // Higher score for better matches
            });
        }

        // Score based on project type
        if (requirements.projectType && this.projectTypeMappings[requirements.projectType]) {
            this.projectTypeMappings[requirements.projectType].forEach((style, index) => {
                scores[style] += (3 - index) * 1.5;
            });
        }

        // Score based on budget
        if (requirements.budget && this.budgetMappings[requirements.budget]) {
            this.budgetMappings[requirements.budget].forEach(style => {
                scores[style] += 1;
            });
        }

        // Score based on explicitly selected styles
        if (requirements.styles && requirements.styles.length > 0) {
            requirements.styles.forEach(style => {
                if (scores[style] !== undefined) {
                    scores[style] += 5; // High score for explicitly selected styles
                }
            });
        }

        // Analyze description for keywords
        if (requirements.description) {
            const description = requirements.description.toLowerCase();
            Object.entries(this.designStyles).forEach(([styleName, styleData]) => {
                styleData.keywords.forEach(keyword => {
                    if (description.includes(keyword)) {
                        scores[styleName] += 1;
                    }
                });
            });
        }

        // Sort styles by score and return top recommendations
        const sortedStyles = Object.entries(scores)
            .sort(([,a], [,b]) => b - a)
            .filter(([,score]) => score > 0)
            .slice(0, 3)
            .map(([styleName, score]) => ({
                name: this.designStyles[styleName].name,
                style: styleName,
                score: score,
                description: this.designStyles[styleName].description,
                characteristics: this.designStyles[styleName].characteristics,
                colors: this.designStyles[styleName].colors,
                examples: this.designStyles[styleName].examples
            }));

        return sortedStyles;
    }

    // Get detailed style information
    getStyleDetails(styleName) {
        return this.designStyles[styleName] || null;
    }

    // Get all available styles
    getAllStyles() {
        return Object.keys(this.designStyles).map(styleName => ({
            name: styleName,
            displayName: this.designStyles[styleName].name,
            description: this.designStyles[styleName].description
        }));
    }

    // Generate budget advice based on project requirements
    generateBudgetAdvice(requirements) {
        const projectType = requirements.projectType;
        const budget = requirements.budget;
        const timeline = requirements.timeline;

        let advice = '';

        // Budget-specific advice
        switch (budget) {
            case 'under-500':
                advice = 'For your budget range, we recommend focusing on logo design or simple branding elements. Consider a minimalist approach that maximizes impact while keeping costs manageable.';
                break;
            case '500-1500':
                advice = 'This budget allows for comprehensive logo design, basic branding package, or simple website design. You can include 2-3 design concepts and minor revisions.';
                break;
            case '1500-5000':
                advice = 'Excellent budget for complete branding packages, professional websites, or mobile app interfaces. Includes multiple concepts, revisions, and brand guidelines.';
                break;
            case '5000-15000':
                advice = 'Premium budget allowing for comprehensive design solutions including complete brand identity, professional website, marketing materials, and ongoing design support.';
                break;
            case 'over-15000':
                advice = 'Enterprise-level budget enabling full-scale design projects with extensive research, multiple concepts, comprehensive brand systems, and long-term design partnerships.';
                break;
        }

        // Timeline considerations
        if (timeline === 'asap') {
            advice += ' Rush projects may require additional fees (typically 25-50% premium) due to accelerated timelines and priority scheduling.';
        }

        // Project type considerations
        if (projectType === 'branding') {
            advice += ' Complete branding packages typically include logo design, color palette, typography, business cards, and brand guidelines.';
        } else if (projectType === 'website') {
            advice += ' Website projects include design mockups, responsive layouts, and basic optimization. Development costs are separate.';
        }

        return advice;
    }

    // Generate timeline advice
    generateTimelineAdvice(requirements) {
        const timeline = requirements.timeline;
        const projectType = requirements.projectType;
        
        let advice = '';

        switch (timeline) {
            case 'asap':
                advice = 'Rush timeline requires immediate start and dedicated resources. We recommend simplifying the scope to ensure quality delivery.';
                break;
            case '1-2weeks':
                advice = 'Tight but manageable timeline. Perfect for logo design or simple branding projects with limited revisions.';
                break;
            case '1month':
                advice = 'Ideal timeline for most projects. Allows for proper research, concept development, revisions, and refinement.';
                break;
            case '2-3months':
                advice = 'Excellent timeline for complex projects. Enables thorough research, multiple concepts, extensive revisions, and comprehensive testing.';
                break;
            case 'flexible':
                advice = 'Flexible timeline allows for the best possible results. We can optimize the process for quality and iterate based on feedback.';
                break;
        }

        // Project-specific timeline advice
        const timelinesByProject = {
            logo: 'Logo design typically takes 1-2 weeks including concepts and revisions.',
            website: 'Website design usually requires 2-4 weeks depending on complexity and pages.',
            'mobile-app': 'Mobile app design often needs 3-6 weeks for proper UX research and interface design.',
            branding: 'Complete branding packages typically take 3-4 weeks for comprehensive development.',
            marketing: 'Marketing materials can be completed in 1-2 weeks per piece.',
            packaging: 'Packaging design usually requires 2-3 weeks including structure and graphics.'
        };

        if (timelinesByProject[projectType]) {
            advice += ' ' + timelinesByProject[projectType];
        }

        return advice;
    }

    // Generate next steps recommendations
    generateNextSteps(requirements) {
        const steps = [];
        
        steps.push('Our design team will review your requirements and prepare a detailed proposal within 24 hours.');
        steps.push('We\'ll schedule a consultation call to discuss your vision, goals, and any questions you may have.');
        
        if (requirements.budget === 'under-500') {
            steps.push('We\'ll present budget-friendly options that maximize value within your range.');
        } else {
            steps.push('We\'ll present 2-3 design concepts based on our AI analysis and your preferences.');
        }
        
        steps.push('Upon approval, we\'ll begin the design process with regular check-ins and updates.');
        steps.push('Final delivery includes all design files, brand guidelines (if applicable), and ongoing support.');
        
        return steps.join(' ');
    }
}

module.exports = DesignStylesDatabase;
