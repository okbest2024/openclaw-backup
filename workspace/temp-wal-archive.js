const { WALManager } = require('./scripts/wal-manager');
const wal = new WALManager('./memory/wal');
const archived = wal.archive(3);
console.log(`Archived ${archived} WAL files (older than 3 days)`);
