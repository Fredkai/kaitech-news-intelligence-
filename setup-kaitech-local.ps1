# KaiTech Voice of Time - Complete Local Development Setup
# This script sets up everything needed for local development with HTTPS

param(
    [ValidateSet("docker", "simple", "both")]
    [string]$Mode = "both"
)

Write-Host "🚀 KaiTech Voice of Time - Complete Local Development Setup" -ForegroundColor Cyan
Write-Host "=" * 70

Write-Host "🔧 Setting up your local development environment..." -ForegroundColor Yellow

# Step 1: Generate SSL certificates
Write-Host "`n🔒 Step 1: SSL Certificate Setup" -ForegroundColor Green
Write-Host "-" * 40

$sslDir = Join-Path $PSScriptRoot "ssl"
if (!(Test-Path $sslDir) -or !(Test-Path (Join-Path $sslDir "kaitech-local.crt"))) {
    Write-Host "📜 Generating SSL certificates for HTTPS development..." -ForegroundColor Yellow
    & (Join-Path $PSScriptRoot "generate-ssl-certs.ps1")
} else {
    Write-Host "✅ SSL certificates already exist and are ready!" -ForegroundColor Green
}

# Step 2: Check Docker availability
Write-Host "`n🐳 Step 2: Docker Environment Check" -ForegroundColor Green
Write-Host "-" * 40

$dockerAvailable = $false
try {
    docker --version | Out-Null
    $dockerAvailable = $true
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker not found in PATH" -ForegroundColor Yellow
}

# Step 3: Check simple server requirements
Write-Host "`n💻 Step 3: Simple Server Requirements" -ForegroundColor Green
Write-Host "-" * 40

$nodeAvailable = $false
$pythonAvailable = $false

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $nodeAvailable = $true
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Node.js not found" -ForegroundColor Yellow
}

try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        $pythonAvailable = $true
        Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Python not found" -ForegroundColor Yellow
}

# Step 4: Display available options
Write-Host "`n🌐 Step 4: Available Server Options" -ForegroundColor Green
Write-Host "-" * 40

Write-Host "Your KaiTech development environment supports:" -ForegroundColor White
Write-Host ""

if ($dockerAvailable) {
    Write-Host "🐳 Docker Services (Full Stack):" -ForegroundColor Cyan
    Write-Host "   - Main Website with HTTPS" -ForegroundColor White
    Write-Host "   - News API backend" -ForegroundColor White
    Write-Host "   - AI Analysis services" -ForegroundColor White
    Write-Host "   - PostgreSQL database" -ForegroundColor White
    Write-Host "   - Redis caching" -ForegroundColor White
    Write-Host "   - Load balancer" -ForegroundColor White
    Write-Host "   📡 Endpoints: https://localhost, https://localhost:8443" -ForegroundColor Green
    Write-Host ""
}

if ($nodeAvailable -or $pythonAvailable) {
    Write-Host "⚡ Simple Development Server:" -ForegroundColor Cyan
    if ($nodeAvailable) {
        Write-Host "   - Node.js HTTPS server (with SSL certificates)" -ForegroundColor White
        Write-Host "   📡 Endpoint: https://localhost:8443" -ForegroundColor Green
    }
    if ($pythonAvailable) {
        Write-Host "   - Python HTTP server (fallback option)" -ForegroundColor White
        Write-Host "   📡 Endpoint: http://localhost:8080" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Step 5: Launch based on mode
Write-Host "`n🚀 Step 5: Launch Development Server" -ForegroundColor Green
Write-Host "-" * 40

if ($Mode -eq "docker" -or $Mode -eq "both") {
    if ($dockerAvailable) {
        Write-Host "🐳 Starting Docker services..." -ForegroundColor Cyan
        
        $choice = "y"
        if ($Mode -eq "both") {
            $choice = Read-Host "Do you want to start Docker services? (y/n)"
        }
        
        if ($choice -eq "y" -or $choice -eq "Y" -or $choice -eq "") {
            Write-Host "Launching Docker services with SSL..." -ForegroundColor Yellow
            & (Join-Path $PSScriptRoot "Start-DockerServices.ps1")
            return
        }
    } else {
        Write-Host "❌ Docker not available. Cannot start Docker services." -ForegroundColor Red
    }
}

if ($Mode -eq "simple" -or $Mode -eq "both") {
    if ($nodeAvailable -or $pythonAvailable) {
        Write-Host "⚡ Starting simple development server..." -ForegroundColor Cyan
        
        $choice = "y"
        if ($Mode -eq "both" -and $dockerAvailable) {
            $choice = Read-Host "Do you want to start the simple development server instead? (y/n)"
        }
        
        if ($choice -eq "y" -or $choice -eq "Y" -or $choice -eq "") {
            Write-Host "Launching simple HTTPS server..." -ForegroundColor Yellow
            & (Join-Path $PSScriptRoot "start-local-https-server.ps1")
            return
        }
    } else {
        Write-Host "❌ Neither Node.js nor Python available. Cannot start simple server." -ForegroundColor Red
    }
}

# Step 6: Installation recommendations
Write-Host "`n💡 Step 6: Recommendations" -ForegroundColor Green
Write-Host "-" * 40

if (!$dockerAvailable -and (!$nodeAvailable -and !$pythonAvailable)) {
    Write-Host "🔧 To get the best development experience, install:" -ForegroundColor Yellow
    Write-Host "1. 🐳 Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "   - Full-featured development environment" -ForegroundColor Gray
    Write-Host "   - All services included (database, caching, APIs)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. 📦 Node.js: https://nodejs.org/" -ForegroundColor White
    Write-Host "   - Simple HTTPS development server" -ForegroundColor Gray
    Write-Host "   - Quick testing and development" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. 🐍 Python: https://python.org/" -ForegroundColor White
    Write-Host "   - Basic HTTP development server" -ForegroundColor Gray
    Write-Host "   - Lightweight option" -ForegroundColor Gray
} else {
    Write-Host "✨ Your development environment is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Quick Start Commands:" -ForegroundColor Cyan
    
    if ($dockerAvailable) {
        Write-Host "   Docker Full Stack:  .\Start-DockerServices.ps1" -ForegroundColor White
    }
    
    if ($nodeAvailable -or $pythonAvailable) {
        Write-Host "   Simple Server:      .\start-local-https-server.ps1" -ForegroundColor White
    }
    
    Write-Host "   SSL Certificates:   .\generate-ssl-certs.ps1" -ForegroundColor White
    Write-Host "   This Setup:         .\setup-kaitech-local.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 KaiTech Voice of Time local development setup complete!" -ForegroundColor Green
Write-Host "📚 For more information, check the README.md file" -ForegroundColor Cyan

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
