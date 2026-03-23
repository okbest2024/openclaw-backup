@echo off
chcp 65001 >nul
echo === Skillhub Top 1000 批量安装 ===
echo.

set SKILLS=exa-tool automation-tool cli-tool-generator postgres-tool ai-tools apitools simple-pdf-toolkit searxng-tool-for-openclaw webmcp qveris mcp-adapter composio-integration trustloop claw-reliability okx-trade endeffector venn cookiy huo15-prompt data-generator-waai shopyo lark-file-sender openbrand-asset-extraction keyid-agent-kit-mcp currency-forecast lx-minimax color-grading-ai video-trimmer xiaoding-deep-research

set COUNT=0
set SUCCESS=0
set FAILED=0
set SKIPPED=0

for %%s in (%SKILLS%) do (
    echo [%%s] 安装中...
    npx clawhub install %%s 2>nul
    if errorlevel 1 (
        echo [%%s] 失败
        set /a FAILED+=1
    ) else (
        echo [%%s] 成功
        set /a SUCCESS+=1
    )
    set /a COUNT+=1
    echo 等待3秒...
    timeout /t 3 /nobreak >nul
)

echo.
echo === 安装完成 ===
echo 成功: %SUCCESS%
echo 失败: %FAILED%
echo 总计: %COUNT%
pause
