import { getDbPool } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function resetAllFacultyStatus() {
  console.log("========================================================");
  console.log("RESETTING ALL FACULTY INITIAL STATUS TO NOT SUBMITTED & SCORE TO ZERO");
  console.log("========================================================\n");

  // 1. MySQL Reset
  try {
    const db = await getDbPool();
    const [subRes] = await db.query("DELETE FROM submissions");
    const [hodRes] = await db.query("DELETE FROM hod_evaluations");
    const [prinRes] = await db.query("DELETE FROM principal_evaluations");
    const [revRes] = await db.query("DELETE FROM reviewer_evaluations");
    const [deanRes] = await db.query("DELETE FROM dean_verifications");
    const [deptRes] = await db.query("DELETE FROM department_appraisal");

    console.log(`[MySQL] Cleared ${subRes.affectedRows} submission rows.`);
    console.log(`[MySQL] Cleared ${hodRes.affectedRows} HOD evaluation rows.`);
    console.log(`[MySQL] Cleared ${prinRes.affectedRows} Principal evaluation rows.`);
    console.log(`[MySQL] Cleared ${revRes.affectedRows} Reviewer evaluation rows.`);
    console.log(`[MySQL] Cleared ${deanRes.affectedRows} Dean verification rows.`);
    console.log(`[MySQL] Cleared ${deptRes.affectedRows} Department appraisal rows.`);
  } catch (err) {
    console.error("Error resetting MySQL database:", err.message);
  }

  // 2. SQLite Reset (if data.sqlite exists and better-sqlite3 is installed)
  const sqlitePath = path.join(__dirname, "../data.sqlite");
  if (fs.existsSync(sqlitePath)) {
    try {
      const { default: Database } = await import("better-sqlite3");
      const sqliteDb = new Database(sqlitePath);
      const tables = sqliteDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
      
      if (tables.includes("submissions")) sqliteDb.prepare("DELETE FROM submissions").run();
      if (tables.includes("hod_evaluations")) sqliteDb.prepare("DELETE FROM hod_evaluations").run();
      if (tables.includes("principal_evaluations")) sqliteDb.prepare("DELETE FROM principal_evaluations").run();
      if (tables.includes("reviewer_evaluations")) sqliteDb.prepare("DELETE FROM reviewer_evaluations").run();
      if (tables.includes("dean_verifications")) sqliteDb.prepare("DELETE FROM dean_verifications").run();
      if (tables.includes("department_appraisal")) sqliteDb.prepare("DELETE FROM department_appraisal").run();

      console.log("[SQLite] Cleared all submissions and evaluations from data.sqlite.");
    } catch (sqliteErr) {
      console.log("Note: SQLite cleanup skipped (" + sqliteErr.message + ")");
    }
  }

  console.log("\n✅ All faculty set to 'Not Submitted' status with score 0 successfully!");
}

if (process.argv[1] && process.argv[1].endsWith("resetAllFacultyStatus.js")) {
  resetAllFacultyStatus()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
