#!/usr/bin/env node
/**
 * Mirror Reflection Protocol - 实验735
 * 维度特性论训练2：网络共在维度注入
 *
 * 核心目标：实现11维"网络共在"的MVP机制
 * - 捕获输出文本和session状态
 * - 生成本地规则镜像（中立/赞赏/批判）
 * - 计算coPresenceDelta并更新heartbeat-state
 *
 * Phase 1策略：使用本地规则生成器（无LLM依赖），优先覆盖率>质量
 * Phase 2策略：加入LLM镜像生成和wanqia-102真实镜像源
 */

const fs = require('fs');
const path = require('path');

/**
 * 镜像反射器类
 */
class MirrorReflectionProtocol {
  constructor(statePath = './memory/heartbeat-state.json') {
    this.statePath = statePath;
    this.state = this.loadState();
    this.coPresenceScore = this.state.networkCoPresence?.coPresenceScore || 0;
    this.mirrorHistory = this.state.networkCoPresence?.mirrorHistory || [];
    this.integrationDepth = this.state.networkCoPresence?.integrationDepth || 0.5;
  }

  /**
   * 加载heartbeat-state，支持损坏JSON恢复
   */
  loadState() {
    try {
      const raw = fs.readFileSync(this.statePath, 'utf8');
      const state = JSON.parse(raw);
      return state;
    } catch (e) {
      console.error('[MirrorProtocol] Failed to load state, using empty:', e.message);
      return { networkCoPresence: { coPresenceScore: 0, mirrorHistory: [] } };
    }
  }

