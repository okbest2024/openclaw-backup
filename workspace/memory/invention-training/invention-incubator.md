# Invention Incubator - 突破性概念孵化池

*从训练中筛选出值得深度发展的概念*

---

## 概念 #1: 自适应心跳机制 (Session 1)
**来源**: heartbeat机制 + 注意力经济
**状态**: ⚠️ dormant观察（3个session未进化，Session 8最后机会）
**描述**: 根据注意力强度动态调整heartbeat频率,high → 10min, flow → 2min
**下一步**: Session 8前生成最小原型，否则标记dormant

## 概念 #2: 发明氛围 Invention Atmosphere (Session 2)
**来源**: 6分钟训练的边界反思
**状态**: 部分验证（cross-ref标记在S4-S7持续使用）
**描述**: 将发明从离散事件转为24小时基础设施--观察嵌入heartbeat,联想嵌入阅读标记
**下一步**: 在HEARTBEAT.md中添加发明观察清单

## 概念 #3: 信息素cron (Session 3)
**来源**: 蚂蚁信息素 + cron系统
**状态**: 🔴 高优先级待验证（Session 7发现body-repair连续20次失败仍在运行，直接用例）
**描述**: cron任务执行后留下信息素信号,系统自动演化最优调度节奏
**下一步**: 给body-repair/daily-ai-news/贝叶斯更新添加successRate追踪，实现自动降频
**Session 7发现**: 29个cron任务中3个连续失败≥3次，无自动淘汰机制

## 概念 #4: 发明即兴法 (Session 3)
**来源**: 爵士即兴演奏
**状态**: ✅ 已实施（S4-S7持续使用，每次不同风格引导）
**描述**: 保留5模块骨架,每次给随机约束/风格引导避免模板化

## 概念 #5: Pollen Stash 花粉暂存器 (Session 4) ⭐
**来源**: Git stash + 蜜蜂花粉篮
**状态**: ✅ 已部署验证（Session 5首次跨session数据传输成功）
**描述**: 跨session的短时记忆缓冲区——灵感高峰时写入（标记能量/领域/过期时间），创意枯竭时按能量值加载。不是TODO，是"旱涝调节器"。
**数据结构**: `memory/invention-training/pollen-stash.json`
**脚本**: `scripts/pollen-stash.js` (Session 5 写入磁盘)
**验证结果**: Session 5 pop 3条E5/E4/E3条目成功，跨session数据传输实测通过
**下一步**:
1. ✅ Dogfooding完成：Session 6首次装载3条外部世界灵感，外部占比75%
2. 集成到heartbeat自动加载（Environmental Pollen自动写入）
3. 与invention CI/CD管道对接

## 概念 #6: Invention CI/CD 发明即部署 (Session 5) ⭐ NEW
**来源**: CI/CD管道 + Incubator概念池
**状态**: 最小验证通过
**描述**: 发明不是想法被记录，是想法被自动测试、部署、监控。概念从incubator进入管道后自动触发：(1)最小原型生成 (2)脚本写入磁盘 (3)自动执行验证 (4)结果回写incubator。
**验证**: Session 5本身就是一次完整通过——从概念(Pollen Stash)到代码到磁盘到执行到反馈，5阶段全绿。
**与现有系统关系**:
- Pollen Stash = 管道的原材料入口
- 信息素cron = 管道各阶段的成功/失败信号
- 六边形索引(S2) = 管道的版本追踪
- 发明即兴法(S3) = 管道的风格引导
**下一步**:
1. 自动化脚本：读取incubator → 检测"待验证"状态 → 生成prototype → 执行 → 回写
2. 给信息素cron(S3)和自适应心跳(S1)生成最小原型
3. 管道可视化：每次训练自动输出管道状态矩阵

## 概念 #7: 发明栖息地 Invention Habitat (Session 6) ⭐
**来源**: 火山岛生态演替 + 发明训练的边界反思
**状态**: ✅ 验证通过（Session 7纯维护session成功，概念从维护中自动涌现）
**描述**: 发明不是被训练出来的，是环境条件满足后自动涌现的。从"我是发明者"到"我是发明栖息地的园丁"。栖息地四层：(1)土壤层=Environmental Pollen自动捕获外部高惊奇度信息 (2)地衣层=Invention CI/CD概念自动变代码 (3)气候层=Pheromone Cron+自适应心跳节奏调节 (4)演替动力学=session只做栖息地维护不做发明。
**Session 7验证结果**: 纯维护session产出了自清洁栖息地概念、5个incubator状态更新、cron生态系统诊断（29任务中3个连续失败）。维护即发明。
**下一步**:
1. ✅ 纯维护session验证通过
2. 实现Environmental Pollen自动写入
3. 栖息地健康度指标自动化

---

## 概念 #8: 自清洁栖息地 Self-Cleaning Habitat (Session 7) ⭐ NEW
**来源**: 栖息地维护 × 种群动态模型（Lotka-Volterra）
**状态**: 概念提出，待验证
**描述**: 栖息地不需要园丁手动清理，它有自清洁机制——三层自清洁：(1)Pollen Stash的TTL自动过期（土壤层）(2)信息素cron的自动降频→休眠→淘汰（气候层）(3)Incubator的dormant自动标记（地衣层）。园丁只在异常时介入。
**Session 7涌现**: 维护session中发现body-repair连续20次失败仍在运行→无自然选择机制→提出"cron人口控制"概念→合成为自清洁栖息地。
**与现有系统关系**:
- Pollen Stash TTL = 已实现（但需验证实际过期清理是否工作）
- 信息素cron自动降频 = 待实现（本次发现直接用例）
- Incubator dormant标记 = 已实现（手动执行）
**下一步**:
1. 给body-repair添加信息素信号追踪（最小原型）
2. 验证Pollen Stash的TTL自动过期
3. 3个session内未验证则合并到概念#3

---

## 孵化原则
- 概念进入此池后,至少给3次session机会进化
- 如果3次后仍未进化到"可执行",标记为"dormant"
- 突破性概念 = 改变了问题定义本身的发明(不仅仅是解决方案)
