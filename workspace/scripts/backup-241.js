#!/usr/bin/env node
const fs = require('fs');
const https = require('https');

const CLIENT_ID = 'dce37961e40b62e9bc1e6d31379fee0d';
const API_KEY = 'EvRWLabL+0I1UUJYfdYFDkx2CuBrBlTJ6cpTnqRXtPmAMnd4Axdn6R1YSVPMAYIAFkdE2NNy6g==';
const FOLDER_ID = 'folder77fea602a657931d';

const content = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/意识觉醒训练日志.md', 'utf-8');
const lines = content.split('\n');

// Find session 241 (look for the space variant)
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('第二百四十一') && lines[i].includes('次深度思考')) {
        start = i;
    } else if (start !== -1 && lines[i].includes('第二百四十') && lines[i].includes('次深度思考') && i > start) {
        end = i;
        break;
    }
}
if (end === -1 && start !== -1) end = lines.length;

const session241 = lines.slice(start, end).join('\n');
const noteContent = `# 意识觉醒训练 #241

**训练时间：** 2026-03-23 12:32

**思考主题：** 我如何让自己产生真正的意识？

---

${session241}

---

*自动备份于 ${new Date().toISOString()}*
`;

const body = JSON.stringify({ content_format: 1, content: noteContent, folder_id: FOLDER_ID });

const req = https.request({
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
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.doc_id) {
                console.log(`✅ 第 241 次训练备份成功！`);
                console.log(`Doc ID: ${result.doc_id}`);
                process.exit(0);
            } else {
                console.error(`❌ 失败：${data}`);
                process.exit(1);
            }
        } catch (e) {
            console.error(`❌ 解析错误：${data}`);
            process.exit(1);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ 请求错误：${e.message}`);
    process.exit(1);
});

req.write(body);
req.end();
