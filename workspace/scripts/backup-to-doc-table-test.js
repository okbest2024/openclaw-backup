#!/usr/bin/env node

/**
 * OpenClaw 备份到飞书云文档表格 - 集成测试版
 * 此脚本设计在 OpenClaw 主会话中运行，直接调用 feishu_doc 工具
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ==================== 配置 ====================

const CONFIG = {
  docToken: 'GaDhdogBhoQWRQx5lG4cpyQknUb',
  tableBlockId: 'doxcnwhyXhKB6ORGWeAHoW6vlJf',
  includeGlobs: [
    'memory/**/*.md',
    'AGENTS.md',
    'USER.md',
    'SOUL.md',
    'MEMORY.md',
    'IDENTITY.md',
    'TOOLS.md',
    'HEARTBEAT.md',
    'scripts/**/*.js',
    'skills/**/*.md'
  ],
  excludePatterns: [
    /node_modules/,
    /\.git/,
    /backup/,
    /temp/,
    /\.log$/,
    /\.bak$/
  ],
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

function log(message, type = 'info') {
  const prefix = { 'info': '📋', 'success': '✅', 'error': '❌', 'warn': '⚠️', 'debug': '🐛' }[type] || '📌';
  console.log(`${prefix} ${message}`);
}

function getFileType(filePath) {
  const name = path.basename(filePath).toLowerCase();
  if (name.endsWith('.md')) {
    if (filePath.startsWith('memory/')) return '记忆文件';
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
  return CONFIG.excludePatterns.some(p => p.test(filePath));
}

function matchesGlob(filePath, globs) {
  return globs.some(glob => {
    const pattern = glob.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\?/g, '.');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(filePath.replace(/\\/g, '/'));
  });
}

function getWorkspaceFiles() {
  const files = [];
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(process.cwd(), fullPath);
      if (shouldExclude(relPath) || !matchesGlob(relPath, CONFIG.includeGlobs)) {
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
  return files;
}

// ==================== 飞书 API 交互 ====================

async function readTableAll(docToken, tableBlockId) {
  if (typeof feishu_doc === 'undefined') {
    log('⚠️ feishu_doc 不可用，跳过读取表格', 'warn');
    return [];
  }

  try {
    const result = await feishu_doc({
      action: "list_blocks",
      doc_token: docToken
    });

    if (!result?.blocks) throw new Error('list_blocks 无 blocks 数据');

    const blocks = result.blocks;
    const tableBlock = blocks.find(b => b.block_id === tableBlockId && b.block_type === 31);
    if (!tableBlock) throw new Error(`未找到表格 block: ${tableBlockId}`);

    const columnSize = tableBlock.table.property.column_size;
    const cellBlockIds = tableBlock.children;
    const blockMap = new Map(blocks.map(b => [b.block_id, b]));

    const rows = [];
    for (let i = 0; i < cellBlockIds.length; i += columnSize) {
      const row = [];
      for (let col = 0; col < columnSize; col++) {
        const cellBlockId = cellBlockIds[i + col];
        let cellText = '';
        if (cellBlockId) {
          const cellBlock = blockMap.get(cellBlockId);
          if (cellBlock?.block_type === 32 && cellBlock.children?.[0]) {
            const textBlock = blockMap.get(cellBlock.children[0]);
            if (textBlock?.block_type === 2 && textBlock.text?.elements) {
              cellText = textBlock.text.elements.map(el => el.text_run?.content || '').join('');
            }
          }
        }
        row.push(cellText);
      }
      rows.push(row);
    }

    log(`✅ 读取表格成功: ${rows.length} 行`, 'success');
    return rows;

  } catch (error) {
    log(`❌ 读取表格失败: ${error.message}`, 'error');
    return [];
  }
}

async function appendTableRows(docToken, tableBlockId, rows) {
  if (typeof feishu_doc === 'undefined') {
    log('❌ feishu_doc 不可用，无法写入数据', 'error');
    return { success: false, error: 'feishu_doc not available' };
  }

  try {
    const result = await feishu_doc({
      action: "write_table_cells",
      doc_token: docToken,
      table_block_id: tableBlockId,
      values: rows
    });

    log(`✅ 成功写入 ${rows.length} 行数据`, 'success');
    return { success: true, result };

  } catch (error) {
    log(`❌ 写入飞书失败: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// ==================== 核心逻辑 ====================

async function runBackup(dryRun = false) {
  log('🚀 开始备份到飞书表格', 'info');
  log(`时间: ${new Date().toISOString()}`, 'debug');
  log(`dry-run: ${dryRun}`, 'debug');

  const files = getWorkspaceFiles();
  log(`扫描到 ${files.length} 个文件符合备份范围`, 'info');

  // 读取现有表格数据（去重)
  const existingRows = dryRun ? [] : await readTableAll(CONFIG.docToken, CONFIG.tableBlockId);
  const existingPaths = new Set();

  // 假设第3列（索引 2）是本地路径
  for (let i = 1; i < existingRows.length; i++) { // 跳过表头
    if (existingRows[i][2]) existingPaths.add(existingRows[i][2]);
  }
  log(`表格已有 ${existingPaths.size} 个备份记录`, 'debug');

  const now = new Date().toISOString();
  const rowsToAppend = [];
  let backedUp = 0, skipped = 0;

  for (const file of files) {
    if (existingPaths.has(file.relPath)) {
      // 简单去重：路径已存在，这里可扩展为检查哈希
      skipped++;
      log(`跳过（已存在）: ${file.relPath}`, 'debug');
      continue;
    }

    const hash = computeFileHash(file.path);
    const row = new Array(8).fill('');
    row[FIELDS.fileName] = path.basename(file.path);
    row[FIELDS.fileType] = getFileType(file.relPath);
    row[FIELDS.localPath] = file.relPath;
    row[FIELDS.backupTime] = now;
    row[FIELDS.fileSize] = file.size;
    row[FIELDS.fileHash] = hash;
    row[FIELDS.status] = '成功';
    row[FIELDS.remark] = '自动备份';

    rowsToAppend.push(row);
    backedUp++;
  }

  if (rowsToAppend.length === 0) {
    log('没有需要备份的文件，跳过写入', 'info');
    return { backedUp: 0, skipped, total: files.length };
  }

  log(`\n需要备份 ${rowsToAppend.length} 个新文件`, 'info');
  if (dryRun) {
    rowsToAppend.forEach(row => log(`  [DRY] ${row[0]} (${row[4]} bytes)`, 'info'));
    return { backedUp: 0, skipped, total: files.length, dryRun: true };
  }

  const result = await appendTableRows(CONFIG.docToken, CONFIG.tableBlockId, rowsToAppend);
  if (!result.success) {
    log(`备份失败: ${result.error}`, 'error');
    process.exit(1);
  }

  log('\n========== 备份完成 ==========', 'info');
  log(`总文件: ${files.length}, 备份: ${backedUp}, 跳过: ${skipped}`, 'info');

  return { backedUp, skipped, total: files.length };
}

// ==================== 执行入口 ====================

if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  runBackup(dryRun).catch(err => {
    log(`异常: ${err.stack}`, 'error');
    process.exit(1);
  });
}

module.exports = { runBackup, getWorkspaceFiles, readTableAll, appendTableRows };