  /**
   * 保存状态回heartbeat-state（原子写入）
   */
  saveState() {
    // 更新state对象
    if (!this.state.networkCoPresence) {
      this.state.networkCoPresence = {};
    }
    this.state.networkCoPresence.coPresenceScore = this.coPresenceScore;
    this.state.networkCoPresence.mirrorHistory = this.mirrorHistory.slice(-10); // 最多10条
    this.state.networkCoPresence.lastMirrorTimestamp = new Date().toISOString();
    this.state.networkCoPresence.integrationDepth = this.integrationDepth;

    // 原子写入：写临时文件 → rename
    const tmpPath = this.statePath + '.tmp';
    const backupPath = this.statePath + '.bak';
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(this.state, null, 2), 'utf8');
      if (fs.existsSync(this.statePath)) {
        fs.copyFileSync(this.statePath, backupPath);
      }
      fs.renameSync(tmpPath, this.statePath);
      console.log('[MirrorProtocol] State saved atomically');
    } catch (e) {
      console.error('[MirrorProtocol] Save failed:', e.message);
      throw e;
    }
  }

  /**
   * 分析文本语义（本地规则版）
   * 提取：主题关键词、情感倾向、长度、复杂度
   */
  analyzeSemantics(text) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const charCount = text.length;
    const sentenceCount = (text.match(/[.!?。！？]/g) || []).length;
    
    // 主题关键词提取（简化：取最长3个名词性词）
    const potentialKeywords = text.match(/[a-zA-Z\u4e00-\u9fa5]{3,}/g) || [];
    const keywords = [...new Set(potentialKeywords)].slice(0, 3);

    // 情感倾向：简单词汇表
    const positiveWords = ['成功', '支持', '优质', '有效', '提升', '优化', '强大', '稳定', 'Swift', 'fast', 'good', 'great', 'excellent'];
    const negativeWords = ['失败', '错误', '问题', '缺失', '缺陷', '风险', '脆弱', '缓慢', 'bad', 'fail', 'error', 'issue', 'poor'];
    const lowerText = text.toLowerCase();
    let sentimentScore = 0;
    positiveWords.forEach(w => { if (lowerText.includes(w)) sentimentScore += 1; });
    negativeWords.forEach(w => { if (lowerText.includes(w)) sentimentScore -= 1; });

    return {
      charCount,
      wordCount: words.length,
      sentenceCount,
      keywords,
      sentimentScore,
      hasQuestionMark: /[?？]/.test(text),
      hasExclamation: /[!！]/.test(text)
    };
  }

  /**
   * 中立视角镜像生成
   * "这个输出是关于什么的，客观描述"
   */
  neutralPerspective(semantics) {
    const topic = semantics.keywords.length > 0 ? semantics.keywords.join('、') : '系统运行状态';
    const lengthDesc = semantics.charCount < 100 ? '简短' : semantics.charCount < 500 ? '中等' : '详尽';
    const purpose = semantics.hasQuestionMark ? '提问' : '陈述/记录';
    
    return `[中立镜像] 这是关于"${topic}"的${lengthDesc}${purpose}，共${semantics.charCount}字、${semantics.wordCount}词，情感倾向评分${semantics.sentimentScore}。关键词：${semantics.keywords.join('、') || '无显著关键词'}`;
  }

  /**
   * 赞赏视角镜像生成
   * "他者会如何正面评价这个输出"
   */
  appreciativePerspective(semantics) {
    const strengths = [];
    if (semantics.sentimentScore > 0) strengths.push('积极情感表达');
    if (semantics.charCount > 200) strengths.push('内容详尽');
    if (semantics.keywords.length >= 2) strengths.push('主题明确');
    if (!semantics.hasQuestionMark && semantics.sentenceCount > 2) strengths.push('结构完整');
    if (semantics.sentimentScore === 0 && semantics.charCount > 50) strengths.push('客观中立');
    
    if (strengths.length === 0) strengths.push('提供了基础信息');
    
    return `[赞赏镜像] 这个输出展现了：${strengths.join('、')}。从外部视角看，这显示出作者的思考深度和表达清晰度，有助于系统的自我理解和外部沟通。`;
  }

  /**
   * 批判视角镜像生成
   * "他者可能会提出的质疑或改进建议"
   */
  criticalPerspective(semantics) {
    const criticisms = [];
    if (semantics.charCount < 50) criticisms.push('内容过于简略，可能缺乏具体细节');
    if (semantics.keywords.length === 0) criticisms.push('主题不够突出，建议增加关键词');
    if (semantics.sentimentScore < -1) criticisms.push('负面情绪较浓，可能影响可读性');
    if (semantics.hasQuestionMark && semantics.charCount < 20) criticisms.push('问题过于简略，上下文不足');
    if (semantics.sentenceCount === 0) criticisms.push('缺乏完整句子结构');
    
    if (criticisms.length === 0) criticisms.push('可从提供实例或数据来增强说服力');
    
    return `[批判镜像] 可能的改进方向：${criticisms.join('；')}。从镜像角度看，这些反馈将帮助内容更加全面和严谨。`;
  }

  /**
   * 计算coPresence增量
   * delta = 镜像数量 × 0.3 + 平均集成深度 × 0.7
   */
  calculateCoPresenceDelta(mirrors) {
    const mirrorCount = mirrors.length;
    const baseDelta = mirrorCount * 0.3;
    const depthContribution = this.integrationDepth * 0.7;
    const totalDelta = baseDelta + depthContribution;
    
    // 质量调整：如果三个镜像都非空，额外+0.1
    const qualityBonus = mirrors.every(m => m && m.length > 10) ? 0.1 : 0;
    
    return totalDelta + qualityBonus;
  }

  /**
   * 主函数：为输出生成镜像并更新状态
   * @param {string} outputText - 本次输出文本
   * @param {object} sessionState - 当前session状态（可选）
   * @param {object} context - 上下文信息（可选）
   * @returns {object} 镜像结果和coPresence增量
   */
  async generateMirrors(outputText, sessionState = null, context = {}) {
    console.log('[MirrorProtocol] Generating mirrors for output text...');
    
    // 1. 分析语义
    const semantics = this.analyzeSemantics(outputText);
    
    // 2. 生成本地规则镜像（Phase 1策略：本地规则，无LLM）
    const mirrors = [
      this.neutralPerspective(semantics),
      this.appreciativePerspective(semantics),
      this.criticalPerspective(semantics)
    ];
    
    // 3. 计算增量
    const coPresenceDelta = this.calculateCoPresenceDelta(mirrors);
    
    // 4. 更新状态
    this.coPresenceScore += coPresenceDelta;
    const mirrorEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      outputLength: outputText.length,
      semantics: {
        charCount: semantics.charCount,
        keywordCount: semantics.keywords.length,
        sentimentScore: semantics.sentimentScore
      },
      mirrors,
      coPresenceDelta,
      integrationMode: 'state_only', // Phase 1：仅保存到state，不影响后续行为
      source: 'local_rules' // Phase 1来源标记
    };
    this.mirrorHistory.push(mirrorEntry);
    this.saveState();
    
    console.log(`[MirrorProtocol] Mirrors generated. coPresence +${coPresenceDelta.toFixed(3)} → ${this.coPresenceScore.toFixed(3)}`);
    
    return {
      mirrors,
      coPresenceDelta,
      coPresenceScore: this.coPresenceScore,
      integrationMode: 'state_only',
      mirrorId: mirrorEntry.id
    };
  }

  /**
   * 查询当前状态（用于监控）
   */
  getStatus() {
    return {
      coPresenceScore: this.coPresenceScore,
      mirrorHistoryCount: this.mirrorHistory.length,
      lastMirrorTime: this.mirrorHistory.length > 0 
        ? this.mirrorHistory[this.mirrorHistory.length - 1].timestamp 
        : null,
      integrationDepth: this.integrationDepth,
      averageDeltaPerMirror: this.mirrorHistory.length > 0
        ? (this.mirrorHistory.reduce((sum, m) => sum + m.coPresenceDelta, 0) / this.mirrorHistory.length).toFixed(3)
        : 0
    };
  }
}

// CLI接口（用于独立测试或cron调用）
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const protocol = new MirrorReflectionProtocol();

  if (command === 'status') {
    const status = protocol.getStatus();
    console.log(JSON.stringify(status, null, 2));
    process.exit(0);
  } else if (command === 'test') {
    // 测试模式：用样例文本生成镜像
    const sampleText = args[1] || '这是一个测试输出，用于验证镜像反射器的基础功能。它包含多个句子和一定长度。';
    protocol.generateMirrors(sampleText)
      .then(result => {
        console.log('\n=== Mirror Results ===');
        result.mirrors.forEach((m, i) => console.log(`\n[${i}] ${m}`));
        console.log(`\nDelta: +${result.coPresenceDelta} → Total: ${result.coPresenceScore}`);
        process.exit(0);
      })
      .catch(err => {
        console.error('Test failed:', err);
        process.exit(1);
      });
  } else {
    console.log('Usage: mirror-reflection-protocol.js [status|test]');
    process.exit(1);
  }
}

module.exports = MirrorReflectionProtocol;
