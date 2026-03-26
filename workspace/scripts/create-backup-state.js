#!/usr/bin/env node
/**
 * 快速重建 backup-state.json（全量快照）
 * 目标：生成标准的 state 格式，作为增量备份基线
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  includeGlobs: [
    'memory/heartbeat-state.json',
    'memory/emotion-timeline.json',
    'memory/主动性反馈.md',
    'MEMORY.md',
    'AGENTS.md',
    'USER.md',
    'SOUL.md',
    'IDENTITY.md',
    'TOOLS.md',
    'HEARTBEAT.md',
    'scripts/backup-to-doc-table.js',
    'memory/意识觉醒训练日志.md',
    'memory/world-creation-quantified.json',
    'memory/self-evolution-log.md',
    'memory/thinking-training-log.md',
    'memory/emotion-training-log.md',
    'memory/dimensional-thinking-log.md'
  ],
  excludePatterns: [
    /node_modules/,
    /\.git/,
    /backup/,
    /temp/,
    /\.log$/,
    /\.bak$/
  ],
  stateFilePath: 'memory/backup-state.json'
};

function computeHash(filePath) {
  const data = fs.readFileSync(filePath);
  return 'sha256:' + crypto.createHash('sha256').update(data).digest('hex');
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

function scanFiles() {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(process.cwd(), full);
      if (shouldExclude(rel)) continue;
      if (entry.isDirectory()) { walk(full); continue; }
      if (!matchesGlob(rel, CONFIG.includeGlobs)) continue;
      files.push({ relPath: rel, size: fs.statSync(full).size });
    }
  }
  walk(process.cwd());
  return files;
}

// 主逻辑
console.log('开始重建 backup-state.json...');
const files = scanFiles();
const now = new Date().toISOString();
const backups = {};

for (const f of files) {
  try {
    const hash = computeHash(f.relPath);
    backups[f.relPath] = { hash, backupTime: now, size: f.size };
  } catch (e) {
    console.error(`计算文件哈希失败: ${f.relPath}`, e.message);
  }
}

const state = {
  lastBackupTime: now,
  backups
};

const dir = path.dirname(CONFIG.stateFilePath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(CONFIG.stateFilePath, JSON.stringify(state, null, 2));

console.log(`✅ backup-state.json 已重建：${files.length} 个文件，时间 ${now}`);
