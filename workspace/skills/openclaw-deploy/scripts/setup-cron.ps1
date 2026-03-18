#!/usr/bin/env pwsh
# OpenClaw 定时备份任务设置脚本 (Windows)
# 创建 Windows 任务计划程序任务

param(
    [string]$WorkspacePath = "$env:USERPROFILE\.openclaw\workspace",
    [string]$Time = "20:00",
    [string]$TaskName = "OpenClaw GitHub 自动备份"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "⏰ 设置定时备份任务 (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 解析时间
$hour, $minute = $Time.Split(':')
$triggerTime = Get-Date
$triggerTime = $triggerTime.AddHours([int]$hour - $triggerTime.Hour)
$triggerTime = $triggerTime.AddMinutes([int]$minute - $triggerTime.Minute)

Write-Host "📂 工作区：$WorkspacePath" -ForegroundColor Yellow
Write-Host "⏰ 备份时间：每天 $Time" -ForegroundColor Yellow
Write-Host "📝 任务名称：$TaskName" -ForegroundColor Yellow
Write-Host ""

# 创建任务动作
$action = New-ScheduledTaskAction -Execute "pwsh" `
    -Argument "-NoProfile -WindowStyle Hidden -File `"$WorkspacePath\scripts\backup-to-github.ps1`""

# 创建触发器（每天指定时间）
$trigger = New-ScheduledTaskTrigger -Daily -At $triggerTime

# 创建任务设置
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

# 注册任务
try {
    # 先删除旧任务（如果存在）
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Description "每天自动备份 OpenClaw 工作区到 GitHub"
    
    Write-Host "✅ 定时任务创建成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "任务详情：" -ForegroundColor Cyan
    Write-Host "  - 名称：$TaskName"
    Write-Host "  - 时间：每天 $Time"
    Write-Host "  - 工作区：$WorkspacePath"
    Write-Host ""
    Write-Host "查看任务：打开 '任务计划程序' → '任务计划程序库' → '$TaskName'" -ForegroundColor Gray
    Write-Host "手动运行：schtasks /run /tn `"$TaskName`"" -ForegroundColor Gray
} catch {
    Write-Host "❌ 创建失败：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "请确保以管理员身份运行此脚本" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
