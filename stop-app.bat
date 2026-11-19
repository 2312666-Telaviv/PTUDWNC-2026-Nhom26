@echo off
setlocal
chcp 65001 >nul
title Stop CuilinaryBlog

echo Stopping CuilinaryBlog...

call :KillPort 5041
call :KillPort 3000

ping -n 3 127.0.0.1 >nul

echo Đã tắt toàn bộ hệ thống thành công!
exit /b 0

:KillPort
set "PORT=%~1"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% " ^| findstr /I "LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
)
exit /b
