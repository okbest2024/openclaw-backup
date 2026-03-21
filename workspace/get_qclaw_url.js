const https = require('https');

const postData = JSON.stringify({
  from: 'web',
  system_type: 'win'
});

const options = {
  hostname: 'jprx.m.qq.com',
  port: 443,
  path: '/data/4066/forward',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Full response:', JSON.stringify(result, null, 2));
      
      // 提取 Windows 下载链接
      const exeUrl = result?.data?.resp?.data?.package_info?.files?.exe?.url;
      const md5 = result?.data?.resp?.data?.package_info?.files?.exe?.md5;
      
      if (exeUrl) {
        console.log('\n=== DOWNLOAD URL ===');
        console.log('Windows EXE:', exeUrl);
        console.log('MD5:', md5);
      } else {
        console.log('No download URL found in response');
      }
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(postData);
req.end();