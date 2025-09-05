# KaiTech External Access Server
# This server allows access from phones and other devices on your network

param(
    [int]$Port = 8443,
    [switch]$HTTP = $false  # Use -HTTP flag for HTTP instead of HTTPS
)

Write-Host "🌐 KaiTech Voice of Time - External Access Server" -ForegroundColor Cyan
Write-Host "================================================="

# Get your local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress
if (-not $localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"}).IPAddress | Select-Object -First 1
}

if (-not $localIP) {
    Write-Host "❌ Could not detect your local IP address" -ForegroundColor Red
    Write-Host "Please check your network connection" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔍 Detected your local IP: $localIP" -ForegroundColor Green

# Check for Node.js
try {
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        throw "Node.js not found"
    }
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is required but not found" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check for SSL certificates (for HTTPS mode)
$useHTTPS = -not $HTTP
$sslDir = Join-Path $PSScriptRoot "ssl"
$certExists = (Test-Path (Join-Path $sslDir "kaitech-local.crt"))

if ($useHTTPS -and -not $certExists) {
    Write-Host "⚠️  SSL certificates not found. Generating them..." -ForegroundColor Yellow
    try {
        & (Join-Path $PSScriptRoot "create-ssl-simple.ps1")
        $certExists = (Test-Path (Join-Path $sslDir "kaitech-local.crt"))
    } catch {
        Write-Host "⚠️  SSL generation failed. Falling back to HTTP mode..." -ForegroundColor Yellow
        $useHTTPS = $false
    }
}

if ($HTTP -or -not $certExists) {
    $useHTTPS = $false
    $Port = 8080
}

$protocol = if ($useHTTPS) { "https" } else { "http" }

# Create the external server script
$serverScript = @"
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');

// Get network interfaces
const interfaces = os.networkInterfaces();
let localIP = 'localhost';

// Find local IP address
for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            if (iface.address.startsWith('192.168.') || 
                iface.address.startsWith('10.') || 
                iface.address.startsWith('172.')) {
                localIP = iface.address;
                break;
            }
        }
    }
}

const useHTTPS = $($useHTTPS.ToString().ToLower());
const port = $Port;

let server;

if (useHTTPS) {
    try {
        const https = require('https');
        const sslOptions = {
            key: fs.readFileSync(path.join(__dirname, 'ssl', 'kaitech-local.key')),
            cert: fs.readFileSync(path.join(__dirname, 'ssl', 'kaitech-local.crt'))
        };
        server = https.createServer(sslOptions);
        console.log('🔒 HTTPS mode enabled with SSL certificates');
    } catch (error) {
        console.log('⚠️  SSL certificates not available, falling back to HTTP');
        const http = require('http');
        server = http.createServer();
    }
} else {
    const http = require('http');
    server = http.createServer();
    console.log('🌐 HTTP mode enabled');
}

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

server.on('request', (req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // CORS headers for external access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Security headers
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Health check
    if (pathname === '/health') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'healthy',
            server: 'KaiTech Voice of Time',
            protocol: useHTTPS ? 'https' : 'http',
            localIP: localIP,
            port: port,
            timestamp: new Date().toISOString()
        }, null, 2));
        return;
    }
    
    const filePath = path.join(__dirname, pathname.substring(1));
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (pathname !== '/index.html') {
                const indexPath = path.join(__dirname, 'index.html');
                fs.readFile(indexPath, (indexErr, indexData) => {
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
            
            if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'].includes(ext)) {
                res.setHeader('Cache-Control', 'public, max-age=3600');
            }
            
            res.writeHead(200);
            res.end(data);
        }
    });
});

// Bind to all interfaces (0.0.0.0) to allow external access
server.listen(port, '0.0.0.0', () => {
    const protocol = useHTTPS ? 'https' : 'http';
    
    console.log('');
    console.log('🚀 KaiTech Voice of Time - External Access Server');
    console.log('=================================================');
    console.log(`📱 Server accessible from external devices!`);
    console.log('');
    console.log('🌐 Access from this computer:');
    console.log(`   - ${protocol}://localhost:${port}`);
    console.log(`   - ${protocol}://127.0.0.1:${port}`);
    console.log('');
    console.log('📱 Access from phone/tablet on same network:');
    console.log(`   - ${protocol}://${localIP}:${port}`);
    console.log('');
    console.log('📡 Available endpoints:');
    console.log(`   - Main Site: ${protocol}://${localIP}:${port}`);
    console.log(`   - Health Check: ${protocol}://${localIP}:${port}/health`);
    
    if (useHTTPS) {
        console.log('');
        console.log('⚠️  Certificate Notes:');
        console.log('   - Self-signed certificate may show warnings');
        console.log('   - On mobile: Accept certificate warning to proceed');
        console.log('   - Certificate is safe for local development');
    }
    
    console.log('');
    console.log('📱 Mobile Access Instructions:');
    console.log('1. Ensure your phone is on the same Wi-Fi network');
    console.log(`2. Open browser and go to: ${protocol}://${localIP}:${port}`);
    console.log('3. Accept any certificate warnings (HTTPS only)');
    console.log('4. Enjoy your KaiTech website on mobile!');
    
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port} is already in use`);
        console.log('   Try a different port or stop the conflicting service');
    } else {
        console.log('❌ Server error:', err.message);
    }
});

process.on('SIGINT', () => {
    console.log('\\n👋 Shutting down external access server...');
    server.close(() => {
        console.log('✅ Server stopped gracefully');
        process.exit(0);
    });
});
"@

# Save the server script
$serverScript | Out-File "external-server.js" -Encoding UTF8

Write-Host ""
Write-Host "🚀 Starting external access server..." -ForegroundColor Green
Write-Host "📱 Your website will be accessible from phones and tablets!" -ForegroundColor Cyan
Write-Host ""

try {
    node "external-server.js"
} finally {
    # Clean up
    if (Test-Path "external-server.js") {
        Remove-Item "external-server.js" -Force
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
