@echo off
title Library Management System - PHP Backend API
echo Starting PHP REST API on http://127.0.0.1:8000...
echo.

:: Try local XAMPP PHP if 'php' is not in global PATH
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    php -S 127.0.0.1:8000 -t backend
) else (
    if exist "D:\xampp\php\php.exe" (
        "D:\xampp\php\php.exe" -S 127.0.0.1:8000 -t backend
    ) else if exist "C:\xampp\php\php.exe" (
        "C:\xampp\php\php.exe" -S 127.0.0.1:8000 -t backend
    ) else (
        echo [ERROR] PHP executable not found in PATH or standard XAMPP paths.
        echo Please ensure PHP is installed or add it to your PATH.
        pause
    )
)
