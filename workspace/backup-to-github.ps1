# OpenClaw 备份脚本
# 备份配置、Skills、记忆到 GitHub

$backupDir = "C:\Users\Administrator\.openclaw-backup"
$sourceDir = "C:\Users\Administrator\.openclaw"

# 创建备份目录
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

Write-Host "🦞 OpenClaw 备份开始..."
Write-Host "📁 源目录：$sourceDir"
Write-Host "📦 备份目录：$backupDir"

# 排除的目录
$exclude = @(
    "node_modules",
    ".git",
    "temp",
    "logs",
    "*.log"
)

# 复制重要文件
$items = @(
    "openclaw.json",
    "workspace",
    "extensions/openclaw-lark",
    "skills"
)

foreach ($item in $items) {
    $src = Join-Path $sourceDir $item
    $dst = Join-Path $backupDir $item
    
    if (Test-Path $src) {
        Write-Host "📋 复制：$item"
        if (!(Test-Path (Split-Path $dst))) {
            New-Item -ItemType Directory -Path (Split-Path $dst) -Force | Out-Null
        }
        Copy-Item -Path $src -Destination $dst -Recurse -Force -Exclude $exclude
    }
}

# 创建备份清单
$manifest = @{
    backupTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    version = "1.0"
    items = $items
    notes = @"
# OpenClaw 恢复说明

## 恢复步骤
1. 安装 OpenClaw
2. 停止网关：openclaw gateway stop
3. 复制备份文件到 ~/.openclaw/
4. 重启网关：openclaw gateway start

## 备份内容
- openclaw.json - 主配置文件
- workspace/ - 工作区（记忆、技能、脚本）
- extensions/ - 插件（飞书等）
- skills/ - 技能库

## 重要提示
- 飞书插件需要重新授权
- 自定义技能会保留
- 记忆文件在 workspace/memory/
"@
} | ConvertTo-Json

$manifest | Out-File -FilePath "$backupDir\BACKUP_INFO.json" -Encoding utf8

Write-Host "✅ 备份完成！"
Write-Host "📄 备份信息：$backupDir\BACKUP_INFO.json"
Write-Host ""
Write-Host "下一步：将 $backupDir 推送到 GitHub"
