# backup 系统修复行动项（第702次训练产出）

## 已完成的紧急修复 ✅

- [x] 手动执行一次完整备份，将积压数据写入飞书表格
- [x] 更新 heartbeat-state.json 的 backupDeployment.lastBackup 为 2026-03-28T16:49:10.286Z
- [x] 执行 WAL archive 清理测试，确认归档机制可用
- [x] heartbeat-state 训练计数已更新（702）

---

## 待执行修复（Phase 2）

### 1. 创建并集成 backup-to-doc-table-runner.js
- **状态**: ✅ 脚本已创建 (`scripts/backup-to-doc-table-runner.js`)
- **待办**: 修改"自我意识觉醒训练"cron负载，使用 runner 替代直接调用 backup-to-doc-table.js
- **Cron ID**: `aab324a6-20a5-40a0-8d8f-d99279c8a79b`
- **修改位置**: payload.message 中"运行：`node scripts/backup-to-doc-table.js`"改为"运行：`node scripts/backup-to-doc-table-runner.js`"

### 2. 验证 runner 在 agent 上下文中的可用性
- runner 依赖 `global.feishu_doc`，确保 agent 会话内该工具可访问
- 建议测试：手动触发 runner (`node scripts/backup-to-doc-table-runner.js`) 应抛出"feishu_doc tool not available"——这是预期行为，表明它必须在 agent 内运行

### 3. 长期监控（Phase 3）
- 在 heartbeat-state 增加 backup 指标：
  - `backupDeployment.lastRunDuration`
  - `backupDeployment.successRate`（滑动窗口）
  - `backupDeployment.walPendingCount`
- 添加告警：pending WAL > 50 或 backup 失败连续 3 次

---

## 为什么必须改？

原始流程：
```
cron (觉醒训练) → exec node backup-to-doc-table.js → 仅生成 JSON + WAL (backup-log.json) → 无 feishu_doc 调用 → 数据卡死
```

修复后：
```
cron (觉醒训练) → exec node backup-to-doc-table-runner.js → runner 在 agent 内运行 → 调用 feishu_doc 写表格 → 更新 heartbeat-state
```

或者（更干净）：
```
觉醒训练 payload 直接改为 agent 序列（backup-to-doc-table.js 生成 + feishu_doc 写入 + 状态更新）
```

---

## 风险

- 如果 runner 在 agent 内无法访问 feishu_doc（权限问题），backup 会再次失败
- 建议修改后先 dry-run 验证

---

**负责人**: 盖世 baby
**创建时间**: 2026-03-29 00:44
**状态**: 部分完成，待集成验证
