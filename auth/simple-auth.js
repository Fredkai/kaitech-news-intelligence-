// Simplified Authentication Manager (without OAuth for testing)
// Handles local authentication and session management

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const UserDatabase = require('../database/users');

class SimpleAuthenticationManager {
    constructor() {
        this.userDb = new UserDatabase();
        this.initializePassport();
    }

    // Initialize Passport.js strategies (local only for now)
    initializePassport() {
        // Local Strategy for email/password authentication
        passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, async (email, password, done) => {
            try {
                const user = await this.userDb.getUserByEmail(email);
                
                if (!user) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                if (!user.is_active) {
                    return done(null, false, { message: 'Account is deactivated' });
                }

                const isValidPassword = await this.userDb.validatePassword(password, user.password_hash);
                
                if (!isValidPassword) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // Update last login
                await this.userDb.updateLastLogin(user.id);

                return done(null, {
                    id: user.id,
                    uuid: user.user_uuid,
                    email: user.email,
                    username: user.username,
                    display_name: user.display_name,
                    avatar_url: user.avatar_url,
                    is_verified: user.is_verified
                });
            } catch (error) {
                return done(error);
            }
        }));

        // Serialize/deserialize user for session management
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id, done) => {
            try {
                const user = await this.userDb.getUserById(id);
                if (user) {
                    done(null, {
                        id: user.id,
                        uuid: user.user_uuid,
                        email: user.email,
                        username: user.username,
                        display_name: user.display_name,
                        avatar_url: user.avatar_url,
                        is_verified: user.is_verified,
                        preferences: {
                            news_categories: JSON.parse(user.news_categories || '[]'),
                            dark_mode: user.dark_mode,
                            language: user.language,
                            timezone: user.timezone,
                            notifications_enabled: user.notifications_enabled
                        }
                    });
                } else {
                    done(new Error('User not found'), null);
                }
            } catch (error) {
                done(error, null);
            }
        });
    }

    // Session configuration
    getSessionConfig() {
        return session({
            secret: process.env.SESSION_SECRET || 'kaitech-voice-of-time-secret-key-2024',
            resave: false,
            saveUninitialized: false,
            rolling: true,
            cookie: {
                secure: false, // Set to true in production with HTTPS
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'lax'
            },
            name: 'kaitech.sid'
        });
    }

    // Rate limiting for authentication endpoints
    getAuthRateLimit() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
            message: {
                error: 'Too many authentication attempts, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
    }

    // Login rate limiting (more restrictive)
    getLoginRateLimit() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 3, // Limit each IP to 3 login attempts per windowMs
            message: {
                error: 'Too many login attempts, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
    }

    // Validation rules for registration
    getRegistrationValidation() {
        return [
            body('email')
                .isEmail()
                .withMessage('Please provide a valid email address')
                .normalizeEmail(),
            body('password')
                .isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
                .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
            body('username')
                .isLength({ min: 3, max: 30 })
                .withMessage('Username must be between 3 and 30 characters')
                .matches(/^[a-zA-Z0-9_]+$/)
                .withMessage('Username can only contain letters, numbers, and underscores'),
            body('display_name')
                .optional()
                .isLength({ min: 1, max: 50 })
                .withMessage('Display name must be between 1 and 50 characters')
        ];
    }

    // Validation rules for login
    getLoginValidation() {
        return [
            body('email')
                .isEmail()
                .withMessage('Please provide a valid email address')
                .normalizeEmail(),
            body('password')
                .notEmpty()
                .withMessage('Password is required')
        ];
    }

    // Middleware to check if user is authenticated
    requireAuth(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        
        // If it's an API request, return JSON error
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please login to access this resource'
            });
        }
        
        // For regular requests, redirect to login
        req.session.returnTo = req.originalUrl;
        res.redirect('/login');
    }

    // Middleware to check if user is NOT authenticated (for login/register pages)
    requireNoAuth(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        
        // User is already logged in, redirect to dashboard
        res.redirect('/dashboard');
    }

    // Generate JWT for API access (optional, for mobile apps or API clients)
    generateJWT(user) {
        const payload = {
            id: user.id,
            uuid: user.uuid,
            email: user.email,
            username: user.username
        };

        return jwt.sign(payload, process.env.JWT_SECRET || 'kaitech-jwt-secret', {
            expiresIn: '7d',
            issuer: 'kaitech-voice-of-time',
            audience: 'kaitech-users'
        });
    }

    // Verify JWT token
    verifyJWT(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'kaitech-jwt-secret');
        } catch (error) {
            return null;
        }
    }

    // Middleware to handle JWT authentication for API endpoints
    authenticateJWT(req, res, next) {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            const decoded = this.verifyJWT(token);
            
            if (decoded) {
                req.user = decoded;
                return next();
            }
        }
        
        // If no valid JWT, check for session authentication
        if (req.isAuthenticated()) {
            return next();
        }
        
        res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid token or login'
        });
    }

    // Handle validation errors
    handleValidationErrors(req, res, next) {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        
        next();
    }

    // User registration handler
    async registerUser(req, res) {
        try {
            const { email, password, username, display_name } = req.body;

            // Check if user already exists
            const existingUserEmail = await this.userDb.getUserByEmail(email);
            if (existingUserEmail) {
                return res.status(400).json({
                    error: 'Registration failed',
                    message: 'A user with this email already exists'
                });
            }

            const existingUserUsername = await this.userDb.getUserByUsername(username);
            if (existingUserUsername) {
                return res.status(400).json({
                    error: 'Registration failed',
                    message: 'This username is already taken'
                });
            }

            // Create new user
            const newUser = await this.userDb.createUser({
                email,
                password,
                username,
                display_name: display_name || username,
                avatar_url: null,
                bio: null
            });

            // Auto-login after registration
            req.login(newUser, (err) => {
                if (err) {
                    console.error('Auto-login error:', err);
                    return res.status(201).json({
                        success: true,
                        message: 'Registration successful. Please login.',
                        user: {
                            id: newUser.id,
                            email: newUser.email,
                            username: newUser.username,
                            display_name: newUser.display_name
                        }
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Registration and login successful',
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        username: newUser.username,
                        display_name: newUser.display_name
                    },
                    jwt: this.generateJWT(newUser)
                });
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                error: 'Registration failed',
                message: 'An internal error occurred'
            });
        }
    }

    // Close database connection
    async close() {
        await this.userDb.close();
    }
}

module.exports = SimpleAuthenticationManager;
