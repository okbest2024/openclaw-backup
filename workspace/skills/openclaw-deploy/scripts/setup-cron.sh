#!/bin/bash
# OpenClaw 定时备份任务设置脚本 (macOS/Linux)
# 创建 cron 任务或 launchd 任务

set -e

# 默认参数
WORKSPACE_PATH="$HOME/.openclaw/workspace"
TIME="20:00"
TASK_NAME="OpenClaw GitHub 自动备份"

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -w|--workspace)
            WORKSPACE_PATH="$2"
            shift 2
            ;;
        -t|--time)
            TIME="$2"
            shift 2
            ;;
        -n|--name)
            TASK_NAME="$2"
            shift 2
            ;;
        *)
            echo "未知参数：$1"
            echo "用法：$0 [-w 工作区路径] [-t 时间] [-n 任务名称]"
            exit 1
            ;;
    esac
done

echo "========================================"
echo "⏰ 设置定时备份任务"
echo "========================================"
echo ""

# 解析时间
HOUR=$(echo $TIME | cut -d':' -f1)
MINUTE=$(echo $TIME | cut -d':' -f2)

echo "📂 工作区：$WORKSPACE_PATH"
echo "⏰ 备份时间：每天 $TIME"
echo ""

# 检测操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - 使用 launchd
    echo "🍎 检测到 macOS，使用 launchd..."
    echo ""
    
    PLIST_FILE="$HOME/Library/LaunchAgents/com.openclaw.backup.plist"
    mkdir -p "$HOME/Library/LaunchAgents"
    
    cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.backup</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd $WORKSPACE_PATH && pwsh -File scripts/backup-to-github.ps1</string>
    </array>
    
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>$HOUR</integer>
        <key>Minute</key>
        <integer>$MINUTE</integer>
    </dict>
    
    <key>WorkingDirectory</key>
    <string>$WORKSPACE_PATH</string>
    
    <key>StandardOutPath</key>
    <string>$HOME/.openclaw/logs/backup.log</string>
    
    <key>StandardErrorPath</key>
    <string>$HOME/.openclaw/logs/backup.err</string>
</dict>
</plist>
EOF
    
    # 加载任务
    launchctl unload "$PLIST_FILE" 2>/dev/null || true
    launchctl load "$PLIST_FILE"
    
    echo "✅ launchd 任务创建成功！"
    echo ""
    echo "任务详情："
    echo "  - 名称：com.openclaw.backup"
    echo "  - 时间：每天 $TIME"
    echo "  - 配置文件：$PLIST_FILE"
    echo ""
    echo "查看任务：launchctl list | grep openclaw"
    echo "手动运行：launchctl start com.openclaw.backup"
    
else
    # Linux - 使用 cron
    echo "🐧 检测到 Linux，使用 cron..."
    echo ""
    
    CRON_EXPR="$MINUTE $HOUR * * *"
    CRON_CMD="cd $WORKSPACE_PATH && pwsh -File scripts/backup-to-github.ps1 >> $HOME/.openclaw/logs/backup.log 2>&1"
    
    # 备份现有 crontab
    crontab -l > /tmp/crontab.backup 2>/dev/null || true
    
    # 添加新任务（先删除旧的）
    grep -v "backup-to-github" /tmp/crontab.backup > /tmp/crontab.new 2>/dev/null || true
    echo "$CRON_EXPR $CRON_CMD  # $TASK_NAME" >> /tmp/crontab.new
    
    # 安装新 crontab
    crontab /tmp/crontab.new
    rm /tmp/crontab.backup /tmp/crontab.new
    
    echo "✅ cron 任务创建成功！"
    echo ""
    echo "任务详情："
    echo "  - Cron 表达式：$CRON_EXPR"
    echo "  - 时间：每天 $TIME"
    echo "  - 命令：$CRON_CMD"
    echo ""
    echo "查看任务：crontab -l"
    echo "日志位置：$HOME/.openclaw/logs/backup.log"
fi

echo ""
echo "========================================"
