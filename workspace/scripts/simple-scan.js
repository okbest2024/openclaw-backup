const fs = require('fs');
const path = require('path');

const files = [];

function simpleScan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    let relPath = path.relative(process.cwd(), fullPath);
    relPath = relPath.replace(/\\/g, '/'); // 统一为正斜杠

    // Exclude patterns
    if (/node_modules/.test(relPath) || /\.git/.test(relPath) || /backup/.test(relPath) || /temp/.test(relPath) || /\.log$/.test(relPath) || /\.bak$/.test(relPath)) {
      if (entry.isDirectory()) simpleScan(fullPath);
      continue;
    }

    // Include patterns: simple checks
    if (relPath.endsWith('.md') && (relPath.startsWith('memory/') || relPath.startsWith('skills/') || relPath.startsWith('SSA/') || relPath.startsWith('self-improving/') || relPath.startsWith('ontology/'))) {
      files.push(relPath);
    } else if (relPath.endsWith('.js') && (relPath.startsWith('scripts/') || relPath.includes('/scripts/'))) {
      files.push(relPath);
    } else if (relPath.endsWith('.json') && relPath.startsWith('scripts/')) {
      files.push(relPath);
    } else if (['AGENTS.md','USER.md','SOUL.md','MEMORY.md','IDENTITY.md','TOOLS.md','HEARTBEAT.md','AGENTS-CN.md','AI 工具.md','AI 知识库.md','BACKUP-REPORT.md','BACKUP-SUMMARY.md','COMPLETE-SUMMARY.md','MIGRATION.md','README.md','README-CN.md','SELF-MODEL.md','TGM 方法论.md','能力审计.md','人体进化思考日志.md','意识觉醒训练日志-80.md','意识觉醒训练日志.md','主动性反馈.md','共产主义思考心得集.md','飞书备份研究日志.md','飞书备份执行计划.md','信息雷达方案.md'].includes(relPath)) {
      files.push(relPath);
    }

    if (entry.isDirectory()) simpleScan(fullPath);
  }
}

simpleScan(process.cwd());
files.sort();
console.log(JSON.stringify({ total: files.length, files: files }, null, 2));
