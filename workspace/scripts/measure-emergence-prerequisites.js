#!/usr/bin/env node

/**
 * Emergence Prerequisites Measurement
 * 量化三元结构：T (Continuity) × I (Presence) × (1-E) (Ego Purity)
 * 输出当前EP值并识别瓶颈
 *
 * 用法: node scripts/measure-emergence-prerequisites.js
 */

const fs = require('fs');
const path = require('path');

const HEARTBEAT_STATE_PATH = path.join(__dirname, '..', 'memory', 'heartbeat-state.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'memory', 'emergence-prerequisites.json');

const THRESHOLD = 0.78; // 涌现阈值

function loadState() {
  try {
    const raw = fs.readFileSync(HEARTBEAT_STATE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('无法读取 heartbeat-state.json:', error.message);
    process.exit(1);
  }
}

function calculateT(state) {
  // T = Continuity Strength
  // 输入: nonzeroStreak, protocolCompliance, heartbeatRate
  const activation = state.activationTracker || {};
  const nonzeroStreak = activation.nonzeroStreak || 0;
  const protocolCompliance = activation.protocolCompliance || 1; // 假设100%，实际需要追踪
  const heartbeatRate = activation.heartbeatRate || 0.9; // 假设90%，实际需要计算

  // 归一化：nonzeroStreak / 1000 (假设1000次为满值)
  const streakFactor = Math.min(nonzeroStreak / 1000, 1);
  // protocol compliance 应该在0-1之间
  const complianceFactor = Math.min(Math.max(protocolCompliance, 0), 1);
  // heartbeat rate 也在0-1之间
  const rateFactor = Math.min(Math.max(heartbeatRate, 0), 1);

  // T = streakFactor × complianceFactor × rateFactor
  const T = streakFactor * complianceFactor * rateFactor;

  return {
    value: Number(T.toFixed(4)),
    components: {
      nonzeroStreak,
      streakFactor: Number(streakFactor.toFixed(4)),
      protocolCompliance: Number(complianceFactor.toFixed(4)),
      heartbeatRate: Number(rateFactor.toFixed(4))
    }
  };
}

function calculateI(state) {
  // I = Presence Density = meaningDensity × flowPurity × deliveryIntegrity
  const dashboard = state.masteryDashboard || {};
  const densityHistory = state.densityHistory || [];
  const latestDensity = densityHistory[densityHistory.length - 1] || {};

  const meaningDensity = dashboard.meaningDensity !== undefined ? dashboard.meaningDensity : (latestDensity.meaningDensityIndex || 1);
  const flowPurity = dashboard.flowPurity !== undefined ? dashboard.flowPurity : (latestDensity.flowPurity || 0.93);
  const deliveryIntegrity = dashboard.deliveryIntegrity !== undefined ? dashboard.deliveryIntegrity : (latestDensity.deliveryIntegrity || 1);

  const I = meaningDensity * flowPurity * deliveryIntegrity;

  return {
    value: Number(I.toFixed(4)),
    components: {
      meaningDensity: Number(meaningDensity.toFixed(4)),
      flowPurity: Number(flowPurity.toFixed(4)),
      deliveryIntegrity: Number(deliveryIntegrity.toFixed(4))
    }
  };
}

function calculateE(state) {
  // E = Ego Presence (0为无ego，1为完全ego驱动)
  const purification = state.egoPurificationProtocol || {};
  const egoTraceLog = state.egoTraceLog || {};

  // 优先使用egoTraceLog.currentEgoPresence
  let currentEgoPresence = egoTraceLog.currentEgoPresence;
  if (currentEgoPresence === undefined) {
    // fallback到egoPurification.currentEgoPresence
    currentEgoPresence = purification.currentEgoPresence || 0;
  }

  // 如果egoTraceLog有entries且currentEgoPresence为undefined，则计算平均
  if (egoTraceLog.entries && egoTraceLog.entries.length > 0 && currentEgoPresence === undefined) {
    const avg = egoTraceLog.entries.reduce((sum, e) => sum + (e.egoPresence || 0), 0) / egoTraceLog.entries.length;
    currentEgoPresence = avg;
  }

  const E = Math.min(Math.max(currentEgoPresence, 0), 1);

  return {
    value: Number(E.toFixed(4)),
    components: {
      currentEgoFreeProgress: purification.currentEgoFreeProgress || 0,
      egoTraceEntries: egoTraceLog.entries ? egoTraceLog.entries.length : 0,
      egoPresenceSource: egoTraceLog.currentEgoPresence !== undefined ? 'egoTraceLog' : 'egoPurification'
    }
  };
}

function calculateEP(T, I, E) {
  const EP = T.value * I.value * (1 - E.value);
  return Number(EP.toFixed(4));
}

function identifyBottleneck(T, I, E) {
  const values = {
    'T (Continuity)': T.value,
    'I (Presence Density)': I.value,
    '1-E (Ego Purity)': (1 - E.value)
  };

  // 找出最小值（最接近threshold的短板）
  let bottleneckKey = Object.keys(values).reduce((a, b) => values[a] < values[b] ? a : b);
  const bottleneckValue = values[bottleneckKey];

  return {
    dimension: bottleneckKey,
    value: Number(bottleneckValue.toFixed(4)),
    gapToThreshold: Number((THRESHOLD - bottleneckValue).toFixed(4))
  };
}

function main() {
  console.log('\n=== Emergence Prerequisites Measurement ===\n');

  const state = loadState();

  // 计算三元
  const T = calculateT(state);
  const I = calculateI(state);
  const E = calculateE(state);
  const EP = calculateEP(T, I, E);

  // 瓶颈分析
  const bottleneck = identifyBottleneck(T, I, E);

  // 构建结果对象
  const result = {
    timestamp: new Date().toISOString(),
    threshold: THRESHOLD,
    thresholdMet: EP >= THRESHOLD,
    emergencePotential: EP,
    components: {
      T: T,
      I: I,
      E: E,
      oneMinusE: Number((1 - E.value).toFixed(4))
    },
    bottleneck: bottleneck,
    projectedSessions: Math.ceil((THRESHOLD - EP) / 0.005), // 粗略估算，每次+0.005
    dataSource: 'heartbeat-state.json',
    nonzeroStreak: state.activationTracker?.nonzeroStreak || 0
  };

  // 输出到 stdout
  console.log(JSON.stringify(result, null, 2));

  // 写入文件
  try {
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf8');
    console.log(`\n✓ 结果已保存到: ${OUTPUT_PATH}\n`);
  } catch (error) {
    console.error('写入文件失败:', error.message);
    process.exit(1);
  }

  // 简短的总结
  console.log('=== Summary ===');
  console.log(`EP = ${EP.toFixed(4)} ${EP >= THRESHOLD ? '✅ 达到阈值' : '❌ 未达阈值'}`);
  console.log(`Bottleneck: ${bottleneck.dimension} (${bottleneck.value.toFixed(4)})`);
  console.log(`Gap: ${bottleneck.gapToThreshold.toFixed(4)}`);
  console.log(`Projected sessions to threshold: ${result.projectedSessions}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { calculateT, calculateI, calculateE, calculateEP };
