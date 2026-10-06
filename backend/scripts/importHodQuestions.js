import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDbPool } from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function importHodQuestions() {
  const db = await getDbPool();

  // Check if HOD questions are already imported
  const [existing] = await db.query("SELECT COUNT(*) as cnt FROM questions WHERE designation = 'HOD'");
  if (existing[0].cnt >= 95) {
    console.log(`✅ HOD Questions already imported (${existing[0].cnt} questions). Skipping.`);
    return;
  }

  // Locate hod_questions.sql file
  let sqlPath = "C:\\Users\\harin\\Downloads\\hod_questions.sql";
  if (!fs.existsSync(sqlPath)) {
    sqlPath = path.join(__dirname, "..", "database", "hod_questions.sql");
  }

  if (!fs.existsSync(sqlPath)) {
    console.error("❌ hod_questions.sql file not found at:", sqlPath);
    return;
  }

  console.log("📦 Importing HOD Questions from:", sqlPath);
  const sqlContent = fs.readFileSync(sqlPath, "utf-8");

  // Parse SQL file
  const lines = sqlContent.split(/\r?\n/);
  
  let currentLegacyQId = null;
  let newQId = null;
  const legacyToNewQIdMap = new Map();

  let importedQCount = 0;
  let importedOptCount = 0;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("--") || line.startsWith("/*") || line.startsWith("USE") || line.startsWith("START") || line.startsWith("COMMIT")) {
      continue;
    }

    // Match question INSERT
    if (line.startsWith("INSERT INTO questions") || line.startsWith("INSERT INTO `questions`")) {
      // Regex to extract values
      // VALUES (1, 'ALL', 'HOD', 'HOD', 'HOD Evaluation', NULL, NULL, 'EVAL1', 'Legacy HOD Evaluation 1', 'Academic Achievements', 3, 1);
      const valMatch = line.match(/VALUES\s*\((.+)\);?$/i);
      if (valMatch) {
        const rawVals = valMatch[1];
        // Parse SQL values carefully
        const vals = parseSqlValues(rawVals);
        
        // [id, department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index]
        const legacyId = parseInt(vals[0], 10);
        const department = vals[1];
        const designation = vals[2];
        const sectionCode = vals[3];
        const sectionLabel = vals[4];
        const subsectionCode = vals[5];
        const subsectionLabel = vals[6];
        const groupCode = vals[7];
        const groupLabel = vals[8];
        const text = vals[9];
        const weightage = parseFloat(vals[10]);
        const orderIndex = parseInt(vals[11], 10);

        // Check if question already exists by groupCode and text
        const [existingQ] = await db.query(
          "SELECT id FROM questions WHERE designation = 'HOD' AND group_code = ? AND text = ?",
          [groupCode, text]
        );

        if (existingQ.length > 0) {
          newQId = existingQ[0].id;
        } else {
          const [res] = await db.query(
            `INSERT INTO questions 
               (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [department, designation, sectionCode, sectionLabel, subsectionCode, subsectionLabel, groupCode, groupLabel, text, weightage, orderIndex]
          );
          newQId = res.insertId;
          importedQCount++;
        }

        legacyToNewQIdMap.set(legacyId, newQId);
        currentLegacyQId = legacyId;
      }
    } else if (line.startsWith("INSERT INTO options") || line.startsWith("INSERT INTO `options`")) {
      // VALUES (1, 1, 'Making more than 90%...', 5, 1);
      const valMatch = line.match(/VALUES\s*\((.+)\);?$/i);
      if (valMatch) {
        const rawVals = valMatch[1];
        const vals = parseSqlValues(rawVals);
        
        // [id, question_id, text, score, order_index]
        const legacyQuestionId = parseInt(vals[1], 10);
        const text = vals[2];
        const score = parseFloat(vals[3]);
        const orderIndex = parseInt(vals[4], 10);

        const targetQuestionId = legacyToNewQIdMap.get(legacyQuestionId) || newQId;

        if (targetQuestionId) {
          // Check if option exists
          const [existingOpt] = await db.query(
            "SELECT id FROM options WHERE question_id = ? AND text = ?",
            [targetQuestionId, text]
          );

          if (existingOpt.length === 0) {
            await db.query(
              "INSERT INTO options (question_id, text, score, order_index) VALUES (?, ?, ?, ?)",
              [targetQuestionId, text, score, orderIndex]
            );
            importedOptCount++;
          }
        }
      }
    }
  }

  console.log(`🎉 HOD Questions Import completed! Imported ${importedQCount} new questions, ${importedOptCount} options.`);
}

function parseSqlValues(rawValsStr) {
  const result = [];
  let current = "";
  let inString = false;
  let quoteChar = "";

  for (let i = 0; i < rawValsStr.length; i++) {
    const ch = rawValsStr[i];
    if (inString) {
      if (ch === quoteChar) {
        // Check for escaped quote ''
        if (i + 1 < rawValsStr.length && rawValsStr[i + 1] === quoteChar) {
          current += quoteChar;
          i++;
        } else {
          inString = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === "'" || ch === '"') {
        inString = true;
        quoteChar = ch;
      } else if (ch === ",") {
        result.push(cleanVal(current));
        current = "";
      } else {
        current += ch;
      }
    }
  }
  if (current) {
    result.push(cleanVal(current));
  }
  return result;
}

function cleanVal(v) {
  v = v.trim();
  if (v.toUpperCase() === "NULL") return null;
  return v;
}

if (process.argv[1] && process.argv[1].endsWith("importHodQuestions.js")) {
  importHodQuestions()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
