# Install OpenClaw Watchdog Task
# Creates a Windows Scheduled Task to run watchdog every 5 minutes

$ErrorActionPreference = "Stop"

$taskName = "OpenClaw Watchdog"
$scriptPath = "C:\Users\Administrator\.openclaw\workspace\scripts\watchdog.ps1"
$workspacePath = "C:\Users\Administrator\.openclaw\workspace"

Write-Host "Installing OpenClaw Watchdog task..."

# Check if task exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Task exists, removing old task..."
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create task action
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" `
    -WorkingDirectory $workspacePath

# Create trigger (every 5 minutes)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

# Register task
Register-ScheduledTask -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "OpenClaw gateway health monitor - checks every 5 min, auto-restarts on failure"

Write-Host "SUCCESS: Watchdog task installed!"
Write-Host "  Task Name: $taskName"
Write-Host "  Check Interval: Every 5 minutes"
Write-Host "  Log File: C:\Users\Administrator\.openclaw\workspace\memory\watchdog.log"
Write-Host ""
Write-Host "Commands:"
Write-Host "  Status: Get-ScheduledTask -TaskName '$taskName'"
Write-Host "  History: Get-ScheduledTaskInfo -TaskName '$taskName'"
Write-Host "  Test Run: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "  Uninstall: Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
