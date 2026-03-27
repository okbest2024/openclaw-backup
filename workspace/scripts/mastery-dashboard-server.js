#!/usr/bin/env node

/**
 * Mastery Dashboard HTTP Server
 * 提供可视化仪表盘和API接口
 * 
 * 启动: node scripts/mastery-dashboard-server.js
 * 访问: http://localhost:3001
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const MASTERY_SCORE_CMD = 'node scripts/mastery-score.js';

function getMasteryScore() {
  return new Promise((resolve, reject) => {
    exec(MASTERY_SCORE_CMD, { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      try {
        // 提取JSON部分（脚本输出最后一行是纯JSON）
        const lines = stdout.split('\n');
        const jsonLine = lines.find(line => line.trim().startsWith('{'));
        const data = JSON.parse(jsonLine);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  });
}

function getStatusColor(value, target, thresholds = { low: 0.5, mid: 0.8 }) {
  if (value >= target) return '#4caf50'; // green
  if (value >= thresholds.mid * target) return '#ff9800'; // orange
  return '#f44336'; // red
}

function generateHTML(data) {
  const { dimensions, gaps, summary } = data;
  
  const dimensionRows = [
    { key: 'R', label: 'Responsiveness', desc: '响应速度', target: 100 },
    { key: 'P', label: 'Preparation', desc: '准备度', target: 0.95 },
    { key: 'I', label: 'Presence', desc: '在场密度', target: 1 },
    { key: 'D', label: 'Consciousness', desc: '意识密度', target: 0.95 },
    { key: 'T', label: 'Continuity', desc: '连续性', target: 0.95 },
    { key: 'M', label: 'Network', desc: '网络连接', target: 0.95 },
    { key: 'EP', label: 'Emergence', desc: '涌现潜力', target: 0.95 }
  ].map(dim => {
    const dimData = dimensions[dim.key];
    const gapData = gaps[dim.key];
    const color = getStatusColor(dimData, dim.target);
    const percent = (dimData / dim.target * 100).toFixed(1);
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${dim.label}<br><small>${dim.desc}</small></td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="flex: 1; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
              <div style="width: ${Math.min(percent, 100)}%; height: 20px; background: ${color}; transition: width 0.3s;"></div>
            </div>
            <span style="min-width: 60px;">${dimData.toFixed(4)}</span>
          </div>
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${dim.target}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: ${gapData.status.split(' ')[0].includes('✅') ? 'green' : gapData.status.includes('🟡') ? 'orange' : 'red'};">${gapData.gap > 0 ? '+' : ''}${gapData.gap.toFixed(4)}</td>
      </tr>
    `;
  }).join('');
  
  const recommendationsHTML = data.recommendations.map(rec => `
    <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid #2196f3; background: #f5f5f5;">
      <h4 style="margin: 0 0 5px 0;">${rec.priority}. ${rec.title}</h4>
      <p style="margin: 0 0 5px 0; color: #666;">${rec.description}</p>
      <ul style="margin: 0; padding-left: 20px;">
        ${rec.concreteActions.map(a => `<li>${a}</li>`).join('')}
      </ul>
    </div>
  `).join('');
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>Mastery Dashboard</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #fafafa; }
    h1 { color: #333; }
    .summary { margin-bottom: 20px; }
    .summary-item { display: inline-block; margin-right: 20px; padding: 10px; background: white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    table { border-collapse: collapse; width: 100%; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    th { background: #2196f3; color: white; padding: 12px; text-align: left; }
    .recommendations { margin-top: 20px; }
    .refresh { margin-top: 20px; }
    .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    .status-green { background: #4caf50; color: white; }
    .status-orange { background: #ff9800; color: white; }
    .status-red { background: #f44336; color: white; }
  </style>
</head>
<body>
  <h1>🎯 Mastery Dashboard</h1>
  
  <div class="summary">
    <div class="summary-item">
      <strong>Status:</strong> 
      <span class="status-badge ${summary.readinessLevel.includes('🟢') ? 'status-green' : summary.readinessLevel.includes('🟡') ? 'status-orange' : 'status-red'}">
        ${summary.readinessLevel.replace(/[🟢🔴🟡]/, '').trim()}
      </span>
    </div>
    <div class="summary-item">
      <strong>Nonzero Streak:</strong> ${dimensions.nonzeroStreak}
    </div>
    <div class="summary-item">
      <strong>Current EP:</strong> ${summary.currentEP}
    </div>
    <div class="summary-item">
      <strong>Top Gap:</strong> ${summary.farthestFromTarget === 'none' ? 'None' : summary.farthestFromTarget} (${gaps[summary.farthestFromTarget] ? gaps[summary.farthestFromTarget].gap.toFixed(4) : 'N/A'})
    </div>
  </div>
  
  <h2>Dimensions Status</h2>
  <table>
    <thead>
      <tr>
        <th>Dimension</th>
        <th>Current (Progress Bar)</th>
        <th>Target</th>
        <th>Gap</th>
      </tr>
    </thead>
    <tbody>
      ${dimensionRows}
    </tbody>
  </table>
  
  <div class="recommendations">
    <h2>🔧 Recommended Actions</h2>
    ${recommendationsHTML}
  </div>
  
  <div class="refresh">
    <button onclick="location.reload()" style="padding: 10px 20px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Now</button>
    <small style="margin-left: 10px; color: #666;">Auto-refresh every 60s (set interval in script)</small>
  </div>
  
  <script>
    // Auto refresh every 60 seconds
    setTimeout(() => location.reload(), 60000);
  </script>
</body>
</html>`;
}

async function handleRequest(req, res) {
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const data = await getMasteryScore();
      const html = generateHTML(data);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (error) {
      console.error('Error generating dashboard:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading mastery score: ' + error.message);
    }
  } else if (req.url === '/api/v1/score') {
    try {
      const data = await getMasteryScore();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching score:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}

// Start server
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`✅ Mastery Dashboard server running at http://localhost:${PORT}/`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/api/v1/score`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
