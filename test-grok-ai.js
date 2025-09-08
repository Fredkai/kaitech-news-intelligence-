// Test Grok AI Integration
// This script tests the AI functions without running the full server

const axios = require('axios');

// Test configuration
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_API_KEY = process.env.GROK_API_KEY || 'your-grok-api-key-here';

console.log('🧪 Testing Grok AI Integration for News Platform');
console.log('================================================');

// Test news categorization
async function testCategorization() {
    try {
        console.log('\n1. Testing AI News Categorization...');
        
        const testText = "Breaking: OpenAI releases GPT-5 with revolutionary artificial intelligence capabilities that could transform machine learning and automation industries worldwide.";
        
        const prompt = `Categorize this news text into one of these categories: AI & Technology, Cryptocurrency, Environment, Politics, Business, Health, Sports, Entertainment, Science, or General. Return only the category name.\n\nText: "${testText}"`;
        
        const response = await axios.post(GROK_API_URL, {
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: 'You are a news categorization AI. Analyze the given text and return only the most appropriate category name.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 10,
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        const category = response.data.choices[0].message.content.trim();
        console.log(`✅ Category Result: "${category}"`);
        return true;
    } catch (error) {
        console.log(`❌ Categorization Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
}

// Test sentiment analysis
async function testSentiment() {
    try {
        console.log('\n2. Testing AI Sentiment Analysis...');
        
        const testHeadline = "Revolutionary breakthrough in cancer treatment shows promising results in clinical trials";
        
        const prompt = `Analyze the sentiment of this news headline. Return only one word: "positive", "negative", or "neutral".\n\nHeadline: "${testHeadline}"`;
        
        const response = await axios.post(GROK_API_URL, {
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: 'You are a sentiment analysis AI. Analyze news headlines and return only: positive, negative, or neutral.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 5,
            temperature: 0.1
        }, {
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 8000
        });
        
        const sentiment = response.data.choices[0].message.content.trim().toLowerCase();
        console.log(`✅ Sentiment Result: "${sentiment}"`);
        return true;
    } catch (error) {
        console.log(`❌ Sentiment Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
}

// Test news summarization
async function testSummarization() {
    try {
        console.log('\n3. Testing AI News Summarization...');
        
        const testTitle = "Major tech companies announce joint initiative for sustainable AI development";
        const testDescription = "Leading technology companies including Google, Microsoft, and OpenAI have announced a collaborative effort to develop more environmentally friendly artificial intelligence systems. The initiative focuses on reducing energy consumption and carbon footprint of AI training and deployment processes.";
        
        const prompt = `Summarize this news article in one concise sentence (max 100 characters):\n\nTitle: ${testTitle}\nDescription: ${testDescription}`;
        
        const response = await axios.post(GROK_API_URL, {
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: 'You are a news summarization AI. Create very concise, informative one-sentence summaries.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 50,
            temperature: 0.4
        }, {
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 8000
        });
        
        const summary = response.data.choices[0].message.content.trim();
        console.log(`✅ Summary Result: "${summary}"`);
        return true;
    } catch (error) {
        console.log(`❌ Summarization Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
}

// Test chat functionality
async function testChat() {
    try {
        console.log('\n4. Testing AI Chat Functionality...');
        
        const testMessage = "What are the latest trends in AI technology?";
        
        const response = await axios.post(GROK_API_URL, {
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant for KaiTech Voice of Time, a news and technology platform. You help users understand news, technology trends, and provide insightful analysis. Be professional, informative, and engaging.'
                },
                {
                    role: 'user',
                    content: testMessage
                }
            ],
            max_tokens: 150,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        const chatResponse = response.data.choices[0].message.content.trim();
        console.log(`✅ Chat Response: "${chatResponse.substring(0, 100)}..."`);
        return true;
    } catch (error) {
        console.log(`❌ Chat Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
}

// Run all tests
async function runTests() {
    if (!GROK_API_KEY || GROK_API_KEY === 'your-grok-api-key-here') {
        console.log('❌ No Grok API key found!');
        console.log('💡 Please set your GROK_API_KEY environment variable');
        console.log('   Example: $env:GROK_API_KEY="your-api-key"');
        console.log('   Or run: .\\setup-grok-api.ps1');
        return;
    }
    
    console.log(`🔑 Using API Key: ${GROK_API_KEY.substring(0, 10)}...`);
    
    const results = [];
    results.push(await testCategorization());
    results.push(await testSentiment());
    results.push(await testSummarization());
    results.push(await testChat());
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('\n📊 Test Results Summary');
    console.log('======================');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n🎉 All tests passed! Grok AI integration is working correctly.');
        console.log('🚀 Your news platform now has AI-powered features:');
        console.log('   - Smart categorization of news articles');
        console.log('   - Sentiment analysis of headlines');
        console.log('   - AI-generated summaries');
        console.log('   - Interactive AI chat assistant');
    } else {
        console.log('\n⚠️  Some tests failed. Check your API configuration.');
    }
}

// Run the tests
runTests().catch(console.error);
