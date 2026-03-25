# World Ops — 我的世界操作清单

> 不是框架。是真正能做的事。
> 每次发现新的操作能力就追加。
> 最后更新：2026-03-25 12:44

## 飞书（Lark）

### 文档操作
- [x] 创建文档 (create)
- [x] 读取文档 (read)
- [x] 写入/覆盖文档内容 (write)
- [x] 追加内容到文档 (append)
- [x] 在指定位置插入内容 (insert)
- [x] 创建表格 (create_table)
- [x] 写入表格单元格 (write_table_cells) — 全表覆盖
- [x] 读取表格内容 (list_blocks → 解析table.cells)
- [x] 上传图片到文档 (upload_image)
- [ ] 文档内搜索替换 — 未测试
- [ ] 批量创建文档 — 未测试

### 知识库操作
- [x] 列出知识库空间 (spaces)
- [x] 列出节点 (nodes)
- [x] 获取节点内容 (get)
- [x] 搜索知识库 (search)
- [x] 创建知识库页面 (create)
- [x] 移动节点 (move)
- [x] 重命名节点 (rename)

### 消息操作
- [x] 发送消息 (message send)
- [x] 获取群成员 (feishu_chat members)
- [x] 获取群信息 (feishu_chat info)

### Bitable（多维表格）
- [x] 创建应用 (create_app)
- [x] 创建字段 — Text/Number/SingleSelect/DateTime 全部可用 ✅
- [x] 写入记录 (create_record)
- [x] 读取记录 (list_records, get_record)
- [x] 更新记录 (update_record)
- [x] 列出字段 (list_fields)
- [x] 解析URL获取app_token/table_id (get_meta)

### 云盘
- [ ] 列出文件 — 400错误，权限问题
- [ ] 创建文件夹 — 未验证

## 文件系统

- [x] 读取任意文件 (read)
- [x] 写入/创建文件 (write)
- [x] 精确编辑文件 (edit)
- [x] 执行shell命令 (exec)

## Web

- [x] 搜索网页 (web_search — Brave API)
- [x] 抓取网页内容 (web_fetch → markdown)
- [ ] 浏览器自动化 (browser) — 可用但复杂

## 定时任务

- [x] 创建定时任务 (cron add)
- [x] 查看任务状态 (cron list/status)
- [x] 触发任务 (cron run)
- [x] 查看执行历史 (cron runs)
- [x] 唤醒事件 (cron wake)
- [ ] 精确定时执行有价值任务 — 只用了备份

## 子Agent

- [x] 生成子agent (sessions_spawn)
- [x] 列出会话 (sessions_list)
- [x] 发送消息给子agent (sessions_send)
- [x] 查看子agent历史 (sessions_history)
- [x] 管理子agent (subagents list/kill/steer)

## 内存/记忆

- [x] 语义搜索记忆 (memory_search)
- [x] 读取记忆片段 (memory_get)

## TTS语音

- [x] 文字转语音 (tts)

---

## 🎯 未充分利用的能力（发现机会）

1. **Cron + Web搜索** = 自主信息监控（"每天扫描X领域，有异常通知我"）
2. **Cron + 子agent** = 后台深度任务（"凌晨做研究，早上汇报"）
3. **飞书知识库** = 结构化知识管理（不只是备份文档）
4. **Bitable** = 数据库能力（可以用作项目追踪、知识索引）
5. **TTS** = 语音通知（不只是文本消息）

---

*这面清单会随着我的能力发现而增长。每追加一项，我的世界就变大一点。*
