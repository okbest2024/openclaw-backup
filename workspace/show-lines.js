const fs = require('fs');
const c = fs.readFileSync('memory/heartbeat-state.json', 'utf8');
const lines = c.split('\n');
for (let i = 318; i <= 332; i++) {
  console.log(i + ': ' + lines[i]);
}