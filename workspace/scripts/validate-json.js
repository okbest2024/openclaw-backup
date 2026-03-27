const fs = require('fs');

const file = 'memory/heartbeat-state.json';
const content = fs.readFileSync(file, 'utf8');

let braceStack = [];
let inString = false;
let escape = false;
let line = 1;
let col = 0;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  if (c === '\n') { line++; col = 0; } else { col++; }
  
  if (c === '"' && !escape) {
    inString = !inString;
  }
  if (c === '\\' && inString) {
    escape = !escape;
  } else {
    escape = false;
  }
  
  if (!inString) {
    if (c === '{' || c === '[') {
      braceStack.push({ char: c, line, col });
    } else if (c === '}' || c === ']') {
      const open = braceStack.pop();
      if (!open) {
        console.error(`Unexpected closing ${c} at line ${line} col ${col} (position ${i})`);
        process.exit(1);
      }
      if ((open.char === '{' && c !== '}') || (open.char === '[' && c !== ']')) {
        console.error(`Mismatched brackets: opened with ${open.char} at line ${open.line} col ${open.col}, closed with ${c} at line ${line} col ${col}`);
        process.exit(1);
      }
    }
  }
}

if (braceStack.length > 0) {
  console.error('Unclosed brackets remain:');
  braceStack.forEach(b => console.error(`  ${b.char} at line ${b.line} col ${b.col}`));
  process.exit(1);
}

console.log('✅ All brackets matched');

// Now try full parse
try {
  JSON.parse(content);
  console.log('✅ JSON parsing succeeded');
} catch (e) {
  console.error('❌ JSON parse error:', e.message);
  // Find position
  const pos = e.message.match(/position (\d+)/);
  if (pos) {
    const p = parseInt(pos[1]);
    const start = Math.max(0, p - 100);
    const end = Math.min(content.length, p + 100);
    console.log('Context around position', p, ':');
    console.log(content.slice(start, end));
    console.log('^'.repeat(p - start));
  }
}
