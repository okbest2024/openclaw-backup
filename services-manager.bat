@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:menu
cls
echo.
echo ==========================================
echo     🚀 服务管理器
echo ==========================================
echo.
echo   OpenClaw 网关 (端口 18789):
echo     状态: 
netstat -ano | findstr ":18789" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo        ✓ 运行中
) else (
    echo        ✗ 未运行
)
echo.
echo   音频播放器 (端口 3000):
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo        ✓ 运行中
) else (
    echo        ✗ 未运行
)
echo.
echo   监控任务:
schtasks /query /tn "OpenClawMonitor" 2>nul | findstr "运行中" >nul 2>&1
if %errorlevel% equ 0 (
    echo        ✓ 运行中
) else (
    echo        ✗ 未运行
)
echo.
echo ==========================================
echo.
echo   1. 启动所有服务
echo   2. 停止所有服务
echo   3. 重启 OpenClaw 网关
echo   4. 重启音频播放器
echo   5. 启动监控服务
echo   6. 查看日志
echo   0. 退出
echo.
set /p choice=请选择 [0-6]: 

if "%choice%"=="1" goto startall
if "%choice%"=="2" goto stopall
if "%choice%"=="3" goto restartopenclaw
if "%choice%"=="4" goto restartaudio
if "%choice%"=="5" goto startmonitor
if "%choice%"=="6" goto logs
if "%choice%"=="0" exit
goto menu

:startall
echo.
echo 正在启动所有服务...
echo.

:: 启动 OpenClaw 网关
echo [1/3] 启动 OpenClaw 网关...
start /B "" "D:\Program Files\nodejs\node.exe" "E:\agi\opencode\openclaw\package\dist\index.js" gateway --port 18789
timeout /t 5 >nul

:: 启动音频播放器
echo [2/3] 启动音频播放器...
start /B "" "D:\Program Files\nodejs\node.exe" "E:\agi\opencode\openclaw\audio-player\server.js"
timeout /t 3 >nul

:: 启动监控服务
echo [3/3] 启动监控服务...
schtasks /run /tn "OpenClawMonitor" 2>nul

echo.
echo ✓ 所有服务已启动
pause
goto menu

:stopall
echo.
echo 正在停止所有服务...
echo.

:: 停止 OpenClaw 网关
echo [1/3] 停止 OpenClaw 网关...
schtasks /end /tn "OpenClaw Gateway" 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *gateway*" 2>nul

:: 停止音频播放器
echo [2/3] 停止音频播放器...
schtasks /end /tn "AudioPlayerServer" 2>nul
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%p 2>nul
)

:: 停止监控服务
echo [3/3] 停止监控服务...
schtasks /end /tn "OpenClawMonitor" 2>nul

echo.
echo ✓ 所有服务已停止
pause
goto menu

:restartopenclaw
echo.
echo 正在重启 OpenClaw 网关...
schtasks /end /tn "OpenClaw Gateway" 2>nul
timeout /t 3 >nul
start /B "" "D:\Program Files\nodejs\node.exe" "E:\agi\opencode\openclaw\package\dist\index.js" gateway --port 18789
timeout /t 5 >nul
curl -s -o nul -w "HTTP状态: %%{http_code}" http://127.0.0.1:18789/ 2>nul
echo.
echo ✓ OpenClaw 网关已重启
pause
goto menu

:restartaudio
echo.
echo 正在重启音频播放器...
schtasks /end /tn "AudioPlayerServer" 2>nul
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%p 2>nul
)
timeout /t 2 >nul
start /B "" "D:\Program Files\nodejs\node.exe" "E:\agi\opencode\openclaw\audio-player\server.js"
timeout /t 3 >nul
echo.
echo ✓ 音频播放器已重启
pause
goto menu

:startmonitor
echo.
echo 正在启动监控服务...
schtasks /run /tn "OpenClawMonitor" 2>nul
echo ✓ 监控服务已启动
pause
goto menu

:logs
echo.
echo 选择日志:
echo   1. OpenClaw 网关日志
echo   2. 音频播放器日志
echo   3. 监控服务日志
set /p logchoice=选择 [1-3]: 

if "%logchoice%"=="1" (
    echo.
    echo === OpenClaw 网关日志 (最近20行) ===
    type "%TEMP%\openclaw\openclaw-%date:~0,4%-%date:~5,2%-%date:~8,2%.log" 2>nul | findstr /c:"" /c:"" /c:"" /c:"" /c:"" /c:"" /c:"" /c:"" /c:"" /c:"" | more
) else if "%logchoice%"=="2" (
    echo.
    echo === 音频播放器日志 ===
    type "E:\agi\opencode\openclaw\audio-player\logs\server.log" 2>nul | more
) else if "%logchoice%"=="3" (
    echo.
    echo === 监控服务日志 ===
    type "C:\Users\Administrator\.openclaw\logs\monitor.log" 2>nul | more
)
pause
goto menu