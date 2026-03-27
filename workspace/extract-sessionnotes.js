const fs = require('fs');
const path = 'memory/heartbeat-state.json';
let content = fs.readFileSync(path, 'utf8');

// 找到 "sessionNotes" 出现的位置
const startIdx = content.indexOf('"sessionNotes"');
if (startIdx === -1) {
  console.error('sessionNotes not found');
  process.exit(1);
}

// 找到数组开始
const arrStartIdx = content.indexOf('[', startIdx);
if (arrStartIdx === -1) {
  console.error('Array start not found');
  process.exit(1);
}

// 找到匹配的闭合方括号
let depth = 0;
let endIdx = -1;
for (let i = arrStartIdx; i < content.length; i++) {
  if (content[i] === '[') depth++;
  else if (content[i] === ']') {
    depth--;
    if (depth === 0) {
      endIdx = i;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error('Array end not found');
  process.exit(1);
}

const sessionNotesText = content.slice(arrStartIdx, endIdx + 1);
try {
  const sessionNotes = JSON.parse(sessionNotesText);
  console.log('✅ Extracted sessionNotes array with', sessionNotes.length, 'entries');
  // 保存到单独的文件以便检查
  fs.writeFileSync('memory/sessionNotes-backup.json', JSON.stringify(sessionNotes, null, 2), 'utf8');
  console.log('📁 Saved backup to memory/sessionNotes-backup.json');
  process.exit(0);
} catch (e) {
  console.error('Parse error:', e.message);
  // 输出片段
  console.log(sessionNotesText.slice(0, 200));
  process.exit(1);
}
