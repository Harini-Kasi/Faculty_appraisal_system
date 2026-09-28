import { getDbPool } from "../server/config/db.js";
import bcrypt from "bcryptjs";

async function testLogins() {
  const db = await getDbPool();
  
  const testCases = [
    ["CSET031", "8888"],
    ["CSET004", "9988"],
    ["CHET001", "123456"],
    ["vadmin", "NecFPAS321"],
    ["admin", "admin123"],
  ];

  console.log("=== TESTING BCRYPT AUTHENTICATION FOR MIGRATED ACCOUNTS ===");
  for (const [uname, pass] of testCases) {
    const [rows] = await db.query("SELECT username, password_hash, role, designation FROM faculty WHERE username = ?", [uname]);
    if (rows.length === 0) {
      const [adm] = await db.query("SELECT username, password_hash FROM admins WHERE username = ?", [uname]);
      if (adm.length > 0 && bcrypt.compareSync(pass, adm[0].password_hash)) {
        console.log(`✅ Login SUCCESS for Admin '${uname}' with password '${pass}'!`);
      } else {
        console.log(`❌ Login FAILED for Admin '${uname}'`);
      }
    } else {
      const ok = bcrypt.compareSync(pass, rows[0].password_hash);
      if (ok) {
        console.log(`✅ Login SUCCESS for Faculty/Role '${uname}' (${rows[0].role}) with password '${pass}'!`);
      } else {
        console.log(`❌ Login FAILED for '${uname}'`);
      }
    }
  }
  process.exit(0);
}

testLogins();
