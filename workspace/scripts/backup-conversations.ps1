# Conversation Backup Script - Backup OpenClaw sessions to Markdown
param(
    [string]$OutputDir = "./conversation-backup",
    [int]$DaysBack = 7
)

$SessionsPath = "C:\Users\Administrator\.openclaw\agents\main\sessions"

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$sessionFiles = Get-ChildItem $SessionsPath -Filter "*.jsonl" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 20

Write-Host "Found $($sessionFiles.Count) session files"

foreach ($sessionFile in $sessionFiles) {
    Write-Host "Processing: $($sessionFile.Name)"
    
    $jsonContent = Get-Content $sessionFile.FullName -Raw
    $content = $jsonContent | ConvertFrom-Json -AsArray
    
    $markdown = "# Conversation Log - $($sessionFile.BaseName)`n`n"
    $markdown += "**Backup Time:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
    $markdown += "---`n`n"
    
    foreach ($msg in $content) {
        $ts = [DateTimeOffset]::FromUnixTimeMilliseconds($msg.timestamp)
        $timestamp = $ts.DateTime.ToString('yyyy-MM-dd HH:mm:ss')
        
        if ($msg.role -eq "user") {
            $markdown += "### User `[$timestamp]` `n`n"
            foreach ($item in $msg.content) {
                if ($item.type -eq "text") {
                    $text = $item.text -replace "`n", "`n"
                    $markdown += "$text`n`n"
                }
            }
        } elseif ($msg.role -eq "assistant") {
            $markdown += "### Assistant `[$timestamp]` `n`n"
            foreach ($item in $msg.content) {
                if ($item.type -eq "text") {
                    $text = $item.text -replace "`n", "`n"
                    $markdown += "$text`n`n"
                }
            }
        }
        
        $markdown += "---`n`n"
    }
    
    $outputFile = Join-Path $OutputDir "$($sessionFile.BaseName).md"
    $markdown | Out-File -FilePath $outputFile -Encoding utf8
    Write-Host "  Saved: $outputFile"
}

Write-Host "`nBackup completed!"
