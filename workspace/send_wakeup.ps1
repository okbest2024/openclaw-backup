$appId = "cli_a93fd942c2f85cd6"
$appSecret = "5D5d8tixIMAZH5zaWpn3SgVUlG8p0aT6"
$openId = "ou_b317d2d01fed443d0a2e94a15f8a4ba1"
$message = "☀️ 早上好！6:45 啦！新的一天开始了，该起床啦！记得今天也要元气满满哦！💪"

# Get tenant access token
$body = @{app_id=$appId; app_secret=$appSecret} | ConvertTo-Json
$tokenResponse = Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" -Method Post -ContentType "application/json" -Body $body
$token = $tokenResponse.tenant_access_token

# Send message
$innerContent = @{text=$message} | ConvertTo-Json -Compress
$msgBody = @{receive_id=$openId; receive_id_type="open_id"; msg_type="text"; content=$innerContent} | ConvertTo-Json -Compress
Write-Output "Request body: $msgBody"
$headers = @{Authorization="Bearer $token"; "Content-Type"="application/json"}
$response = Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/im/v1/messages" -Method Post -Headers $headers -Body $msgBody
Write-Output "Response: $($response | ConvertTo-Json -Compress)"