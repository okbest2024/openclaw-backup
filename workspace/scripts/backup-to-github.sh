#!/usr/bin/env bash
# OpenClaw 自动备份脚本 - 备份到 GitHub
# 备份内容：skills, memory, 配置文件

set -e

WORKSPACE="$HOME/.openclaw/workspace"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
COMMIT_MSG="chore: auto backup $TIMESTAMP"

cd "$WORKSPACE"

echo "[INFO] 开始备份 OpenClaw 工作区..."

# 检查 Git 配置
if ! git config user.name > /dev/null 2>&1; then
    echo "[ERROR] Git user.name 未配置"
    exit 1
fi

if ! git config user.email > /dev/null 2>&1; then
    echo "[ERROR] Git user.email 未配置"
    exit 1
fi

# 检查远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "[ERROR] 未配置 origin 远程仓库"
    exit 1
fi

# 添加所有新技能文件
git add -A

# 检查是否有变化
if git diff --cached --quiet; then
    echo "[INFO] 没有变化，跳过备份"
    exit 0
fi

# 获取远程最新代码
echo "[INFO] 获取远程变更..."
git fetch origin || echo "[WARNING] 获取失败，继续本地提交"

# 尝试合并远程变更
git pull --no-edit || echo "[WARNING] 合并失败，继续提交"

# 提交变更
echo "[INFO] 提交变更..."
git commit -m "$COMMIT_MSG" || {
    echo "[WARNING] 提交失败（可能没有变化）"
    exit 0
}

# 推送到 GitHub
echo "[INFO] 推送到 GitHub..."
git push origin main || {
    # 如果是第一次推送，设置 upstream
    git push --set-upstream origin main || {
        echo "[ERROR] 推送失败"
        exit 1
    }
}

echo "[SUCCESS] 备份完成！$TIMESTAMP"
