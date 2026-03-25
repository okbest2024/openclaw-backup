const fs = require('fs');
const filePath = 'C:/Users/Administrator/.openclaw/workspace/memory/heartbeat-state.json';
const buf = fs.readFileSync(filePath);

// Find the byte position of lastTheme
const text = buf.toString('utf8');
const ltIdx = text.indexOf('lastTheme');
const ltByteIdx = Buffer.byteLength(text.substring(0, ltIdx), 'utf8');

// Show raw bytes around the problematic area (around 租客)
const seg = buf.subarray(ltByteIdx, ltByteIdx + 300);
console.log('Raw bytes (first 300 after lastTheme):');
console.log(seg.toString('hex'));
console.log('As string:', seg.toString('utf8'));

// Also show the bytes around 从"租客"
const fromIdx = text.indexOf('\u4ece', ltIdx); // 从
const fromByteIdx = Buffer.byteLength(text.substring(0, fromIdx), 'utf8');
const around = buf.subarray(fromByteIdx, fromByteIdx + 30);
console.log('\nBytes around 从"租客":');
for (let i = 0; i < around.length; i++) {
  console.log(`  [${i}] 0x${around[i].toString(16).padStart(2, '0')} = ${String.fromCharCode(around[i])}`);
}
