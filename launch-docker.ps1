# Simple Docker Launcher for Voice of Time News Services

Write-Host "Voice of Time - Docker Service Launcher" -ForegroundColor Green
Write-Host "========================================"

# Check if Docker is in PATH
try {
    docker --version
    Write-Host "Docker is available in PATH" -ForegroundColor Green
} catch {
    Write-Host "Docker not found in PATH. Searching..." -ForegroundColor Yellow
    
    # Try common Docker locations
    $dockerPaths = @(
        "C:\Program Files\Docker\Docker\resources\bin\docker.exe",
        "C:\ProgramData\DockerDesktop\version-bin\docker.exe"
    )
    
    $found = $false
    foreach ($path in $dockerPaths) {
        if (Test-Path $path) {
            Write-Host "Found Docker at: $path" -ForegroundColor Green
            $dockerDir = Split-Path $path -Parent
            $env:PATH = $env:PATH + ";" + $dockerDir
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "Docker not found. Please install Docker Desktop." -ForegroundColor Red
        exit 1
    }
}

# Start Docker Desktop if not running
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Waiting for Docker to start (60 seconds)..." -ForegroundColor Yellow
    Start-Sleep 60
}

# Test Docker daemon
Write-Host "Testing Docker daemon..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "Docker daemon is running!" -ForegroundColor Green
} catch {
    Write-Host "Docker daemon not ready. Please wait and try again." -ForegroundColor Red
    exit 1
}

# Check and generate SSL certificates
$sslDir = Join-Path $PSScriptRoot "ssl"
if (!(Test-Path $sslDir) -or !(Test-Path (Join-Path $sslDir "kaitech-local.crt"))) {
    Write-Host "Generating SSL certificates for HTTPS..." -ForegroundColor Yellow
    & (Join-Path $PSScriptRoot "generate-ssl-certs.ps1")
}

# Change to project directory
Set-Location $PSScriptRoot
Write-Host "Building Docker services with SSL support..." -ForegroundColor Yellow

# Build and start services
docker compose build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Starting services..." -ForegroundColor Yellow
    docker compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Services started successfully with HTTPS!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Available endpoints:" -ForegroundColor Cyan
        Write-Host "🔒 Main Site: https://localhost" -ForegroundColor Green
        Write-Host "📡 News API: https://localhost/api/breaking-news" -ForegroundColor White
        Write-Host "🤖 AI Analyzer: http://localhost:3003/insights" -ForegroundColor White
        Write-Host "📈 Trending: http://localhost:3003/trending" -ForegroundColor White
        Write-Host "🔍 Load Balancer: https://localhost:8443" -ForegroundColor White
        Write-Host "❤️ Health Check: https://localhost/health" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  Note: Accept the self-signed certificate warning in your browser" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Service status:" -ForegroundColor Yellow
        docker compose ps
        
        Write-Host ""
        Write-Host "Press Ctrl+C to stop monitoring logs"
        docker compose logs -f
    } else {
        Write-Host "Failed to start services" -ForegroundColor Red
    }
} else {
    Write-Host "Failed to build services" -ForegroundColor Red
}
