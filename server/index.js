import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { getDbPool, initDb } from "./config/db.js";
import { createSession, destroySession, requireAuth } from "./auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

// Initialize database pool and tables
let db = null;
initDb().then(async () => {
  db = await getDbPool();
  console.log("MySQL Database initialized and connected.");
}).catch((err) => {
  console.error("Failed to initialize database:", err);
});

// Middleware to ensure DB connection is ready
app.use(async (req, res, next) => {
  if (!db) {
    db = await getDbPool();
  }
  next();
});

/* ============================================================
   AUTH
   ============================================================ */

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  const uname = String(username).trim();

  try {
    const [admins] = await db.query("SELECT * FROM admins WHERE username = ?", [uname]);
    if (admins.length > 0 && bcrypt.compareSync(password, admins[0].password_hash)) {
      const admin = admins[0];
      const token = createSession("admin", admin.username);
      return res.json({ token, role: "admin", user: { username: admin.username, name: admin.name } });
    }

    const [faculties] = await db.query("SELECT * FROM faculty WHERE username = ?", [uname]);
    if (faculties.length > 0 && bcrypt.compareSync(password, faculties[0].password_hash)) {
      const faculty = faculties[0];
      const token = createSession("faculty", faculty.username);
      return res.json({
        token,
        role: "faculty",
        user: {
          username: faculty.username,
          name: faculty.name,
          department: faculty.department,
          designation: faculty.designation,
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
      return res.json({ role, user: rows[0] || null });
    }
    const [rows] = await db.query(
      "SELECT username, name, department, designation FROM faculty WHERE username = ?",
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
    const [rows] = await db.query("SELECT dept_code AS code, dept_name AS name FROM departments ORDER BY id ASC");
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
   FACULTY APIS
   ============================================================ */

app.get("/api/faculty", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT username, name, department, designation FROM faculty ORDER BY name ASC"
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
      "SELECT username, name, department, designation FROM faculty WHERE department = ? ORDER BY name ASC",
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
      "SELECT username, name, department, designation FROM faculty WHERE username = ?",
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

/* ============================================================
   QUESTIONS APIS
   ============================================================ */

async function loadQuestionsFor(department, designation) {
  let [qRows] = await db.query(
    `SELECT * FROM questions WHERE department = ? AND designation = ? ORDER BY order_index ASC, id ASC`,
    [department, designation]
  );

  // If no direct questions found for specific engineering branch, fall back to 'Engineering'
  if (qRows.length === 0 && department !== "S&H") {
    [qRows] = await db.query(
      `SELECT * FROM questions WHERE department = 'Engineering' AND designation = ? ORDER BY order_index ASC, id ASC`,
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

app.get("/api/questions", requireAuth("faculty"), async (req, res) => {
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
   APPRAISAL SUBMISSION & RETRIEVAL APIS
   ============================================================ */

const REQUIRED_TEXT_DETAILS = [
  ["areaOfSpecialization", "Area of Specialization"],
  ["coursesTaughtOdd", "Courses Taught (Odd Semester)"],
  ["coursesTaughtEven", "Courses Taught (Even Semester)"],
  ["tutorship", "Select Tutorship"],
];
const REQUIRED_NUMBER_DETAILS = [
  ["teachingExperience", "Teaching Experience"],
  ["industryExperience", "Industry Experience"],
  ["ugProjectsGuided", "UG Projects Guided"],
  ["pgProjectsGuided", "PG Projects Guided"],
];

function validateDetails(details) {
  if (!details || typeof details !== "object") {
    return "Please fill in your faculty details before submitting.";
  }
  for (const [key, label] of REQUIRED_TEXT_DETAILS) {
    if (!String(details[key] ?? "").trim()) {
      return `${label} is required.`;
    }
  }
  for (const [key, label] of REQUIRED_NUMBER_DETAILS) {
    const value = details[key];
    if (value === "" || value === null || value === undefined || Number.isNaN(Number(value)) || Number(value) < 0) {
      return `${label} must be a valid number.`;
    }
  }
  return null;
}

async function processSubmission(username, answers, details) {
  const [faculties] = await db.query("SELECT * FROM faculty WHERE username = ?", [username]);
  if (faculties.length === 0) throw new Error("Faculty record not found.");
  const faculty = faculties[0];

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error("No answers submitted.");
  }

  const detailsError = validateDetails(details);
  if (detailsError) {
    throw new Error(detailsError);
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
    const maxOptionScore = Math.max(...q.options.map((o) => o.score));
    maxScore += maxOptionScore * q.weightage;

    const ans = answerByQid.get(q.id);
    const evidence = (ans?.evidence || "").trim();
    const option = ans ? q.options.find((o) => o.id === ans.optionId) : null;

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

  const [res] = await db.query(
    `INSERT INTO submissions (
       username, staff_name, department, designation, total_score, max_score, answers_json, submitted_at,
       area_of_specialization, teaching_experience, industry_experience,
       courses_taught_odd, courses_taught_even, ug_projects_guided, pg_projects_guided, tutorship
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      faculty.username,
      faculty.name,
      faculty.department,
      faculty.designation,
      totalScore,
      maxScore,
      JSON.stringify(lineItems),
      submittedAt,
      String(details.areaOfSpecialization).trim(),
      Number(details.teachingExperience),
      Number(details.industryExperience),
      String(details.coursesTaughtOdd).trim(),
      String(details.coursesTaughtEven).trim(),
      Number(details.ugProjectsGuided),
      Number(details.pgProjectsGuided),
      String(details.tutorship).trim(),
    ]
  );

  return { id: res.insertId, totalScore, maxScore, submittedAt };
}

app.post("/api/appraisal/submit", requireAuth("faculty"), async (req, res) => {
  try {
    const { answers, details } = req.body || {};
    const result = await processSubmission(req.session.username, answers, details);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to submit appraisal." });
  }
});

app.post("/api/submissions", requireAuth("faculty"), async (req, res) => {
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
    submittedAt: row.submitted_at,
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

app.get("/api/submissions", requireAuth("faculty"), async (req, res) => {
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
      "SELECT * FROM submissions WHERE username = ? ORDER BY id DESC LIMIT 1",
      [staffId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "No submission found for this staff ID." });
    }
    res.json(formatSubmission(rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Error retrieving staff submission." });
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
      "SELECT username, name, department, designation FROM faculty ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching staff list." });
  }
});

/* ============================================================
   ADMIN PERFORMANCE ANALYTICS APIS
   ============================================================ */

// 1. Department Overview Analytics
app.get("/api/analytics/department/:departmentId", async (req, res) => {
  const { departmentId } = req.params;
  try {
    const [facultyRows] = await db.query(
      "SELECT username, name, department, designation FROM faculty WHERE department = ?",
      [departmentId]
    );

    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE department = ? ORDER BY id DESC",
      [departmentId]
    );

    const formattedSubmissions = subRows.map(formatSubmission);

    // Filter to latest submission per faculty
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

// 2. Department Faculty Performance List
app.get("/api/analytics/department/:departmentId/faculty", async (req, res) => {
  const { departmentId } = req.params;
  try {
    const [facultyRows] = await db.query(
      "SELECT username, name, department, designation FROM faculty WHERE department = ? ORDER BY name ASC",
      [departmentId]
    );

    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE department = ? ORDER BY id DESC",
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

// 3. Designation-Wise Average Performance for Department
app.get("/api/analytics/department/:departmentId/designation", async (req, res) => {
  const { departmentId } = req.params;
  try {
    const [subRows] = await db.query(
      "SELECT * FROM submissions WHERE department = ? ORDER BY id DESC",
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

// 4. Individual Faculty Analytics
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
      "SELECT * FROM submissions WHERE username = ? ORDER BY id DESC LIMIT 1",
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

    // Get department average for comparison
    const [deptSubRows] = await db.query(
      "SELECT total_score, max_score FROM submissions WHERE department = ?",
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

app.listen(PORT, () => {
  console.log(`FPA API server listening on http://localhost:${PORT}`);
});
