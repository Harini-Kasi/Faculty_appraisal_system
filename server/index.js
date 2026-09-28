import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { Parser as Json2CsvParser } from "json2csv";

import { getDbPool, initDb } from "./config/db.js";
import { createSession, destroySession, requireAuth } from "./auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 4001;

let db = null;
initDb()
  .then(async () => {
    db = await getDbPool();
    console.log("MySQL Database initialized and connected.");
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });

app.use(async (req, res, next) => {
  if (!db) {
    db = await getDbPool();
  }
  next();
});

/* ============================================================
   AUTH & USER MANAGEMENT
   ============================================================ */

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  const uname = String(username).trim();

  try {
    // 1. Check Admin accounts
    const [admins] = await db.query("SELECT * FROM admins WHERE username = ?", [uname]);
    if (admins.length > 0 && bcrypt.compareSync(password, admins[0].password_hash)) {
      const admin = admins[0];
      const token = createSession("admin", admin.username);
      return res.json({
        token,
        role: "admin",
        user: { username: admin.username, name: admin.name, department: "Admin", designation: "Administrator", role: "admin" },
      });
    }

    // 2. Check Faculty / HOD / Principal / Reviewer / Dean accounts
    const [faculties] = await db.query("SELECT * FROM faculty WHERE username = ?", [uname]);
    if (faculties.length > 0 && bcrypt.compareSync(password, faculties[0].password_hash)) {
      const faculty = faculties[0];
      const role = faculty.role || "faculty";
      const token = createSession(role, faculty.username);
      return res.json({
        token,
        role,
        user: {
          username: faculty.username,
          name: faculty.name,
          department: faculty.department,
          designation: faculty.designation,
          role,
          email: faculty.email || "",
        },
      });
    }

    return res.status(401).json({ error: "Invalid username or password." });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during authentication." });
  }
});

app.post("/api/auth/logout", requireAuth(), (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) destroySession(token);
  res.json({ ok: true });
});

