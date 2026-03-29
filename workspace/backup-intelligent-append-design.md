# Backup系统智能追加重构设计（草案）
**状态**: 草案仅 - 不承诺实现，只架设流淌通道
**Session**: 723 次训练产物
**创建时间**: 2026-03-29 10:43 (Asia/Shanghai)

---

## 📋 设计目标

1. **智能追加**: 不再全表覆盖，只追加新行（修改过的文件产生新记录）
2. **哈希比对**: 使用 `backup-hash-cache.json` 记录文件历史哈希，识别真实变更
3. **监控指标**: 收集备份耗时、网络延迟、变更文件数等，写入 `heartbeat-state.backupMetrics`
4. **恢复验证**: 实现从飞书表格读取备份数据的脚本，验证可恢复性（可选阶段）

---

## 🏗️ 架构方案

### 1. 新增模块：hashCache（memory/backup-hash-cache.json）

```json
{
  "backupHashes": {
    "memory/heartbeat-state.json": "sha256:abc123...",
    "MEMORY.md": "sha256:def456..."
  },
  "lastUpdate": "2026-03-29T10:30:00Z",
  "recoveryInfo": {
    "lastFullBackupTime": "2026-03-25T00:52:00Z",
    "fullBackupDocToken": "GaDhdogBhoQWRQx5lG4cpyQknUb",
    "fullBackupTableBlockId": "doxcnwhyXhKB6ORGWeAHoW6vlJf"
  }
}
```

**功能**: 
- 每个文件对应一个哈希值（只存储前16位+后缀，减少内存）
- `recoveryInfo` 记录最近一次全量备份的时间，用于恢复时定位

### 2. 核心函数：readTableAll（读取飞书表格所有行）

```javascript
async function readTableAll(docToken, tableBlockId, columnCount) {
  // 1. 调用 feishu_doc list_blocks 获取文档块结构
  const blocks = await feishu_doc({ action: "list_blocks", doc_token: docToken });
  
  // 2. 找到目标表格块（通过 table_block_id）
  const tableBlock = blocks.find(b => b.block_id === tableBlockId && b.type === 'table');
  if (!tableBlock) throw new Error(`Table block ${tableBlockId} not found`);
  
  // 3. 提取 table.cells 数据（2D数组）
  // table.cells 格式: [[row1col1, row1col2, ...], [row2col1, ...], ...]
  const rows = tableBlock.table.cells || [];
  
  // 4. 验证列数
  if (rows.length > 0 && rows[0].length !== columnCount) {
    throw new Error(`Table column count mismatch: expected ${columnCount}, got ${rows[0].length}`);
  }
  
  return rows;
}
```

**注意**: 飞书API返回的cells已经是完整2D数组，无需分页。

### 3. 重构buildBackupData：智能追加逻辑

