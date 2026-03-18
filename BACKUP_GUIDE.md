# 🦞 OpenClaw 备份指南

## ✅ 备份已完成

**备份位置：** `C:\Users\Administrator\.openclaw-backup\`

**备份内容：**
- ✅ openclaw.json（主配置）
- ✅ workspace/（记忆、技能、脚本）
- ✅ extensions/（飞书插件）

---

## 📤 推送到 GitHub

### 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名：`openclaw-backup`
3. **设为私有仓库**（Private）⚠️
4. 点击 "Create repository"

### 步骤 2：推送备份

在备份目录执行：

```bash
cd C:\Users\Administrator\.openclaw-backup

# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/openclaw-backup.git

# 推送
git push -u origin master
```

### 步骤 3：验证

访问你的 GitHub 仓库，确认文件已上传。

---

## 🔄 定期备份

### 手动备份
运行备份脚本：
```bash
powershell -ExecutionPolicy Bypass -File "C:\Users\Administrator\.openclaw\workspace\backup-to-github.ps1"
```

### 自动备份（推荐）
使用 Windows 任务计划程序：
1. 打开"任务计划程序"
2. 创建基本任务
3. 名称：OpenClaw 每日备份
4. 触发器：每天
5. 操作：启动程序
   - 程序：`powershell.exe`
   - 参数：`-ExecutionPolicy Bypass -File "C:\Users\Administrator\.openclaw\workspace\backup-to-github.ps1"`

---

## 📥 恢复步骤

### 从 GitHub 恢复

```bash
# 克隆备份
git clone https://github.com/YOUR_USERNAME/openclaw-backup.git

# 停止网关
openclaw gateway stop

# 复制备份
robocopy openclaw-backup C:\Users\Administrator\.openclaw /MIR

# 重启网关
openclaw gateway start
```

### 从本地恢复

```bash
# 停止网关
openclaw gateway stop

# 复制备份
robocopy C:\Users\Administrator\.openclaw-backup C:\Users\Administrator\.openclaw /MIR

# 重启网关
openclaw gateway start
```

---

## ⚠️ 重要提示

1. **隐私安全** - 备份包含配置和 API Key，务必使用**私有仓库**
2. **定期更新** - 建议每天或每周备份一次
3. **多重备份** - 可同时备份到本地和云端（Google Drive/OneDrive）
4. **恢复测试** - 定期测试恢复流程，确保备份可用

---

## 📞 需要帮助？

如果恢复遇到问题：
1. 检查备份文件完整性
2. 确认 OpenClaw 版本兼容
3. 查看日志文件：`~\AppData\Local\Temp\openclaw\`

---

*备份时间：2026-03-18 15:33*
*版本：OpenClaw 2026.3.13*