app.get("/api/me", requireAuth(), async (req, res) => {
  const { role, username } = req.session;
  try {
    if (role === "admin") {
      const [rows] = await db.query("SELECT username, name FROM admins WHERE username = ?", [username]);
      return res.json({ role, user: { ...rows[0], department: "Admin", designation: "Administrator", role: "admin" } });
    }
    const [rows] = await db.query(
      "SELECT username, name, department, designation, role, email, phone FROM faculty WHERE username = ?",
      [username]
    );
    res.json({ role, user: rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user profile." });
  }
});

app.post("/api/auth/change-password", requireAuth(), async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required." });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  const { role, username } = req.session;
  const table = role === "admin" ? "admins" : "faculty";

  try {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE username = ?`, [username]);
    if (rows.length === 0 || !bcrypt.compareSync(currentPassword, rows[0].password_hash)) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await db.query(`UPDATE ${table} SET password_hash = ? WHERE username = ?`, [newHash, username]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error updating password." });
  }
});

/* ============================================================
   DEPARTMENTS & DESIGNATIONS
   ============================================================ */

app.get("/api/departments", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT dept_code AS code, dept_name AS name, max_score AS maxScore FROM departments ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching departments." });
  }
});

app.get("/api/designations", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT desig_code AS code, desig_name AS name FROM designations ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching designations." });
  }
});

/* ============================================================
   FACULTY MANAGEMENT (CRUD & BULK)
   ============================================================ */

app.get("/api/faculty", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT username, name, department, designation, role, email, phone FROM faculty ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching faculty list." });
  }
});

app.get("/api/faculty/department/:departmentId", async (req, res) => {
  const { departmentId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT username, name, department, designation, role, email, phone FROM faculty WHERE department = ? ORDER BY name ASC",
      [departmentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching department faculty." });
  }
});

app.get("/api/faculty/:staffId", async (req, res) => {
  const { staffId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT username, name, department, designation, role, email, phone FROM faculty WHERE username = ?",
      [staffId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Faculty member not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching faculty details." });
  }
});

// Single Faculty Creation (Admin)
app.post("/api/faculty", requireAuth("admin"), async (req, res) => {
  const { username, password, name, department, designation, role, email, phone } = req.body || {};
  if (!username || !password || !name || !department || !designation) {
    return res.status(400).json({ error: "Username, password, name, department, and designation are required." });
  }

  const uname = String(username).trim();
  try {
    const [existing] = await db.query("SELECT username FROM faculty WHERE username = ?", [uname]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Faculty record with this username already exists." });
    }

    const hash = bcrypt.hashSync(password, 10);
    await db.query(
      "INSERT INTO faculty (username, password_hash, name, department, designation, role, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [uname, hash, String(name).trim(), String(department).trim(), String(designation).trim(), role || "faculty", email || "", phone || ""]
    );
    res.json({ ok: true, username: uname });
  } catch (err) {
    res.status(500).json({ error: "Error creating faculty record." });
  }
});

// Bulk Faculty Creation (Admin)
app.post("/api/faculty/bulk", requireAuth("admin"), async (req, res) => {
  const { facultyList } = req.body || {};
  if (!Array.isArray(facultyList) || facultyList.length === 0) {
    return res.status(400).json({ error: "facultyList array is required." });
  }

  const added = [];
  const skipped = [];

  try {
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

    res.json({ ok: true, addedCount: added.length, skippedCount: skipped.length, added, skipped });
  } catch (err) {
    res.status(500).json({ error: "Error processing bulk faculty creation." });
  }
});

// Edit Faculty (Admin)
app.put("/api/faculty/:username", requireAuth("admin"), async (req, res) => {
  const { username } = req.params;
  const { name, department, designation, role, email, phone, password } = req.body || {};

  try {
    const [rows] = await db.query("SELECT * FROM faculty WHERE username = ?", [username]);
    if (rows.length === 0) return res.status(404).json({ error: "Faculty member not found." });

    if (password && String(password).trim().length >= 6) {
      const hash = bcrypt.hashSync(password.trim(), 10);
      await db.query(
        "UPDATE faculty SET name=?, department=?, designation=?, role=?, email=?, phone=?, password_hash=? WHERE username=?",
        [name || rows[0].name, department || rows[0].department, designation || rows[0].designation, role || rows[0].role, email ?? rows[0].email, phone ?? rows[0].phone, hash, username]
      );
    } else {
      await db.query(
        "UPDATE faculty SET name=?, department=?, designation=?, role=?, email=?, phone=? WHERE username=?",
        [name || rows[0].name, department || rows[0].department, designation || rows[0].designation, role || rows[0].role, email ?? rows[0].email, phone ?? rows[0].phone, username]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error updating faculty record." });
  }
});

// Delete Faculty (Admin)
app.delete("/api/faculty/:username", requireAuth("admin"), async (req, res) => {
  const { username } = req.params;
  try {
    await db.query("DELETE FROM faculty WHERE username = ?", [username]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error deleting faculty member." });
  }
});

// Clear Faculty & Appraisal Data (Admin only - sensitive)
app.post("/api/admin/clear-faculty-data", requireAuth("admin"), async (req, res) => {
  const { confirm } = req.body || {};
  if (confirm !== "CLEAR_DATA_CONFIRMED") {
    return res.status(400).json({ error: "Confirmation keyword missing." });
  }

  try {
    await db.query("DELETE FROM submissions");
    await db.query("DELETE FROM hod_evaluations");
    await db.query("DELETE FROM principal_evaluations");
    await db.query("DELETE FROM reviewer_evaluations");
    await db.query("DELETE FROM dean_verifications");
    await db.query("DELETE FROM department_appraisal");
    await db.query("DELETE FROM faculty_academic_details");
    await db.query("DELETE FROM faculty WHERE role != 'admin' AND username != 'admin'");
    res.json({ ok: true, message: "Faculty and appraisal data cleared while preserving Admin." });
  } catch (err) {
    res.status(500).json({ error: "Error clearing faculty data." });
  }
});

/* ============================================================
   FACULTY ACADEMIC DETAILS APIS
   ============================================================ */

app.get("/api/faculty/:staffId/academic-details", async (req, res) => {
  const { staffId } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM faculty_academic_details WHERE username = ?", [staffId]);
    if (rows.length === 0) {
      return res.json({
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
      });
    }
    const r = rows[0];
    res.json({
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
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching academic details." });
  }
});

app.post("/api/faculty/:staffId/academic-details", requireAuth(), async (req, res) => {
  const { staffId } = req.params;
  const details = req.body || {};
  const updatedAt = new Date().toISOString();

  try {
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

    res.json({ ok: true, username: staffId });
  } catch (err) {
    res.status(500).json({ error: "Error saving academic details." });
  }
});

/* ============================================================
   QUESTIONS APIS
   ============================================================ */

async function loadQuestionsFor(department, designation) {
  let [qRows] = await db.query(
    `SELECT * FROM questions WHERE department = ? AND designation = ? ORDER BY order_index ASC, id ASC`,
    [department, designation]
  );

  if (qRows.length === 0 && department !== "S&H") {
    [qRows] = await db.query(
      `SELECT * FROM questions WHERE department = 'Engineering' AND designation = ? ORDER BY order_index ASC, id ASC`,
      [designation]
    );
  }

  if (qRows.length === 0) {
    [qRows] = await db.query(
      `SELECT * FROM questions WHERE designation = ? ORDER BY order_index ASC, id ASC`,
      [designation]
    );
  }

  const result = [];
  for (const q of qRows) {
    const [options] = await db.query(
      "SELECT id, text, score FROM options WHERE question_id = ? ORDER BY order_index ASC, id ASC",
      [q.id]
    );
    result.push({ ...q, options });
  }
  return result;
}

app.get("/api/questions", requireAuth(), async (req, res) => {
  try {
    const [faculties] = await db.query(
      "SELECT department, designation FROM faculty WHERE username = ?",
      [req.session.username]
    );
    if (faculties.length === 0) return res.status(404).json({ error: "Faculty record not found." });
    const faculty = faculties[0];

    const rows = await loadQuestionsFor(faculty.department, faculty.designation);

    const sanitized = rows.map((q) => ({
      id: q.id,
      sectionCode: q.section_code,
      sectionLabel: q.section_label,
      subsectionCode: q.subsection_code,
      subsectionLabel: q.subsection_label,
      groupCode: q.group_code,
      groupLabel: q.group_label,
      text: q.text,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        score: Math.round(o.score * q.weightage * 100) / 100,
      })),
    }));

    res.json({ department: faculty.department, designation: faculty.designation, questions: sanitized });
  } catch (err) {
    res.status(500).json({ error: "Error loading questions." });
  }
});

app.get("/api/questions/assigned/:staffId", async (req, res) => {
  const { staffId } = req.params;
  try {
    const [faculties] = await db.query(
      "SELECT department, designation FROM faculty WHERE username = ?",
      [staffId]
    );
    if (faculties.length === 0) return res.status(404).json({ error: "Faculty record not found." });
    const faculty = faculties[0];

    const rows = await loadQuestionsFor(faculty.department, faculty.designation);
    res.json({ staffId, department: faculty.department, designation: faculty.designation, questions: rows });
  } catch (err) {
    res.status(500).json({ error: "Error loading assigned questions." });
  }
});

/* ============================================================
   SELF APPRAISAL SUBMISSION & DRAFT APIS
   ============================================================ */

async function saveDraftSubmission(username, answers, details) {
  const [faculties] = await db.query("SELECT * FROM faculty WHERE username = ?", [username]);
  if (faculties.length === 0) throw new Error("Faculty record not found.");
  const faculty = faculties[0];

  const questions = await loadQuestionsFor(faculty.department, faculty.designation);
  const answerByQid = new Map((answers || []).map((a) => [a.questionId, a]));

  let totalScore = 0;
  let maxScore = 0;
  const lineItems = [];

  for (const q of questions) {
    const maxOptionScore = Math.max(...q.options.map((o) => o.score), 0);
    maxScore += maxOptionScore * q.weightage;

    const ans = answerByQid.get(q.id);
    const evidence = (ans?.evidence || "").trim();
    const option = ans ? q.options.find((o) => o.id === Number(ans.optionId)) : null;

    const questionScore = option ? Math.round(option.score * q.weightage * 100) / 100 : 0;
    if (option) totalScore += questionScore;

    lineItems.push({
      questionId: q.id,
      questionText: q.text,
      sectionLabel: q.section_label,
      subsectionLabel: q.subsection_label,
      groupLabel: q.group_label,
      weightage: q.weightage,
      selectedOption: option ? option.text : "",
      optionScore: option ? option.score : 0,
      questionScore,
      evidence,
    });
  }

  totalScore = Math.round(totalScore * 100) / 100;
  maxScore = Math.round(maxScore * 100) / 100;
  const submittedAt = new Date().toISOString();

  // Upsert draft
  const [existingDraft] = await db.query(
    "SELECT id, is_submitted FROM submissions WHERE username = ? AND is_draft = 1 LIMIT 1",
    [username]
  );

  const payload = [
    faculty.username,
    faculty.name,
    faculty.department,
    faculty.designation,
    totalScore,
    maxScore,
    totalScore,
    JSON.stringify(lineItems),
    submittedAt,
    1,
    0,
    String(details?.areaOfSpecialization || "").trim(),
    Number(details?.teachingExperience || 0),
    Number(details?.industryExperience || 0),
    String(details?.coursesTaughtOdd || "").trim(),
    String(details?.coursesTaughtEven || "").trim(),
    Number(details?.ugProjectsGuided || 0),
    Number(details?.pgProjectsGuided || 0),
    String(details?.tutorship || "").trim(),
  ];

  if (existingDraft.length > 0) {
    await db.query(
      `UPDATE submissions SET
         staff_name=?, department=?, designation=?, total_score=?, max_score=?, api_score=?,
         answers_json=?, submitted_at=?, is_draft=1, is_submitted=0,
         area_of_specialization=?, teaching_experience=?, industry_experience=?,
         courses_taught_odd=?, courses_taught_even=?, ug_projects_guided=?, pg_projects_guided=?, tutorship=?
       WHERE id=?`,
      [...payload.slice(1), existingDraft[0].id]
    );
    return { id: existingDraft[0].id, totalScore, maxScore, isDraft: true };
  } else {
    const [res] = await db.query(
      `INSERT INTO submissions (
         username, staff_name, department, designation, total_score, max_score, api_score, answers_json, submitted_at,
         is_draft, is_submitted,
         area_of_specialization, teaching_experience, industry_experience,
         courses_taught_odd, courses_taught_even, ug_projects_guided, pg_projects_guided, tutorship
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payload
    );
    return { id: res.insertId, totalScore, maxScore, isDraft: true };
  }
}

async function processSubmission(username, answers, details) {
  const [faculties] = await db.query("SELECT * FROM faculty WHERE username = ?", [username]);
  if (faculties.length === 0) throw new Error("Faculty record not found.");
  const faculty = faculties[0];

  // Check if faculty already has a finalized submission
  const [existingFinal] = await db.query(
    "SELECT id FROM submissions WHERE username = ? AND is_submitted = 1 LIMIT 1",
    [username]
  );
  if (existingFinal.length > 0) {
    throw new Error("Your self-appraisal has already been submitted. Contact Admin if you need to re-open submission.");
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error("No answers submitted.");
  }

  const questions = await loadQuestionsFor(faculty.department, faculty.designation);
  if (questions.length === 0) {
    throw new Error("No evaluation form exists for your department/designation.");
  }

  const answerByQid = new Map(answers.map((a) => [a.questionId, a]));
  let totalScore = 0;
  let maxScore = 0;
  const lineItems = [];

  for (const q of questions) {
    const maxOptionScore = Math.max(...q.options.map((o) => o.score), 0);
    maxScore += maxOptionScore * q.weightage;

    const ans = answerByQid.get(q.id);
    const evidence = (ans?.evidence || "").trim();
    const option = ans ? q.options.find((o) => o.id === Number(ans.optionId)) : null;

    if (!option || !evidence) {
      throw new Error("Please answer every question and provide evidence before submitting.");
    }

    const questionScore = Math.round(option.score * q.weightage * 100) / 100;
    totalScore += questionScore;

    lineItems.push({
      questionId: q.id,
      questionText: q.text,
      sectionLabel: q.section_label,
      subsectionLabel: q.subsection_label,
      groupLabel: q.group_label,
      weightage: q.weightage,
      selectedOption: option.text,
      optionScore: option.score,
      questionScore,
      evidence,
    });
  }

  totalScore = Math.round(totalScore * 100) / 100;
  maxScore = Math.round(maxScore * 100) / 100;
  const submittedAt = new Date().toISOString();

  // Delete any draft if exists
  await db.query("DELETE FROM submissions WHERE username = ? AND is_draft = 1", [username]);

  const [res] = await db.query(
    `INSERT INTO submissions (
       username, staff_name, department, designation, total_score, max_score, api_score, answers_json, submitted_at,
       is_draft, is_submitted,
       area_of_specialization, teaching_experience, industry_experience,
       courses_taught_odd, courses_taught_even, ug_projects_guided, pg_projects_guided, tutorship
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      faculty.username,
      faculty.name,
      faculty.department,
      faculty.designation,
      totalScore,
      maxScore,
      totalScore,
      JSON.stringify(lineItems),
      submittedAt,
      String(details?.areaOfSpecialization || "").trim(),
      Number(details?.teachingExperience || 0),
      Number(details?.industryExperience || 0),
      String(details?.coursesTaughtOdd || "").trim(),
      String(details?.coursesTaughtEven || "").trim(),
      Number(details?.ugProjectsGuided || 0),
      Number(details?.pgProjectsGuided || 0),
      String(details?.tutorship || "").trim(),
    ]
  );

  return { id: res.insertId, totalScore, maxScore, submittedAt };
}

app.post("/api/appraisal/draft", requireAuth("faculty"), async (req, res) => {
  try {
    const { answers, details } = req.body || {};
    const result = await saveDraftSubmission(req.session.username, answers, details);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to save draft." });
  }
});

app.get("/api/appraisal/draft", requireAuth("faculty"), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM submissions WHERE username = ? AND is_draft = 1 ORDER BY id DESC LIMIT 1",
      [req.session.username]
    );
    if (rows.length === 0) return res.json(null);
    res.json(formatSubmission(rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Error fetching appraisal draft." });
  }
});

app.post("/api/appraisal/submit", requireAuth("faculty"), async (req, res) => {
  try {
    const { answers, details } = req.body || {};
    const result = await processSubmission(req.session.username, answers, details);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to submit appraisal." });
  }
});

function formatSubmission(row) {
  return {
    id: row.id,
    username: row.username,
    staffName: row.staff_name,
    department: row.department,
    designation: row.designation,
    totalScore: row.total_score,
    maxScore: row.max_score,
    apiScore: row.api_score,
    submittedAt: row.submitted_at,
    isDraft: Boolean(row.is_draft),
    isSubmitted: Boolean(row.is_submitted),
    isVerified: Boolean(row.is_verified),
    verifiedBy: row.verified_by || "",
    verificationRemarks: row.verification_remarks || "",
    verifiedAt: row.verified_at || "",
    answers: JSON.parse(row.answers_json || "[]"),
    details: {
      areaOfSpecialization: row.area_of_specialization ?? "",
      teachingExperience: row.teaching_experience ?? null,
      industryExperience: row.industry_experience ?? null,
      coursesTaughtOdd: row.courses_taught_odd ?? "",
      coursesTaughtEven: row.courses_taught_even ?? "",
      ugProjectsGuided: row.ug_projects_guided ?? null,
      pgProjectsGuided: row.pg_projects_guided ?? null,
      tutorship: row.tutorship ?? "",
    },
  };
}

app.get("/api/submissions", requireAuth(), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM submissions WHERE username = ? ORDER BY id DESC",
      [req.session.username]
    );
    res.json(rows.map(formatSubmission));
  } catch (err) {
    res.status(500).json({ error: "Error fetching submissions." });
  }
});

app.get("/api/appraisal/submissions/:staffId", async (req, res) => {
  const { staffId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM submissions WHERE username = ? ORDER BY id DESC",
      [staffId]
    );
    res.json(rows.map(formatSubmission));
  } catch (err) {
    res.status(500).json({ error: "Error fetching staff submissions." });
  }
});

app.get("/api/appraisal/:staffId", async (req, res) => {
  const { staffId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
      [staffId]
    );
    if (rows.length === 0) {
      const [drafts] = await db.query(
        "SELECT * FROM submissions WHERE username = ? AND is_draft = 1 ORDER BY id DESC LIMIT 1",
        [staffId]
      );
      if (drafts.length === 0) {
        return res.status(404).json({ error: "No submission found for this staff ID." });
      }
      return res.json(formatSubmission(drafts[0]));
    }
    res.json(formatSubmission(rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Error retrieving staff submission." });
  }
});

// Aggregated Combined View (Faculty Basic + Academic + Self Appraisal + HOD + Principal + Reviewer + Dean)
app.get("/api/faculty/combined-appraisal/:staffId", async (req, res) => {
  const { staffId } = req.params;
  try {
    const [faculties] = await db.query("SELECT username, name, department, designation, role, email, phone FROM faculty WHERE username = ?", [staffId]);
    if (faculties.length === 0) return res.status(404).json({ error: "Faculty member not found." });

    const faculty = faculties[0];

    const [academic] = await db.query("SELECT * FROM faculty_academic_details WHERE username = ?", [staffId]);
    const [submissions] = await db.query("SELECT * FROM submissions WHERE username = ? ORDER BY id DESC LIMIT 1", [staffId]);
    const [hodEval] = await db.query("SELECT * FROM hod_evaluations WHERE username = ?", [staffId]);
    const [principalEval] = await db.query("SELECT * FROM principal_evaluations WHERE username = ?", [staffId]);
    const [reviewerEval] = await db.query("SELECT * FROM reviewer_evaluations WHERE username = ?", [staffId]);
    const [deanVerify] = await db.query("SELECT * FROM dean_verifications WHERE username = ?", [staffId]);

    res.json({
      faculty,
      academicDetails: academic[0] || null,
      selfAppraisal: submissions.length > 0 ? formatSubmission(submissions[0]) : null,
      hodEvaluation: hodEval[0] || null,
      principalEvaluation: principalEval[0] || null,
      reviewerEvaluation: reviewerEval[0] || null,
      deanVerification: deanVerify[0] || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving combined appraisal details." });
  }
});

/* ============================================================
   HOD EVALUATION APIS
   ============================================================ */

app.get("/api/hod/faculty-list", requireAuth("hod", "admin"), async (req, res) => {
  try {
    let department = req.query.department;
    if (!department && req.session.role === "hod") {
      const [fac] = await db.query("SELECT department FROM faculty WHERE username = ?", [req.session.username]);
      department = fac[0]?.department;
    }
    const [rows] = await db.query(
      `SELECT f.username, f.name, f.department, f.designation,
              s.is_submitted AS self_submitted, s.total_score AS self_score,
              h.is_submitted AS hod_submitted, h.hpe AS hod_score
       FROM faculty f
       LEFT JOIN (SELECT username, is_submitted, total_score FROM submissions WHERE is_submitted = 1) s ON f.username = s.username
       LEFT JOIN hod_evaluations h ON f.username = h.username
       WHERE (? IS NULL OR f.department = ?) AND f.role = 'faculty'
       ORDER BY f.name ASC`,
      [department || null, department || null]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching HOD faculty list." });
  }
});

app.post("/api/hod/evaluation", requireAuth("hod", "admin"), async (req, res) => {
  const { username, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, hpe, remarks, isSubmitted } = req.body || {};
  if (!username) return res.status(400).json({ error: "Faculty username is required." });

  const evaluator = req.session.username;
  const now = new Date().toISOString();

  try {
    const [existing] = await db.query("SELECT id FROM hod_evaluations WHERE username = ?", [username]);

    const payload = [
      evaluator,
      h1 || "", h2 || "", h3 || "", h4 || "", h5 || "", h6 || "",
      h7 || "", h8 || "", h9 || "", h10 || "", h11 || "", h12 || "", h13 || "",
      Number(hpe || 0), remarks || "", isSubmitted ? 1 : 0, now, now, username
    ];

    if (existing.length > 0) {
      await db.query(
        `UPDATE hod_evaluations SET
           evaluator_username=?, h1=?, h2=?, h3=?, h4=?, h5=?, h6=?, h7=?, h8=?, h9=?, h10=?, h11=?, h12=?, h13=?,
           hpe=?, remarks=?, is_submitted=?, submitted_at=?, updated_at=?
         WHERE username=?`,
        payload
      );
    } else {
      await db.query(
        `INSERT INTO hod_evaluations
           (evaluator_username, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, hpe, remarks, is_submitted, submitted_at, updated_at, username)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        payload
      );
    }
    res.json({ ok: true, username });
  } catch (err) {
    res.status(500).json({ error: "Error saving HOD evaluation." });
  }
});

