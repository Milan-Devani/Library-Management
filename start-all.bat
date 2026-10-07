@echo off
title Library Management System - College Project Runner
echo ========================================================
echo   LIBRARY MANAGEMENT SYSTEM - COLLEGE PROJECT RUNNER
echo ========================================================
echo.
netstat -ano | findstr ":3307" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Launching MySQL on port 3307...
    start "LMS MySQL (Port 3307)" cmd /k "call start-mysql.bat"
    timeout /t 2 /nobreak >nul
)

echo Launching PHP REST API Backend...
start "LMS Backend API" cmd /k "call start-backend.bat"

echo Launching React Frontend Server...
start "LMS React Frontend" cmd /k "call start-frontend.bat"

echo.
echo Servers launched!
echo - Frontend: http://localhost:5173
echo - Backend API: http://127.0.0.1:8000/api
echo.
echo Default Admin Credentials:
echo Email: admin@library.com
echo Password: admin123
echo.
pause
