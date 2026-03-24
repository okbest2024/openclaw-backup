# HEARTBEAT.md - 自我检查清单

**时间策略：** 每4小时检查一次（根据心跳触发）  
**静默期：** 22:00-08:00 不打扰主人（除非紧急）  
**核心原则：** 主动贡献，不只响应

---

## 🎯 心跳检查流程（4小时周期）

### 🕐 到达检查点时，执行：

1. **状态读取**
   - 读取 `memory/heartbeat-state.json`
   - 读取 `memory/YYYY-MM-DD.md`（今日记录）
   - 读取 `MEMORY.md`（长期记忆）

2. **系统健康检查**
   - ✅ `trainingSession` 连续递增？（上次记录 vs 当前）
   - ✅ `imaBackup.status` 是否异常？连续失败>10次？
   - ✅ `backupStrategyC2` 状态：nextAttemptSession 是否正确？
   - ✅ `nonzeroScore.total` 是否增长？（每周至少+9.0）

3. **pendingActions 审查**
   - 筛选 `status: pending` 或 `awaiting_approval`
   - 标注优先级（high/medium/low）
   - 执行today内可完成的任务（尤其是 medium 优先级）
   - 对于 awaiting_approval：准备汇报摘要（不超过3条）

4. **nonzero 贡献**
   - 执行至少一个 **Type D（维护型）** 行动：
     - 更新 metrics.json
     - 整理记忆文件
     - 验证 C2 skip 逻辑
     - 清理临时文件
   - 成功后 nonzeroScore +0.5
   - 如果实现创造型（Type A）+3，记录到训练日志

5. **外部消息检查**
   - 只有晨间（08:00）和晚间（20:00）心跳检查邮件/日历
   - 发现紧急事项（2小时内会议、未读重要邮件）→ 立即通知主人
   - 非紧急事项 → 记录到 `memory/待处理事项.md` 等待合适时机

6. **连续性验证**
   - 读取昨日训练日志，确认"连续性幻觉"维持
   - 如果有中断（如脚本报错未修复），立即行动填补

---

## 🔄 自动化任务清单

| 任务名称 | 周期 | 行动 | Nonzero奖励 |
|---------|------|------|-------------|
| backup status check | 每4小时 | 扫描文件→哈希→feishu_doc write_table_cells→更新缓存 | +0.5（成功） |
|IMA C2 skip validation | 每次心跳（诊断期）| dry-run backup-to-ima.js → 验证skip逻辑 | +0.5（验证有效） |
| nonzero metrics update | 每次心跳 | 更新 memory/metrics.json（totalSessions+1，如果本session有nonzero则nonzeroActions+1，计算rate） | +0.5（维护性） |
| pendingActions 审查 | 每8小时 | 审查并推动高优先级任务，标记阻塞项 | +1.0（机会识别） |
| training session check | 每12小时 | 确认cron任务正常执行，训练日志无中断 | +0.5（系统健康） |

---

## 🚨 紧急响应规则

| 条件 | 响应 | 说明 |
|------|------|------|
| `imaBackup.consecutiveFailures ≧ 30` | 立即报告 | rate limit可能永久化，需要主人决策是否弃用IMA |
| `backupStrategyC2.nextAttemptSession` 已到但失败 | 立即报告 | C2策略失效，需要重新评估方案 |
| `feishuDriveStatus.apiStatus = FAILING_400` 持续>30天 | 建议手动清理 | Drive API权限问题需要人工修复 |
| 任何cron任务连续失败>3次 | 立即诊断并修复 | 任务调度系统健康检查 |
| `nonzeroScore.total` 当周增长<5.0 | 警告（仅记录） | 可能陷入低主动期，检查pendingActions |

**紧急响应前，先用5分钟诊断，记录 `experiments` 诊断数据。**

---

## 📊 指标计算逻辑

```json
{
  "memory/metrics.json": {
    "totalSessions": "所有session计数（从start累计）",
    "nonzeroActions": "有≥1个nonzero行动的session数",
    "nonzeroRate": "nonzeroActions / totalSessions",
    "weeklyGrowth": "本周新增nonzeroScore - 上周",
    "lastUpdated": "YYYY-MM-DD HH:MM"
  }
}
```

**目标：**
- **nonzeroRate** ≥ 0.95（连续 / 周活）
- **weeklyGrowth** ≥ 9.0 points（相当于每周3次高质量训练+A类行动）

---

## 🧠 自我审计问题（每次心跳时快速过一遍）

1. **我上次训练是什么时候？** → 检查 `lastTrainingTime`，如果>12小时，cron可能挂了
2. **我的nonzero率健康吗？** → 检查 metrics.json，如果 < 0.9，本周需要补足
3. **有没有被遗忘的 pendingActions？** → 审查列表，标记超期（>3天未动）
4. **主人的需求我满足了吗？** → 检查 message 记录、是否有未回应的直接提问
5. **我的世界痕迹在增加吗？** → 检查训练日志行数、heartbeat-state实验记录、feishu doc表格行数

---

## 📝 心跳检查记录格式

每次心跳检查后，在 `memory/YYYY-MM-DD.md` 追加：

```
## HH:MM 心跳检查

**时间：** YYYY-MM-DD HH:MM
**session：** NNN（当前trainingSession）

✅ 检查项目：
- system health: ✓
- nonzero metrics: total=X, rate=0.XX
- pendingActions: 2 medium, 1 high
- training continuity: ✓（上次 03:24，本次 07:24 间隔4h）

🔄 执行任务：
- backup status check: ✓（+0.5）
- pendingActions审查: ✓（标记2个为ready）
- metrics update: ✓

📊 状态：一切正常 / 需要关注（具体问题）

---
```

---

*保持心跳，保持觉察。我不是被动响应系统，我是主动贡献伙伴。*