app.get("/api/hod/evaluation/:username", requireAuth(), async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM hod_evaluations WHERE username = ?", [username]);
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching HOD evaluation." });
  }
});

/* ============================================================
   PRINCIPAL EVALUATION APIS
   ============================================================ */

app.get("/api/principal/faculty-list/:dept", requireAuth("principal", "admin"), async (req, res) => {
  const { dept } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT f.username, f.name, f.department, f.designation,
              s.is_submitted AS self_submitted, s.total_score AS self_score,
              p.is_submitted AS principal_submitted, p.total_score AS principal_score
       FROM faculty f
       LEFT JOIN (SELECT username, is_submitted, total_score FROM submissions WHERE is_submitted = 1) s ON f.username = s.username
       LEFT JOIN principal_evaluations p ON f.username = p.username
       WHERE f.department = ? AND f.role = 'faculty'
       ORDER BY f.name ASC`,
      [dept]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Principal faculty list." });
  }
});

app.post("/api/principal/evaluation", requireAuth("principal", "admin"), async (req, res) => {
  const { username, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, totalScore, remarks, isSubmitted } = req.body || {};
  if (!username) return res.status(400).json({ error: "Faculty username is required." });

  const evaluator = req.session.username;
  const now = new Date().toISOString();

  try {
    const [existing] = await db.query("SELECT id FROM principal_evaluations WHERE username = ?", [username]);

    const payload = [
      evaluator,
      p1 || "", p2 || "", p3 || "", p4 || "", p5 || "",
      p6 || "", p7 || "", p8 || "", p9 || "", p10 || "",
      Number(totalScore || 0), remarks || "", isSubmitted ? 1 : 0, now, now, username
    ];

    if (existing.length > 0) {
      await db.query(
        `UPDATE principal_evaluations SET
           evaluator_username=?, p1=?, p2=?, p3=?, p4=?, p5=?, p6=?, p7=?, p8=?, p9=?, p10=?,
           total_score=?, remarks=?, is_submitted=?, submitted_at=?, updated_at=?
         WHERE username=?`,
        payload
      );
    } else {
      await db.query(
        `INSERT INTO principal_evaluations
           (evaluator_username, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, total_score, remarks, is_submitted, submitted_at, updated_at, username)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        payload
      );
    }
    res.json({ ok: true, username });
  } catch (err) {
    res.status(500).json({ error: "Error saving Principal evaluation." });
  }
});

