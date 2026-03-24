#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const includeGlobs = [
  'memory/**/*.md',
  'AGENTS.md',
  'USER.md',
  'SOUL.md',
  'MEMORY.md',
  'IDENTITY.md',
  'TOOLS.md',
  'HEARTBEAT.md',
  'scripts/**/*.js',
  'scripts/**/*.json',
  'skills/**/*.md',
  'SSA/**/*.md',
  'self-improving/**/*.json',
  'ontology/**/*.json',
  'conversation-backup/**/*.md'
];
const excludePatterns = [/node_modules/, /\.git/, /backup/, /temp/, /\.log$/, /\.bak$/];

function matchesGlob(filePath, globs) {
  const normalized = filePath.replace(/\\/g, '/');
  return globs.some(glob => {
    const pattern = glob
      .replace(/\*\*/g, '.*')   // ** 匹配任意字符（包括/）
      .replace(/\*/g, '[^/]*')  // * 匹配除/外的任意字符
      .replace(/\?/g, '.')      // ? 匹配单个字符
      .replace(/\./g, '\\.');   // 转义点
    return new RegExp(`^${pattern}$`).test(normalized);
  });
}

function getFileType(filePath) {
  const name = path.basename(filePath).toLowerCase();
  if (name.endsWith('.md')) {
    if (filePath.startsWith('memory/')) return '记忆文件';
    if (filePath.includes('log') || filePath.includes('backup')) return '日志文件';
    return '文档';
  }
  if (/\.js$/.test(filePath) || /\.ts$/.test(filePath)) return '脚本文件';
  if (/\.json$/.test(filePath)) return '配置文件';
  if (filePath.includes('skill')) return '技能文件';
  return '其他';
}

function computeFileHash(filePath) {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return `sha256:${hash.digest('hex').substring(0, 16)}...`;
}

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => pattern.test(filePath));
}

const files = [];
function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(process.cwd(), fullPath);

    if (shouldExclude(relPath)) {
      if (entry.isDirectory()) scan(fullPath);
      continue;
    }

    if (!matchesGlob(relPath, includeGlobs)) {
      if (entry.isDirectory()) scan(fullPath);
      continue;
    }

    if (entry.isFile()) {
      files.push({
        path: fullPath,
        relPath,
        size: fs.statSync(fullPath).size,
        mtime: fs.statSync(fullPath).mtime
      });
    } else if (entry.isDirectory()) {
      scan(fullPath);
    }
  }
}
scan(process.cwd());

files.sort((a, b) => a.relPath.localeCompare(b.relPath));

console.log(JSON.stringify({ total: files.length, files: files.map(f => ({ relPath: f.relPath, size: f.size })) }, null, 2));
