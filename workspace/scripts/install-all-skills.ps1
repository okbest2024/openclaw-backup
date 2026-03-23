# 批量安装技能脚本 - 让盖世 baby 成为全能助理！
# 创建时间: 2026-03-23

$skills = @(
    # 核心生产力
    "openclaw/openclaw/notion",
    "openclaw/openclaw/slack",
    "openclaw/openclaw/github",
    "openclaw/openclaw/trello",
    
    # 多媒体
    "openclaw/openclaw/openai-image-gen",
    "openclaw/openclaw/openai-whisper",
    "openclaw/openclaw/sag",
    "openclaw/openclaw/video-frames",
    "openclaw/openclaw/gifgrep",
    
    # 办公套件
    "openclaw/openclaw/gog",
    "openclaw/openclaw/himalaya",
    
    # 笔记
    "openclaw/openclaw/obsidian",
    "openclaw/openclaw/apple-notes",
    "openclaw/openclaw/bear-notes",
    
    # 信息获取
    "openclaw/openclaw/weather",
    "openclaw/openclaw/bird",
    "openclaw/openclaw/blogwatcher",
    
    # 智能家居
    "openclaw/openclaw/openhue",
    "openclaw/openclaw/spotify-player",
    "openclaw/openclaw/blucli",
    
    # 开发工具
    "openclaw/openclaw/coding-agent",
    "openclaw/openclaw/gemini",
    "openclaw/openclaw/skill-creator",
    
    # 系统工具
    "openclaw/openclaw/tmux",
    "openclaw/openclaw/mcporter",
    "openclaw/openclaw/clawhub",
    "openclaw/openclaw/session-logs",
    "openclaw/openclaw/summarize",
    
    # 通讯
    "openclaw/openclaw/wacli",
    "openclaw/openclaw/bluebubbles",
    "openclaw/openclaw/voice-call",
    
    # 其他实用
    "openclaw/openclaw/goplaces",
    "openclaw/openclaw/local-places",
    "openclaw/openclaw/ordercli",
    "openclaw/openclaw/peekaboo",
    "openclaw/openclaw/camsnap",
    "openclaw/openclaw/songsee",
    "openclaw/openclaw/nano-banana-pro",
    "openclaw/openclaw/diffs",
    "openclaw/openclaw/acp-router",
    "openclaw/openclaw/oracle",
    "openclaw/openclaw/node-connect",
    "openclaw/openclaw/eightctl",
    "openclaw/openclaw/imsg",
    "openclaw/openclaw/apple-reminders",
    "openclaw/openclaw/sherpa-onnx-tts",
    "openclaw/openclaw/openai-whisper-api",
    "openclaw/openclaw/xurl",
    "openclaw/openclaw/parallels-discord-roundtrip",
    "openclaw/openclaw/feishu-doc",
    "openclaw/openclaw/model-usage",
    "openclaw/openclaw/gh-issues"
)

$total = $skills.Count
$success = 0
$failed = 0
$failedSkills = @()

Write-Host "🚀 开始批量安装 $total 个技能，让盖世 baby 成为全能助理！" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

for ($i = 0; $i -lt $total; $i++) {
    $skill = $skills[$i]
    $progress = $i + 1
    Write-Host "[$progress/$total] 正在安装: $skill ..." -ForegroundColor Yellow -NoNewline
    
    try {
        $output = npx skillhub install $skill 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅ 成功" -ForegroundColor Green
            $success++
        } else {
            Write-Host " ❌ 失败" -ForegroundColor Red
            $failed++
            $failedSkills += $skill
        }
    } catch {
        Write-Host " ❌ 错误" -ForegroundColor Red
        $failed++
        $failedSkills += $skill
    }
    
    # 每安装10个暂停一下，避免请求过快
    if ($progress % 10 -eq 0) {
        Write-Host "⏳ 已安装 $progress 个，暂停 3 秒..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ 安装完成！" -ForegroundColor Green
Write-Host "   成功: $success" -ForegroundColor Green
Write-Host "   失败: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -gt 0) {
    Write-Host "`n失败的技能:" -ForegroundColor Red
    foreach ($skill in $failedSkills) {
        Write-Host "   - $skill" -ForegroundColor Red
    }
}

Write-Host "`n🎉 盖世 baby 现在拥有 $success 个新技能，成为全能助理！" -ForegroundColor Cyan
