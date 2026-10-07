@echo off
title Library Management System - Database Setup
echo ========================================================
echo   LIBRARY MANAGEMENT SYSTEM - DATABASE SETUP & SEED
echo ========================================================
echo.

:: Detect PHP executable
set "PHP_CMD="
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "PHP_CMD=php"
) else if exist "D:\xampp\php\php.exe" (
    set "PHP_CMD=D:\xampp\php\php.exe"
) else if exist "C:\xampp\php\php.exe" (
    set "PHP_CMD=C:\xampp\php\php.exe"
)

if "%PHP_CMD%"=="" (
    echo [ERROR] PHP executable not found in PATH or XAMPP folders.
    echo Please install XAMPP or add PHP to your Windows PATH.
    pause
    exit /b 1
)

echo Using PHP: %PHP_CMD%
"%PHP_CMD%" backend\setup_database.php
echo.
pause
