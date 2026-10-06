import { getDbPool } from "../config/db.js";

export async function getAllDepartments() {
  const db = await getDbPool();
  const [rows] = await db.query(
    "SELECT dept_code AS code, dept_name AS name, max_score AS maxScore FROM departments ORDER BY id ASC"
  );
  return rows;
}

export async function getDepartmentMaxScore(deptCode) {
  const db = await getDbPool();
  const [depts] = await db.query("SELECT max_score FROM departments WHERE dept_code = ?", [deptCode]);
  return depts[0]?.max_score || 445;
}

export async function findLatestDepartmentAppraisal(department) {
  const db = await getDbPool();
  const [rows] = await db.query(
    "SELECT * FROM department_appraisal WHERE department = ? ORDER BY id DESC LIMIT 1",
    [department]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getAllDepartmentAppraisals() {
  const db = await getDbPool();
  const [rows] = await db.query(
    "SELECT * FROM department_appraisal ORDER BY submitted_date DESC, created_at DESC"
  );
  return rows;
}

export async function upsertDepartmentAppraisal({
  username,
  department,
  facultyInfo,
  formData,
  specialSkills,
  sg1,
  sg2,
  sg3,
  sg4,
  sg5,
  sg6,
  rawTotal,
  normalizedScore,
  deptMaxScore,
  isDraft,
}) {
  const db = await getDbPool();
  const now = new Date().toISOString();

  const [existing] = await db.query(
    "SELECT id FROM department_appraisal WHERE department = ? ORDER BY id DESC LIMIT 1",
    [department]
  );

  const payload = [
    username,
    department,
    JSON.stringify(facultyInfo || {}),
    JSON.stringify(formData || {}),
    specialSkills || "",
    sg1,
    sg2,
    sg3,
    sg4,
    sg5,
    sg6,
    rawTotal,
    normalizedScore,
    deptMaxScore,
    isDraft ? 1 : 0,
    isDraft ? 0 : 1,
    now,
    now,
  ];

  if (existing.length > 0) {
    await db.query(
      `UPDATE department_appraisal SET
         username=?, department=?, faculty_info=?, form_data=?, special_skills=?,
         sg1_total=?, sg2_total=?, sg3_total=?, sg4_total=?, sg5_total=?, sg6_total=?,
         total_score=?, normalized_score=?, department_max_score=?, is_draft=?, is_submitted=?,
         updated_at=?
       WHERE id=?`,
      [...payload.slice(0, 16), now, existing[0].id]
    );
    return { id: existing[0].id, rawTotal, normalizedScore, deptMaxScore, isDraft };
  } else {
    const [res] = await db.query(
      `INSERT INTO department_appraisal (
         username, department, faculty_info, form_data, special_skills,
         sg1_total, sg2_total, sg3_total, sg4_total, sg5_total, sg6_total,
         total_score, normalized_score, department_max_score, is_draft, is_submitted,
         submitted_date, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...payload.slice(0, 16), now, now]
    );
    return { id: res.insertId, rawTotal, normalizedScore, deptMaxScore, isDraft };
  }
}
