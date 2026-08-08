@echo off
echo ===================================================
echo   Starting Discovery Engine App (Backend + Frontend)
echo ===================================================
echo.
echo Starting Backend API Server (Port 5000)...
start "Discovery Engine - Backend API" cmd /k "cd server && npm start"

echo Starting Frontend Dev Server (Port 3000)...
start "Discovery Engine - Frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo   App is starting up!
echo   Frontend UI: http://localhost:3000
echo   Backend API: http://localhost:5000
echo ===================================================
