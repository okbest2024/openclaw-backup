@echo off
REM OpenClaw 备份到 GitHub 脚本
cd /d "%~dp0"

echo 🦞 OpenClaw 备份开始...
echo 📁 备份位置：%CD%

REM 初始化 Git（如果没有）
if not exist ".git" (
    git init
)

REM 添加所有文件
git add .

REM 提交
git commit -m "Auto backup %DATE% %TIME%"

REM 推送到 GitHub（需要配置远程）
REM git push origin master

echo ✅ 备份完成！
echo 📝 下一步：创建 GitHub 仓库并推送
pause
