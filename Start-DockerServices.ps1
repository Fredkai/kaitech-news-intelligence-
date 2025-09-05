# Voice of Time - Docker Services Starter
# This script manually configures Docker and starts the news services

Write-Host "Voice of Time - Starting Docker Services" -ForegroundColor Cyan
Write-Host "=" * 50

# Function to find Docker installation
function Find-DockerInstallation {
    $possiblePaths = @(
        "C:\Program Files\Docker\Docker\resources\bin\docker.exe",
        "C:\Program Files\Docker\Docker\resources\bin\docker.exe",
        "C:\ProgramData\DockerDesktop\version-bin\docker.exe",
        "$env:USERPROFILE\AppData\Local\Docker\resources\bin\docker.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    return $null
}

# Try to find Docker
Write-Host "Searching for Docker installation..." -ForegroundColor Yellow
$dockerPath = Find-DockerInstallation

if ($dockerPath) {
    Write-Host "Docker found at: $dockerPath" -ForegroundColor Green
    
    # Add Docker to PATH for this session
    $dockerDir = Split-Path $dockerPath -Parent
    $env:PATH = "$dockerDir;$env:PATH"
    
    # Test Docker
    try {
        $version = & $dockerPath --version
        Write-Host "Docker version: $version" -ForegroundColor Green
        
        # Start Docker Desktop if not running
        $dockerDesktop = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
        if (-not $dockerDesktop) {
            Write-Host "🔄 Starting Docker Desktop..." -ForegroundColor Yellow
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -WindowStyle Hidden
            Write-Host "⏳ Waiting 60 seconds for Docker to initialize..." -ForegroundColor Yellow
            Start-Sleep 60
        }
        
        # Check if Docker daemon is running
        Write-Host "🔄 Checking Docker daemon..." -ForegroundColor Yellow
        try {
            & $dockerPath ps > $null
            Write-Host "✅ Docker daemon is running!" -ForegroundColor Green
            
            # Check and generate SSL certificates
            $sslDir = Join-Path $PSScriptRoot "ssl"
            if (!(Test-Path $sslDir) -or !(Test-Path (Join-Path $sslDir "kaitech-local.crt"))) {
                Write-Host "`n🔒 SSL certificates not found. Generating them..." -ForegroundColor Yellow
                & (Join-Path $PSScriptRoot "generate-ssl-certs.ps1")
            } else {
                Write-Host "`n🔒 SSL certificates found and ready!" -ForegroundColor Green
            }
            
            # Now start the services
            Write-Host "`n🏗️ Building and starting Docker services with SSL..." -ForegroundColor Cyan
            Write-Host "This may take a few minutes the first time..." -ForegroundColor Yellow
            
            # Change to project directory
            Set-Location $PSScriptRoot
            
            # Build and start services
            & $dockerPath compose build
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Docker images built successfully!" -ForegroundColor Green
                
                & $dockerPath compose up -d
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Services started successfully!" -ForegroundColor Green
                    
                    Write-Host "`n🌐 Services are now running with HTTPS:" -ForegroundColor Cyan
                    Write-Host "├── 🔒 Main Site: https://localhost" -ForegroundColor Green
                    Write-Host "├── 🔐 HTTP Redirect: http://localhost (redirects to HTTPS)" -ForegroundColor Yellow
                    Write-Host "├── 📡 News API: https://localhost/api/breaking-news" -ForegroundColor White
                    Write-Host "├── 🤖 AI Analyzer: http://localhost:3003/insights" -ForegroundColor White
                    Write-Host "├── 📈 Trending Topics: http://localhost:3003/trending" -ForegroundColor White
                    Write-Host "├── 🔍 Load Balancer: https://localhost:8443" -ForegroundColor White
                    Write-Host "└── ❤️ Service Health: https://localhost/health" -ForegroundColor White
                    Write-Host ""
                    Write-Host "⚠️  Note: You may need to accept the self-signed certificate warning in your browser." -ForegroundColor Yellow
                    Write-Host "🔒 For trusted SSL: Import ssl/kaitech-local.crt into your browser's trusted certificates" -ForegroundColor Cyan
                    
                    Write-Host "`n📊 Checking service status..." -ForegroundColor Yellow
                    & $dockerPath compose ps
                    
                    Write-Host "`n🔍 Recent logs:" -ForegroundColor Yellow
                    & $dockerPath compose logs --tail=20
                    
                    Write-Host "`n✨ All services are ready!" -ForegroundColor Green
                    Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Yellow
                    
                    # Keep showing logs
                    & $dockerPath compose logs -f
                    
                } else {
                    Write-Host "❌ Failed to start services" -ForegroundColor Red
                }
            } else {
                Write-Host "❌ Failed to build Docker images" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "❌ Docker daemon is not running. Please start Docker Desktop manually." -ForegroundColor Red
            Write-Host "Then restart this script." -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Error testing Docker: $_" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    
    # Try alternative approach - check if Docker can be installed via winget
    Write-Host "`n🔄 Attempting to install Docker Desktop via winget..." -ForegroundColor Yellow
    try {
        winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
        Write-Host "✅ Docker Desktop installation initiated. Please restart this script after installation completes." -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not install Docker Desktop automatically." -ForegroundColor Red
        Write-Host "Please install manually from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    }
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
