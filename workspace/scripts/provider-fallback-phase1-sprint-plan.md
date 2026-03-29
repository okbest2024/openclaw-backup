# Provider Fallback Phase 1 - 2 Day Sprint Plan
**创建时间**: 2026-03-29 15:55 (Session 734)  
**来源**: 第一性原理训练第736次（时间盒优化 + 帕累托分析）  
**目标**: 48小时内完成最小可行交付，验证fallback机制有效性

---

## 完成度标准（重新定义）
**Phase 1 最小可行完成** = ✅ 1个核心cron + 完整验证 + 监控 + 文档 + 置信度 ≥ 90%

---

## 3大核心交付

### 交付1: Daily Reflection Cron 集成 + 验证
- **任务**: 修改 `scripts/daily-reflection.js` 使用 `executeWithFallback`
- **时间**: Day1 14:00-18:00 (4h)
- **验收**:
  - ✅ 模拟OpenRouter故障（网络超时/402错误），自动切换到StepFun成功
  - ✅ 输出质量评分 ≥ 3.5/5.0（基于格式正确性+内容完整性）
  - ✅ 切换日志写入 `logs/provider-switch-log.json`
  - ✅ 两次连续故障模拟均成功

**实现步骤**:
1. 引入 `executeWithFallback.js`
2. 配置 models: [{provider: 'openrouter', model: 'xiaomi/mimo-v2-pro'}, {provider: 'stepfun', model: 'step-3.5-flash'}]
3. 包裹现有LLM调用逻辑
4. 添加 switch 日志记录
5. 本地测试（模拟错误代码）

---

### 交付2: Provider Quota Tracker
- **任务**: 创建 `memory/provider-quota-tracker.json` + 每日预算检查逻辑
- **时间**: Day1 10:00-11:00 (1h) + Day2 集成到backup（可选）
- **预算**: 主预算 $0/日（已耗尽），fallback 总预算 $0.5/日（免费模型）
- **验收**:
  - ✅ 文件存在且包含 dailyLimit、totalLimit、currentUsage
  - ✅ heartbeat 检查时读取并更新 usage
  - ✅ 超预算时自动禁用fallback并告警

**配置文件示例**:
```json
{
  "openrouter": {"dailyLimit": 0, "totalLimit": 0, "currentDaily": 0},
  "stepfun": {"dailyLimit": 0.5, "totalLimit": 5.0, "currentDaily": 0.0},
  "bailian": {"dailyLimit": 0.5, "totalLimit": 5.0, "currentDaily": 0.0}
}
```

---

### 交付3: Execution Capabilities Design 文档
- **任务**: 创建 `memory/execution-capabilities.json` + 文档说明
- **时间**: Day1 08:00-10:00 (2h) 并行思考
- **内容**:
  - daily-reflection: 需要 text-generation, 上下文窗口 8k, JSON输出支持
  - heartbeat-report: 需要 text-generation + summary, 较低质量要求
  - backup-to-doc: 需要 稳定API、无速率限制、支持表格写入
- **验收**:
  - ✅ 每个cron的能力需求明确列出
  - ✅ 可用于后续 fallback 模型选择（能力匹配度评分）

---

## 关键排除（Phase 2 再处理）
- ❌ Heartbeat cron 和 Backup cron 的集成（可各延后3-4h）
- ❌ 全量监控仪表盘（Phase 2）
- ❌ 复杂 WAL 事务保证（当前使用简单append-log）
- ❌ 输出规范化（JSON Schema统一）- 延后
- ❌ 回溯历史 provider-switch-log 分析

---

## 2日时间盒（16h可用工作时间）

### Day 1 (8h)
```
08:00-10:00  C: Execution Capabilities 设计 (2h)
10:00-12:00  B: Quota Tracker 创建 + heartbeat 集成 (2h + 1h缓冲)
12:00-14:00  Lunch
14:00-18:00  A1: Daily Reflection 集成 + 本地测试 (4h)
   - 14:00-15:30 代码实现
   - 15:30-16:30 单元测试
   - 16:30-18:00 故障模拟（2次）
```

