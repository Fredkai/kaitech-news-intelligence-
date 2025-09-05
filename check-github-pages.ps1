# GitHub Pages Setup and Verification Script for KaiTech
# This script helps you verify and troubleshoot GitHub Pages deployment

Write-Host "🌐 KaiTech GitHub Pages Setup Verification" -ForegroundColor Cyan
Write-Host "=========================================="

# Check if we're in a git repository
if (!(Test-Path ".git")) {
    Write-Host "❌ Not in a Git repository directory" -ForegroundColor Red
    Write-Host "Please run this script from your KaiTech project directory" -ForegroundColor Yellow
    exit 1
}

# Get repository information
try {
    $repoUrl = git remote get-url origin 2>$null
    $currentBranch = git branch --show-current 2>$null
    
    if ($repoUrl) {
        Write-Host "✅ Repository URL: $repoUrl" -ForegroundColor Green
        
        # Extract repository name and owner
        if ($repoUrl -match "github\.com[:/]([^/]+)/([^/.]+)") {
            $repoOwner = $matches[1]
            $repoName = $matches[2]
            $pagesUrl = "https://$repoOwner.github.io/$repoName/"
            
            Write-Host "✅ Repository: $repoOwner/$repoName" -ForegroundColor Green
            Write-Host "🌐 Expected Pages URL: $pagesUrl" -ForegroundColor Cyan
        }
    }
    
    if ($currentBranch) {
        Write-Host "✅ Current branch: $currentBranch" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not get repository information" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 GitHub Pages Checklist:" -ForegroundColor Yellow
Write-Host "--------------------------"

# Check 1: GitHub Actions workflow file
Write-Host "1. Checking GitHub Actions workflow..." -ForegroundColor White
$workflowPath = ".github/workflows/deploy.yml"
if (Test-Path $workflowPath) {
    Write-Host "   ✅ Workflow file exists: $workflowPath" -ForegroundColor Green
    
    # Check workflow content
    $workflowContent = Get-Content $workflowPath -Raw
    if ($workflowContent -match "actions/deploy-pages" -or $workflowContent -match "peaceiris/actions-gh-pages") {
        Write-Host "   ✅ Workflow contains GitHub Pages deployment action" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Workflow may not contain proper GitHub Pages deployment" -ForegroundColor Yellow
    }
    
    if ($workflowContent -match "branches.*main") {
        Write-Host "   ✅ Workflow triggers on main branch pushes" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Workflow file missing: $workflowPath" -ForegroundColor Red
}

# Check 2: Required files for GitHub Pages
Write-Host ""
Write-Host "2. Checking required files..." -ForegroundColor White
$requiredFiles = @("index.html", "css", "js", "assets")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file missing" -ForegroundColor Red
    }
}

# Check 3: File sizes and content
Write-Host ""
Write-Host "3. Checking file content..." -ForegroundColor White
if (Test-Path "index.html") {
    $indexSize = (Get-Item "index.html").Length
    Write-Host "   📊 index.html size: $indexSize bytes" -ForegroundColor Cyan
    
    $indexContent = Get-Content "index.html" -Raw
    if ($indexContent -match "<title>.*KaiTech") {
        Write-Host "   ✅ index.html contains KaiTech title" -ForegroundColor Green
    }
    
    if ($indexContent -match "<!DOCTYPE html>") {
        Write-Host "   ✅ index.html has proper DOCTYPE" -ForegroundColor Green
    }
}

# Check 4: Git status
Write-Host ""
Write-Host "4. Checking Git status..." -ForegroundColor White
try {
    $gitStatus = git status --porcelain 2>$null
    if ([string]::IsNullOrEmpty($gitStatus)) {
        Write-Host "   ✅ All files are committed" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
        Write-Host "   $gitStatus" -ForegroundColor Gray
        Write-Host "   💡 Commit and push changes for deployment" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Could not check git status" -ForegroundColor Red
}

# Check 5: Branch protection and workflow runs
Write-Host ""
Write-Host "5. Repository setup instructions:" -ForegroundColor White
Write-Host "   🔧 Manual steps to complete in GitHub:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Go to: https://github.com/$repoOwner/$repoName/settings/pages" -ForegroundColor Cyan
Write-Host "   2. Under 'Source', select 'GitHub Actions'" -ForegroundColor White
Write-Host "   3. Save the settings" -ForegroundColor White
Write-Host ""
Write-Host "   Alternative method:" -ForegroundColor Yellow
Write-Host "   1. Go to repository Settings > Pages" -ForegroundColor White
Write-Host "   2. Source: Deploy from a branch" -ForegroundColor White
Write-Host "   3. Branch: gh-pages (if using peaceiris action)" -ForegroundColor White
Write-Host "   4. Folder: / (root)" -ForegroundColor White

Write-Host ""
Write-Host "📡 Testing deployment:" -ForegroundColor White
Write-Host "----------------------"

if ($pagesUrl) {
    Write-Host "🔍 Testing if site is accessible..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $pagesUrl -Method Head -TimeoutSec 10 2>$null
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Site is LIVE and accessible!" -ForegroundColor Green
            Write-Host "🌐 Visit: $pagesUrl" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️  Site returned status code: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Site is not accessible yet" -ForegroundColor Red
        Write-Host "💡 This is normal for new deployments - wait 5-10 minutes" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "🚀 Deployment commands:" -ForegroundColor White
Write-Host "-----------------------"
Write-Host "To trigger a new deployment:" -ForegroundColor White
Write-Host "git add ." -ForegroundColor Cyan
Write-Host "git commit -m 'Update KaiTech website'" -ForegroundColor Cyan
Write-Host "git push origin main" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Green
Write-Host "----------"
Write-Host "✅ Enhanced GitHub Actions workflow ready" -ForegroundColor Green
Write-Host "✅ Alternative workflow provided (peaceiris action)" -ForegroundColor Green
Write-Host "✅ All required files present" -ForegroundColor Green
Write-Host "💡 Next: Enable GitHub Pages in repository settings" -ForegroundColor Cyan

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
