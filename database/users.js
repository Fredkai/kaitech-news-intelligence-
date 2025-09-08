// User Database Model for KaiTech Voice of Time
// Handles user profiles, OAuth accounts, preferences, and sessions

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserDatabase {
    constructor() {
        // Create database file in the database directory
        const dbPath = path.join(__dirname, 'kaitech_users.db');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening user database:', err);
            } else {
                console.log('📊 User database connected successfully');
                this.initializeTables();
            }
        });
    }

    // Initialize database tables
    async initializeTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_uuid TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                username TEXT UNIQUE,
                password_hash TEXT,
                display_name TEXT NOT NULL,
                avatar_url TEXT,
                bio TEXT,
                location TEXT,
                website TEXT,
                is_verified BOOLEAN DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                email_verified BOOLEAN DEFAULT 0,
                phone TEXT,
                timezone TEXT DEFAULT 'UTC',
                language TEXT DEFAULT 'en'
            )
        `;

        const createOAuthAccountsTable = `
            CREATE TABLE IF NOT EXISTS oauth_accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                provider TEXT NOT NULL,
                provider_id TEXT NOT NULL,
                provider_username TEXT,
                provider_email TEXT,
                provider_data TEXT,
                access_token TEXT,
                refresh_token TEXT,
                expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                UNIQUE(provider, provider_id)
            )
        `;

        const createUserPreferencesTable = `
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                news_categories TEXT DEFAULT '["technology","business","world"]',
                notifications_enabled BOOLEAN DEFAULT 1,
                email_notifications BOOLEAN DEFAULT 1,
                breaking_news_alerts BOOLEAN DEFAULT 1,
                ai_recommendations BOOLEAN DEFAULT 1,
                dark_mode BOOLEAN DEFAULT 0,
                language TEXT DEFAULT 'en',
                timezone TEXT DEFAULT 'UTC',
                items_per_page INTEGER DEFAULT 20,
                auto_refresh BOOLEAN DEFAULT 1,
                custom_sources TEXT DEFAULT '[]',
                blocked_sources TEXT DEFAULT '[]',
                personalization_level TEXT DEFAULT 'medium',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `;

        const createUserSessionsTable = `
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_id TEXT UNIQUE NOT NULL,
                session_data TEXT,
                ip_address TEXT,
                user_agent TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `;

        const createSavedArticlesTable = `
            CREATE TABLE IF NOT EXISTS saved_articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                article_id TEXT NOT NULL,
                article_title TEXT NOT NULL,
                article_url TEXT NOT NULL,
                article_source TEXT,
                article_category TEXT,
                saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                tags TEXT DEFAULT '[]',
                notes TEXT,
                is_favorite BOOLEAN DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                UNIQUE(user_id, article_id)
            )
        `;

        const createUserInteractionsTable = `
            CREATE TABLE IF NOT EXISTS user_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                interaction_type TEXT NOT NULL,
                article_id TEXT,
                category TEXT,
                interaction_data TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `;

        const tables = [
            createUsersTable,
            createOAuthAccountsTable,
            createUserPreferencesTable,
            createUserSessionsTable,
            createSavedArticlesTable,
            createUserInteractionsTable
        ];

        for (const tableQuery of tables) {
            await new Promise((resolve, reject) => {
                this.db.run(tableQuery, (err) => {
                    if (err) {
                        console.error('Error creating table:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        console.log('✅ All user database tables initialized successfully');
    }

    // User CRUD Operations
    async createUser(userData) {
        const userUuid = uuidv4();
        const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 12) : null;

        const query = `
            INSERT INTO users (user_uuid, email, username, password_hash, display_name, avatar_url, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            this.db.run(query, [
                userUuid,
                userData.email,
                userData.username,
                hashedPassword,
                userData.display_name || userData.username || userData.email,
                userData.avatar_url,
                userData.bio
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Create default preferences
                    const userId = this.lastID;
                    const prefsQuery = `INSERT INTO user_preferences (user_id) VALUES (?)`;
                    
                    this.db.run(prefsQuery, [userId], (prefsErr) => {
                        if (prefsErr) {
                            console.warn('Warning: Could not create default preferences:', prefsErr);
                        }
                    });

                    resolve({
                        id: userId,
                        user_uuid: userUuid,
                        email: userData.email,
                        username: userData.username,
                        display_name: userData.display_name || userData.username || userData.email
                    });
                }
            });
        });
    }

    async getUserById(userId) {
        const query = `
            SELECT u.*, up.* FROM users u
            LEFT JOIN user_preferences up ON u.id = up.user_id
            WHERE u.id = ?
        `;

        return new Promise((resolve, reject) => {
            this.db.get(query, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getUserByEmail(email) {
        const query = `SELECT * FROM users WHERE email = ?`;
        
        return new Promise((resolve, reject) => {
            this.db.get(query, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getUserByUsername(username) {
        const query = `SELECT * FROM users WHERE username = ?`;
        
        return new Promise((resolve, reject) => {
            this.db.get(query, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async validatePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    // OAuth Account Management
    async createOAuthAccount(userId, provider, providerData) {
        const query = `
            INSERT OR REPLACE INTO oauth_accounts 
            (user_id, provider, provider_id, provider_username, provider_email, provider_data, access_token, refresh_token)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            this.db.run(query, [
                userId,
                provider,
                providerData.id,
                providerData.username || providerData.login,
                providerData.email,
                JSON.stringify(providerData),
                providerData.access_token,
                providerData.refresh_token
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async getOAuthAccount(provider, providerId) {
        const query = `SELECT * FROM oauth_accounts WHERE provider = ? AND provider_id = ?`;
        
        return new Promise((resolve, reject) => {
            this.db.get(query, [provider, providerId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getUserOAuthAccounts(userId) {
        const query = `SELECT * FROM oauth_accounts WHERE user_id = ?`;
        
        return new Promise((resolve, reject) => {
            this.db.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // User Preferences
    async updateUserPreferences(userId, preferences) {
        const query = `
            UPDATE user_preferences SET
                news_categories = ?,
                notifications_enabled = ?,
                email_notifications = ?,
                breaking_news_alerts = ?,
                ai_recommendations = ?,
                dark_mode = ?,
                language = ?,
                timezone = ?,
                items_per_page = ?,
                auto_refresh = ?,
                personalization_level = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `;

        return new Promise((resolve, reject) => {
            this.db.run(query, [
                JSON.stringify(preferences.news_categories || []),
                preferences.notifications_enabled,
                preferences.email_notifications,
                preferences.breaking_news_alerts,
                preferences.ai_recommendations,
                preferences.dark_mode,
                preferences.language,
                preferences.timezone,
                preferences.items_per_page,
                preferences.auto_refresh,
                preferences.personalization_level,
                userId
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // Saved Articles
    async saveArticle(userId, articleData) {
        const query = `
            INSERT OR REPLACE INTO saved_articles 
            (user_id, article_id, article_title, article_url, article_source, article_category, tags, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            this.db.run(query, [
                userId,
                articleData.id,
                articleData.title,
                articleData.url,
                articleData.source,
                articleData.category,
                JSON.stringify(articleData.tags || []),
                articleData.notes
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async getUserSavedArticles(userId, limit = 50) {
        const query = `
            SELECT * FROM saved_articles 
            WHERE user_id = ? 
            ORDER BY saved_at DESC 
            LIMIT ?
        `;

        return new Promise((resolve, reject) => {
            this.db.all(query, [userId, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => ({
                        ...row,
                        tags: JSON.parse(row.tags || '[]')
                    })));
                }
            });
        });
    }

    // User Interactions (for analytics and personalization)
    async recordUserInteraction(userId, interactionType, data) {
        const query = `
            INSERT INTO user_interactions (user_id, interaction_type, article_id, category, interaction_data)
            VALUES (?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            this.db.run(query, [
                userId,
                interactionType,
                data.article_id,
                data.category,
                JSON.stringify(data)
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    // Update last login
    async updateLastLogin(userId) {
        const query = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
        
        return new Promise((resolve, reject) => {
            this.db.run(query, [userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // Close database connection
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('👋 User database connection closed');
                    resolve();
                }
            });
        });
    }
}

module.exports = UserDatabase;
