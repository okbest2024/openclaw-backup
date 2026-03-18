---
name: openclaw-deploy
description: "Deploy OpenClaw workspace on any machine. Use when: setting up OpenClaw on new computer, migrating workspace, restoring from GitHub backup, configuring gateway, or setting up automated backups. Supports Windows/macOS/Linux."
---

# OpenClaw 工作区部署技能

快速在任何电脑上部署 OpenClaw 工作区，恢复 AI 助手配置和自动化任务。

## 快速开始

### 一键部署（推荐）

运行部署脚本自动完成所有步骤：

**Windows:**
```powershell
pwsh -File scripts/deploy.ps1 -GitHubRepo "https://github.com/okbest2024/tgmqqclawyang.git"
```

**macOS/Linux:**
```bash
bash scripts/deploy.sh -r "https://github.com/okbest2024/tgmqqclawyang.git"
```

---

## 手动部署步骤

### 步骤 1：安装 OpenClaw

```bash
npm install -g openclaw
```

验证安装：
```bash
openclaw --version
```

**中国用户加速：**
```bash
npm config set registry https://registry.npmmirror.com
npm install -g openclaw
```

### 步骤 2：登录并配置

```bash
openclaw login
```

按提示完成：
1. 选择 AI 提供商（推荐：Qwen/通义千问）
2. 输入 API 密钥
3. 配置消息渠道（可选）

### 步骤 3：克隆工作区

**Windows:**
```powershell
mkdir C:\Users\$env:USERNAME\.openclaw\workspace
cd C:\Users\$env:USERNAME\.openclaw\workspace
git clone <仓库地址> .
```

**macOS/Linux:**
```bash
mkdir -p ~/.openclaw/workspace
cd ~/.openclaw/workspace
git clone <仓库地址> .
```

### 步骤 4：启动 Gateway

```bash
openclaw gateway start
openclaw gateway status
```

### 步骤 5：恢复定时任务

告诉 AI 助手：
> "设置每天 20:00 自动备份到 GitHub"

或手动创建系统定时任务（见脚本 `scripts/setup-cron.ps1` / `scripts/setup-cron.sh`）

---

## 部署脚本说明

### deploy.ps1 / deploy.sh

自动化部署脚本，执行：
- ✅ 检查 Node.js 和 Git
- ✅ 安装 OpenClaw
- ✅ 克隆工作区
- ✅ 启动 Gateway
- ✅ 验证部署

**参数：**
- `-GitHubRepo` / `-r`: GitHub 仓库地址
- `-Branch` / `-b`: 分支名（默认：main）
- `-SkipLogin`: 跳过登录步骤

**示例：**
```powershell
pwsh -File scripts/deploy.ps1 -r "https://github.com/okbest2024/tgmqqclawyang.git" -b main
```

### setup-cron.ps1 / setup-cron.sh

设置系统级定时备份任务。

**Windows（任务计划程序）：**
```powershell
pwsh -File scripts/setup-cron.ps1 -Workspace "C:\Users\$env:USERNAME\.openclaw\workspace" -Time "20:00"
```

**macOS（launchd）/Linux（cron）：**
```bash
bash scripts/setup-cron.sh -w ~/.openclaw/workspace -t "20:00"
```

---

## 验证部署

### 检查清单

- [ ] `openclaw --version` 显示版本号
- [ ] `openclaw gateway status` 显示运行中
- [ ] 工作区文件完整（`ls` 查看）
- [ ] 能正常对话（发送"你好"测试）
- [ ] 定时任务已设置（`openclaw cron list`）

### 快速测试

```bash
# 查看 Gateway 状态
openclaw gateway status

# 查看日志
openclaw logs --follow

# 查看定时任务
openclaw cron list
```

---

## 故障排除

### 问题：npm 安装失败
**解决：**
```bash
npm config set registry https://registry.npmmirror.com
npm cache clean --force
npm install -g openclaw
```

### 问题：GitHub 克隆失败（网络问题）
**解决：**
- 使用代理
- 修改 DNS 为 `1.1.1.1` 或 `223.5.5.5`
- 使用镜像站：`https://hub.fastgit.org/okbest2024/tgmqqclawyang.git`

### 问题：Gateway 启动失败
**解决：**
```bash
# 查看详细错误
openclaw logs

# 重新登录
openclaw login

# 重启 Gateway
openclaw gateway restart
```

### 问题：API 密钥错误
**解决：**
```bash
openclaw login
# 重新配置 API 密钥
```

### 问题：工作区路径不对
**解决：**
确认工作区位置：
- Windows: `C:\Users\<用户名>\.openclaw\workspace`
- macOS/Linux: `~/.openclaw/workspace`

---

## 文件结构

```
openclaw-deploy/
├── SKILL.md                    # 本文件
├── scripts/
│   ├── deploy.ps1              # Windows 部署脚本
│   ├── deploy.sh               # macOS/Linux 部署脚本
│   ├── setup-cron.ps1          # Windows 定时任务设置
│   ├── setup-cron.sh           # macOS/Linux 定时任务设置
│   └── verify-deploy.ps1       # 验证脚本
└── references/
    └── migration-checklist.md  # 迁移检查清单
```

---

## 相关资源

- **MIGRATION.md**: 工作区根目录中的完整迁移指南
- **OpenClaw 文档**: https://docs.openclaw.ai
- **GitHub 仓库**: https://github.com/okbest2024/tgmqqclawyang

---

_✨ 由盖世 baby 创建 · 宇宙之主认证_
