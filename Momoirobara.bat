@echo off
set "URL=https://mrcaddlr.github.io/momoirobaira/"

where chrome.exe >nul 2>&1
if %errorlevel%==0 (
    start "" chrome.exe --app="%URL%" --start-maximized
    exit /b
)

where msedge.exe >nul 2>&1
if %errorlevel%==0 (
    start "" msedge.exe --app="%URL%" --start-maximized
    exit /b
)

echo Chrome or Microsoft Edge was not found.
pause
