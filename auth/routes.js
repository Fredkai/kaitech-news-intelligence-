// User Profile Management API Routes for KaiTech Voice of Time
// Handles authentication endpoints, profile management, and account linking

const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const AuthenticationManager = require('./auth');

class UserRoutes {
    constructor() {
        this.router = express.Router();
        this.authManager = new AuthenticationManager();
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
                        }\n                    }\n                });\n            } catch (error) {\n                console.error('Profile retrieval error:', error);\n                res.status(500).json({\n                    error: 'Profile retrieval failed',\n                    message: 'Could not retrieve profile information'\n                });\n            }\n        });\n\n        // Update User Profile\n        this.router.put('/profile', \n            this.authManager.requireAuth.bind(this.authManager),\n            [\n                body('display_name')\n                    .optional()\n                    .isLength({ min: 1, max: 50 })\n                    .withMessage('Display name must be between 1 and 50 characters'),\n                body('bio')\n                    .optional()\n                    .isLength({ max: 500 })\n                    .withMessage('Bio must be less than 500 characters'),\n                body('location')\n                    .optional()\n                    .isLength({ max: 100 })\n                    .withMessage('Location must be less than 100 characters'),\n                body('website')\n                    .optional()\n                    .isURL()\n                    .withMessage('Please provide a valid website URL'),\n                body('timezone')\n                    .optional()\n                    .isLength({ min: 1, max: 50 })\n                    .withMessage('Invalid timezone'),\n                body('language')\n                    .optional()\n                    .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'])\n                    .withMessage('Unsupported language')\n            ],\n            this.authManager.handleValidationErrors,\n            async (req, res) => {\n                try {\n                    const { display_name, bio, location, website, timezone, language } = req.body;\n                    \n                    // Update user profile in database\n                    const updateQuery = `\n                        UPDATE users SET\n                            display_name = COALESCE(?, display_name),\n                            bio = COALESCE(?, bio),\n                            location = COALESCE(?, location),\n                            website = COALESCE(?, website),\n                            timezone = COALESCE(?, timezone),\n                            language = COALESCE(?, language),\n                            updated_at = CURRENT_TIMESTAMP\n                        WHERE id = ?\n                    `;\n                    \n                    await new Promise((resolve, reject) => {\n                        this.authManager.userDb.db.run(updateQuery, [\n                            display_name || null,\n                            bio || null,\n                            location || null,\n                            website || null,\n                            timezone || null,\n                            language || null,\n                            req.user.id\n                        ], function(err) {\n                            if (err) reject(err);\n                            else resolve({ changes: this.changes });\n                        });\n                    });\n                    \n                    res.json({\n                        success: true,\n                        message: 'Profile updated successfully'\n                    });\n                    \n                } catch (error) {\n                    console.error('Profile update error:', error);\n                    res.status(500).json({\n                        error: 'Profile update failed',\n                        message: 'Could not update profile information'\n                    });\n                }\n            }\n        );\n\n        // Delete User Account\n        this.router.delete('/profile', this.authManager.requireAuth.bind(this.authManager), async (req, res) => {\n            try {\n                const { confirm_password } = req.body;\n                \n                if (!confirm_password) {\n                    return res.status(400).json({\n                        error: 'Password confirmation required',\n                        message: 'Please provide your password to confirm account deletion'\n                    });\n                }\n                \n                // Verify password before deletion\n                const user = await this.authManager.userDb.getUserById(req.user.id);\n                \n                if (user.password_hash) {\n                    const isValidPassword = await this.authManager.userDb.validatePassword(confirm_password, user.password_hash);\n                    if (!isValidPassword) {\n                        return res.status(401).json({\n                            error: 'Invalid password',\n                            message: 'Password confirmation failed'\n                        });\n                    }\n                }\n                \n                // Soft delete user account\n                await new Promise((resolve, reject) => {\n                    this.authManager.userDb.db.run(\n                        'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',\n                        [req.user.id],\n                        function(err) {\n                            if (err) reject(err);\n                            else resolve({ changes: this.changes });\n                        }\n                    );\n                });\n                \n                // Logout user\n                req.logout(() => {\n                    req.session.destroy(() => {\n                        res.clearCookie('kaitech.sid');\n                        res.json({\n                            success: true,\n                            message: 'Account has been deactivated successfully'\n                        });\n                    });\n                });\n                \n            } catch (error) {\n                console.error('Account deletion error:', error);\n                res.status(500).json({\n                    error: 'Account deletion failed',\n                    message: 'Could not delete account'\n                });\n            }\n        });\n    }\n\n    setupOAuthRoutes() {\n        // Google OAuth Login\n        this.router.get('/google', \n            passport.authenticate('google', { \n                scope: ['profile', 'email'] \n            })\n        );\n\n        // Google OAuth Callback\n        this.router.get('/google/callback',\n            passport.authenticate('google', { \n                failureRedirect: '/auth/login?error=oauth_failed',\n                failureMessage: true \n            }),\n            (req, res) => {\n                // Successful authentication\n                const returnTo = req.session.returnTo || '/dashboard';\n                delete req.session.returnTo;\n                res.redirect(returnTo);\n            }\n        );\n\n        // GitHub OAuth Login\n        this.router.get('/github',\n            passport.authenticate('github', { \n                scope: ['user:email'] \n            })\n        );\n\n        // GitHub OAuth Callback\n        this.router.get('/github/callback',\n            passport.authenticate('github', { \n                failureRedirect: '/auth/login?error=oauth_failed',\n                failureMessage: true \n            }),\n            (req, res) => {\n                // Successful authentication\n                const returnTo = req.session.returnTo || '/dashboard';\n                delete req.session.returnTo;\n                res.redirect(returnTo);\n            }\n        );\n\n        // Link OAuth Account to Existing User\n        this.router.post('/link/:provider', \n            this.authManager.requireAuth.bind(this.authManager),\n            async (req, res) => {\n                const { provider } = req.params;\n                const { access_token, provider_data } = req.body;\n                \n                if (!['google', 'github'].includes(provider)) {\n                    return res.status(400).json({\n                        error: 'Invalid provider',\n                        message: 'Unsupported OAuth provider'\n                    });\n                }\n                \n                try {\n                    // Check if account is already linked to another user\n                    const existingOAuth = await this.authManager.userDb.getOAuthAccount(provider, provider_data.id);\n                    \n                    if (existingOAuth && existingOAuth.user_id !== req.user.id) {\n                        return res.status(409).json({\n                            error: 'Account already linked',\n                            message: `This ${provider} account is already linked to another user`\n                        });\n                    }\n                    \n                    // Link the account\n                    await this.authManager.userDb.createOAuthAccount(req.user.id, provider, {\n                        id: provider_data.id,\n                        username: provider_data.username || provider_data.login,\n                        email: provider_data.email,\n                        access_token: access_token\n                    });\n                    \n                    res.json({\n                        success: true,\n                        message: `${provider} account linked successfully`\n                    });\n                    \n                } catch (error) {\n                    console.error('Account linking error:', error);\n                    res.status(500).json({\n                        error: 'Account linking failed',\n                        message: 'Could not link the account'\n                    });\n                }\n            }\n        );\n\n        // Unlink OAuth Account\n        this.router.delete('/unlink/:provider', \n            this.authManager.requireAuth.bind(this.authManager),\n            async (req, res) => {\n                const { provider } = req.params;\n                \n                try {\n                    await new Promise((resolve, reject) => {\n                        this.authManager.userDb.db.run(\n                            'DELETE FROM oauth_accounts WHERE user_id = ? AND provider = ?',\n                            [req.user.id, provider],\n                            function(err) {\n                                if (err) reject(err);\n                                else resolve({ changes: this.changes });\n                            }\n                        );\n                    });\n                    \n                    res.json({\n                        success: true,\n                        message: `${provider} account unlinked successfully`\n                    });\n                    \n                } catch (error) {\n                    console.error('Account unlinking error:', error);\n                    res.status(500).json({\n                        error: 'Account unlinking failed',\n                        message: 'Could not unlink the account'\n                    });\n                }\n            }\n        );\n    }\n\n    setupPreferencesRoutes() {\n        // Update User Preferences\n        this.router.put('/preferences',\n            this.authManager.requireAuth.bind(this.authManager),\n            [\n                body('news_categories')\n                    .optional()\n                    .isArray()\n                    .withMessage('News categories must be an array'),\n                body('items_per_page')\n                    .optional()\n                    .isInt({ min: 5, max: 100 })\n                    .withMessage('Items per page must be between 5 and 100')\n            ],\n            this.authManager.handleValidationErrors,\n            async (req, res) => {\n                try {\n                    const preferences = req.body;\n                    \n                    await this.authManager.userDb.updateUserPreferences(req.user.id, preferences);\n                    \n                    res.json({\n                        success: true,\n                        message: 'Preferences updated successfully'\n                    });\n                    \n                } catch (error) {\n                    console.error('Preferences update error:', error);\n                    res.status(500).json({\n                        error: 'Preferences update failed',\n                        message: 'Could not update preferences'\n                    });\n                }\n            }\n        );\n    }\n\n    setupContentRoutes() {\n        // Save Article\n        this.router.post('/saved-articles',\n            this.authManager.requireAuth.bind(this.authManager),\n            [\n                body('article_id')\n                    .notEmpty()\n                    .withMessage('Article ID is required'),\n                body('article_title')\n                    .notEmpty()\n                    .withMessage('Article title is required'),\n                body('article_url')\n                    .isURL()\n                    .withMessage('Valid article URL is required')\n            ],\n            this.authManager.handleValidationErrors,\n            async (req, res) => {\n                try {\n                    const articleData = {\n                        id: req.body.article_id,\n                        title: req.body.article_title,\n                        url: req.body.article_url,\n                        source: req.body.article_source,\n                        category: req.body.article_category,\n                        tags: req.body.tags || [],\n                        notes: req.body.notes\n                    };\n                    \n                    await this.authManager.userDb.saveArticle(req.user.id, articleData);\n                    \n                    res.json({\n                        success: true,\n                        message: 'Article saved successfully'\n                    });\n                    \n                } catch (error) {\n                    if (error.code === 'SQLITE_CONSTRAINT') {\n                        res.status(409).json({\n                            error: 'Article already saved',\n                            message: 'This article is already in your saved list'\n                        });\n                    } else {\n                        console.error('Save article error:', error);\n                        res.status(500).json({\n                            error: 'Failed to save article',\n                            message: 'Could not save the article'\n                        });\n                    }\n                }\n            }\n        );\n\n        // Get Saved Articles\n        this.router.get('/saved-articles',\n            this.authManager.requireAuth.bind(this.authManager),\n            async (req, res) => {\n                try {\n                    const limit = parseInt(req.query.limit) || 50;\n                    const savedArticles = await this.authManager.userDb.getUserSavedArticles(req.user.id, limit);\n                    \n                    res.json({\n                        success: true,\n                        articles: savedArticles,\n                        count: savedArticles.length\n                    });\n                    \n                } catch (error) {\n                    console.error('Get saved articles error:', error);\n                    res.status(500).json({\n                        error: 'Failed to retrieve saved articles',\n                        message: 'Could not load your saved articles'\n                    });\n                }\n            }\n        );\n\n        // Remove Saved Article\n        this.router.delete('/saved-articles/:articleId',\n            this.authManager.requireAuth.bind(this.authManager),\n            async (req, res) => {\n                try {\n                    const { articleId } = req.params;\n                    \n                    await new Promise((resolve, reject) => {\n                        this.authManager.userDb.db.run(\n                            'DELETE FROM saved_articles WHERE user_id = ? AND article_id = ?',\n                            [req.user.id, articleId],\n                            function(err) {\n                                if (err) reject(err);\n                                else resolve({ changes: this.changes });\n                            }\n                        );\n                    });\n                    \n                    res.json({\n                        success: true,\n                        message: 'Article removed from saved list'\n                    });\n                    \n                } catch (error) {\n                    console.error('Remove saved article error:', error);\n                    res.status(500).json({\n                        error: 'Failed to remove article',\n                        message: 'Could not remove the article from your saved list'\n                    });\n                }\n            }\n        );\n    }\n\n    getRouter() {\n        return this.router;\n    }\n\n    async close() {\n        await this.authManager.close();\n    }\n}\n\nmodule.exports = UserRoutes;","line_range_start":1,"line_range_end":527}}
</function_results>

<function_calls>
<invoke name="mark_todo_as_done">
<parameter name="todo_ids">["91725809-23b3-4291-9e88-5cd3bdc14032"]
