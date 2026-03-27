#!/usr/bin/env node

/**
 * Execute LLM tasks with automatic provider fallback
 * 主provider失败时自动切换到备用provider
 * 
 * Usage: 
 *   const { executeWithFallback } = require('./scripts/execute-with-fallback');
 *   const result = await executeWithFallback(async (provider) => {
 *     return await callLLM(provider, prompt);
 *   });
 */

const fs = require('fs');
const path = require('path');

const HEARTBEAT_STATE_PATH = path.join(__dirname, '..', 'memory', 'heartbeat-state.json');
const SWITCH_LOG_PATH = path.join(__dirname, '..', 'memory', 'provider-switch-log.md');

// Provider优先级（从高到低）
const PROVIDER_PRIORITY = ['openrouter', 'stepfun', 'bailian'];

/**
 * 读取provider状态
 */
function loadProviderStatus() {
  try {
    if (!fs.existsSync(HEARTBEAT_STATE_PATH)) {
      return { openrouter: { status: 'unknown' } };
    }
    const content = fs.readFileSync(HEARTBEAT_STATE_PATH, 'utf8');
    const state = JSON.parse(content);
    return state.providerStatus || {};
  } catch (error) {
    console.error('Failed to load provider status:', error.message);
    return {};
  }
}

/**
 * 记录provider切换事件
 */
function logProviderSwitch(from, to, reason) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] Switched from ${from} to ${to}. Reason: ${reason}\n`;
  
  try {
    // Append to log file
    fs.appendFileSync(SWITCH_LOG_PATH, logEntry, 'utf8');
    console.log(`📝 Provider switch logged: ${from} → ${to}`);
  } catch (error) {
    console.error('Failed to log provider switch:', error.message);
  }
}

/**
 * 检查provider是否可用
 * @param {string} provider - provider名称
 * @returns {boolean} 是否可用
 */
function isProviderAvailable(provider) {
  const status = loadProviderStatus()[provider];
  if (!status) {
    // 无状态信息，假设可用（但会记录未知）
    console.warn(`⚠️ No status info for provider ${provider}, assuming available`);
    return true;
  }
  
  // status可以是 'operational', 'degraded', 'down'
  return status.status === 'operational';
}

/**
 * 获取第一个可用的provider
 * @param {string[]} priorityList - 可选的自定义优先级列表，默认使用全局PROVIDER_PRIORITY
 * @returns {string|null} 可用的provider名称，如果没有则返回null
 */
function getFirstAvailableProvider(priorityList = PROVIDER_PRIORITY) {
  for (const provider of priorityList) {
    if (isProviderAvailable(provider)) {
      return provider;
    }
  }
  return null;
}

/**
 * 执行带有fallback的任务
 * 
 * @param {Function} taskFn - 异步函数，接收provider参数，返回结果
 * @param {Object} options - 选项
 * @param {string[]} options.priority - provider优先级列表
 * @param {boolean} options.logSwitch - 是否记录切换日志
 * @returns {Promise<any>} 任务执行结果
 */
async function executeWithFallback(taskFn, options = {}) {
  const { priority = PROVIDER_PRIORITY, logSwitch = true } = options;
  
  let lastError;
  
  for (const provider of priority) {
    if (!isProviderAvailable(provider)) {
      console.log(`⏭️ Provider ${provider} is not available (status: ${loadProviderStatus()[provider]?.status || 'unknown'}), skipping...`);
      continue;
    }
    
    try {
      console.log(`🚀 Trying provider: ${provider}`);
      const result = await taskFn(provider);
      console.log(`✅ Provider ${provider} succeeded`);
      
      // 如果有之前的失败，记录成功恢复
      if (lastError && logSwitch) {
        logProviderSwitch('previous-failed', provider, 'Recovery after success');
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Provider ${provider} failed:`, error.message);
      lastError = error;
      
      // 记录失败（但先不记录切换，等尝试下一个或最终失败）
      // 继续尝试下一个provider
    }
  }
  
  // 所有provider都失败
  const errorMsg = `All providers failed. Last error: ${lastError?.message}`;
  console.error(`💥 ${errorMsg}`);
  
  // 记录最终失败
  if (logSwitch) {
    logProviderSwitch(priority.join('->'), 'none', 'All providers exhausted: ' + (lastError?.message || 'unknown'));
  }
  
  throw new Error(errorMsg);
}

/**
 * 快速检查所有provider健康状态
 * @returns {Object} 各provider状态摘要
 */
function checkProviderHealth() {
  const status = loadProviderStatus();
  const summary = {};
  
  for (const provider of PROVIDER_PRIORITY) {
    const providerStatus = status[provider];
    summary[provider] = {
      status: providerStatus?.status || 'unknown',
      issue: providerStatus?.issue || null,
      quotaRemaining: providerStatus?.quotaRemaining || null,
      available: isProviderAvailable(provider)
    };
  }
  
  return {
    timestamp: new Date().toISOString(),
    summary,
    firstAvailable: getFirstAvailableProvider()
  };
}

// 如果直接运行此脚本，输出健康检查
if (require.main === module) {
  const health = checkProviderHealth();
  console.log(JSON.stringify(health, null, 2));
}

module.exports = {
  executeWithFallback,
  isProviderAvailable,
  getFirstAvailableProvider,
  loadProviderStatus,
  logProviderSwitch,
  checkProviderHealth,
  PROVIDER_PRIORITY
};
