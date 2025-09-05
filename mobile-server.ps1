# KaiTech Mobile Access Server
# Simple server that allows access from phones and tablets

Write-Host "📱 KaiTech Voice of Time - Mobile Access Server" -ForegroundColor Cyan
Write-Host "=============================================="

# Get your local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -and $_.PrefixOrigin -eq "Dhcp"}).IPAddress | Select-Object -First 1

if (-not $localIP) {
    Write-Host "❌ Could not detect your Wi-Fi IP address" -ForegroundColor Red
    Write-Host "Please ensure you're connected to Wi-Fi and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔍 Detected your Wi-Fi IP: $localIP" -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) { throw "Node.js not found" }
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is required. Please install from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Create a simple HTTP server for mobile access
$serverJS = @"
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // CORS headers for mobile access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Default to index.html
    if (pathname === '/') pathname = '/index.html';
    
    // Health check endpoint
    if (pathname === '/health') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'healthy',
            server: 'KaiTech Voice of Time - Mobile Access',
            timestamp: new Date().toISOString()
        }));
        return;
    }
    
    const filePath = path.join(__dirname, pathname.substring(1));
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (pathname !== '/index.html') {
                // Try serving index.html for SPA routing
                fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexData) => {
                    if (indexErr) {
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        res.setHeader('Content-Type', 'text/html');
                        res.writeHead(200);
                        res.end(indexData);
                    }
                });
            } else {
                res.writeHead(404);
                res.end('404 Not Found');
            }
        } else {
            const ext = path.extname(filePath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            res.writeHead(200);
            res.end(data);
        }
    });
});

// Listen on all interfaces (0.0.0.0) for external access
server.listen(8080, '0.0.0.0', () => {
    console.log('');
    console.log('📱 KaiTech Voice of Time - Mobile Server Running!');
    console.log('================================================');
    console.log('🌐 Access from this computer:');
    console.log('   - http://localhost:8080');
    console.log('');
    console.log('📱 Access from your phone/tablet:');
    console.log('   - Make sure your phone is on the same Wi-Fi network');
    console.log('   - Open your browser and go to:');
    console.log('   - http://$localIP:8080');
    console.log('');
    console.log('🔍 Health check: http://$localIP:8080/health');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

process.on('SIGINT', () => {
    console.log('\nShutting down mobile server...');
    process.exit(0);
});
"@

# Replace $localIP in the JavaScript
$serverJS = $serverJS -replace '\$localIP', $localIP

# Save the server script
$serverJS | Out-File "temp-mobile-server.js" -Encoding UTF8

Write-Host ""
Write-Host "🚀 Starting mobile access server..." -ForegroundColor Green
Write-Host "📱 Your KaiTech website will be accessible from mobile devices!" -ForegroundColor Cyan
Write-Host ""

try {
    node "temp-mobile-server.js"
} finally {
    # Clean up
    if (Test-Path "temp-mobile-server.js") {
        Remove-Item "temp-mobile-server.js" -Force
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
