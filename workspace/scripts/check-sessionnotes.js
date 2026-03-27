const fs = require('fs');

const file = 'memory/heartbeat-state.json';
const content = fs.readFileSync(file, 'utf8');

// Find "sessionNotes" key
const keyIndex = content.indexOf('"sessionNotes"');
if (keyIndex === -1) {
  console.log('No sessionNotes found');
  process.exit(1);
}

// Find the start of the object (after colon)
const colonIndex = content.indexOf(':', keyIndex);
const objStart = content.indexOf('{', colonIndex);
if (objStart === -1) {
  console.log('No opening brace for sessionNotes');
  process.exit(1);
}

// Find matching closing brace
let braceCount = 0;
let inString = false;
let escape = false;
let objEnd = -1;

for (let i = objStart; i < content.length; i++) {
  const c = content[i];
  
  if (c === '"' && !escape) {
    inString = !inString;
  }
  if (c === '\\' && inString) {
    escape = !escape;
  } else {
    escape = false;
  }
  
  if (!inString) {
    if (c === '{') braceCount++;
    if (c === '}') braceCount--;
    
    if (braceCount === 0 && c === '}') {
      objEnd = i + 1;
      break;
    }
  }
}

if (objEnd === -1) {
  console.log('Could not find end of sessionNotes object');
  process.exit(1);
}

const sessionNotesStr = content.slice(objStart, objEnd);
console.log('--- sessionNotes raw snippet (first 2000 chars) ---');
console.log(sessionNotesStr.slice(0, 2000));
console.log('--- end snippet ---');

try {
  const parsed = JSON.parse(sessionNotesStr);
  console.log('✅ sessionNotes object is valid JSON with', Object.keys(parsed).length, 'entries');
  console.log('Entries:', Object.keys(parsed));
} catch (e) {
  console.error('❌ sessionNotes parse error:', e.message);
}