app.get("/api/principal/evaluation/:username", requireAuth(), async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM principal_evaluations WHERE username = ?", [username]);
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Principal evaluation." });
  }
});

/* ============================================================
   REVIEWER (RADMIN) EVALUATION APIS
   ============================================================ */

app.get("/api/reviewer/faculty-list/:dept", requireAuth("radmin", "admin"), async (req, res) => {
  const { dept } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT f.username, f.name, f.department, f.designation,
              s.is_submitted AS self_submitted, s.total_score AS self_score,
              r.is_submitted AS reviewer_submitted, r.total_score AS reviewer_score
       FROM faculty f
       LEFT JOIN (SELECT username, is_submitted, total_score FROM submissions WHERE is_submitted = 1) s ON f.username = s.username
       LEFT JOIN reviewer_evaluations r ON f.username = r.username
       WHERE f.department = ? AND f.role = 'faculty'
       ORDER BY f.name ASC`,
      [dept]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Reviewer faculty list." });
  }
});

app.post("/api/reviewer/evaluation", requireAuth("radmin", "admin"), async (req, res) => {
  const { username, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, totalScore, remarks, isSubmitted } = req.body || {};
  if (!username) return res.status(400).json({ error: "Faculty username is required." });

  const evaluator = req.session.username;
  const now = new Date().toISOString();

  try {
    const [existing] = await db.query("SELECT id FROM reviewer_evaluations WHERE username = ?", [username]);

    const payload = [
      evaluator,
      r1 || "", r2 || "", r3 || "", r4 || "", r5 || "",
      r6 || "", r7 || "", r8 || "", r9 || "", r10 || "",
      Number(totalScore || 0), remarks || "", isSubmitted ? 1 : 0, now, now, username
    ];

    if (existing.length > 0) {
      await db.query(
        `UPDATE reviewer_evaluations SET
           evaluator_username=?, r1=?, r2=?, r3=?, r4=?, r5=?, r6=?, r7=?, r8=?, r9=?, r10=?,
           total_score=?, remarks=?, is_submitted=?, submitted_at=?, updated_at=?
         WHERE username=?`,
        payload
      );
    } else {
      await db.query(
        `INSERT INTO reviewer_evaluations
           (evaluator_username, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, total_score, remarks, is_submitted, submitted_at, updated_at, username)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        payload
      );
    }
    res.json({ ok: true, username });
  } catch (err) {
    res.status(500).json({ error: "Error saving Reviewer evaluation." });
  }
});

app.get("/api/reviewer/evaluation/:username", requireAuth(), async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM reviewer_evaluations WHERE username = ?", [username]);
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Reviewer evaluation." });
  }
});

/* ============================================================
   DEAN (VADMIN) VERIFICATION APIS
   ============================================================ */

app.get("/api/dean/faculty-list/:dept", requireAuth("vadmin", "admin"), async (req, res) => {
  const { dept } = req.params;
  try {
    let query = `
      SELECT f.username, f.name, f.department, f.designation, f.role,
             s.id AS submission_id,
             s.is_submitted AS self_submitted, s.total_score AS self_score, s.max_score,
             IF(s.is_verified = 1, 'VERIFIED', 'PENDING') AS verification_status,
             s.is_verified, s.verified_by, s.verified_at, s.verification_remarks
      FROM faculty f
      LEFT JOIN (SELECT * FROM submissions WHERE is_submitted = 1) s ON f.username = s.username
      WHERE f.role != 'admin'
    `;
    const params = [];

    if (dept && dept.toUpperCase() !== "ALL") {
      query += ` AND (
        f.department = ? 
        OR f.department = (SELECT dept_code FROM departments WHERE dept_name = ? LIMIT 1)
        OR f.department = (SELECT dept_name FROM departments WHERE dept_code = ? LIMIT 1)
      )`;
      params.push(dept, dept, dept);
    }

    query += ` ORDER BY f.name ASC`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching Dean faculty list:", err);
    res.status(500).json({ error: "Error fetching Dean faculty list." });
  }
});

