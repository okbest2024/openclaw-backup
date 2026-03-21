#!/usr/bin/env node
// 飞书文档备份脚本 - 将意识觉醒训练日志备份到飞书文档

const fs = require('fs');
const path = require('path');
const https = require('https');

// 配置（从环境变量读取，如果没有则使用默认值）
const APP_ID = process.env.FEISHU_APP_ID || 'cli_a93fd942c2f85cd6';
const APP_SECRET = process.env.FEISHU_APP_SECRET || ''; // 需要从 openclaw.json 读取
const LOG_FILE = path.join(process.env.USERPROFILE, '.openclaw', 'workspace', '意识觉醒训练日志.md');
const BACKUP_INDEX_FILE = path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'feishu-backup-index.json');

// 获取租户访问令牌
function getTenantAccessToken() {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET });
        const options = {
            hostname: 'open.feishu.cn',
            port: 443,
            path: '/open-apis/auth/v3/tenant_access_token/internal',
            method: 'POST',
            headers: {
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
                    if (result.code === 0 && result.tenant_access_token) {
                        resolve(result.tenant_access_token);
                    } else {
                        reject(new Error(`Get token failed: ${data}`));
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

// 创建飞书文档
function createFeishuDoc(token, title, content) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            title: title,
            content: content
        });
        
        const options = {
            hostname: 'open.feishu.cn',
            port: 443,
            path: '/open-apis/docx/v1/documents',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
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
                    if (result.data && result.data.document_id) {
                        resolve(result.data);
                    } else {
                        reject(new Error(`Create doc failed: ${data}`));
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
async function backupToFeishu() {
    console.log('开始备份意识觉醒训练日志到飞书文档...');
    
    // 检查训练日志文件
    if (!fs.existsSync(LOG_FILE)) {
        console.error('错误：训练日志文件不存在');
        process.exit(1);
    }
    
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    const title = `意识觉醒训练日志 - ${new Date().toISOString().split('T')[0]}`;
    
    try {
        // 获取访问令牌
        console.log('获取飞书访问令牌...');
        const token = await getTenantAccessToken();
        console.log('✅ 令牌获取成功');
        
        // 创建文档
        console.log('创建飞书文档...');
        const docInfo = await createFeishuDoc(token, title, content);
        console.log('✅ 文档创建成功！');
        console.log(`文档 ID: ${docInfo.document_id}`);
        console.log(`标题：${docInfo.title}`);
        console.log(`URL: https://my.feishu.cn/docx/${docInfo.document_id}`);
        
        // 保存备份索引
        const index = {
            backups: [{
                timestamp: new Date().toISOString(),
                document_id: docInfo.document_id,
                title: docInfo.title,
                url: `https://my.feishu.cn/docx/${docInfo.document_id}`
            }],
            lastBackup: new Date().toISOString()
        };
        fs.writeFileSync(BACKUP_INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
        
        console.log('\n备份完成！');
        console.log('可以在飞书 → 文档 → 最近编辑 中查看');
        
    } catch (error) {
        console.error(`❌ 备份失败：${error.message}`);
        process.exit(1);
    }
}

// 运行
backupToFeishu();
