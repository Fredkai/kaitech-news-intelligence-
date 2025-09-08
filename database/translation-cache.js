// KaiTech Voice of Time - Translation Cache Database
// Manages persistent storage of translations to avoid redundant API calls

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class TranslationCacheDB {
    constructor(dbPath = null) {
        this.dbPath = dbPath || path.join(__dirname, 'translation_cache.db');
        this.db = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            this.db = new sqlite3.Database(this.dbPath);
            
            await this.createTables();
            await this.createIndexes();
            
            this.isInitialized = true;
            console.log('✅ Translation cache database initialized');
            
            // Clean up old translations periodically
            this.setupCleanupSchedule();
            
        } catch (error) {
            console.error('Failed to initialize translation cache database:', error);
            throw error;
        }
    }

    async createTables() {
        const createTranslationCacheTable = `
            CREATE TABLE IF NOT EXISTS translation_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_hash TEXT NOT NULL,
                source_text TEXT NOT NULL,
                translated_text TEXT NOT NULL,
                source_language TEXT NOT NULL,
                target_language TEXT NOT NULL,
                provider TEXT NOT NULL,
                content_type TEXT NOT NULL DEFAULT 'text',
                character_count INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 1,
                expires_at DATETIME,
                metadata TEXT
            )
        `;

        const createArticleTranslationTable = `
            CREATE TABLE IF NOT EXISTS article_translations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                article_hash TEXT NOT NULL,
                article_url TEXT,
                original_title TEXT NOT NULL,
                translated_title TEXT NOT NULL,
                original_description TEXT,
                translated_description TEXT,
                source_language TEXT NOT NULL,
                target_language TEXT NOT NULL,
                provider TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 1,
                expires_at DATETIME,
                metadata TEXT
            )
        `;

        const createTranslationStatsTable = `
            CREATE TABLE IF NOT EXISTS translation_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                provider TEXT NOT NULL,
                source_language TEXT NOT NULL,
                target_language TEXT NOT NULL,
                requests_count INTEGER DEFAULT 1,
                characters_translated INTEGER DEFAULT 0,
                cache_hits INTEGER DEFAULT 0,
                cache_misses INTEGER DEFAULT 0,
                average_response_time REAL,
                errors_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date, provider, source_language, target_language)
            )
        `;

        const createUserTranslationPreferencesTable = `
            CREATE TABLE IF NOT EXISTS user_translation_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                preferred_language TEXT NOT NULL,
                auto_translate_enabled BOOLEAN DEFAULT 1,
                preferred_provider TEXT,
                excluded_languages TEXT, -- JSON array
                regional_preferences TEXT, -- JSON object
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `;

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(createTranslationCacheTable, (err) => {
                    if (err) return reject(err);
                });
                
                this.db.run(createArticleTranslationTable, (err) => {
                    if (err) return reject(err);
                });
                
                this.db.run(createTranslationStatsTable, (err) => {
                    if (err) return reject(err);
                });
                
                this.db.run(createUserTranslationPreferencesTable, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });
    }

    async createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_translation_cache_hash ON translation_cache(content_hash)',
            'CREATE INDEX IF NOT EXISTS idx_translation_cache_languages ON translation_cache(source_language, target_language)',
            'CREATE INDEX IF NOT EXISTS idx_translation_cache_provider ON translation_cache(provider)',
            'CREATE INDEX IF NOT EXISTS idx_translation_cache_expires ON translation_cache(expires_at)',
            'CREATE INDEX IF NOT EXISTS idx_article_translations_hash ON article_translations(article_hash)',
            'CREATE INDEX IF NOT EXISTS idx_article_translations_url ON article_translations(article_url)',
            'CREATE INDEX IF NOT EXISTS idx_article_translations_languages ON article_translations(source_language, target_language)',
            'CREATE INDEX IF NOT EXISTS idx_translation_stats_date ON translation_stats(date)',
            'CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_translation_preferences(user_id)'
        ];

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                let completed = 0;
                indexes.forEach((indexSql) => {
                    this.db.run(indexSql, (err) => {
                        if (err) return reject(err);
                        completed++;
                        if (completed === indexes.length) {
                            resolve();
                        }
                    });
                });
            });
        });
    }

    // Cache translation text
    async cacheTranslation(sourceText, translatedText, sourceLang, targetLang, provider, options = {}) {
        if (!this.isInitialized) await this.initialize();

        const contentHash = this.generateContentHash(sourceText, sourceLang, targetLang);
        const expiresAt = new Date(Date.now() + (options.ttl || 24 * 60 * 60 * 1000)); // 24 hours default
        
        const sql = `
            INSERT OR REPLACE INTO translation_cache 
            (content_hash, source_text, translated_text, source_language, target_language, 
             provider, content_type, character_count, expires_at, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            this.db.run(sql, [
                contentHash,
                sourceText,
                translatedText,
                sourceLang,
                targetLang,
                provider,
                options.contentType || 'text',
                sourceText.length,
                expiresAt.toISOString(),
                JSON.stringify(options.metadata || {})
            ], function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, contentHash });
            });
        });
    }

    // Get cached translation
    async getCachedTranslation(sourceText, sourceLang, targetLang) {
        if (!this.isInitialized) await this.initialize();

        const contentHash = this.generateContentHash(sourceText, sourceLang, targetLang);
        
        const sql = `
            SELECT * FROM translation_cache 
            WHERE content_hash = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
            ORDER BY created_at DESC LIMIT 1
        `;

        return new Promise((resolve, reject) => {
            this.db.get(sql, [contentHash], async (err, row) => {
                if (err) return reject(err);
                
                if (row) {
                    // Update access statistics
                    await this.updateAccessStats(row.id);
                    resolve({
                        translatedText: row.translated_text,
                        provider: row.provider,
                        cached: true,
                        cachedAt: row.created_at,
                        accessCount: row.access_count + 1
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Cache article translation
    async cacheArticleTranslation(article, translatedArticle, sourceLang, targetLang, provider, options = {}) {
        if (!this.isInitialized) await this.initialize();

        const articleHash = this.generateArticleHash(article);
        const expiresAt = new Date(Date.now() + (options.ttl || 7 * 24 * 60 * 60 * 1000)); // 7 days default
        
        const sql = `
            INSERT OR REPLACE INTO article_translations 
            (article_hash, article_url, original_title, translated_title, 
             original_description, translated_description, source_language, target_language, 
             provider, expires_at, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            this.db.run(sql, [
                articleHash,
                article.url || article.link,
                article.title,
                translatedArticle.translatedTitle,
                article.description,
                translatedArticle.translatedDescription,
                sourceLang,
                targetLang,
                provider,
                expiresAt.toISOString(),
                JSON.stringify(options.metadata || {})
            ], function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, articleHash });
            });
        });
    }

    // Get cached article translation
    async getCachedArticleTranslation(article, sourceLang, targetLang) {
        if (!this.isInitialized) await this.initialize();

        const articleHash = this.generateArticleHash(article);
        
        const sql = `
            SELECT * FROM article_translations 
            WHERE article_hash = ? AND source_language = ? AND target_language = ?
            AND (expires_at IS NULL OR expires_at > datetime('now'))
            ORDER BY created_at DESC LIMIT 1
        `;

        return new Promise((resolve, reject) => {
            this.db.get(sql, [articleHash, sourceLang, targetLang], async (err, row) => {
                if (err) return reject(err);
                
                if (row) {
                    // Update access statistics
                    await this.updateAccessStats(row.id, 'article_translations');
                    
                    resolve({
                        ...article,
                        translatedTitle: row.translated_title,
                        translatedDescription: row.translated_description,
                        originalLanguage: row.source_language,
                        targetLanguage: row.target_language,
                        translationProvider: row.provider,
                        cached: true,
                        cachedAt: row.created_at,
                        accessCount: row.access_count + 1
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Update translation statistics
    async updateTranslationStats(provider, sourceLang, targetLang, stats) {
        if (!this.isInitialized) await this.initialize();

        const today = new Date().toISOString().split('T')[0];
        
        const sql = `
            INSERT INTO translation_stats 
            (date, provider, source_language, target_language, requests_count, 
             characters_translated, cache_hits, cache_misses, average_response_time, errors_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date, provider, source_language, target_language) 
            DO UPDATE SET
                requests_count = requests_count + ?,
                characters_translated = characters_translated + ?,
                cache_hits = cache_hits + ?,
                cache_misses = cache_misses + ?,
                average_response_time = CASE 
                    WHEN average_response_time IS NULL THEN ?
                    ELSE (average_response_time + ?) / 2
                END,
                errors_count = errors_count + ?
        `;

        return new Promise((resolve, reject) => {
            this.db.run(sql, [
                today, provider, sourceLang, targetLang,
                stats.requests || 1,
                stats.characters || 0,
                stats.cacheHits || 0,
                stats.cacheMisses || 1,
                stats.responseTime || null,
                stats.errors || 0,
                // For ON CONFLICT UPDATE
                stats.requests || 1,
                stats.characters || 0,
                stats.cacheHits || 0,
                stats.cacheMisses || 1,
                stats.responseTime || null,
                stats.responseTime || null,
                stats.errors || 0
            ], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // User preferences management
    async saveUserTranslationPreferences(userId, preferences) {
        if (!this.isInitialized) await this.initialize();

        const sql = `
            INSERT OR REPLACE INTO user_translation_preferences 
            (user_id, preferred_language, auto_translate_enabled, preferred_provider,
             excluded_languages, regional_preferences, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `;

        return new Promise((resolve, reject) => {
            this.db.run(sql, [
                userId,
                preferences.language,
                preferences.autoTranslate ? 1 : 0,
                preferences.preferredProvider || null,
                JSON.stringify(preferences.excludedLanguages || []),
                JSON.stringify(preferences.regionalPreferences || {})
            ], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Get user preferences
    async getUserTranslationPreferences(userId) {
        if (!this.isInitialized) await this.initialize();

        const sql = `
            SELECT * FROM user_translation_preferences WHERE user_id = ?
        `;

        return new Promise((resolve, reject) => {
            this.db.get(sql, [userId], (err, row) => {
                if (err) return reject(err);
                
                if (row) {
                    resolve({
                        language: row.preferred_language,
                        autoTranslate: row.auto_translate_enabled === 1,
                        preferredProvider: row.preferred_provider,
                        excludedLanguages: JSON.parse(row.excluded_languages || '[]'),
                        regionalPreferences: JSON.parse(row.regional_preferences || '{}'),
                        updatedAt: row.updated_at
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Utility methods
    generateContentHash(text, sourceLang, targetLang) {
        const crypto = require('crypto');
        return crypto
            .createHash('sha256')
            .update(`${sourceLang}-${targetLang}-${text.substring(0, 1000)}`)
            .digest('hex')
            .substring(0, 32);
    }

    generateArticleHash(article) {
        const crypto = require('crypto');
        const identifier = article.url || article.link || article.title;
        return crypto
            .createHash('sha256')
            .update(identifier + (article.title || ''))
            .digest('hex')
            .substring(0, 32);
    }

    async updateAccessStats(recordId, table = 'translation_cache') {
        const sql = `
            UPDATE ${table} 
            SET last_accessed = datetime('now'), access_count = access_count + 1 
            WHERE id = ?
        `;

        return new Promise((resolve, reject) => {
            this.db.run(sql, [recordId], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Cleanup expired translations
    async cleanupExpiredTranslations() {
        if (!this.isInitialized) await this.initialize();

        const cleanupSql = [
            'DELETE FROM translation_cache WHERE expires_at < datetime("now")',
            'DELETE FROM article_translations WHERE expires_at < datetime("now")'
        ];

        let deletedCount = 0;
        
        for (const sql of cleanupSql) {
            await new Promise((resolve, reject) => {
                this.db.run(sql, function(err) {
                    if (err) return reject(err);
                    deletedCount += this.changes;
                    resolve();
                });
            });
        }

        console.log(`🗑️ Cleaned up ${deletedCount} expired translations`);
        return deletedCount;
    }

    // Setup automatic cleanup
    setupCleanupSchedule() {
        // Run cleanup every 6 hours
        setInterval(async () => {
            try {
                await this.cleanupExpiredTranslations();
            } catch (error) {
                console.error('Translation cache cleanup failed:', error);
            }
        }, 6 * 60 * 60 * 1000);
    }

    // Get cache statistics
    async getCacheStatistics() {
        if (!this.isInitialized) await this.initialize();

        const queries = {
            totalTranslations: 'SELECT COUNT(*) as count FROM translation_cache',
            totalArticleTranslations: 'SELECT COUNT(*) as count FROM article_translations',
            topLanguagePairs: `
                SELECT source_language, target_language, COUNT(*) as count 
                FROM translation_cache 
                GROUP BY source_language, target_language 
                ORDER BY count DESC LIMIT 10
            `,
            topProviders: `
                SELECT provider, COUNT(*) as count 
                FROM translation_cache 
                GROUP BY provider 
                ORDER BY count DESC
            `,
            recentActivity: `
                SELECT DATE(created_at) as date, COUNT(*) as translations 
                FROM translation_cache 
                WHERE created_at > datetime('now', '-30 days')
                GROUP BY DATE(created_at) 
                ORDER BY date DESC
            `
        };

        const stats = {};
        
        for (const [key, sql] of Object.entries(queries)) {
            stats[key] = await new Promise((resolve, reject) => {
                if (sql.includes('GROUP BY')) {
                    this.db.all(sql, (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows);
                    });
                } else {
                    this.db.get(sql, (err, row) => {
                        if (err) return reject(err);
                        resolve(row);
                    });
                }
            });
        }

        return stats;
    }

    // Close database connection
    async close() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) return reject(err);
                    console.log('Translation cache database closed');
                    resolve();
                });
            });
        }
    }
}

module.exports = TranslationCacheDB;
