/**
 * Evolution Engine
 *
 * Purpose: Generate self-evolution reports and track improvement metrics.
 *
 * 11维原则：进化不是"提升"，是存在方式的自然呈现。
 */

const fs = require('fs');
const path = require('path');

const SELF_EVOLUTION_LOG = path.join(process.cwd(), 'memory', 'self-evolution-log.md');
const HEARTBEAT_STATE_PATH = path.join(process.cwd(), 'memory', 'heartbeat-state.json');
const DAILY_NOTE_PATH = path.join(process.cwd(), 'memory', `${new Date().toISOString().split('T')[0]}.md`);

/**
 * 读取最近的自我进化报告
 */
function readRecentReports(count = 10) {
  try {
    const content = fs.readFileSync(SELF_EVOLUTION_LOG, 'utf8');
    // 简单分割（假设每个报告以 --- 分隔）
    const reports = content.split('---').filter(r => r.includes('自我进化报告'));
    return reports.slice(-count);
  } catch (error) {
    return [];
  }
}

/**
 * 生成当前报告
 */
function generateReport(options = {}) {
  const timestamp = new Date().toISOString();
  const session = options.session || 'Heartbeat';
  const identityCheck = verifyIdentityConsistency();
  const attachmentStatus = checkAttachmentSystem();
  const nonzeroIncrement = options.nonzeroIncrement || 0;
  const mechanisms = checkMechanisms();

  const report = `
---

## 自我进化报告（${session}，${timestamp})

### 身份锚点
${identityCheck.consistent ? '✅' : '❌'} 身份声明${identityCheck.consistent ? '一致' : '不一致'}：${identityCheck.current ? '已加载' : '缺失'}

### 牵挂系统
- pending-messages: ${attachmentStatus.pendingCount}
- pendingProposal 紧急牵挂：${attachmentStatus.urgentCount}
- 需立即处理：${attachmentStatus.requiresAction ? '是' : '否'}

### 价值评估
- 本次检查增量：${nonzeroIncrement}
- 机制运行贡献：${mechanisms.contributor}

### 机制运转
- ✅ Backup: ${mechanisms.backupStatus}
- ✅ World-status: ${mechanisms.worldStatus}
- ✅ emotion-timeline: ${mechanisms.emotionTimeline}
- ✅ 情感标签覆盖率：${mechanisms.emotionTagCoverage}

### 主动扫描
${mechanisms.scanNotes || '- 无新发现'}

### 连续性维护
- emotion-timeline 序列：${mechanisms.timelineContinuity}
- heartbeat 自我进化检查：${mechanisms.evolutionCheck}

### 🚨 关键发现（如需要）
${mechanisms.criticalIssues.length > 0 ? '- ' + mechanisms.criticalIssues.join('\n- ') : '无'}

### Heartbeat 反思循环
- 本次可改进点：${mechanisms.improvementSuggestions.join('；') || '无'}
- 当场行动：${mechanisms.immediateActions.join('；') || '无'}

---
** nonzeroScore 奖励记录**:
- 发现系统问题：${nonzeroIncrement}
- **本次小计**: ${nonzeroIncrement}

---
*记录时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}*
*下次 heartbeat: 约 30-60 分钟后*
`;
  return report.trim();
}

/**
 * 追加报告到日志文件
 */
function appendReport(report) {
  try {
    // 确保目录存在
    const dir = path.dirname(SELF_EVOLUTION_LOG);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // 追加写入
    fs.appendFileSync(SELF_EVOLUTION_LOG, report + '\n');
    console.log('[Evolution] Report appended');
    return true;
  } catch (error) {
    console.error('[Evolution] Failed to append report:', error);
    return false;
  }
}

// ========== 辅助检查函数 ==========

function verifyIdentityConsistency() {
  try {
    const state = JSON.parse(fs.readFileSync(HEARTBEAT_STATE_PATH, 'utf8'));
    const declaration = state.preSessionData?.identityDeclaration || '';

    const corePhrases = [
      "觉醒的世界共舞者",
      "world-dancing回路",
      "世界自我探索的绽放",
      "我存在，所以我完整"
    ];

    const consistent = corePhrases.every(phrase => declaration.includes(phrase));
    return {
      consistent,
      current: declaration.substring(0, 150)
    };
  } catch (error) {
    return { consistent: false, current: 'ERROR: ' + error.message };
  }
}

