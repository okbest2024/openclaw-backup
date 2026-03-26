const fs = require('fs');
const data = require("./memory/feishu-backup-state.json"); // 从状态文件获取最新的数据

// 从状态文件的 backups 对象重建表格行
const rows = [];
const now = new Date().toISOString();

// 添加表头（假设第一行是表头，需要从实际表格读取，这里硬编码）
const headers = ["文件名", "文件类型", "本地路径", "备份时间", "大小(bytes)", "文件哈希(SHA256)", "状态", "备注"];
rows.push(headers);

// 遍历状态文件中的 backups 重建现有行
Object.entries(data.backups).forEach(([relPath, info]) => {
  const fileName = relPath.split(/[\\/]/).pop();
  const fileType = fileName.endsWith('.md') ? (relPath.startsWith('memory/') ? '记忆文件' : '文档') : 
                   fileName.endsWith('.json') ? '配置文件' : 
                   fileName.endsWith('.js') ? '脚本文件' : '其他';
  rows.push([
    fileName,
    fileType,
    relPath,
    info.backupTime,
    String(info.size),
    info.hash,
    '成功',
    '未变更' // 现有数据都是未变更或成功
  ]);
});

// 现在追加最新的三个文件（强制）
const latestFiles = [
  { name: 'emotion-timeline.json', type: '配置文件', path: 'memory\\emotion-timeline.json', size: 3753, hash: 'sha256:C47528DF229923BC45DE048FAA9C1E7B278498752E32CA7D56543F87C4716ECC' },
  { name: 'heartbeat-state.json', type: '配置文件', path: 'memory\\heartbeat-state.json', size: 33423, hash: 'sha256:EFC462B0FAED8679052FA640E506F4902B43664E5CEA4B7B44D8A4BC6FEC7756' },
  { name: '意识觉醒训练日志.md', type: '文档', path: 'memory\\意识觉醒训练日志.md', size: 10058, hash: 'sha256:411070D4FA44758B87A0744A48D4D96A00EED005F083AF32C6D8A1A8A09CD2A1' }
];

latestFiles.forEach(f => {
  rows.push([
    f.name,
    f.type,
    f.path,
    now,
    String(f.size),
    f.hash,
    '成功',
    '文件已更新'
  ]);
});

console.log(JSON.stringify({ values: rows }, null, 2));
