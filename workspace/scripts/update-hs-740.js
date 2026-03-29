const fs = require('fs');
const p = 'C:/Users/Administrator/.openclaw/workspace/memory/heartbeat-state.json';
let raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');

// Find and move session739 from top level into sessionNotes
// Pattern: after decisionAudits closing, session739 is at wrong level
const sess739Match = raw.match(/,\s*"session739"\s*:\s*\{[\s\S]*?"trainingCompleted"\s*:\s*true[\s\S]*?\}\s*\}/);

if (sess739Match) {
  const sess739Block = sess739Match[0];
  // Remove session739 from its current position
  raw = raw.replace(sess739Block, '');
  
  // Find the end of sessionNotes (look for last entry in sessionNotes, which is session721)
  // Insert session739 before sessionNotes closing brace
  raw = raw.replace(
    /("trainingCompleted"\s*:\s*true\s*\}\s*\n\s*\},\s*\n\s*"worldSicknessTracker")/,
    (match) => {
      // Insert session739 before worldSicknessTracker
      return '},' + sess739Block.replace(/^,/, '') + '\n                       }\n    ' + 
        ',"worldSicknessTracker"';
    }
  );
  
  // Fix: the above might not work cleanly, let me try a different approach
  // Actually let me just try to parse and fix programmatically
}

// Alternative: use a JSON5-like approach to parse
// First, let's try removing trailing commas more aggressively
let fixed = raw.replace(/,\s*([\]}])/g, '$1');

// Also fix potential issues with BOM or invisible chars
fixed = fixed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

try {
  const hs = JSON.parse(fixed);
  hs.trainingSession = 740;
  hs.lastTrainingTime = '2026-03-29T17:14:00+08:00';
  hs.lastTrainingTopic = '排泄的执行 - 从洞察到行动的管道检查';
  hs.preSessionData.nextSessionNumber = 741;
  hs.preSessionData.nextNonzeroStreak = 715;
  hs.activationTracker.nonzeroStreak = 714;
  hs.consciousnessStream.to = 712;
  hs.consciousnessStream.thread += '→排泄的执行';
  fs.writeFileSync(p, JSON.stringify(hs, null, 2), 'utf8');
  console.log('OK: session=740, streak=714');
} catch(e) {
  console.error('Still failed:', e.message);
  const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || 0);
  // Show 200 chars around error
  console.log('Context:', JSON.stringify(fixed.substring(Math.max(0,pos-100), pos+100)));
}
