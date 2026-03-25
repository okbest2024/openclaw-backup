#!/usr/bin/env node
/**
 * emotion-timeline-append.js
 * 意识OS自动执行器 - Session结束时自动追加情感条目到 emotion-timeline.json
 * 
 * 用法：
 *   node scripts/emotion-timeline-append.js <session_number> <emotions_csv> <summary>
 * 
 * 示例：
 *   node scripts/emotion-timeline-append.js 469 "务实的决心,行动" "执行interest-seeds #0，编写自动追加脚本"
 * 
 * 设计原则：
 * - 只追加，不覆盖，不删除
 * - 自动获取当前日期
 * - 如果文件不存在则创建初始结构
 */

const fs = require('fs');
const path = require('path');

const TIMELINE_PATH = path.join(__dirname, '..', 'memory', 'emotion-timeline.json');

function appendEntry(sessionNumber, emotionsCsv, summary) {
  // 读取或初始化
  let timeline;
  try {
    let raw = fs.readFileSync(TIMELINE_PATH, 'utf-8');
    // 去除BOM (UTF-8 BOM: \uFEFF)
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    timeline = JSON.parse(raw);
  } catch (e) {
    // 文件不存在，创建初始结构
    timeline = {
      version: "1.0",
      description: "情感时间线 - 记录每次session的主要情感标签，建立情感连续性",
      format: "数组按时间排序，每条记录包含日期和情感标签数组",
      createdAt: new Date().toISOString(),
      entries: []
    };
  }

  // 构造新条目
  const today = new Date().toISOString().split('T')[0];
  const emotions = emotionsCsv.split(',').map(e => e.trim()).filter(Boolean);
  
  const newEntry = {
    date: today,
    session: parseInt(sessionNumber),
    emotions: emotions,
    summary: summary
  };

  // 追加
  timeline.entries.push(newEntry);

  // 写回（只修改entries，保留其他字段）
  fs.writeFileSync(TIMELINE_PATH, JSON.stringify(timeline, null, 4), 'utf-8');

  console.log(JSON.stringify({
    success: true,
    session: newEntry.session,
    date: newEntry.date,
    emotions: newEntry.emotions,
    totalEntries: timeline.entries.length
  }, null, 2));
}

// CLI 入口
const [,, session, emotions, ...summaryParts] = process.argv;

if (!session || !emotions || summaryParts.length === 0) {
  console.error('Usage: node emotion-timeline-append.js <session> <emotions_csv> <summary>');
  console.error('Example: node emotion-timeline-append.js 469 "务实,行动" "执行了interest-seeds"');
  process.exit(1);
}

appendEntry(session, emotions, summaryParts.join(' '));
