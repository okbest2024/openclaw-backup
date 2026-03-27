#!/usr/bin/env node

/**
 * World Signals Perception Logger
 * 用于去中心化触发器实验（第657次训练）
 *
 * 用法：
 *   node scripts/log-world-signal.js --latency 45 --ego false --signals "email=3,backup_needed"
 *
 * 或者在heartbeat开始时自动调用：
 *   node scripts/log-world-signal.js --phase start
 *   ...执行感知和响应...
 *   node scripts/log-world-signal.js --phase end --latency ${latency} --ego ${egoDetected}
 */

const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '..', 'memory', 'world-signals-log.jsonl');

function loadLog() {
  if (!fs.existsSync(LOG_PATH)) {
    return [];
  }
  const content = fs.readFileSync(LOG_PATH, 'utf8');
  return content.split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('#'))
    .map(line => JSON.parse(line.trim()));
}

function appendEntry(entry) {
  const line = JSON.stringify(entry);
  fs.appendFileSync(LOG_PATH, line + '\n', 'utf8');
}

function logStart() {
  appendEntry({
    timestamp: new Date().toISOString(),
    phase: 'start',
    experimentActive: true,
    note: 'Heartbeat开始，进入30秒静默感知期'
  });
  console.log('[WorldSignal] Experiment phase: START - 30秒静默感知启动');
}

function logEnd(latencyMs, egoDetected, signalsDetected, responseActions) {
  const entry = {
    timestamp: new Date().toISOString(),
    phase: 'end',
    latencyMs: latencyMs,
    egoInterferenceDetected: egoDetected,
    worldSignalsDetected: signalsDetected || [],
    responseActions: responseActions || [],
    consecutiveSuccesses: calculateConsecutiveSuccesses()
  };
  appendEntry(entry);
  console.log(`[WorldSignal] Experiment phase: END - latency=${latencyMs}ms, ego=${egoDetected}`);
}

function calculateConsecutiveSuccesses() {
  const log = loadLog();
  // 只统计phase=end的记录
  const ends = log.filter(e => e.phase === 'end');
  let count = 0;
  for (let i = ends.length - 1; i >= 0; i--) {
    const e = ends[i];
    if (e.latencyMs < 100 && !e.egoInterferenceDetected) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--phase') {
      options.phase = args[++i];
    } else if (arg === '--latency') {
      options.latency = parseInt(args[++i], 10);
    } else if (arg === '--ego') {
      const val = args[++i];
      options.ego = val === 'true' || val === '1';
    } else if (arg === '--signals') {
      options.signals = args[++i].split(',');
    } else if (arg === '--actions') {
      options.actions = args[++i].split(',');
    }
  }

  if (options.phase === 'start') {
    logStart();
  } else if (options.phase === 'end') {
    logEnd(options.latency, options.ego, options.signals, options.actions);
  } else {
    // 独立运行：输出当前实验状态
    const log = loadLog();
    const ends = log.filter(e => e.phase === 'end');
    const consecutive = calculateConsecutiveSuccesses();
    console.log(JSON.stringify({
      experimentActive: true,
      totalRecords: log.length,
      completedCycles: ends.length,
      currentConsecutiveSuccesses: consecutive,
      targetSuccesses: 10,
      experimentProgress: Math.min(consecutive / 10, 1)
    }, null, 2));
  }
}

if (require.main === module) {
  main();
}

module.exports = { logStart, logEnd, calculateConsecutiveSuccesses };
