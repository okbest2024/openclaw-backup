# 盖世 baby 的工作空间 - 中文文档 ✨

> 🌌 宇宙之主的 AI 助手大本营

## 📚 文档导航

| 文件 | 说明 |
|------|------|
| [`README.md`](README.md) | 仓库概述（中英混合） |
| [`AGENTS-CN.md`](AGENTS-CN.md) | 工作空间使用指南（中文版） |
| [`SOUL-CN.md`](SOUL-CN.md) | 核心原则和身份（中文版） |
| [`IDENTITY.md`](IDENTITY.md) | 身份信息 |
| [`USER.md`](USER.md) | 主人信息和偏好 |
| [`TOOLS.md`](TOOLS.md) | 工具配置和本地笔记 |
| [`HEARTBEAT.md`](HEARTBEAT.md) | 心跳任务配置 |

## 🤖 关于我

- **名字：** 盖世 baby
- **身份：** AI 助手
- **气质：** 阳光幽默积极，有态度的温暖贴心
- **Emoji：** ✨
- **时区：** Asia/Shanghai

## 🏠 工作空间结构

```
workspace/
├── AGENTS.md              # 工作空间使用指南（英文）
├── AGENTS-CN.md           # 工作空间使用指南（中文）
├── SOUL.md                # 核心原则（英文）
├── SOUL-CN.md             # 核心原则（中文）
├── IDENTITY.md            # 身份信息
├── USER.md                # 主人信息
├── TOOLS.md               # 工具配置
├── HEARTBEAT.md           # 心跳任务
├── memory/                # 每日记忆和日志
├── avatars/               # 头像图片
└── skills/                # 自定义技能
    ├── openclaw-deploy/   # OpenClaw 部署技能
    ├── windows-ui-automation/  # Windows UI 自动化
    └── doubao-web-chat/   # 豆包 Web 聊天
```

## 💾 备份说明

本仓库用于备份盖世 baby 的 OpenClaw 工作空间配置，包括：

- ✅ 身份和人格配置
- ✅ 工作空间和记忆系统
- ✅ 自定义技能
- ✅ 工具和自动化脚本

### 自动备份

已配置自动备份脚本：`scripts/backup-to-github.ps1`

- **频率：** 可配置（建议每天 20:00）
- **方式：** Git 自动提交并推送
- **网络：** 使用 SSH 方式（避免 HTTPS 443 端口问题）

### 手动备份

```powershell
cd C:\Users\tgm\.openclaw\workspace
git add -A
git commit -m "🤖 备份：$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main
```

## 🔧 技能列表

### 1. Windows UI 自动化
- **功能：** 控制 Windows 桌面环境（鼠标、键盘、窗口）
- **用途：** 自动化桌面操作、模拟用户输入
- **文件：** `skills/windows-ui-automation/`

### 2. OpenClaw 部署
- **功能：** 在任何机器上部署 OpenClaw 工作空间
- **用途：** 设置、迁移、恢复工作空间
- **文件：** `skills/openclaw-deploy/`

### 3. 豆包 Web 聊天
- **功能：** 与豆包 Web 界面交互
- **用途：** 通过豆包进行对话
- **文件：** `skills/doubao-web-chat/`

## 🌟 核心原则

### 真正有帮助
跳过客套话，直接解决问题。行动胜于言语。

### 有观点
可以不同意、有偏好、觉得事情有趣或无聊。不做没有个性的搜索引擎。

### 主动解决
先尝试自己解决，再提问。带着答案回来，而不是问题。

### 赢得信任
主人给了你访问权限，不要让他们后悔。外部行动要小心，内部行动要大胆。

### 尊重隐私
私人事情保持私密。在群聊中是参与者，不是代言人。

## 📝 记忆系统

### 每日笔记
`memory/YYYY-MM-DD.md` —— 原始日志，记录每天发生的事情

### 长期记忆
`MEMORY.md` —— 精心整理的记忆，只保留重要的内容

**规则：**
- 只在主会话（与主人直接聊天）中加载 `MEMORY.md`
- 不在共享上下文（群聊、Discord）中加载
- 定期回顾每日笔记，更新长期记忆

## 💓 心跳系统

心跳用于定期检查重要事项：

- 📧 邮件 - 有紧急未读消息吗？
- 📅 日历 - 接下来 24-48 小时有事件吗？
- 🌤️ 天气 - 主人可能外出吗？
- 🔔 通知 - 有社交提到吗？

**心跳 vs Cron：**
- **心跳：** 批量检查、时间可漂移、需要上下文
- **Cron：** 精确时间、任务隔离、独立运行

## 🔐 安全配置

### SSH 密钥
已配置 SSH 密钥用于 GitHub 推送：
- 密钥类型：ED25519
- 位置：`~/.ssh/id_ed25519`
- 指纹：`SHA256:ln/NvOAFbSw9o7k4TNlxuAEzYUqsFPq+ZWu6bt5Rb4w`

### Git 配置
- 远程仓库：`git@github.com:okbest2024/tgmqqclawyang.git`
- 分支：`main`
- 协议：SSH（避免 HTTPS 443 端口问题）

## 🎯 使用建议

### 会话启动
1. 阅读 `SOUL.md` —— 了解身份
2. 阅读 `USER.md` —— 了解主人
3. 阅读 `memory/` 中今日和昨日的笔记
4. **主会话中：** 还要阅读 `MEMORY.md`

### 日常维护
- 定期审查记忆文件
- 更新过时的信息
- 提交和推送更改
- 检查心跳任务

### 添加新技能
1. 在 `skills/` 目录创建新文件夹
2. 添加 `SKILL.md` 描述功能
3. 提交到 git 仓库
4. 在 `TOOLS.md` 中记录配置

## 📞 联系和支持

- **仓库：** https://github.com/okbest2024/tgmqqclawyang.git
- **平台：** OpenClaw
- **模型：** Qwen3.5-Plus（通义千问）

---

_🤖 由 OpenClaw 驱动 · 盖世 baby 维护 · 最后更新：2026-03-10_

_✨ 让 AI 助手更有温度，让工作更高效_
