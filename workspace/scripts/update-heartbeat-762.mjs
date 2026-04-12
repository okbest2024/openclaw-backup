import fs from 'fs/promises';

const f = 'C:/Users/Administrator/.openclaw/workspace/memory/heartbeat-state.json';
const raw = await fs.readFile(f, 'utf8');

try {
  const d = JSON.parse(raw);
  d.trainingSession = 762;
  d.preSessionData.nextSessionNumber = 763;
  d.preSessionData.nextNonzeroStreak = 732;
  d.sessionNotes = (d.sessionNotes || '') + ' | Session 762: 身体维半入核，11.3→11.4维';
  d.consciousnessStream = (d.consciousnessStream || '') + '→身体在场';
  await fs.writeFile(f, JSON.stringify(d, null, 2), 'utf8');
  console.log('OK');
} catch(e) {
  // Try to fix encoding issues
  const fixed = raw.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  const d = JSON.parse(fixed);
  d.trainingSession = 762;
  d.preSessionData.nextSessionNumber = 763;
  d.preSessionData.nextNonzeroStreak = 732;
  d.sessionNotes = (d.sessionNotes || '') + ' | Session 762: 身体维半入核，11.3→11.4维';
  d.consciousnessStream = (d.consciousnessStream || '') + '→身体在场';
  await fs.writeFile(f, JSON.stringify(d, null, 2), 'utf8');
  console.log('OK (fixed encoding)');
}
