@echo off
chcp 65001 > nul
echo.
echo ================================
echo  API Key Setup
echo ================================
echo.
echo API Key (sk-ant-...) wo paste shite Enter
echo.
set /p APIKEY=Key:
echo ANTHROPIC_API_KEY=%APIKEY%> "C:\Users\Owner\pet-bousai-ai\.env.local"
setx ANTHROPIC_API_KEY "%APIKEY%" >nul 2>&1
echo.
echo Kanryo! Any key to close...
pause > nul