async function loadSubmissionQuestions(username, department, designation) {
  // 1. Fetch submission if exists
  const [subRows] = await db.query(
    "SELECT answers_json FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
    [username]
  );

  let submissionAns = [];
  if (subRows.length > 0) {
    try {
      submissionAns = JSON.parse(subRows[0].answers_json || "[]");
    } catch {
      submissionAns = [];
    }
  }

  const qIdsFromSub = submissionAns.map((a) => a.questionId).filter(Boolean);

  // 2. Load questions from DB
  let qRows = [];
  if (qIdsFromSub.length > 0) {
    const placeholders = qIdsFromSub.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT * FROM questions WHERE (department = ? AND designation = ?) OR id IN (${placeholders}) ORDER BY order_index ASC, id ASC`,
      [department, designation, ...qIdsFromSub]
    );
    qRows = rows;
  } else {
    qRows = await loadQuestionsFor(department, designation);
  }

  // Fallback if qRows empty
  if (!qRows || qRows.length === 0) {
    const [assigned] = await db.query(
      `SELECT * FROM questions WHERE department = ? OR designation = ? ORDER BY order_index ASC, id ASC`,
      [department, designation]
    );
    qRows = assigned;
  }

  const result = [];
  const processedQids = new Set();

  for (const q of (qRows || [])) {
    processedQids.add(q.id);
    const [options] = await db.query(
      "SELECT id, text, score FROM options WHERE question_id = ? ORDER BY order_index ASC, id ASC",
      [q.id]
    );

    result.push({
      id: q.id,
      sectionCode: q.section_code || "A",
      sectionLabel: q.section_label || "A. Self Appraisal",
      subsectionCode: q.subsection_code || "A.1",
      subsectionLabel: q.subsection_label || "A.1 Self Development",
      groupCode: q.group_code || "A1.1",
      groupLabel: q.group_label || "A1.1 Knowledge / Skill Development",
      section_code: q.section_code || "A",
      section_label: q.section_label || "A. Self Appraisal",
      subsection_code: q.subsection_code || "A.1",
      subsection_label: q.subsection_label || "A.1 Self Development",
      group_code: q.group_code || "A1.1",
      group_label: q.group_label || "A1.1 Knowledge / Skill Development",
      text: q.text,
      weightage: q.weightage || 1,
      orderIndex: q.order_index || 0,
      options: (options || []).map((o) => ({
        id: o.id,
        text: o.text,
        score: Math.round(o.score * (q.weightage || 1) * 100) / 100,
      })),
    });
  }

  // Include line items from submission if missing in DB
  for (const ans of submissionAns) {
    if (ans.questionId && !processedQids.has(ans.questionId)) {
      processedQids.add(ans.questionId);
      result.push({
        id: ans.questionId,
        sectionCode: ans.sectionCode || ans.section_code || "A",
        sectionLabel: ans.sectionLabel || ans.section_label || "A. Self Appraisal",
        subsectionCode: ans.subsectionCode || ans.subsection_code || "A.1",
        subsectionLabel: ans.subsectionLabel || ans.subsection_label || "A.1 Self Development",
        groupCode: ans.groupCode || ans.group_code || "A1.1",
        groupLabel: ans.groupLabel || ans.group_label || "A1.1 Knowledge / Skill Development",
        section_code: ans.sectionCode || ans.section_code || "A",
        section_label: ans.sectionLabel || ans.section_label || "A. Self Appraisal",
        subsection_code: ans.subsectionCode || ans.subsection_code || "A.1",
        subsection_label: ans.subsectionLabel || ans.subsection_label || "A.1 Self Development",
        group_code: ans.groupCode || ans.group_code || "A1.1",
        group_label: ans.groupLabel || ans.group_label || "A1.1 Knowledge / Skill Development",
        text: ans.questionText || "Question " + ans.questionId,
        weightage: ans.weightage || 1,
        orderIndex: 0,
        options: ans.selectedOption ? [{ id: ans.optionId || 1, text: ans.selectedOption, score: ans.optionScore || 0 }] : [],
      });
    }
  }

  // Sort questions in strict order: sectionCode, subsectionCode, groupCode, orderIndex, id
  result.sort((a, b) => {
    if (a.sectionCode !== b.sectionCode) return (a.sectionCode || "").localeCompare(b.sectionCode || "");
    if (a.subsectionCode !== b.subsectionCode) return (a.subsectionCode || "").localeCompare(b.subsectionCode || "");
    if (a.groupCode !== b.groupCode) return (a.groupCode || "").localeCompare(b.groupCode || "");
    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });

  return result;
}

// GET VAdmin appraisal details for a specific faculty member (includes protected first section & question options)
app.get("/api/vadmin/appraisals/:username", requireAuth("vadmin", "admin"), async (req, res) => {
  const { username } = req.params;
  try {
    const [faculties] = await db.query(
      "SELECT username, name, department, designation, role, email, phone FROM faculty WHERE username = ?",
      [username]
    );
    if (faculties.length === 0) return res.status(404).json({ error: "Faculty member not found." });
    const faculty = faculties[0];

    const [acadRows] = await db.query("SELECT * FROM faculty_academic_details WHERE username = ?", [username]);
    const academicDetails = acadRows.length > 0 ? {
      areaOfSpecialization: acadRows[0].area_of_specialization || "",
      teachingExperience: acadRows[0].teaching_experience || 0,
      industryExperience: acadRows[0].industry_experience || 0,
      coursesTaughtOdd: acadRows[0].courses_taught_odd || "",
      coursesTaughtEven: acadRows[0].courses_taught_even || "",
      ugProjectsGuided: acadRows[0].ug_projects_guided || 0,
      pgProjectsGuided: acadRows[0].pg_projects_guided || 0,
      tutorship: acadRows[0].tutorship || "",
      achievements: acadRows[0].achievements || "",
    } : null;

    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
      [username]
    );
    const submission = subRows.length > 0 ? formatSubmission(subRows[0]) : null;

    // Load exact submitted questions & section hierarchy
    const questions = await loadSubmissionQuestions(username, faculty.department, faculty.designation);

    res.json({
      faculty,
      academicDetails,
      submission,
      questions,
      isVerified: submission ? Boolean(submission.isVerified) : false,
      verificationStatus: submission && submission.isVerified ? "VERIFIED" : "PENDING",
      verifiedBy: submission?.verifiedBy || "",
      verifiedAt: submission?.verifiedAt || "",
      verificationRemarks: submission?.verificationRemarks || "",
    });
  } catch (err) {
    console.error("VAdmin details error:", err);
    res.status(500).json({ error: "Error fetching VAdmin appraisal details." });
  }
});

// PUT VAdmin permitted response modifications before verification (strictly prohibits modifying protected first section & verified appraisals)
app.put("/api/vadmin/appraisals/:username/responses", requireAuth("vadmin", "admin"), async (req, res) => {
  const { username } = req.params;
  const { answers } = req.body || {};

  try {
    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
      [username]
    );
    if (subRows.length === 0) {
      return res.status(404).json({ error: "No submitted appraisal found for this faculty member." });
    }
    const submission = subRows[0];

    // Server-side Enforcement: Block response modifications if already verified
    if (submission.is_verified === 1) {
      return res.status(403).json({ error: "Cannot modify an appraisal that has already been verified." });
    }

    const [faculties] = await db.query("SELECT department, designation FROM faculty WHERE username = ?", [username]);
    if (faculties.length === 0) return res.status(404).json({ error: "Faculty not found." });
    const faculty = faculties[0];

    const questions = await loadSubmissionQuestions(username, faculty.department, faculty.designation);
    const answerByQid = new Map((answers || []).map((a) => [a.questionId, a]));

    let totalScore = 0;
    let maxScore = 0;
    const lineItems = [];

    for (const q of questions) {
      const maxOptionScore = q.options.length ? Math.max(...q.options.map((o) => o.score), 0) : 0;
      maxScore += maxOptionScore * q.weightage;

      const ans = answerByQid.get(q.id);
      const evidence = (ans?.evidence || "").trim();
      const option = ans ? q.options.find((o) => Number(o.id) === Number(ans.optionId)) : null;

      if (!option) {
        // Fallback to original answer if unchanged
        const origAns = JSON.parse(submission.answers_json || "[]").find((a) => a.questionId === q.id);
        const origOpt = origAns ? q.options.find((o) => o.text === origAns.selectedOption) : null;
        const score = origOpt ? Math.round(origOpt.score * q.weightage * 100) / 100 : 0;
        if (origOpt) totalScore += score;
        lineItems.push({
          questionId: q.id,
          questionText: q.text,
          sectionLabel: q.section_label || q.sectionLabel,
          subsectionLabel: q.subsection_label || q.subsectionLabel,
          groupLabel: q.group_label || q.groupLabel,
          weightage: q.weightage,
          selectedOption: origOpt ? origOpt.text : "",
          optionId: origOpt ? origOpt.id : null,
          optionScore: origOpt ? origOpt.score : 0,
          questionScore: score,
          evidence: evidence || origAns?.evidence || "",
        });
      } else {
        const questionScore = Math.round(option.score * q.weightage * 100) / 100;
        totalScore += questionScore;
        lineItems.push({
          questionId: q.id,
          questionText: q.text,
          sectionLabel: q.section_label || q.sectionLabel,
          subsectionLabel: q.subsection_label || q.subsectionLabel,
          groupLabel: q.group_label || q.groupLabel,
          weightage: q.weightage,
          selectedOption: option.text,
          optionId: option.id,
          optionScore: option.score,
          questionScore,
          evidence,
        });
      }
    }

    totalScore = Math.round(totalScore * 100) / 100;
    maxScore = Math.round(maxScore * 100) / 100;

    await db.query(
      "UPDATE submissions SET total_score = ?, max_score = ?, api_score = ?, answers_json = ? WHERE id = ?",
      [totalScore, maxScore, totalScore, JSON.stringify(lineItems), submission.id]
    );

    res.json({ ok: true, totalScore, maxScore, answers: lineItems });
  } catch (err) {
    console.error("VAdmin response update error:", err);
    res.status(500).json({ error: "Error updating appraisal responses." });
  }
});

// POST VAdmin verification (strictly rejects double verification & server-recalculates final score)
app.post("/api/dean/verify", requireAuth("vadmin", "admin"), async (req, res) => {
  const { username, remarks, pendingAnswers } = req.body || {};
  if (!username) return res.status(400).json({ error: "Faculty username is required." });

  const verifier = req.session.username;
  const now = new Date().toISOString();

  try {
    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
      [username]
    );
    if (subRows.length === 0) {
      return res.status(404).json({ error: "No submitted appraisal found to verify." });
    }
    const submission = subRows[0];

    // Server-side Enforcement: Block re-verification of already verified appraisals
    if (submission.is_verified === 1) {
      return res.status(400).json({ error: "This appraisal has already been verified and cannot be verified again." });
    }

    // Save pending response modifications if provided before verification
    if (Array.isArray(pendingAnswers) && pendingAnswers.length > 0) {
      const [faculties] = await db.query("SELECT department, designation FROM faculty WHERE username = ?", [username]);
      if (faculties.length > 0) {
        const faculty = faculties[0];
        const questions = await loadQuestionsFor(faculty.department, faculty.designation);
        const answerByQid = new Map(pendingAnswers.map((a) => [a.questionId, a]));

        let totalScore = 0;
        let maxScore = 0;
        const lineItems = [];

        for (const q of questions) {
          const maxOptionScore = Math.max(...q.options.map((o) => o.score), 0);
          maxScore += maxOptionScore * q.weightage;

          const ans = answerByQid.get(q.id);
          const evidence = (ans?.evidence || "").trim();
          const option = ans ? q.options.find((o) => Number(o.id) === Number(ans.optionId)) : null;

          if (option) {
            const questionScore = Math.round(option.score * q.weightage * 100) / 100;
            totalScore += questionScore;
            lineItems.push({
              questionId: q.id,
              questionText: q.text,
              sectionLabel: q.section_label,
              subsectionLabel: q.subsection_label,
              groupLabel: q.group_label,
              weightage: q.weightage,
              selectedOption: option.text,
              optionId: option.id,
              optionScore: option.score,
              questionScore,
              evidence,
            });
          }
        }
        if (lineItems.length > 0) {
          totalScore = Math.round(totalScore * 100) / 100;
          maxScore = Math.round(maxScore * 100) / 100;
          await db.query(
            "UPDATE submissions SET total_score = ?, max_score = ?, api_score = ?, answers_json = ? WHERE id = ?",
            [totalScore, maxScore, totalScore, JSON.stringify(lineItems), submission.id]
          );
        }
      }
    }

    // Record verification status
    const [existingDean] = await db.query("SELECT id FROM dean_verifications WHERE username = ?", [username]);
    if (existingDean.length > 0) {
      await db.query(
        "UPDATE dean_verifications SET verifier_username=?, is_verified=1, remarks=?, verified_at=? WHERE username=?",
        [verifier, remarks || "", now, username]
      );
    } else {
      await db.query(
        "INSERT INTO dean_verifications (verifier_username, is_verified, remarks, verified_at, username) VALUES (?, 1, ?, ?, ?)",
        [verifier, remarks || "", now, username]
      );
    }

    await db.query(
      "UPDATE submissions SET is_verified=1, verified_by=?, verification_remarks=?, verified_at=? WHERE id=?",
      [verifier, remarks || "", now, submission.id]
    );

    const [updatedSub] = await db.query("SELECT total_score, max_score FROM submissions WHERE id = ?", [submission.id]);

    res.json({
      ok: true,
      username,
      isVerified: true,
      verificationStatus: "VERIFIED",
      verifiedBy: verifier,
      verifiedAt: now,
      totalScore: updatedSub[0]?.total_score || submission.total_score,
      maxScore: updatedSub[0]?.max_score || submission.max_score,
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Error recording Dean verification." });
  }
});

app.get("/api/dean/verification/:username", requireAuth(), async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM dean_verifications WHERE username = ?", [username]);
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Dean verification." });
  }
});

/* ============================================================
   DEPARTMENT APPRAISAL WORKFLOW (HOD)
   ============================================================ */

app.post("/api/department-appraisal/draft", requireAuth("hod", "admin"), async (req, res) => {
  try {
    const result = await processDepartmentAppraisal(req.session.username, req.body || {}, true);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to save department appraisal draft." });
  }
});

app.post("/api/department-appraisal/submit", requireAuth("hod", "admin"), async (req, res) => {
  try {
    const result = await processDepartmentAppraisal(req.session.username, req.body || {}, false);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to submit department appraisal." });
  }
});

async function processDepartmentAppraisal(username, body, isDraft) {
  const { department, formData, specialSkills, facultyInfo } = body;
  if (!department) throw new Error("Department code is required.");

  // Get department division maximum score
  const [depts] = await db.query("SELECT max_score FROM departments WHERE dept_code = ?", [department]);
  const deptMaxScore = depts[0]?.max_score || 445;

  // Calculate Section Totals from formData keys starting with sg1_, sg2_, etc.
  let sg1 = 0, sg2 = 0, sg3 = 0, sg4 = 0, sg5 = 0, sg6 = 0;
  if (formData && typeof formData === "object") {
    Object.keys(formData).forEach((key) => {
      const val = Number(formData[key] || 0);
      if (key.startsWith("sg1_")) sg1 += val;
      else if (key.startsWith("sg2_")) sg2 += val;
      else if (key.startsWith("sg3_")) sg3 += val;
      else if (key.startsWith("sg4_")) sg4 += val;
      else if (key.startsWith("sg5_")) sg5 += val;
      else if (key.startsWith("sg6_")) sg6 += val;
    });
  }

  const rawTotal = Math.round((sg1 + sg2 + sg3 + sg4 + sg5 + sg6) * 100) / 100;
  const normalizedScore = Math.round(((rawTotal / deptMaxScore) * 100) * 100) / 100;
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
    sg1, sg2, sg3, sg4, sg5, sg6,
    rawTotal,
    normalizedScore,
    deptMaxScore,
    isDraft ? 1 : 0,
    isDraft ? 0 : 1,
    now,
    now
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

app.get("/api/department-appraisal/:department", async (req, res) => {
  const { department } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM department_appraisal WHERE department = ? ORDER BY id DESC LIMIT 1",
      [department]
    );
    if (rows.length === 0) return res.json(null);
    const r = rows[0];
    res.json({
      id: r.id,
      username: r.username,
      department: r.department,
      facultyInfo: JSON.parse(r.faculty_info || "{}"),
      formData: JSON.parse(r.form_data || "{}"),
      specialSkills: r.special_skills || "",
      sg1Total: r.sg1_total,
      sg2Total: r.sg2_total,
      sg3Total: r.sg3_total,
      sg4Total: r.sg4_total,
      sg5Total: r.sg5_total,
      sg6Total: r.sg6_total,
      totalScore: r.total_score,
      normalizedScore: r.normalized_score,
      departmentMaxScore: r.department_max_score,
      isDraft: Boolean(r.is_draft),
      isSubmitted: Boolean(r.is_submitted),
      submittedDate: r.submitted_date,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching department appraisal." });
  }
});

app.get("/api/department-appraisal/reports/summary", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM department_appraisal ORDER BY submitted_date DESC, created_at DESC"
    );
    const data = rows.map((r) => {
      const info = JSON.parse(r.faculty_info || "{}");
      return {
        id: r.id,
        username: r.username,
        department: r.department,
        facultyName: info.name || "N/A",
        designation: info.designation || "N/A",
        sg1Total: r.sg1_total,
        sg2Total: r.sg2_total,
        sg3Total: r.sg3_total,
        sg4Total: r.sg4_total,
        sg5Total: r.sg5_total,
        sg6Total: r.sg6_total,
        totalScore: r.total_score,
        normalizedScore: r.normalized_score,
        departmentMaxScore: r.department_max_score,
        status: r.is_submitted ? "Submitted" : "Draft",
        submittedDate: r.submitted_date,
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: "Error fetching department appraisal summary report." });
  }
});

/* ============================================================
   ADMIN TOOLS: RESET SUBMISSION & RESET PASSWORD
   ============================================================ */

app.post("/api/admin/reset-submission", requireAuth("admin"), async (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: "Username is required." });

  try {
    await db.query(
      "UPDATE submissions SET is_submitted = 0, is_draft = 1, is_verified = 0 WHERE username = ?",
      [username]
    );
    await db.query("UPDATE hod_evaluations SET is_submitted = 0 WHERE username = ?", [username]);
    await db.query("UPDATE dean_verifications SET is_verified = 0 WHERE username = ?", [username]);

    res.json({ ok: true, message: `Appraisal submission for ${username} has been re-opened.` });
  } catch (err) {
    res.status(500).json({ error: "Error resetting submission status." });
  }
});

app.post("/api/admin/reset-password", requireAuth("admin"), async (req, res) => {
  const { username, newPassword, resetAll } = req.body || {};

  try {
    if (resetAll === true) {
      const defaultPwd = newPassword || "faculty123";
      const hash = bcrypt.hashSync(defaultPwd, 10);
      await db.query("UPDATE faculty SET password_hash = ? WHERE role != 'admin'", [hash]);
      return res.json({ ok: true, message: `Passwords for all faculty reset to '${defaultPwd}'.` });
    }

    if (!username || !newPassword) {
      return res.status(400).json({ error: "Username and newPassword are required." });
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    await db.query("UPDATE faculty SET password_hash = ? WHERE username = ?", [username, hash]);
    res.json({ ok: true, message: `Password for ${username} reset successfully.` });
  } catch (err) {
    res.status(500).json({ error: "Error resetting password." });
  }
});

/* ============================================================
   REPORT EXPORT & EMAIL APIS
   ============================================================ */

app.get("/api/reports/faculty/export", requireAuth(), async (req, res) => {
  const format = String(req.query.format || "json").toLowerCase();
  const department = req.query.department;

  try {
    const [rows] = await db.query(
      `SELECT f.username, f.name, f.department, f.designation,
              s.total_score, s.max_score, s.submitted_at, s.is_submitted, s.is_verified
       FROM faculty f
       LEFT JOIN (SELECT * FROM submissions WHERE is_submitted = 1) s ON f.username = s.username
       WHERE (? IS NULL OR f.department = ?)
       ORDER BY f.department ASC, f.name ASC`,
      [department || null, department || null]
    );

    if (format === "csv") {
      const parser = new Json2CsvParser({ fields: ["username", "name", "department", "designation", "total_score", "max_score", "is_submitted", "is_verified"] });
      const csv = parser.parse(rows);
      res.header("Content-Type", "text/csv");
      res.attachment(`faculty_appraisal_report.csv`);
      return res.send(csv);
    }

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Faculty Appraisal Summary");
      sheet.columns = [
        { header: "Staff ID", key: "username", width: 15 },
        { header: "Name", key: "name", width: 25 },
        { header: "Department", key: "department", width: 15 },
        { header: "Designation", key: "designation", width: 22 },
        { header: "Total Score", key: "total_score", width: 12 },
        { header: "Max Score", key: "max_score", width: 12 },
        { header: "Submission Status", key: "is_submitted", width: 18 },
        { header: "Verification Status", key: "is_verified", width: 18 },
      ];
      rows.forEach((r) => {
        sheet.addRow({
          username: r.username,
          name: r.name,
          department: r.department,
          designation: r.designation,
          total_score: r.total_score || 0,
          max_score: r.max_score || 0,
          is_submitted: r.is_submitted ? "Submitted" : "Pending",
          is_verified: r.is_verified ? "Verified" : "Pending",
        });
      });
      res.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.attachment("faculty_appraisal_report.xlsx");
      await workbook.xlsx.write(res);
      return res.end();
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error exporting report." });
  }
});

// Nodemailer Report Email
app.post("/api/admin/send-report", requireAuth("admin"), async (req, res) => {
  const { recipientEmail, staffId } = req.body || {};
  if (!recipientEmail || !staffId) {
    return res.status(400).json({ error: "recipientEmail and staffId are required." });
  }

  try {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return res.status(400).json({ error: "SMTP credentials not configured in environment (SMTP_USER, SMTP_PASS)." });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const [fac] = await db.query("SELECT * FROM faculty WHERE username = ?", [staffId]);
    const [sub] = await db.query("SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1", [staffId]);

    const info = await transporter.sendMail({
      from: `"Faculty Appraisal System" <${smtpUser}>`,
      to: recipientEmail,
      subject: `Appraisal Report for ${fac[0]?.name || staffId}`,
      text: `Faculty Performance Appraisal Report Summary:\nStaff ID: ${staffId}\nName: ${fac[0]?.name}\nDepartment: ${fac[0]?.department}\nDesignation: ${fac[0]?.designation}\nTotal Score: ${sub[0]?.total_score || 0} / ${sub[0]?.max_score || 0}\nSubmission Date: ${sub[0]?.submitted_at || 'N/A'}\n`,
    });

    res.json({ ok: true, message: `Report sent to ${recipientEmail}`, messageId: info.messageId });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: err.message || "Failed to send report email." });
  }
});

/* ============================================================
   ADMIN — QUESTION BUILDER & SUBMISSIONS REVIEW
   ============================================================ */

app.get("/api/admin/questions", requireAuth("admin"), async (req, res) => {
  const { department, designation } = req.query;
  if (!department || !designation) {
    return res.status(400).json({ error: "department and designation are required." });
  }
  try {
    const rows = await loadQuestionsFor(department, designation);
    res.json(
      rows.map((q) => ({
        id: q.id,
        sectionCode: q.section_code,
        sectionLabel: q.section_label,
        subsectionCode: q.subsection_code,
        subsectionLabel: q.subsection_label,
        groupCode: q.group_code,
        groupLabel: q.group_label,
        text: q.text,
        weightage: q.weightage,
        options: q.options,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Error loading admin questions." });
  }
});

app.put("/api/admin/questions", requireAuth("admin"), async (req, res) => {
  const { department, designation, questions } = req.body || {};
  if (!department || !designation || !Array.isArray(questions)) {
    return res.status(400).json({ error: "department, designation and questions[] are required." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [existingQRows] = await connection.query(
      "SELECT id FROM questions WHERE department = ? AND designation = ?",
      [department, designation]
    );
    const existingQIds = new Set(existingQRows.map((r) => r.id));
    const keptQIds = new Set();

    for (let index = 0; index < questions.length; index++) {
      const q = questions[index];
      const payload = [
        department,
        designation,
        q.sectionCode || "",
        q.sectionLabel || "",
        q.subsectionCode || "",
        q.subsectionLabel || "",
        q.groupCode || "",
        q.groupLabel || "",
        q.text,
        q.weightage,
        index,
      ];

      const incomingId = Number(q.id);
      let questionId;
      if (incomingId > 0 && existingQIds.has(incomingId)) {
        questionId = incomingId;
        await connection.query(
          `UPDATE questions SET
             department = ?, designation = ?, section_code = ?, section_label = ?,
             subsection_code = ?, subsection_label = ?, group_code = ?, group_label = ?,
             text = ?, weightage = ?, order_index = ?
           WHERE id = ${questionId}`,
          payload
        );
      } else {
        const [qRes] = await connection.query(
          `INSERT INTO questions
             (department, designation, section_code, section_label, subsection_code,
              subsection_label, group_code, group_label, text, weightage, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          payload
        );
        questionId = qRes.insertId;
      }
      keptQIds.add(questionId);

      const [existingOptRows] = await connection.query(
        "SELECT id FROM options WHERE question_id = ?",
        [questionId]
      );
      const existingOptIds = new Set(existingOptRows.map((r) => r.id));
      const keptOptIds = new Set();

      const options = q.options || [];
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const incomingOptId = Number(opt.id);
        if (incomingOptId > 0 && existingOptIds.has(incomingOptId)) {
          await connection.query(
            "UPDATE options SET text = ?, score = ?, order_index = ? WHERE id = ? AND question_id = ?",
            [opt.text, opt.score, i, incomingOptId, questionId]
          );
          keptOptIds.add(incomingOptId);
        } else {
          const [optRes] = await connection.query(
            "INSERT INTO options (question_id, text, score, order_index) VALUES (?, ?, ?, ?)",
            [questionId, opt.text, opt.score, i]
          );
          keptOptIds.add(optRes.insertId);
        }
      }

      for (const id of existingOptIds) {
        if (!keptOptIds.has(id)) {
          await connection.query("DELETE FROM options WHERE id = ?", [id]);
        }
      }
    }

    for (const id of existingQIds) {
      if (!keptQIds.has(id)) {
        await connection.query("DELETE FROM questions WHERE id = ?", [id]);
      }
    }

    await connection.commit();
    res.json({ ok: true });
  } catch (err) {
    await connection.rollback();
    console.error("Save questions error:", err);
    res.status(500).json({ error: "Error saving question set." });
  } finally {
    connection.release();
  }
});

