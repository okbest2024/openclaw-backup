# GitHub 自动备份脚本
# 每天 20:00 执行，自动提交并推送工作区到 GitHub

$ErrorActionPreference = "Stop"
$workspace = "C:\Users\tgm\.openclaw\workspace"

Write-Host "========================================"
Write-Host "🌌 盖世 baby GitHub 自动备份"
Write-Host "========================================"
Write-Host ""

try {
    # 进入工作目录
    Set-Location $workspace
    Write-Host "📂 工作目录：$workspace"
    
    # 检查 git 状态
    Write-Host "🔍 检查变更..."
    $status = git status --porcelain
    $hasChanges = $status -ne ""
    
    if ($hasChanges) {
        Write-Host "✅ 发现变更，开始备份..."
        
        # 添加所有变更
        git add -A
        Write-Host "📦 已暂存所有变更"
        
        # 提交
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $commitMsg = "🤖 自动备份：$timestamp"
        git commit -m $commitMsg
        Write-Host "💾 提交成功：$commitMsg"
        
        # 推送
        git push origin main
        Write-Host "🚀 推送成功！"
        
        Write-Host ""
        Write-Host "✅ 备份完成！"
    } else {
        Write-Host "✨ 无变更，跳过备份"
    }
}
catch {
    Write-Host "❌ 备份失败：$($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================"
