# Trae CN SOLO Coder 消息发送脚本
# 用法：.\send-to-trae-solo.ps1 -Message "你的消息内容"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Add-Type -AssemblyName System.Windows.Forms

Write-Host "========================================"
Write-Host "🤖 发送消息到 Trae CN SOLO Coder"
Write-Host "========================================"
Write-Host ""
Write-Host "消息内容：$Message"
Write-Host ""

try {
    # Copy message to clipboard
    [System.Windows.Forms.Clipboard]::SetText($Message)
    Write-Host "✅ 消息已复制到剪贴板"

    # Create WScript.Shell object
    $shell = New-Object -ComObject WScript.Shell

    # Activate Trae CN window
    Write-Host "🔍 激活 Trae CN 窗口..."
    $activated = $shell.AppActivate("Trae CN")
    if (-not $activated) { 
        Write-Host "❌ 无法激活 Trae CN 窗口！请确保 Trae CN 已运行。" -ForegroundColor Red
        exit 1 
    }
    Write-Host "✅ Trae CN 窗口已激活"
    Start-Sleep -Milliseconds 1000

    # Focus chat input and mention SOLO Coder
    Write-Host "💬 打开聊天输入框并@SOLO Coder..."

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
    
    Write-Host "✅ 消息已成功发送到 SOLO Coder!"
    Write-Host ""
    Write-Host "========================================"
}
catch {
    Write-Host "❌ 发送失败：$($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
