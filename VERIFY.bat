@echo off
echo ========================================
echo   AgriTrade - MongoDB Atlas Verification
echo ========================================
echo.
echo Checking connection to cloud database...
echo.
cd backend && node verify-atlas.js
echo.
echo ========================================
if %errorlevel% neq 0 (
    echo [ERROR] Verification failed.
    echo Please check the troubleshooting tips above.
) else (
    echo [SUCCESS] Your database is ready!
)
echo ========================================
pause
