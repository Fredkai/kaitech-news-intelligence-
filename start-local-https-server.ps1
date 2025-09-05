# KaiTech Simple HTTPS Development Server
# Quick local HTTPS server without Docker dependency

param(
    [int]$Port = 8443,
    [string]$CertPath = "ssl\kaitech-local.crt",
    [string]$KeyPath = "ssl\kaitech-local.key"
)

Write-Host "🌐 KaiTech Voice of Time - Local HTTPS Development Server" -ForegroundColor Cyan
Write-Host "=" * 60

# Check if SSL certificates exist
$sslDir = Join-Path $PSScriptRoot "ssl"
$certFile = Join-Path $PSScriptRoot $CertPath
$keyFile = Join-Path $PSScriptRoot $KeyPath

if (!(Test-Path $sslDir)) {
    Write-Host "⚠️  SSL directory not found. Generating certificates first..." -ForegroundColor Yellow
    & (Join-Path $PSScriptRoot "generate-ssl-certs.ps1")
}

# Check if we have Node.js for a simple server
$nodeAvailable = $false
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $nodeAvailable = $true
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Node.js not found. Trying Python alternative..." -ForegroundColor Yellow
}

if ($nodeAvailable) {
    # Create a simple Node.js HTTPS server script
    $serverScript = @'
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// SSL Options
const options = {
    key: fs.existsSync('ssl/kaitech-local.key') ? fs.readFileSync('ssl/kaitech-local.key') : null,
    cert: fs.existsSync('ssl/kaitech-local.crt') ? fs.readFileSync('ssl/kaitech-local.crt') : null
};

// Fallback to HTTP if no SSL certs
const useHTTPS = options.key && options.cert;
const serverModule = useHTTPS ? https : require('http');
const port = process.env.PORT || (useHTTPS ? 8443 : 8080);

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
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = serverModule.createServer(useHTTPS ? options : undefined, (req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(__dirname, pathname.substring(1));
    
    // Security headers
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    if (useHTTPS) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            // Try to serve index.html for SPA routing
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
            
            // Cache headers for static assets
            if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000');
            }
            
            res.writeHead(200);
            res.end(data);
        }
    });
});

server.listen(port, () => {
    const protocol = useHTTPS ? 'https' : 'http';
    console.log(`🚀 KaiTech server running at ${protocol}://localhost:${port}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🔒 SSL: ${useHTTPS ? 'Enabled' : 'Disabled (certificates not found)'}`);
    console.log('\n🌐 Access your site:');
    console.log(`   - ${protocol}://localhost:${port}`);
    console.log(`   - ${protocol}://127.0.0.1:${port}`);
    if (useHTTPS) {
        console.log(`   - ${protocol}://kaitech.local:${port} (add to hosts file)`);
    }
    console.log('\n⚠️  Note: You may need to accept the self-signed certificate warning in your browser.');
    console.log('\nPress Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down KaiTech development server...');
    server.close(() => {
        console.log('✅ Server stopped gracefully');
        process.exit(0);
    });
});
'@
    
    # Save the server script
    $serverScript | Out-File "temp-server.js" -Encoding UTF8
    
    Write-Host "🚀 Starting Node.js HTTPS development server..." -ForegroundColor Green
    Write-Host "📁 Serving from: $PWD" -ForegroundColor Yellow
    Write-Host "🔒 SSL Support: $(if (Test-Path $certFile) { 'Enabled' } else { 'Disabled (HTTP fallback)' })" -ForegroundColor Yellow
    Write-Host ""
    
    # Set port environment variable
    $env:PORT = $Port
    
    try {
        # Start the server
        node "temp-server.js"
    } finally {
        # Clean up temporary file
        if (Test-Path "temp-server.js") {
            Remove-Item "temp-server.js" -Force
        }
    }
    
} else {
    # Try Python alternative
    $pythonAvailable = $false
    try {
        $pythonVersion = python --version 2>$null
        if ($pythonVersion) {
            $pythonAvailable = $true
            Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Neither Node.js nor Python found." -ForegroundColor Red
    }
    
    if ($pythonAvailable) {
        Write-Host "🚀 Starting Python HTTP development server..." -ForegroundColor Green
        Write-Host "⚠️  Note: Python server will use HTTP (no SSL support)" -ForegroundColor Yellow
        Write-Host "🌐 Server will be available at: http://localhost:8080" -ForegroundColor Cyan
        Write-Host ""
        
        # Use Python's built-in HTTP server
        python -m http.server 8080
    } else {
        Write-Host "❌ Cannot start development server." -ForegroundColor Red
        Write-Host "Please install Node.js or Python to run a local development server." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Alternatives:" -ForegroundColor Cyan
        Write-Host "1. Install Node.js: https://nodejs.org/" -ForegroundColor White
        Write-Host "2. Install Python: https://python.org/" -ForegroundColor White
        Write-Host "3. Use Docker: Run Start-DockerServices.ps1" -ForegroundColor White
        Write-Host "4. Use IIS Express or Visual Studio Code Live Server extension" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
