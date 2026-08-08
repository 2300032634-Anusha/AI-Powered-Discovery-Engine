@echo off
echo ===================================================
echo   Discovery Engine App - Setup & Migration
echo ===================================================
echo.
echo 1. Installing root dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Root npm install failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Installing server dependencies...
call npm --prefix server install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Server npm install failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 3. Checking server\.env file...
if not exist "server\.env" (
    echo Copying server\.env.example to server\.env...
    copy "server\.env.example" "server\.env"
    echo [NOTE] Please check server\.env and update your MySQL password if needed.
)

echo.
echo 4. Running Database Migration & Seeding...
call npm --prefix server run migrate

echo.
echo ===================================================
echo   Setup Complete! Run start.bat to launch the app.
echo ===================================================
pause
