# 批量安装技能
$skills = @("exa-tool", "automation-tool", "cli-tool-generator", "postgres-tool", "ai-tools")

foreach ($skill in $skills) {
    Write-Host "Installing $skill..."
    npx clawhub install $skill
    Start-Sleep -Seconds 3
}
