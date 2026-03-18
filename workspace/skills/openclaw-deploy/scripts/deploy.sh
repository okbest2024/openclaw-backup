#!/bin/bash
# OpenClaw 工作区部署脚本 (macOS/Linux)
# 自动安装 OpenClaw 并部署工作区

set -e

# 默认参数
GITHUB_REPO=""
BRANCH="main"
SKIP_LOGIN=false
WORKSPACE_PATH="$HOME/.openclaw/workspace"

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--repo)
            GITHUB_REPO="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        --skip-login)
            SKIP_LOGIN=true
            shift
            ;;
        -w|--workspace)
            WORKSPACE_PATH="$2"
            shift 2
            ;;
        *)
            echo "未知参数：$1"
            echo "用法：$0 -r <仓库地址> [-b 分支] [--skip-login] [-w 工作区路径]"
            exit 1
            ;;
    esac
done

# 检查必填参数
if [ -z "$GITHUB_REPO" ]; then
    echo "❌ 错误：必须指定 GitHub 仓库地址"
    echo "用法：$0 -r <仓库地址> [-b 分支] [--skip-login]"
    exit 1
fi

echo "========================================"
echo "🚀 OpenClaw 工作区部署"
echo "========================================"
echo ""

# 步骤 1: 检查 Node.js
echo "🔍 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js 已安装：$NODE_VERSION"
else
    echo "❌ Node.js 未安装！请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 步骤 2: 检查 Git
echo "🔍 检查 Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✅ Git 已安装：$GIT_VERSION"
else
    echo "❌ Git 未安装！请先安装 Git: https://git-scm.com/"
    exit 1
fi

# 步骤 3: 安装 OpenClaw
echo ""
echo "📦 安装 OpenClaw..."
if npm install -g openclaw; then
    echo "✅ OpenClaw 安装成功"
else
    echo "❌ OpenClaw 安装失败，尝试使用淘宝镜像..."
    npm config set registry https://registry.npmmirror.com
    npm install -g openclaw
    echo "✅ OpenClaw 安装成功（使用淘宝镜像）"
fi

# 步骤 4: 登录
if [ "$SKIP_LOGIN" = false ]; then
    echo ""
    echo "🔐 请登录 OpenClaw"
    echo "运行命令：openclaw login"
    echo "按提示完成登录后，按回车继续..."
    read
fi

# 步骤 5: 创建工作区目录
echo ""
echo "📂 创建工作区目录..."
if [ ! -d "$WORKSPACE_PATH" ]; then
    mkdir -p "$WORKSPACE_PATH"
    echo "✅ 目录已创建：$WORKSPACE_PATH"
else
    echo "✅ 目录已存在：$WORKSPACE_PATH"
fi

# 步骤 6: 克隆仓库
echo ""
echo "📥 克隆仓库..."
cd "$WORKSPACE_PATH"

if [ -d ".git" ]; then
    echo "⚠️  检测到现有 git 仓库，跳过克隆"
    echo "🔄 拉取最新代码..."
    git pull origin "$BRANCH"
else
    git clone "$GITHUB_REPO" .
    echo "✅ 仓库克隆成功"
fi

# 步骤 7: 启动 Gateway
echo ""
echo "🚀 启动 OpenClaw Gateway..."
if openclaw gateway start; then
    sleep 3
    echo "✅ Gateway 已启动"
else
    echo "⚠️  Gateway 启动失败，请手动运行：openclaw gateway start"
fi

# 步骤 8: 验证
echo ""
echo "========================================"
echo "✅ 部署完成！"
echo "========================================"
echo ""
echo "📋 下一步："
echo "1. 在聊天中发送 '你好' 测试 AI 助手"
echo "2. 设置定时备份：'设置每天 20:00 自动备份到 GitHub'"
echo "3. 查看状态：openclaw gateway status"
echo ""
