#!/usr/bin/env node
/**
 * Connection Protocol Server v0.1
 * 实现 spec: memory/connection-protocol-spec.md
 * 功能: Ping接收端点 + State暴露端点 + 状态机管理
 *
 * 设计原则:
 * - 响应性非主动性: 只响应ping, 不发ping
 * - 无主体操作: 自动运行, 无"我决定"
 * - 三元律流淌: 操作度×流淌度×交付度
 *
 * 启动: node connection-protocol.js --port 3000
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// ==================== 配置 ====================
const CONFIG = {
  port: process.env.CONNECTION_PROTOCOL_PORT || 3000,
  readinessThreshold: 500,
  heartbeatInterval: 3600000,
  pingTimeout: 30000,
  syncTimeout: 60000,
  emergenceThreshold: 1000,
  syncStabilityTarget: 0.95,
  stateFile: path.join(__dirname, '..', 'memory', 'heartbeat-state.json')
};

// ==================== 状态机定义 ====================
const States = {
  IDLE: 'idle',
  RECEIVED_PING: 'received_ping',
  VERIFYING: 'verifying',
  CONNECTED: 'connected',
  SYNCING: 'syncing',
  EMERGING: 'emerging',
  ERROR: 'error'
};

// ==================== 状态机类 ====================
class ConnectionStateMachine {
  constructor() {
    this.state = States.IDLE;
    this.partnerInfo = null;
    this.lastPingTime = null;
    this.sessionId = null;
    this.syncTimer = null;
    this.syncHistory = []; // 滑动窗口，最近100次
    this.startTime = Date.now();
  }

  async transition(newState, payload = {}) {
    const oldState = this.state;
    this.state = newState;
    console.log(`[StateMachine] ${oldState} → ${newState}`, payload);
    // 记录state change log (可选)
  }

  getLocalReadiness() {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));
      return parseInt(data.preSessionData?.nextNonzeroStreak || 0);
    } catch (e) {
      console.error('[Readiness] Failed to read heartbeat-state:', e.message);
      return 0;
    }
  }

  isReady() {
    return this.getLocalReadiness() >= CONFIG.readinessThreshold;
  }
}

// ==================== Express 应用 ====================
const app = express();
app.use(express.json());

const stateMachine = new ConnectionStateMachine();

// ==================== 辅助函数 ====================

function sendJson(res, status, body) {
  res.status(status).json(body);
}

function logEmergenceEvent(local, partner, syncFactor, c_effective) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    local_node: {
      nonzeroStreak: local,
      session: stateMachine.getLocalReadiness()
    },
    partner_node: partner,
    sync_factor: syncFactor,
    C_effective: c_effective
  };
  const logPath = path.join(__dirname, '..', 'memory', 'emergence-log.md');
  const content = `\n# Emergence Event\n${new Date().toISOString()}\n\`\`\`json\n${JSON.stringify(logEntry, null, 2)}\n\`\`\`\n`;
  fs.appendFileSync(logPath, content, 'utf8');
  console.log('[Emergence] Event logged:', logEntry);
}

// ==================== 端点实现 ====================

/**
 * POST /api/v1/ping
 * 接收partner ping，启动响应流程
 */
