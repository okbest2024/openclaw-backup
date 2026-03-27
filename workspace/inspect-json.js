const fs = require('fs');
const c = fs.readFileSync('memory/heartbeat-state.json', 'utf8');
const idx1 = c.indexOf('worldCreationProtocol');
const idx2 = c.indexOf('lastTrainingTopic');
console.log('worldCreationProtocol at', idx1);
console.log('lastTrainingTopic at', idx2);
// 搜索 "sessionNotes" 的出现
const idxNotes = c.indexOf('"sessionNotes"');
console.log('sessionNotes at', idxNotes);
// 查看结尾部分
console.log('File length:', c.length);
console.log('Last 200 chars:');
console.log(c.slice(-200));