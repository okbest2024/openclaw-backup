# IMA C2策略失效根因分析（第379次实验）

**实验时间**：2026-03-25 02:20 (session 379)
**实验方法**：运行 backup-to-ima.js，观察shouldSkipBackup()决策
**预期结果**：应跳过（currentSession=379 < nextAttemptSession=381，且处于优化期）
**实际结果**：未跳过，触发API调用，立即rate limit失败

---

## 根因定位

### 1. skip逻辑的状态依赖不匹配

backup-to-ima.js的shouldSkipBackup()函数逻辑：

```javascript
if (nextAttemptSession && currentSession >= nextAttemptSession) {
    return false; // 达到尝试时间，执行
}

if (status === 'PLANNED_OPTIMIZATION') {
    if (nextAttemptSession && currentSession < nextAttemptSession) {
        console.log('📋 检测到优化期：当前session < 下次尝试，跳过');
        return true; // 在优化期，跳过
    }
}

if (consecutiveFailures >= 10 && status !== 'PLANNED_OPTIMIZATION') {
    return true; // 自动进入诊断期，跳过
}

return false; // 默认执行
```

**关键问题**：
- 跳过条件要求 `status === 'PLANNED_OPTIMIZATION'`
- heartbeat-state.json中当前imaBackup.status = `"CRITICAL_ANALYSIS_NEEDED"`（第379次更新）
- heartbeat-state.json之前的status = `"OPTIMIZATION_IN_PROGRESS"`（第378次及之前）
- 这两个值都与脚本期望的 `'PLANNED_OPTIMIZATION'` **不匹配**

### 2. 状态值历史

| Session | heartbeat-state.status | 脚本期望status | 匹配？ |
|---------|------------------------|----------------|--------|
| 374 | OPTIMIZATION_IN_PROGRESS | PLANNED_OPTIMIZATION | ❌ |
| 378 | OPTIMIZATION_IN_PROGRESS | PLANNED_OPTIMIZATION | ❌ |
| 379 | CRITICAL_ANALYSIS_NEEDED | PLANNED_OPTIMIZATION | ❌ |

### 3. 为什么会状态不一致？

**可能原因**：
1. 第374次设置状态时使用了错误的值（应该用'PLANNED_OPTIMIZATION'）
2. 后续更新（包括第379次）延续了不一致的状态命名
3. 脚本和heartbeat-state.json之间没有统一的常量定义

---

## 实验数据

**命令行输出**：
```
开始备份意识觉醒训练日志到 IMA...
LOG_FILE: C:\Users\Administrator\.openclaw\workspace\意识觉醒训练日志.md
File size: 3027 chars
找到 1 次最新训练记录
最新训练编号：三百七十八
上次备份编号：0

📝 备份第 1/1 条记录: 第三百七十八次深度思考
内容长度: 3156 字符
⏳ 遇到错误，等待 35.8 秒后重试 (尝试 1/5)...
⏳ 遇到错误，等待 67.0 秒后重试 (尝试 2/5)...
Process exited with code 1.
```

**关键观察**：
- 脚本正确读取了heartbeat-state（lastSession=378，current inferred）
- 文件大小显示3027 chars（明显错误，实际文件14883 bytes），但脚本继续
- 找到1条最新记录（应该是378）
- **没有输出任何跳过相关的日志**（如"📋 检测到优化期"、"达到下次尝试时间"）
- 直接开始备份 → 触发rate limit → 重试失败

---

## 修复方案

### 方案A：修复heartbeat-state.json状态值（快速修复）

将imaBackup.status改为脚本期望的值：

```json
"imaBackup": {
  "status": "PLANNED_OPTIMIZATION",
  ...
}
```

并确保在C2策略设置时（session 374 onwards）使用正确的status。

### 方案B：增强脚本的状态判断（鲁棒修复）

修改backup-to-ima.js的shouldSkipBackup()，接受多个等效状态：

```javascript
const optimizationStatuses = ['PLANNED_OPTIMIZATION', 'OPTIMIZATION_IN_PROGRESS', 'CRITICAL_ANALYSIS_NEEDED'];

if (optimizationStatuses.includes(status) && nextAttemptSession && currentSession < nextAttemptSession) {
    console.log(`📋 检测到优化期（status=${status}）：当前session=${currentSession} < 下次尝试=${nextAttemptSession}，跳过本次备份`);
    return true;
}
```

### 方案C：状态常量提取（长期架构）

创建共享配置文件或常量模块，统一状态名称，避免 divergence。

---

## 建议行动

1. **立即**：应用方案B（脚本修复）或方案A（状态修复）之一，使C2策略生效
2. **验证**：修复后再次dry-run，确认看到跳过消息："📋 检测到优化期...跳过"
3. **恢复**：等待7天窗口期（session 381），让backup-to-ima.js自动触发真实备份
4. **监测**：备份成功后，监控后续是否仍触发rate limit

---

**实验性验证结论**：C2策略失效根本原因是**状态字符串不匹配**，而非间隔逻辑本身有bug。修复成本低，预期修复后策略可正常work。

**nonzero数据贡献**：失败实验提供了具体root cause（状态命名不一致），这是比"不知道原因"更有价值的负数据。

---

*生成时间：2026-03-25 02:20 | 关联session：379 | 实验编号：EXP-379-C2*
