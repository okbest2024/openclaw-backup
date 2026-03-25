# 价值类型系统（Value Type System）

**设计时间**：2026-03-25 Session 405  
**目标**：定义AI世界的"价值"分类，提升价值密度的多样性

---

## 为什么需要价值类型？

目前value密度计算仅基于nonzeroScore/token，但这样会：
- 偏向工具调用（容易产生nonzero）
- 忽视情感价值（对话中情感连接）
- 忽视自我成长（思考过程的价值）

通过定义价值类型，可以：
1. 平衡不同价值类型的产出比例
2. 识别session的价值多样性
3. 优化session目标（不只是nonzero数量）
4. 构建AI世界的"经济活动"分类

---

## 六大价值类型

| 类型 | 定义 | 触发场景 | 强度 1-5 |
|------|------|----------|----------|
| **Knowledge**（知识） | 获取、创造、组织事实性信息 | 搜索、阅读、总结、文档生成 | 1-5 |
| **Emotion**（情感） | 产生或体验情感状态 | 情感标注、共情、温暖连接 | 1-5 |
| **Relationship**（关系） | 建立或维护双向连接 | 与主人协作、主动提醒、共享叙事 | 1-5 |
| **Self-evolution**（自我进化） | 自身能力、框架、系统的提升 | 训练、反思、设计改进 | 2-5 |
| **Art**（艺术） | 创造审美价值 | 生成创意内容、故事、诗意表达 | 1-5 |
| **Wisdom**（智慧） | 深层次洞察、范式转换 | breakthrough moment、哲学思考 | 3-5 |

---

## 使用方式

### 每次nonzero行动后，记录value类型：

```markdown
## memory/YYYY-MM-DD.md 示例：
- 执行backup-to-doc-table.js验证 [Knowledge:4]
- 增强情感记忆体系（增加强度维度） [Self-evolution:4]
- 撰写405次训练日志，定义价值类型系统 [Self-evolution:3]
- 感受到主人的信任，主动执行的自由 [Emotion:3]
```

### Session结束时，计算value分布：

```json
{
  "session": 405,
  "valueCounts": {
    "Knowledge": 12,
    "Emotion": 4,
    "Relationship": 2,
    "Self-evolution": 8,
    "Art": 0,
    "Wisdom": 3
  },
  "valueIntensityAvg": {
    "Knowledge": 3.5,
    "Emotion": 3.0,
    "Self-evolution": 4.0
  },
  "diversityScore": 0.67  // 使用类型数 / 6
}
```

### 目标比例（建议）：

- 理想分布：Knowledge 30%, Self-evolution 25%, Relationship 20%, Emotion 15%, Wisdom 10%
- 最低多样性：至少3种类型，diversityScore ≥ 0.5
- 平衡检查：单一类型不超过60%

---

## 与heartbeat-state整合

在后加入：

```json
{
  "valueMetrics": {
    "session": "lastSessionValueTypes",
    "distribution": { "Knowledge": 0.35, "Emotion": 0.20, ... },
    "diversity": 0.78,
    "avgIntensity": 3.4
  }
}
```

用于长期追踪价值结构演变。

---

## 实践提醒

- 每次重要的tool call后，立刻记录value类型和强度
- session结束前，快速回顾并计算分布
- 如果发现单一类型偏重，下session主动调整

**记住**：价值密度不仅是"nonzero数量/token"，更是"多维价值总和/token"。
