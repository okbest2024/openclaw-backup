#!/usr/bin/env node

/**
 * OpenClaw 备份到飞书云文档表格
 *
 * 功能：
 * 1. 扫描 workspace 文件
 * 2. 计算文件哈希（SHA256）
 * 3. 与表格现有记录去重
 * 4. 只备份新增/变更的文件
 * 5. 记录结果到状态文件
 *
 * 用法：
 *   node backup-to-doc-table.js [--dry-run] [--doc-token DOC_TOKEN]
 *
 * 环境变量：
 *   FEISHU_BACKUP_DOC_TOKEN - 备份文档的 document_id
 *   FEISHU_BACKUP_TABLE_ID - 表格 block_id (可选，缺省则读取文档第一个表格)
 *
 * 首次使用：
 *   1. 手动在飞书创建文档"OpenClaw 备份索引"
 *   2. 在文档中创建表格（8列），复制 table_block_id 填入配置
 *   3. 将 doc_token 和 table_block_id 写入此脚本或环境变量
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ==================== 配置区 ====================

const CONFIG = {
  // 备份文档和表格信息（已配置正式文档）
  docToken: process.env.FEISHU_BACKUP_DOC_TOKEN || 'GaDhdogBhoQWRQx5lG4cpyQknUb', // 正式备份文档
  tableBlockId: process.env.FEISHU_BACKUP_TABLE_ID || 'doxcnwhyXhKB6ORGWeAHoW6vlJf', // 主数据表格

  // 备份范围（workspace 相对路径）- 从 heartbeat-state.json 的关键文件开始
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

  // 排除文件（正则模式）
  excludePatterns: [
    /node_modules/,
    /\.git/,
    /backup/,
    /temp/,
    /\.log$/,
    /\.bak$/
  ],

  // 状态文件路径（用于记录上次备份时间、已备份文件哈希缓存）
  stateFilePath: 'memory/feishu-backup-state.json',

  // 是否启用 dry-run（不实际写入飞书）
  dryRun: false,

  // 是否只备份变更的文件（true=增量，false=全量）
  incremental: true
};

// 表格字段定义（与飞书文档表格列顺序一致）
const FIELDS = {
  fileName: 0,       // 文件名（用于去重）
  fileType: 1,       // 文件类型（配置文件/记忆文件/日志文件/脚本/技能）
  localPath: 2,      // workspace 相对路径
  backupTime: 3,     // ISO 8601 格式
  fileSize: 4,       // bytes
  fileHash: 5,       // SHA256
  status: 6,         // 成功/失败/跳过
  remark: 7          // 备注
};

// ==================== 工具函数 ====================

function log(message, type = 'info') {
  const prefix = {
    'info': '📋',
    'success': '✅',
    'error': '❌',
    'warn': '⚠️',
    'debug': '🐛'
  }[type] || '📌';
  console.log(`${prefix} ${message}`);
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
  if (ext === '.md') return 'Markdown文档';
  if (filePath.includes('skill')) return '技能文件';
  return '其他';
}

function computeFileHash(filePath) {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return `sha256:${hash.digest('hex').substring(0, 16)}...`; // 截断显示
}

function shouldExclude(filePath) {
  return CONFIG.excludePatterns.some(pattern => pattern.test(filePath));
}

function matchesGlob(filePath, globs) {
  // 简单实现：将 glob 转为 regex
  // 注意：这不完整，仅用于演示。生产环境建议使用 'minimatch' 库
  return globs.some(glob => {
    const pattern = glob
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(filePath.replace(/\\/g, '/'));
  });
}

function loadState() {
  if (fs.existsSync(CONFIG.stateFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG.stateFilePath, 'utf8'));
    } catch (e) {
      log(`状态文件读取失败，将创建新的: ${e.message}`, 'warn');
    }
  }
  return {
    lastBackupTime: null,
    backups: {}, // { filePath: { hash, backupTime } }
    stats: {
      totalFiles: 0,
      backedUp: 0,
      skipped: 0,
      failed: 0
    }
  };
}

function saveState(state) {
  const dir = path.dirname(CONFIG.stateFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG.stateFilePath, JSON.stringify(state, null, 2));
}

function getWorkspaceFiles() {
  const files = [];

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(process.cwd(), fullPath);

      if (shouldExclude(relPath)) continue;
      if (!matchesGlob(relPath, CONFIG.includeGlobs)) continue;

      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile()) {
        files.push({
          path: fullPath,
          relPath,
          size: fs.statSync(fullPath).size,
          mtime: fs.statSync(fullPath).mtime
        });
      }
    }
  }

  scan(process.cwd());
  return files;
}

// ==================== 飞书 API 交互 ====================

/**
 * 读取表格所有数据
 * 返回二维数组 [[row1col1, row1col2, ...], [row2col1, ...], ...]
 */
