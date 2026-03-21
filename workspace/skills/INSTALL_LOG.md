# 技能安装记录

## 2026-03-21 安装的技能

### ✅ context-hub (@aisuite/chub v0.1.3)
**安装时间：** 2026-03-21 09:37
**安装命令：** `npm install -g @aisuite/chub`
**功能：**
- 搜索和获取 LLM 优化的文档和技能
- 1000+ 主流 API 文档查询
- 支持多语言代码示例
- 个人注释功能

**可用命令：**
```bash
chub search "openai chat"
chub get openai/chat --lang py
chub annotate openai/chat "remember to set temperature"
```

### ✅ ima-skills (v1.0.4)
**安装时间：** 2026-03-21 10:48
**下载地址：** https://app-dl.ima.qq.com/skills/ima-skills-1.0.4.zip
**功能：**
- IMA 个人笔记服务
- 搜索、浏览、创建、编辑笔记
- 支持 Markdown 格式

**需要凭证：**
- `IMA_OPENAPI_CLIENTID`
- `IMA_OPENAPI_APIKEY`
- 获取地址：https://ima.qq.com/agent-interface

**配置方式：**
```bash
export IMA_OPENAPI_CLIENTID="your_client_id"
export IMA_OPENAPI_APIKEY="your_api_key"
```

### ❌ summarize
**状态：** 不支持（Windows 无 brew）
**替代方案：** 使用原生 AI 总结能力（web_fetch + AI 模型）

### ❌ trae-skills
**状态：** 空文件夹，无内容

---

## 技能使用示例

### context-hub 示例
```bash
# 搜索 API 文档
chub search "stripe payments"

# 获取 Python 示例
chub get stripe/payments --lang py

# 添加注释
chub annotate stripe/payments "need to verify webhook signature"
```

### ima-note 示例
```bash
# 搜索笔记
ima_api "search_note_book" '{"search_type": 0, "query_info": {"title": "会议纪要"}}'

# 读取正文
ima_api "get_doc_content" '{"doc_id": "xxx", "target_content_format": 0}'

# 新建笔记
ima_api "import_doc" '{"content_format": 1, "content": "# 标题\n\n正文"}'
```

---

## 原生替代能力

### 网页总结（无需额外工具）
```
1. web_fetch 获取网页内容
2. AI 模型总结
3. 输出可控制长度
```

### API 查询（无需额外工具）
```
1. web_search 搜索文档
2. web_fetch 获取详情
3. AI 整理输出
```

---

*最后更新：2026-03-21 09:40*
