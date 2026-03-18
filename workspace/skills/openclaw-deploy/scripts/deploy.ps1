#!/usr/bin/env pwsh
# OpenClaw 工作区部署脚本 (Windows)
# 自动安装 OpenClaw 并部署工作区

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubRepo,
    
    [string]$Branch = "main",
    
    [switch]$SkipLogin,
    
    [string]$WorkspacePath = "$env:USERPROFILE\.openclaw\workspace"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 OpenClaw 工作区部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 检查 Node.js
Write-Host "🔍 检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装：$nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安装！请先安装 Node.js: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 步骤 2: 检查 Git
Write-Host "🔍 检查 Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git 已安装：$gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git 未安装！请先安装 Git: https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# 步骤 3: 安装 OpenClaw
Write-Host ""
Write-Host "📦 安装 OpenClaw..." -ForegroundColor Yellow
try {
    npm install -g openclaw
    Write-Host "✅ OpenClaw 安装成功" -ForegroundColor Green
} catch {
    Write-Host "❌ OpenClaw 安装失败，尝试使用淘宝镜像..." -ForegroundColor Yellow
    npm config set registry https://registry.npmmirror.com
    npm install -g openclaw
    Write-Host "✅ OpenClaw 安装成功（使用淘宝镜像）" -ForegroundColor Green
}

# 步骤 4: 登录
if (-not $SkipLogin) {
    Write-Host ""
    Write-Host "🔐 请登录 OpenClaw" -ForegroundColor Yellow
    Write-Host "运行命令：openclaw login" -ForegroundColor Gray
    Write-Host "按提示完成登录后，按回车继续..." -ForegroundColor Gray
    Read-Host
}

# 步骤 5: 创建工作区目录
Write-Host ""
Write-Host "📂 创建工作区目录..." -ForegroundColor Yellow
if (-not (Test-Path $WorkspacePath)) {
    New-Item -ItemType Directory -Force -Path $WorkspacePath | Out-Null
    Write-Host "✅ 目录已创建：$WorkspacePath" -ForegroundColor Green
} else {
    Write-Host "✅ 目录已存在：$WorkspacePath" -ForegroundColor Green
}

# 步骤 6: 克隆仓库
Write-Host ""
Write-Host "📥 克隆仓库..." -ForegroundColor Yellow
Set-Location $WorkspacePath

# 检查是否已经有 git 仓库
if (Test-Path ".git") {
    Write-Host "⚠️  检测到现有 git 仓库，跳过克隆" -ForegroundColor Yellow
    Write-Host "🔄 拉取最新代码..." -ForegroundColor Yellow
    git pull origin $Branch
} else {
    git clone $GitHubRepo .
    Write-Host "✅ 仓库克隆成功" -ForegroundColor Green
}

# 步骤 7: 启动 Gateway
Write-Host ""
Write-Host "🚀 启动 OpenClaw Gateway..." -ForegroundColor Yellow
try {
    openclaw gateway start
    Start-Sleep -Seconds 3
    Write-Host "✅ Gateway 已启动" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Gateway 启动失败，请手动运行：openclaw gateway start" -ForegroundColor Yellow
}

# 步骤 8: 验证
Write-Host ""
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 下一步：" -ForegroundColor Cyan
Write-Host "1. 在聊天中发送 '你好' 测试 AI 助手" -ForegroundColor White
Write-Host "2. 设置定时备份：'设置每天 20:00 自动备份到 GitHub'" -ForegroundColor White
Write-Host "3. 查看状态：openclaw gateway status" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
