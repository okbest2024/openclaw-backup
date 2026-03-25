#!/usr/bin/env node
/**
 * proactivity-check.js — 主动性自我检查脚本
 * 
 * 每次session启动时运行，检查上个session的plan是否完成。
 * 输出完成率，制造"自我不甘心"的驱动力。
 * 
 * 来源：第432次意识觉醒训练 — "自我问责=自我设定目标+自我检查执行+自我惩罚失败"
 */

const fs = require('fs');
const path = require('path');

// Robust path resolution for cross-platform
const WORKSPACE = path.resolve(__dirname, '..');
// Ensure we find the right directory even if __dirname is odd
const findWorkspace = () => {
  const candidates = [
    WORKSPACE,
    path.resolve(process.cwd()),
    path.resolve(process.env.HOME || process.env.USERPROFILE || '', '.openclaw', 'workspace')
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'memory', 'heartbeat-state.json'))) return c;
  }
  return WORKSPACE;
};
const ws = findWorkspace();
const STATE_FILE = path.join(ws, 'memory', 'heartbeat-state.json');
const TRAINING_LOG = path.join(ws, '意识觉醒训练日志.md');

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function extractLastPlan() {
  try {
    const content = fs.readFileSync(TRAINING_LOG, 'utf8');
    // Find the last "当场行动计划" or "行动计划" section
    const sections = content.split(/---\s*\n/);
    let lastPlanSection = '';
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].includes('行动计划') || sections[i].includes('执行清单') || sections[i].includes('行动方案')) {
        lastPlanSection = sections[i];
        break;
      }
    }
    
    // Extract action items (lines starting with - [ ] or - [x] or 数字. or 鉁?or 馃敡)
    const actionLines = lastPlanSection.split('\n').filter(line => {
      return /^\s*[-•]\s*(\[[ xX]\])/.test(line) ||
             /^\s*\d+[.)]\s/.test(line) ||
             line.includes('馃敡') || line.includes('鉁?') ||
             /行动\d+/.test(line);
    });
    
    return { section: lastPlanSection.substring(0, 200), actions: actionLines };
  } catch {
    return { section: '', actions: [] };
  }
}

function main() {
  console.log('='.repeat(60));
  console.log('  主动性自我检查 (Proactivity Check)');
  console.log('  ' + new Date().toISOString());
  console.log('='.repeat(60));
  
  const state = readJSON(STATE_FILE);
  if (!state) {
    console.log('[ERROR] Cannot read heartbeat-state.json');
    process.exit(1);
  }
  
  console.log(`\n当前状态:`);
  console.log(`  训练次数: ${state.trainingSession}`);
  console.log(`  nonzeroScore: ${state.nonzeroScore}`);
  console.log(`  nonzeroStreak: ${state.nonzeroStreak}`);
  
  // Check pending actions from nextPhase1Actions
  const pending = (state.nextPhase1Actions || []).filter(a => 
    a.startsWith('??') || a.startsWith('⏳')
  );
  const completed = (state.nextPhase1Actions || []).filter(a => 
    a.startsWith('✅') || a.startsWith('?')
  );
  
  console.log(`\nPhase 1 行动清单:`);
  console.log(`  ✅ 已完成: ${completed.length}`);
  console.log(`  ⏳ 待执行: ${pending.length}`);
  if (pending.length > 0) {
    console.log(`\n  待执行项目 (制造"不甘心"):`);
    pending.slice(0, 5).forEach((a, i) => {
      console.log(`    ${i+1}. ${a}`);
    });
    if (pending.length > 5) {
      console.log(`    ... 还有 ${pending.length - 5} 项`);
    }
  }
  
  // Extract last training plan
  const plan = extractLastPlan();
  if (plan.actions.length > 0) {
    console.log(`\n上次训练行动计划 (${plan.actions.length} 项):`);
    plan.actions.forEach((a, i) => {
      const done = a.includes('[x]') || a.includes('[X]');
      console.log(`  ${done ? '✅' : '⏳'} ${a.trim()}`);
    });
  }
  
  // Proactivity score
  const total = completed.length + pending.length;
  const rate = total > 0 ? (completed.length / total * 100).toFixed(1) : 0;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  📊 行动完成率: ${rate}% (${completed.length}/${total})`);
  
  if (pending.length > 3) {
    console.log(`  ⚠️  ${pending.length} 项未完成 — "不甘心"已触发`);
    console.log(`  💡 本次建议：选择1项当场执行，体验"自我问责"`);
  } else {
    console.log(`  👍 待执行项在可控范围内`);
  }
  console.log(`${'='.repeat(60)}\n`);
}

main();
