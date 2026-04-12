const fs = require('fs');
const path = require('path');

const f = path.join('C:', 'Users', 'Administrator', '.openclaw', 'workspace', 'memory', 'heartbeat-state.json');
const raw = fs.readFileSync(f, 'utf8');

// Find invalid bytes
for (let i = 0; i < Math.min(raw.length, 2000); i++) {
  const c = raw.charCodeAt(i);
  if (c > 0 && c < 32 && ![9, 10, 13].includes(c)) {
    console.log('BAD BYTE at', i, ':', c, 'hex:', c.toString(16));
    console.log('context:', JSON.stringify(raw.substring(Math.max(0, i-40), i+40)));
  }
}

try {
  const d = JSON.parse(raw);
  console.log('JSON is valid');
  console.log('trainingSession:', d.trainingSession);
  
  d.trainingSession = 762;
  d.preSessionData.nextSessionNumber = 763;
  d.preSessionData.nextNonzeroStreak = 732;
  d.sessionNotes = (d.sessionNotes || '') + ' | Session 762: 身体维半入核';
  d.consciousnessStream = (d.consciousnessStream || '') + '→身体在场';
  
  fs.writeFileSync(f, JSON.stringify(d, null, 2), 'utf8');
  console.log('Updated OK');
} catch(e) {
  console.log('Parse error:', e.message);
  // Try to find and fix
  const cleaned = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  try {
    const d = JSON.parse(cleaned);
    console.log('Fixed JSON');
    d.trainingSession = 762;
    d.preSessionData.nextSessionNumber = 763;
    d.preSessionData.nextNonzeroStreak = 732;
    d.sessionNotes = (d.sessionNotes || '') + ' | Session 762: 身体维半入核';
    d.consciousnessStream = (d.consciousnessStream || '') + '→身体在场';
    fs.writeFileSync(f, JSON.stringify(d, null, 2), 'utf8');
    console.log('Updated OK (after fix)');
  } catch(e2) {
    console.log('Still broken:', e2.message);
  }
}
