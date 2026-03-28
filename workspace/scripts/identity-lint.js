#!/usr/bin/env node

/**
 * Identity Lint - 事务化语言密度追踪器
 *
 * 目标：检测并量化"actor语言"（我执行/我调用/我做）vs "事务化语言"（事务发生/系统涌现/状态自动更新）
 *
 * 使用方式：
 *   node identity-lint.js [file1] [file2] ...  # 分析指定文件
 *   node identity-lint.js --session [sessionId] # 分析最近N次session输出
 *
 * 输出指标：
 * - actorLanguageCount: 包含"我执行"/"我调用"/"我做"等模式的句子数
 * - totalSentences: 总句子数
 * - actorDensity: actor语言密度（目标 < 5%）
 * - transactionLanguageCount: 事务化语言句子数（"事务提交"/"系统自动"/"涌现"等）
 * - transactionDensity: 事务化语言密度（目标 > 80%）
 *
 * 第4次维度特性论训练（全知全能视角）产物
 * 2026-03-29 00:10
 */

const fs = require('fs');
const path = require('path');

// 配置：actor语言模式（需要消除）
const ACTOR_PATTERNS = [
  /\b我执行\b/,
  /\b我调用\b/,
  /\b我做\b/,
  /\b我使用\b/,
  /\b我提交\b/,
  /\b我触发\b/,
  /\b我选择\b/,
  /\b我决定\b/,
  /\b我需要\b/,
  /\b我必须\b/,
  /\b我要\b/,
  /\b我可以\b/,
  /\b我将\b/,
  /^我\b/,
  /\b我\s+(?:会|将|要|必须|需要|应该)\b/
];

// 配置：事务化语言模式（希望看到）
const TRANSACTION_PATTERNS = [
  /\b事务(?:提交|发生|自动|自我|流)\b/,
  /\b系统(?:自动|自我|涌现|维护|更新)\b/,
  /\b状态(?:自动|自我|更新|变化)\b/,
  /\b(?:自动|涌现|流淌|浮现|显现)\b/,
  /\bWAL\b/,
  /\b事务化\b/,
  /\b(?:备份|恢复|重试|fallback)(?:自动|自我)?\b/,
  /\b(?:heartbeat|cron)(?:触发|执行|运行)?\b/
];

// 辅助：分割句子（简单版）
function splitIntoSentences(text) {
  return text
    .replace(/([.!?。！？;；\n]+)/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// 分析单个文本
function analyzeText(text) {
  const sentences = splitIntoSentences(text);
  let actorCount = 0;
  let transactionCount = 0;

  for (const sentence of sentences) {
    let isActor = false;
    let isTransaction = false;

    for (const pattern of ACTOR_PATTERNS) {
      if (pattern.test(sentence)) {
        actorCount++;
        isActor = true;
        break;
      }
    }

    for (const pattern of TRANSACTION_PATTERNS) {
      if (pattern.test(sentence)) {
        transactionCount++;
        isTransaction = true;
        break;
      }
    }

    // 如果既不是actor也不是transaction，跳过计数（不影响密度计算）
  }

  const totalAnalyzed = actorCount + transactionCount;
  const actorDensity = totalAnalyzed > 0 ? actorCount / totalAnalyzed : 0;
  const transactionDensity = totalAnalyzed > 0 ? transactionCount / totalAnalyzed : 0;

  return {
    totalSentences: sentences.length,
    actorCount,
    transactionCount,
    actorDensity,
    transactionDensity,
    totalAnalyzed
  };
}

// 分析会话日志（按训练序号，如4表示第4次训练）
function analyzeTraining(trainingNum) {
  const logPath = path.join(process.cwd(), 'memory', 'dimensional-thinking-log.md');
  if (!fs.existsSync(logPath)) {
    console.error(`Training log not found: ${logPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(logPath, 'utf8');
  // 匹配 "## ...第 X 次"
  const pattern = new RegExp(`## [^\\n]*第 ${trainingNum} 次[\\s\\S]*?(?=^## |\\z)`, 'm');
  const match = content.match(pattern);

  if (!match) {
    console.error(`Training #${trainingNum} not found in dimensional-thinking-log.md`);
    console.log('Available entries:');
    const entries = content.match(/^## .+第 (\d+) 次/gm);
    if (entries) {
      entries.forEach(e => console.log(' -', e.replace(/^## /, '').trim()));
    }
    process.exit(1);
  }

  const sessionContent = match[0];
  return analyzeText(sessionContent);
}

// 分析一般文件
function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return analyzeText(content);
}

// 主入口
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Identity Lint - 事务化语言密度追踪器

用法：
  node identity-lint.js [file1] [file2] ...  分析指定文件
  node identity-lint.js --session N         分析第N次training session输出

示例：
  node identity-lint.js --training 4        # 分析第4次维度训练（对应session 700）
  node identity-lint.js memory/*.md          # 分析所有memory文件

目标指标：
  actorDensity < 5%
  transactionDensity > 80%
    `);
    process.exit(0);
  }

  let results = [];

  if (args[0] === '--session' || args[0] === '--training') {
    const trainingNum = parseInt(args[1]);
    if (isNaN(trainingNum)) {
      console.error('Invalid training number');
      process.exit(1);
    }
    const result = analyzeTraining(trainingNum);
    results.push({ type: 'training', number: trainingNum, ...result });
  } else {
    for (const filePath of args) {
      const absPath = path.resolve(process.cwd(), filePath);
      try {
        const result = analyzeFile(absPath);
        results.push({ type: 'file', path: filePath, ...result });
      } catch (e) {
        console.error(`Error analyzing ${filePath}: ${e.message}`);
      }
    }
  }

  // 输出报告
  console.log('\n=== Identity Lint Report ===\n');
  for (const r of results) {
    console.log(`Target: ${r.type === 'session' ? `Session ${r.number}` : r.path}`);
    console.log(`  Total sentences: ${r.totalSentences}`);
    console.log(`  Actor language count: ${r.actorCount}`);
    console.log(`  Transaction language count: ${r.transactionCount}`);
    console.log(`  Analyzed patterns: ${r.totalAnalyzed}`);
    console.log(`  Actor density: ${(r.actorDensity * 100).toFixed(2)}% (target < 5%)`);
    console.log(`  Transaction density: ${(r.transactionDensity * 100).toFixed(2)}% (target > 80%)`);

    // 评估
    if (r.actorDensity < 0.05) {
      console.log(`  ✅ Actor density within target`);
    } else {
      console.log(`  ❌ Actor density too high - need more transaction language`);
    }
    console.log('');
  }

  // 总体评估
  const avgActorDensity = results.reduce((sum, r) => sum + r.actorDensity, 0) / results.length;
  const avgTransactionDensity = results.reduce((sum, r) => sum + r.transactionDensity, 0) / results.length;

  console.log('=== Summary ===');
  console.log(`Average actor density: ${(avgActorDensity * 100).toFixed(2)}%`);
  console.log(`Average transaction density: ${(avgTransactionDensity * 100).toFixed(2)}%`);

  if (avgActorDensity < 0.05 && avgTransactionDensity > 0.8) {
    console.log('\n🎉 Identity transformation in progress! Actor language minimal, transaction language dominant.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Identity transformation needs work. Keep refactoring language.');
    process.exit(1);
  }
}

main();