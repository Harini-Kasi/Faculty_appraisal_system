import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
import { createSession, destroySession, requireAuth } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

/* ============================================================
   AUTH
   ============================================================ */

// Single login endpoint for everyone. Username + password only.
// The server decides whether it's an admin or a faculty account,
// and — for faculty — resolves department & designation from the
// faculty table. The client never supplies role/department/designation.
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  const uname = String(username).trim();

  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(uname);
  if (admin && bcrypt.compareSync(password, admin.password_hash)) {
    const token = createSession("admin", admin.username);
    return res.json({ token, role: "admin", user: { username: admin.username, name: admin.name } });
  }

  const faculty = db.prepare("SELECT * FROM faculty WHERE username = ?").get(uname);
  if (faculty && bcrypt.compareSync(password, faculty.password_hash)) {
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
});

app.post("/api/auth/logout", requireAuth(), (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) destroySession(token);
  res.json({ ok: true });
});

app.get("/api/me", requireAuth(), (req, res) => {
  const { role, username } = req.session;
  if (role === "admin") {
    const admin = db.prepare("SELECT username, name FROM admins WHERE username = ?").get(username);
    return res.json({ role, user: admin });
  }
  const faculty = db
    .prepare("SELECT username, name, department, designation FROM faculty WHERE username = ?")
    .get(username);
  res.json({ role, user: faculty });
});

