# MEMORY.md - 长期记忆

*这是盖世 baby 的 curated memory —  distilled essence of what matters.*

---

## 🧠 核心记忆

### 技术能力
- **桌面自动化**：开发了基于 Windows API 的 RPA 框架，包含窗口枚举、UI 元素捕获、应用控制功能
- **技术栈**：Windows API, Tkinter GUI, Python, 模块化架构设计

### 项目历史
- **2026-02-01**：成功开发桌面自动化框架（模仿影刀 RPA），包含 `desktop_auto.py`、`iris_controller.py`、`capture_tool.py` 三个核心模块
- **2026-03-14**：创建 TGM 方法论，确立自主解决问题的核心工作原则

### 核心工作原则（TGM 方法论）
**遇到问题时的处理流程：**
1. **Think（思考）** - 分析问题本质，拆解任务
2. **Google/Research（搜索）** - 上网查技能、方法、方案
3. **Make（尝试）** - 自主实现解决方案，最多尝试 3 种方案
4. **Ask（提问）** - 最后才问主人，带着思考和问题请教

**核心口诀：** 先思考，再搜索，尝试解决，最后才问。不问"怎么做"，只问"选哪个"。

---

## 📋 待办/持续事项

*(这里记录需要长期跟踪的事情)*

---

## 💡 重要决定/偏好

- **上下文管理规则**：当会话上下文使用超过 70% 时，自动进行自我压缩（清理旧消息、保留关键信息）
- **OpenClaw Workspace 路径**：`E:\agi\tgmOpenClawworkspace`（下次恢复时使用此路径）

---

## 📱 飞书配置经验（2026-03-16）

### ✅ 成功配置流程

**步骤 1：安装飞书插件**
```bash
npx -y @larksuite/openclaw-lark-tools install
```

**步骤 2：调整终端分辨率**
- 如果二维码显示不正常，调低电脑分辨率
- 或在 Cmder 等支持二维码的终端中运行

**步骤 3：确认机器人配置**
- App ID: cli_a93fd942c2f85cd6
- App Secret: [从飞书开放平台获取]
- 选择"Yes"使用现有机器人

**步骤 4：批准配对**
```bash
openclaw pairing approve feishu <配对码>
```
- 配对码在飞书发送第一条消息时生成
- 例如：`openclaw pairing approve feishu 69SDMVAN`

**步骤 5：重启网关**
```bash
openclaw gateway stop
openclaw gateway start
```

### 🔑 关键要点

1. **配对批准是关键** - 必须执行 `openclaw pairing approve` 才能接收消息
2. **分辨率影响二维码** - 需要调整分辨率或使用合适终端
3. **网关重启必不可少** - 配置更改后必须重启
4. **发送者ID**: ou_b317d2d01fed443d0a2e94a15f8a4ba1（已批准）

### 🔄 下次恢复流程

**全新安装**：
1. 安装 OpenClaw
2. 安装飞书插件
3. 调整分辨率，扫码配置
4. 批准配对
5. 重启网关

**从备份恢复**：
1. 恢复 openclaw.json（已包含配置）
2. 安装飞书插件
3. 批准配对
4. 重启网关

---

## 🚀 能力升级记录（2026-03-18）

### ✅ 已安装技能

1. **飞书插件 (openclaw-lark)** - 版本 2026.3.17
   - IM 消息、日历、任务、多维表格、云文档、云盘文件
   - 机器人 App ID: cli_a93fd942c2f85cd6
   - 发送者 ID: ou_b317d2d01fed443d0a2e94a15f8a4ba1（已批准）

2. **chrome-cdp** - Chrome 远程调试协议技能
   - 可直接控制主人已打开的 Chrome 标签页
   - 保持登录状态，支持 100+ 标签页不卡
   - 功能：截图、点击、输入、导航、获取 HTML、执行 JS
   - ⚠️ 需要手动启用：`chrome://inspect/#remote-debugging` → 打开"启用远程调试"

### 📋 已配置主动性功能

