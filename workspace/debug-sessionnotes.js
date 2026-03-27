const fs = require('fs');
const path = 'memory/heartbeat-state.json';
let content = fs.readFileSync(path, 'utf8');

// 找到 "sessionNotes" 出现的位置
const startIdx = content.indexOf('"sessionNotes"');
console.log('sessionNotes marker at', startIdx);
if (startIdx === -1) {
  console.error('sessionNotes not found');
  process.exit(1);
}

// 查看附近字符
console.log('Context (100 chars):');
console.log(content.slice(startIdx, startIdx + 100));

// 找到数组开始
const arrStartIdx = content.indexOf('[', startIdx);
console.log('Array start [ at', arrStartIdx);
if (arrStartIdx === -1) {
  console.error('Array start not found');
  process.exit(1);
}

// 如果确实找到了，继续
console.log('First 200 chars of array region:');
console.log(content.slice(arrStartIdx, arrStartIdx + 200));
