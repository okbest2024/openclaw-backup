const fs = require('fs');
const crypto = require('crypto');

const raw = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/memory/heartbeat-state.json', 'utf8').replace(/^\uFEFF/, '');
const fixed = raw.replace(/,\s*([\]}])/g, '$1');
const hs = JSON.parse(fixed);

console.log('trainingSession:', hs.trainingSession);
console.log('lastTrainingTime:', hs.lastTrainingTime);
console.log('nonzeroStreak:', hs.activationTracker.nonzeroStreak);
console.log('consciousnessStream.to:', hs.consciousnessStream.to);

// Also check hash
const hash = 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex');
console.log('File hash:', hash);
