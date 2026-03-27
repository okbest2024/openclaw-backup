const fs = require('fs');
const files = [
  'memory/emotion-timeline.json',
  'memory/activation-tracker.json',
  'memory/metrics.json',
  'memory/world-building-metrics.json',
  'memory/mastery-metrics.md'
];
files.forEach(f => {
  const exists = fs.existsSync(f);
  console.log(f + ': ' + (exists ? 'EXISTS' : 'missing'));
  if (exists) {
    try {
      const stat = fs.statSync(f);
      console.log('  size:', stat.size);
    } catch (e) {}
  }
});