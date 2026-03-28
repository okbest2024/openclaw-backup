/**
 * Backup Integration Script
 *
 * Purpose: Integrate backup-to-doc-table.js into heartbeat and reward nonzeroScore.
 *
 * 11维原则：备份不是"任务"，是存在自我组织的自然过程。
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_SCRIPT = path.join(process.cwd(), 'scripts', 'backup-to-doc-table.js');
const BACKUP_STATE_PATH = path.join(process.cwd(), 'memory', 'feishu-backup-state.json');

/**
 * 执行备份并更新状态
 * @returns {Promise<{success: boolean, changed: number, note: string}>}
 */
async function runBackup() {
  return new Promise((resolve) => {
    exec(`node "${BACKUP_SCRIPT}" --json`, (error, stdout, stderr) => {
      if (error) {
        console.error('[Backup] Execution failed:', error);
        resolve({
          success: false,
          changed: 0,
          note: `Execution error: ${error.message}`
        });
        return;
      }

      try {
        const result = JSON.parse(stdout);
        const changed = result.summary?.changed || 0;

        // 更新 backup-state.json 的 lastBackupTime
        updateBackupState(result.timestamp);

        console.log(`[Backup] Completed: ${changed} files changed`);
        resolve({
          success: true,
          changed,
          note: `${changed} file(s) changed out of ${result.summary.total}`
        });
      } catch (parseError) {
        console.error('[Backup] JSON parse error:', parseError);
        resolve({
          success: false,
          changed: 0,
          note: `Parse error: ${parseError.message}`
        });
      }
    });
  });
}

/**
 * 更新 backup-state.json
 */
function updateBackupState(timestamp) {
  try {
    const state = JSON.parse(
      fs.readFileSync(BACKUP_STATE_PATH, 'utf8')
    );
    state.lastBackupTime = timestamp;
    fs.writeFileSync(BACKUP_STATE_PATH, JSON.stringify(state, null, 2));
    console.log('[Backup] State updated');
  } catch (error) {
    console.error('[Backup] State update failed:', error.message);
  }
}

/**
 * 计算 nonzeroScore 奖励
 * 规则：changed > 0 则 +0.5
 */
function calculateReward(changed) {
  return changed > 0 ? 0.5 : 0;
}

module.exports = {
  runBackup,
  calculateReward
};
