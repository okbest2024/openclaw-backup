# OpenClaw Workspace Backup Script
# Usage: .\backup-workspace.ps1 [-Message "backup message"]

param([string]$Message = "Regular backup")

$WORKSPACE = "C:\Users\Administrator\.openclaw\workspace"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$TAG_NAME = "backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OpenClaw Backup Tool" -ForegroundColor Cyan
Write-Host "  by Gai Shi Baby" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Write-Info { param($msg); Write-Host "[INFO] $msg" -ForegroundColor Blue }
function Write-OK { param($msg); Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg); Write-Host "[WARN] $msg" -ForegroundColor Yellow }

Write-Info "Workspace: $WORKSPACE"
if (!(Test-Path $WORKSPACE)) {
    Write-Host "[ERROR] Workspace not found" -ForegroundColor Red
    exit 1
}
Set-Location $WORKSPACE

if (!(Test-Path .git)) {
    Write-Host "[ERROR] Git not initialized" -ForegroundColor Red
    exit 1
}
Write-OK "Git ready"

# Add all
Write-Info "Adding all files..."
git add . | Out-Null
Write-OK "Files added"

# Commit
$commitMsg = "backup: $Message [$TIMESTAMP]"
Write-Info "Committing: $commitMsg"
git commit -m $commitMsg --allow-empty | Out-Null
Write-OK "Committed"

# Tag
Write-Info "Creating tag: $TAG_NAME"
git tag -a $TAG_NAME -m "Backup: $commitMsg"
Write-OK "Tag created"

# Push
Write-Info "Pushing to remote..."
$pushResult = git push origin main --tags 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-OK "Pushed to GitHub successfully"
} else {
    Write-Warn "Push failed (network issue), but local backup completed"
    Write-Info "You can push later: git push origin main --tags"
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  BACKUP SUCCESS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Details:"
Write-Host "  - Time: $TIMESTAMP"
Write-Host "  - Commit: $commitMsg"
Write-Host "  - Tag: $TAG_NAME"
Write-Host ""

$skillCount = (Get-ChildItem "skills" -Directory -ErrorAction SilentlyContinue).Count
$memoryCount = (Get-ChildItem "memory" -File -ErrorAction SilentlyContinue).Count
Write-Host "Stats:"
Write-Host "  - Skills: $skillCount"
Write-Host "  - Memory files: $memoryCount"
Write-Host ""
Write-Host "To restore: .\restore-workspace.ps1" -ForegroundColor Cyan
Write-Host ""
