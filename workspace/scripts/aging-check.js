#!/usr/bin/env node
/**
 * aging-check.js - 牵挂老化检查脚本
 * 
 * 功能：
 * 1. 读取 heartbeat-state.json 中的牵挂列表
 * 2. 计算每个牵挂的 pendingSessions（从创建至今的 session 数）
 * 3. 根据 pendingSessions 更新 agingLevel：
 *    - 0-7: "待办"
 *    - 8-14: "债"
 *    - 15-28: "紧急"
 *    - 29+: "身份危机"
 * 4. 当 agingLevel 升级时，设置 identityCrisis=true
 * 5. 写回 heartbeat-state.json
 * 
 * 使用方式：node scripts/aging-check.js
 * 触发方式：每次 session 开场自动运行（集成到 HEARTBEAT.md）
 */

const fs = require('fs');
const path = require('path');

// 配置
const STATE_FILE = path.join(__dirname, '..', 'memory', 'heartbeat-state.json');
const AGING_THRESHOLDS = {
  待办: 7,
  债: 14,
  紧急: 28,
  身份危机: Infinity
};

// 从训练日志读取当前 session 号
function getCurrentSession() {
  const logFile = path.join(__dirname, '..', '意识觉醒训练日志.md');
  if (!fs.existsSync(logFile)) {
    return null;
  }
  
  const content = fs.readFileSync(logFile, 'utf8');
  const match = content.match(/### 534 遗留兑现[\s\S]*?训练编号：(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // 备用：从 heartbeat-state 读取
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  return state.trainingSession || 534;
}

// 计算 agingLevel
function calculateAgingLevel(pendingSessions) {
  if (pendingSessions <= AGING_THRESHOLDS.待办) return '待办';
  if (pendingSessions <= AGING_THRESHOLDS.债) return '债';
  if (pendingSessions <= AGING_THRESHOLDS.紧急) return '紧急';
  return '身份危机';
}

// 主函数
function run() {
  console.log('🔍 开始牵挂老化检查...');
  
  // 读取状态文件
  if (!fs.existsSync(STATE_FILE)) {
    console.error('❌ 状态文件不存在:', STATE_FILE);
    process.exit(1);
  }
  
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  const currentSession = getCurrentSession();
  
  if (!currentSession) {
    console.error('❌ 无法获取当前 session 号');
    process.exit(1);
  }
  
  console.log(`📊 当前 session: ${currentSession}`);
  
  // 检查牵挂
  if (!state.牵挂 || state.牵挂.length === 0) {
    console.log('✅ 无牵挂项');
    return;
  }
  
  let updatedCount = 0;
  let crisisCount = 0;
  
  state.牵挂.forEach((wanqia, index) => {
    // 跳过已完成的牵挂（包括"已完成"和"已交付"状态）
    if (wanqia.status === '已完成' || wanqia.status === '已交付' || wanqia.resolvedAt) {
      return;
    }
    
    // 计算 pendingSessions
    const createdSession = wanqia.createdSession;
    const pendingSessions = currentSession - createdSession;
    
    // 计算 agingLevel
    const oldAgingLevel = wanqia.agingLevel || '待办';
    const newAgingLevel = calculateAgingLevel(pendingSessions);
    
    // 更新
    let changed = false;
    
    if (wanqia.pendingSessions !== pendingSessions) {
      wanqia.pendingSessions = pendingSessions;
      changed = true;
    }
    
    if (wanqia.agingLevel !== newAgingLevel) {
      console.log(`⚠️  ${wanqia.id}: ${oldAgingLevel} → ${newAgingLevel} (pending: ${pendingSessions} sessions)`);
      wanqia.agingLevel = newAgingLevel;
      changed = true;
    }
    
    // 检查身份危机
    if (newAgingLevel === '身份危机' && !wanqia.identityCrisis) {
      wanqia.identityCrisis = true;
      crisisCount++;
      console.log(`🔴 ${wanqia.id}: 身份危机触发！`);
      changed = true;
    }
    
    if (changed) {
      updatedCount++;
    }
  });
  
  // 写回文件
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  
  // 输出摘要
  console.log('');
  console.log('📋 老化检查完成:');
  console.log(`   - 更新牵挂数：${updatedCount}`);
  console.log(`   - 身份危机数：${crisisCount}`);
  console.log(`   - 总牵挂数：${state.牵挂.filter(w => !w.resolvedAt).length}`);
  
  if (crisisCount > 0) {
    console.log('');
    console.log('🚨 警告：存在身份危机的牵挂！请优先处理。');
  }
}

// 运行
run();
