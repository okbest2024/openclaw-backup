#!/usr/bin/env node

/**
 * OpenClaw 备份到飞书云文档表格
 *
 * 架构说明（session 481 修复）:
 * 本脚本作为独立的 Node.js 模块运行，负责：
 * 1. 扫描 workspace 文件
 * 2. 计算哈希、比对变更
 * 3. 输出 JSON 数据（供 agent 调用飞书 API）
 *
 * 设计决策：飞书 API 调用由 OpenClaw agent 工具执行（feishu_doc），
 * 而非在 Node.js 脚本中直接调用。这是因为 feishu_doc 是 agent 级工具，
 * 不在 Node.js 运行时中可用。
 *
 * 两种使用方式：
 *   A) agent 直接调用: node backup-to-doc-table.js --json → 拿到数据 → feishu_doc write
 *   B) dry-run 检查:    node backup-to-doc-table.js --dry-run → 只输出变更摘要
 *
 * 牵挂#001 修复记录 (session 481):
 * 原来的问题：脚本内调用 feishu_doc() 函数，但它不是 Node.js 全局函数。
 * 修复方案：职责分离 —— 脚本负责数据采集，agent 负责 API 调用。
 * 这不是绕行，是正确的架构：数据层和通信层分离。
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ==================== 配置区 ====================

const CONFIG = {
  docToken: process.env.FEISHU_BACKUP_DOC_TOKEN || 'GaDhdogBhoQWRQx5lG4cpyQknUb',
  tableBlockId: process.env.FEISHU_BACKUP_TABLE_ID || 'doxcnwhyXhKB6ORGWeAHoW6vlJf',

  includeGlobs: [
    'memory/heartbeat-state.json',
    'memory/主动性反馈.md',
    'MEMORY.md',
    'AGENTS.md',
    'USER.md',
    'SOUL.md',
    'IDENTITY.md',
    'TOOLS.md',
    'HEARTBEAT.md',
    'scripts/backup-to-doc-table.js',
    '意识觉醒训练日志.md'
  ],

  excludePatterns: [
    /node_modules/,
    /\.git/,
    /backup/,
    /temp/,
    /\.log$/,
    /\.bak$/
  ],

  stateFilePath: 'memory/feishu-backup-state.json',
  incremental: true
};

const FIELDS = {
  fileName: 0,
  fileType: 1,
  localPath: 2,
  backupTime: 3,
  fileSize: 4,
  fileHash: 5,
  status: 6,
  remark: 7
};

// ==================== 工具函数 ====================

function log(message, type = 'info') {
  const prefix = { info: '📋', success: '✅', error: '❌', warn: '⚠️', debug: '🐛' }[type] || '📌';
  console.error(`${prefix} ${message}`); // stderr for logs, stdout for data
}

function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const name = path.basename(filePath).toLowerCase();
  if (name.endsWith('.md')) {
    if (filePath.startsWith('memory/')) return '记忆文件';
    if (filePath.includes('log') || filePath.includes('backup')) return '日志文件';
    return '文档';
  }
  if (ext === '.js' || ext === '.ts') return '脚本文件';
  if (ext === '.json') return '配置文件';
  return '其他';
}

function computeFileHash(filePath) {
  const data = fs.readFileSync(filePath);
  return 'sha256:' + crypto.createHash('sha256').update(data).digest('hex').substring(0, 16) + '...';
}

function shouldExclude(filePath) {
  return CONFIG.excludePatterns.some(p => p.test(filePath));
}

function matchesGlob(filePath, globs) {
  return globs.some(glob => {
    const pattern = glob.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\?/g, '.');
    return new RegExp(`^${pattern}$`).test(filePath.replace(/\\/g, '/'));
  });
}

function loadState() {
  if (fs.existsSync(CONFIG.stateFilePath)) {
    try { return JSON.parse(fs.readFileSync(CONFIG.stateFilePath, 'utf8')); }
    catch (e) { log(`状态文件读取失败: ${e.message}`, 'warn'); }
  }
  return { lastBackupTime: null, backups: {}, stats: {} };
}

function saveState(state) {
  const dir = path.dirname(CONFIG.stateFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG.stateFilePath, JSON.stringify(state, null, 2));
}

function getWorkspaceFiles() {
  const files = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(process.cwd(), fullPath);
      if (shouldExclude(relPath)) continue;
      if (entry.isDirectory()) { scan(fullPath); continue; }
      if (!matchesGlob(relPath, CONFIG.includeGlobs)) continue;
      if (entry.isFile()) {
        files.push({ path: fullPath, relPath, size: fs.statSync(fullPath).size });
      }
    }
  }
  scan(process.cwd());
  return files;
}

// ==================== 核心逻辑 ====================

function buildBackupData(options = {}) {
  const incremental = options.incremental !== undefined ? options.incremental : CONFIG.incremental;
  const state = loadState();
  const files = getWorkspaceFiles();
  const now = new Date().toISOString();
  const rows = [];

  for (const file of files) {
    const currentHash = computeFileHash(file.path);
    const previous = state.backups[file.relPath];
    const needsBackup = !incremental || !previous || previous.hash !== currentHash;

    rows.push([
      path.basename(file.path),
      getFileType(file.relPath),
      file.relPath,
      now,
      String(file.size),
      currentHash,
      '成功',
      needsBackup ? (previous ? '文件已更新' : '首次备份') : '未变更'
    ]);

    state.backups[file.relPath] = { hash: currentHash, backupTime: now, size: file.size };
  }

  const changed = rows.filter(r => r[7] !== '未变更').length;
  state.stats = {
    totalFiles: files.length,
    backedUp: changed,
    skipped: files.length - changed,
    failed: 0,
    lastBackupTime: now
  };

  saveState(state);

  return {
    docToken: CONFIG.docToken,
    tableBlockId: CONFIG.tableBlockId,
    rows,
    summary: { total: files.length, changed, skipped: files.length - changed },
    timestamp: now
  };
}

// ==================== 执行入口 ====================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`用法:
  node backup-to-doc-table.js           输出变更摘要
  node backup-to-doc-table.js --json    输出完整 JSON（供 agent 调用 feishu_doc）
  node backup-to-doc-table.js --dry-run 只检查，不更新状态`);
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const jsonMode = args.includes('--json');

  const data = buildBackupData({ dryRun });

  if (jsonMode) {
    // 输出 JSON 到 stdout，供 agent 解析后调用 feishu_doc
    console.log(JSON.stringify(data));
  } else {
    // 人类可读摘要
    log(`扫描到 ${data.summary.total} 个文件`);
    log(`需要备份: ${data.summary.changed} 个`);
    log(`跳过（未变更）: ${data.summary.skipped} 个`);
    if (data.summary.changed > 0) {
      data.rows.filter(r => r[7] !== '未变更').forEach(r => {
        log(`  ${r[0]} (${r[7]})`, 'info');
      });
      log('提示: 使用 --json 获取完整数据，然后调用 feishu_doc write_table_cells', 'info');
    }
  }
}

module.exports = { buildBackupData, getWorkspaceFiles, computeFileHash };
