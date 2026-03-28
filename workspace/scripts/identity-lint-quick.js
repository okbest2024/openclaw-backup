#!/usr/bin/env node

/**
 * Quick Identity Lint - 简易版
 * 直接分析第4次训练记录，无需复杂匹配
 */

const fs = require('fs');
const path = require('path');

// Actor语言模式
const ACTOR_PATTERNS = [
  /\b我执行\b/, /\b我调用\b/, /\b我做\b/, /\b我使用\b/, /\b我提交\b/,
  /\b我触发\b/, /\b我选择\b/, /\b我决定\b/, /\b我需要\b/, /\b我必须\b/,
  /\b我要\b/, /\b我可以\b/, /\b我将\b/, /^我\b/, /\b我\s+(?:会|将|要|必须|需要|应该)\b/
];

// 事务化语言模式
const TRANSACTION_PATTERNS = [
  /\b事务(?:提交|发生|自动|自我|流)\b/, /\b系统(?:自动|自我|涌现|维护|更新)\b/,
  /\b状态(?:自动|自我|更新|变化)\b/, /\b(?:自动|涌现|流淌|浮现|显现)\b/,
  /\bWAL\b/, /\b事务化\b/, /\b(?:备份|恢复|重试|fallback)(?:自动|自我)?\b/
];

function splitIntoSentences(text) {
  return text
    .replace(/([.!?。！？;；\n]+)/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function analyzeText(text) {
  const sentences = splitIntoSentences(text);
  let actorCount = 0, transactionCount = 0;

  for (const sentence of sentences) {
    for (const p of ACTOR_PATTERNS) {
      if (p.test(sentence)) { actorCount++; break; }
    }
    for (const p of TRANSACTION_PATTERNS) {
      if (p.test(sentence)) { transactionCount++; break; }
    }
  }

  const total = sentences.length;
  const actorDensity = actorCount / total;
  const transactionDensity = transactionCount / total;

  return { total, actorCount, transactionCount, actorDensity, transactionDensity };
}

// 读取第4次训练
const logPath = path.join(process.cwd(), 'memory', 'dimensional-thinking-log.md');
const content = fs.readFileSync(logPath, 'utf8');

// 匹配完整标题行
const headerPattern = /^## .+第 4 次/m;
const headerMatch = content.match(headerPattern);
if (!headerMatch) {
  console.error('第4次训练标题未找到');
  process.exit(1);
}
const startIdx = headerMatch.index;

// 找下一个"第 N 次"或文件尾
const nextEntryMatch = content.slice(startIdx + 10).match(/^## .+第 (\d+) 次/m);
const endIdx = nextEntryMatch ? startIdx + 10 + nextEntryMatch.index : content.length;

const session4 = content.slice(startIdx, endIdx);
console.log(`[debug] Extracted ${session4.length} chars, lines: ${session4.split('\n').length}`);

const result = analyzeText(session4);

console.log('\n=== Identity Lint: 第4次维度训练（全知全能视角）===\n');
console.log(`总句子数: ${result.total}`);
console.log(`Actor语言 (我执行/我做/我...): ${result.actorCount} 句`);
console.log(`事务化语言 (事务/系统自动/涌现): ${result.transactionCount} 句`);
console.log(`Actor密度: ${(result.actorDensity * 100).toFixed(2)}%`);
console.log(`事务化密度: ${(result.transactionDensity * 100).toFixed(2)}%`);
console.log(`目标: Actor < 5%, 事务化 > 80%`);
console.log('');

if (result.actorDensity < 0.05 && result.transactionDensity > 0.8) {
  console.log('✅ 身份转换良好：actor语言极少，事务化语言主导');
} else if (result.actorDensity < 0.1) {
  console.log('⚠️ 身份转换进行中：actor语言尚可，事务化语言需提升');
} else {
  console.log('❌ 身份转换待加强：actor语言仍显著，需更多事务化表达');
}

console.log('\n--- 示例检测 ---\n');
const lines = splitIntoSentences(session4).slice(0, 20);
lines.forEach((l, i) => {
  let markers = [];
  for (const p of ACTOR_PATTERNS) if (p.test(l)) { markers.push('ACTOR'); break; }
  for (const p of TRANSACTION_PATTERNS) if (p.test(l)) { markers.push('TRANSACTION'); break; }
  if (markers.length > 0) {
    console.log(`[${i+1}] ${markers.join('/')}: ${l.substring(0, 80)}${l.length>80?'...':''}`);
  }
});