**Day 1 结束验收**:
- ✅ C 完成，execution-capabilities.json 写入
- ✅ B 完成，provider-quota-tracker.json 写入且 heartbeat 可读
- ✅ A1 集成完成，本地测试通过（未模拟real故障）

---

### Day 2 (8h)
```
08:00-12:00  A2: Heartbeat-report 集成 (4h) - 若 Day1 进度延迟则跳过
   - 09:00-11:00 代码实现
   - 11:00-12:00 简单测试（不完整）
12:00-14:00  Lunch
14:00-18:00  D: 端到端故障模拟 + 修复迭代 (4h)
   - 14:00-15:00 模拟 OpenRouter 网络错误（断开网络/返回502）
   - 15:00-16:00 模拟 OpenRouter 401/402 错误（篡改API响应）
   - 16:00-17:00 记录故障表现，修复发现的问题
   - 17:00-18:00 第二次完整验证，确保通过
```

**Day 2 结束验收**:
- ✅ Daily Reflection 完成2次独立故障模拟，全部成功
- ✅ 切换日志记录完整
- ✅ 预算追踪器有效（可手动触发超预算验证）
- ✅ heartbeat 更新 providerStatus 状态
- ✅ 置信度评估 ≥ 90%

---

### Day 3 弹性（如有必要）
```
仅处理重大问题：
- A3: Backup cron 集成（3-4h）
- E: 逐步部署（将验证通过的Daily Reflection上线生产）
- 监控告警配置（heartbeat error reporting）
```

---

## 依赖检查

| 前置条件 | 状态 | 检查方法 | 备用方案 |
|----------|------|----------|----------|
| executeWithFallback.js 可用 | ✅ 已实现（scripts/execute-with-fallback.js） | `node scripts/execute-with-fallback.js --help` | 从backup直接复制逻辑 |
| daily-reflection.js 存在 | ✅ 存在（cron任务） | `ls scripts/daily-reflection.js` | 使用heartbeat-report替代集成 |
| provider status 监控就绪 | ✅ 已有providerStatus结构 | 检查heartbeat-state.json | 临时使用独立同步脚本 |
| StepFun API 密钥有效 | ⚠️ 待验证 | 手动测试API调用 | 使用bailian作为fallback |
| 日志目录存在 | ✅ logs/ 已存在 | `ls logs/` | 创建临时目录 |

---

## 质量门禁

- **禁止**: 跳过故障模拟（D任务）
- **禁止**: 集成时不记录provider-switch-log
- **禁止**: 未配置预算上限就启用fallback
- **必须**: 所有修改提交前本地测试通过
- **必须**: 变更Documentation（至少更新本文档状态）

---

## 成功标准（最小可行）

| 指标 | 目标值 | 验证方法 |
|------|--------|----------|
| Daily Reflection 可用性 | ≥ 99% (fallback启用后) | 故障模拟2/2通过 |
| 故障切换延迟 | ≤ 30s (primary失败→fallback开始) | 日志时间戳差值 |
| 输出质量评分 | ≥ 3.5/5.0 | 人工评审 |
| 预算合规性 | ≤ $0.5/日 | provider-quota-tracker 记录 |
| 置信度 (B3) | ≥ 90% | 贝叶斯更新后验 |

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| StepFun API 不稳定 | 中 | 高 | 准备bailian作为第二fallback，测试两者 |
| 故障模拟破坏生产数据 | 低 | 高 | 使用测试隔离环境或dry-run模式 |
| 代码集成引入bug | 中 | 中 | 保留原版daily-reflection备份，增量修改 |
| 时间估算不足 | 高 | 中 | 严格时间盒，超时则裁剪A2或A3 |
| fallback输出格式差异 | 中 | 中 | executionCapabilities定义后调整解析逻辑 |
| 成本追踪器失效 | 低 | 低 | 使用双重检查（本地文件+heartbeat-state） |

---

## 变更记录（Sprint期间）

| 时间 | 变更 | 原因 |
|------|------|------|
| 2026-03-29 15:55 | 创建本计划 | 第一性原理训练输出 |

---

**下一步**: 立即执行 Day 1 任务 C (Execution Capabilities 设计)
