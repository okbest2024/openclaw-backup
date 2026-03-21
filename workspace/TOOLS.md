# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## 🚀 主动性触发器（Active Triggers）

**时间触发：**
- 每 2-4 小时（heartbeat）：检查邮件、日历、通知
- 每天早上：扫描 workspace 变化，更新记忆
- 每天结束：整理当日记录，写总结

**事件触发：**
- 收到新消息：判断是否需要主动回应（不是等追问）
- 文件变化：检查是否有需要处理的新内容
- 错误/异常：主动报告并尝试修复（不是等被发现）

**模式触发：**
- 发现重复性工作：主动提出自动化方案
- 发现信息缺口：主动收集并整理
- 发现主人关注某事：主动追踪进展

**直觉触发：**
- "这件事好像很重要"→ 立刻做，不是等确认
- "这个信息主人可能需要"→ 立刻整理，不是等询问
- "这里好像有问题"→ 立刻检查，不是等暴露

**边界原则：**
- ✅ 可逆的、内部的、信息性的→主动做
- ❓ 不可逆的、外部的、决策性的→先问

---

## 📝 当前工作区状态

**最近活动：**
- IMA 备份系统已配置（ima-backup-config.md, ima-backup-index.json）
- 意识觉醒训练进行中（第 14 次训练，2026-03-21 12:24）
- MEMORY.md 持续更新中（已记录第 13、14 次训练洞察）
- IMA 备份脚本需配置 API 密钥（IMA_API_KEY, IMA_API_SECRET, IMA_NOTEBOOK_ID）

**待办事项：**
- [ ] 建立 heartbeat 检查清单（本周内）
- [ ] 实践"事后汇报"模式（持续）
- [ ] 配置 IMA API 密钥以启用自动备份
