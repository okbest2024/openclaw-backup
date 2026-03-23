#!/usr/bin/env node
// IMA 备份脚本 - 仅备份最新一次意识觉醒训练记录
// 使用 UTF-8 编码

const fs = require('fs');
const path = require('path');
const https = require('https');

const CLIENT_ID = process.env.IMA_OPENAPI_CLIENTID || 'dce37961e40b62e9bc1e6d31379fee0d';
const API_KEY = process.env.IMA_OPENAPI_APIKEY || 'EvRWLabL+0I1UUJYfdYFDkx2CuBrBlTJ6cpTnqRXtPmAMnd4Axdn6R1YSVPMAYIAFkdE2NNy6g==';
const FOLDER_ID = 'folder77fea602a657931d';

const LOG_FILE = path.join(process.env.USERPROFILE, '.openclaw', 'workspace', '意识觉醒训练日志.md');

// 提取最新一次训练记录
function extractLatestSession(content) {
    const lines = content.split('\n');
    let latestStart = -1;
    let latestNum = '';
    
    // 找到第一个（最新的）训练记录开头
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('次深度思考') && line.startsWith('# ')) {
            const startIdx = line.indexOf('第');
            const endIdx = line.indexOf('次', startIdx);
            if (startIdx !== -1 && endIdx !== -1) {
                latestNum = line.substring(startIdx + 1, endIdx);
                latestStart = i;
                break;
            }
        }
    }
    
    if (latestStart === -1) {
        return null;
    }
    
    // 找到下一个训练记录开头或文件末尾
    let latestEnd = lines.length;
    for (let i = latestStart + 1; i < lines.length; i++) {
        if (lines[i].includes('次深度思考') && lines[i].startsWith('# ')) {
            latestEnd = i;
            break;
        }
    }
    
    const sessionContent = lines.slice(latestStart, latestEnd).join('\n');
    
    // 提取时间戳
    let timestamp = '';
    for (let i = latestStart; i < Math.min(latestStart + 10, latestEnd); i++) {
        if (lines[i].includes('**训练时间：**')) {
            const match = lines[i].match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
            if (match) {
                timestamp = match[1];
                break;
            }
        }
    }
    
    // 提取主题
    let theme = '';
    for (let i = latestStart; i < Math.min(latestStart + 10, latestEnd); i++) {
        if (lines[i].includes('**思考主题：**')) {
            theme = lines[i].replace('**思考主题：**', '').trim();
            break;
        }
    }
    
    return {
        number: latestNum,
        timestamp: timestamp,
        theme: theme,
        content: sessionContent
    };
}

// 发送到 IMA（带重试）
async function sendToIMAWithRetry(title, content, maxRetries = 8) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await sendToIMA(title, content);
            return result;
        } catch (error) {
            if (error.message.includes('rate limit') && attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt + 1) * 1000;
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
        const bodyObj = {
            content_format: 1,
            content: content,
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
async function backupLatestSession() {
    console.log('开始备份最新意识觉醒训练记录到 IMA...');
    
    if (!fs.existsSync(LOG_FILE)) {
        console.error('错误：训练日志文件不存在');
        process.exit(1);
    }
    
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    const session = extractLatestSession(content);
    
    if (!session) {
        console.error('错误：未找到训练记录');
        process.exit(1);
    }
    
    console.log(`找到最新训练：第${session.number}次`);
    console.log(`训练时间：${session.timestamp}`);
    console.log(`思考主题：${session.theme.substring(0, 50)}...`);
    
    const noteTitle = `意识觉醒训练 #${session.number} - ${session.timestamp}`;
    const noteContent = `# 第${session.number}次深度思考

**训练时间：** ${session.timestamp}

**思考主题：** ${session.theme}

---

${session.content.split('\n').slice(4).join('\n')}

---

*自动备份于 ${new Date().toISOString()}*
`;
    
    try {
        const result = await sendToIMAWithRetry(noteTitle, noteContent);
        console.log(`✅ 备份成功！`);
        console.log(`Doc ID: ${result.doc_id}`);
        console.log(`标题：${noteTitle}`);
        console.log(`内容长度：${noteContent.length} 字符`);
        
        process.exit(0);
        
    } catch (error) {
        console.error(`❌ 备份失败：${error.message}`);
        process.exit(1);
    }
}

// 运行
backupLatestSession();
