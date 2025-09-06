# KaiTech Grok API Setup Script
# This script helps you configure the Grok API key for AI chat functionality

Write-Host "🤖 KaiTech Grok API Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Setting up AI chat functionality with Grok API..." -ForegroundColor Green
Write-Host ""

Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Get your free Grok API key from: https://console.x.ai/" -ForegroundColor White
Write-Host "2. Create an account and navigate to API keys" -ForegroundColor White
Write-Host "3. Generate a new API key for your application" -ForegroundColor White
Write-Host ""

# Check if .env file exists
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env file for environment variables..." -ForegroundColor Yellow
    New-Item -Path $envFile -ItemType File -Force | Out-Null
}

# Get API key from user
$apiKey = Read-Host "Enter your Grok API key (or press Enter to skip for now)"

if ($apiKey -and $apiKey.Trim() -ne "") {
    # Update .env file
    $envContent = Get-Content $envFile -ErrorAction SilentlyContinue
    $newEnvContent = @()
    $keyUpdated = $false
    
    foreach ($line in $envContent) {
        if ($line -like "GROK_API_KEY=*") {
            $newEnvContent += "GROK_API_KEY=$apiKey"
            $keyUpdated = $true
        } else {
            $newEnvContent += $line
        }
    }
    
    if (-not $keyUpdated) {
        $newEnvContent += "GROK_API_KEY=$apiKey"
    }
    
    $newEnvContent | Out-File -FilePath $envFile -Encoding UTF8
    
    Write-Host "✅ Grok API key saved to .env file!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping API key setup. You can add it later to the .env file:" -ForegroundColor Yellow
    Write-Host "   GROK_API_KEY=your_api_key_here" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm start" -ForegroundColor White
Write-Host "2. Open http://localhost:8080 in your browser" -ForegroundColor White
Write-Host "3. Test the AI chat functionality" -ForegroundColor White
Write-Host ""

Write-Host "📝 Note: If you don't have a Grok API key, the chat will still work" -ForegroundColor Yellow
Write-Host "with intelligent fallback responses!" -ForegroundColor Yellow
Write-Host ""

Write-Host "✨ Setup complete! Your AI-powered news chat is ready!" -ForegroundColor Green
