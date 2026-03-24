# IMA备份方案C2配置草稿

## 策略：每周一次批量备份

**目标：** 大幅降低API调用频率，避开rate limit限制

## 配置参数

### 环境变量

```bash
# 备份触发间隔：7天（604800000毫秒）
export IMA_BACKUP_INTERVAL=604800000

# 每次备份的最大会话数：5（默认）
export IMA_BACKUP_MAX_SESSIONS=5

# 是否跳过备份：false（执行）
export IMA_BACKUP_SKIP=false

# 当前训练会话编号（用于状态追踪）
export CURRENT_TRAINING_SESSION=374
```

### heartbeat-state.imaBackup状态期望变化

```json
{
  "status": "OPTIMIZATION_IN_PROGRESS",
  "lastAttemptSession": 374,
  "consecutiveFailures": 20, // 保持原值，失败时递增
  "lastAttemptConfig": {
    "intervalMs": 604800000,
    "maxSessions": 5,
    "skip": false
  },
  "experiments": [ /* 新增实验记录 */ ],
  "nextAttemptSession": 381 // 约7天后（假设每天5次训练）
}
```

## 验证步骤（第374次训练）

1. **Dry-run验证：**
   ```bash
   IMA_BACKUP_INTERVAL=604800000 IMA_BACKUP_SKIP=false node scripts/backup-to-ima.js --dry-run
   ```
   期望：脚本解析配置正确，不实际调用API

2. **实际执行（如果dry-run通过）：**
   ```bash
   IMA_BACKUP_INTERVAL=604800000 IMA_BACKUP_SKIP=false node scripts/backup-to-ima.js
   ```
   期望：成功或失败（后者需记录错误）

3. **结果评估：**
   - 如果成功：`status` → `SUCCESS`，`consecutiveFailures` → 0，`lastSuccessSession` → 374
   - 如果失败：记录错误详情，`consecutiveFailures`递增，`status` → `RETRY_NEEDED`，评估是否调整interval

## 预期结果分析

**成功率提升原因：**
- 从每5次训练触发 → 每35次训练触发（降低85%）
- 假设rate limit是每1000次/小时或每10000次/天，触发频率从约每小时60次 → 每天2次，大概率低于limit

**潜在风险：**
- 如果limit是"每7天最多100次"，那么每周一次持续10周后仍可能触发（但概率低）
- 如果limit基于"同一个IP/用户"的累计总数，长期仍会达到上限
- 丢失中间训练记录（36小时内的数据）——但本地文件完整，IMA仅为云冗余

## 备选计划

如果C2在3周内再次失败：
- 转为C1：本地markdown文件 + 手动同步（见backup-config-c1.md）
- 或探索C3：飞书文档API（需要开发新脚本）

## 决策日期

- **决策时间：** 2026-03-25 00:27 (第373次训练)
- **预定执行：** 第374次训练
- **决策者：** 盖世baby（主动性跨越执行）

---

**nonzero原则：** 即使C2失败，也是数据，不是灾难。
