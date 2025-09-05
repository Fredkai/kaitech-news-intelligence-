// KaiTech Simple Development Server
// Works with or without SSL certificates

const fs = require('fs');
const path = require('path');
const url = require('url');

let server;
let useHTTPS = false;

// Check for SSL certificates
try {
    const sslOptions = {
        key: fs.readFileSync(path.join(__dirname, 'ssl', 'kaitech-local.key')),
        cert: fs.readFileSync(path.join(__dirname, 'ssl', 'kaitech-local.crt'))
    };
    
    const https = require('https');
    server = https.createServer(sslOptions);
    useHTTPS = true;
    console.log('✅ SSL certificates found - HTTPS mode enabled');
} catch (error) {
    // Fallback to HTTP
    const http = require('http');
    server = http.createServer();
    useHTTPS = false;
    console.log('⚠️  SSL certificates not found - HTTP mode (fallback)');
}

// MIME types for proper content serving
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

// Request handler
server.on('request', (req, res) => {
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
    
    // Special health endpoint
    if (pathname === '/health') {
        res.setHeader('Content-Type', 'text/plain');
        res.writeHead(200);
        res.end('KaiTech Voice of Time - Server Running\\nHTTPS: ' + (useHTTPS ? 'Enabled' : 'Disabled'));
        return;
    }
    
    // Serve files
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
            if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'].includes(ext)) {
                res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
            }
            
            res.writeHead(200);
            res.end(data);
        }
    });
});

// Start server
const port = process.env.PORT || (useHTTPS ? 8443 : 8080);
const protocol = useHTTPS ? 'https' : 'http';

server.listen(port, () => {
    console.log('');
    console.log('🚀 KaiTech Voice of Time Development Server');
    console.log('==========================================');
    console.log(`🌐 Server running at ${protocol}://localhost:${port}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🔒 SSL: ${useHTTPS ? 'Enabled' : 'Disabled'}`);
    console.log('');
    console.log('🌐 Access your site:');
    console.log(`   - ${protocol}://localhost:${port}`);
    console.log(`   - ${protocol}://127.0.0.1:${port}`);
    console.log('');
    console.log('📡 Available endpoints:');
    console.log(`   - Main Site: ${protocol}://localhost:${port}`);
    console.log(`   - Health Check: ${protocol}://localhost:${port}/health`);
    
    if (useHTTPS) {
        console.log('');
        console.log('⚠️  Note: You may need to accept the self-signed certificate warning in your browser.');
    }
    
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\n👋 Shutting down KaiTech development server...');
    server.close(() => {
        console.log('✅ Server stopped gracefully');
        process.exit(0);
    });
});
