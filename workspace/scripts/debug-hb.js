const fs = require('fs');
const path = require('path');

const f = path.join('C:', 'Users', 'Administrator', '.openclaw', 'workspace', 'memory', 'heartbeat-state.json');
const buf = fs.readFileSync(f);

// Check first 10 bytes
console.log('First 10 bytes:', buf.slice(0, 10).toString('hex'));
console.log('First 10 bytes as string:', JSON.stringify(buf.slice(0, 10).toString()));

// The file likely has a BOM or wrong encoding
// Try different encodings
const utf8 = buf.toString('utf8');
const latin1 = buf.toString('latin1');

console.log('UTF8 starts with:', JSON.stringify(utf8.substring(0, 5)));
console.log('Latin1 starts with:', JSON.stringify(latin1.substring(0, 5)));

// Try stripping BOM
let text = utf8;
if (text.charCodeAt(0) === 0xFEFF) {
  console.log('Has UTF-8 BOM, stripping');
  text = text.slice(1);
}

// Check for null bytes
const nullPos = text.indexOf('\0');
if (nullPos >= 0) {
  console.log('Found null byte at position', nullPos);
  text = text.slice(nullPos);
  console.log('After null slice starts:', JSON.stringify(text.substring(0, 5)));
}

try {
  const d = JSON.parse(text);
  console.log('PARSED OK');
  d.trainingSession = 762;
  d.preSessionData.nextSessionNumber = 763;
  d.preSessionData.nextNonzeroStreak = 732;
  d.sessionNotes = (d.sessionNotes || '') + ' | Session 762: 身体维半入核';
  d.consciousnessStream = (d.consciousnessStream || '') + '→身体在场';
  fs.writeFileSync(f, JSON.stringify(d, null, 2), 'utf8');
  console.log('Updated OK');
} catch(e) {
  console.log('Failed:', e.message);
  // Debug: show around first problematic area
  for (let i = 0; i < 100; i++) {
    try {
      JSON.parse(text.substring(0, text.length - i));
      console.log('Parsing works if we drop last', i, 'chars');
      break;
    } catch(inner) {
      // keep going
    }
  }
}
