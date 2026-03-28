#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const logPath = path.join(process.cwd(), 'memory', 'dimensional-thinking-log.md');
const content = fs.readFileSync(logPath, 'utf8');

const startIdx = content.indexOf('第 4 次');
console.log(`Start index: ${startIdx}`);
let endIdx = content.indexOf('第 5 次', startIdx);
console.log(`End index (next entry): ${endIdx}`);
if (endIdx === -1) {
  endIdx = content.indexOf('## ', startIdx + 100);
  console.log(`End index (next markdown header): ${endIdx}`);
}
const snippet = content.slice(startIdx, startIdx + 1000);
console.log('\n=== First 1000 chars of Training #4 ===\n');
console.log(snippet);
