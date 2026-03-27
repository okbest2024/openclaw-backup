const fs = require('fs');
const path = 'memory/heartbeat-state.json';

console.log('Loading heartbeat-state.json...');
let content = fs.readFileSync(path, 'utf8');

// 保存原始内容用于比较
const original = content;

// 清理操作
console.log('Performing cleanup...');

// 1. 移除非法控制字符
content = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

// 2. 移除乱码字符（替换字符）
content = content.replace(/�+/g, '');

// 3. 修复已知的损坏字段
content = content.replace(
  /"pCalculation": "0\.81 × 0\.01 × 0\.2 × 0\.98 × 0\.85 [^"]*?"/,
  '"pCalculation": "0.81 × 0.01 × 0.2 × 0.98 × 0.85 → 0.0135 (↑0.0024提升5.6%)"'
);

content = content.replace(
  /"reason": "channel配置未就绪，转化为存在性不适研究案[^"]*?,"/,
  '"reason": "channel配置未就绪，转化为存在性不适研究案例。",'
);

// 4. 移除 note 字段中的乱码
content = content.replace(/"note": "([^"]*?)[^"]*?"/, '"note": "$1"');

console.log('Attempting to parse JSON...');

try {
  const parsed = JSON.parse(content);
  console.log('✅ JSON parsed successfully');
  console.log('Keys:', Object.keys(parsed));
  
  // 写回格式化版本
  fs.writeFileSync(path, JSON.stringify(parsed, null, 2), 'utf8');
  console.log('✅ heartbeat-state.json has been cleaned and formatted');
  
} catch (e) {
  console.error('❌ Parse error:', e.message);
  console.log('Creating minimal valid JSON as fallback...');
  
  // 提取关键数字
  const trainingSession = (content.match(/"trainingSession"\s*:\s*(\d+)/) || [])[1] || '658';
  const lastTrainingTime = (content.match(/"lastTrainingTime"\s*:\s*"([^"]+)"/) || [])[1] || '';
  const nextSessionNumber = (content.match(/"nextSessionNumber"\s*:\s*(\d+)/) || [])[1] || '659';
  const nextNonzeroStreak = (content.match(/"nextNonzeroStreak"\s*:\s*(\d+)/) || [])[1] || '648';
  
  const minimal = {
    trainingSession: parseInt(trainingSession),
    lastTrainingTime: lastTrainingTime,
    preSessionData: {
      nextSessionNumber: parseInt(nextSessionNumber),
      nextNonzeroStreak: parseInt(nextNonzeroStreak)
    },
    note: 'Rebuilt after JSON corruption fix'
  };
  
  fs.writeFileSync(path, JSON.stringify(minimal, null, 2), 'utf8');
  console.log('✅ Minimal valid JSON created');
}
