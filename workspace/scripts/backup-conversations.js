// 对话备份脚本 - 备份 OpenClaw 会话记录到 Markdown
const fs = require('fs');
const path = require('path');

const SESSIONS_PATH = path.join(process.env.USERPROFILE, '.openclaw', 'agents', 'main', 'sessions');
const OUTPUT_DIR = process.argv[2] || './conversation-backup';

// 创建输出目录
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 获取所有 JSONL 文件
const sessionFiles = fs.readdirSync(SESSIONS_PATH)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => ({
        name: f,
        path: path.join(SESSIONS_PATH, f),
        mtime: fs.statSync(path.join(SESSIONS_PATH, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 20);

console.log(`Found ${sessionFiles.length} session files`);

for (const sessionFile of sessionFiles) {
    console.log(`Processing: ${sessionFile.name}`);
    
    const content = fs.readFileSync(sessionFile.path, 'utf-8');
    const lines = content.trim().split('\n').map(line => JSON.parse(line));
    
    let markdown = `# Conversation Log - ${path.basename(sessionFile.name, '.jsonl')}\n\n`;
    markdown += `**Backup Time:** ${new Date().toISOString()}\n\n`;
    markdown += `---\n\n`;
    
    for (const msg of lines) {
        const timestamp = new Date(msg.timestamp).toISOString().replace('T', ' ').slice(0, 19);
        
        if (msg.role === 'user') {
            markdown += `### User [${timestamp}]\n\n`;
            for (const item of msg.content || []) {
                if (item.type === 'text') {
                    markdown += `${item.text}\n\n`;
                }
            }
        } else if (msg.role === 'assistant') {
            markdown += `### Assistant [${timestamp}]\n\n`;
            for (const item of msg.content || []) {
                if (item.type === 'text') {
                    markdown += `${item.text}\n\n`;
                }
            }
        }
        
        markdown += `---\n\n`;
    }
    
    const outputFile = path.join(OUTPUT_DIR, `${path.basename(sessionFile.name, '.jsonl')}.md`);
    fs.writeFileSync(outputFile, markdown, 'utf-8');
    console.log(`  Saved: ${outputFile}`);
}

console.log('\nBackup completed!');
