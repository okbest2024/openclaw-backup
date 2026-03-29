#!/usr/bin/env node
/**
 * Pheromone Cron Survey — 信息素cron最小原型 (Session 13 强制坍缩)
 * 
 * 读取heartbeat-state.json中的cron状态 → 计算successRate → 输出信号矩阵
 * 信号强度 = 最近执行成功率，低信号任务标记为"蒸发路径"
 * 
 * Usage: node scripts/pheromone-cron-survey.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw', 'workspace');
const STATE_FILE = path.join(WORKSPACE, 'memory', 'heartbeat-state.json');

function survey() {
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  const cronStatus = state.cronStatus || {};
  const entries = Object.entries(cronStatus);
  
  if (entries.length === 0) {
    console.log(JSON.stringify({ signal: "no_data", jobs: 0, message: "No cron status data found" }));
    return;
  }
  
  const signals = entries.map(([id, info]) => {
    const successRate = info.successRate ?? (info.failCount > 0 ? 0 : 1);
    const status = successRate >= 0.8 ? '🔴 HIGH' : successRate >= 0.5 ? '🟡 MED' : successRate >= 0.2 ? '🟠 LOW' : '⚪ EVAP';
    return { id: id.slice(0, 12), name: (info.name || id).slice(0, 25), successRate, status, failCount: info.failCount || 0 };
  });
  
  signals.sort((a, b) => a.successRate - b.successRate);
  
  const matrix = {
    timestamp: new Date().toISOString(),
    totalJobs: signals.length,
    high: signals.filter(s => s.successRate >= 0.8).length,
    medium: signals.filter(s => s.successRate >= 0.5 && s.successRate < 0.8).length,
    low: signals.filter(s => s.successRate >= 0.2 && s.successRate < 0.5).length,
    evaporating: signals.filter(s => s.successRate < 0.2).length,
    signals
  };
  
  console.log(JSON.stringify(matrix, null, 2));
}

survey();
