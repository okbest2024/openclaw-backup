#!/usr/bin/env node
// IMA 备份脚本 - 将意识觉醒训练日志备份到 IMA 笔记
// 使用 UTF-8 编码，分批备份策略

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
        return { backups: [], lastBackup: null, lastSessionNumber: 0 };
    }
}

// 保存备份索引
function saveBackupIndex(index) {
    fs.writeFileSync(BACKUP_INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

// 提取最新的训练记录（分批策略）
function extractLatestSessions(content, maxSessions = 5) {
    const sessions = [];
    const lines = content.split('\n');
    
    // 找到所有训练记录的标题行
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 匹配格式：# 第二百四十五 次深度思考 或 # 第 X 次深度思考
        if (line.includes('次深度思考') && line.startsWith('# ')) {
            // 使用字符串操作提取"第 X 次"部分
            const startIdx = line.indexOf('第');
            const endIdx = line.indexOf('次', startIdx);
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                const sessionNumStr = line.substring(startIdx + 1, endIdx).trim();
                // 处理中文数字或阿拉伯数字
                let sessionNum = parseInt(sessionNumStr);
                if (isNaN(sessionNum)) {
                    // 可能是中文数字，尝试转换
                    const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千'];
                    // 简化处理：提取数字部分
                    sessionNum = 0;
                }
                
                // 找到这个训练的结束位置（下一个训练标题或文件结束）
                let endLine = lines.length;
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].startsWith('# ') && lines[j].includes('次深度思考')) {
                        endLine = j;
                        break;
                    }
                }
                
                sessions.push({
                    sessionNumber: sessionNumStr,
                    title: line.replace('# ', '').trim(),
                    startLine: i,
                    endLine: endLine,
                    content: lines.slice(i, endLine).join('\n')
                });
            }
        }
    }
    
    // 返回最新的 maxSessions 个记录
    return sessions.slice(0, maxSessions);
}

// 发送到 IMA（带重试）
async function sendToIMAWithRetry(title, content, maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await sendToIMA(title, content);
            return result;
        } catch (error) {
            if ((error.message.includes('rate limit') || error.message.includes('fail')) && attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 2000; // 指数退避：4s, 8s, 16s, 32s, 64s
                console.log(`⏳ 遇到错误，等待 ${waitTime/1000} 秒后重试 (尝试 ${attempt}/${maxRetries})...`);
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
        // 限制内容大小（IMA API 有大小限制）
        const maxContentSize = 100000; // 100KB 限制
        let finalContent = content;
        if (content.length > maxContentSize) {
            finalContent = content.substring(0, maxContentSize) + '\n\n... (内容已截断)';
            console.log(`⚠️ 内容超过 ${maxContentSize} 字符，已截断`);
        }
        
        const bodyObj = {
            content_format: 1,
            content: finalContent,
            folder_id: FOLDER_ID
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
    
    // 提取最新的训练记录
    const latestSessions = extractLatestSessions(content, 5);
    
    console.log(`找到 ${latestSessions.length} 次最新训练记录`);
    
    if (latestSessions.length === 0) {
        console.log('⚠️ 没有找到训练记录');
        process.exit(0);
    }
    
    // 加载备份索引
    const index = loadBackupIndex();
    
    // 获取最新的训练编号
    const latestSessionNum = latestSessions[0].sessionNumber;
    const lastBackedUpSession = index.lastSessionNumber || 0;
    
    console.log(`最新训练编号：${latestSessionNum}`);
    console.log(`上次备份编号：${lastBackedUpSession}`);
    
    // 分批备份每个训练记录
    const backupResults = [];
    for (let i = 0; i < latestSessions.length; i++) {
        const session = latestSessions[i];
        const noteTitle = `意识觉醒训练日志 - ${session.title}`;
        
        // 添加备份信息头部
        const noteContent = `# ${session.title}

## 备份信息
- **备份时间**: ${new Date().toISOString()}
- **源文件**: 意识觉醒训练日志.md

---

${session.content}

---

*自动备份于 ${new Date().toISOString()}*
`;
        
        console.log(`\n📝 备份第 ${i + 1}/${latestSessions.length} 条记录: ${session.title}`);
        console.log(`内容长度: ${noteContent.length} 字符`);
        
        try {
            const result = await sendToIMAWithRetry(noteTitle, noteContent);
            console.log(`✅ 备份成功！Doc ID: ${result.doc_id}`);
            backupResults.push({
                sessionNumber: session.sessionNumber,
                doc_id: result.doc_id,
                title: noteTitle
            });
            
            // 更新备份索引
            index.backups.push({
                timestamp: new Date().toISOString(),
                doc_id: result.doc_id,
                title: noteTitle,
                session_number: session.sessionNumber
            });
            
            // 更新最后备份的训练编号
            const currentNum = parseInt(session.sessionNumber) || 0;
            if (currentNum > (index.lastSessionNumber || 0)) {
                index.lastSessionNumber = currentNum;
            }
            
        } catch (error) {
            console.error(`❌ 备份失败：${error.message}`);
            // 继续备份其他记录
        }
        
        // 在记录之间添加延迟，避免触发速率限制
        if (i < latestSessions.length - 1) {
            console.log('⏳ 等待 3 秒后备份下一条记录...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    // 保存备份索引
    index.lastBackup = new Date().toISOString();
    saveBackupIndex(index);
    
    console.log(`\n✅ 备份完成！成功备份 ${backupResults.length}/${latestSessions.length} 条记录`);
    backupResults.forEach(r => {
        console.log(`  - ${r.title}: ${r.doc_id}`);
    });
}

// 运行
backupToIMA();