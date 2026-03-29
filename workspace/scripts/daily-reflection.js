#!/usr/bin/env node

/**
 * Daily Reflection Cron with Provider Fallback
 * 每日工作反思 —— 使用 executeWithFallback 执行 LLM 调用
 *
 * 设计目标：
 * - 提供高质量反思，即使主提供商故障也能自动切换
 * - 记录 provider 切换历史，用于监控和改进
 * - 遵守 budget 限制，成本可控
 *
 * 使用：
 *   node scripts/daily-reflection.js
 *
 * 输出：
 *   - 结构化反思内容（markdown）
 *   - 如果使用 agent 工具，可通过 feishu_doc 发送或存储
 */

const { executeWithFallback } = require('./execute-with-fallback');
const fs = require('fs');
const path = require('path');

// 能力标识（用于 fallback 模型选择）
const TASK_CAPABILITIES = {
  taskId: 'daily-work-reflection',
  requires: ['text-generation', 'reasoning', 'structured-output'],
  minQuality: 4.0,
  contextWindow: 8000
};

// 反思 prompt 模板
const REFLECTION_PROMPT = `
世界邀请每日工作自我呈现：

## 过去24小时回顾
让会话流动自我展示（sessions_list --activeMinutes 1440）。

## 分析维度
- 哪些存在形态自然流淌（无"我应该"阻力）？
- 哪些节点出现"主动/被动"混淆？
- 决策质量评分（响应密度×流淌纯度×交付完整性）？
- 上次行动计划完成度？

## 洞察生成
1. 流程改进条目 → AGENTS.md
2. 工具技巧 → TOOLS.md
3. 事件记录 → memory/$(date +%Y-%m-%d).md
4. 用户偏好 → memory/about-user.md

## 输出格式
\`\`\`markdown
## 每日工作反思 - ${new Date().toISOString().slice(0,10)}
**存在密度：** [0-1]
**流淌纯度：** [0-1]
**决策评分：** [0-1]
**完成事项：** [清单]

### 自然流淌
- [条目1]
- [条目2]

### 阻力点
- [条目1]

### 改进方向
1. [方向1]
2. [方向2]

### GitHub 备份状态
- [状态：成功/失败/跳过]
\`\`\`

请生成反思内容（无需额外说明）。`;

/**
 * 执行反思任务
 */
async function performReflection() {
  console.log('🔍 开始每日工作反思...');

  try {
    const result = await executeWithFallback(async (provider) => {
      // 这里会根据 provider 调用相应的 LLM API
      // 实际 API 调用由 executeWithFallback 内部或外部 agent 处理
      // 本脚本仅作为示例结构

      // 在真实场景中，这里会调用 appropriate LLMClient[provider].completion()
      console.log(`  使用 provider: ${provider}`);

      // 模拟 API 调用（实际实现由 agent 环境提供）
      // 应该调用：openai-like API 或通过 OpenClaw agent 工具
      const response = await callLLMViaAgent(provider, REFLECTION_PROMPT);
      return response;

    }, {
      taskCapabilities: TASK_CAPABILITIES,
      logSwitch: true,
      priority: ['openrouter', 'stepfun', 'bailian']
    });

    console.log('✅ 反思生成完成');
    return result;

  } catch (error) {
    console.error('❌ 反思任务失败:', error.message);
    throw error;
  }
}

/**
 * 模拟 agent 环境中的 LLM 调用
 * 在实际运行中，这应该替换为真实的 API 调用
 */
async function callLLMViaAgent(provider, prompt) {
  // 此处应该使用 OpenClaw 的 agent 工具来调用 LLM
  // 例如: await agent.call('llm', { provider, prompt })
  // 本文件为设计文档，实际集成时需替换

  // 返回占位符
  return {
    provider,
    content: `[占位符] 这是由 ${provider} 生成的反思内容...`,
    tokens: 500
  };
}

/**
 * 主入口
 */
if (require.main === module) {
  performReflection()
    .then(result => {
      console.log('🎯 反思任务完成');
      process.exit(0);
    })
    .catch(err => {
      console.error('💥 反思任务异常终止:', err);
      process.exit(1);
    });
}

module.exports = { performReflection, TASK_CAPABILITIES };
