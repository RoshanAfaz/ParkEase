@echo off
echo ========================================
echo Starting ParkEasy Frontend
echo ========================================
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file with your settings!
    echo Set VITE_API_URL=http://localhost:8000
    echo.
    pause
)

echo Starting development server...
echo.
echo Frontend will be available at:
echo   http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev