// 实时解析表格数据验证（在 OpenClaw 会话中执行）
// 2026-03-25 03:45 - 04:00

const blocksResp = await feishu_doc({
  action: "list_blocks",
  doc_token: "GaDhdogBhoQWRQx5lG4cpyQknUb"
});

const allBlocks = blocksResp.blocks || [];
const blockMap = new Map(allBlocks.map(b => [b.block_id, b]));

// 找到表格 block
const tableBlock = allBlocks.find(b => b.block_id === "doxcnwhyXhKB6ORGWeAHoW6vlJf" && b.block_type === 31);
const cellBlockIds = tableBlock.children || [];
const columnSize = tableBlock.table.property.column_size; // 8

console.log(`📊 表格结构分析:`);
console.log(`   - 总 cell block 数: ${cellBlockIds.length}`);
console.log(`   - 列数: ${columnSize}`);
console.log(`   - 行数: ${Math.ceil(cellBlockIds.length / columnSize)}`);
console.log(`   - table.row_size (元数据): ${tableBlock.table.row_size}`);
console.log(`   - 注意: row_size 可能不更新，以 children 长度为准`);
console.log('');

// 解析表格数据
function extractCellContent(cellBlock) {
  if (!cellBlock || cellBlock.block_type !== 32 || !cellBlock.children) return '';
  let content = '';
  for (const textBlockId of cellBlock.children) {
    const textBlock = blockMap.get(textBlockId);
    if (textBlock && textBlock.block_type === 2 && textBlock.text && textBlock.text.elements) {
      const cellText = textBlock.text.elements
        .map(e => e.text_run?.content || '')
        .join('');
      if (cellText) content += (content ? '\n' : '') + cellText;
    }
  }
  return content;
}

const rows = [];
for (let i = 0; i < cellBlockIds.length; i += columnSize) {
  const rowCells = cellBlockIds.slice(i, i + columnSize);
  const row = rowCells.map(cellId => extractCellContent(blockMap.get(cellId)));
  rows.push(row);
}

console.log(`✅ 成功解析 ${rows.length} 行数据:\n`);

// 打印表头（第1行）
console.log('表头 (Row 1):');
console.log(rows[0].map((c, i) => `Col${i}: "${c}"`).join(' | '));
console.log('');

// 打印所有数据行
for (let r = 1; r < rows.length; r++) {
  console.log(`数据行 ${r} (Row ${r+1}):`);
  console.log(rows[r].map((c, i) => `[${i}] ${c || '(空)'}`).join(' | '));
  console.log('');
}

// 验证：构建结构化数据，每行代表一条备份记录
console.log('📋 备份记录解析 (按列映射):');
const colNames = ['文件名', '文件类型', '本地路径', '备份时间', '文件大小', '文件哈希', '状态', '备注'];

// 检查是否表头正确
const header = rows[0];
if (header.some(h => h.includes('文件名') || h.includes('文件类型') || h.includes('备份时间'))) {
  console.log('✅ 表头包含预期字段（文件名、文件类型、备份时间等）');
  // 数据行从索引1开始
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const record = {};
    colNames.forEach((name, idx) => {
      record[name] = row[idx] || '';
    });
    console.log(`  记录 ${r}: ${record.文件名} | ${record.文件类型} | ${record.本地路径} | ${record.备份时间} | ${record.文件大小} bytes | ${record.文件哈希} | ${record.状态}`);
  }
} else {
  console.log('❓ 表头不包含预期字段，可能是表格写入时未包含表头');
  console.log('   实际表头内容:', header);
  // 所有行都可能是数据行
  rows.forEach((row, r) => {
    const record = {};
    colNames.forEach((name, idx) => {
      record[name] = row[idx] || '';
    });
    console.log(`  行 ${r}: ${record.文件名} | ${record.文件类型} | ${record.本地路径} | ${record.备份时间} | ${record.文件大小} bytes | ${record.文件哈希} | ${record.状态}`);
  });
}

console.log('\n✅ 表格读取功能验证完成！');
console.log('结论：feishu_doc list_blocks + 解析 table children 方案完全可行。');
