const fs = require('fs');
const c = fs.readFileSync('memory/heartbeat-state.json', 'utf8');
const idx = c.lastIndexOf('"sessionNotes"');
console.log('sessionNotes starts at', idx);
console.log('600 chars after:');
console.log(c.slice(idx, idx + 600));