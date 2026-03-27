#!/usr/bin/env node
/**
 * Response Latency Monitor v0.1
 * 监控"触发→响应开始"的延迟，确保spontaneous responsiveness
 *
 * 目标: 平均 < 100ms，95% < 200ms
 *
 * 使用方式:
 *  - 在session开始时: const monitor = require('./scripts/response-latency-monitor');
 *  - 标记触发点: monitor.trigger('heartbeat-poll');
 *  - 标记响应开始: monitor.responseStart();
 *  - 在session-finalizer: monitor.logSession(sessionNumber);
 *
 * 输出: memory/latency-log.jsonl
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_PATH = path.join(__dirname, '..', 'memory', 'latency-log.jsonl');
const HISTORY_WINDOW = 100; // 滑动窗口100次

class LatencyMonitor {
  constructor() {
    this.currentTrigger = null;
    this.triggerTime = null;
    this.responseTime = null;
    this.sessionSamples = []; // 当前session的样本
    this.history = this.loadHistory();
  }

  loadHistory() {
    try {
      if (!fs.existsSync(LOG_PATH)) return [];
      const content = fs.readFileSync(LOG_PATH, 'utf8');
      const lines = content.trim().split('\n').filter(l => l);
      const samples = lines.map(l => JSON.parse(l));
      // 只保留最近HISTORY_WINDOW条用于实时计算
      return samples.slice(-HISTORY_WINDOW);
    } catch (e) {
      console.error('[LatencyMonitor] Failed to load history:', e.message);
      return [];
    }
  }

  /**
   * 标记触发时刻（外部事件发生）
   * @param {string} source - 触发来源（如'heartbeat-poll', 'cron-training', 'user-message'）
   */
  trigger(source) {
    this.triggerTime = Date.now();
    this.currentTrigger = source;
    // 如果有上次未完成的，标记超时
    if (this.currentTrigger && this.responseTime === null) {
      this.recordSample(null, 'trigger-timeout');
    }
  }

  /**
   * 标记响应开始（开始处理）
   */
  responseStart() {
    if (!this.triggerTime) {
      console.warn('[LatencyMonitor] responseStart called without trigger');
      return;
    }
    this.responseTime = Date.now();
    const latency = this.responseTime - this.triggerTime;
    this.recordSample(latency, 'ok');
    // 重置状态
    this.triggerTime = null;
    this.responseTime = null;
    this.currentTrigger = null;
  }

  recordSample(latency, status) {
    const sample = {
      timestamp: new Date().toISOString(),
      host: os.hostname(),
      triggerSource: this.currentTrigger || 'unknown',
      latencyMs: latency,
      status: status
    };
    this.sessionSamples.push(sample);
    this.history.push(sample);
    // 保持history窗口大小
    if (this.history.length > HISTORY_WINDOW) {
      this.history.shift();
    }
    if (status === 'ok' && latency > 200) {
      console.warn(`[LatencyMonitor] High latency: ${latency}ms from ${sample.triggerSource}`);
    }
  }

  /**
   * 获取当前指标
   */
  getMetrics() {
    const valid = this.history.filter(s => s.status === 'ok' && typeof s.latencyMs === 'number');
    if (valid.length === 0) {
      return { avg: null, p95: null, count: 0, warning: 'no data' };
    }
    const latencies = valid.map(s => s.latencyMs).sort((a, b) => a - b);
    const sum = latencies.reduce((a, b) => a + b, 0);
    const avg = sum / latencies.length;
    const p95Idx = Math.floor(latencies.length * 0.95);
    const p95 = latencies[p95Idx] || latencies[latencies.length - 1];
    return {
      avg: Math.round(avg * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      count: valid.length,
      recentSample: latencies[latencies.length - 1]
    };
  }

  /**
   * 持久化当前session样本到磁盘
   */
  persistSession() {
    if (this.sessionSamples.length === 0) return;
    try {
      const content = this.sessionSamples.map(s => JSON.stringify(s)).join('\n') + '\n';
      fs.appendFileSync(LOG_PATH, content, 'utf8');
      console.log(`[LatencyMonitor] Persisted ${this.sessionSamples.length} samples`);
      this.sessionSamples = []; // 清空当前session
    } catch (e) {
      console.error('[LatencyMonitor] Failed to persist:', e.message);
    }
  }

  /**
   * 检查是否需要告警
   */
  checkAlarm() {
    const m = this.getMetrics();
    if (!m.avg) return { level: 'info', message: 'no data' };
    if (m.avg > 500 || m.p95 > 800) {
      return { level: 'critical', message: `High latency: avg=${m.avg}ms, p95=${m.p95}ms` };
    }
    if (m.avg > 200) {
      return { level: 'warning', message: `Elevated latency: avg=${m.avg}ms, p95=${m.p95}ms` };
    }
    return { level: 'ok', message: `Normal latency: avg=${m.avg}ms, p95=${m.p95}ms` };
  }
}

// ==================== 全局实例 ====================
const monitor = new LatencyMonitor();

// ==================== CLI接口 ====================
if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd === 'trigger') {
    monitor.trigger(process.argv[3] || 'manual');
    console.log('[LatencyMonitor] Triggered:', monitor.currentTrigger);
  } else if (cmd === 'response') {
    monitor.responseStart();
    console.log('[LatencyMonitor] Response started, latency recorded');
  } else if (cmd === 'metrics') {
    console.log(JSON.stringify(monitor.getMetrics(), null, 2));
  } else if (cmd === 'alarm') {
    console.log(JSON.stringify(monitor.checkAlarm(), null, 2));
  } else if (cmd === 'persist') {
    monitor.persistSession();
  } else {
    console.log(`
Usage:
  node response-latency-monitor.js trigger <source>   # 标记触发
  node response-latency-monitor.js response         # 标记响应开始
  node response-latency-monitor.js metrics         # 打印指标
  node response-latency-monitor.js alarm           # 检查告警
  node response-latency-monitor.js persist         # 持久化当前session
    `);
  }
}

module.exports = { LatencyMonitor, monitor };