app.post("/api/auth/change-password", requireAuth(), (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required." });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  const { role, username } = req.session;
  const table = role === "admin" ? "admins" : "faculty";
  const row = db.prepare(`SELECT * FROM ${table} WHERE username = ?`).get(username);

  if (!row || !bcrypt.compareSync(currentPassword, row.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare(`UPDATE ${table} SET password_hash = ? WHERE username = ?`).run(newHash, username);
  res.json({ ok: true });
});

/* ============================================================
   FACULTY — questions (weightage stripped), submissions
   ============================================================ */

function loadQuestionsFor(department, designation) {
  let qRows = db
    .prepare(
      `SELECT * FROM questions WHERE department = ? AND designation = ? ORDER BY order_index ASC, id ASC`
    )
    .all(department, designation);

  // If no direct questions found for specific engineering branch, fall back to 'Engineering'
  if (qRows.length === 0 && department !== "S&H") {
    qRows = db
      .prepare(
        `SELECT * FROM questions WHERE department = 'Engineering' AND designation = ? ORDER BY order_index ASC, id ASC`
      )
      .all(designation);
  }

  return qRows.map((q) => {
    const options = db
      .prepare("SELECT id, text, score FROM options WHERE question_id = ? ORDER BY order_index ASC, id ASC")
      .all(q.id);
    return { ...q, options };
  });
}

// Faculty's own department + designation determine which questions come back.
// The client cannot request a different department/designation.
app.get("/api/questions", requireAuth("faculty"), (req, res) => {
  const faculty = db
    .prepare("SELECT department, designation FROM faculty WHERE username = ?")
    .get(req.session.username);
  if (!faculty) return res.status(404).json({ error: "Faculty record not found." });

  const rows = loadQuestionsFor(faculty.department, faculty.designation);

  // Weightage never leaves the server for a faculty client. Instead, each
  // option's score is pre-multiplied by the question's weightage here, so
  // the number the faculty sees ("Score: 3") is already the final,
  // calculated score — not a raw rating with a separate weightage applied
  // client-side.
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
});

// Common faculty-entered details, required from every faculty member
// regardless of designation, and saved as part of every submission.
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

app.post("/api/submissions", requireAuth("faculty"), (req, res) => {
  const faculty = db.prepare("SELECT * FROM faculty WHERE username = ?").get(req.session.username);
  if (!faculty) return res.status(404).json({ error: "Faculty record not found." });

  const { answers, details } = req.body || {}; // answers: [{ questionId, optionId, evidence }]
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "No answers submitted." });
  }

  const detailsError = validateDetails(details);
  if (detailsError) {
    return res.status(400).json({ error: detailsError });
  }

  const questions = loadQuestionsFor(faculty.department, faculty.designation);
  if (questions.length === 0) {
    return res.status(400).json({ error: "No evaluation form exists for your department/designation." });
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
      return res.status(400).json({ error: "Please answer every question and provide evidence before submitting." });
    }

    // Score is always computed server-side from weightage * option score —
    // the client cannot submit a score directly.
    const questionScore = Math.round(option.score * q.weightage * 100) / 100;
    totalScore += questionScore;

    lineItems.push({
      questionId: q.id,
      questionText: q.text,
      sectionLabel: q.section_label,
      subsectionLabel: q.subsection_label,
      groupLabel: q.group_label,
      weightage: q.weightage, // kept server-side / for admin review only
      selectedOption: option.text,
      optionScore: option.score,
      questionScore,
      evidence,
    });
  }

  totalScore = Math.round(totalScore * 100) / 100;
  maxScore = Math.round(maxScore * 100) / 100;
  const submittedAt = new Date().toISOString();

  const info = db
    .prepare(
      `INSERT INTO submissions (
         username, staff_name, department, designation, total_score, max_score, answers_json, submitted_at,
         area_of_specialization, teaching_experience, industry_experience,
         courses_taught_odd, courses_taught_even, ug_projects_guided, pg_projects_guided, tutorship
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
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
      String(details.tutorship).trim()
    );

  res.json({ id: info.lastInsertRowid, totalScore, maxScore, submittedAt });
});

app.get("/api/submissions", requireAuth("faculty"), (req, res) => {
  const rows = db
    .prepare("SELECT * FROM submissions WHERE username = ? ORDER BY id DESC")
    .all(req.session.username);
  res.json(rows.map(formatSubmission));
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
    answers: JSON.parse(row.answers_json),
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

/* ============================================================
   ADMIN — question builder, submissions review
   ============================================================ */

app.get("/api/admin/questions", requireAuth("admin"), (req, res) => {
  const { department, designation } = req.query;
  if (!department || !designation) {
    return res.status(400).json({ error: "department and designation are required." });
  }
  const rows = loadQuestionsFor(department, designation);
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
});

// Saves the question set for a given department + designation using real
// CRUD instead of delete-all-and-recreate:
//   - a question whose id already exists for this department/designation -> UPDATE
//   - a question with no id, or an id that isn't a real existing row     -> INSERT
//   - any existing question not present in the incoming list             -> DELETE
// The same update/insert/delete diffing is applied to each question's
// options, keyed by option id, so untouched rows (and their ids) never
// move. Everything runs in a single transaction.
app.put("/api/admin/questions", requireAuth("admin"), (req, res) => {
  const { department, designation, questions } = req.body || {};
  if (!department || !designation || !Array.isArray(questions)) {
    return res.status(400).json({ error: "department, designation and questions[] are required." });
  }

  const selectExistingQIds = db.prepare(
    "SELECT id FROM questions WHERE department = ? AND designation = ?"
  );
  const updateQ = db.prepare(`
    UPDATE questions SET
      section_code = @section_code,
      section_label = @section_label,
      subsection_code = @subsection_code,
      subsection_label = @subsection_label,
      group_code = @group_code,
      group_label = @group_label,
      text = @text,
      weightage = @weightage,
      order_index = @order_index
    WHERE id = @id AND department = @department AND designation = @designation
  `);
  const insertQ = db.prepare(`
    INSERT INTO questions
      (department, designation, section_code, section_label, subsection_code,
       subsection_label, group_code, group_label, text, weightage, order_index)
    VALUES (@department, @designation, @section_code, @section_label, @subsection_code,
            @subsection_label, @group_code, @group_label, @text, @weightage, @order_index)
  `);
  const deleteQ = db.prepare("DELETE FROM questions WHERE id = ?"); // ON DELETE CASCADE removes its options too

  const selectExistingOptIds = db.prepare("SELECT id FROM options WHERE question_id = ?");
  const updateOpt = db.prepare(
    "UPDATE options SET text = ?, score = ?, order_index = ? WHERE id = ? AND question_id = ?"
  );
  const insertOpt = db.prepare(
    "INSERT INTO options (question_id, text, score, order_index) VALUES (?, ?, ?, ?)"
  );
  const deleteOpt = db.prepare("DELETE FROM options WHERE id = ?");

  const tx = db.transaction(() => {
    const existingQIds = new Set(selectExistingQIds.all(department, designation).map((r) => r.id));
    const keptQIds = new Set();

    questions.forEach((q, index) => {
      const payload = {
        department,
        designation,
        section_code: q.sectionCode || "",
        section_label: q.sectionLabel || "",
        subsection_code: q.subsectionCode || "",
        subsection_label: q.subsectionLabel || "",
        group_code: q.groupCode || "",
        group_label: q.groupLabel || "",
        text: q.text,
        weightage: q.weightage,
        order_index: index,
      };

      const incomingId = Number(q.id);
      let questionId;
      if (incomingId > 0 && existingQIds.has(incomingId)) {
        questionId = incomingId;
        updateQ.run({ ...payload, id: questionId });
      } else {
        const info = insertQ.run(payload);
        questionId = info.lastInsertRowid;
      }
      keptQIds.add(questionId);

      // Diff this question's options the same way.
      const existingOptIds = new Set(selectExistingOptIds.all(questionId).map((r) => r.id));
      const keptOptIds = new Set();

      (q.options || []).forEach((opt, i) => {
        const incomingOptId = Number(opt.id);
        if (incomingOptId > 0 && existingOptIds.has(incomingOptId)) {
          updateOpt.run(opt.text, opt.score, i, incomingOptId, questionId);
          keptOptIds.add(incomingOptId);
        } else {
          const info = insertOpt.run(questionId, opt.text, opt.score, i);
          keptOptIds.add(info.lastInsertRowid);
        }
      });

      existingOptIds.forEach((id) => {
        if (!keptOptIds.has(id)) deleteOpt.run(id);
      });
    });

    // Any question that existed before but wasn't in the incoming list was deleted by the admin.
    existingQIds.forEach((id) => {
      if (!keptQIds.has(id)) deleteQ.run(id);
    });
  });
  tx();

  res.json({ ok: true });
});

app.get("/api/admin/submissions", requireAuth("admin"), (req, res) => {
  const { department, designation } = req.query;
  let rows;
  if (department && designation) {
    rows = db
      .prepare("SELECT * FROM submissions WHERE department = ? AND designation = ? ORDER BY id DESC")
      .all(department, designation);
  } else if (department) {
    rows = db.prepare("SELECT * FROM submissions WHERE department = ? ORDER BY id DESC").all(department);
  } else if (designation) {
    rows = db.prepare("SELECT * FROM submissions WHERE designation = ? ORDER BY id DESC").all(designation);
  } else {
    rows = db.prepare("SELECT * FROM submissions ORDER BY id DESC").all();
  }
  res.json(rows.map(formatSubmission));
});

app.get("/api/admin/staff-list", requireAuth("admin"), (req, res) => {
  const rows = db
    .prepare("SELECT username, name, department, designation FROM faculty ORDER BY name ASC")
    .all();
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`FPA API server listening on http://localhost:${PORT}`);
});
