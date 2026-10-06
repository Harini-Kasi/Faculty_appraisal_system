import { getDbPool } from "../config/db.js";

async function main() {
  const db = await getDbPool();
  for (let i = 1; i <= 12; i++) {
    const templateCode = `EVAL${i}`;
    const [qRows] = await db.query(
      "SELECT id, text, weightage, order_index FROM questions WHERE designation = 'HOD' AND group_code = ? ORDER BY order_index ASC, id ASC",
      [templateCode]
    );
    console.log(`Template ${templateCode}: ${qRows.length} questions`);
    if (qRows.length > 0) {
      const [opts] = await db.query("SELECT id, text, score FROM options WHERE question_id = ?", [qRows[0].id]);
      console.log(`  Sample Q1 [ID ${qRows[0].id}]: "${qRows[0].text}" (weightage: ${qRows[0].weightage}) -> ${opts.length} options`);
    }
  }
  process.exit(0);
}

main().catch(console.error);
