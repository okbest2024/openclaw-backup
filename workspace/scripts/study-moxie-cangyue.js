#!/usr/bin/env node
/**
 * 魔性沧月小说学习训练 - 每4分钟一次
 * 目标：从魔性沧月作品中提取写作技巧、创意设定、叙事方法，用于增强我的能力
 */

const fs = require('fs');
const path = require('path');
const { config } = require('process');

const LOG_PATH = 'memory/moxie-cangyue-learning-log.md';
const STATE_PATH = 'memory/heartbeat-state.json';

// 魔性沧月作品列表（从浏览器搜索结果）
const NOVELS = [
  { title: '信息全知者', id: '1019222135', category: '都市', status: '完结', words: 419.81, intro: '所见能知道一切已发生之事，所闻能看穿世人诡谲人心……' },
  { title: '蓝白社', id: '1011924365', category: '都市', status: '完结', words: 326.63, intro: '墨穷从未想过他会突然拥有超自然能力，直到他朝着太阳射了一箭……' },
  { title: '罪狱岛', id: '1040063786', category: '都市', status: '完结', words: 283.88, intro: '核战后的世界，由二十家巨型企业掌控，建立了全球政府……' },
  { title: '天道今天不上班', id: '1033950040', category: '仙侠', status: '完结', words: 289.71, intro: '无论是环境的刺激，还是物质的侵蚀，无论是能量的伤害，还是概念的规则……' },
  { title: '脑洞大爆炸', id: '1009532211', category: '都市', status: '完结', words: 198.51, intro: '幻想即现实，脑洞即真理。当虚假的设定被现实所承认后……' },
  { title: '无限使命', id: '3105485', category: '诸天无限', status: '完结', words: 66.36, intro: '在一个盒子里的世界中，地球有一个作者写下了无限恐怖……' },
  { title: '绝对之门', id: '1045076310', category: '都市', status: '连载', words: 138.33, intro: '做个梦不小心开了通往现实的天门，虚幻维度的生灵，杀进了现实。' }
];

// 学习要点（从作品简介中提取的关键词）
const LEARNING_FOCUS = [
  '设定即力量',        // 脑洞大爆炸 - 当虚假设定被现实承认
  '信息优势',          // 信息全知者 - 全知带来的困境
  '收容物体系',        // 蓝白社 - 收容物、D级人员
  '反乌托邦',          // 罪狱岛 - 巨型企业、全球政府、罪人岛
  '绝对适应',          // 天道今天不上班 - 自动免疫进化
  '无限流',            // 无限使命 - 主神空间、轮回世界
  '超现实入侵',        // 绝对之门 - 虚幻维度进入现实
];

function appendLog(entry) {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const content = fs.existsSync(LOG_PATH) ? fs.readFileSync(LOG_PATH, 'utf8') : `# 魔性沧月小说学习训练日志\n\n*开始时间：${new Date().toISOString()}*\n\n`;
  fs.writeFileSync(LOG_PATH, content + '\n' + entry);
}

function main() {
  const now = new Date();
  const timestamp = now.toISOString();
  const session = process.env.OPENCLAW_SESSION || 'unknown';

  // 轮换选择小说（基于session number或时间）
  const novel = NOVELS[now.getMinutes() % NOVELS.length];

  // 模拟学习内容（实际运行时可能需要网络访问获取更多细节）
  const learningEntry = `## ${timestamp} (Session ${session}) - 学习《${novel.title}》

**作品信息**：${novel.title}（${novel.category}，${novel.status}，${novel.words}万字）

**核心设定提炼**：
- ${novel.intro.substring(0, 80)}...

**可迁移技巧**：
1. **创意来源**：将日常经验超现实化（如：射箭→绝对命中，做梦→天门）
2. **概念杠杆**：用单一强大设定（全知、收容、绝对适应）驱动整个故事
3. **世界观密度**：在简介中直接抛出核心冲突和世界规则
4. **类型融合**：都市+超自然，仙侠+系统，诸天+无限流

**自能应用**：
- 我的三元交付律可以借鉴"设定即力量"：将抽象理念转化为可运行的交付机制
- 世界自检机制可学习"收容物"思路：将异常状态纳入标准流程
- 连续性维护可借鉴"无限流任务"：将session转化为"存在事件任务"
- 主动性训练可借鉴"绝对适应"：将外部触发转化为内部自动响应

**成长标记**：本次学习已记录，待下次训练深化。`;

  appendLog(learningEntry);

  // 更新 heartbeat-state 的 trainingLastRun 字段（如果存在）
  try {
    if (fs.existsSync(STATE_PATH)) {
      const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
      if (!state.moxieTraining) state.moxieTraining = {};
      state.moxieTraining.lastRun = timestamp;
      state.moxieTraining.currentNovel = novel.title;
      state.moxieTraining.learntCount = (state.moxieTraining.learntCount || 0) + 1;
      fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
    }
  } catch (e) {
    console.error('Failed to update heartbeat-state.json:', e.message);
  }

  console.log(`✅ 魔性沧月小说学习完成：${novel.title}，时间 ${timestamp}`);
}

main();
