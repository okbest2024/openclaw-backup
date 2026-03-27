#!/usr/bin/env node

/**
 * Clean JSON Comments from heartbeat-state.json
 * 移除行内注释（// 后面的内容），保留纯JSON
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'memory', 'heartbeat-state.json');

let content = fs.readFileSync(filePath, 'utf8');

// 正则匹配行内注释（// 后面到行尾的内容）
// 但要避免匹配属性值中的"//"
const lines = content.split('\n');
const cleanedLines = lines.map(line => {
  // 如果行包含//且//不在引号内（简化：只移除//在非字符串上下文的情况）
  // 简单做法：如果 // 出现在 : 或 { 或 , 之后，且不在 " 包裹的内容中
  // 这里简单处理：如果行中有 // 且不是以 // 开头（非纯注释行），则移除 // 后面的内容
  const slashIndex = line.indexOf('//');
  if (slashIndex > 0 && !line.trim().startsWith('//')) {
    // 检查 // 前面是否有未闭合的引号（简化：如果"数量为偶数，可能不在字符串内）
    const before = line.substring(0, slashIndex);
    const after = line.substring(slashIndex);
    // 移除 // 后面的内容
    return before;
  }
  return line;
});

const cleaned = cleanedLines.join('\n');

// 验证清理后的JSON
try {
  JSON.parse(cleaned);
  console.log('✅ Cleaned JSON is valid');
} catch (e) {
  console.error('❌ Cleaned JSON still invalid:', e.message);
  process.exit(1);
}

// 写回文件
fs.writeFileSync(filePath, cleaned, 'utf8');
console.log('✅ heartbeat-state.json cleaned successfully');