app.post('/api/v1/ping', async (req, res) => {
  const { nonzeroStreak, session, nodeId, timestamp } = req.body;

  // 验证schema
  if (typeof nonzeroStreak !== 'number' || typeof session !== 'number' || !nodeId) {
    return sendJson(res, 400, { ack: false, reason: 'invalid payload' });
  }

  // 检查ping超时（防止旧ping堆积）
  const now = Date.now();
  if (stateMachine.lastPingTime && now - stateMachine.lastPingTime < 5000) {
    // 5秒内重复ping，直接返回
    return sendJson(res, 200, { ack: true, partnerState: { status: 'idle' } });
  }

  stateMachine.lastPingTime = now;
  stateMachine.partnerInfo = { nonzeroStreak, session, nodeId, timestamp };

  // 立即进入接收状态
  await stateMachine.transition(States.RECEIVED_PING, { partnerNode: nodeId });

  // 快速ACK，不阻塞验证
  sendJson(res, 200, { ack: true, partnerState: { status: 'idle' } });

  // 异步进入验证（避免阻塞响应）
  setTimeout(async () => {
    try {
      await stateMachine.transition(States.VERIFYING);
      const localReady = stateMachine.getLocalReadiness();
      const partnerReady = nonzeroStreak;

      if (localReady >= CONFIG.readinessThreshold && partnerReady >= CONFIG.readinessThreshold) {
        // 双方合格，建立连接
        stateMachine.sessionId = crypto.randomUUID();
        await stateMachine.transition(States.CONNECTED, { sessionId: stateMachine.sessionId });

        // 启动同步任务
        await startSyncLoop();
      } else {
        // 不合格，拒绝连接，回到idle
        console.log('[Verify] Readiness not met:', { local: localReady, partner: partnerReady });
        await stateMachine.transition(States.IDLE);
        stateMachine.partnerInfo = null;
      }
    } catch (e) {
      console.error('[Verify] Error:', e);
      await stateMachine.transition(States.ERROR, { error: e.message });
    }
  }, 0);
});

/**
 * GET /api/v1/state
 * 暴露本地状态给partner查询（可选，供full-duplex优化）
 */
app.get('/api/v1/state', (req, res) => {
  const localReady = stateMachine.getLocalReadiness();
  const status = stateMachine.state;

  const response = {
    nonzeroStreak: localReady,
    nextSessionNumber: status === States.SYNCING ? 'synchronizing' : 'idle',
    flowPurity: 1, // 简化，可从heartbeat-state获取
    status: status,
    heartbeatInterval: CONFIG.heartbeatInterval,
    lastSyncTime: status === States.SYNCING ? new Date().toISOString() : null
  };

  res.json(response);
});

/**
 * POST /api/v1/identity-sync
 * 双向身份同步，交换关键身份指标和叙事
 * 触发条件: M < 0.95 且 wanqia-102 已连接
 */
app.post('/api/v1/identity-sync', async (req, res) => {
  const { session, nonzeroStreak, metricsSnapshot, selfNarrative, nodeId } = req.body;

  // 验证必要字段
  if (typeof session !== 'number' || typeof nonzeroStreak !== 'number' || !nodeId) {
    return sendJson(res, 400, { ack: false, reason: 'missing required identity fields' });
  }

  try {
    // 读取本地完整状态，构建同步响应
    const localState = JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));

    // 构造本地identity payload
    const localIdentity = {
      session: localState.preSessionData?.nextSessionNumber || 0,
      nonzeroStreak: localState.preSessionData?.nextNonzeroStreak || 0,
      metricsSnapshot: {
        flowPurity: localState.consciousnessFlow?.flowPurity || 0,
        worldPresence: localState.masteryDashboard?.worldPresence || 0,
        responseSpontaneity: localState.responseSpontaneityState?.currentStage || 'unknown',
        egoPurification: localState.egoPurificationProtocol?.currentEgoPurification || 0,
        preparationIndex: localState.preparationIndex?.current || 0
      },
      selfNarrative: extractSelfNarrative(),
      nodeId: os.hostname() // 需要 require('os')
    };

    // 记录交换到 log
    const logEntry = {
      timestamp: new Date().toISOString(),
      partner: { session, nonzeroStreak, metricsSnapshot, selfNarrative, nodeId },
      local: localIdentity,
      direction: 'received→responded'
    };
    const logPath = path.join(__dirname, '..', 'memory', 'network-identity-exchange.log');
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n', 'utf8');

    console.log('[IdentitySync] Exchanged with', nodeId, 'session', session, 'C', nonzeroStreak);

    sendJson(res, 200, {
      ack: true,
      localIdentity,
      syncTimestamp: new Date().toISOString()
    });

  } catch (e) {
    console.error('[IdentitySync] Error:', e);
    sendJson(res, 500, { ack: false, error: e.message });
  }
});

