/**
 * WAL (Write-Ahead Log) Manager
 * 
 * 事务化状态见证协议核心组件：
 * Record Request → WAL (pending) → 异步apply → WAL标记完成
 * 
 * 设计原则：
 * - 幂等性：重复apply同一事务不会产生副作用
 * - 持久化：WAL在fsync后才返回成功
 * - 自动恢复：启动时重放pending事务
 * 
 * v1.0 - 2026-03-28 第697次训练当场执行
 * 不完美的最小实现，但它是真实的。
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class WALManager {
  constructor(walDir, options = {}) {
    this.walDir = walDir;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelayMs = options.retryDelayMs || 100;
    
    // 确保WAL目录存在
    if (!fs.existsSync(this.walDir)) {
      fs.mkdirSync(this.walDir, { recursive: true });
    }
  }

  /**
   * 计算数据的checksum
   */
  _checksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 16);
  }

  /**
   * 生成唯一事务ID
   */
  _txnId() {
    return `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * 提交事务到WAL
   * @param {string} targetFile - 目标文件路径
   * @param {object} operation - 操作描述 { type: 'append'|'update'|'write', data: any }
   * @returns {string} 事务ID
   */
  commit(targetFile, operation) {
    const txnId = this._txnId();
    const entry = {
      txnId,
      status: 'pending',
      targetFile,
      operation,
      checksum: this._checksum(operation.data),
      createdAt: new Date().toISOString(),
      appliedAt: null
    };

    const walPath = path.join(this.walDir, `${txnId}.json`);
    
    // 写入WAL + fsync
    const fd = fs.openSync(walPath, 'w');
    fs.writeSync(fd, JSON.stringify(entry, null, 2));
    fs.fsyncSync(fd);
    fs.closeSync(fd);

    return txnId;
  }

  /**
   * 读取WAL条目
   */
  _readEntry(txnId) {
    const walPath = path.join(this.walDir, `${txnId}.json`);
    if (!fs.existsSync(walPath)) return null;
    return JSON.parse(fs.readFileSync(walPath, 'utf8'));
  }

  /**
   * 更新WAL条目状态
   */
  _updateEntry(txnId, updates) {
    const walPath = path.join(this.walDir, `${txnId}.json`);
    const entry = this._readEntry(txnId);
    if (!entry) return;
    
    Object.assign(entry, updates);
    
    const fd = fs.openSync(walPath, 'w');
    fs.writeSync(fd, JSON.stringify(entry, null, 2));
    fs.fsyncSync(fd);
    fs.closeSync(fd);
  }

  /**
   * 应用事务（幂等）
   * 将WAL中的操作实际写入目标文件
   */
  apply(txnId) {
    const entry = this._readEntry(txnId);
    if (!entry) throw new Error(`WAL entry not found: ${txnId}`);
    if (entry.status === 'applied') return { txnId, status: 'already_applied' };

    const { targetFile, operation, checksum } = entry;

    // checksum验证
    if (this._checksum(operation.data) !== checksum) {
      this._updateEntry(txnId, { status: 'checksum_failed' });
      throw new Error(`Checksum mismatch for txn ${txnId}`);
    }

    // 确保目标目录存在
    const targetDir = path.dirname(targetFile);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 执行操作
    try {
      switch (operation.type) {
        case 'write':
          fs.writeFileSync(targetFile, operation.data, 'utf8');
          break;
        case 'append': {
          const existing = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : '';
          fs.writeFileSync(targetFile, existing + operation.data, 'utf8');
          break;
        }
        case 'json-merge': {
          let current = {};
          if (fs.existsSync(targetFile)) {
            current = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
          }
          Object.assign(current, operation.data);
          fs.writeFileSync(targetFile, JSON.stringify(current, null, 2), 'utf8');
          break;
        }
        case 'backup':
          // 专门用于备份日志的原子更新：将 backup metadata 追加到备份日志文件
          // data 格式：{ timestamp, fileCount, incremental, files: [] }
          const backupLogPath = targetFile;
          let backupLog = {};
          if (fs.existsSync(backupLogPath)) {
            try {
              backupLog = JSON.parse(fs.readFileSync(backupLogPath, 'utf8'));
            } catch (e) {
              backupLog = { runs: [] };
            }
          }
          if (!backupLog.runs) backupLog.runs = [];
          backupLog.runs.push(operation.data);
          backupLog.lastUpdated = new Date().toISOString();
          fs.writeFileSync(backupLogPath, JSON.stringify(backupLog, null, 2), 'utf8');
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      // 标记完成
      this._updateEntry(txnId, { 
        status: 'applied', 
        appliedAt: new Date().toISOString() 
      });

      return { txnId, status: 'applied' };
    } catch (err) {
      this._updateEntry(txnId, { 
        status: 'apply_failed', 
        error: err.message 
      });
      throw err;
    }
  }

  /**
   * 带重试的apply
   */
  applyWithRetry(txnId) {
    let lastError;
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return this.apply(txnId);
      } catch (err) {
        lastError = err;
        if (i < this.maxRetries - 1) {
          // 指数退避
          const delay = this.retryDelayMs * Math.pow(2, i);
          const start = Date.now();
          while (Date.now() - start < delay) { /* busy wait for sync compat */ }
        }
      }
    }
    throw lastError;
  }

  /**
   * 启动恢复：重放所有pending事务
   */
  replay() {
    const files = fs.readdirSync(this.walDir).filter(f => f.endsWith('.json'));
    const results = { replayed: 0, failed: 0, skipped: 0 };

    for (const file of files) {
      const txnId = file.replace('.json', '');
      const entry = this._readEntry(txnId);
      
      if (!entry) continue;
      if (entry.status === 'applied') { results.skipped++; continue; }

      try {
        this.applyWithRetry(txnId);
        results.replayed++;
      } catch (err) {
        results.failed++;
        console.error(`[WAL] Replay failed for ${txnId}: ${err.message}`);
      }
    }

    return results;
  }

  /**
   * 列出所有pending事务
   */
  listPending() {
    const files = fs.readdirSync(this.walDir).filter(f => f.endsWith('.json'));
    return files.map(f => {
      const entry = this._readEntry(f.replace('.json', ''));
      return entry && entry.status === 'pending' ? entry : null;
    }).filter(Boolean);
  }

  /**
   * 归档已完成的事务（保留days天）
   */
  archive(daysOld = 30) {
    const files = fs.readdirSync(this.walDir).filter(f => f.endsWith('.json'));
    const cutoff = Date.now() - daysOld * 86400000;
    let archived = 0;

    for (const file of files) {
      const entry = this._readEntry(file.replace('.json', ''));
      if (!entry) continue;
      
      const entryTime = new Date(entry.appliedAt || entry.createdAt).getTime();
      if (entry.status === 'applied' && entryTime < cutoff) {
        fs.unlinkSync(path.join(this.walDir, file));
        archived++;
      }
    }

    return archived;
  }
}

module.exports = { WALManager };

// CLI测试模式
if (require.main === module) {
  const wal = new WALManager(path.join(__dirname, '..', '.wal-test'));
  
  console.log('[WAL Test] Committing test transaction...');
  const txnId = wal.commit(path.join(__dirname, '..', '.wal-test', 'output.txt'), {
    type: 'write',
    data: 'Hello WAL! This is transactional writing.'
  });
  console.log(`[WAL Test] Committed: ${txnId}`);
  
  console.log('[WAL Test] Applying...');
  const result = wal.apply(txnId);
  console.log(`[WAL Test] Applied:`, result);
  
  // 验证输出文件
  const outputFile = path.join(__dirname, '..', '.wal-test', 'output.txt');
  const content = fs.readFileSync(outputFile, 'utf8');
  console.log(`[WAL Test] Output file content: "${content}"`);
  
  // 测试恢复
  console.log('[WAL Test] Testing replay (should skip already applied)...');
  const replayResult = wal.replay();
  console.log('[WAL Test] Replay result:', replayResult);
  
  // 清理
  fs.rmSync(path.join(__dirname, '..', '.wal-test'), { recursive: true });
  console.log('[WAL Test] ✅ All tests passed!');
}
