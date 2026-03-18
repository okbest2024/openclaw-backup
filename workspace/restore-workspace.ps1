# OpenClaw Workspace Restore Script
# Usage: .\restore-workspace.ps1 [-DryRun]
# Works offline using local git commits

param([switch]$DryRun)

$WORKSPACE = "C:\Users\Administrator\.openclaw\workspace"
$REPO_URL = "https://github.com/okbest2024/tgmqqclawyang.git"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OpenClaw Workspace Restore Tool" -ForegroundColor Cyan
Write-Host "  by Gai Shi Baby" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Write-Info { param($msg); Write-Host "[INFO] $msg" -ForegroundColor Blue }
function Write-OK { param($msg); Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err { param($msg); Write-Host "[ERROR] $msg" -ForegroundColor Red }

# 1. Enter workspace
Write-Info "Workspace: $WORKSPACE"
if (!(Test-Path $WORKSPACE)) {
    Write-Err "Workspace not found: $WORKSPACE"
    exit 1
}
$originalLocation = Get-Location
Set-Location $WORKSPACE

# 2. Init git if needed
if (!(Test-Path .git)) {
    Write-Info "Initializing git repository..."
    if ($DryRun) {
        Write-Info "[DryRun] git init"
        Write-Info "[DryRun] git remote add origin $REPO_URL"
    } else {
        git init | Out-Null
        git remote add origin $REPO_URL 2>$null
    }
    Write-OK "Git initialized"
} else {
    Write-OK "Git already initialized"
}

# 3. Fetch remote (optional, non-blocking)
Write-Info "Attempting to fetch remote updates (optional)..."
if ($DryRun) {
    Write-Info "[DryRun] git fetch origin"
} else {
    $fetchResult = git fetch origin 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-OK "Remote branches fetched successfully"
    } else {
        Write-Info "Remote fetch skipped (offline mode, using local commits)"
    }
}

# 4. Restore from local HEAD (works offline)
Write-Info "Restoring files from local git HEAD..."
$files = @("skills/", "avatars/", "SOUL.md", "USER.md", "AGENTS.md", "IDENTITY.md", "TOOLS.md", "HEARTBEAT.md", "MEMORY.md", "memory/")
if ($DryRun) {
    Write-Info "[DryRun] git checkout HEAD -- $($files -join ' ')"
    $checkoutOk = $true
} else {
    $checkoutResult = git checkout HEAD -- $files 2>&1
    $checkoutOk = ($LASTEXITCODE -eq 0)
}

if ($checkoutOk) {
    Write-OK "Files restored from local HEAD"
} else {
    Write-Err "Failed to restore some files from git"
}

# 5. Fix nested skills directory
if (Test-Path "skills\skills") {
    Write-Info "Found nested skills directory, fixing..."
    if ($DryRun) {
        Write-Info "[DryRun] Moving skills\skills\* to skills\"
        Write-Info "[DryRun] Removing skills\skills"
    } else {
        Move-Item "skills\skills\*" "skills\" -Force
        Remove-Item "skills\skills" -Recurse -Force
    }
    Write-OK "Nested directory fixed"
}

# 6. Verify restoration
Write-Info "Verifying restoration..."
$errors = @()

$required = @("SOUL.md", "USER.md", "MEMORY.md", "AGENTS.md")
foreach ($f in $required) {
    if (!(Test-Path $f)) {
        $errors += "Missing file: $f"
    }
}

$skillCount = (Get-ChildItem "skills" -Directory -ErrorAction SilentlyContinue).Count
if ($skillCount -lt 100) {
    $errors += "Skill count low: $skillCount (expected >100)"
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Verification warnings:" -ForegroundColor Yellow
    foreach ($e in $errors) {
        Write-Host "  - $e" -ForegroundColor Yellow
    }
} else {
    Write-OK "Verification passed"
}

# Restore location
Set-Location $originalLocation

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SUCCESS! Workspace restored!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:"
Write-Host "  - Config: SOUL.md, USER.md, AGENTS.md, etc."
Write-Host "  - Skills: $skillCount"
Write-Host "  - Memory: MEMORY.md, memory/"
Write-Host ""
