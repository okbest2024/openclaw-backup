#!/usr/bin/env node
/**
 * GitHub 趋势监控脚本
 * 自动搜索 GitHub 高星项目，提取 AI、机器人、自动化相关项目
 * 
 * 使用方法: node github-monitor.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  keywords: ['AI agent', 'autonomous', 'robotics', 'automation', 'LLM', 'machine learning'],
  minStars: 100,
  outputDir: path.join(__dirname, '..', 'knowledge', 'tech', 'ai'),
  maxResults: 20
};

// 确保输出目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 生成搜索 URL（GitHub 搜索 API）
function generateSearchUrl(keyword) {
  const encoded = encodeURIComponent(keyword);
  return `https://api.github.com/search/repositories?q=${encoded}+stars:>${CONFIG.minStars}&sort=stars&order=desc&per_page=${CONFIG.maxResults}`;
}

// 生成 Markdown 报告模板
function generateReportTemplate() {
  const today = new Date().toISOString().split('T')[0];
  
  return `# GitHub AI/机器人趋势报告

**生成时间：** ${today}  
**监控关键词：** ${CONFIG.keywords.join(', ')}  
**最低星标：** ${CONFIG.minStars}

---

## 📊 本周热门项目

| 排名 | 项目名称 | 星标 | 描述 | 分类 |
|------|----------|------|------|------|
| 1 | 待填充 | - | 待填充 | 待分类 |
| 2 | 待填充 | - | 待填充 | 待分类 |
| 3 | 待填充 | - | 待填充 | 待分类 |

---

## 🔍 按关键词分类

### AI Agent
- 待填充

### Robotics
- 待填充

### Automation
- 待填充

### LLM
- 待填充

---

## 💡 值得关注的新趋势

1. 待观察
2. 待观察
3. 待观察

---

*下次更新：每日自动更新*
`;
}

// 主函数
function main() {
  console.log('🚀 GitHub 趋势监控脚本启动...');
  console.log('关键词:', CONFIG.keywords.join(', '));
  
  // 确保目录存在
  ensureDir(CONFIG.outputDir);
  
  // 生成报告文件路径
  const today = new Date().toISOString().split('T')[0];
  const reportPath = path.join(CONFIG.outputDir, `github-trends-${today}.md`);
  
  // 生成报告模板
  const report = generateReportTemplate();
  
  // 写入文件
  fs.writeFileSync(reportPath, report, 'utf-8');
  
  console.log('✅ 报告模板已生成:', reportPath);
  console.log('');
  console.log('📋 下一步:');
  console.log('1. 手动访问 GitHub 搜索页面');
  console.log('2. 提取热门项目信息');
  console.log('3. 填充到报告模板中');
  console.log('');
  console.log('🔗 GitHub 搜索链接:');
  CONFIG.keywords.forEach(keyword => {
    console.log(`  ${keyword}: ${generateSearchUrl(keyword)}`);
  });
}

// 运行
main();
