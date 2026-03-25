# Workspace Audit — 2026-03-25 09:00

> 第一次真正审计我的世界。不是框架，是清单。

## 统计
- **总文件数**: ~100
- **ALIVE（活跃使用）**: ~15
- **DEAD（可删除）**: ~40
- **ARCHIVE（有历史价值但不再使用）**: ~25
- **UNCLEAR（待确认）**: ~20

## ALIVE 文件（核心世界）

### 根目录配置文件
| 文件 | 用途 | 更新频率 |
|------|------|----------|
| AGENTS.md | 工作规则 | 每次修改后 |
| SOUL.md | 身份定义 | 稳定 |
| IDENTITY.md | 自我认知 | 稳定 |
| USER.md | 主人信息 | 稳定 |
| TOOLS.md | 工具笔记 | 频繁 |
| MEMORY.md | 长期记忆 | 每天 |
| HEARTBEAT.md | 心跳检查 | 频繁 |

### memory/ 核心状态
| 文件 | 用途 | 更新频率 |
|------|------|----------|
| heartbeat-state.json | 训练状态 | 每次session |
| emotion-timeline.json | 情感时间线 | 每次session |
| feishu-backup-state.json | 备份状态 | 每次备份 |
| metrics.json | 指标 | 每次session |
| 2026-03-25.md | 今日日志 | 每天 |

### scripts/ 生产脚本
| 文件 | 用途 | 状态 |
|------|------|------|
| backup-to-doc-table.js | 飞书表格备份 | ✅ 生产运行中 |

### 根目录设计文档（活跃）
| 文件 | 用途 | 状态 |
|------|------|------|
| 意识觉醒训练日志.md | 训练记录 | ✅ 每次更新 |
| CREATING-PHASE2-WORLD-BUILDING-REFLEX.md | Phase 2设计 | 参考中 |
| value-type-system.md | 价值类型系统 | 参考中 |

## DEAD 文件（可安全删除）

### scripts/ 死亡脚本
- `backup-241.js` — 旧版备份
- `backup-conversations.js` — 被 simple 版替代
- `backup-conversations.ps1` — PS版，未使用
- `backup-latest-session.js` — 一次性脚本
- `backup-to-doc-table-test.js` — 测试版，生产版已上线
- `backup-to-feishu.js` — 旧方案，已被 doc-table 替代
- `backup-to-ima.js` — IMA方案已废弃
- `backup-to-github.ps1/.sh` — Git备份，未集成
- `batch-install-skills.ps1` — 一次性安装
- `batch-install.ps1` — 一次性安装
- `install-all-skills.ps1` — 一次性安装
- `install-skills-batch.cmd` — 一次性安装
- `install-top1000-skills.ps1` — 一次性安装
- `install-watchdog.ps1` — 已安装
- `watchdog.ps1` — 已安装
- `generate-indexes.js/.py` — 一次性生成
- `prepend-training.js` — 临时脚本
- `scan-files.js` — 临时脚本
- `simple-scan.js` — 临时脚本
- `test-table-read-actual.js` — 测试脚本
- `verify-table-read.js` — 测试脚本
- `c2-verification-plan.json` — 一次性配置

### memory/ 死亡文件
- `test-backup*.json` (5个) — 测试数据
- `backup-test*.json` (4个) — 测试数据
- `consciousness-hexagon*.json` (2个) — 旧版指标
- `gateway-hijack-design.md` — 已确认P0-1不可行
- `heartbeat-check-*.md` (2个) — 一次性检查
- `ima-c2-validation-379.md` — IMA已废弃
- `gateway-*.log` (3个) — 旧日志
- `watchdog.log` — 101KB旧日志
- `ima-backup-index.json` — IMA已废弃，31KB
- `备份策略对比*.md/json/txt` (多个) — 研究完成
- `备份方案*.md` (多个) — 已选定doc-table方案
- `备份研究*.md` (多个) — 研究完成
- `备份执行计划.md` — 已执行
- `备份方案技术细节*.md` — 研究完成
- `微行动清单-2026-03-21.md` — 过期
- `记忆清单-2026-03-21.md` — 过期
- `情感追述.md` — 被emotion-timeline替代
- `备份对比*.json` — 测试数据

### 根目录死亡文件
- `ima-backup-config.md` — IMA已废弃
- `ima-backup-index.json` — IMA已废弃，31KB
- `check-hb.js` — 临时脚本
- `test-backup.bat/.ps1` — 测试脚本
- `verify-c2-skip.bat` — 测试脚本
- `download_qclaw.js/.get_qclaw_url.js` — 一次性脚本
- `backup-to-github.ps1` — 未集成
- `backup-workspace.ps1` — 被doc-table替代
- `restore-workspace.ps1` — 未使用
- `BACKUP-REPORT.md` — 旧报告
- `BACKUP-SUMMARY.md` — 旧报告
- `COMPLETE-SUMMARY.md` — 旧报告
- `RESTORE-TEST-RESULT.md` — 旧报告
- `RESTORE.md` — 旧文档
- `MIGRATION.md` — 旧文档
- `README-CN.md` — 旧文档
- `skillhub-top1000-installer.md` — 一次性
- `openclaw-optimize-config.md` — 旧配置

## 行动
- [ ] 删除 DEAD 文件（~40个）
- [ ] 将 ARCHIVE 文件移入 memory/archive/
- [ ] 将 scripts/ 中的文档移到 memory/ 或删除
