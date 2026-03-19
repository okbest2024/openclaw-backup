// 音频播放器服务器 - 完整版本请查看之前的备份
// 此文件为简化版本

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`音频播放器启动: http://localhost:${PORT}`);
});