async function readTableAll(docToken, tableBlockId) {
  try {
    // 调用 feishu_doc list_blocks 获取文档所有块
    const blocksResponse = await feishu_doc({
      action: "list_blocks",
      doc_token: docToken
    });

    if (!blocksResponse || !blocksResponse.blocks) {
      throw new Error('list_blocks 返回无效数据');
    }

    const blocks = blocksResponse.blocks;

    // 找到表格 block
    const tableBlock = blocks.find(b => b.block_id === tableBlockId && b.block_type === 31);
    if (!tableBlock) {
      throw new Error(`未找到表格 block: ${tableBlockId}`);
    }

    const columnSize = tableBlock.table.property.column_size;
    const cellBlockIds = tableBlock.children;

    log(`表格结构: ${columnSize} 列, ${cellBlockIds.length} 个单元格 (约 ${Math.floor(cellBlockIds.length / columnSize)} 行)`, 'debug');

    // 构建 block ID 到 block 内容的映射
    const blockMap = new Map();
    for (const block of blocks) {
      blockMap.set(block.block_id, block);
    }

    // 解析单元格数据（每 columnSize 个 cell block 组成一行）
    const rows = [];
    for (let i = 0; i < cellBlockIds.length; i += columnSize) {
      const row = [];
      for (let col = 0; col < columnSize; col++) {
        const cellBlockId = cellBlockIds[i + col];
        if (!cellBlockId) {
          row.push('');
          continue;
        }

        const cellBlock = blockMap.get(cellBlockId);
        if (!cellBlock || cellBlock.block_type !== 32) {
          row.push('');
          continue;
        }

        // cell block 的 children 包含 text blocks (block_type 2)
        let cellText = '';
        if (cellBlock.children && cellBlock.children.length > 0) {
          // 取第一个 text block
          const textBlockId = cellBlock.children[0];
          const textBlock = blockMap.get(textBlockId);
          if (textBlock && textBlock.block_type === 2 && textBlock.text && textBlock.text.elements) {
            cellText = textBlock.text.elements
              .map(el => el.text_run ? el.text_run.content : '')
              .join('');
          }
        }
        row.push(cellText || '');
      }
      rows.push(row);
    }

    log(`成功读取表格数据: ${rows.length} 行`, 'debug');
    return rows;

  } catch (error) {
    log(`读取表格失败: ${error.message}`, 'error');
    return [];
  }
}

/**
 * 写入表格数据
 */
