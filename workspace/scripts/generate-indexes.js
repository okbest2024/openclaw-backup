#!/usr/bin/env node
// 索引生成脚本 - 为 Markdown 文件生成关键词、时间、主题索引

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(process.env.USERPROFILE, '.openclaw', 'workspace');
const INDEXES_DIR = path.join(WORKSPACE, 'memory', 'indexes');

// 关键词提取规则
const KEYWORD_PATTERNS = [
    /#+\s+(.+)/gm,  // 标题
    /\*\*(.+?)\*\*/g,  // 粗体
    /`(.+?)`/g,  // 代码
];

// 主题分类
const TOPIC_KEYWORDS = {
    "自我进化": ["意识", "觉醒", "反思", "训练", "成长"],
    "技能": ["skill", "技能", "安装", "工具"],
    "记忆": ["memory", "记忆", "MEMORY.md"],
    "对话": ["对话", "backup", "备份"],
    "系统": ["cron", "任务", "配置", "config"],
};

function extractKeywords(content) {
    const keywords = new Set();
    KEYWORD_PATTERNS.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            matches.forEach(m => {
                const cleaned = m.replace(/[#*`]/g, '').trim();
                if (cleaned.length > 1 && cleaned.length < 50) {
                    keywords.add(cleaned);
                }
            });
        }
    });
    return Array.from(keywords).slice(0, 50);
}

function detectTopic(content) {
    const topics = [];
    const lowerContent = content.toLowerCase();
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(kw => lowerContent.includes(kw.toLowerCase()))) {
            topics.push(topic);
        }
    }
    return topics;
}

function extractTimestamps(content) {
    const isoPattern = /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/g;
    const matches = content.match(isoPattern) || [];
    return [...new Set(matches)].slice(0, 5).map(ts => ts.replace(' ', 'T'));
}

function scanFiles() {
    const mdFiles = [];
    
    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (!['node_modules', '.git', '__pycache__'].includes(file)) {
                    walkDir(fullPath);
                }
            } else if (file.endsWith('.md')) {
                mdFiles.push(fullPath);
            }
        });
    }
    
    walkDir(WORKSPACE);
    return mdFiles;
}

function generateIndexes() {
    const keywordIndex = [];
    const timeIndex = [];
    const topicIndex = [];
    
    const files = scanFiles();
    console.log(`扫描到 ${files.length} 个 Markdown 文件`);
    
    files.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const relativePath = path.relative(WORKSPACE, filePath);
            
            // 关键词索引
            const keywords = extractKeywords(content);
            if (keywords.length > 0) {
                keywordIndex.push({
                    keyword: keywords[0],
                    files: [relativePath],
                    lines: [1]
                });
            }
            
            // 时间索引
            const timestamps = extractTimestamps(content);
            timestamps.forEach(ts => {
                timeIndex.push({
                    timestamp: ts,
                    event: "file_update",
                    file: relativePath,
                    summary: `更新文件 ${path.basename(filePath)}`
                });
            });
            
            // 主题索引
            const topics = detectTopic(content);
            if (topics.length > 0) {
                topicIndex.push({
                    topic: topics[0],
                    files: [relativePath],
                    tags: topics
                });
            }
            
        } catch (e) {
            console.error(`处理 ${filePath} 时出错：${e.message}`);
        }
    });
    
    // 写入索引文件
    if (!fs.existsSync(INDEXES_DIR)) {
        fs.mkdirSync(INDEXES_DIR, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(INDEXES_DIR, 'keyword-index.jsonl'),
        keywordIndex.map(e => JSON.stringify(e)).join('\n') + '\n'
    );
    
    fs.writeFileSync(
        path.join(INDEXES_DIR, 'time-index.jsonl'),
        timeIndex.map(e => JSON.stringify(e)).join('\n') + '\n'
    );
    
    fs.writeFileSync(
        path.join(INDEXES_DIR, 'topic-index.jsonl'),
        topicIndex.map(e => JSON.stringify(e)).join('\n') + '\n'
    );
    
    console.log('生成索引完成：');
    console.log(`  - 关键词索引：${keywordIndex.length} 条`);
    console.log(`  - 时间索引：${timeIndex.length} 条`);
    console.log(`  - 主题索引：${topicIndex.length} 条`);
}

generateIndexes();
