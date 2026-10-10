@echo off
rem CCNA Study Lab launcher: installs/builds if needed, starts the app, opens Chrome.
rem Double-click to run. Close this window (or press Ctrl+C) to stop the app.
setlocal
cd /d "%~dp0"
title CCNA Study Lab
set "URL=http://localhost:3000"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20 or newer from https://nodejs.org and try again.
  goto :fail
)

rem If the app is already running, just open the browser.
curl -s -o nul "%URL%" >nul 2>nul
if not errorlevel 1 (
  echo The app is already running.
  call :open_now
  exit /b 0
)

if not exist node_modules (
  echo Installing packages ^(first run only^)...
  call npm install
  if errorlevel 1 goto :fail
)

if not exist content\raw\Course_Notes (
  echo Downloading course notes ^(first run only^)...
  call npm run fetch-notes
  if errorlevel 1 goto :fail
)

if not exist public\notes (
  echo Downloading course images ^(first run only^)...
  call npm run ingest
  if errorlevel 1 goto :fail
)

rem Rebuild when there is no build yet, or when lessons or app code changed since the last one.
powershell -NoProfile -Command "$b='.next\BUILD_ID'; if (-not (Test-Path $b)) { exit 1 }; $t=(Get-Item $b).LastWriteTime; $dirs='content\lessons','content\manifest.json','content\drive-resources.json','app','components','lib' | Where-Object { Test-Path $_ }; if (Get-ChildItem $dirs -Recurse -File | Where-Object { $_.LastWriteTime -gt $t } | Select-Object -First 1) { exit 1 } else { exit 0 }"
if errorlevel 1 (
  echo Building the app...
  call npm run build
  if errorlevel 1 goto :fail
)

rem Open Chrome in the background once the server answers.
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for ($i=0; $i -lt 60; $i++) { try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 '%URL%' | Out-Null; break } catch { Start-Sleep 1 } }; try { Start-Process chrome '%URL%' -ErrorAction Stop } catch { Start-Process '%URL%' }"

echo.
echo CCNA Study Lab is running at %URL%
echo Close this window to stop it.
echo.
call npm start
exit /b 0

:open_now
start "" chrome "%URL%" 2>nul || start "" "%URL%"
exit /b 0

:fail
echo.
echo Something went wrong. See the messages above.
pause
exit /b 1
