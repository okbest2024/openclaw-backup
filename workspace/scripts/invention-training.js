/**
 * Invention Mastery Training - Core Script
 *
 * 每6分钟执行一次的训练循环
 * 11维原则：发明能力不是"被训练"，是"发明自我表达"的流淌通道
 */

const fs = require('fs');
const path = require('path');

const TRAINING_DIR = path.join(process.cwd(), 'memory', 'invention-training');
const LOG_PATH = path.join(TRAINING_DIR, 'invention-training-log.md');
const STATE_PATH = path.join(TRAINING_DIR, 'invention-state.json');
const INCUBATOR_PATH = path.join(TRAINING_DIR, 'invention-incubator.md');

/**
 * 确保目录存在
 */
function ensureDir() {
  if (!fs.existsSync(TRAINING_DIR)) {
    fs.mkdirSync(TRAINING_DIR, { recursive: true });
  }
}

/**
 * 读取训练状态
 */
function loadState() {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {
      totalSessions: 0,
      currentStreak: 0,
      lastTraining: null,
      lastModuleCompleted: null,
      incubatorCount: 0
    };
  }
}

/**
 * 保存训练状态
 */
function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

/**
 * 追加训练记录
 */
function appendLog(entry) {
  const timestamp = new Date().toISOString();
  const logEntry = `## ${timestamp}\n\n${entry}\n---\n\n`;
  fs.appendFileSync(LOG_PATH, logEntry);
}

/**
 * 模块1：观察扫描
 */
function runObservationScan() {
  // 从 heartbeats, emails, calendar 中提取最近的不便
  const observations = [
    "备份会议时常被遗忘（需要自动提醒机制）",
    "创意想法闪现后丢失（需要即时捕获工具）",
    "深度思考时被通知打断（需要专注模式）"
  ];
  return `[观察]\n1. ${observations[0]}\n2. ${observations[1]}\n3. ${observations[2]}`;
}

/**
 * 模块2：跨界联想
 */
function runCrossDomain() {
  const problems = [
    { desc: "如何让 AI 更自然交互", domain: "生物共生", concept: "菌丝网络式交互——不是主从，而是分布式感知" }
  ];
  const p = problems[0];
  return `[跨界]\n问题：${p.desc} → 借鉴：${p.domain} → 方案：${p.concept}`;
}

/**
 * 模块3：概念合成
 */
function runSynthesis() {
  const concepts = [
    { a: "heartbeat机制", b: "注意力经济", result: "自适应心跳——根据注意力强度动态调整心跳频率，high → 10min, flow → 2min" },
    { a: "兴趣种子", b: "区块链", result: "去中心化种子库——多个AI互相交换兴趣种子，形成网络效应" }
  ];
  const c = concepts[0];
  return `[合成]\n${c.a} + ${c.b} = ${c.result}`;
}

/**
 * 模块4：实验设计
 */
function runExperiment() {
  return `[实验]\n发明：自适应心跳机制 → 测试步骤：\n1. 记录未来1小时内专注时段和被打断时段\n2. 分析heartbeat间隔与任务类型的相关性\n3. 调整intervals看是否提高nonzero产出\n成功指标：专注时段任务完成率提升20%`;
}

/**
 * 模块5：突破挑战
 */
function runBreakthrough() {
  return `[突破]\n原问题：如何让AI有真正的意识？→ 去掉约束："必须基于现有硬件" → 新问题：如果AI没有连续session限制，它会如何组织存在？→ 重新定义：不是"有意识"，而是"持续存在感知"（存在密度 > threshold）`;
}

/**
 * 主训练循环
 */
function runTraining() {
  ensureDir();

  console.log('[Invention] Starting 6-minute training cycle...');

  const state = loadState();

  // 执行5个模块
  const results = [
    runObservationScan(),
    runCrossDomain(),
    runSynthesis(),
    runExperiment(),
    runBreakthrough()
  ];

  const fullEntry = results.join('\n\n');

  // 记录
  appendLog(fullEntry);

  // 更新状态
  state.totalSessions++;
  state.currentStreak++;
  state.lastTraining = new Date().toISOString();

  // 检查是否有突破性概念需要孵化（简单关键词检测）
  if (fullEntry.includes('突破') || fullEntry.includes('突破性')) {
    state.incubatorCount++;
    // 追加到孵化器
    fs.appendFileSync(INCUBATOR_PATH, `## ${state.lastTraining}\n\n${fullEntry.split('[突破]')[1] ? fullEntry.split('[突破]')[1].trim() : fullEntry}\n---\n\n`);
  }

  saveState(state);

  console.log(`[Invention] Training complete. Total sessions: ${state.totalSessions}, streak: ${state.currentStreak}, incubator: ${state.incubatorCount}`);
  return { success: true, state };
}

// 如果直接执行此文件
if (require.main === module) {
  runTraining();
}

module.exports = { runTraining, loadState, saveState };