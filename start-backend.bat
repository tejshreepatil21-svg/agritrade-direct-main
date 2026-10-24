@echo off
echo ========================================
echo   AgriTrade Direct - Starting Backend
echo ========================================
echo.

cd backend

echo Checking if node_modules exists...
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed.
)

echo.
echo Starting backend server on port 5000...
echo.
call npm run dev
