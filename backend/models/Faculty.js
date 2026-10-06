import { getDbPool } from "../config/db.js";
import bcrypt from "bcryptjs";

export async function findAdminByUsername(username) {
  const db = await getDbPool();
  const [admins] = await db.query("SELECT * FROM admins WHERE username = ?", [username]);
  return admins.length > 0 ? admins[0] : null;
}

export async function findFacultyByUsername(username) {
  const db = await getDbPool();
  const [faculties] = await db.query("SELECT * FROM faculty WHERE username = ?", [username]);
  return faculties.length > 0 ? faculties[0] : null;
}

export async function getAllFaculty() {
  const db = await getDbPool();
  const [rows] = await db.query(
    "SELECT username, name, department, designation, role, email, phone FROM faculty ORDER BY name ASC"
  );
  return rows;
}

export async function getFacultyByDepartment(departmentId) {
  const db = await getDbPool();
  const [rows] = await db.query(
    "SELECT username, name, department, designation, role, email, phone FROM faculty WHERE department = ? ORDER BY name ASC",
    [departmentId]
  );
  return rows;
}

export async function createFaculty({ username, password, name, department, designation, role, email, phone }) {
  const db = await getDbPool();
  const uname = String(username).trim();
  const [existing] = await db.query("SELECT username FROM faculty WHERE username = ?", [uname]);
  if (existing.length > 0) {
    throw new Error("Faculty record with this username already exists.");
  }

  const hash = bcrypt.hashSync(password, 10);
  await db.query(
    "INSERT INTO faculty (username, password_hash, name, department, designation, role, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [uname, hash, String(name).trim(), String(department).trim(), String(designation).trim(), role || "faculty", email || "", phone || ""]
  );
  return uname;
}

export async function bulkCreateFaculty(facultyList) {
  const db = await getDbPool();
  const added = [];
  const skipped = [];

  for (const item of facultyList) {
    const uname = String(item.username || "").trim();
    const pwd = String(item.password || "faculty123").trim();
    const name = String(item.name || "").trim();
    const dept = String(item.department || "").trim();
    const desig = String(item.designation || "").trim();
    const role = String(item.role || "faculty").trim();

    if (!uname || !name || !dept || !desig) {
      skipped.push({ username: uname, reason: "Missing required fields" });
      continue;
    }

    const [existing] = await db.query("SELECT username FROM faculty WHERE username = ?", [uname]);
    if (existing.length > 0) {
      skipped.push({ username: uname, reason: "Duplicate username" });
      continue;
    }

    const hash = bcrypt.hashSync(pwd, 10);
    await db.query(
      "INSERT INTO faculty (username, password_hash, name, department, designation, role, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [uname, hash, name, dept, desig, role, item.email || "", item.phone || ""]
    );
    added.push(uname);
  }

  return { addedCount: added.length, skippedCount: skipped.length, added, skipped };
}

export async function updateFaculty(username, { name, department, designation, role, email, phone, password }) {
  const db = await getDbPool();
  const [rows] = await db.query("SELECT * FROM faculty WHERE username = ?", [username]);
  if (rows.length === 0) throw new Error("Faculty member not found.");

  const current = rows[0];

  if (password && String(password).trim().length >= 6) {
    const hash = bcrypt.hashSync(password.trim(), 10);
    await db.query(
      "UPDATE faculty SET name=?, department=?, designation=?, role=?, email=?, phone=?, password_hash=? WHERE username=?",
      [name || current.name, department || current.department, designation || current.designation, role || current.role, email ?? current.email, phone ?? current.phone, hash, username]
    );
  } else {
    await db.query(
      "UPDATE faculty SET name=?, department=?, designation=?, role=?, email=?, phone=? WHERE username=?",
      [name || current.name, department || current.department, designation || current.designation, role || current.role, email ?? current.email, phone ?? current.phone, username]
    );
  }
}

export async function deleteFaculty(username) {
  const db = await getDbPool();
  await db.query("DELETE FROM faculty WHERE username = ?", [username]);
}

export async function clearFacultyData() {
  const db = await getDbPool();
  await db.query("DELETE FROM submissions");
  await db.query("DELETE FROM hod_evaluations");
  await db.query("DELETE FROM principal_evaluations");
  await db.query("DELETE FROM reviewer_evaluations");
  await db.query("DELETE FROM dean_verifications");
  await db.query("DELETE FROM department_appraisal");
  await db.query("DELETE FROM faculty_academic_details");
  await db.query("DELETE FROM faculty WHERE role != 'admin' AND username != 'admin'");
}

export async function updatePassword(table, username, newPassword) {
  const db = await getDbPool();
  const newHash = bcrypt.hashSync(newPassword, 10);
  await db.query(`UPDATE ${table} SET password_hash = ? WHERE username = ?`, [newHash, username]);
}

export async function resetFacultyPassword(username, newPassword, resetAll = false) {
  const db = await getDbPool();
  if (resetAll) {
    const defaultPwd = newPassword || "faculty123";
    const hash = bcrypt.hashSync(defaultPwd, 10);
    await db.query("UPDATE faculty SET password_hash = ? WHERE role != 'admin'", [hash]);
    return `Passwords for all faculty reset to '${defaultPwd}'.`;
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  await db.query("UPDATE faculty SET password_hash = ? WHERE username = ?", [username, hash]);
  return `Password for ${username} reset successfully.`;
}

export async function getAcademicDetails(staffId) {
  const db = await getDbPool();
  const [rows] = await db.query("SELECT * FROM faculty_academic_details WHERE username = ?", [staffId]);
  if (rows.length === 0) {
    return {
      username: staffId,
      areaOfSpecialization: "",
      teachingExperience: 0,
      industryExperience: 0,
      coursesTaughtOdd: "",
      coursesTaughtEven: "",
      ugProjectsGuided: 0,
      pgProjectsGuided: 0,
      tutorship: "",
      achievements: "",
    };
  }
  const r = rows[0];
  return {
    username: r.username,
    areaOfSpecialization: r.area_of_specialization || "",
    teachingExperience: r.teaching_experience || 0,
    industryExperience: r.industry_experience || 0,
    coursesTaughtOdd: r.courses_taught_odd || "",
    coursesTaughtEven: r.courses_taught_even || "",
    ugProjectsGuided: r.ug_projects_guided || 0,
    pgProjectsGuided: r.pg_projects_guided || 0,
    tutorship: r.tutorship || "",
    achievements: r.achievements || "",
  };
}

export async function saveAcademicDetails(staffId, details) {
  const db = await getDbPool();
  const updatedAt = new Date().toISOString();
  const [existing] = await db.query("SELECT username FROM faculty_academic_details WHERE username = ?", [staffId]);

  const payload = [
    String(details.areaOfSpecialization || "").trim(),
    Number(details.teachingExperience || 0),
    Number(details.industryExperience || 0),
    String(details.coursesTaughtOdd || "").trim(),
    String(details.coursesTaughtEven || "").trim(),
    Number(details.ugProjectsGuided || 0),
    Number(details.pgProjectsGuided || 0),
    String(details.tutorship || "").trim(),
    String(details.achievements || "").trim(),
    updatedAt,
    staffId,
  ];

  if (existing.length > 0) {
    await db.query(
      `UPDATE faculty_academic_details SET
         area_of_specialization = ?, teaching_experience = ?, industry_experience = ?,
         courses_taught_odd = ?, courses_taught_even = ?, ug_projects_guided = ?,
         pg_projects_guided = ?, tutorship = ?, achievements = ?, updated_at = ?
       WHERE username = ?`,
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
  }
}
