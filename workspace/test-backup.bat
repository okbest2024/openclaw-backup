@echo off
cd /d C:\Users\Administrator\.openclaw\workspace
set IMA_BACKUP_SKIP=false
set IMA_BACKUP_INTERVAL=604800000
set IMA_BACKUP_MAX_SESSIONS=5
node scripts\backup-to-ima.js
pause
