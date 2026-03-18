# OpenClaw 备份

这是 OpenClaw 的完整备份，包括配置、Skills、记忆和工作区。

## 备份内容

- ✅ `openclaw.json` - 主配置文件
- ✅ `workspace/` - 工作区（记忆、技能、脚本）
- ✅ `extensions/openclaw-lark` - 飞书插件
- ✅ `skills/` - 所有技能

## 恢复步骤

### 1. 安装 OpenClaw

```bash
npm install -g openclaw
```

### 2. 恢复备份

```bash
# 停止网关
openclaw gateway stop

# 复制备份文件
cp -r openclaw-backup/* ~/.openclaw/

# 重启网关
openclaw gateway start
```

### 3. 重新授权

- 飞书插件需要重新扫码授权
- 其他插件可能需要重新配置 API Key

## 备份时间

$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## 重要提示

- ⚠️ 备份包含敏感配置，请保持私有
- 🔒 建议开启 GitHub 私有仓库
- 📦 定期更新备份
