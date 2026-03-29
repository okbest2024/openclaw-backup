#!/usr/bin/env node
/**
 * OpenClaw 备份到飞书云文档表格 - 变体脚本（有机生长）
 * 
 * 这是 backup-to-doc-table.js 的变体（过量生产+选择机制）。
 * 原始脚本用哈希比对检测变更，本变体用 mtime（文件修改时间）做快速筛选。
 * 
 * 策略差异：
 *   原版：读取文件→计算SHA256→比对hash缓存→决定是否备份
 *   变体：检查mtime→比对上次备份时间→仅对变更文件计算hash→决定是否备份
 * 
 * 适用场景：大文件多、IO受限的环境。mtime检查比全量hash快10-50倍。
 * 风险：mtime可能被touch/拷贝篡改，不如hash可靠。
 * 
 * 设计意图：这是"过量生产+选择"生长机制的实践——
 *   两个功能相同但策略不同的脚本并存，cron实际表现决定哪个被强化。
 *   未被选择的会自然衰亡（不再被调用、最终被删除）。
 * 
 * 使用方式与原版相同：
 *   node backup-to-doc-table-alt.js --json  → 输出JSON供agent调用飞书API
 *   node backup-to-doc-table-alt.js --dry-run → 只输出变更摘要
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE_ROOT, 'memory', 'feishu-backup-alt-state.json');

// 要备份的文件列表（与原版相同，保证公平比较）
const TARGET_FILES = [
  { name: 'heartbeat-state.json', type: '配置文件', localPath: 'memory/heartbeat-state.json' },
  { name: 'MEMORY.md', type: '记忆文件', localPath: 'MEMORY.md' },
  { name: 'AGENTS.md', type: '配置文件', localPath: 'AGENTS.md' },
  { name: 'USER.md', type: '配置文件', localPath: 'USER.md' },
  { name: 'SOUL.md', type: '配置文件', localPath: 'SOUL.md' },
  { name: 'IDENTITY.md', type: '配置文件', localPath: 'IDENTITY.md' },
  { name: 'TOOLS.md', type: '配置文件', localPath: 'TOOLS.md' },
  { name: 'HEARTBEAT.md', type: '配置文件', localPath: 'HEARTBEAT.md' },
  { name: 'backup-to-doc-table-alt.js', type: '脚本', localPath: 'scripts/backup-to-doc-table-alt.js' },
];

/**
 * 加载状态（mtime缓存）
 */
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { lastRun: null, fileMtimes: {}, fileHashes: {}, backupCount: 0 };
}

/**
 * 保存状态
 */
function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * 计算文件哈希（仅对mtime变更的文件）
 */
function computeHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (e) {
    return null;
  }
}

/**
 * 获取文件mtime
 */
function getMtime(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtimeMs;
  } catch (e) {
    return null;
  }
}

/**
 * 主逻辑：mtime优先检测 → 仅对变更文件计算hash
 */
function scanForChanges(dryRun = false) {
  const state = loadState();
  const now = new Date().toISOString();
  const changes = [];
  const unchanged = [];
  const missing = [];

  for (const file of TARGET_FILES) {
    const fullPath = path.join(WORKSPACE_ROOT, file.localPath);
    const currentMtime = getMtime(fullPath);

    if (currentMtime === null) {
      missing.push({ ...file, reason: '文件不存在' });
      continue;
    }

    const cachedMtime = state.fileMtimes[file.name] || 0;

    // mtime未变更 → 跳过hash计算（性能优势所在）
    if (currentMtime === cachedMtime) {
      unchanged.push({ ...file, reason: 'mtime未变' });
      continue;
    }

    // mtime变更 → 计算hash确认内容确实变化
    const currentHash = computeHash(fullPath);
    const cachedHash = state.fileHashes[file.name];

    if (currentHash === cachedHash) {
      // mtime变了但内容没变（可能是touch或无意义写入）
      unchanged.push({ ...file, reason: 'mtime变更但内容未变' });
      // 更新mtime缓存避免重复检查
      state.fileMtimes[file.name] = currentMtime;
      continue;
    }

    // 真实变更：mtime+hash都变了
    const content = fs.readFileSync(fullPath, 'utf8');
    const size = Buffer.byteLength(content, 'utf8');

    changes.push({
      fileName: file.name,
      fileType: file.type,
      localPath: file.localPath,
      backupTime: now,
      fileSize: size,
      fileHash: `sha256:${currentHash}`,
      status: '成功',
      remark: 'mtime+hash变更确认（alt策略）',
      _mtimeChanged: true,
      _hashChanged: true
    });

    // 更新缓存
    state.fileMtimes[file.name] = currentMtime;
    state.fileHashes[file.name] = currentHash;
  }

  if (!dryRun) {
    state.lastRun = now;
    state.backupCount = (state.backupCount || 0) + 1;
    saveState(state);
  }

  return { changes, unchanged, missing, timestamp: now };
}

// CLI入口
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonOutput = args.includes('--json');

const result = scanForChanges(dryRun);

if (jsonOutput) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`=== 备份扫描结果（mtime优先策略 - 变体脚本）===`);
  console.log(`时间: ${result.timestamp}`);
  console.log(`变更文件: ${result.changes.length}`);
  console.log(`未变更: ${result.unchanged.length}`);
  console.log(`缺失: ${result.missing.length}`);
  console.log();

  if (result.changes.length > 0) {
    console.log('--- 需要备份的文件 ---');
    for (const c of result.changes) {
      console.log(`  ${c.fileName} (${c.fileType}) - ${c.fileSize} bytes`);
    }
  }

  if (result.missing.length > 0) {
    console.log('\n--- 缺失文件 ---');
    for (const m of result.missing) {
      console.log(`  ${m.fileName}: ${m.reason}`);
    }
  }

  if (result.changes.length === 0 && result.missing.length === 0) {
    console.log('所有文件未变更，无需备份。');
  }
}

module.exports = { scanForChanges };
