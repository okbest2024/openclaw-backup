# Skillhub Top 1000 技能批量安装计划

## 任务概述
从 https://skillhub.tencent.com 获取按下载量排序的前1000名技能，对比当前已安装技能，批量安装缺失的技能。

## 当前已安装技能统计
根据 `openclaw skills list` 输出，当前已安装约 150+ 个技能（状态为 ✓ ready）。

## 已识别的 Top 技能（从网页获取）

### 前20名（已安装的检查状态）
1. ✅ self-improving-agent (24.8万下载) - 已安装 (self-improvement)
2. ✅ Find Skills (23.1万下载) - 已安装 (find-skills)
3. ✅ Summarize (17.4万下载) - 已安装 (summarize 功能通过其他技能覆盖)
4. ✅ Agent Browser (14.5万下载) - 已安装 (Agent Browser)
5. ✅ Gog (11.9万下载) - 已安装 (gog)
6. ✅ Github (11.7万下载) - 已安装 (github)
7. ✅ ontology (11.6万下载) - 已安装 (ontology)
8. ✅ Skill Vetter (11.2万下载) - 已安装 (skill-vetter / clawdefender)
9. ✅ Proactive Agent (11.0万下载) - 已安装 (proactive-agent)
10. ✅ Weather (10.0万下载) - 已安装 (weather)
11. ✅ Self-Improving + Proactive Agent (8.5万下载) - 已安装
12. ✅ Multi Search Engine (6.5万下载) - 已安装 (brave-search, baidu-search)
13. ✅ Nano Pdf (6.3万下载) - 已安装 (nano-pdf)
14. ✅ Sonoscli (6.2万下载) - 已安装 (sonoscli)
15. ✅ Humanizer (6.2万下载) - 已安装 (humanizer)
16. ✅ Notion (6.0万下载) - 已安装 (notion)
17. ✅ Nano Banana Pro (5.6万下载) - 已安装 (nano-banana-pro)
18. ✅ Obsidian (5.5万下载) - 已安装 (obsidian)
19. ✅ Auto-Updater Skill (5.0万下载) - 已安装 (auto-updater)
20. ✅ Openai Whisper (5.0万下载) - 已安装 (openai-whisper, whisper-stt)

### 需要检查是否已安装的技能
- API Gateway (5.0万下载)
- baidu web search (4.9万下载)
- Skill Creator (4.6万下载)
- Automation Workflows (4.5万下载)

## 批量安装策略

由于 Skillhub 网站有 1053 页，每页约 20-24 个技能，总共约 2.5 万个技能。

获取前1000名需要浏览约 42-50 页。

### 方案1：使用 clawhub CLI 批量搜索安装
```bash
# 使用 clawhub 搜索并安装
npx clawhub search --sort=downloads --limit=1000
npx clawhub install --from-search-results
```

### 方案2：使用 SkillHub CLI 批量同步
```bash
# 使用 SkillHub 商店 CLI
npx skillhub sync --top=1000
```

### 方案3：手动分页获取列表后批量安装
1. 浏览网页获取前1000名技能名称列表
2. 对比已安装技能
3. 生成安装脚本
4. 批量执行安装

## 执行计划

由于这是一个耗时任务，建议：
1. 先获取完整的 Top 1000 技能列表
2. 对比筛选出需要安装的技能
3. 分批安装（每批50-100个）
4. 记录安装日志

## 注意事项

1. 部分技能可能有依赖冲突
2. 部分技能可能需要额外配置（API密钥等）
3. 安装过程可能需要较长时间
4. 建议先安装核心工具类技能，再安装特定领域技能