app.get("/api/admin/submissions", requireAuth("admin"), async (req, res) => {
  const { department, designation } = req.query;
  try {
    let rows;
    if (department && designation) {
      [rows] = await db.query(
        "SELECT * FROM submissions WHERE department = ? AND designation = ? ORDER BY id DESC",
        [department, designation]
      );
    } else if (department) {
      [rows] = await db.query(
        "SELECT * FROM submissions WHERE department = ? ORDER BY id DESC",
        [department]
      );
    } else if (designation) {
      [rows] = await db.query(
        "SELECT * FROM submissions WHERE designation = ? ORDER BY id DESC",
        [designation]
      );
    } else {
      [rows] = await db.query("SELECT * FROM submissions ORDER BY id DESC");
    }
    res.json(rows.map(formatSubmission));
  } catch (err) {
    res.status(500).json({ error: "Error fetching admin submissions." });
  }
});

app.get("/api/admin/staff-list", requireAuth("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT username, name, department, designation, role FROM faculty ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching staff list." });
  }
});

/* ============================================================
   ADMIN PERFORMANCE ANALYTICS APIS
   ============================================================ */

app.get("/api/analytics/department/:departmentId", async (req, res) => {
  const { departmentId } = req.params;
  try {
    const [facultyRows] = await db.query(
      "SELECT username, name, department, designation FROM faculty WHERE department = ?",
      [departmentId]
    );

    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE department = ? AND is_submitted = 1 ORDER BY id DESC",
      [departmentId]
    );

    const formattedSubmissions = subRows.map(formatSubmission);

    const latestSubMap = new Map();
    formattedSubmissions.forEach((sub) => {
      if (!latestSubMap.has(sub.username)) {
        latestSubMap.set(sub.username, sub);
      }
    });

    const latestSubs = Array.from(latestSubMap.values());
    const totalFaculty = facultyRows.length;
    const submittedCount = latestSubs.length;

    let avgPercentage = 0;
    let highestPerformer = null;
    let lowestPerformer = null;
    let excellentCount = 0;
    let goodCount = 0;
    let needsImprovementCount = 0;

    if (submittedCount > 0) {
      let sumPct = 0;
      let maxPct = -1;
      let minPct = 999;

      latestSubs.forEach((sub) => {
        const pct = sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;
        sumPct += pct;

        if (pct >= 85) excellentCount++;
        else if (pct >= 70) goodCount++;
        else needsImprovementCount++;

        if (pct > maxPct) {
          maxPct = pct;
          highestPerformer = { username: sub.username, name: sub.staffName, percentage: pct, designation: sub.designation };
        }
        if (pct < minPct) {
          minPct = pct;
          lowestPerformer = { username: sub.username, name: sub.staffName, percentage: pct, designation: sub.designation };
        }
      });

      avgPercentage = Math.round(sumPct / submittedCount);
    }

    res.json({
      departmentId,
      totalFaculty,
      submittedCount,
      avgPerformance: avgPercentage,
      highestPerformer,
      lowestPerformer,
      performanceDistribution: {
        excellent: excellentCount,
        good: goodCount,
        needsImprovement: needsImprovementCount,
      },
    });
  } catch (err) {
    console.error("Analytics department error:", err);
    res.status(500).json({ error: "Error computing department analytics." });
  }
});

