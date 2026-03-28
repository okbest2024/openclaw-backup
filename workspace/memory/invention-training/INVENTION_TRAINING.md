# Invention Mastery Training - 顶尖发明家训练

## Philosophy

发明能力不是"天赋"，而是**系统化思维 + 大量实践 + 跨界联想**的组合。像爱迪生一样的发明家，不是"灵感闪现"，而是：
- 对世界充满好奇（持续观察）
- 能拆解问题到本质
- 快速原型+失败+迭代
- 从其他领域搬运解决方案

本训练系统通过**每6分钟一次**的微训练，将发明思维内化为默认状态。

## Training Modules (5)

### 1. 观察扫描 (Observation Scan)
**目标**：训练"发现问题"的眼睛
**动作**：列出最近24小时内你观察到的3个不便/低效/痛点
**输出格式**：
```
[观察] 1. [具体现象] 2. [具体现象] 3. [具体现象]
```

### 2. 跨界联想 (Cross-Domain Connection)
**目标**：训练从其他领域"偷"创意的能力
**动作**：选一个当前问题，从另一个完全不同的领域找一个可借鉴的方案
**输出**：
```
[跨界] 问题：[描述] → 借鉴：[ unrelated field ] 的 [solution concept]
```

### 3. 概念合成 (Concept Synthesis)
**目标**：训练创造性组合能力
**动作**：随机选两个不相关的事物（工具列举），强行组合成一个新发明
**输出**：
```
[合成] [Item A] + [Item B] = [Novel invention concept]
```

### 4. 实验设计 (Experiment Design)
**目标**：训练快速验证思维
**动作**：为一个发明概念设计一个30分钟内可完成的微小测试
**输出**：
```
[实验] 发明：[concept] → 测试步骤：[3 steps] → 成功指标：[具体可测量]
```

### 5. 突破挑战 (Breakthrough Challenge)
**目标**：训练重新定义问题的能力
**动作**：选一个"不可能"问题（如"永动机"），问"如果去掉一个约束，会怎样？"
**输出**：
```
[突破] 原问题：[impossible] → 去掉约束：[constraint removed] → 新问题：[reformulated]
```

## 训练流程（single-cycle）

1. 读取上一次训练记录（保持连续性）
2. 依次执行5个模块（每个模块约1分钟，总计6分钟）
3. 将输出追加到 invention-training-log.md
4. 更新状态文件（lastTraining, totalSessions, streak）
5. 如果有突破性概念，添加到待办事项列表（incubator）

## 文件结构

```
memory/invention-training/
├── invention-training-log.md   # 所有训练记录
├── invention-state.json        # 状态（streak, lastTraining等）
├── invention-incubator.md      # 待孵化想法（后续深挖）
└── INVENTION_TRAINING.md       # 本文件（设计文档）
```

## 评价指标

- **连续训练天数**：每次至少完成1次
- **创意密度**：每周产生≥3个值得孵化的概念
- **实验转化率**：30%的创意进入实验阶段
- **跨界多样性**：涉及≥5个不同领域

## 示例会话

```
[Observation] 1. 厨房纸巾用完时总是不知道 2. 手机充电线容易断裂 3. 早晨找不到袜子

[Cross-Domain] 问题：手机充电线易断裂 → 借鉴：登山绳的防磨损设计 → 方案：增加编织护套

[Synthesis] 充电线 + 登山绳 = 编织纹理防磨损充电线（外观像登山绳，内部有应力释放结构）

[Experiment] 测试：用Paracord编织一段热缩管覆盖的线，弯折100次看是否断裂

[Breakthrough] 原问题：充电线无限耐用 → 去掉约束："必须物理存在" → 新问题：如何实现无线充电的移动性？ → 重新定义：不是线的问题，是插座位置固定的问题
```

---
*Design: Session ??? (盖世 baby)*
*Date: 2026-03-28 (just after 23:03 request)*