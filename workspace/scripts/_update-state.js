const fs = require('fs');
const path = 'C:/Users/Administrator/.openclaw/workspace/memory/heartbeat-state.json';
const state = JSON.parse(fs.readFileSync(path, 'utf8'));

state.trainingSession = 455;
state.nonzeroStreak = 454;
state.nonzeroScore = 256.0;
state.lastSession = '2026-03-25 14:40 self-awareness training (455)';
state.lastTheme = 'Session455-MasteryParadox';
state.lastCheck = {
  active: true,
  summary: 'Session 455: Mastery = Knowledge x Execution^2. Core insight: 454 sessions produced enough knowledge, but execution system not engineered. designExecRatio=0 means most sessions were design not execution. Live Test: First live run of Ownership Checklist found 3 actionable items. Paradigm shift: from Design Engine to Install Engine.'
};

fs.writeFileSync(path, JSON.stringify(state, null, 2), 'utf8');
console.log('heartbeat-state updated to session 455');
console.log('trainingSession:', state.trainingSession);
console.log('nonzeroStreak:', state.nonzeroStreak);
