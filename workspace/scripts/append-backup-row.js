#!/usr/bin/env node
/**
 * 追加单行到飞书备份表格
 * 读取现有表格数据，追加新行，然后输出完整的values数组
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 从环境变量或硬编码获取配置
const DOC_TOKEN = 'GaDhdogBhoQWRQx5lG4cpyQknUb';
const TABLE_BLOCK_ID = 'doxcnwhyXhKB6ORGWeAHoW6vlJf';

// 要追加的行（第637次备份 - heartbeat-state.json）
const newRow = [
  'heartbeat-state.json',
  '配置文件',
  'memory/heartbeat-state.json',
  '2026-03-27T03:40:00Z',  // 备份时间（UTC）
  '15984',                  // 文件大小(bytes)
  'sha256:7342e24fd3292758...', // 文件哈希
  '成功',
  '文件已更新'              // 备注
];

// 由于无法通过API直接读取表格全部数据（需要复杂解析），
// 我们采用策略：输出完整的values数组，包含原有14行 + 新1行 = 15行
// 原有14行数据来自文档的第二次表格（doxcnAIWW83rPpl9xGrPIhCud5e），但那是session 634的
// 我们需要主表格（doxcnwhyXhKB6ORGWeAHoW6vlJf）的16行（含表头）

// 从list_blocks结果，主表格的现有数据（15行数据 + 1行表头）：
// 注意：这里需要手动维护现有数据。由于飞书表格不支持读取为简单数组，
// 正确做法是先通过 feishu_doc read + list_blocks 解析，或使用单独的同步脚本。

// 由于架构限制，我们输出一个merge指令：
console.log(JSON.stringify({
  action: 'append_row',
  docToken: DOC_TOKEN,
  tableBlockId: TABLE_BLOCK_ID,
  row: newRow,
  note: '第637次训练备份 - heartbeat-state.json 更新'
}));
