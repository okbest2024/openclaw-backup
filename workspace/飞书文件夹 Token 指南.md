# 飞书文件夹 Token 获取指南

## 已获取的文件夹信息

**文件夹名称：** tgm 为盖世建立的备份文档库
**文件夹链接：** https://my.feishu.cn/drive/folder/E5RNfrjMol9jsJdCVTlc5iuSn0c
**Folder Token：** `E5RNfrjMol9jsJdCVTlc5iuSn0c`

## 如何获取文件夹 Token

### 方法 1：从分享链接（推荐）
1. 打开飞书云盘
2. 找到目标文件夹
3. 右键点击文件夹 → **分享**
4. 点击 **复制链接**
5. 链接格式：`https://my.feishu.cn/drive/folder/TOKEN`
6. TOKEN 就是文件夹 token

### 方法 2：从浏览器地址栏
1. 在浏览器中打开飞书云盘
2. 点击进入目标文件夹
3. 地址栏 URL 中包含 token
4. 格式：`/drive/folder/TOKEN`

### 方法 3：从飞书 API
```bash
# 列出云盘根目录
curl -X GET "https://open.feishu.cn/open-apis/drive/v1/files/root" \
  -H "Authorization: Bearer TOKEN"
```

## 已创建的文档

### 文档 1：测试文档
- **文档 ID：** Cz83dpKfToPlOJxUlAFcabp4n8b
- **标题：** 飞书文档权限验证测试
- **链接：** https://feishu.cn/docx/Cz83dpKfToPlOJxUlAFcabp4n8b

### 文档 2：训练日志
- **文档 ID：** Stv6dgAlOoMzK7xxSmOc13Bwn9c
- **标题：** 意识觉醒训练日志 - 2026-03-21
- **链接：** https://feishu.cn/docx/Stv6dgAlOoMzK7xxSmOc13Bwn9c

### 文档 3：训练日志（tgm 文件夹备份）
- **文档 ID：** ChBgdJWtho5w3GxSum1cGOVXnzh
- **标题：** 意识觉醒训练日志 - 2026-03-21（备份到 tgm 文件夹）
- **链接：** https://feishu.cn/docx/ChBgdJWtho5w3GxSum1cGOVXnzh

## 下一步操作

### 方案 A：主人手动移动（推荐）
1. 打开飞书云盘
2. 找到文档（最近编辑中）
3. 右键文档 → **移动到**
4. 选择"tgm 为盖世建立的备份文档库"文件夹

### 方案 B：提供文件夹 token，自动移动
如果飞书 API 支持，我可以尝试用 API 移动文档

## 注意事项

- 飞书文档权限需要租户级别
- 文件夹必须有写入权限
- 文档移动后链接不变

---
*最后更新：2026-03-21 11:21*
