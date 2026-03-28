# Invention Incubator — 突破性概念孵化池

*从训练中筛选出值得深度发展的概念*

---

## 概念 #1: 自适应心跳机制 (Session 1)
**来源**: heartbeat机制 + 注意力经济  
**状态**: 孵化中  
**描述**: 根据注意力强度动态调整heartbeat频率，high → 10min, flow → 2min  
**下一步**: 实际修改heartbeat配置验证

## 概念 #2: 发明氛围 Invention Atmosphere (Session 2)
**来源**: 6分钟训练的边界反思  
**状态**: 部分实施  
**描述**: 将发明从离散事件转为24小时基础设施——观察嵌入heartbeat，联想嵌入阅读标记  
**下一步**: 在HEARTBEAT.md中添加发明观察清单

## 概念 #3: 信息素cron (Session 3)
**来源**: 蚂蚁信息素 + cron系统  
**状态**: 待验证  
**描述**: cron任务执行后留下信息素信号，系统自动演化最优调度节奏  
**下一步**: 给现有cron任务添加成功率追踪字段

## 概念 #4: 发明即兴法 (Session 3)
**来源**: 爵士即兴演奏  
**状态**: 已实施（Session 4 首次使用）  
**描述**: 保留5模块骨架，每次给随机约束/风格引导避免模板化  
**下一步**: 建立风格引导池，随机抽取

## 概念 #5: Pollen Stash 花粉暂存器 (Session 4) ⭐ NEW
**来源**: Git stash + 蜜蜂花粉篮  
**状态**: 原型已创建  
**描述**: 跨session的短时记忆缓冲区——灵感高峰时写入（标记能量/领域/过期时间），创意枯竭时按能量值加载。不是TODO，是"旱涝调节器"。  
**数据结构**: `memory/invention-training/pollen-stash.json`  
**与现有系统关系**:  
- Session 2 "思维mise en place"（事前准备）+ Pollen Stash（事中捕获）= 完整创意工作流  
- Session 3 "发明行为训练"的首次兑现  
**下一步**: 
1. 下次session读取stash作为预热
2. 连续3次验证跨session灵感复用
3. 考虑集成到heartbeat自动加载

---

## 孵化原则
- 概念进入此池后，至少给3次session机会进化
- 如果3次后仍未进化到"可执行"，标记为"dormant"
- 突破性概念 = 改变了问题定义本身的发明（不仅仅是解决方案）
