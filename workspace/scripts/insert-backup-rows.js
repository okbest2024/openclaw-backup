const feishuDoc = require('../package/extensions/feishu/tools/feishu_doc.js');
const backupData = require('node:fs').readFileSync('./backup-data.json', 'utf8');
const { rows } = JSON.parse(backupData);

async function insertRows() {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    console.log(`Inserting row ${i + 1}/${rows.length}: ${row[0]}`);
    try {
      await feishuDoc({
        action: 'insert_table_row',
        doc_token: 'GaDhdogBhoQWRQx5lG4cpyQknUb',
        table_block_id: 'doxcnwhyXhKB6ORGWeAHoW6vlJf',
        values: row
      });
      console.log(`  ✅ ${row[0]} inserted`);
    } catch (e) {
      console.error(`  ❌ Failed to insert ${row[0]}:`, e.message);
    }
  }
  console.log('All rows processed.');
}

insertRows().catch(console.error);