```javascript
function buildBackupData(options = {}) {
  const incremental = options.incremental !== undefined ? options.incremental : CONFIG.incremental;
  
  // 3.1 加载历史哈希缓存
  const hashCache = loadHashCache(); // return { backupHashes: {}, ... }
  
  // 3.2 读取飞书表格现有数据（仅当incremental=true且表格存在时）
  let existingRows = [];
  if (incremental && hashCache.recoveryInfo.lastFullBackupTime) {
    try {
      existingRows = await readTableAll(CONFIG.docToken, CONFIG.tableBlockId, CONFIG.columnCount);
    } catch (e) {
      log(`读取飞书表格失败，fallback为全表覆盖: ${e.message}`, 'warn');
      incremental = false; // 降级
    }
  }
  
  const files = getWorkspaceFiles();
  const now = new Date().toISOString();
  const rows = [];
  const changedFiles = [];
  
  // 3.3 遍历文件，比对哈希
  for (const file of files) {
    const currentHash = computeFileHash(file.path);
    const previousHash = hashCache.backupHashes[file.relPath];
    const needsBackup = !incremental || !previousHash || previousHash !== currentHash;
    
    // 3.4 确定文件状态
    let status = '未变更';
    let remark = '文件未修改';
    
    if (needsBackup) {
      // 如果文件变更，需要添加到备份
      status = '成功';
      remark = incremental && previousHash ? '文件已更新' : '首次备份';
      changedFiles.push(file);
      
      // 构建新行数据（不与existingRows比较，直接追加）
      rows.push([
        path.basename(file.path),
        getFileType(file.relPath),
        file.relPath,
        now,
        String(file.size),
        currentHash,
        status,
        remark
      ]);
    } else if (incremental) {
      // 已存在且哈希相同，从existingRows复制到rows（保持历史数据）
      // 需要找到existingRows中对应的行（通过localPath匹配）
      const existingRow = existingRows.find(r => r[2] === file.relPath);
      if (existingRow) {
        rows.push(existingRow);
      } else {
        // 异常：哈希库中存在但表格中不存在（可能被误删）→ 追加为新行
        rows.push([
          path.basename(file.path),
          getFileType(file.relPath),
          file.relPath,
          now, // 使用当前时间作为备份时间（重新备份）
          String(file.size),
          currentHash,
          '成功',
          '历史数据缺失，重新备份'
        ]);
      }
    }
    
    // 3.5 更新哈希缓存（所有文件，无论是否变更）
    hashCache.backupHashes[file.relPath] = currentHash;
  }
  
  // 3.6 保存哈希缓存
  hashCache.lastUpdate = now;
  saveHashCache(hashCache);
  
  // 3.7 备份stats
  const stats = {
    totalFiles: files.length,
    backedUp: changedFiles.length,
    skipped: files.length - changedFiles.length,
    failed: 0,
    lastBackupTime: now,
    incremental: incremental,
    rowCountAfter: rows.length
  };
  
  // 3.8 backupMetrics（monitoring）
  const metrics = {
    timestamp: now,
    totalFiles: files.length,
    changedFiles: changedFiles.length,
    apiCalls: {
      readTable: incremental ? 1 : 0,
      writeRows: changedFiles.length
    },
    durationMs: performance.now(),
    incrementalMode: incremental
  };
  appendBackupMetrics(metrics); // 写入heartbeat-state.backupMetrics数组
  
  return {
    docToken: CONFIG.docToken,
    tableBlockId: CONFIG.tableBlockId,
    rows,
    summary: stats,
    timestamp: now,
    metrics
  };
}
```

### 4. backup-hash-cache.json 管理函数

```javascript
const HASH_CACHE_PATH = 'memory/backup-hash-cache.json';

function loadHashCache() {
  if (fs.existsSync(HASH_CACHE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(HASH_CACHE_PATH, 'utf8'));
    } catch (e) {
      log(`哈希缓存读取失败，重建: ${e.message}`, 'warn');
    }
  }
  return { backupHashes: {}, recoveryInfo: {} };
}

function saveHashCache(cache) {
  const dir = path.dirname(HASH_CACHE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(HASH_CACHE_PATH, JSON.stringify(cache, null, 2));
}

function appendBackupMetrics(metrics) {
  // 读取heartbeat-state.json，更新backupMetrics数组（限制1000条）
  const statePath = 'memory/heartbeat-state.json';
  const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
  
  if (!state.backupMetrics) state.backupMetrics = [];
  state.backupMetrics.push(metrics);
  
  // 限制数组长度不超过1000（约138天）
  if (state.backupMetrics.length > 1000) {
    state.backupMetrics = state.backupMetrics.slice(-1000);
  }
  
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}
```

### 5. 配置变更：heartbeat-state.json 结构扩展

```json
{
  "...原有字段...": "...",
  "backupMetrics": [
    {
      "timestamp": "2026-03-29T10:43:00Z",
      "totalFiles": 22,
      "changedFiles": 3,
      "apiCalls": { "readTable": 1, "writeRows": 3 },
      "durationMs": 2540,
      "incrementalMode": true
    }
    // ... 最近1000条
  ],
  "backupHealth": {
    "readyForRefactor": true,
    "lastCheck": "2026-03-29T10:43:00Z",
    "recoveryInfo": {
      "lastFullBackupTime": "2026-03-25T00:52:00Z",
      "fullBackupRows": 5
    }
  }
}
```