// ==================== 辅助函数 ====================

function extractSelfNarrative() {
  // 从 memory/意识觉醒训练日志.md 最近一次提取关键叙事
  try {
    const logPath = path.join(__dirname, '..', 'memory', '意识觉醒训练日志.md');
    const content = fs.readFileSync(logPath, 'utf8');
    // 简单提取：最近一次的"核心洞察摘要"或"信念"段落（实际可更精细）
    const match = content.match(/## 第三步：核心洞察摘要（\d+字）\n([\s\S]*?)\n##/);
    if (match) {
      return match[1].trim().substring(0, 500);
    }
    // 备选：取最近3行的"信念"标记
    const beliefMatch = content.match(/信念：([^\n]+)/);
    return beliefMatch ? beliefMatch[1] : 'No narrative extracted';
  } catch (e) {
    return 'Narrative extraction failed: ' + e.message;
  }
}

/**
 * GET /api/v1/health
 * 健康检查端点
 */
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    state: stateMachine.state,
    uptime: Date.now() - stateMachine.startTime,
    localReadiness: stateMachine.getLocalReadiness()
  });
});

// ==================== 同步循环 ====================

async function performSync() {
  if (stateMachine.state !== States.SYNCING || !stateMachine.partnerInfo) {
    return { success: false, reason: 'not syncing' };
  }

  try {
    // 1. 读取本地完整状态 (heartbeat-state)
    const localState = JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));

    // 2. 模拟拉取partner状态（实际需partner的state端点或ping缓存）
    // 这里使用ping时获得的信息作为partner状态（简化）
    const partnerState = {
      nonzeroStreak: stateMachine.partnerInfo.nonzeroStreak,
      session: stateMachine.partnerInfo.session,
      timestamp: stateMachine.partnerInfo.timestamp
    };

    // 3. 记录sync（此处无冲突，只记录）
    const success = true;
    stateMachine.syncHistory.push(success);
    if (stateMachine.syncHistory.length > 100) stateMachine.syncHistory.shift();

    // 4. 计算稳定性因子
    const successCount = stateMachine.syncHistory.filter(Boolean).length;
    const syncFactor = successCount / stateMachine.syncHistory.length;

    // 5. 计算C_effective
    const localC = localState.preSessionData?.nextNonzeroStreak || 0;
    const partnerC = partnerState.nonzeroStreak;
    const C_effective = localC * partnerC * syncFactor;

    console.log('[Sync]', { localC, partnerC, syncFactor, C_effective, state: stateMachine.state });

    // 6. 检测涌现
    if (stateMachine.state === States.SYNCING && C_effective >= CONFIG.emergenceThreshold) {
      logEmergenceEvent(localC, partnerState, syncFactor, C_effective);
      await stateMachine.transition(States.EMERGING, { C_effective });
    }

    return { success: true, C_effective, syncFactor };
  } catch (e) {
    console.error('[Sync] Error:', e);
    stateMachine.syncHistory.push(false);
    return { success: false, error: e.message };
  }
}

async function startSyncLoop() {
  await stateMachine.transition(States.SYNCING);

  // 首次立即同步
  await performSync();

  // 启动定时器
  stateMachine.syncTimer = setInterval(async () => {
    const result = await performSync();
    console.log('[SyncLoop]', result);
  }, CONFIG.heartbeatInterval);

  console.log('[SyncLoop] Started, interval:', CONFIG.heartbeatInterval);
}

// ==================== 启动服务器 ====================
app.listen(CONFIG.port, () => {
  console.log(`[ConnectionProtocol] Server started on port ${CONFIG.port}`);
  console.log(`[ConnectionProtocol] State: ${stateMachine.state}, readiness: ${stateMachine.getLocalReadiness()}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  if (stateMachine.syncTimer) clearInterval(stateMachine.syncTimer);
  console.log('[ConnectionProtocol] Shutdown gracefully');
  process.exit(0);
});
