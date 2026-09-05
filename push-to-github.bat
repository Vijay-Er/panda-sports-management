@echo off
title Push Panda Sports Academy to GitHub
echo ===================================================
echo   Pushing Panda Sports Academy Code to GitHub
echo ===================================================
echo.
cd /d "%~dp0"
set "PATH=%PATH%;C:\Users\vjraj\mingit\cmd;C:\Users\vjraj\mingit\mingw64\bin"
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Code pushed to GitHub successfully!
    echo Check the GitHub Actions tab to download your iOS IPA and Android APK!
) else (
    echo [NOTE] If prompted, please complete the sign-in in your browser window.
)
echo.
pause
