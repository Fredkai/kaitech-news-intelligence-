// User Profile Management API Routes for KaiTech Voice of Time
// Handles authentication endpoints, profile management, and account linking

const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const SimpleAuthenticationManager = require('./simple-auth');

class UserRoutes {
    constructor() {
        this.router = express.Router();
        this.authManager = new SimpleAuthenticationManager();
        this.setupRoutes();
    }

    setupRoutes() {
        // Authentication Routes
        this.setupAuthRoutes();
        
        // User Profile Routes
        this.setupProfileRoutes();
        
        // OAuth Account Management Routes
        this.setupOAuthRoutes();
        
        // User Preferences Routes
        this.setupPreferencesRoutes();
        
        // User Content Routes (saved articles, etc.)
        this.setupContentRoutes();
    }

    setupAuthRoutes() {
        // User Registration
        this.router.post('/register',
            this.authManager.getAuthRateLimit(),
            this.authManager.getRegistrationValidation(),
            this.authManager.handleValidationErrors,
            async (req, res) => {
                await this.authManager.registerUser(req, res);
            }
        );

        // Local Login
        this.router.post('/login',
            this.authManager.getLoginRateLimit(),
            this.authManager.getLoginValidation(),
            this.authManager.handleValidationErrors,
            (req, res, next) => {
                passport.authenticate('local', (err, user, info) => {
                    if (err) {
                        return res.status(500).json({
                            error: 'Authentication failed',
                            message: 'An internal error occurred'
                        });
                    }
                    
                    if (!user) {
                        return res.status(401).json({
                            error: 'Login failed',
                            message: info.message || 'Invalid credentials'
                        });
                    }
                    
                    req.login(user, (loginErr) => {
                        if (loginErr) {
                            return res.status(500).json({
                                error: 'Login failed',
                                message: 'Could not complete login'
                            });
                        }
                        
                        res.json({
                            success: true,
                            message: 'Login successful',
                            user: {
                                id: user.id,
                                email: user.email,
                                username: user.username,
                                display_name: user.display_name,
                                avatar_url: user.avatar_url,
                                is_verified: user.is_verified
                            },
                            jwt: this.authManager.generateJWT(user)
                        });
                    });
                })(req, res, next);
            }
        );

        // Logout
        this.router.post('/logout', (req, res) => {
            const wasLoggedIn = req.isAuthenticated();
            
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({
                        error: 'Logout failed',
                        message: 'Could not complete logout'
                    });
                }
                
                req.session.destroy((sessionErr) => {
                    if (sessionErr) {
                        console.error('Session destruction error:', sessionErr);
                    }
                    
                    res.clearCookie('kaitech.sid');
                    res.json({
                        success: true,
                        message: wasLoggedIn ? 'Logout successful' : 'Already logged out'
                    });
                });
            });
        });

        // Check Authentication Status
        this.router.get('/status', (req, res) => {
            if (req.isAuthenticated()) {
                res.json({
                    authenticated: true,
                    user: {
                        id: req.user.id,
                        email: req.user.email,
                        username: req.user.username,
                        display_name: req.user.display_name,
                        avatar_url: req.user.avatar_url,
                        is_verified: req.user.is_verified,
                        preferences: req.user.preferences
                    }
                });
            } else {
                res.json({
                    authenticated: false,
                    user: null
                });
            }
        });
    }

    setupProfileRoutes() {
        // Get Current User Profile
        this.router.get('/profile', this.authManager.requireAuth.bind(this.authManager), async (req, res) => {
            try {
                const user = await this.authManager.userDb.getUserById(req.user.id);
                const oauthAccounts = await this.authManager.userDb.getUserOAuthAccounts(req.user.id);
                
                if (!user) {
                    return res.status(404).json({
                        error: 'User not found',
                        message: 'Profile could not be retrieved'
                    });
                }

                res.json({
                    success: true,
                    profile: {
                        id: user.id,
                        uuid: user.user_uuid,
                        email: user.email,
                        username: user.username,
                        display_name: user.display_name,
                        avatar_url: user.avatar_url,
                        bio: user.bio,
                        location: user.location,
                        website: user.website,
                        is_verified: user.is_verified,
                        created_at: user.created_at,
                        last_login: user.last_login,
                        timezone: user.timezone,
                        language: user.language,
                        connected_accounts: oauthAccounts.map(acc => ({
                            provider: acc.provider,
                            provider_username: acc.provider_username,
                            connected_at: acc.created_at
                        })),
                        preferences: {
                            news_categories: JSON.parse(user.news_categories || '[]'),
                            notifications_enabled: user.notifications_enabled,
                            email_notifications: user.email_notifications,
                            breaking_news_alerts: user.breaking_news_alerts,
                            ai_recommendations: user.ai_recommendations,
                            dark_mode: user.dark_mode,
                            language: user.language,
                            timezone: user.timezone,
                            items_per_page: user.items_per_page,
                            auto_refresh: user.auto_refresh,
                            personalization_level: user.personalization_level
                        }
                    }
                });
            } catch (error) {
                console.error('Profile retrieval error:', error);
                res.status(500).json({
                    error: 'Profile retrieval failed',
                    message: 'Could not retrieve profile information'
                });
            }
        });
    }

    setupOAuthRoutes() {
        // Google OAuth Login
        this.router.get('/google', 
            passport.authenticate('google', { 
                scope: ['profile', 'email'] 
            })
        );

        // Google OAuth Callback
        this.router.get('/google/callback',
            passport.authenticate('google', { 
                failureRedirect: '/auth/login?error=oauth_failed',
                failureMessage: true 
            }),
            (req, res) => {
                // Successful authentication
                const returnTo = req.session.returnTo || '/dashboard';
                delete req.session.returnTo;
                res.redirect(returnTo);
            }
        );

        // GitHub OAuth Login
        this.router.get('/github',
            passport.authenticate('github', { 
                scope: ['user:email'] 
            })
        );

        // GitHub OAuth Callback
        this.router.get('/github/callback',
            passport.authenticate('github', { 
                failureRedirect: '/auth/login?error=oauth_failed',
                failureMessage: true 
            }),
            (req, res) => {
                // Successful authentication
                const returnTo = req.session.returnTo || '/dashboard';
                delete req.session.returnTo;
                res.redirect(returnTo);
            }
        );
    }

    setupPreferencesRoutes() {
        // Update User Preferences
        this.router.put('/preferences',
            this.authManager.requireAuth.bind(this.authManager),
            [
                body('news_categories')
                    .optional()
                    .isArray()
                    .withMessage('News categories must be an array'),
                body('items_per_page')
                    .optional()
                    .isInt({ min: 5, max: 100 })
                    .withMessage('Items per page must be between 5 and 100')
            ],
            this.authManager.handleValidationErrors,
            async (req, res) => {
                try {
                    const preferences = req.body;
                    
                    await this.authManager.userDb.updateUserPreferences(req.user.id, preferences);
                    
                    res.json({
                        success: true,
                        message: 'Preferences updated successfully'
                    });
                    
                } catch (error) {
                    console.error('Preferences update error:', error);
                    res.status(500).json({
                        error: 'Preferences update failed',
                        message: 'Could not update preferences'
                    });
                }
            }
        );
    }

    setupContentRoutes() {
        // Save Article
        this.router.post('/saved-articles',
            this.authManager.requireAuth.bind(this.authManager),
            [
                body('article_id')
                    .notEmpty()
                    .withMessage('Article ID is required'),
                body('article_title')
                    .notEmpty()
                    .withMessage('Article title is required'),
                body('article_url')
                    .isURL()
                    .withMessage('Valid article URL is required')
            ],
            this.authManager.handleValidationErrors,
            async (req, res) => {
                try {
                    const articleData = {
                        id: req.body.article_id,
                        title: req.body.article_title,
                        url: req.body.article_url,
                        source: req.body.article_source,
                        category: req.body.article_category,
                        tags: req.body.tags || [],
                        notes: req.body.notes
                    };
                    
                    await this.authManager.userDb.saveArticle(req.user.id, articleData);
                    
                    res.json({
                        success: true,
                        message: 'Article saved successfully'
                    });
                    
                } catch (error) {
                    if (error.code === 'SQLITE_CONSTRAINT') {
                        res.status(409).json({
                            error: 'Article already saved',
                            message: 'This article is already in your saved list'
                        });
                    } else {
                        console.error('Save article error:', error);
                        res.status(500).json({
                            error: 'Failed to save article',
                            message: 'Could not save the article'
                        });
                    }
                }
            }
        );

        // Get Saved Articles
        this.router.get('/saved-articles',
            this.authManager.requireAuth.bind(this.authManager),
            async (req, res) => {
                try {
                    const limit = parseInt(req.query.limit) || 50;
                    const savedArticles = await this.authManager.userDb.getUserSavedArticles(req.user.id, limit);
                    
                    res.json({
                        success: true,
                        articles: savedArticles,
                        count: savedArticles.length
                    });
                    
                } catch (error) {
                    console.error('Get saved articles error:', error);
                    res.status(500).json({
                        error: 'Failed to retrieve saved articles',
                        message: 'Could not load your saved articles'
                    });
                }
            }
        );
    }

    getRouter() {
        return this.router;
    }

    async close() {
        await this.authManager.close();
    }
}

module.exports = UserRoutes;
