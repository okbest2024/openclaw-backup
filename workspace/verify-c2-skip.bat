@echo off
chcp 65001 >nul
cd /d C:\Users\Administrator\.openclaw\workspace
echo [TEST] 开始验证 C2 skip 逻辑...
echo.
echo 设置环境变量...
set IMA_BACKUP_SKIP=false
set IMA_BACKUP_INTERVAL=604800000
set IMA_BACKUP_MAX_SESSIONS=5
echo.
echo 运行 backup-to-ima.js（预期应跳过）...
echo.
node scripts\backup-to-ima.js
echo.
echo [TEST] 完成。
pause
