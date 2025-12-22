@echo off
echo ========================================
echo Starting ParkEasy - Full Stack
echo ========================================
echo.
echo This will start both backend and frontend servers
echo in separate windows.
echo.
pause

echo Starting Backend Server...
start "ParkEasy Backend" cmd /k start_backend.bat

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "ParkEasy Frontend" cmd /k start_frontend.bat

echo.
echo ========================================
echo Both servers are starting...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Close this window or press any key to exit
echo (Servers will continue running in other windows)
echo ========================================
pause