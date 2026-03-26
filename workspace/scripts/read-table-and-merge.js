/**
 * 辅助脚本：读取云文档表格所有内容，并合并新备份行
 * 输出：JSON { values: 2D string[][] }
 */

const fs = require('fs');

// 注意：在OpenClaw环境中，不能直接调用feishu_doc工具函数
// 我们在这里构建请求，然后由主agent执行
async function main() {
  const docToken = 'GaDhdogBhoQWRQx5lG4cpyQknUb';
  const tableBlockId = 'doxcnwhyXhKB6ORGWeAHoW6vlJf';

  // 这个脚本的职责是生成读取现有表格的指令
  // 实际读取由主agent通过feishu_doc get_block 完成

  // 由于无法直接调用feishu_doc，这里只输出元数据
  // 主agent需要读取这些block并收集文本

  console.log(JSON.stringify({
    action: 'read_table',
    docToken,
    tableBlockId,
    instruction: '请读取表格所有cell块，提取文本，构建二维数组values（包含表头），然后与新行合并。表格结构：8列，现有行数从list_blocks中获取。'
  }));
}

main().catch(console.error);