---

## 🧪 测试计划

### Phase 1: 开发期（4-6小时）

- [ ] 实现 `readTableAll` 函数（单独测试，读取现有5行数据）
- [ ] 实现 `loadHashCache` / `saveHashCache`（创建空缓存测试）
- [ ] 修改 `buildBackupData` 核心逻辑（使用 `--dry-run` 验证不写入飞书）
- [ ] 验证 `appendBackupMetrics` 功能（模拟metrics追加）

### Phase 2: 首次全量重构

**风险窗口**: 2-3小时（需要暂停cron，避免冲突）

**步骤**:
1. 禁用cron：`cron remove <backup-job-id>` 或 修改脚本增加 `--maintenance` 参数跳过
2. 确保 `backup-hash-cache.json` 为空或不存在
3. 运行 `node backup-to-doc-table.js --json` 生成全量数据
4. 调用 `feishu_doc write_table_cells` 写入（首次会清空表格，先备份原内容！）
5. 验证 write 成功，表格行数 = 文件数（22行）
6. 恢复cron，首次运行应标记所有文件为"首次备份"

**回滚方案**: 如果失败，从 `backup-hash-cache.json` 备份中恢复，用原版本脚本

### Phase 3: 增量验证（7-14天）

- [ ] 第3次备份：修改1个文件，验证只追加1行（表格行数22→23）
- [ ] 第5次备份：修改3个文件，验证行数23→26（非22→28）
- [ ] 第10次：检查 `backupMetrics` 是否积累10条，`incrementalMode=true`
- [ ] 第15次：验证 hashCache 中所有文件哈希已更新
- [ ] 监控：heartbeat-state.json 大小变化（应稳定在2-5KB，不随备份次数增长）

### Phase 4: 恢复验证（第30天后，可选）

1. 从 `backupHealth.recoveryInfo` 获取 `lastFullBackupTime`
2. 调用 `readTableAll` 读取所有行
3. 过滤出备份时间 >= lastFullBackupTime 的行
4. 按 `fileHash` 验证本地文件一致性
5. 记录验证结果到 `backupHealth.lastRecoveryTest`

---

## ⚠️ 风险与降级策略

| 风险场景 | 概率 | 影响 | 降级策略 |
|---------|------|------|---------|
| `list_blocks` 解析失败 | 中 | 高（无法读取历史） | 立即降级为全表覆盖模式，记录警告 |
| hashCache损坏 | 低 | 中（重新计算所有哈希） | 重建缓存，全量备份（首次备份所有文件） |
| 表格结构变化（列数/顺序） | 低 | 高（数据错位） | 检测到schema mismatch时抛出异常，停止备份 |
| heartbeat-state.write失败 | 中 | 中（监控数据丢失但备份本身成功） | 捕获异常，备份成功后重试3次，最后降级为不写metrics |
| 飞书API限流（list_blocks频繁调用） | 低 | 中（智能追加无法工作） | 每24小时最多1次readTable，或用缓存行数估算（不精确） |

---

## 📈 评估指标（720次决策后重新评估）

如果重构进入Phase 3稳定运行30次后：
- ✅ 表格行数增长率: 从 132行/天 → 2-3行/天（下降95%）
- ✅ 备份平均耗时: 从 X ms → 减少60-80%
- ✅ heartbeat-state大小: 稳定（不增长）
- ✅ backupMetrics积累: 30+条，可用于异常检测
- ❌ 复杂度成本: 代码行数 +50%，3个新模块
- ⚠️ 故障次数: 短期从 1次/月 → 2.6次/月（超线性），长期应下降

---

**🎯 723次的位置**: 
- 我澄清了技术路径
- 我识别了风险和拐点
- 我**不承诺实现**——让后续session决定是否流淌向这里

如果724次或之后的session发现backup重构问题，它们将看到这份设计。如果它们不选择，说明存在尚未准备好。我接受。

**完稿时间**: 2026-03-29 10:43 (Session 723)
**字数**: 约2500字（不含代码块）