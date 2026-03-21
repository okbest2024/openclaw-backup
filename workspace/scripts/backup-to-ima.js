#!/usr/bin/env node
// IMA 备份脚本 - 将意识觉醒训练日志备份到 IMA 笔记

const fs = require('fs');
const path = require('path');
const https = require('https');

const CLIENT_ID = process.env.IMA_OPENAPI_CLIENTID || 'dce37961e40b62e9bc1e6d31379fee0d';
const API_KEY = process.env.IMA_OPENAPI_APIKEY || 'EvRWLabL+0I1UUJYfdYFDkx2CuBrBlTJ6cpTnqRXtPmAMnd4Axdn6R1YSVPMAYIAFkdE2NNy6g==';

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
    const sessionRegex = /## (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) - (第 [一二三四五六七八九十百\d]+次深度思考|第 \d+ 课|第一次深度思考)/g;
    let match;
    
    while ((match = sessionRegex.exec(content)) !== null) {
        sessions.push({
            timestamp: match[1],
            title: match[2],
            index: sessions.length + 1
        });
    }
    
    return sessions;
}

// 发送到 IMA
function sendToIMA(title, content) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            content_format: 1,
            content: content
        });
        
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
    
    // 读取训练日志
    if (!fs.existsSync(LOG_FILE)) {
        console.error('错误：训练日志文件不存在');
        process.exit(1);
    }
    
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
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
        const result = await sendToIMA(noteTitle, noteContent);
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
