#!/usr/bin/env pwsh
# OpenClaw 部署验证脚本

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ OpenClaw 部署验证" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# 检查 1: Node.js
Write-Host "🔍 检查 Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    Write-Host " ✅ ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $allPassed = $false
}

# 检查 2: Git
Write-Host "🔍 检查 Git..." -NoNewline
try {
    $gitVersion = git --version
    Write-Host " ✅ ($gitVersion)" -ForegroundColor Green
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $allPassed = $false
}

# 检查 3: OpenClaw
Write-Host "🔍 检查 OpenClaw..." -NoNewline
try {
    $ocVersion = openclaw --version
    Write-Host " ✅ ($ocVersion)" -ForegroundColor Green
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $allPassed = $false
}

# 检查 4: Gateway 状态
Write-Host "🔍 检查 Gateway 状态..." -NoNewline
try {
    $status = openclaw gateway status
    if ($status -match "running") {
        Write-Host " ✅ (运行中)" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  (未运行)" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $allPassed = $false
}

# 检查 5: 工作区文件
Write-Host "🔍 检查工作区文件..." -NoNewline
$requiredFiles = @("IDENTITY.md", "USER.md", "SOUL.md", "AGENTS.md")
$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}
if ($missingFiles.Count -eq 0) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ⚠️  (缺少：$($missingFiles -join ', '))" -ForegroundColor Yellow
}

# 检查 6: Git 仓库
Write-Host "🔍 检查 Git 仓库..." -NoNewline
if (Test-Path ".git") {
    $branch = git branch --show-current
    Write-Host " ✅ (分支：$branch)" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "🎉 所有检查通过！部署成功！" -ForegroundColor Green
} else {
    Write-Host "⚠️  部分检查未通过，请查看上方详情" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
