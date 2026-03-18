# 启动音频播放器服务器
$serverPath = "C:\Users\Administrator\.openclaw\workspace\web-audio-player-server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; node server.js"
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
