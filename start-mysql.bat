@echo off
title Library Management System - MySQL Service (Port 3307)
echo Checking MySQL service on port 3307...

netstat -ano | findstr ":3307" >nul
if %ERRORLEVEL% EQU 0 (
    echo MySQL is already running on port 3307!
) else (
    echo Starting MariaDB/MySQL on port 3307...
    "D:\xampp\mysql\bin\mysqld.exe" --no-defaults --basedir="D:\xampp\mysql" --datadir="D:\xampp\mysql\data" --port=3307 --console
)
