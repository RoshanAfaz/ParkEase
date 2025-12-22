@echo off
echo ========================================
echo ParkEasy Backend Setup Script
echo ========================================
echo.

cd backend

echo [1/5] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    echo Make sure Python is installed and in PATH
    pause
    exit /b 1
)
echo ✓ Virtual environment created
echo.

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated
echo.

echo [3/5] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [4/5] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo ✓ .env file created
    echo.
    echo IMPORTANT: Please edit backend\.env file with your settings!
    echo At minimum, set:
    echo   - MONGODB_URL
    echo   - SECRET_KEY
    echo.
) else (
    echo ✓ .env file already exists
    echo.
)

echo [5/5] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Edit backend\.env with your MongoDB URL and SECRET_KEY
echo 2. Run: python seed_data.py (to populate database)
echo 3. Run: python main.py (to start server)
echo.
echo Or run start_backend.bat to start the server
echo ========================================
pause