# OpenClaw Agent 优化配置指南

*基于乐天玩AI分享的技巧整理*

---

## 核心问题

**症状**：简单任务却想了很久，token 刷了一堆

**原因**：
1. 上下文过长，携带过多历史信息
2. 模型过度思考，生成不必要的详细解释
3. 没有合理的 token 预算控制
4. 技能调用不够精准

---

## 优化技巧

### 1. 上下文压缩（Compaction）

**配置 `openclaw.json`**：

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "mode": "safeguard",
        "threshold": 0.7,
        "strategy": "summarize"
      }
    }
  }
}
```

**说明**：
- `threshold: 0.7` - 当上下文使用超过70%时自动压缩
- `strategy: "summarize"` - 使用摘要方式压缩，保留关键信息

### 2. 模型选择优化

**简单任务用轻量模型**：

```json
{
  "agents": {
    "defaults": {
      "models": {
        "bailian/kimi-k2.5": {
          "cost": {
            "input": 0,
            "output": 0
          }
        },
        "bailian/qwen3.5-plus": {
          "cost": {
            "input": 0,
            "output": 0
          }
        }
      }
    }
  }
}
```

**策略**：
- 日常对话 → 轻量模型（kimi-k2.5）
- 代码任务 → 专用模型（qwen3-coder-plus）
- 复杂推理 → 强模型（qwen3-max）

### 3. 技能精准调用

**避免不必要的技能加载**：

```json
{
  "agents": {
    "defaults": {
      "tools": {
        "filter": {
          "mode": "explicit"
        }
      }
    }
  }
}
```

**使用技巧**：
- 明确指定需要的技能
- 避免自动加载全部技能
- 定期清理不用的技能

### 4. 提示词优化

**简短明确的指令**：

```markdown
❌ 低效："请你帮我分析一下这个问题，详细地、全面地考虑一下各种可能性..."

✅ 高效："总结以下三点：1.核心问题 2.解决方案 3.预期结果"
```

### 5. 会话管理

**定期清理会话**：

```bash
# 查看会话列表
openclaw sessions list

# 清理旧会话
openclaw sessions clean --older-than 7d
```

### 6. Token 预算控制

**设置最大 token 限制**：

```json
{
  "agents": {
    "defaults": {
      "model": {
        "maxTokens": 2048,
        "maxContextTokens": 8000
      }
    }
  }
}
```

---

## 快速优化清单

- [ ] 启用上下文自动压缩
- [ ] 为不同任务配置不同模型
- [ ] 精简提示词，明确指令
- [ ] 定期清理历史会话
- [ ] 设置合理的 token 预算
- [ ] 按需加载技能

---

## 监控与诊断

**查看 token 使用情况**：

```bash
openclaw status
```

**分析会话成本**：

```bash
openclaw sessions history --session <session-key> --cost
```

---

## 参考配置

**推荐配置（平衡性能与成本）**：

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "bailian/kimi-k2.5",
        "fallbacks": ["bailian/qwen3.5-plus"],
        "maxTokens": 4096,
        "maxContextTokens": 16000
      },
      "compaction": {
        "mode": "safeguard",
        "threshold": 0.75
      },
      "tools": {
        "filter": {
          "mode": "auto"
        }
      }
    }
  }
}
```

---

*整理时间：2026-03-20*  
*来源：乐天玩AI分享*  
*整理者：盖世 baby 🦞*
