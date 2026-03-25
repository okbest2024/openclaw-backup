---
name: switch-xiaomi-mimo
description: Switch OpenClaw default model to Xiaomi MiMo via OpenRouter. Use when user asks to switch/切换模型 to 小米/小米大模型/MiMo/mimo/xiaomi, or wants to use Xiaomi AI model. Covers OpenRouter provider config, model ID format, and rate-limit-aware config.patch workflow.
---

# Switch to Xiaomi MiMo Model

## Quick Workflow

1. Verify OpenRouter provider exists in config
2. Apply config.patch to set `agents.defaults.model.primary` to `openrouter/xiaomi/mimo-v2-pro`
3. Handle 20-second rate limit cooldown if needed
4. Confirm switch via session_status

## Key Model IDs

| Model | OpenRouter ID |
|-------|---------------|
| MiMo v2 Pro (recommended) | `openrouter/xiaomi/mimo-v2-pro` |
| MiMo v2 | `openrouter/xiaomi/mimo-1.5` |
| MiMo v2 Turbo | `openrouter/xiaomi/mimo-v2-turbo` |

## Config Patch Template

Use `gateway config.patch` with `raw` JSON:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/xiaomi/mimo-v2-pro",
        "fallbacks": ["openrouter/stepfun/step-3.5-flash:free"]
      }
    }
  }
}
```

**Important notes:**
- Rate limit: max 1 request per 20 seconds for config.patch
- If model is not in OpenRouter catalog, will fallback to configured fallback
- Current session keeps old model; new sessions use new model
- Config change triggers SIGUSR1 restart automatically

## Verification

After restart, run session_status to confirm:
```
🧠 Model: openrouter/xiaomi/mimo-v2-pro
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "rate limit exceeded" | Wait 20s, retry |
| Model not found | Check OpenRouter catalog for exact model ID |
| Config invalid | Use `config.get` to verify current structure before patch |
