# Script: backup-conversations-simple.js
# 简化的对话备份脚本 - 直接读取并写入Markdown
const fs = require('fs');
const path = require('path');

const SESSIONS_PATH = path.join(process.env.USERPROFILE, '.openclaw', 'agents', 'main', 'sessions');
const OUTPUT_DIR = path.join(process.cwd(), 'conversation-backup');

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

let totalBackedUp = 0;

for (const sessionFile of sessionFiles) {
    console.log(`Processing: ${sessionFile.name}`);
    
    try {
        const content = fs.readFileSync(sessionFile.path, 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim()).map(line => {
            try { return JSON.parse(line); } catch(e) { return null; }
        }).filter(l => l);
        
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
                    if (item.type === 'image_url') {
                        markdown += `[Image: ${item.image_url?.url || 'attached'}]\n\n`;
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
        console.log(`  ✓ Saved: ${outputFile}`);
        totalBackedUp++;
    } catch (err) {
        console.error(`  ✗ Error processing ${sessionFile.name}: ${err.message}`);
    }
}

console.log(`\nBackup completed! ${totalBackedUp} session(s) backed up.`);

// Now also commit to GitHub if .git exists
const gitDir = path.join(process.cwd(), '.git');
if (fs.existsSync(gitDir)) {
    console.log('\n📤 Syncing to GitHub...');
    try {
        // Add all new files
        const { execSync } = require('child_process');
        execSync('git add conversation-backup/', { cwd: process.cwd(), stdio: 'pipe' });
        const commitMsg = `chore: backup conversations ${new Date().toISOString()}`;
        execSync(`git commit -m "${commitMsg}"`, { cwd: process.cwd(), stdio: 'pipe' });
        console.log('  ✓ Committed to local git');
        // Check if push needed
        const status = execSync('git status --porcelain', { cwd: process.cwd(), stdio: 'pipe' }).toString();
        if (status.includes('origin')) {
            execSync('git push', { cwd: process.cwd(), stdio: 'pipe' });
            console.log('  ✓ Pushed to GitHub');
        } else {
            console.log('  ℹ️  No remote changes to push');
        }
    } catch (err) {
        console.error('  ✗ GitHub sync failed:', err.message);
    }
} else {
    console.log('\n⚠️  No .git directory found, skipping GitHub sync');
}
