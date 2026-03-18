@echo off
REM 启动音频播放器服务器
cd /d "%~dp0"
echo Starting Audio Player Server...
node server.js
pause
