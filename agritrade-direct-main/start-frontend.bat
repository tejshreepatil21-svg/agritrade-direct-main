@echo off
echo ========================================
echo   AgriTrade Direct - Starting Frontend
echo ========================================
echo.

echo Checking if node_modules exists...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed.
)

echo.
echo Starting frontend development server...
echo Frontend will open at http://localhost:5173
echo.
call npm run dev