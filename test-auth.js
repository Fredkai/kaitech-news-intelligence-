// Quick Authentication Test Script
// Run this after starting server-auth.js

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testAuthentication() {
    console.log('🧪 Testing KaiTech Authentication System...\n');
    
    try {
        // 1. Test Health Check
        console.log('1️⃣ Testing Health Check...');
        const health = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Health Check:', health.data);
        console.log('');
        
        // 2. Test Server Info
        console.log('2️⃣ Testing Server Info...');
        const serverInfo = await axios.get(`${BASE_URL}/api/server-info`);
        console.log('✅ Server Info:', {
            name: serverInfo.data.server_name,
            version: serverInfo.data.version,
            features: serverInfo.data.features,
            authenticated: serverInfo.data.authenticated
        });
        console.log('');
        
        // 3. Test User Registration
        console.log('3️⃣ Testing User Registration...');
        const testUser = {
            username: `testuser_${Date.now()}`,
            email: `test${Date.now()}@example.com`,
            password: 'Password123',
            display_name: 'Test User'
        };
        
        try {
            const registration = await axios.post(`${BASE_URL}/auth/register`, testUser);
            console.log('✅ Registration Success:', {
                success: registration.data.success,
                message: registration.data.message,
                user: registration.data.user
            });
            console.log('');
            
            // Store cookies for subsequent requests
            const cookies = registration.headers['set-cookie'];
            const cookieHeader = cookies ? cookies.join('; ') : '';
            
            // 4. Test Authentication Status
            console.log('4️⃣ Testing Authentication Status...');
            const authStatus = await axios.get(`${BASE_URL}/auth/status`, {
                headers: { Cookie: cookieHeader }
            });
            console.log('✅ Auth Status:', {
                authenticated: authStatus.data.authenticated,
                user: authStatus.data.user ? authStatus.data.user.display_name : 'No user'
            });
            console.log('');
            
            // 5. Test Personalized News (requires authentication)
            console.log('5️⃣ Testing Personalized News Feed...');
            try {
                const personalizedNews = await axios.get(`${BASE_URL}/api/news/personalized`, {
                    headers: { Cookie: cookieHeader }
                });
                console.log('✅ Personalized News:', {
                    success: personalizedNews.data.success,
                    articleCount: personalizedNews.data.articles.length,
                    pagination: personalizedNews.data.pagination
                });
            } catch (newsError) {
                console.log('📰 Personalized News (might need news data):', newsError.response?.data || newsError.message);
            }
            console.log('');
            
            // 6. Test Save Article
            console.log('6️⃣ Testing Save Article...');
            const articleData = {
                article_id: `test_article_${Date.now()}`,
                article_title: 'Test Article from API',
                article_url: 'https://example.com/test-article',
                article_source: 'Test Source'
            };
            
            try {
                const saveArticle = await axios.post(`${BASE_URL}/auth/saved-articles`, articleData, {
                    headers: { 
                        Cookie: cookieHeader,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ Save Article:', saveArticle.data);
            } catch (saveError) {
                console.log('💾 Save Article Error:', saveError.response?.data || saveError.message);
            }
            console.log('');
            
            // 7. Test Get Saved Articles
            console.log('7️⃣ Testing Get Saved Articles...');
            try {
                const savedArticles = await axios.get(`${BASE_URL}/auth/saved-articles`, {
                    headers: { Cookie: cookieHeader }
                });
                console.log('✅ Saved Articles:', {
                    success: savedArticles.data.success,
                    count: savedArticles.data.count,
                    articles: savedArticles.data.articles?.length || 0
                });
            } catch (savedError) {
                console.log('📚 Saved Articles Error:', savedError.response?.data || savedError.message);
            }
            console.log('');
            
            // 8. Test Update Preferences
            console.log('8️⃣ Testing Update Preferences...');
            const preferences = {
                news_categories: ['technology', 'business', 'science'],
                items_per_page: 25,
                notifications_enabled: true
            };
            
            try {
                const updatePrefs = await axios.put(`${BASE_URL}/auth/preferences`, preferences, {
                    headers: { 
                        Cookie: cookieHeader,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ Update Preferences:', updatePrefs.data);
            } catch (prefsError) {
                console.log('⚙️  Preferences Error:', prefsError.response?.data || prefsError.message);
            }
            console.log('');
            
            // 9. Test Logout
            console.log('9️⃣ Testing Logout...');
            try {
                const logout = await axios.post(`${BASE_URL}/auth/logout`, {}, {
                    headers: { Cookie: cookieHeader }
                });
                console.log('✅ Logout:', logout.data);
            } catch (logoutError) {
                console.log('🚪 Logout Error:', logoutError.response?.data || logoutError.message);
            }
            
        } catch (regError) {
            if (regError.response?.status === 400 && regError.response.data.message.includes('already exists')) {
                console.log('⚠️  User already exists (this is normal for testing)');
                
                // Try login instead
                console.log('3️⃣b Trying Login with existing user...');
                try {
                    const login = await axios.post(`${BASE_URL}/auth/login`, {
                        email: 'test@example.com',
                        password: 'Password123'
                    });
                    console.log('✅ Login Success:', login.data.success);
                } catch (loginError) {
                    console.log('❌ Login Failed:', loginError.response?.data || loginError.message);
                }
            } else {
                console.log('❌ Registration Failed:', regError.response?.data || regError.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Connection Error:', error.message);
        console.log('💡 Make sure the server is running: node server-auth.js');
    }
    
    console.log('\n🏁 Test Complete!');
    console.log('\n📋 Manual Testing Steps:');
    console.log('1. Visit http://localhost:8080/register to create an account');
    console.log('2. Visit http://localhost:8080/login to sign in');
    console.log('3. Visit http://localhost:8080/dashboard to see your personalized feed');
    console.log('4. Try saving articles and updating preferences');
    console.log('5. Test logout functionality');
}

// Run the test
if (require.main === module) {
    testAuthentication();
}

module.exports = { testAuthentication };
