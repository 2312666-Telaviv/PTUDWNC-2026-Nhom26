@echo off
setlocal
chcp 65001 >nul
title Start CuilinaryBlog

echo Starting CuilinaryBlog...

call :KillPort 5041
call :KillPort 3000

echo Ports 5041 and 3000 are ready.
echo Opening backend and frontend in separate windows...

start "Backend - CuilinaryBlog.API" /D "%~dp0" cmd /k "dotnet run --project src\CuilinaryBlog\CuilinaryBlog.API\CuilinaryBlog.API.csproj --launch-profile http"
start "Frontend - culinary-blog-web" /D "%~dp0" cmd /k "npm --prefix culinary-blog-web run dev"

echo Waiting 5 seconds for servers to start...
ping -n 6 127.0.0.1 >nul

echo Opening browser at http://localhost:3000
start "" "http://localhost:3000"

echo Done. Refresh the page once if the servers are still warming up.
exit /b 0

:KillPort
set "PORT=%~1"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% " ^| findstr /I "LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
)
exit /b
