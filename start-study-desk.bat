@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "APP_DIR=%ROOT_DIR%study-desk"

if not exist "%APP_DIR%\package.json" (
  echo Study desk folder not found:
  echo %APP_DIR%
  pause
  exit /b 1
)

netsh advfirewall firewall show rule name="Study Desk" >nul 2>&1
if errorlevel 1 (
  echo Adding firewall rule for Study Desk on port 4307...
  netsh advfirewall firewall add rule name="Study Desk" dir=in action=allow protocol=TCP localport=4307 >nul 2>&1
)

cd /d "%APP_DIR%"

if not exist "node_modules" (
  echo Dependencies are missing. Running npm install...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

if not exist "dist\index.html" (
  echo Production build not found. Running npm run build...
  call npm run build
  if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
  )
)

:: Check if server is already running on port 4307
netstat -ano | findstr "LISTENING" | findstr ":4307 " >nul 2>&1
if not errorlevel 1 (
  echo Study Desk server is already running.
  echo.
  echo   Local:   http://localhost:4307
  powershell -NoProfile -Command "try{(Invoke-RestMethod http://localhost:4307/api/network).network|%%{Write-Host \"  Network: $_\"}}catch{}" 2>nul
  echo.
  start "" "http://localhost:4307"
  timeout /t 3 /nobreak >nul
  exit /b 0
)

start "Study Desk Server" cmd /k "cd /d ""%APP_DIR%"" && npm start"

timeout /t 3 /nobreak >nul
start "" "http://localhost:4307"

exit /b 0
