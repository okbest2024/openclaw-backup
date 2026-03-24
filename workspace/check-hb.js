const fs = require('fs');
const path = require('path');

const hbPath = path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw', 'workspace', 'memory', 'heartbeat-state.json');
console.log('Path:', hbPath);
console.log('Exists:', fs.existsSync(hbPath));

if (fs.existsSync(hbPath)) {
    try {
        const data = JSON.parse(fs.readFileSync(hbPath, 'utf-8'));
        console.log('trainingSession:', data.trainingSession);
        console.log('imaBackup.status:', data.imaBackup && data.imaBackup.status);
        console.log('imaBackup.nextAttemptSession:', data.imaBackup && data.imaBackup.nextAttemptSession);
        console.log('imaBackup.consecutiveFailures:', data.imaBackup && data.imaBackup.consecutiveFailures);
        console.log('backupStrategyC2.status:', data.backupStrategyC2 && data.backupStrategyC2.status);
        console.log('backupStrategyC2.nextAttemptSession:', data.backupStrategyC2 && data.backupStrategyC2.nextAttemptSession);
    } catch (e) {
        console.error('Parse error:', e.message);
    }
} else {
    console.log('heartbeat-state.json not found!');
}
