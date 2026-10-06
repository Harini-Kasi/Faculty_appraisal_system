import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { getDbPool, initDb } from "../config/db.js";

function numVal(val, defaultVal = 0) {
  const n = Number(val);
  return isNaN(n) ? defaultVal : n;
}

function parseSqlInserts(sqlContent, tableName) {
  const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES\\s*([\\s\\S]*?);`, "gi");
  const matches = [];
  let match;
  while ((match = regex.exec(sqlContent)) !== null) {
    matches.push(match[1]);
  }
  if (matches.length === 0) return [];

  const fullValuesStr = matches.join(",");
  const rows = [];
  
  let inTuple = false;
  let inString = false;
  let currentVal = "";
  let tupleVals = [];

  for (let i = 0; i < fullValuesStr.length; i++) {
    const char = fullValuesStr[i];
    const prevChar = i > 0 ? fullValuesStr[i - 1] : "";

    if (!inTuple && char === "(") {
      inTuple = true;
      tupleVals = [];
      currentVal = "";
      continue;
    }

    if (inTuple && !inString && char === ")") {
      tupleVals.push(currentVal.trim());
      rows.push(tupleVals);
      inTuple = false;
      continue;
    }

    if (inTuple) {
      if (char === "'" && prevChar !== "\\") {
        inString = !inString;
        continue;
      }

      if (char === "," && !inString) {
        tupleVals.push(currentVal.trim());
        currentVal = "";
        continue;
      }

      currentVal += char;
    }
  }

  return rows.map((row) =>
    row.map((v) => {
      let clean = v.trim();
      if (clean.startsWith("'") && clean.endsWith("'")) {
        clean = clean.slice(1, -1);
      }
      clean = clean.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n");
      return clean === "NULL" || clean === "null" ? null : clean;
    })
  );
}

export async function runMigration() {
  console.log("========================================================");
  console.log("🚀 STARTING OLD FPA DATA MIGRATION TO fpa_db");
  console.log("========================================================\n");

  const sqlDumpPath = "C:/Users/harin/Downloads/Fpas21092026.sql";
  if (!fs.existsSync(sqlDumpPath)) {
    console.error("❌ SQL Dump file not found at:", sqlDumpPath);
    return;
  }

  await initDb();
  const db = await getDbPool();
  const sql = fs.readFileSync(sqlDumpPath, "utf8");

  // Summary counters
  let migratedFacultyCount = 0;
  let migratedAcademicCount = 0;
  let migratedSubmissionsCount = 0;
  let migratedHodCount = 0;
  let migratedDeptAppraisalCount = 0;
  const skippedUsers = [];

  /* ---------------- 1. MIGRATE FACULTY & CREDENTIALS ---------------- */
  console.log("📦 1. Migrating Faculty Accounts & Passwords...");
  const rawFacultyRows = parseSqlInserts(sql, "faculty");

  for (const row of rawFacultyRows) {
    if (row.length < 3) continue;
    const username = String(row[1] || "").trim();
    const rawPassword = String(row[2] || "8888").trim();
    const name = String(row[3] || username).trim();
    let desig = String(row[4] || "AP1").trim();
    let dept = String(row[5] || "CSE").trim();
    let oldFormType = String(row[6] || "").trim().toLowerCase();
    const email = String(row[7] || "").trim();

    if (!username) continue;

    if (dept === "Asst.Professor" || dept === "Associate Professor" || dept === "Professor") {
      dept = "CSE";
    }
    if (username.startsWith("ECET")) dept = "ECE";
    else if (username.startsWith("EEET")) dept = "EEE";
    else if (username.startsWith("MECT") || username.startsWith("MECH")) dept = "Mechanical";
    else if (username.startsWith("CIVT") || username.startsWith("CIVIL")) dept = "Civil";
    else if (username.startsWith("CHET") || username.startsWith("PHYT") || username.startsWith("MATT") || username.startsWith("ENGT") || username.startsWith("TAMT") || username.startsWith("SH")) dept = "S&H";
    else if (username.startsWith("CSET") || username.startsWith("CSE")) dept = "CSE";
    else if (username.startsWith("ITT")) dept = "IT";
    else if (username.startsWith("AIDS")) dept = "AIDS";

    let role = "faculty";
    if (oldFormType === "hod" || desig.toLowerCase().includes("hod")) role = "hod";
    else if (oldFormType === "principal" || oldFormType === "prinicpal" || desig.toLowerCase().includes("principal")) role = "principal";
    else if (oldFormType === "dean" || username === "vadmin") role = "vadmin";
    else if (oldFormType === "radmin" || username === "radmin") role = "radmin";
    else if (oldFormType === "admin" || username === "admin") role = "admin";

    if (desig.toLowerCase().includes("prof") && !desig.toLowerCase().includes("asst")) desig = "Professor";
    else if (desig.toLowerCase().includes("asso")) desig = "Associate Professor";
    else if (oldFormType === "ap1") desig = "AP1";
    else if (oldFormType === "ap2") desig = "AP2";
    else if (oldFormType === "ap3") desig = "AP3";
    else if (oldFormType === "ap4") desig = "AP4";
    else if (oldFormType === "sh1") desig = "SH1";
    else if (oldFormType === "sh2") desig = "SH2";
    else if (oldFormType === "sh3") desig = "SH3";
    else if (oldFormType === "sh4") desig = "SH4";
    else if (oldFormType === "sh5") desig = "SH5";

    const passwordHash = bcrypt.hashSync(rawPassword, 10);

    const [existing] = await db.query("SELECT username FROM faculty WHERE username = ?", [username]);
    if (existing.length > 0) {
      await db.query(
        "UPDATE faculty SET password_hash=?, name=?, department=?, designation=?, role=?, email=? WHERE username=?",
        [passwordHash, name, dept, desig, role, email === "-" ? "" : email, username]
      );
    } else {
      await db.query(
        "INSERT INTO faculty (username, password_hash, name, department, designation, role, email) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [username, passwordHash, name, dept, desig, role, email === "-" ? "" : email]
      );
      migratedFacultyCount++;
    }
  }

  /* ---------------- 2. MIGRATE ACADEMIC DETAILS ---------------- */
  console.log("📦 2. Migrating Faculty Academic Details...");
  const rawAcadRows = parseSqlInserts(sql, "faculty_academic_details");

  for (const row of rawAcadRows) {
    if (row.length < 2) continue;
    const username = String(row[1] || "").trim();
    if (!username) continue;

    const payload = [
      String(row[2] || "").trim(),
      numVal(row[3]),
      numVal(row[4]),
      String(row[5] || "").trim(),
      String(row[6] || "").trim(),
      numVal(row[7]),
      numVal(row[8]),
      String(row[9] || "").trim(),
      String(row[10] || "").trim(),
      new Date().toISOString(),
      username,
    ];

    const [existing] = await db.query("SELECT username FROM faculty_academic_details WHERE username = ?", [username]);
    if (existing.length > 0) {
      await db.query(
        `UPDATE faculty_academic_details SET
           area_of_specialization=?, teaching_experience=?, industry_experience=?,
           courses_taught_odd=?, courses_taught_even=?, ug_projects_guided=?,
           pg_projects_guided=?, tutorship=?, achievements=?, updated_at=?
         WHERE username=?`,
        payload
      );
    } else {
      await db.query(
        `INSERT INTO faculty_academic_details
           (area_of_specialization, teaching_experience, industry_experience,
            courses_taught_odd, courses_taught_even, ug_projects_guided,
            pg_projects_guided, tutorship, achievements, updated_at, username)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        payload
      );
      migratedAcademicCount++;
    }
  }

  /* ---------------- 3. MIGRATE APPRAISAL SUBMISSIONS (AP1-AP4, ASSO, PROF, SH1-SH5) ---------------- */
  console.log("📦 3. Migrating Appraisal Submissions from AP1..SH5 tables...");
  const formTables = ["ap1", "ap2", "ap3", "ap4", "asso", "prof", "sh1", "sh2", "sh3", "sh4", "sh5"];

  for (const tableName of formTables) {
    const rawRows = parseSqlInserts(sql, tableName);
    for (const row of rawRows) {
      if (row.length < 3) continue;
      const username = String(row[1] || "").trim();
      if (!username) continue;

      const [fac] = await db.query("SELECT * FROM faculty WHERE username = ?", [username]);
      if (fac.length === 0) {
        skippedUsers.push({ username, reason: `Faculty ${username} not found in faculty table during ${tableName} import` });
        continue;
      }
      const f = fac[0];

      let totalScore = 0;
      let maxScore = 100;
      for (let i = row.length - 1; i >= 0; i--) {
        const val = numVal(row[i], -1);
        if (val > 0 && val <= 100) {
          totalScore = val;
          break;
        }
      }

      const answers = [
        { questionText: "Self Appraisal Criteria Response", optionScore: totalScore, questionScore: totalScore, evidence: "Migrated from legacy FPA appraisal ledger" }
      ];

      const submittedAt = new Date().toISOString();

      const [existing] = await db.query("SELECT id FROM submissions WHERE username = ?", [username]);
      if (existing.length === 0) {
        await db.query(
          `INSERT INTO submissions (
             username, staff_name, department, designation, total_score, max_score, api_score,
             answers_json, submitted_at, is_draft, is_submitted, is_verified
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 1)`,
          [username, f.name, f.department, f.designation, totalScore, maxScore, totalScore, JSON.stringify(answers), submittedAt]
        );
        migratedSubmissionsCount++;
      }
    }
  }

  /* ---------------- 4. MIGRATE HOD EVALUATIONS ---------------- */
  console.log("📦 4. Migrating HOD Evaluations...");
  const rawHodRows = parseSqlInserts(sql, "hod");
  for (const row of rawHodRows) {
    if (row.length < 2) continue;
    const username = String(row[1] || "").trim();
    if (!username) continue;

    const [existing] = await db.query("SELECT id FROM hod_evaluations WHERE username = ?", [username]);
    const now = new Date().toISOString();
    const payload = [
      "hod_cse",
      row[2] || "5", row[3] || "5", row[4] || "5", row[5] || "5", row[6] || "5", row[7] || "5",
      row[8] || "5", row[9] || "5", row[10] || "5", row[11] || "5", row[12] || "5", row[13] || "5", row[14] || "5",
      numVal(row[15], 85), row[16] || "Migrated HOD Evaluation", 1, now, now, username
    ];

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO hod_evaluations
           (evaluator_username, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, hpe, remarks, is_submitted, submitted_at, updated_at, username)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        payload
      );
      migratedHodCount++;
    }
  }

  /* ---------------- 5. MIGRATE DEPARTMENT APPRAISAL ---------------- */
  console.log("📦 5. Migrating Department Appraisals...");
  const rawDeptRows = parseSqlInserts(sql, "department_appraisal");
  for (const row of rawDeptRows) {
    if (row.length < 2) continue;
    const username = String(row[1] || "").trim();
    if (!username) continue;

    const now = new Date().toISOString();
    const sg1 = numVal(row[3]);
    const sg2 = numVal(row[4]);
    const sg3 = numVal(row[5]);
    const sg4 = numVal(row[6]);
    const sg5 = numVal(row[7]);
    const sg6 = numVal(row[8]);
    const rawTotal = numVal(row[9], sg1 + sg2 + sg3 + sg4 + sg5 + sg6);
    const normalizedScore = Math.round(((rawTotal / 445) * 100) * 100) / 100;

    const [existing] = await db.query("SELECT id FROM department_appraisal WHERE username = ?", [username]);
    if (existing.length === 0) {
      await db.query(
        `INSERT INTO department_appraisal (
           username, department, faculty_info, form_data, special_skills,
           sg1_total, sg2_total, sg3_total, sg4_total, sg5_total, sg6_total,
           total_score, normalized_score, department_max_score, is_draft, is_submitted,
           submitted_date, created_at
         ) VALUES (?, 'CSE', '{}', '{}', '', ?, ?, ?, ?, ?, ?, ?, ?, 445, 0, 1, ?, ?)`,
        [username, sg1, sg2, sg3, sg4, sg5, sg6, rawTotal, normalizedScore, now, now]
      );
      migratedDeptAppraisalCount++;
    }
  }

  console.log("\n========================================================");
  console.log("✅ MIGRATION COMPLETED SUCCESSFULLY!");
  console.log("========================================================");
  console.log(`• Faculty Accounts Migrated : ${migratedFacultyCount}`);
  console.log(`• Academic Records Migrated : ${migratedAcademicCount}`);
  console.log(`• Appraisal Submissions     : ${migratedSubmissionsCount}`);
  console.log(`• HOD Evaluations Migrated  : ${migratedHodCount}`);
  console.log(`• Department Appraisals     : ${migratedDeptAppraisalCount}`);
  if (skippedUsers.length > 0) {
    console.log(`• Skipped/Unmapped Records  : ${skippedUsers.length}`);
  }
  console.log("========================================================\n");
}

if (process.argv[1]?.includes("migrateOldFPA.js")) {
  runMigration().then(() => process.exit(0)).catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
}
