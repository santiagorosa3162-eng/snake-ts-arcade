@echo off
cd /d "%~dp0"

echo Checking Node installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

if not exist node_modules (
    echo First run detected.
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo npm install failed.
        pause
        exit /b 1
    )
)

echo Launching development server...
start "" cmd /k "cd /d %~dp0 && npm run dev"

exit
