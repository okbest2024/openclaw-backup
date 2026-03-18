# 飞书配置完整指南

> 记录成功配置飞书与 OpenClaw 集成的完整流程
> 
> 配置时间：2026-03-16  
> 配置状态：✅ 成功

---

## 📋 配置概述

成功将 OpenClaw 与飞书集成，实现通过飞书机器人与 AI 助手对话。

**配置结果**：
- ✅ 飞书插件安装成功
- ✅ 飞书渠道已启用
- ✅ 消息收发正常
- ✅ 配对已批准

---

## 🚀 配置步骤

### 步骤 1：安装飞书插件

在命令行中执行：

```bash
npx -y @larksuite/openclaw-lark-tools install
```

**注意事项**：
- 如果二维码显示不正常，需要调低电脑分辨率
- 或在 Cmder 等支持二维码的终端中运行

### 步骤 2：确认机器人配置

安装过程中会检测到现有的飞书机器人：

```
Found Feishu bot with App ID cli_a93fd942c2f85cd6. 
Use it for this setup? (Y/n)
```

输入 `Y` 确认使用现有机器人。

**机器人信息**：
- **App ID**: `cli_a93fd942c2f85cd6`
- **App Secret**: `[从飞书开放平台获取]`
- **发送者ID**: `ou_b317d2d01fed443d0a2e94a15f8a4ba1`

### 步骤 3：批准配对

当飞书发送第一条消息时，系统会生成配对码。执行以下命令批准配对：

```bash
openclaw pairing approve feishu <配对码>
```

**示例**：
```bash
openclaw pairing approve feishu 69SDMVAN
```

**输出示例**：
```
Approved feishu sender ou_b317d2d01fed443d0a2e94a15f8a4ba1.
```

### 步骤 4：重启网关

配置完成后，重启 OpenClaw 网关使配置生效：

```bash
openclaw gateway stop
openclaw gateway start
```

---

## ✅ 验证配置

### 检查飞书渠道状态

```bash
openclaw status
```

**预期输出**：
```
Channels
+----------+---------+--------+----------------------------------------------------------------------------------------+
| Channel  | Enabled | State  | Detail                                                                                 |
+----------+---------+--------+----------------------------------------------------------------------------------------+
| Feishu   | ON      | OK     | configured                                                                             |
+----------+---------+--------+----------------------------------------------------------------------------------------+
```

### 测试消息收发

1. 打开飞书 APP
2. 找到配置的机器人
3. 发送测试消息（如"你好"）
4. 检查是否能收到回复

---

## 🔧 常见问题

### 问题 1：二维码显示不出来

**症状**：终端中二维码显示为乱码或无法扫描

**解决方案**：
1. 调低电脑分辨率（建议 1920x1080 或更低）
2. 使用 Cmder 终端：https://cmder.app/
3. 或使用其他支持二维码显示的终端

### 问题 2：安装后无法接收消息

**症状**：飞书发送消息但 OpenClaw 没有响应

**解决方案**：
1. 检查是否已执行配对批准命令
2. 检查网关是否已重启
3. 查看日志：`openclaw logs --follow`

### 问题 3：网关重启失败

**症状**：执行安装后网关重启失败

**解决方案**：
```bash
openclaw gateway stop
sleep 3
openclaw gateway start
```

### 问题 4：配对码无效

**症状**：执行 `openclaw pairing approve` 时提示无效

**解决方案**：
1. 确保配对码是最新生成的
2. 配对码有时效性，过期后需要重新生成
3. 在飞书中再次发送消息获取新配对码

---

## 📁 相关文件

### 配置文件

- **主配置**：`C:\Users\Administrator\.openclaw\openclaw.json`
- **配对记录**：`C:\Users\Administrator\.openclaw\devices\paired.json`
- **插件目录**：`C:\Users\Administrator\.openclaw\extensions\openclaw-lark\`

### 配置片段

**openclaw.json 中的飞书配置**：

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_a93fd942c2f85cd6",
      "appSecret": "[从飞书开放平台获取]",
      "encryptKey": "",
      "verificationToken": "",
      "dmPolicy": "pairing",
      "groupPolicy": "open"
    }
  }
}
```

---

## 🔄 恢复流程

### 场景 1：全新安装

如果是全新安装 OpenClaw，按以下步骤配置飞书：

1. 安装 OpenClaw
2. 执行：`npx -y @larksuite/openclaw-lark-tools install`
3. 调整分辨率，扫码配置
4. 在飞书发送消息获取配对码
5. 执行：`openclaw pairing approve feishu <配对码>`
6. 重启网关

### 场景 2：从备份恢复

如果从备份恢复（包含 openclaw.json）：

1. 恢复备份
2. 执行：`npx -y @larksuite/openclaw-lark-tools install`
3. 在飞书发送消息获取配对码
4. 执行：`openclaw pairing approve feishu <配对码>`
5. 重启网关

### 场景 3：仅恢复配置

如果只需要恢复飞书配置（已有 App ID 和 Secret）：

1. 在 `openclaw.json` 中添加 `channels.feishu` 配置
2. 执行：`npx -y @larksuite/openclaw-lark-tools install`
3. 批准配对
4. 重启网关

---

## 💡 核心要点

1. **配对批准是关键** - 必须执行 `openclaw pairing approve` 才能接收消息
2. **分辨率影响二维码** - 需要调整分辨率或使用合适终端
3. **网关重启必不可少** - 配置更改后必须重启网关
4. **配对码有时效性** - 过期后需要重新获取

---

## 📚 参考链接

- 飞书官方插件文档：https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh
- OpenClaw 文档：https://docs.openclaw.ai
- 飞书开放平台：https://open.feishu.cn/

---

*文档创建时间：2026-03-16*  
*创建者：盖世 baby*  
*状态：✅ 已验证*