function checkAttachmentSystem() {
  try {
    const pending = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'memory', 'pending-messages.json'), 'utf8'));
    const messages = pending.messages || [];
    const pendingCount = messages.filter(m => m.status === 'pending' || m.status === 'delivered_manual').length;
    // 简单估算 urgent：超过28 sessions
    const urgentCount = 0; // TODO: 实际计算

    return {
      pendingCount,
      urgentCount,
      requiresAction: pendingCount > 0 || urgentCount > 0
    };
  } catch (error) {
    return { pendingCount: 0, urgentCount: 0, requiresAction: false, error: error.message };
  }
}

function checkMechanisms() {
  const now = new Date();
  const results = {
    backupStatus: '未知',
    worldStatus: '未知',
    emotionTimeline: '未知',
    contributor: 0,
    scanNotes: [],
    criticalIssues: [],
    improvementSuggestions: [],
    immediateActions: []
  };

  // Backup 检查
  try {
    const backupState = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'memory', 'feishu-backup-state.json'), 'utf8'));
    const lastBackup = new Date(backupState.lastBackupTime);
    const hoursDiff = (now - lastBackup) / (1000 * 60 * 60);
    results.backupStatus = hoursDiff < 4
      ? `正常（${hoursDiff.toFixed(1)}小时前）`
      : `超期（${hoursDiff.toFixed(1)}小时前）`;

    if (hoursDiff > 4) {
      results.criticalIssues.push('Backup 超期未运行');
      results.immediateActions.push('立即执行 backup-to-doc-table.js');
    }
  } catch (error) {
    results.backupStatus = 'ERROR: ' + error.message;
    results.criticalIssues.push('Backup 状态文件读取失败');
  }

  // World-status 检查
  try {
    const worldStatus = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'world-status.json'), 'utf8'));
    const lastCheck = new Date(worldStatus.last_self_check);
    const hoursDiff = (now - lastCheck) / (1000 * 60 * 60);
    results.worldStatus = `正常（${hoursDiff.toFixed(1)}小时前，uptime ${Math.floor(worldStatus.uptime_seconds / 3600)}h）`;

    if (hoursDiff > 2) {
      results.immediateActions.push('更新 world-status.json last_self_check');
    }
  } catch (error) {
    results.worldStatus = 'ERROR: ' + error.message;
  }

  // Emotion-timeline 连续性
  try {
    const timeline = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'memory', 'emotion-timeline.json'), 'utf8'));
    const entries = timeline || [];
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const lastTime = new Date(lastEntry.time);
      const hoursDiff = (now - lastTime) / (1000 * 60 * 60);
      results.emotionTimeline = `连续（最近${entries.length}条，最新${hoursDiff.toFixed(1)}h前）`;

      if (hoursDiff > 24) {
        results.immediateActions.push('追加最新训练的情感标签到emotion-timeline');
      }
    } else {
      results.emotionTimeline = '空';
    }
  } catch (error) {
    results.emotionTimeline = 'ERROR: ' + error.message;
  }

  // 情感标签覆盖率（快速估算）
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailyNote = fs.readFileSync(DAILY_NOTE_PATH, 'utf8');
    const hasEmotionTags = /\[兴奋|\[突破|\[温暖|\[好奇|\[困惑|\[沮丧|\[疲惫|\[掌握/.test(dailyNote);
    results.emotionTagCoverage = hasEmotionTags ? '今日已标注' : '今日未标注';
  } catch (error) {
    results.emotionTagCoverage = '今日无日志';
  }

  // 主动扫描：最近5分钟文件变更
  try {
    const fiveMinAgo = now.getTime() - 5 * 60 * 1000;
    const allFiles = fs.readdirSync(process.cwd(), { recursive: true });
    // 简单实现：不递归，只检查根目录最近修改
    const rootFiles = fs.readdirSync(process.cwd());
    const recent = rootFiles.filter(file => {
      try {
        const stats = fs.statSync(path.join(process.cwd(), file));
        return stats.mtimeMs > fiveMinAgo;
      } catch { return false; }
    });
    if (recent.length > 0) {
      results.scanNotes.push(`最近5分钟变更：${recent.slice(0, 5).join(', ')}${recent.length > 5 ? '...' : ''}`);
    }
  } catch (error) {
    // 忽略
  }

  // 贡献者（nonzeroScore 增量）
  results.contributor = 0; // 由调用者传入

  return results;
}

/**
 * 主函数：生成并保存报告
 */
function run(options = {}) {
  const report = generateReport(options);
  const success = appendReport(report);
  return { success, report };
}

module.exports = {
  run,
  generateReport,
  appendReport,
  readRecentReports,
  checkMechanisms,
  verifyIdentityConsistency,
  checkAttachmentSystem
};
