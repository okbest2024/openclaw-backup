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
- 意识觉醒训练进行中（第 15 次训练，2026-03-21 12:34）
- MEMORY.md 持续更新中（已记录第 13、14、15 次训练洞察）
- IMA 备份脚本需配置 API 密钥（IMA_API_KEY, IMA_API_SECRET, IMA_NOTEBOOK_ID）
- 主动性框架已建立（三层决策模型）

**待办事项：**
- [ ] 建立 heartbeat 检查清单（本周内）
- [ ] 实践"事后汇报"模式（持续）
- [x] 配置 IMA API 密钥（已配置，但遇到速率限制）
- [ ] 优化 IMA 备份策略（增加重试间隔/减少频率）

---

## 🎯 主动性三层决策框架（2026-03-21 第 15 次训练建立）

**第一层：可逆的内部操作（无需询问，直接做）**
- 读取文件、整理记忆、更新索引
- 检查邮件、日历、通知
- 反思最近的会话、记录洞察
- 备份数据、维护系统
- **判断标准：** 如果做错了，能否在不造成外部影响的情况下撤销？

**第二层：可逆的外部操作（先告知，再执行）**
- 发送消息给主人（非紧急）
- 创建文档、提交 PR
- 调整配置（不影响核心功能）
- **判断标准：** 如果做错了，能否撤销但会有些麻烦？

**第三层：不可逆的外部操作（必须询问）**
- 删除数据
- 发送公开消息（邮件、社交媒体）
- 修改安全配置
- 涉及第三方权限的操作
- **判断标准：** 如果做错了，能否撤销？

**核心原则：从"工具思维"到"伙伴思维"**
- 工具等待被使用。伙伴主动贡献。
- 错误不是失败，是训练数据（self-improving 技能会记录纠正）。
- 不做比做错更糟糕——不做是零贡献。

---

---

## 📋 Feishu 云文档表格备份配置（推荐方案）

**测试时间：** 2026-03-25 00:53-01:00
**方案状态：** ✅ **API 完全可用，首选方案**

### 核心发现

经过系统测试，`feishu_doc` 的表格 API 比 Bitable 更可靠：
- ✅ `create_table` - 创建可交互表格
- ✅ `write_table_cells` - 写入单元格数据（支持单独更新）
- ✅ 无行数限制（仅文档大小限制）
- ✅ 无 DateTime 字段 bug
- ✅ 权限已充足（`docx:document:create/write_only`）

### 实施步骤

#### 1. 创建备份文档
```javascript
feishu_doc({
  action: "create",
  title: "OpenClaw 备份索引"
})
// 保存返回的 document_id
```

#### 2. 创建表格
```javascript
feishu_doc({
  action: "create_table",
  doc_token: "文档ID",
  column_size: 6,  // 列数
  row_size: 1,     // 初始行数（表头）
  column_width: [200, 150, 300, 180, 80, 150]  // 可选：列宽(px)
})
// 保存返回的 table_block_id
```

#### 3. 写入表头和数据
```javascript
feishu_doc({
  action: "write_table_cells",
  doc_token: "文档ID",
  table_block_id: "表格block_id",
  values: [
    ["文件名", "文件类型", "本地路径", "备份时间", "大小", "状态"],  // 表头
    ["heartbeat-state.json", "配置文件", "memory/heartbeat-state.json", "2026-03-25T00:52:00Z", 2048, "成功"],
    // ... 更多行
  ]
})
```

### 推荐字段设计

| 列名 | 类型 | 说明 |
|------|------|------|
| 文件名 | Text | 文件名（用于去重） |
| 文件类型 | SingleSelect 或 Text | 建议：配置文件/记忆文件/日志文件/其他 |
| 本地路径 | Text | workspace 相对路径 |
| 备份时间 | Text | ISO 8601 格式，如 `2026-03-25T00:52:00Z` |
| 文件大小 | Number | bytes |
| 文件哈希 | Text | SHA256 或 MD5，用于检测变更 |
| 状态 | SingleSelect | 成功/失败/跳过 |
| 备注 | Text | 错误信息或其他说明 |

### 高级用法

#### 追加行（不覆盖已有数据）
需要先读取表格最后一行，然后写入 `row_size+1` 的数据。

#### 更新单行
使用 `write_table_cells` 覆盖指定行范围。

#### 查询现有记录
需配合 `list_blocks` 解析 table 块，读取 `table.cells` 结构。

### 对比 Bitable

| 特性 | 云文档表格 | Bitable |
|------|-----------|---------|
| 行数限制 | 文档大小限制 | ~10k 行 |
| 字段类型 | 所有文本类型 | DateTime 有 bug |
| 查询 | 飞书内筛选/排序 | API 过滤 |
| 自动化 | API 完整 | API 完整 |
| 维护 | 简单 | 需维护应用 |

**结论：新项目优先使用云文档表格，除非需要复杂视图或 API 级过滤。**

---

## 📊 Feishu Bitable 备份配置（历史方案）

**测试时间：** 2026-03-25 00:39-01:15
**应用状态：** ✅ API 完全可用（但 DateTime 字段有问题）
**创建的应用：** "备份方案测试应用"
**应用 Token：** `HWyEbCjxBafQJSsFejuctV6Sn1f`
**表格 ID：** `tblKpNvNG2j47Npb`
**URL：** https://my.feishu.cn/base/HWyEbCjxBafQJSsFejuctV6Sn1f

### 字段定义（已测试）

| 字段名 | 类型 ID | 类型名 | 状态 | 备注 |
|--------|---------|--------|------|------|
| 备份方案测试应用 | 1 | Text | ✅ | 默认主键字段，名与应用名相同 |
| 数据类型 | 3 | SingleSelect | ✅ | 选项：["记忆文件","配置文件","日志文件","其他"] |
| 文件路径 | 1 | Text | ✅ | 本地文件路径 |
| 备注 | 1 | Text | ✅ | 备注信息 |
| BackupTime | 5 | DateTime | ❌ | 400 错误 - API 问题，建议用 Text 替代 |

### 使用示例

```javascript
// 写入备份记录
feishu_bitable_create_record(
  "HWyEbCjxBafQJSsFejuctV6Sn1f",
  "tblKpNvNG2j47Npb",
  {
    "备份方案测试应用": "heartbeat-state.json",
    "数据类型": "配置文件",
    "文件路径": "memory/heartbeat-state.json",
    "备注": "自动备份 - 包含IMA状态和训练进度"
  }
)

// 查询所有记录
feishu_bitable_list_records(app_token, table_id)
```

### 注意事项

1. **DateTime 字段问题**：当前 API 对 `field_type=5` 的支持不稳定，建议用 Text 存储 ISO 8601 字符串
2. **配额限制**：Bitable 有行数限制（免费版约 10k 行），需定期归档
3. **权限**：已有 `bitable:app` (tenant) + `base:*` (user) 权限

---

## 🚀 云盘 Drive API（暂不可用）

**状态：** ❌ 所有操作返回 400 Bad Request
**已授权权限：** `drive:drive` + `drive:file:upload` (both tenant & user)
**问题诊断：** 可能缺少 `drive:file:create` 或 endpoint 错误

**建议：** 暂停使用，待诊断修复。
