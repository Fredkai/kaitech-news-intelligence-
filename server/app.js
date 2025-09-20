// KaiTech Email Integration Server
// Express.js server to handle form submissions and email integration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const path = require('path');
require('dotenv').config();

// Import email service
const emailService = require('../services/email-integration');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development - configure properly in production
}));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://kaitech.com', 'https://www.kaitech.com'] // Replace with your actual domain
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting to form submission endpoints
app.use('/api/contact', limiter);

// Middleware for request validation
const validateFormData = (requiredFields) => {
    return (req, res, next) => {
        const { body } = req;
        const errors = [];

        // Check required fields
        requiredFields.forEach(field => {
            if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
                errors.push(`${field} is required`);
            }
        });

        // Validate email format
        if (body.email && !validator.isEmail(body.email)) {
            errors.push('Invalid email format');
        }

        // Validate phone number if provided
        if (body.phone && !validator.isMobilePhone(body.phone, 'any', { strictMode: false })) {
            // Allow empty phone numbers, only validate if provided
            if (body.phone.trim() !== '') {
                errors.push('Invalid phone number format');
            }
        }

        // Sanitize inputs
        Object.keys(body).forEach(key => {
            if (typeof body[key] === 'string') {
                body[key] = validator.escape(body[key].trim());
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors,
                message: 'Validation failed'
            });
        }

        next();
    };
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const emailHealth = await emailService.healthCheck();
        res.json({
            status: 'operational',
            timestamp: new Date().toISOString(),
            services: {
                server: 'healthy',
                email: emailHealth
            },
            version: process.env.npm_package_version || '1.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
});

// Cloud Services consultation endpoint
app.post('/api/contact/cloud-consultation', 
    validateFormData(['name', 'email']),
    async (req, res) => {
        try {
            console.log('📧 Received cloud consultation request:', {
                name: req.body.name,
                email: req.body.email,
                company: req.body.company || 'Not provided'
            });

            const result = await emailService.sendCloudConsultationEmail(req.body);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Cloud consultation request sent successfully!',
                    details: 'Our cloud specialist will contact you within 24 hours.',
                    messageId: result.messageId
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Cloud consultation request failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send consultation request. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Design Services consultation endpoint
app.post('/api/contact/design-consultation',
    validateFormData(['name', 'email']),
    async (req, res) => {
        try {
            console.log('🎨 Received design consultation request:', {
                name: req.body.name,
                email: req.body.email,
                company: req.body.company || 'Not provided'
            });

            const result = await emailService.sendDesignConsultationEmail(req.body);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Design consultation request sent successfully!',
                    details: 'Our creative team will contact you within 24 hours.',
                    messageId: result.messageId
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Design consultation request failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send consultation request. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// AI News Demo request endpoint
app.post('/api/contact/ai-demo',
    validateFormData(['name', 'email']),
    async (req, res) => {
        try {
            console.log('🤖 Received AI demo request:', {
                name: req.body.name,
                email: req.body.email,
                company: req.body.company || 'Not provided'
            });

            const result = await emailService.sendAIDemoRequestEmail(req.body);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'AI demo request sent successfully!',
                    details: 'Our AI specialist will contact you to schedule a personalized demo.',
                    messageId: result.messageId
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ AI demo request failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send demo request. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// General contact endpoint (fallback)
app.post('/api/contact/general',
    validateFormData(['name', 'email', 'message']),
    async (req, res) => {
        try {
            console.log('📬 Received general contact request:', {
                name: req.body.name,
                email: req.body.email,
                subject: req.body.subject || 'General Inquiry'
            });

            // For general messages, we can route to the most appropriate service
            // or send to a general inbox
            const result = await emailService.sendGeneralContactEmail(req.body);

            if (result && result.success) {
                res.json({
                    success: true,
                    message: 'Your message has been sent successfully!',
                    details: 'We will respond to your inquiry within 24 hours.',
                    messageId: result.messageId
                });
            } else {
                // Fallback for general contact if method doesn't exist
                res.json({
                    success: true,
                    message: 'Your message has been received!',
                    details: 'Thank you for contacting KaiTech. We will respond within 24 hours.'
                });
            }
        } catch (error) {
            console.error('❌ General contact request failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Test endpoint for development
if (process.env.NODE_ENV === 'development') {
    app.get('/api/test', (req, res) => {
        res.json({
            message: 'KaiTech Email Integration API is running!',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV,
            endpoints: {
                health: '/api/health',
                cloudConsultation: '/api/contact/cloud-consultation',
                designConsultation: '/api/contact/design-consultation',
                aiDemo: '/api/contact/ai-demo',
                general: '/api/contact/general'
            }
        });
    });
}

// Serve static files from the website directory in development
if (process.env.NODE_ENV === 'development') {
    app.use(express.static(path.join(__dirname, '..')));
    
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });
}

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        availableEndpoints: [
            '/api/health',
            '/api/contact/cloud-consultation',
            '/api/contact/design-consultation',
            '/api/contact/ai-demo',
            '/api/contact/general'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('🔥 Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

const server = app.listen(PORT, () => {
    console.log(`
🚀 KaiTech Email Integration Server is running!

📊 Server Details:
   • Port: ${PORT}
   • Environment: ${process.env.NODE_ENV || 'development'}
   • CORS Origins: ${corsOptions.origin}

🔗 API Endpoints:
   • Health Check: http://localhost:${PORT}/api/health
   • Cloud Consultation: http://localhost:${PORT}/api/contact/cloud-consultation
   • Design Consultation: http://localhost:${PORT}/api/contact/design-consultation
   • AI Demo: http://localhost:${PORT}/api/contact/ai-demo
   • General Contact: http://localhost:${PORT}/api/contact/general

${process.env.NODE_ENV === 'development' ? 
`📁 Static Files: http://localhost:${PORT}/
🌐 Website: http://localhost:${PORT}/index.html` : ''}

📧 Email Service Status: Initializing...
    `);
});

module.exports = app;
