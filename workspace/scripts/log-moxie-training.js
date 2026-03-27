const fs = require('fs');
const logPath = 'memory/moxie-cangyue-learning-log.md';
const now = new Date().toISOString();

const entry = `
## ${now} - 学习《绝对之门》

**作品信息**：绝对之门（奇幻/悬疑，连载中）

**核心设定提炼**：
- 候补机神 utilization 机制
- 门后世界的层级系统
- 性格类型的元叙事处理

**可迁移技巧**：
1. **悬疑构建**：在开篇抛出核心谜题但不解释
2. **层级递进**：每解决一个门，揭示更大的谜团
3. **类型混合**：将哲学问题嵌入动作场景
4. **角色差异化**：通过面对门的反应塑造人格

**状态**：✅ 学习完成（第4分钟间隔触发）

---

`;

fs.appendFileSync(logPath, entry, 'utf8');
console.log('✅ Training entry appended to', logPath);
