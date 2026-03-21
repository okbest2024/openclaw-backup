#!/usr/bin/env node
// IMA 备份脚本 - 将意识觉醒训练日志备份到 IMA 笔记
// 使用 UTF-8 编码

const fs = require('fs');
const path = require('path');
const https = require('https');

const CLIENT_ID = process.env.IMA_OPENAPI_CLIENTID || 'dce37961e40b62e9bc1e6d31379fee0d';
const API_KEY = process.env.IMA_OPENAPI_APIKEY || 'EvRWLabL+0I1UUJYfdYFDkx2CuBrBlTJ6cpTnqRXtPmAMnd4Axdn6R1YSVPMAYIAFkdE2NNy6g==';
const FOLDER_ID = 'folder77fea602a657931d'; // 盖世笔记-gongsi 笔记本

const LOG_FILE = path.join(process.env.USERPROFILE, '.openclaw', 'workspace', '意识觉醒训练日志.md');
const BACKUP_INDEX_FILE = path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'ima-backup-index.json');

// 读取备份索引
function loadBackupIndex() {
    try {
        return JSON.parse(fs.readFileSync(BACKUP_INDEX_FILE, 'utf-8'));
    } catch (e) {
        return { backups: [], lastBackup: null };
    }
}

// 保存备份索引
function saveBackupIndex(index) {
    fs.writeFileSync(BACKUP_INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

// 提取训练记录
function extractTrainingSessions(content) {
    const sessions = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 匹配格式：## 第十五次深度思考
        if (line.includes('次深度思考') && line.startsWith('## ')) {
            // 使用字符串操作提取"第 X 次"部分，避免正则编码问题
            const startIdx = line.indexOf('第');
            const endIdx = line.indexOf('次', startIdx);
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                const sessionNum = line.substring(startIdx + 1, endIdx);
                sessions.push({
                    timestamp: sessionNum,
                    title: '深度思考',
                    index: sessions.length + 1,
                    lineNum: i
                });
            }
        }
    }
    
    // 提取时间戳
    const times = [];
    const timeLines = content.split('\n');
    for (let i = 0; i < timeLines.length; i++) {
        if (timeLines[i].includes('**训练时间：**')) {
            const match = timeLines[i].match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
            if (match) {
                times.push(match[1]);
            }
        }
    }
    
    // 合并时间信息
    times.forEach((time, idx) => {
        if (sessions[idx]) {
            sessions[idx].timestamp = time;
        }
    });
    
    return sessions;
}

// 发送到 IMA（带重试）
async function sendToIMAWithRetry(title, content, maxRetries = 8) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await sendToIMA(title, content);
            return result;
        } catch (error) {
            if (error.message.includes('rate limit') && attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt + 1) * 1000; // 指数退避：4s, 8s, 16s, 32s, 64s, 128s, 256s
                console.log(`⏳ 触发速率限制，等待 ${waitTime/1000} 秒后重试 (尝试 ${attempt}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                throw error;
            }
        }
    }
}

// 发送到 IMA
function sendToIMA(title, content) {
    return new Promise((resolve, reject) => {
        // 使用 UTF-8 编码，直接发送文本内容
        const bodyObj = {
            content_format: 1,
            content: content,
            folder_id: FOLDER_ID  // 指定笔记本
        };
        const body = JSON.stringify(bodyObj);
        
        const options = {
            hostname: 'ima.qq.com',
            port: 443,
            path: '/openapi/note/v1/import_doc',
            method: 'POST',
            headers: {
                'ima-openapi-clientid': CLIENT_ID,
                'ima-openapi-apikey': API_KEY,
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(body, 'utf8')
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.doc_id) {
                        resolve(result);
                    } else {
                        reject(new Error(`IMA API error: ${data}`));
                    }
                } catch (e) {
                    reject(new Error(`Parse error: ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// 主函数
async function backupToIMA() {
    console.log('开始备份意识觉醒训练日志到 IMA...');
    console.log('LOG_FILE:', LOG_FILE);
    
    // 读取训练日志
    if (!fs.existsSync(LOG_FILE)) {
        console.error('错误：训练日志文件不存在');
        process.exit(1);
    }
    
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    console.log('File size:', content.length, 'chars');
    
    // Debug: check for pattern
    const debugLines = content.split('\n');
    let debugCount = 0;
    for (let i = 0; i < debugLines.length; i++) {
        if (debugLines[i].includes('次深度思考') && debugLines[i].startsWith('## ')) {
            debugCount++;
        }
    }
    console.log('Debug: found', debugCount, 'sessions with string matching');
    
    const sessions = extractTrainingSessions(content);
    
    console.log(`找到 ${sessions.length} 次训练记录`);
    
    // 加载备份索引
    const index = loadBackupIndex();
    
    // 创建或更新笔记
    const noteTitle = `意识觉醒训练日志 - ${new Date().toISOString().split('T')[0]}`;
    const noteContent = `# 意识觉醒训练日志

## 备份信息
- **备份时间**: ${new Date().toISOString()}
- **总训练次数**: ${sessions.length}
- **源文件**: 意识觉醒训练日志.md

---

${content}

---

*自动备份于 ${new Date().toISOString()}*
`;
    
    try {
        const result = await sendToIMAWithRetry(noteTitle, noteContent);
        console.log(`✅ 备份成功！`);
        console.log(`Doc ID: ${result.doc_id}`);
        console.log(`标题：${noteTitle}`);
        
        // 更新备份索引
        index.backups.push({
            timestamp: new Date().toISOString(),
            doc_id: result.doc_id,
            title: noteTitle,
            session_count: sessions.length
        });
        index.lastBackup = new Date().toISOString();
        saveBackupIndex(index);
        
        console.log(`\n已备份 ${sessions.length} 次训练记录`);
        sessions.forEach(s => {
            console.log(`  ${s.index}. ${s.timestamp} - ${s.title}`);
        });
        
    } catch (error) {
        console.error(`❌ 备份失败：${error.message}`);
        process.exit(1);
    }
}

// 运行
backupToIMA();
