import { getDbPool } from "../config/db.js";

async function main() {
  const db = await getDbPool();
  const [hodQ] = await db.query("SELECT COUNT(*) as cnt FROM questions WHERE designation = 'HOD'");
  console.log("HOD Questions count:", hodQ[0].cnt);
  process.exit(0);
}

main().catch(console.error);
