---
name: "qq-bot-connect"
description: "Connect to QQ Bot using QQ Open Platform API. Invoke when setting up QQ bot integration, troubleshooting WebSocket authentication, or configuring mom-qq agent."
---

# QQ 机器人连接指南 (QQ Bot Connection Guide)

## 概述

连接 QQ 官方开放平台机器人，使用 WebSocket 接收消息并转发给 Agent 处理。

## 关键配置

### 1. 环境变量

```powershell
$env:QQ_APP_ID="你的AppID"
$env:QQ_APP_SECRET="你的AppSecret"
$env:QQ_TOKEN="你的Token"  # 可选，WebSocket认证使用access_token
$env:QQ_API_URL="https://sandbox.api.sgroup.qq.com"  # 沙箱环境
$env:QQ_INTENTS="4609"  # GUILDS(1) | GUILD_MESSAGES(512) | DIRECT_MESSAGE(4096)
```

### 2. Intents 计算

```
GUILDS = 1 << 0 = 1          # 频道相关事件
GUILD_MESSAGES = 1 << 9 = 512    # 频道消息（私域机器人）
DIRECT_MESSAGE = 1 << 12 = 4096  # 私信消息

总和 = 1 + 512 + 4096 = 4609
```

## ⚠️ 关键要点 (Critical Points)

### WebSocket 认证 Token 格式

**❌ 错误格式：**
```javascript
token: `Bot ${appId}.${token}`  // 这是文档说的，但实际不行
token: `Bot ${appId}.${access_token}`
```

**✅ 正确格式：**
```javascript
token: `QQBot ${access_token}`  // 使用通过API获取的access_token
```

### 获取 Access Token

```javascript
const response = await fetch("https://bots.qq.com/app/getAppAccessToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        appId: "你的AppID",
        clientSecret: "你的AppSecret"
    })
});
const { access_token, expires_in } = await response.json();
```

### WebSocket Identify 消息

```javascript
{
    op: 2,
    d: {
        token: `QQBot ${access_token}`,  // 关键：使用QQBot前缀
        intents: 4609,
        shard: [0, 1],
        properties: {
            "$os": "windows",
            "$browser": "mom-bot",
            "$device": "mom-bot"
        }
    }
}
```

## 常见问题

### 1. 4004 Authentication fail
- 原因：Token格式不正确
- 解决：使用 `QQBot ${access_token}` 格式

### 2. 频率限制 (100017)
- 原因：频繁重连触发限制
- 解决：等待2-3分钟后重试

### 3. 404 不支持的调用
- 原因：沙箱环境不支持某些API
- 解决：忽略这些错误，不影响WebSocket连接

## 启动脚本示例

```powershell
# run-mom-qq.ps1
$env:QQ_APP_ID="102844518"
$env:QQ_APP_SECRET="你的AppSecret"
$env:QQ_API_URL="https://sandbox.api.sgroup.qq.com"
$env:QQ_INTENTS="4609"
$env:ANTHROPIC_API_KEY="你的API密钥"

Write-Host "Starting QQ Bot (Sandbox Mode)..."
cd 项目目录\packages\mom
node dist/mom-qq.js 工作目录
```

## 架构流程

```
用户QQ消息 → QQ服务器 → WebSocket → mom-qq → Agent处理 → 返回结果 → QQ服务器 → 用户
```

## 参考文档

- QQ机器人官方文档：https://bot.q.qq.com/wiki/
- WebSocket接入：https://bot.q.qq.com/wiki/develop/api-v2/dev-prepare/interface-framework/reference.html
- 事件订阅：https://bot.q.qq.com/wiki/develop/api-v2/dev-prepare/interface-framework/event-emit.html
