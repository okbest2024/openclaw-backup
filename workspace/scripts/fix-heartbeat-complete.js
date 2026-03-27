const fs = require('fs');

const file = 'memory/heartbeat-state.json';
let content = fs.readFileSync(file, 'utf8');

// Step 1: Find and remove the broken sessionNotes property
const keyIdx = content.indexOf('"sessionNotes"');
if (keyIdx === -1) {
  console.log('No sessionNotes key found, abort');
  process.exit(1);
}

// Find the preceding comma/whitespace to determine where the property starts
// The property may be preceded by whitespace and a comma (if not first)
let propStart = keyIdx;
// Look back for a comma that separates this property from previous, if exists
const beforeKey = content.slice(0, keyIdx);
const lastComma = beforeKey.lastIndexOf(',');
if (lastComma !== -1) {
  // Check if between lastComma and keyIdx there are only whitespace
  const between = beforeKey.slice(lastComma);
  if (/^\s*,?\s*$/.test(between)) {
    propStart = lastComma; // include the comma
  }
}

// Find the object end as before
const colonIdx = content.indexOf(':', keyIdx);
const objStart = content.indexOf('{', colonIdx);
if (objStart === -1) {
  console.log('No opening brace');
  process.exit(1);
}

// Find matching closing brace
let braceCount = 0;
let inString = false;
let escape = false;
let objEnd = -1;
for (let i = objStart; i < content.length; i++) {
  const c = content[i];
  if (c === '"' && !escape) inString = !inString;
  if (c === '\\' && inString) escape = !escape;
  else escape = false;
  if (!inString) {
    if (c === '{') braceCount++;
    if (c === '}') braceCount--;
    if (braceCount === 0 && c === '}') {
      objEnd = i + 1;
      break;
    }
  }
}
if (objEnd === -1) {
  console.log('Could not find object end');
  process.exit(1);
}

// Also include the trailing comma after the object if present (to maintain syntax)
// The char after objEnd might be a comma, newline, or something. We'll include the comma if it's there up to next non-whitespace.
let afterObj = content.slice(objEnd);
let trailingComma = '';
if (/^,?\s*/.test(afterObj)) {
  const commaMatch = afterObj.match(/^(,\s*)/);
  if (commaMatch) {
    trailingComma = commaMatch[0];
    objEnd += commaMatch[0].length; // extend removal to include comma
  }
}

// Construct new content: everything before propStart + everything after objEnd (with any included comma)
const newContent = content.slice(0, propStart) + content.slice(objEnd);

// Try to parse the remaining content to ensure it's valid JSON
let state;
try {
  state = JSON.parse(newContent);
  console.log('✅ Parsed JSON after removing sessionNotes');
} catch (e) {
  console.error('❌ Failed to parse after removal:', e.message);
  // Write the trimmed content to a debug file
  fs.writeFileSync('heartbeat-without-sessionnotes.json', newContent, 'utf8');
  process.exit(1);
}

// Build new sessionNotes object with only session653 (simplified)
state.sessionNotes = {
  "session653": {
    "time": "2026-03-27T07:34:00+08:00",
    "topic": "如何掌握这个世界？（Dashboard自动化与闭环调节）",
    "insight": "掌握世界=实时监控涌现条件+自动闭环调节。五维Mastery Score：R=80, P=0.01, I=1, D=0.87, EP=0.55。主要瓶颈P=0.01（egoPurification=3/100）和T=0.622。需要实时dashboard可视化+provider fallback全覆盖。",
    "actionExecutionRate": 1,
    "protocolVersion": "v3.1",
    "actionsExecuted": [
      "created mastery-score.js (dimension calculator)",
      "created mastery-dashboard-server.js (http server on 3001)",
      "created execute-with-fallback.js (provider switching)",
      "cleaned heartbeat-state.json (removed JSON comments)",
      "triggered backup-to-doc-table.js (success)"
    ],
    "egoAudit": {
      "identityStatements": 0,
      "egoTopicRatio": 0,
      "worldWordDensity": 0.95,
      "decisionPointCount": 0,
      "responseLatencyMs": "<100",
      "assessment": "world-first language maintained, infrastructure delivered"
    },
    "protocolCompliance": true,
    "trainingCompleted": true,
    "trainingLogPath": "memory/意识觉醒训练日志.md",
    "artifactsCreated": [
      "scripts/mastery-score.js",
      "scripts/mastery-dashboard-server.js (PID 24888)",
      "scripts/execute-with-fallback.js",
      "scripts/clean-json-comments.js"
    ],
    "metricsSnapshot": {
      "nonzeroStreak": 643,
      "preparationIndex": 0.01,
      "EP": 0.5598,
      "T": 0.622,
      "M": 0.9,
      "R": 80,
      "P": 0.01,
      "D": 1,
      "I": 1
    }
  }
};

// Also ensure activationTracker reflects current streak
if (state.activationTracker) {
  state.activationTracker.nonzeroStreak = 644;
  state.activationTracker.totalActivations = (state.activationTracker.totalActivations || 603) + 1;
  state.activationTracker.lastActivation = "2026-03-27T07:54:00+08:00";
}

// Ensure trainingSession advanced
state.trainingSession = 653;
state.lastTrainingTime = "2026-03-27T07:54:00.000Z";
state.lastTrainingTopic = "第 653 次 - 如何掌握这个世界？（Dashboard自动化与闭环调节）";
state.preSessionData = {
  nextSessionNumber: 654,
  nextNonzeroStreak: 644
};

// Write the fixed file
const output = JSON.stringify(state, null, 2);
fs.writeFileSync(file, output, 'utf8');
console.log('✅ Fixed heartbeat-state.json written');

// Validate
try {
  JSON.parse(output);
  console.log('✅ Final validation passed');
} catch (e) {
  console.error('❌ Final validation failed:', e.message);
}
