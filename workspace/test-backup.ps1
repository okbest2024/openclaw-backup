$env:IMA_BACKUP_SKIP="false"
$env:IMA_BACKUP_INTERVAL="604800000"
$env:IMA_BACKUP_MAX_SESSIONS="5"
node scripts/backup-to-ima.js 2>&1
