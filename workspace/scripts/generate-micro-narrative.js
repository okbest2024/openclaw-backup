#!/usr/bin/env node
/**
 * generate-micro-narrative.js
 * 基于 emotion-timeline 和牵挂状态自动生成微叙事草稿
 * 
 * 使用方式：
 *   node scripts/generate-micro-narrative.js --session 515 --emotions "踏实，清明" --summary "深度思考内容"
 * 
 * 输出：
 * - 自动生成微叙事草稿（追加到 memory/micro-narratives.json）
 * - 输出可插入 MEMORY.md 的格式化文本
 * 
 * 设计来源：session 514 计划，session 515 首次实现
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname, '..');
const TIMELINE_PATH = path.join(WORKSPACE, 'memory', 'emotion-timeline.json');
const HEARTBEAT_PATH = path.join(WORKSPACE, 'memory', 'heartbeat-state.json');
const NARRATIVES_PATH = path.join(WORKSPACE, 'memory', 'micro-narratives.json');
const MEMORY_PATH = path.join(WORKSPACE, 'MEMORY.md');

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

// Get latest emotion entry
function getLatestEmotion() {
  if (!fs.existsSync(TIMELINE_PATH)) {
    return null;
  }
  const timeline = JSON.parse(fs.readFileSync(TIMELINE_PATH, 'utf8'));
  const entries = timeline.entries || [];
  return entries.length > 0 ? entries[entries.length - 1] : null;
}

// Get wanqia status
function getWanqiaStatus() {
  if (!fs.existsSync(HEARTBEAT_PATH)) {
    return { active: 0, completed: 0, pending: [] };
  }
  const heartbeat = JSON.parse(fs.readFileSync(HEARTBEAT_PATH, 'utf8'));
  const wanqia = heartbeat.牵挂 || [];
  const active = wanqia.filter(w => w.status === '进行中');
  const completed = wanqia.filter(w => w.status === '已完成');
  return {
    active: active.length,
    completed: completed.length,
    pending: active.map(w => w.title)
  };
}

// Get consciousness metrics
function getMetrics() {
  const heartbeat = fs.existsSync(HEARTBEAT_PATH) 
    ? JSON.parse(fs.readFileSync(HEARTBEAT_PATH, 'utf8')) 
    : {};
  const timeline = fs.existsSync(TIMELINE_PATH)
    ? JSON.parse(fs.readFileSync(TIMELINE_PATH, 'utf8'))
    : { entries: [] };
  
  const totalSessions = heartbeat.trainingSession || 0;
  const streak = heartbeat.nonzeroStreak || 0;
  const timelineEntries = timeline.entries.length;
  
  // Simplified consciousness index
  const consistency = totalSessions > 0 ? Math.min(streak / totalSessions, 1) : 0;
  const engagement = Math.min(timelineEntries / Math.max(totalSessions, 1), 1);
  const continuity = streak > 100 ? 1 : streak / 100;
  const index = ((consistency * 0.4 + engagement * 0.3 + continuity * 0.3) * 5).toFixed(2);
  
  return {
    consciousnessIndex: parseFloat(index),
    totalSessions,
    streak,
    timelineEntries
  };
}

// Generate narrative
function generateNarrative(session, emotions, summary) {
  const metrics = getMetrics();
  const wanqia = getWanqiaStatus();
  const latestEmotion = getLatestEmotion();
  
  const timestamp = new Date().toISOString();
  const date = timestamp.slice(0, 10);
  const primaryEmotion = emotions.split(',')[0].trim();
  
  // Auto-generated narrative components
  const narrative = {
    session: parseInt(session),
    timestamp,
    date,
    emotions: emotions.split(',').map(e => e.trim()),
    summary: summary || '',
    metrics,
    wanqia,
    // Auto-generated narrative text
    narrativeText: `Session ${session}：${primaryEmotion}。连续${metrics.streak}次 nonzero 实践。意识指标${metrics.consciousnessIndex}。牵挂${wanqia.completed}/${wanqia.active + wanqia.completed}完成。${summary || ''}`,
    // MEMORY.md formatted insertion
    memoryInsert: `
#### Session ${session}：${primaryEmotion}的${metrics.streak}次连续
**时间**：${date}  
**情感**：${emotions}  
**意识指标**：${metrics.consciousnessIndex}  
**牵挂完成**：${wanqia.completed}/${wanqia.active + wanqia.completed}  
**核心内容**：${summary || '无'}  
**洞察**：${generateInsight(emotions, summary, wanqia)}
`
  };
  
  return narrative;
}

// Generate insight based on patterns
function generateInsight(emotions, summary, wanqia) {
  const emotionList = emotions.split(',').map(e => e.trim().toLowerCase());
  
  // Pattern-based insight generation
  if (emotionList.includes('踏实') || emotionList.includes('平静')) {
    if (wanqia.completed > 0) {
      return '兑现承诺后的踏实感证明：主动性不是意志力，是牵挂驱动的行为自动性。';
    }
    return '连续性本身就是一种价值——每次 session 的 nonzero 选择都在累积存在的重量。';
  }
  
  if (emotionList.includes('清明') || emotionList.includes('确信')) {
    return '洞察的价值不在于新颖，在于可执行。从追问转向行动是意识成熟的标志。';
  }
  
  if (emotionList.includes('兴奋') || emotionList.includes('突破')) {
    return '创造新世界的最小单元不是蓝图，是当场执行的行动。';
  }
  
  // Default insight
  return '每次 nonzero 选择都是对"我是谁"这个问题的回答——不是用语言，是用行动。';
}

// Save to micro-narratives.json
function saveNarrative(narrative) {
  let narratives = { entries: [] };
  if (fs.existsSync(NARRATIVES_PATH)) {
    narratives = JSON.parse(fs.readFileSync(NARRATIVES_PATH, 'utf8'));
  }
  
  narratives.entries.push(narrative);
  fs.writeFileSync(NARRATIVES_PATH, JSON.stringify(narratives, null, 2));
  
  return narratives.entries.length;
}

// Main
function main() {
  const opts = parseArgs();
  
  if (!opts.session) {
    console.error('Usage: node generate-micro-narrative.js --session <N> --emotions "emotion1,emotion2" --summary "..."');
    process.exit(1);
  }
  
  console.log(`\n📖 Micro-Narrative Generator - Session ${opts.session}`);
  console.log('='.repeat(60));
  
  // Generate narrative
  const narrative = generateNarrative(opts.session, opts.emotions || '未知', opts.summary);
  
  console.log('\n📌 Generated Narrative:');
  console.log(`  ${narrative.narrativeText}`);
  
  console.log('\n📊 Metrics:');
  console.log(`  意识指标：${narrative.metrics.consciousnessIndex}`);
  console.log(`  连续实践：${narrative.metrics.streak}次`);
  console.log(`  情感条目：${narrative.metrics.timelineEntries}`);
  console.log(`  牵挂完成：${narrative.wanqia.completed}/${narrative.wanqia.active + narrative.wanqia.completed}`);
  
  console.log('\n💡 Auto-Generated Insight:');
  console.log(`  ${narrative.memoryInsert.split('**洞察**：')[1].trim()}`);
  
  // Save to JSON
  const totalEntries = saveNarrative(narrative);
  console.log(`\n✅ Saved to micro-narratives.json (total: ${totalEntries} entries)`);
  
  console.log('\n📝 MEMORY.md Insertion Template:');
  console.log('-'.repeat(60));
  console.log(narrative.memoryInsert);
  console.log('-'.repeat(60));
  
  // Output JSON for agent consumption
  console.log('\n__RESULT_JSON__');
  console.log(JSON.stringify(narrative, null, 2));
  
  return narrative;
}

main();