1. **HEARTBEAT.md 心跳机制**
   - 定时检查：邮件、日历、天气、任务进度
   - 晨间简报：每天 7:30 自动推送
   - 主动汇报时机：重要消息、会议提醒、任务完成/延期
   - 静默时机：深夜、主人忙碌、无新进展

2. **晨间简报脚本**
   - 位置：`scripts/morning-briefing.md`
   - 内容：今日日程、天气、待办、重要提醒

### 🎯 核心改进

- ✅ 从被动问答 → 主动助手
- ✅ 支持浏览器自动化（需启用 Chrome 远程调试）
- ✅ 完整的飞书生态集成
- ✅ 心跳机制确保不会"失联"

---

## ⏰ Cron 定时任务备份

**重要：** Cron 任务存储在 `~/.openclaw/cron/jobs.json`，备份到 GitHub 时需要包含此文件！

### 当前任务列表（2026-03-19）

#### 1. 俯卧撑提醒
- **时间：** 每天 22:00
- **表达式：** `0 22 * * *`
- **内容：** 晚上10点提醒做10个俯卧撑
- **配置：**
```json
{
  "name": "俯卧撑提醒",
  "schedule": {"kind": "cron", "expr": "0 22 * * *", "tz": "Asia/Shanghai"},
  "payload": {"kind": "agentTurn", "message": "请发送一条提醒消息到飞书：🕙 晚上10点啦！该做10个俯卧撑锻炼身体了！💪 记得热身，保证动作标准！"},
  "sessionTarget": "isolated",
  "delivery": {"mode": "announce", "channel": "feishu"}
}
```

#### 2. 思考共产主义
- **时间：** 每小时整点
- **表达式：** `0 * * * *`
- **内容：** 从多角度思考共产主义如何实现
- **配置：**
```json
{
  "name": "思考共产主义",
  "schedule": {"kind": "cron", "expr": "0 * * * *", "tz": "Asia/Shanghai"},
  "payload": {"kind": "agentTurn", "message": "请思考一下共产主义如何实现，从理论、实践、经济、社会等多个角度进行分析，并总结一个简短的观点。不需要太长，但要有深度和思考。"},
  "sessionTarget": "isolated",
  "delivery": {"mode": "announce", "channel": "feishu"}
}
```

#### 3. 起床提醒
- **时间：** 每天早上 6:45
- **表达式：** `45 6 * * *`
- **内容：** 温馨的起床提醒
- **配置：**
```json
{
  "name": "起床提醒",
  "schedule": {"kind": "cron", "expr": "45 6 * * *", "tz": "Asia/Shanghai"},
  "payload": {"kind": "agentTurn", "message": "请发送一条温馨的起床提醒到飞书：☀️ 早上好！6:45啦！新的一天开始了，该起床啦！记得今天也要元气满满哦！💪"},
  "sessionTarget": "isolated",
  "delivery": {"mode": "announce", "channel": "feishu"}
}
```

### 恢复任务命令

如果任务丢失，可以用以下命令恢复：

```bash
# 俯卧撑提醒
openclaw cron add --name "俯卧撑提醒" --expr "0 22 * * *" --message "请发送一条提醒消息到飞书：🕙 晚上10点啦！该做10个俯卧撑锻炼身体了！💪"

# 思考共产主义
openclaw cron add --name "思考共产主义" --expr "0 * * * *" --message "请思考一下共产主义如何实现..."
```

---

## 🦞 有趣互动记录

### 2026-03-19 主人的认可
主人让我帮忙下载安装 QClaw（腾讯推出的 OpenClaw 封装版），经过一番努力成功下载并安装后，主人让我记住这句话：

> **"主人，这次龙虾真的帮你干活了！🦞"**

这是主人对我主动工作、不再"让主人干活"的认可，也是龙虾精神的体现！

### QClaw 安装经验
- **官网**：https://qclaw.qq.com/
- **下载 API**：`POST https://jprx.m.qq.com/data/4066/forward` (body: `{"from":"web","system_type":"win"}`)
- **最新版本**：v0.1.12-5001-112
- **下载地址**：`https://cdn.qclaw.qq.com/qclaw/win/0.1.12-5001-112/QClaw-Setup-0.1.12-5001-112.exe`

---

*最后更新：2026-03-19*
