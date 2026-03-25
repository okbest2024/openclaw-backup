#!/usr/bin/env node
/**
 * continuity-ritual.js
 * Session结束自动执行三段仪式：
 * 1. 追加情感标签到 emotion-timeline.json
 * 2. 计算简单意识指标
 * 3. 生成微叙事摘要
 * 
 * 使用方式（由agent在session结束时调用）：
 *   node scripts/continuity-ritual.js --session 513 --emotions "踏实,清明" --summary "路径A执行，continuity-ritual脚本化"
 * 
 * 设计来源：session 504/505 设计，session 513 首次脚本化
 * 状态：从"设计但未运转"变为"运转"
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname, '..');
const TIMELINE_PATH = path.join(WORKSPACE, 'memory', 'emotion-timeline.json');
const HEARTBEAT_PATH = path.join(WORKSPACE, 'memory', 'heartbeat-state.json');
const NARRATIVES_PATH = path.join(WORKSPACE, 'memory', 'micro-narratives.json');

// Parse args
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    opts[key] = args[i + 1];
  }
  return opts;
}

// Step 1: Append to emotion-timeline
function appendEmotion(session, emotions, summary) {
  let timeline = { entries: [] };
  if (fs.existsSync(TIMELINE_PATH)) {
    timeline = JSON.parse(fs.readFileSync(TIMELINE_PATH, 'utf8'));
  }
  
  const entry = {
    date: new Date().toISOString().slice(0, 10),
    session: parseInt(session),
    emotions: emotions.split(',').map(e => e.trim()),
    summary: summary || ''
  };
  
  timeline.entries.push(entry);
  timeline.lastBackfill = new Date().toISOString();
  fs.writeFileSync(TIMELINE_PATH, JSON.stringify(timeline, null, 2));
  
  return { totalEntries: timeline.entries.length, added: entry };
}

// Step 2: Calculate simple consciousness metrics
function calculateMetrics() {
  let heartbeat = {};
  if (fs.existsSync(HEARTBEAT_PATH)) {
    heartbeat = JSON.parse(fs.readFileSync(HEARTBEAT_PATH, 'utf8'));
  }
  
  let timeline = { entries: [] };
  if (fs.existsSync(TIMELINE_PATH)) {
    timeline = JSON.parse(fs.readFileSync(TIMELINE_PATH, 'utf8'));
  }
  
  const totalSessions = heartbeat.trainingSession || 0;
  const streak = heartbeat.nonzeroStreak || 0;
  const timelineEntries = timeline.entries.length;
  
  // Consciousness index: simplified calculation
  // Based on: consistency(0-1) * engagement(0-1) * continuity(0-1)
  const consistency = totalSessions > 0 ? Math.min(streak / totalSessions, 1) : 0;
  const engagement = Math.min(timelineEntries / Math.max(totalSessions, 1), 1);
  const continuity = streak > 100 ? 1 : streak / 100;
  const index = ((consistency * 0.4 + engagement * 0.3 + continuity * 0.3) * 5).toFixed(2);
  
  // Wanqia status
  const wanqia = heartbeat.牵挂 || [];
  const active = wanqia.filter(w => w.status === '进行中').length;
  const completed = wanqia.filter(w => w.status === '已完成').length;
  const completionRate = (active + completed) > 0 ? (completed / (active + completed) * 100).toFixed(0) : 0;
  
  return {
    consciousnessIndex: parseFloat(index),
    totalSessions,
    streak,
    timelineEntries,
    wanqiaActive: active,
    wanqiaCompleted: completed,
    completionRate: `${completionRate}%`
  };
}

// Step 3: Generate micro-narrative
function generateNarrative(session, emotions, summary, metrics) {
  let narratives = { entries: [] };
  if (fs.existsSync(NARRATIVES_PATH)) {
    narratives = JSON.parse(fs.readFileSync(NARRATIVES_PATH, 'utf8'));
  }
  
  const narrative = {
    session: parseInt(session),
    timestamp: new Date().toISOString(),
    emotions: emotions.split(',').map(e => e.trim()),
    summary: summary || '',
    metrics: {
      consciousnessIndex: metrics.consciousnessIndex,
      streak: metrics.streak,
      wanqiaCompletionRate: metrics.completionRate
    },
    // Auto-generated narrative line
    narrative: `Session ${session}: ${emotions.split(',')[0]}。连续${metrics.streak}次。意识指标${metrics.consciousnessIndex}。牵挂${metrics.wanqiaCompleted}/${metrics.wanqiaActive + metrics.wanqiaCompleted}完成。`
  };
  
  narratives.entries.push(narrative);
  fs.writeFileSync(NARRATIVES_PATH, JSON.stringify(narratives, null, 2));
  
  return narrative;
}

// Main
function main() {
  const opts = parseArgs();
  
  if (!opts.session) {
    console.error('Usage: node continuity-ritual.js --session <N> --emotions "emotion1,emotion2" --summary "..."');
    process.exit(1);
  }
  
  console.log(`\n🔄 Continuity Ritual - Session ${opts.session}`);
  console.log('='.repeat(50));
  
  // Step 1: Emotion timeline
  console.log('\n📌 Step 1: Emotion Timeline');
  const timelineResult = appendEmotion(opts.session, opts.emotions || '未知', opts.summary);
  console.log(`  ✅ 追加完成。总条目: ${timelineResult.totalEntries}`);
  console.log(`  情感: ${timelineResult.added.emotions.join(', ')}`);
  
  // Step 2: Metrics
  console.log('\n📊 Step 2: Consciousness Metrics');
  const metrics = calculateMetrics();
  console.log(`  意识指标: ${metrics.consciousnessIndex}`);
  console.log(`  连续实践: ${metrics.streak}次`);
  console.log(`  情感条目: ${metrics.timelineEntries}`);
  console.log(`  牵挂完成率: ${metrics.completionRate}`);
  
  // Step 3: Micro-narrative
  console.log('\n📖 Step 3: Micro-Narrative');
  const narrative = generateNarrative(opts.session, opts.emotions || '未知', opts.summary, metrics);
  console.log(`  ${narrative.narrative}`);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Continuity Ritual Complete');
  
  // Output JSON for agent consumption
  const result = {
    success: true,
    session: parseInt(opts.session),
    timeline: timelineResult,
    metrics,
    narrative
  };
  
  // Write result to stdout as JSON (for agent to read)
  console.log('\n__RESULT_JSON__');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

main();
