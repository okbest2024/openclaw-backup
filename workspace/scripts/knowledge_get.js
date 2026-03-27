#!/usr/bin/env node
/**
 * Knowledge Get - 查询知识资产
 * 用法: node knowledge_get.js <id>
 */

const fs = require('fs');
const path = require('path');

const INDEX_FILE = path.join(__dirname, '..', 'memory', 'knowledge-index.ndjson');
const MEMORY_DIR = path.join(__dirname, '..', 'memory');

function getKnowledge(id) {
  // 读取索引
  if (!fs.existsSync(INDEX_FILE)) {
    return { error: '索引文件不存在' };
  }
  
  const content = fs.readFileSync(INDEX_FILE, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.id === id) {
        return { entry, raw_content: null };
      }
    } catch (e) {
      continue;
    }
  }
  
  return { error: `未找到ID为 ${id} 的知识资产` };
}

function getRawContent(raw_path) {
  const fullPath = path.join(MEMORY_DIR, raw_path);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

function formatOutput(entry, raw = null) {
  let output = `\n╔═══════════════════════════════════════════════════════════════╗\n`;
  output += `║  📚 知识资产详情                                             ║\n`;
  output += `╠═══════════════════════════════════════════════════════════════╣\n`;
  output += `║  ID:         ${entry.id.padEnd(50)}║\n`;
  output += `║  日期:       ${entry.date.padEnd(50)}║\n`;
  output += `║  标题:       ${entry.title.substring(0, 45).padEnd(50)}║\n`;
  output += `╠═══════════════════════════════════════════════════════════════╣\n`;
  output += `║  领域:       ${entry.domain.join(', ').padEnd(50)}║\n`;
  output += `║  概念数:     ${entry.concepts.length.toString().padEnd(50)}║\n`;
  output += `║  核心概念:   ${entry.concepts.slice(0, 5).join(', ').padEnd(50)}║\n`;
  if (entry.concepts.length > 5) {
    output += `║              ${('...等' + entry.concepts.length + '个概念').padEnd(50)}║\n`;
  }
  output += `╠═══════════════════════════════════════════════════════════════╣\n`;
  output += `║  摘要:                                                    ║\n`;
  const summaryLines = entry.summary.match(/.{1,45}/g) || [entry.summary];
  for (const line of summaryLines) {
    output += `║    ${line.padEnd(50)}║\n`;
  }
  output += `╠═══════════════════════════════════════════════════════════════╣\n`;
  output += `║  原始文件: ${entry.raw_path.padEnd(50)}║\n`;
  output += `║  链接数:    inbound=${entry.links_from?.length||0}, outbound=${entry.links_to?.length||0} ║\n`;
  output += `╚═══════════════════════════════════════════════════════════════╝\n`;
  
  if (raw) {
    output += '\n📄 原始内容预览 (前500字符):\n';
    output += '─'.repeat(50) + '\n';
    output += raw.substring(0, 500);
    if (raw.length > 500) output += '\n... (内容截断，完整长度: ' + raw.length + ' 字符)';
    output += '\n' + '─'.repeat(50) + '\n';
  }
  
  return output;
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('用法: node knowledge_get.js <id>');
  console.error('示例: node knowledge_get.js dt-676');
  process.exit(1);
}

const id = args[0];
const result = getKnowledge(id);

if (result.error) {
  console.error('❌', result.error);
  process.exit(1);
}

// 获取原始内容
const raw = getRawContent(result.entry.raw_path);

// 输出
console.log(formatOutput(result.entry, raw));

// 如果提供了--json参数，输出纯JSON
if (args.includes('--json')) {
  console.log('\n🔍 JSON格式输出（便于程序处理）:');
  console.log(JSON.stringify({
    id: result.entry.id,
    title: result.entry.title,
    date: result.entry.date,
    domain: result.entry.domain,
    concepts: result.entry.concepts,
    summary: result.entry.summary,
    raw_available: !!raw,
    raw_length: raw ? raw.length : 0
  }, null, 2));
}