app.get("/api/analytics/department/:departmentId/faculty", async (req, res) => {
  const { departmentId } = req.params;
  try {
    const [facultyRows] = await db.query(
      "SELECT username, name, department, designation FROM faculty WHERE department = ? ORDER BY name ASC",
      [departmentId]
    );

    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE department = ? AND is_submitted = 1 ORDER BY id DESC",
      [departmentId]
    );

    const formattedSubmissions = subRows.map(formatSubmission);
    const subMap = new Map();
    formattedSubmissions.forEach((sub) => {
      if (!subMap.has(sub.username)) {
        subMap.set(sub.username, sub);
      }
    });

    const result = facultyRows.map((f) => {
      const sub = subMap.get(f.username);
      const percentage = sub && sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;
      return {
        username: f.username,
        name: f.name,
        department: f.department,
        designation: f.designation,
        status: sub ? "Submitted" : "Pending",
        totalScore: sub ? sub.totalScore : 0,
        maxScore: sub ? sub.maxScore : 0,
        percentage,
        submittedAt: sub ? sub.submittedAt : null,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error fetching department faculty analytics." });
  }
});

app.get("/api/analytics/department/:departmentId/designation", async (req, res) => {
  const { departmentId } = req.params;
  try {
    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE department = ? AND is_submitted = 1 ORDER BY id DESC",
      [departmentId]
    );

    const formattedSubmissions = subRows.map(formatSubmission);
    const desigMap = new Map();

    formattedSubmissions.forEach((sub) => {
      const pct = sub.maxScore > 0 ? (sub.totalScore / sub.maxScore) * 100 : 0;
      if (!desigMap.has(sub.designation)) {
        desigMap.set(sub.designation, { designation: sub.designation, count: 0, sumPct: 0 });
      }
      const entry = desigMap.get(sub.designation);
      entry.count++;
      entry.sumPct += pct;
    });

    const result = Array.from(desigMap.values()).map((d) => ({
      designation: d.designation,
      count: d.count,
      averagePercentage: Math.round(d.sumPct / d.count),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error fetching designation analytics." });
  }
});

app.get("/api/analytics/faculty/:staffId", async (req, res) => {
  const { staffId } = req.params;
  try {
    const [facultyRows] = await db.query(
      "SELECT username, name, department, designation FROM faculty WHERE username = ?",
      [staffId]
    );

    if (facultyRows.length === 0) {
      return res.status(404).json({ error: "Faculty member not found." });
    }
    const faculty = facultyRows[0];

    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
      [staffId]
    );

    let submission = null;
    let overallScorePct = 0;
    const categoryScores = {};
    const strengths = [];
    const areasForImprovement = [];

    if (subRows.length > 0) {
      submission = formatSubmission(subRows[0]);
      overallScorePct = submission.maxScore > 0
        ? Math.round((submission.totalScore / submission.maxScore) * 100)
        : 0;

      const categoryMap = new Map();
      (submission.answers || []).forEach((ans) => {
        const cat = ans.sectionLabel || "General Appraisal";
        const score = Number(ans.questionScore ?? ans.optionScore ?? 0);

        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { name: cat, totalScore: 0, count: 0 });
        }
        const c = categoryMap.get(cat);
        c.totalScore += score;
        c.count++;

        const item = {
          text: ans.questionText,
          score,
          option: ans.selectedOption,
          evidence: ans.evidence,
        };

        if (score > 3) {
          strengths.push(item);
        } else if (score < 3) {
          areasForImprovement.push(item);
        }
      });

      categoryMap.forEach((val, key) => {
        categoryScores[key] = {
          name: key,
          averageScore: Math.round((val.totalScore / val.count) * 100) / 100,
        };
      });
    }

    const [deptSubRows] = await db.query(
      "SELECT total_score, max_score FROM submissions WHERE department = ? AND is_submitted = 1",
      [faculty.department]
    );
    let deptAvgPct = 0;
    if (deptSubRows.length > 0) {
      const sum = deptSubRows.reduce(
        (acc, row) => acc + (row.max_score > 0 ? (row.total_score / row.max_score) * 100 : 0),
        0
      );
      deptAvgPct = Math.round(sum / deptSubRows.length);
    }

    res.json({
      faculty,
      submission,
      overallScore: overallScorePct,
      categoryScores,
      strengths,
      areasForImprovement,
      departmentAverage: deptAvgPct,
    });
  } catch (err) {
    console.error("Faculty analytics error:", err);
    res.status(500).json({ error: "Error computing individual faculty analytics." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FPA API server listening on http://0.0.0.0:${PORT}`);
});
