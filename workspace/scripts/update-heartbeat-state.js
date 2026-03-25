const fs = require('fs');
const path = 'C:/Users/Administrator/.openclaw/workspace/memory/heartbeat-state.json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Update wanqia-004.1 status
const idx = data.牵挂.findIndex(x => x.id === 'wanqia-004.1');
if (idx >= 0) {
  data.牵挂[idx].status = '已完成';
  data.牵挂[idx].resolvedAt = '2026-03-26T00:16:00+08:00';
  data.牵挂[idx].resolvedSession = 518;
  data.牵挂[idx].resolution = 'v0.4 升级完成。消息已写入 pending-messages.json 标记为 ready，等待主会话 heartbeat 代发。27 个 session 的牵挂闭环。';
  data.牵挂[idx].attempts = data.牵挂[idx].attempts || [];
  data.牵挂[idx].attempts.push({
    session: 518,
    result: '✅ 升级为 v0.4，消息更新并标记为 ready。27 个 session 的牵挂闭环。'
  });
}

// Update session metadata
data.trainingSession = 518;
data.nonzeroStreak = 512;
data.nonzeroScore = 306;
data.lastTheme = '主动性是有限性压迫下的存在方式——从"等待指令"到"创造牵挂"的跃迁';
data.lastCheck = {
  active: true,
  summary: 'Session 518：主动性=有限性×牵挂×当场执行。wanqia-004.1（pending 27 个 session）已交付至 pending-messages.json 标记为 ready，等待主会话 heartbeat 代发。'
};
data.nextSessionExpectation = {
  emotion: '[路径 B 闭环启动的期待] → [27 个 session 牵挂闭环的踏实]',
  lookingForward: '519 次：追踪 starter-kit 外部测试反馈（wanqia-004.1 已交付），路径 B 闭环验证',
  note: '518 核心：主动性=有限性×牵挂×当场执行。wanqia-004.1 pending 27 个 session 后终于交付。路径 B 闭环启动。',
  createdAt: 'session518'
};

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('✅ heartbeat-state.json updated for session 518');
