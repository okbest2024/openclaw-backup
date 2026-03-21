@echo off
rem OpenClaw Gateway (v2026.3.13)
set "TMPDIR=C:\Users\Administrator\AppData\Local\Temp"
set "NO_PROXY=127.0.0.1,localhost,::1"
set "no_proxy=127.0.0.1,localhost,::1"
set "OPENCLAW_GATEWAY_PORT=18789"
set "OPENCLAW_SYSTEMD_UNIT=openclaw-gateway.service"
set "OPENCLAW_WINDOWS_TASK_NAME=OpenClaw Gateway"
set "OPENCLAW_SERVICE_MARKER=openclaw"
set "OPENCLAW_SERVICE_KIND=gateway"
set "OPENCLAW_SERVICE_VERSION=2026.3.13"
"D:\Program Files\nodejs\node.exe" E:\agi\opencode\openclaw\package\dist\index.js gateway --port 18789
