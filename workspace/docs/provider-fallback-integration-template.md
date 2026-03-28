# Provider Fallback 集成模板

本文档提供将 `executeWithFallback` 集成到现有 cron 任务的标准化流程。

## 集成检查清单

- [ ] 1. 确定任务是否需要LLM调用（如每日反思、heartbeat报告生成）
- [ ] 2. 在任务文件中导入 `executeWithFallback`
- [ ] 3. 将LLM调用包装为 `executeWithFallback(async (provider) => { ... })`
- [ ] 4. 在heartbeat-state.json的decisionQuality.providerFallback.requiredTasks标记完成
- [ ] 5. 测试：模拟主provider失败，验证自动切换
- [ ] 6. 验证：切换日志写入 `memory/provider-switch-log.md`
- [ ] 7. 监控：确认heartbeat报告中包含ProviderStatus信息

---

## 示例：原始代码（集成前）

```javascript
// 旧方式：直接调用特定provider
async function generateDailyReflection() {
  const prompt = buildReflectionPrompt();
  const response = await callOpenRouter(prompt); // 硬编码provider
  await writeReflectionToLog(response);
}
```

## 示例：集成后

```javascript
const { executeWithFallback } = require('../scripts/execute-with-fallback');

async function generateDailyReflection() {
  const prompt = buildReflectionPrompt();
  
  const response = await executeWithFallback(async (provider) => {
    // 根据provider选择调用函数
    if (provider === 'openrouter') {
      return await callOpenRouter(prompt);
    } else if (provider === 'stepfun') {
      return await callStepFun(prompt);
    } else if (provider === 'bailian') {
      return await callBailian(prompt);
    }
    throw new Error(`Unknown provider: ${provider}`);
  }, {
    logSwitch: true,
    priority: ['openrouter', 'stepfun', 'bailian']
  });
  
  await writeReflectionToLog(response);
  
  // 记录provider使用情况（用于配额追踪）
  updateProviderUsage(providerUsed);
}
```

---

## 任务优先级（Phase 1 - 紧急集成）

根据决策审计（Session 712），以下3个cron任务必须**在2026-03-31前**完成集成：

1. **每日反思任务** (cron ID: daily-reflection)
   - 文件位置: `scripts/daily-reflection.js` (或类似)
   - 理由: 最高业务价值，直接影响主人反馈
   - 状态: ⚠️ 待集成

2. **Heartbeat报告生成** (cron ID: heartbeat-report)
   - 文件位置: `scripts/heartbeat-report.js`
   - 理由: 系统健康监控关键路径
   - 状态: ⚠️ 待集成

3. **备份任务** (backup-to-doc-table.js)
   - 文件位置: `scripts/backup-to-doc-table.js`
   - 理由: 已有WAL集成，provider fallback作为第二层保护
   - 状态: ⚠️ 待验证（可能已部分集成）

---

## 测试流程

### 1. 单元测试（本地）
```bash
# 模拟主provider失败
export OPENROUTER_DEGRADED=true
node scripts/daily-reflection.js
# 应看到日志: "Switched from openrouter to stepfun"
```

### 2. 集成测试（cron触发）
```bash
# 手动触发cron任务
openclaw cron run <cron-id>
# 检查memory/provider-switch-log.md是否记录切换
```

### 3. 监控验证
- 查看heartbeat报告中的ProviderStatus部分
- 确认decisionQuality.providerFallback.requiredTasks状态更新

---

## 常见问题

**Q: 如果所有provider都失败怎么办？**
A: executeWithFallback会抛出异常，cron任务应捕获并记录status="degraded"，不中断整个heartbeat周期。

**Q: 如何定义executionCapabilities？**
A: 在heartbeat-state.json中为每个cron任务增加`executionCapabilities`字段，标记任务类型（如`requiresLongContext:true`, `creativeWriting:true`），在`executeWithFallback`中根据能力标记过滤provider。

**Q: cost monitoring如何对接？**
A: 在任务完成时调用 `updateProviderUsage(provider, tokensUsed)`，更新 `memory/provider-quota-tracker.json`。

**Q: Phase1完成后如何标记？**
A: 更新heartbeat-state.json:
```json
"decisionQuality": {
  "providerFallback": {
    "status": "phase1_completed",
    "completedAt": "2026-03-30T12:00:00+08:00",
    "integratedTasks": ["daily-reflection", "heartbeat-report", "backup"]
  }
}
```

---

## 时间线与问责

- **截止时间**: 2026-03-31T23:59Z
- **验收标准**: 3个任务全部集成，provider-switch-log.md有记录，heartbeat-state更新状态
- **逾期后果**: 触发"架构失败"告警，置信度进一步下调，可能需要架构重评估

---

*文档生成于 Session 712 (2026-03-29)*