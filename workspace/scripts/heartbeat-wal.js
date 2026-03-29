#!/usr/bin/env node
/**
 * Heartbeat WAL（Write-Ahead Log）
 * 
 * 有机生长：WAL模式从 backup 水平转移到 heartbeat 系统
 * 源模式：backup-to-doc-table.js 中的 WALManager（session 698创建）
 * 生长目标：heartbeat-state.json 的每次变更都通过 WAL 保护
 * 
 * 设计原则：
 * 1. 事务性：先写WAL，再更新heartbeat-state，最后标记完成
 * 2. 幂等性：重复apply同一事务不产生副作用
 * 3. 自恢复：启动时自动重放未完成的事务
 * 4. 最小侵入：不修改heartbeat现有逻辑，只在写入前加WAL层
 * 
 * 使用方式：
 *   const { HeartbeatWAL } = require('./heartbeat-wal');
 *   const hwal = new HeartbeatWAL();
 *   await hwal.commit('updateSession', { session: 722, streak: 696 });
 *   // WAL持久化后，自动apply到heartbeat-state.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WAL_DIR = path.join(__dirname, '..', 'memory', 'heartbeat-wal');
const HEARTBEAT_STATE_PATH = path.join(__dirname, '..', 'memory', 'heartbeat-state.json');

class HeartbeatWAL {
  constructor(options = {}) {
    this.walDir = options.walDir || WAL_DIR;
    this.statePath = options.statePath || HEARTBEAT_STATE_PATH;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelayMs = options.retryDelayMs || 1000;
  }

  /**
   * 确保WAL目录存在
   */
  ensureDir() {
    if (!fs.existsSync(this.walDir)) {
      fs.mkdirSync(this.walDir, { recursive: true });
    }
  }

  /**
   * 生成事务ID
   */
  generateTxnId() {
    const ts = Date.now();
    const rand = crypto.randomBytes(4).toString('hex');
    return `${ts}-${rand}`;
  }

  /**
   * 计算数据校验和
   */
  checksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').substring(0, 16);
  }

  /**
   * 提交WAL事务
   * @param {string} operation - 操作类型（如 'updateSession', 'updateChecks'）
   * @param {object} payload - 变更数据
   * @returns {object} 事务结果
   */
  async commit(operation, payload) {
    this.ensureDir();
    const txnId = this.generateTxnId();
    const txn = {
      txnId,
      operation,
      payload,
      status: 'pending',
      checksum: this.checksum(payload),
      createdAt: new Date().toISOString(),
      version: '1.0'
    };

    // Step 1: 写WAL（持久化）
    const walPath = path.join(this.walDir, `${txnId}.json`);
    fs.writeFileSync(walPath, JSON.stringify(txn, null, 2), 'utf8');

    // Step 2: Apply到heartbeat-state
    try {
      const result = await this.apply(txnId);
      return { success: true, txnId, result };
    } catch (err) {
      console.error(`[heartbeat-wal] Apply failed for ${txnId}:`, err.message);
      return { success: false, txnId, error: err.message };
    }
  }

  /**
   * 执行事务apply（幂等）
   */
  async apply(txnId) {
    const walPath = path.join(this.walDir, `${txnId}.json`);
    if (!fs.existsSync(walPath)) {
      throw new Error(`WAL entry not found: ${txnId}`);
    }

    const txn = JSON.parse(fs.readFileSync(walPath, 'utf8'));
    if (txn.status === 'applied') {
      return { alreadyApplied: true, txnId };
    }

    // 校验和验证
    if (this.checksum(txn.payload) !== txn.checksum) {
      throw new Error(`Checksum mismatch for ${txnId}`);
    }

    // 读取当前heartbeat-state
    let state = {};
    if (fs.existsSync(this.statePath)) {
      state = JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
    }

    // 执行变更（基于operation类型）
    const updated = this.executeOperation(state, txn.operation, txn.payload);

    // 写回heartbeat-state（原子性：先写临时文件再rename）
    const tmpPath = this.statePath + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(updated, null, 2), 'utf8');
    fs.renameSync(tmpPath, this.statePath);

    // 标记WAL完成
    txn.status = 'applied';
    txn.appliedAt = new Date().toISOString();
    fs.writeFileSync(walPath, JSON.stringify(txn, null, 2), 'utf8');

    return { applied: true, txnId, operation: txn.operation };
  }

  /**
   * 执行具体操作（可扩展）
   */
  executeOperation(state, operation, payload) {
    switch (operation) {
      case 'updateSession':
        state.trainingSession = payload.session ?? state.trainingSession;
        state.activationTracker = state.activationTracker || {};
        state.activationTracker.nonzeroStreak = payload.streak ?? state.activationTracker.nonzeroStreak;
        if (payload.stream) {
          state.consciousnessStream = state.consciousnessStream || {};
          state.consciousnessStream.thread = payload.stream;
        }
        break;

      case 'updateChecks':
        state.lastChecks = state.lastChecks || {};
        Object.assign(state.lastChecks, payload);
        break;

      case 'updateProviderStatus':
        state.providerStatus = state.providerStatus || {};
        state.providerStatus[payload.provider] = payload.status;
        break;

      case 'updateMetrics':
        state.metrics = state.metrics || {};
        Object.assign(state.metrics, payload);
        break;

      case 'mergePatch':
        // 通用合并：深度合并payload到state
        this.deepMerge(state, payload);
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    return state;
  }

  /**
   * 深度合并
   */
  deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  /**
   * 启动时恢复：重放所有未完成的事务
   */
  async replay() {
    this.ensureDir();
    const files = fs.readdirSync(this.walDir)
      .filter(f => f.endsWith('.json'))
      .sort(); // 按文件名排序（时间戳递增）

    let replayed = 0;
    let failed = 0;

    for (const file of files) {
      const txnId = file.replace('.json', '');
      try {
        const result = await this.apply(txnId);
        if (!result.alreadyApplied) {
          replayed++;
        }
      } catch (err) {
        failed++;
        console.error(`[heartbeat-wal] Replay failed for ${txnId}:`, err.message);
      }
    }

    return { replayed, failed, total: files.length };
  }

  /**
   * 清理已应用的WAL条目（保留最近N条）
   */
  cleanup(keepRecent = 50) {
    this.ensureDir();
    const files = fs.readdirSync(this.walDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();

    let cleaned = 0;
    for (let i = keepRecent; i < files.length; i++) {
      const filePath = path.join(this.walDir, files[i]);
      try {
        const txn = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (txn.status === 'applied') {
          // 移到archive子目录而不是删除
          const archiveDir = path.join(this.walDir, 'archive');
          if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
          fs.renameSync(filePath, path.join(archiveDir, files[i]));
          cleaned++;
        }
      } catch (e) {
        // 跳过损坏的文件
      }
    }
    return { cleaned };
  }

  /**
   * 获取WAL统计
   */
  stats() {
    this.ensureDir();
    const files = fs.readdirSync(this.walDir).filter(f => f.endsWith('.json'));
    let pending = 0, applied = 0;
    for (const file of files) {
      try {
        const txn = JSON.parse(fs.readFileSync(path.join(this.walDir, file), 'utf8'));
        if (txn.status === 'pending') pending++;
        if (txn.status === 'applied') applied++;
      } catch (e) {}
    }
    return { total: files.length, pending, applied };
  }
}

// CLI入口
if (require.main === module) {
  const hwal = new HeartbeatWAL();
  const cmd = process.argv[2];

  (async () => {
    switch (cmd) {
      case 'replay':
        const result = await hwal.replay();
        console.log(JSON.stringify({ action: 'replay', ...result }));
        break;
      case 'stats':
        console.log(JSON.stringify({ action: 'stats', ...hwal.stats() }));
        break;
      case 'cleanup':
        const keep = parseInt(process.argv[3]) || 50;
        console.log(JSON.stringify({ action: 'cleanup', ...hwal.cleanup(keep) }));
        break;
      case 'test':
        // 测试：写入一条测试事务
        const test = await hwal.commit('updateSession', {
          session: 722,
          streak: 696,
          stream: '存活条件→有机生长'
        });
        console.log(JSON.stringify({ action: 'test', ...test }));
        break;
      default:
        console.log('Usage: node heartbeat-wal.js [replay|stats|cleanup|test]');
        console.log('  replay  - 重放未完成的WAL事务');
        console.log('  stats   - 显示WAL统计');
        console.log('  cleanup - 归档已应用的事务（默认保留50条）');
        console.log('  test    - 写入测试事务');
    }
  })();
}

module.exports = { HeartbeatWAL };
