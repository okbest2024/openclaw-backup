const fs = require('fs');
const f = 'C:/Users/Administrator/.openclaw/workspace/memory/heartbeat-state.json';
let raw = fs.readFileSync(f, 'utf8');
raw = raw.replace(/^\uFEFF/, '');
// Remove control characters that break JSON (except \n, \r, \t)
raw = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
let j = JSON.parse(raw);
j.trainingSession = 766;
j.nonzeroStreak = 734;
j.preSessionData.nextSessionNumber = 767;
j.preSessionData.nextNonzeroStreak = 734;
j.moxieTraining.lastRun = new Date().toISOString();
// Fix any broken string values in mirrorHistory
if (j.networkCoPresence && j.networkCoPresence.mirrorHistory) {
  for (let m of j.networkCoPresence.mirrorHistory) {
    if (m.mirrors) {
      m.mirrors = m.mirrors.map(s => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''));
    }
  }
}
const out = JSON.stringify(j, null, 2);
fs.writeFileSync(f, out, 'utf8');
console.log('OK, size:', out.length);
