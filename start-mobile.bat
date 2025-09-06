@echo off
title KaiTech Voice of Time - Mobile Server
color 0A

echo.
echo ======================================
echo  KaiTech Voice of Time - Mobile Server
echo ======================================
echo.
echo Starting server for mobile device access...
echo.
echo Your website will be available at:
echo   - Local: http://localhost:8080
echo   - Mobile: http://192.168.10.141:8080
echo   - Alt Mobile: http://192.168.56.1:8080
echo.
echo Mobile Instructions:
echo 1. Connect phone to same Wi-Fi network
echo 2. Open browser on phone
echo 3. Go to: http://192.168.10.141:8080
echo 4. Enjoy your KaiTech website!
echo.
echo Press Ctrl+C to stop server
echo.

node server.js

echo.
echo Server stopped. Press any key to exit...
pause > nul