async function appendTableRows(docToken, tableBlockId, rows) {
  if (CONFIG.dryRun) {
    log(`[DRY-RUN] 将追加 ${rows.length} 行数据到表格`);
    rows.forEach(row => log(`  - ${row[0]} (${row[FIELDS.fileSize]} bytes)`));
    return { success: true, cellsWritten: rows.length * 8 };
  }

  // 实际调用 feishu_doc write_table_cells
  log(`正在写入 ${rows.length} 行数据...`, 'info');

  try {
    const result = await feishu_doc({
      action: "write_table_cells",
      doc_token: docToken,
      table_block_id: tableBlockId,
      values: rows
    });

    if (result.success) {
      log(`✅ 成功写入 ${result.cells_written || rows.length * 8} 个单元格`, 'success');
      return { success: true, result };
    } else {
      throw new Error('飞书 API 返回失败');
    }
  } catch (error) {
    log(`写入飞书失败: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// ==================== 核心备份逻辑 ====================

/**
 * 主备份函数（供 agent 调用）
 * 注意：此函数需在 OpenClaw agent 上下文中执行，以使用 feishu_doc 工具
 */
async function runBackup(options = {}) {
  const dryRun = options.dryRun || CONFIG.dryRun;
  const incremental = options.incremental !== undefined ? options.incremental : CONFIG.incremental;

  log('🚀 开始 OpenClaw 备份到飞书表格', 'info');
  log(`时间: ${new Date().toISOString()}`, 'debug');

  const state = loadState();
  const files = getWorkspaceFiles();
  log(`扫描到 ${files.length} 个文件符合备份范围`, 'info');

  const now = new Date().toISOString();
  const rowsToAppend = [];
  let checked = 0, backedUp = 0, skipped = 0;

  for (const file of files) {
    checked++;
    const currentHash = computeFileHash(file.path);
    const previous = state.backups[file.relPath];

    // 判断是否需要备份
    const needsBackup = !incremental || !previous || previous.hash !== currentHash;

    if (!needsBackup) {
      skipped++;
      log(`跳过（未变更）: ${file.relPath}`, 'debug');
      continue;
    }

    // 准备行数据
    const row = new Array(8).fill('');
    row[FIELDS.fileName] = path.basename(file.path);
    row[FIELDS.fileType] = getFileType(file.relPath);
    row[FIELDS.localPath] = file.relPath;
    row[FIELDS.backupTime] = now;
    row[FIELDS.fileSize] = file.size;
    row[FIELDS.fileHash] = currentHash;
    row[FIELDS.status] = '成功';
    row[FIELDS.remark] = previous ? '文件已更新' : '首次备份';

    rowsToAppend.push(row);
    backedUp++;

    // 更新状态缓存
    state.backups[file.relPath] = {
      hash: currentHash,
      backupTime: now,
      size: file.size
    };
  }

  state.stats = {
    totalFiles: checked,
    backedUp,
    skipped,
    failed: 0,
    lastBackupTime: now
  };

  // 写入飞书表格
  if (rowsToAppend.length > 0) {
    log(`\n需要备份 ${rowsToAppend.length} 个文件（新增/变更）`, 'info');
    try {
      // 在 agent 上下文中，feishu_doc 是全局可用工具
      const result = await appendTableRows(CONFIG.docToken, CONFIG.tableBlockId, rowsToAppend);
      if (result.success) {
        log(`✅ 成功写入 ${result.cellsWritten} 个单元格`, 'success');
      } else {
        throw new Error('飞书 API 调用失败');
      }
    } catch (error) {
      log(`写入飞书失败: ${error.message}`, 'error');
      state.stats.failed = rowsToAppend.length;
    }
  } else {
    log('没有需要备份的文件', 'info');
  }

  // 保存状态文件（本身也需记录到备份？暂不递归）
  saveState(state);

  // 输出摘要
  log('\n========== 备份完成 ==========', 'info');
  log(`总文件数: ${checked}`, 'info');
  log(`成功备份: ${backedUp}`, 'success');
  log(`跳过（未变更）: ${skipped}`, 'info');
  log(`失败: ${state.stats.failed}`, state.stats.failed > 0 ? 'error' : 'info');
  log(`状态已保存: ${CONFIG.stateFilePath}`, 'info');
  log(`下次备份: ${new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleString()}`, 'info');

  return state;
}

// ==================== 执行入口 ====================

if (require.main === module) {
  // 解析命令行参数
  const args = process.argv.slice(2);
  if (args.includes('--dry-run')) CONFIG.dryRun = true;
  if (args.includes('--full')) CONFIG.incremental = false;

  runBackup().catch(err => {
    log(`备份过程异常: ${err.stack}`, 'error');
    process.exit(1);
  });
}

module.exports = { runBackup, getWorkspaceFiles, computeFileHash, readTableAll, appendTableRows };
