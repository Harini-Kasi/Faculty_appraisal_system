import { getDbPool } from "../server/config/db.js";

async function check() {
  const db = await getDbPool();
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM faculty");
  const [sample] = await db.query("SELECT username, name, department, designation, role FROM faculty LIMIT 10");
  console.log("Total Faculty in fpa_db:", rows[0].total);
  console.log("Sample Faculty Accounts:", JSON.stringify(sample, null, 2));
  process.exit(0);
}

check();
