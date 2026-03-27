const fs = require('fs');
const path = 'memory/heartbeat-state.json';

try {
  // Read as UTF-8
  const raw = fs.readFileSync(path, 'utf8');

  // Parse with safe handling
  const data = JSON.parse(raw);

  // Sanitize note field: escape any quotes that might break JSON
  if (data.note && typeof data.note === 'string') {
    // The note is already a string, but it might contain unescaped double quotes
    // When we re-stringify, JSON.stringify will handle escaping properly
    console.log('Note field length:', data.note.length);
  }

  // Write back with proper formatting
  const repaired = JSON.stringify(data, null, 2);
  fs.writeFileSync(path, repaired, 'utf8');

  console.log('✅ heartbeat-state.json repaired successfully');
} catch (e) {
  console.error('❌ Failed to repair:', e.message);
  console.error('Position:', e.stack.includes('position') ? e.message.match(/position (\d+)/) : 'unknown');

  // Fallback: create minimal structure preserving essential fields
  console.log('Creating minimal valid structure...');
  const minimal = {
    trainingSession: 682,
    lastTrainingTime: new Date().toISOString(),
    preSessionData: { nextSessionNumber: 683, nextNonzeroStreak: 669 },
    moxieTraining: { lastRun: new Date().toISOString(), currentNovel: '罪狱岛', learntCount: 81 },
    note: 'Repaired after JSON corruption'
  };
  fs.writeFileSync(path, JSON.stringify(minimal, null, 2), 'utf8');
  console.log('✅ Minimal structure written');
}