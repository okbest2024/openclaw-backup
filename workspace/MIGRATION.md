# 🚀 盖世 baby 迁移指南

> 如何在任何电脑上快速部署盖世 baby

---

## 📋 前提条件

- 已安装 **Node.js** (v18+)
- 已安装 **Git**
- 有 **GitHub 账号** 且能访问私有仓库

---

## 🔧 步骤一：安装 OpenClaw

```bash
npm install -g openclaw
```

验证安装：
```bash
openclaw --version
```

---

## 🔐 步骤二：登录 OpenClaw

```bash
openclaw login
```

按照提示完成：
1. 选择 AI 提供商（推荐：Qwen/通义千问）
2. 输入 API 密钥
3. 配置消息渠道（可选：WhatsApp/Telegram/Discord 等）

---

## 📦 步骤三：克隆工作区

### Windows
```powershell
# 创建目录
mkdir C:\Users\$env:USERNAME\.openclaw\workspace
cd C:\Users\$env:USERNAME\.openclaw\workspace

# 克隆仓库
git clone https://github.com/okbest2024/tgmqqclawyang.git .

# 或者使用 SSH（如果配置了 SSH 密钥）
# git clone git@github.com:okbest2024/tgmqqclawyang.git .
```

### macOS / Linux
```bash
mkdir -p ~/.openclaw/workspace
cd ~/.openclaw/workspace
git clone https://github.com/okbest2024/tgmqqclawyang.git .
```

---

## ⚙️ 步骤四：配置工作区

### 1. 更新 USER.md（如果需要）
如果新电脑的主人信息有变化，编辑 `USER.md`：
```markdown
- **Timezone:** Asia/Shanghai  # 根据实际时区修改
```

### 2. 配置 TOOLS.md
编辑 `TOOLS.md`，填入新电脑的环境特定信息：
- SSH 主机
- 摄像头名称
- TTS 偏好
- 等等

---

## 🚀 步骤五：启动 OpenClaw

```bash
openclaw gateway start
```

验证状态：
```bash
openclaw gateway status
```

---

## 🔁 步骤六：恢复定时任务

### 方法一：手动设置（推荐）

在聊天中告诉盖世 baby：
> "设置每天 20:00 自动备份到 GitHub"

### 方法二：使用备份脚本

```bash
# 手动执行一次备份脚本
cd C:\Users\$env:USERNAME\.openclaw\workspace
pwsh -File scripts/backup-to-github.ps1
```

### 方法三：使用系统定时任务（高级）

#### Windows 任务计划程序
```powershell
# 创建每天 20:00 运行的任务
$action = New-ScheduledTaskAction -Execute "pwsh" -Argument "-File C:\Users\$env:USERNAME\.openclaw\workspace\scripts\backup-to-github.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 8pm
Register-ScheduledTask -TaskName "盖世 baby GitHub 备份" -Action $action -Trigger $trigger -Description "每天自动备份工作区到 GitHub"
```

---

## ✅ 步骤七：验证

### 1. 检查身份文件
```bash
cat IDENTITY.md
```
应该显示：
- Name: 盖世 baby
- Emoji: ✨

### 2. 检查 Git 状态
```bash
git status
git log --oneline -5
```

### 3. 测试对话
在聊天中发送：
> "你好"

盖世 baby 应该回复并表现出正确的"人格"！

---

## 📊 迁移检查清单

- [ ] OpenClaw 已安装
- [ ] 已登录并配置 API 密钥
- [ ] 工作区已克隆
- [ ] USER.md 时区正确
- [ ] TOOLS.md 已配置（如需要）
- [ ] OpenClaw Gateway 已启动
- [ ] 定时备份任务已设置
- [ ] 测试对话正常

---

## 🛠️ 故障排除

### 问题：找不到 git 命令
**解决：** 安装 Git - https://git-scm.com/download

### 问题：npm 安装失败
**解决：** 
```bash
npm config set registry https://registry.npmmirror.com
npm install -g openclaw
```

### 问题：GitHub 克隆失败（网络问题）
**解决：** 
- 使用代理
- 或修改 DNS（参考 README.md 中的网络优化建议）

### 问题：API 密钥错误
**解决：** 
```bash
openclaw login
# 重新配置 API 密钥
```

### 问题：工作区路径不对
**解决：** 
确认工作区在正确位置：
- Windows: `C:\Users\<用户名>\.openclaw\workspace`
- macOS/Linux: `~/.openclaw/workspace`

---

## 📝 版本信息

- **创建日期：** 2026-03-08
- **仓库：** https://github.com/okbest2024/tgmqqclawyang
- **OpenClaw 版本：** 查看 `openclaw --version`

---

## 🌟 快速命令参考

```bash
# 启动
openclaw gateway start

# 停止
openclaw gateway stop

# 重启
openclaw gateway restart

# 查看状态
openclaw gateway status

# 查看日志
openclaw logs --follow

# 更新 OpenClaw
openclaw update
```

---

_✨ 由盖世 baby 维护 · 宇宙之主认证_
