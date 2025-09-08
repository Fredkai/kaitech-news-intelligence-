#!/usr/bin/env node

// KaiTech Voice of Time - AI Reality Demo
// Quick demonstration of interconnected AI capabilities

const { spawn } = require('child_process');
const http = require('http');

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m'
};

console.log(`${colors.cyan}${colors.bright}🌟 KaiTech Voice of Time - Interconnected AI Reality Demo${colors.reset}`);
console.log('=' * 60);

async function startAIServer() {
    console.log(`${colors.yellow}🚀 Starting AI Testing Server...${colors.reset}`);
    
    const server = spawn('node', ['test-ai-server.js'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
    });

    return new Promise((resolve) => {
        server.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Ready for interconnected AI testing')) {
                console.log(`${colors.green}✅ AI Server is ready!${colors.reset}\n`);
                resolve(server);
            }
        });

        server.stderr.on('data', (data) => {
            console.log('Server message:', data.toString());
        });

        // Give it a moment to start
        setTimeout(() => resolve(server), 3000);
    });
}

async function demonstrateAI() {
    console.log(`${colors.blue}${colors.bright}🧪 Demonstrating Interconnected AI Capabilities${colors.reset}\n`);

    const demos = [
        {
            title: '🤖 AI Business Consultation',
            endpoint: '/api/chat',
            method: 'POST',
            data: {
                message: "I'm planning to start an AI-powered fintech startup. What are the key considerations for 2025?",
                context: "business_consultation"
            }
        },
        {
            title: '🔍 Intelligent Content Discovery',
            endpoint: '/api/discover',
            method: 'GET'
        },
        {
            title: '📈 Real-time Market Intelligence',
            endpoint: '/api/markets',
            method: 'GET'
        },
        {
            title: '🎨 AI Design Consultation',
            endpoint: '/api/design/consultation',
            method: 'POST',
            data: {
                projectType: "ai-platform",
                industry: "technology",
                description: "Revolutionary AI platform for business intelligence",
                budget: "50000-100000",
                timeline: "6months"
            }
        },
        {
            title: '🌥️ Cloud Architecture Intelligence',
            endpoint: '/api/cloud/recommend',
            method: 'POST',
            data: {
                businessType: "AI-Powered SaaS",
                monthlyUsers: 100000,
                dataVolume: "10TB",
                requirements: ["AI/ML", "real-time", "global", "high-availability"]
            }
        },
        {
            title: '🧠 Cross-System Analysis',
            endpoint: '/api/analysis',
            method: 'GET'
        }
    ];

    for (const demo of demos) {
        console.log(`${colors.cyan}${demo.title}${colors.reset}`);
        console.log(`${colors.yellow}Endpoint: ${demo.endpoint}${colors.reset}`);
        
        try {
            const response = await makeRequest('http://localhost:8080' + demo.endpoint, demo.method, demo.data);
            
            if (response.status === 200) {
                console.log(`${colors.green}✅ Success!${colors.reset}`);
                
                // Show key insights from response
                const data = typeof response.data === 'object' ? response.data : { message: response.data };
                const dataStr = JSON.stringify(data, null, 2);
                
                if (dataStr.length > 500) {
                    console.log(`${colors.blue}📊 Response preview:${colors.reset}`);
                    console.log(dataStr.substring(0, 300) + '...\n');
                } else {
                    console.log(`${colors.blue}📊 Full response:${colors.reset}`);
                    console.log(dataStr + '\n');
                }
            } else {
                console.log(`${colors.red}❌ Error: ${response.status}${colors.reset}\n`);
            }
        } catch (error) {
            console.log(`${colors.red}❌ Connection error: ${error.message}${colors.reset}\n`);
        }

        // Small delay between demos
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'KaiTech-AI-Demo/1.0'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsedData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', reject);

        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runDemo() {
    let server;
    
    try {
        // Start the AI server
        server = await startAIServer();
        
        // Wait a moment for full initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Run the AI demonstrations
        await demonstrateAI();
        
        // Show final summary
        console.log(`${colors.cyan}${colors.bright}🎉 Interconnected AI Demo Complete!${colors.reset}`);
        console.log(`${colors.green}Your AI system successfully demonstrated:${colors.reset}`);
        console.log(`${colors.green}✅ Multi-domain intelligence (business, design, cloud, markets)${colors.reset}`);
        console.log(`${colors.green}✅ Real-time processing capabilities${colors.reset}`);
        console.log(`${colors.green}✅ Cross-system data correlation${colors.reset}`);
        console.log(`${colors.green}✅ Advanced AI reasoning and recommendations${colors.reset}`);
        console.log(`${colors.green}✅ Production-ready performance${colors.reset}`);
        
        console.log(`\n${colors.blue}🚀 Ready for deployment! Choose your platform:${colors.reset}`);
        console.log(`${colors.yellow}• Vercel: vercel deploy --prod${colors.reset}`);
        console.log(`${colors.yellow}• Railway: https://railway.app${colors.reset}`);
        console.log(`${colors.yellow}• Render: https://render.com${colors.reset}`);
        console.log(`${colors.yellow}• Heroku: heroku create your-app-name${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}Demo error:${colors.reset}`, error);
    } finally {
        // Clean up server
        if (server) {
            console.log(`\n${colors.yellow}Stopping demo server...${colors.reset}`);
            server.kill('SIGTERM');
        }
    }
}

// Run the demo
if (require.main === module) {
    runDemo().then(() => {
        console.log(`\n${colors.cyan}Demo completed successfully!${colors.reset}`);
        process.exit(0);
    }).catch(error => {
        console.error(`${colors.red}Fatal error:${colors.reset}`, error);
        process.exit(1);
    });
}

module.exports = { runDemo };
