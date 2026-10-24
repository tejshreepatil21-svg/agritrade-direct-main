@echo off
echo ========================================
echo     AgriTrade Direct - Full Setup
echo ========================================
echo.
echo This will start both backend and frontend servers.
echo Please keep both terminal windows open.
echo.
pause

echo Starting Backend Server...
start "AgriTrade Backend" cmd /k "cd backend && npm install && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "AgriTrade Frontend" cmd /k "npm install && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Keep both terminal windows open.
echo Close this window when done.
pause
