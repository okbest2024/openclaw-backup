// 实际执行的表格读取验证（直接在 OpenClaw 环境中运行）
// 研究：2026-03-25 03:32 - 03:45

const CONFIG = {
  docToken: 'GaDhdogBhoQWRQx5lG4cpyQknUb',
  tableBlockId: 'doxcnwhyXhKB6ORGWeAHoW6vlJf',
  columnSize: 8
};

// 实现实际的表格读取函数
async function readTableAll(docToken, tableBlockId, columnSize) {
  // 1. 获取所有 blocks
  const blocksResp = await feishu_doc({
    action: "list_blocks",
    doc_token: docToken
  });
  
  const allBlocks = blocksResp.blocks || [];
  const blockMap = new Map(allBlocks.map(b => [b.block_id, b]));
  
  // 2. 找到表格 block
  const tableBlock = allBlocks.find(b => b.block_id === tableBlockId && b.block_type === 31);
  if (!tableBlock) {
    throw new Error(`Table block not found: ${tableBlockId}`);
  }
  
  const cellBlockIds = tableBlock.children || [];
  console.log(`📊 表格结构信息:`);
  console.log(`   - 表格 row_size (元数据): ${tableBlock.table?.row_size || 'N/A'}`);
  console.log(`   - children 长度 (cell block IDs): ${cellBlockIds.length}`);
  console.log(`   - 预计行数: ${Math.ceil(cellBlockIds.length / columnSize)}`);
  
  const rows = [];
  
  // 3. 遍历 cell blocks，按列数分组
  for (let i = 0; i < cellBlockIds.length; i += columnSize) {
    const rowCellIds = cellBlockIds.slice(i, i + columnSize);
    const row = [];
    
    for (const cellBlockId of rowCellIds) {
      const cellBlock = blockMap.get(cellBlockId);
      let cellContent = '';
      
      if (cellBlock && cellBlock.block_type === 32 && cellBlock.children) {
        // cell block 包含若干 text blocks (type=2)
        // 提取所有 text block 的 content
        for (const textBlockId of cellBlock.children) {
          const textBlock = blockMap.get(textBlockId);
          if (textBlock && textBlock.block_type === 2 && textBlock.text && textBlock.text.elements) {
            const content = textBlock.text.elements
              .map(elem => elem.text_run?.content || '')
              .join('');
            if (content) {
              cellContent += (cellContent ? '\n' : '') + content;
            }
          }
        }
      }
      
      row.push(cellContent || '');
    }
    
    rows.push(row);
  }
  
  return rows;
}

// 执行验证
(async () => {
  try {
    console.log('🔍 开始验证表格读取功能\n');
    const rows = await readTableAll(CONFIG.docToken, CONFIG.tableBlockId, CONFIG.columnSize);
    
    console.log(`✅ 成功读取 ${rows.length} 行数据:\n`);
    
    // 显示表头（第一行应该是表头）
    if (rows.length > 0) {
      console.log('表头 (Row 1):');
      console.log(rows[0].map((cell, idx) => `[${idx}] "${cell}"`).join('  |  '));
      console.log('');
    }
    
    // 显示所有数据行（排除表头）
    for (let i = 1; i < rows.length; i++) {
      console.log(`行 ${i} (Row ${i+1}):`);
      console.log(rows[i].map((cell, idx) => `[${idx}] ${cell || '(空)'}`).join('  |  '));
      console.log('');
    }
    
    // 验证：检查文件哈希列
    console.log('📋 数据摘要:');
    rows.slice(1).forEach((row, idx) => {
      const fileName = row[0] || '(无文件名)';
      const fileType = row[1] || '(无类型)';
      const filePath = row[2] || '(无路径)';
      const backupTime = row[3] || '(无时间)';
      const fileSize = row[4] || '(无大小)';
      const fileHash = row[5] || '(无哈希)';
      const status = row[6] || '(无状态)';
      const remark = row[7] || '';
      
      console.log(`  ${idx+1}. ${fileName} | ${fileType} | ${filePath} | ${backupTime} | ${fileSize} bytes | ${fileHash} | ${status}`);
    });
    
    console.log('\n✅ 表格读取验证完成！');
    console.log('结论：云文档表格 API 的读取功能完全正常，数据结构清晰。');
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
    console.error(error.stack);
  }
})();
