# 批量安装技能脚本 - 分批处理避免速率限制
param(
    [int]$BatchSize = 10,
    [int]$DelaySeconds = 3
)

$skillsToInstall = @(
    # 开发工具类
    "exa-tool", "automation-tool", "cli-tool-generator", "tool", "tooldyn",
    "postgres-tool", "ai-tools", "skill-toolkit", "apitools", "simple-pdf-toolkit",
    
    # 搜索类
    "searxng-tool-for-openclaw", "social-auto-tool-builder", "webmcp", "web-mcp",
    
    # AI/ML类
    "minimax-coding-plan-tool", "color-grading-tool", "camoufox-tools",
    "ydc-ai-sdk-integration", "qveris", "mcp-adapter", "composio-integration",
    
    # 其他工具
    "qverisai", "ag-earth", "sidecar-onestep", "agent-cli-orchestrator",
    "ai-cli-builder", "openclaw-cursor-agent", "trustloop", "claw-reliability",
    "okx-trade", "endeffector", "venn", "cookiy", "huo15-prompt",
    "data-generator-waai", "shopyo", "lark-file-sender",
    "openbrand-asset-extraction", "keyid-agent-kit-mcp", "currency-forecast",
    "lx-minimax", "color-grading-ai", "video-trimmer", "xiaoding-deep-research"
)

Write-Host "=== 批量安装技能 ===" -ForegroundColor Cyan
Write-Host "总技能数: $($skillsToInstall.Count)" -ForegroundColor Yellow
Write-Host "每批数量: $BatchSize" -ForegroundColor Yellow
Write-Host "间隔时间: ${DelaySeconds}s" -ForegroundColor Yellow
Write-Host ""

$success = 0
$failed = 0
$skipped = 0

for ($i = 0; $i -lt $skillsToInstall.Count; $i += $BatchSize) {
    $batch = $skillsToInstall[$i..([Math]::Min($i + $BatchSize - 1, $skillsToInstall.Count - 1))]
    $batchNum = [Math]::Floor($i / $BatchSize) + 1
    $totalBatches = [Math]::Ceiling($skillsToInstall.Count / $BatchSize)
    
    Write-Host "--- 批次 $batchNum/$totalBatches ---" -ForegroundColor Cyan
    
    foreach ($skill in $batch) {
        Write-Host "安装 $skill ..." -NoNewline
        
        try {
            $output = & npx clawhub install $skill 2>&1
            $exitCode = $LASTEXITCODE
            
            if ($exitCode -eq 0) {
                if ($output -match "already installed" -or $output -match "exists") {
                    Write-Host " 跳过(已安装)" -ForegroundColor Gray
                    $skipped++
                } else {
                    Write-Host " ✓" -ForegroundColor Green
                    $success++
                }
            } else {
                Write-Host " ✗ ($output)" -ForegroundColor Red
                $failed++
            }
        }
        catch {
            Write-Host " ✗ (错误: $_)" -ForegroundColor Red
            $failed++
        }
    }
    
    if ($i + $BatchSize -lt $skillsToInstall.Count) {
        Write-Host "等待 ${DelaySeconds}秒..." -ForegroundColor Gray
        Start-Sleep -Seconds $DelaySeconds
    }
}

Write-Host ""
Write-Host "=== 安装完成 ===" -ForegroundColor Cyan
Write-Host "成功: $success" -ForegroundColor Green
Write-Host "失败: $failed" -ForegroundColor Red
Write-Host "跳过: $skipped" -ForegroundColor Yellow
Write-Host "总计: $($success + $failed + $skipped)"
