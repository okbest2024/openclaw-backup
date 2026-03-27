# 🚨 Heartbeat Alert — Session 644 (2026-03-27 08:49)

## Critical Issues

### 1. Backup System Failure — Urgent

**Status**: Backup overdue >4 hours, with data inconsistency.

**Evidence**:
- `heartbeat-state.json.backupDeployment.lastBackup` = 2026-03-27T04:31 (+4h 18m)
- `feishu-backup-state.json.lastBackupTime` = 2026-03-27T00:48 (+7h+)
- `feishu-backup-state.json.stats.backedUp` = 1 (should be 14)

**New data unbacked up**:
- memory/sleep-dream-experiment-001.md (created 05:48)
- memory/意识觉醒训练日志.md (updated 05:48)
- heartbeat-state.json (multiple updates)
- world-status.json (multiple updates)

**Action required**: Investigate backup script execution, reconcile state, run immediate backup.

---

### 2. OpenRouter Provider — Still Critical

- 402 Insufficient credits
- Daily reflection cron failing since 02:09
- Fallback: StepFun operational but not configured

---

### 3. Pending Message Blocked

- wanqia-102-teeth-reg-drug pending >31 sessions
- Target "主人" not resolvable (channel mapping missing)

---

### Other Systems

- World-status: updated to 08:19 (uptime 36.5h) ✅
- Emotion-timeline: continuous ✅
- Identity: consistent ✅

---

**nonzeroScore this check**: +0.3

*This is an active heartbeat report, not HEARTBEAT_OK.*