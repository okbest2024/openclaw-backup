const https = require('https');
const http = require('http');

// 尝试常见的腾讯下载链接
const possibleUrls = [
  'https://dldir1.qq.com/invc/QClaw/QClaw_Setup.exe',
  'https://dldir1.qq.com/invc/qclaw/QClaw_Setup.exe',
  'https://dldir1.qq.com/invc/tencentqclaw/QClaw_Setup.exe',
  'https://download.qq.com/qclaw/QClaw_Setup.exe',
  'https://qclaw.qq.com/download/windows',
  'https://qclaw.qq.com/static/QClaw_Setup.exe',
];

console.log('Testing possible download URLs...\n');

possibleUrls.forEach((url, index) => {
  const protocol = url.startsWith('https') ? https : http;
  
  protocol.request(url, { method: 'HEAD' }, (res) => {
    console.log(`[${index + 1}] ${url}`);
    console.log(`    Status: ${res.statusCode}`);
    console.log(`    Headers: ${JSON.stringify(res.headers).substring(0, 200)}`);
    console.log('');
  }).on('error', (e) => {
    console.log(`[${index + 1}] ${url} - Error: ${e.message}`);
  }).end();
});

// 同时获取页面内容查找实际的下载链接
https.get('https://qclaw.qq.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // 输出包含 download 或 exe 的部分
    const lines = data.split('\n');
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes('download') || line.toLowerCase().includes('.exe')) {
        console.log(`Line ${i}: ${line.trim().substring(0, 200)}`);
      }
    });
  });
}).on('error', (e) => {
  console.error('Page fetch error:', e.message);
});