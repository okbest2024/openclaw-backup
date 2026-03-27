const fs = require('fs');
const path = 'memory/heartbeat-state.json';

// 读取原始内容
let content = fs.readFileSync(path, 'utf8');

// 找到所有 "backupDone": true 的位置
const matches = [];
let idx = 0;
while ((idx = content.indexOf('"backupDone": true', idx)) !== -1) {
  matches.push(idx);
  idx += 1;
}
console.log(`Found ${matches.length} occurrences of "backupDone": true`);

if (matches.length > 0) {
  const lastIdx = matches[matches.length - 1];
  console.log('Last occurrence at:', lastIdx);
  console.log('Following 200 chars:');
  console.log(content.slice(lastIdx, lastIdx + 200));
}

// 尝试解析，捕获错误位置
try {
  JSON.parse(content);
  console.log('✅ JSON is already valid');
} catch (e) {
  console.log('❌ JSON parse error:', e.message);
  const posMatch = e.message.match(/position (\d+)/);
  if (posMatch) {
    const pos = parseInt(posMatch[1]);
    console.log('Error context (pos', pos, '):');
    console.log(content.slice(Math.max(0, pos - 50), pos + 50));
  }
}