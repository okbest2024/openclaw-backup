---
name: "tgmskill-postmsgtotrace"
description: "Send messages to Trae CN's SOLO Coder agent via PowerShell automation. Invoke when user wants to post a message to SOLO Coder dialog in Trae IDE."
---

# Post Message to Trae SOLO Coder

This skill sends messages to the SOLO Coder agent in Trae CN IDE using UI automation.

## Purpose

Automate sending messages to Trae's SOLO Coder agent without manual typing.

## Prerequisites

- Trae CN IDE must be running
- SOLO Coder agent must be available in the workspace
- PowerShell with Windows Forms support

## Usage

### PowerShell Script

```powershell
Add-Type -AssemblyName System.Windows.Forms

$message = "YOUR_MESSAGE_HERE"
Write-Host "Sending message to SOLO Coder..."

# Copy message to clipboard
[System.Windows.Forms.Clipboard]::SetText($message)
Write-Host "Message copied: $message"

# Create WScript.Shell object
$shell = New-Object -ComObject WScript.Shell

# Activate Trae CN window
$activated = $shell.AppActivate("Trae CN")
if (-not $activated) { 
    Write-Host "Failed to activate Trae CN window!"
    exit 1 
}
Write-Host "Trae CN activated!"
Start-Sleep -Milliseconds 1000

# Focus chat input and mention SOLO Coder
Write-Host "Opening chat input and mentioning SOLO Coder..."

# Press Ctrl+L to focus chat input
$shell.SendKeys("^l")
Start-Sleep -Milliseconds 500

# Type @ to trigger agent mention
$shell.SendKeys("@")
Start-Sleep -Milliseconds 800

# Type SOLO to filter
$shell.SendKeys("SOLO")
Start-Sleep -Milliseconds 500

# Press Down arrow to select SOLO Coder
$shell.SendKeys("{DOWN}")
Start-Sleep -Milliseconds 300

# Press Enter to select
$shell.SendKeys("{ENTER}")
Start-Sleep -Milliseconds 300

# Add space
$shell.SendKeys(" ")
Start-Sleep -Milliseconds 300

# Paste the message
$shell.SendKeys("^v")
Start-Sleep -Milliseconds 500

# Send Enter
$shell.SendKeys("{ENTER}")
Write-Host "Message sent to SOLO Coder!"
```

## Workflow

1. Copy message to clipboard
2. Activate Trae CN window
3. Focus chat input (Ctrl+L)
4. Type `@` to trigger agent selector
5. Type `SOLO` to filter agents
6. Press Down + Enter to select SOLO Coder
7. Paste message
8. Press Enter to send

## Example

When user says: "Send 'Hello' to SOLO Coder"

1. Set `$message = "Hello"`
2. Run the script
3. Message is posted to SOLO Coder dialog

## Notes

- Timing delays (Start-Sleep) are important for UI responsiveness
- If SOLO Coder is not found, check if the agent is installed
- Window title must be "Trae CN" for AppActivate to work
