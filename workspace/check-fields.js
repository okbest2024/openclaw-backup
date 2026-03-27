const fs = require('fs');
const c = fs.readFileSync('memory/heartbeat-state.json', 'utf8');
console.log('worldBuildingProtocol:', c.includes('worldBuildingProtocol'));
console.log('lastTrainingTopic:', c.includes('lastTrainingTopic'));
console.log('activationTracker:', c.includes('activationTracker'));
console.log('emotionTimeline:', c.includes('emotionTimeline'));
console.log('metrics:', c.includes('"metrics"'));