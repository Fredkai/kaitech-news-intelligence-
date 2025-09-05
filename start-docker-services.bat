@echo off
echo Starting Docker Desktop and News Services...
echo.

REM Start Docker Desktop
echo [1/4] Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

REM Wait for Docker to start
echo [2/4] Waiting for Docker to initialize (60 seconds)...
timeout /t 60 /nobreak > nul

REM Refresh environment variables
echo [3/4] Refreshing environment variables...
for /f "tokens=*" %%i in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH') do set "SYSTEM_PATH=%%i"
for /f "tokens=*" %%i in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%i"
set "PATH=%SYSTEM_PATH:~22%;%USER_PATH:~22%"

REM Check if Docker is available
echo [4/4] Checking Docker availability...
docker --version
if errorlevel 1 (
    echo Docker is not yet available. Please restart your terminal and try again.
    echo You may need to restart your computer after Docker Desktop installation.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Docker is ready! Starting news services...
echo ========================================
echo.

REM Build and start the services
cd /d "%~dp0"

echo Building Docker containers...
docker-compose build

echo Starting services...
docker-compose up -d

echo.
echo ========================================
echo Services are starting up!
echo ========================================
echo.
echo News API: http://localhost/api/breaking-news
echo AI Analyzer: http://localhost:3003/insights
echo Database Admin: http://localhost:5432
echo.
echo Press any key to view service logs...
pause > nul

echo.
echo ========================================
echo SERVICE LOGS
echo ========================================
echo.
docker-compose logs --tail=50 -f

pause
