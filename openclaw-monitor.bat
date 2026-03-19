@echo off
chcp 65001 >nul

:: OpenClaw 网关监控脚本
:: 每5分钟检查一次，如果网关停止则自动重启

set LOG_FILE=C:\Users\Administrator\.openclaw\logs\monitor.log
set CHECK_INTERVAL=300

:: 创建日志目录
if not exist "C:\Users\Administrator\.openclaw\logs" (
    mkdir "C:\Users\Administrator\.openclaw\logs"
)

:loop
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%

:: 检查网关是否运行（使用 HTTP 健康检查）
curl -s -o nul -w "%%{http_code}" http://127.0.0.1:18789/ 2>nul | findstr "200" >nul 2>&1
if %errorlevel% equ 0 (
    echo [%timestamp%] 网关运行正常 >> "%LOG_FILE%"
) else (
    echo [%timestamp%] 网关未运行，正在重启... >> "%LOG_FILE%"
    
    :: 启动网关
    start /B "" "D:\Program Files\nodejs\node.exe" "E:\agi\opencode\openclaw\package\dist\index.js" gateway --port 18789
    
    :: 等待启动
    timeout /t 10 >nul
    
    :: 验证启动
    netstat -ano | findstr ":18789" | findstr "LISTENING" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [%timestamp%] 网关重启成功 >> "%LOG_FILE%"
    ) else (
        echo [%timestamp%] 网关重启失败 >> "%LOG_FILE%"
    )
)

:: 等待下一次检查
timeout /t %CHECK_INTERVAL% >nul
goto loop