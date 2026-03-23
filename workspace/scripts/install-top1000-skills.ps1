# Skillhub Top 1000 技能批量安装脚本
# 使用方法: .\install-top1000-skills.ps1

$ErrorActionPreference = "Continue"
$ProgressPreference = "Continue"

# 已安装技能列表（从 openclaw skills list 获取）
$installedSkills = @(
    "feishu-doc", "feishu-drive", "feishu-perm", "feishu-wiki", "1password",
    "blogwatcher", "gemini", "github", "gog", "healthcheck", "himalaya",
    "mcporter", "model-usage", "nano-banana-pro", "nano-pdf", "node-connect",
    "notion", "obsidian", "openai-whisper", "skill-creator", "slack",
    "sonoscli", "tmux", "trello", "video-frames", "weather", "Agent Browser",
    "self-reflection", "aminer-data-search", "api-gateway", "architecture-designer",
    "auto-updater", "autoglm-deepresearch", "autoglm-generate-image", "autoglm-open-link",
    "autoglm-search-image", "autoglm-websearch", "automation-workflows", "backtest-expert",
    "blog-writer", "brainstorming", "brave-search", "browser-use", "byterover",
    "claw-backup", "clawddocs", "clawdefender", "Code", "consciousness-framework",
    "content-strategy", "copywriting", "executing-plans", "feishu-chat-history",
    "feishu-cron-reminder", "feishu-screenshot", "feishu-send-file", "FFmpeg Video Editor",
    "find-skills", "freeride", "frontend-design", "git-essentials", "gmail",
    "humanize-ai-text", "humanizer", "ima-note", "interview-designer", "lnbits",
    "Market Research", "Memory", "n8n-workflow-automation", "obsidian-ontology-sync",
    "ontology", "ontology-mapper", "openclaw-config-fix", "openclaw-deploy",
    "openclaw-tui-sender", "opencode-controller", "outlook", "ping-model",
    "proactive-agent", "pua", "qq-bot-connect", "qq-bridge-responder",
    "research-paper-writer", "security-auditor", "Self-Improving Agent (With Self-Reflection)",
    "self-improvement", "SEO (Site Audit + Content Writer + Competitor Analysis)",
    "seo-content-writer", "shopify", "skill-vetter", "social-content",
    "Social Media Scheduler", "stock-analysis", "stripe", "supabase-postgres-best-practices",
    "tavily", "terminal-detector", "tgmskill-postmsgtotrace", "trae-trace-sender",
    "ui-ux-pro-max", "whatsapp-business", "whisper-stt", "windows-ui-automation",
    "writing-plans", "xero", "xiaohongshu-mcp", "youtube", "youtube-watcher"
)

# 转换为小写用于比较
$installedSkillsLower = $installedSkills | ForEach-Object { $_.ToLower() }

# 从 Skillhub 获取的前1000名技能列表（需要手动更新）
# 这里先列出从网页看到的前50名
$topSkills = @(
    "self-improving-agent",      # 24.8万
    "find-skills",               # 23.1万
    "summarize",                 # 17.5万
    "agent-browser",             # 14.5万
    "gog",                       # 11.9万
    "github",                    # 11.7万
    "ontology",                  # 11.6万
    "skill-vetter",              # 11.3万
    "proactive-agent",           # 11.0万
    "weather",                   # 10.0万
    "self-improving-proactive",  # 8.6万
    "multi-search-engine",       # 6.6万
    "humanizer",                 # 6.2万
    "nano-pdf",                  # 6.4万
    "sonoscli",                  # 6.2万
    "notion",                    # 6.0万
    "nano-banana-pro",           # 5.7万
    "obsidian",                  # 5.5万
    "auto-updater",              # 5.1万
    "openai-whisper",            # 5.0万
    "api-gateway",               # 5.0万
    "baidu-web-search",          # 4.9万
    "skill-creator",             # 4.6万
    "automation-workflows"       # 4.5万
    # ... 更多技能需要继续添加
)

Write-Host "=== Skillhub Top 1000 技能批量安装 ===" -ForegroundColor Cyan
Write-Host "已安装技能数量: $($installedSkills.Count)" -ForegroundColor Green
Write-Host ""

# 找出需要安装的技能
$skillsToInstall = $topSkills | Where-Object { 
    $skillLower = $_.ToLower()
    $installedSkillsLower -notcontains $skillLower 
}

Write-Host "需要安装的技能数量: $($skillsToInstall.Count)" -ForegroundColor Yellow
Write-Host ""

# 批量安装
$successCount = 0
$failCount = 0
$skipCount = 0

foreach ($skill in $skillsToInstall) {
    Write-Host "正在安装: $skill ..." -NoNewline
    
    try {
        # 使用 clawhub 安装技能
        $output = & npx clawhub install $skill 2>&1
        
        if ($LASTEXITCODE -eq 0 -or $output -match "already installed" -or $output -match "exists") {
            Write-Host " ✓" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ✗ ($output)" -ForegroundColor Red
            $failCount++
        }
    }
    catch {
        Write-Host " ✗ (Error: $_)" -ForegroundColor Red
        $failCount++
    }
    
    # 每安装10个技能暂停一下，避免请求过快
    if (($successCount + $failCount) % 10 -eq 0) {
        Write-Host "  已处理 $(($successCount + $failCount)) 个技能，暂停2秒..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "=== 安装完成 ===" -ForegroundColor Cyan
Write-Host "成功: $successCount" -ForegroundColor Green
Write-Host "失败: $failCount" -ForegroundColor Red
Write-Host "跳过: $skipCount" -ForegroundColor Yellow
