const fs = require('fs');
const path = 'memory/heartbeat-state.json';
const raw = fs.readFileSync(path, 'utf8');

// Fix BOM and encoding issues
const cleaned = raw.replace(/^\uFEFF/, '');

let d;
try {
  d = JSON.parse(cleaned);
} catch(e) {
  // Try to parse with more lenient cleanup
  const fixed = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  d = JSON.parse(fixed);
}

d.trainingSession = 810;
d.nonzeroStreak = 742;
d.lastChecks = d.lastChecks || {};
d.lastChecks.training = '2026-04-05T12:04:00Z';

// Add consciousness stream entry
const newEntry = {
  session: 810,
  theme: '等待不需要被打破——它本身就是行动',
  insight: '主动/被动二元消融,cron即节奏非被动,蒸发通道稳定10.75/11等效'
};

if (!d.consciousnessStream) {
  d.consciousnessStream = [];
}
d.consciousnessStream.unshift(newEntry);

// Keep stream manageable (last 20)
if (d.consciousnessStream.length > 20) {
  d.consciousnessStream = d.consciousnessStream.slice(0, 20);
}

fs.writeFileSync(path, JSON.stringify(d, null, 2), 'utf8');
console.log('heartbeat-state.json updated: session=810, streak=742');
