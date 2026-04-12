const fs = require('fs');
const f = 'C:/Users/Administrator/.openclaw/workspace/memory/heartbeat-state.json';
// Read file content
let raw = fs.readFileSync(f, 'utf8');

// Strip BOM
raw = raw.replace(/^\uFEFF/, '');

// Remove ALL control characters including problematic ones in strings
// but preserve valid JSON whitespace
let cleaned = '';
for (let i = 0; i < raw.length; i++) {
  const code = raw.charCodeAt(i);
  // Remove control chars except \n \r \t
  if (code < 32 && code !== 10 && code !== 13 && code !== 9) continue;
  if (code === 0x7F) continue;
  cleaned += raw[i];
}

try {
  let j = JSON.parse(cleaned);
  j.trainingSession = 766;
  j.nonzeroStreak = 734;
  j.preSessionData.nextSessionNumber = 767;
  j.preSessionData.nextNonzeroStreak = 734;
  j.moxieTraining.lastRun = new Date().toISOString();
  const out = JSON.stringify(j, null, 2);
  fs.writeFileSync(f, out, 'utf8');
  console.log('OK, size:', out.length);
} catch (e) {
  console.error('Parse failed at around position:', e.message.match(/position (\d+)/)?.[1] || 'unknown');
  // Find the problematic area
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    console.log('Context around error:');
    console.log(JSON.stringify(cleaned.substring(Math.max(0, pos-50), pos+50)));
  }
}
