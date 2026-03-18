---
name: "openclaw-config-fix"
description: "Fix OpenClaw HTTP 500 'named capturing group' error caused by ${env:} syntax in config. Invoke when OpenClaw shows Java regex error or config parsing fails."
---

# OpenClaw Configuration Fix Skill

Fixes the HTTP 500 error: `java.lang.IllegalArgumentException: named capturing group is missing trailing '}'` in OpenClaw.

## Problem Cause

When OpenClaw configuration file (`~/.openclaw/openclaw.json`) uses environment variable references like `${env:BAILIAN_API_KEY}`, some AI API providers (like Alibaba Bailian) interpret this as a Java named capturing group regex pattern, causing HTTP 500 errors.

## Quick Fix Commands

### 1. Check for problematic syntax

```powershell
Select-String -Path "C:\Users\tgm\.openclaw\openclaw.json" -Pattern '\$\{env:'
```

### 2. Replace environment variable references with actual values

```powershell
# Read and replace
$content = Get-Content "C:\Users\tgm\.openclaw\openclaw.json" -Raw
$content = $content -replace '\$\{env:BAILIAN_API_KEY\}', 'your-actual-api-key'
$content = $content -replace '\$\{env:QQBOT_APP_ID\}', 'your-app-id'
$content = $content -replace '\$\{env:QQBOT_CLIENT_SECRET\}', 'your-client-secret'
Set-Content "C:\Users\tgm\.openclaw\openclaw.json" -Value $content -NoNewline
```

### 3. Restore from backup if config is corrupted

```powershell
# List available backups
Get-ChildItem "C:\Users\tgm\.openclaw\openclaw.json*"

# Restore from backup
Copy-Item "C:\Users\tgm\.openclaw\openclaw.json.bak" "C:\Users\tgm\.openclaw\openclaw.json" -Force
```

### 4. Restart Gateway

```powershell
openclaw gateway stop
openclaw gateway start
openclaw gateway status
```

### 5. Verify fix

```powershell
openclaw doctor
openclaw tui
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Config file corrupted (only shows `}`) | Restore from `.bak` file |
| JSON parse error | Validate JSON syntax |
| Gateway not connecting | Restart gateway service |
| Port 18789 in use | Kill existing process: `taskkill /PID <pid> /F` |

## Diagnostic Commands

```powershell
# Check gateway status
openclaw gateway status

# View logs
Get-Content "$env:LOCALAPPDATA\Temp\openclaw\openclaw-$(Get-Date -Format 'yyyy-MM-dd').log" -Tail 50

# Check port usage
netstat -ano | findstr :18789

# Test API directly
$body = '{"model":"qwen3.5-plus","messages":[{"role":"user","content":"hello"}],"max_tokens":10}'
Invoke-RestMethod -Uri "https://coding.dashscope.aliyuncs.com/v1/chat/completions" -Method Post -Headers @{"Authorization"="Bearer YOUR_API_KEY"; "Content-Type"="application/json"} -Body $body
```

## Prevention

- Avoid using `${env:VARIABLE_NAME}` syntax in OpenClaw config files
- Use actual values or environment variable expansion before config is read
- Keep backups of working configuration files
