import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.sqlite");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* ============================================================
   Schema
   ------------------------------------------------------------
   admins        - system administrators (Question Builder / review)
   faculty       - one row per faculty member (the "single login"
                   table); department & designation live here and
                   are NEVER supplied by the client at login time
   questions     - evaluation criteria, scoped to a
                   department + designation, carrying the
                   hierarchy (section / subsection / group) and
                   the weightage used for scoring
   options       - the rating options for a question, each with
                   its own score; weightage stays server-side and
                   is stripped before anything is sent to a
                   faculty client
   submissions   - one row per submitted appraisal, plus the
                   line-item answers as JSON (computed server-side)
   ============================================================ */

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  username      TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faculty (
  username      TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  department    TEXT NOT NULL,
  designation   TEXT NOT NULL CHECK (designation IN (
                  'AP1', 'AP2', 'AP3', 'APSG', 'Associate Professor', 'Professor'
                ))
);

CREATE TABLE IF NOT EXISTS questions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  department       TEXT NOT NULL,
  designation      TEXT NOT NULL,
  section_code     TEXT,
  section_label    TEXT,
  subsection_code  TEXT,
  subsection_label TEXT,
  group_code       TEXT,
  group_label      TEXT,
  text             TEXT NOT NULL,
  weightage        REAL NOT NULL DEFAULT 1,
  order_index      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS options (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  score       REAL NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS submissions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  username     TEXT NOT NULL REFERENCES faculty(username),
  staff_name   TEXT NOT NULL,
  department   TEXT NOT NULL,
  designation  TEXT NOT NULL,
  total_score  REAL NOT NULL,
  max_score    REAL NOT NULL,
  answers_json TEXT NOT NULL,
  submitted_at TEXT NOT NULL
);
`);

/* ---------------- Migration: faculty table & columns ---------------- */

function ensureColumn(table, column, ddlType) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = cols.some((c) => c.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddlType}`);
  }
}

const FACULTY_DETAIL_COLUMNS = [
  ["area_of_specialization", "TEXT"],
  ["teaching_experience", "REAL"],
  ["industry_experience", "REAL"],
  ["courses_taught_odd", "TEXT"],
  ["courses_taught_even", "TEXT"],
  ["ug_projects_guided", "REAL"],
  ["pg_projects_guided", "REAL"],
  ["tutorship", "TEXT"],
];

for (const [column, ddlType] of FACULTY_DETAIL_COLUMNS) {
  ensureColumn("submissions", column, ddlType);
}

function migrateFacultyTableAndData() {
  const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='faculty'").get()?.sql || "";
  if (tableSql.includes("CHECK (department IN ('Engineering'")) {
    db.exec(`
      PRAGMA foreign_keys=OFF;
      BEGIN TRANSACTION;
      CREATE TABLE faculty_new (
        username      TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        name          TEXT NOT NULL,
        department    TEXT NOT NULL,
        designation   TEXT NOT NULL CHECK (designation IN (
                        'AP1', 'AP2', 'AP3', 'APSG', 'Associate Professor', 'Professor'
                      ))
      );
      INSERT INTO faculty_new SELECT username, password_hash, name, department, designation FROM faculty;
      DROP TABLE faculty;
      ALTER TABLE faculty_new RENAME TO faculty;
      COMMIT;
      PRAGMA foreign_keys=ON;
    `);
  }

  // Migrate any legacy 'Engineering' departments to their actual departments
  db.prepare("UPDATE faculty SET department = 'CSE' WHERE username LIKE 'CSET%' OR username LIKE 'CSE%'").run();
  db.prepare("UPDATE faculty SET department = 'ECE' WHERE username LIKE 'ECET%' OR username LIKE 'ECE%'").run();
  db.prepare("UPDATE faculty SET department = 'EEE' WHERE username LIKE 'EEET%' OR username LIKE 'EEE%'").run();
  db.prepare("UPDATE faculty SET department = 'Mechanical' WHERE username LIKE 'MECH%'").run();
  db.prepare("UPDATE faculty SET department = 'Civil' WHERE username LIKE 'CIVIL%'").run();
  db.prepare("UPDATE faculty SET department = 'S&H' WHERE username LIKE 'SNH%' OR username LIKE 'SH%'").run();
  db.prepare("UPDATE faculty SET department = 'CSE' WHERE department = 'Engineering'").run();

  // Sync submission departments with faculty departments
  db.exec(`
    UPDATE submissions 
    SET department = (SELECT department FROM faculty WHERE faculty.username = submissions.username)
    WHERE EXISTS (SELECT 1 FROM faculty WHERE faculty.username = submissions.username AND faculty.department != submissions.department);
  `);
}

migrateFacultyTableAndData();

/* ---------------- Seed (only runs once, on an empty DB) ---------------- */

function seedIfEmpty() {
  const facultyCount = db.prepare("SELECT COUNT(*) AS c FROM faculty").get().c;
  const adminCount = db.prepare("SELECT COUNT(*) AS c FROM admins").get().c;
  const questionCount = db.prepare("SELECT COUNT(*) AS c FROM questions").get().c;

  if (adminCount === 0) {
    db.prepare(
      "INSERT INTO admins (username, password_hash, name) VALUES (?, ?, ?)"
    ).run("admin", bcrypt.hashSync("admin123", 10), "Administrator");
  }

  if (facultyCount === 0) {
    const insertFaculty = db.prepare(
      "INSERT INTO faculty (username, password_hash, name, department, designation) VALUES (?, ?, ?, ?, ?)"
    );
    const sample = [
      ["CSET031", "faculty123", "Dr. Ananya Rajan", "CSE", "Associate Professor"],
      ["CSET045", "faculty123", "Mr. Karthik Subramaniam", "CSE", "AP2"],
      ["CSET012", "faculty123", "Dr. Meera Nair", "CSE", "Professor"],
      ["ECET021", "faculty123", "Dr. Rajesh Kumar", "ECE", "Associate Professor"],
      ["EEET015", "faculty123", "Ms. Sneha Verma", "EEE", "AP1"],
      ["MECH005", "faculty123", "Mr. Vikram Singh", "Mechanical", "AP3"],
      ["CIVIL003", "faculty123", "Dr. Suresh Patel", "Civil", "Professor"],
      ["SNH021", "faculty123", "Dr. Priya Venkatesh", "S&H", "Professor"],
      ["SNH008", "faculty123", "Ms. Divya Iyer", "S&H", "AP1"],
      ["SNH014", "faculty123", "Mr. Arjun Krishnan", "S&H", "APSG"],
    ];
    const tx = db.transaction((rows) => {
      for (const [username, pw, name, dept, desig] of rows) {
        insertFaculty.run(username, bcrypt.hashSync(pw, 10), name, dept, desig);
      }
    });
    tx(sample);
  }

  if (questionCount === 0) {
    const insertQ = db.prepare(`
      INSERT INTO questions
        (department, designation, section_code, section_label, subsection_code,
         subsection_label, group_code, group_label, text, weightage, order_index)
      VALUES (@department, @designation, @section_code, @section_label, @subsection_code,
              @subsection_label, @group_code, @group_label, @text, @weightage, @order_index)
    `);
    const insertOpt = db.prepare(
      "INSERT INTO options (question_id, text, score, order_index) VALUES (?, ?, ?, ?)"
    );

    // Each item below carries its OWN option set (fix for the old bug where
    // every question reused the same FDP-style options). Different question
    // types get option scales that actually make sense for them.
    const fdpOptions = [
      { text: "No participation", score: 0 },
      { text: "1-2 days", score: 1 },
      { text: "3-4 days", score: 2 },
      { text: "5+ days", score: 3 },
    ];
    const countOptions = (noun) => [
      { text: `No ${noun}`, score: 0 },
      { text: `1 ${noun}`, score: 1 },
      { text: `2 ${noun}`, score: 2 },
      { text: `3+ ${noun}`, score: 3 },
    ];
    const visitOptions = [
      { text: "No visit", score: 0 },
      { text: "1 visit", score: 1 },
      { text: "2 visits", score: 2 },
      { text: "3+ visits", score: 3 },
    ];
    const publicationOptions = [
      { text: "No publication", score: 0 },
      { text: "1 publication", score: 1 },
      { text: "2 publications", score: 2 },
      { text: "3+ publications", score: 3 },
    ];
    const feedbackOptions = [
      { text: "Below 50%", score: 0 },
      { text: "50% - 65%", score: 1 },
      { text: "66% - 80%", score: 2 },
      { text: "Above 80%", score: 3 },
    ];
    const ictOptions = [
      { text: "Never used", score: 0 },
      { text: "Used occasionally", score: 1 },
      { text: "Used regularly", score: 2 },
      { text: "Used extensively with innovative methods", score: 3 },
    ];
    const syllabusOptions = [
      { text: "Not completed", score: 0 },
      { text: "Completed with delay (more than 2 weeks)", score: 1 },
      { text: "Completed with minor delay (within 2 weeks)", score: 2 },
      { text: "Completed on schedule", score: 3 },
    ];
    const committeeOptions = [
      { text: "No membership", score: 0 },
      { text: "Member of 1 committee", score: 1 },
      { text: "Member of 2 committees", score: 2 },
      { text: "Member of 3+ committees / Chairperson", score: 3 },
    ];
    const mentoringOptions = [
      { text: "No mentoring", score: 0 },
      { text: "Mentoring 1 person", score: 1 },
      { text: "Mentoring 2-3 persons", score: 2 },
      { text: "Mentoring 4+ persons", score: 3 },
    ];

    // Same hierarchical structure applied to both departments, every
    // designation, so every sample faculty account has a real form to fill.
    const template = [
      {
        section_code: "A",
        section_label: "A. Self Appraisal",
        subsection_code: "A.1",
        subsection_label: "A.1 Self Development",
        group_code: "A1.1",
        group_label: "A1.1 Knowledge / Skill Development",
        items: [
          { text: "Attending FDP programme", weightage: 2, options: fdpOptions },
          { text: "Online Courses", weightage: 1.5, options: countOptions("course completed") },
          { text: "Industry Visit", weightage: 1, options: visitOptions },
          { text: "Visit to R&D Organization / Reputed Institution", weightage: 1, options: visitOptions },
        ],
      },
      {
        section_code: "A",
        section_label: "A. Self Appraisal",
        subsection_code: "A.2",
        subsection_label: "A.2 Research & Publication",
        group_code: "A2.1",
        group_label: "A2.1 Publications",
        items: [
          { text: "Journal Publications (Scopus/SCI indexed)", weightage: 3, options: publicationOptions },
          { text: "Conference Papers Presented", weightage: 2, options: countOptions("paper presented") },
          { text: "Book Chapters / Books Authored", weightage: 2, options: countOptions("chapter/book authored") },
        ],
      },
      {
        section_code: "B",
        section_label: "B. Teaching & Learning",
        subsection_code: "B.1",
        subsection_label: "B.1 Course Delivery",
        group_code: "B1.1",
        group_label: "B1.1 Classroom Effectiveness",
        items: [
          { text: "Student Feedback Score", weightage: 3, options: feedbackOptions },
          { text: "Use of ICT Tools in Teaching", weightage: 1.5, options: ictOptions },
          { text: "Timely Completion of Syllabus", weightage: 2, options: syllabusOptions },
        ],
      },
      {
        section_code: "C",
        section_label: "C. Institutional Contribution",
        subsection_code: "C.1",
        subsection_label: "C.1 Administrative & Extension Activities",
        group_code: "C1.1",
        group_label: "C1.1 Committee & Event Participation",
        items: [
          { text: "Membership in Institutional Committees", weightage: 1, options: committeeOptions },
          { text: "Organizing Departmental Events", weightage: 1.5, options: countOptions("event organized") },
        ],
      },
    ];

    const departments = ["Engineering", "S&H"];
    const designations = ["AP1", "AP2", "AP3", "APSG", "Associate Professor", "Professor"];
    const seniorDesignations = ["APSG", "Associate Professor", "Professor"];

    const tx = db.transaction(() => {
      let orderIndex = 0;
      for (const department of departments) {
        for (const designation of designations) {
          orderIndex = 0;
          for (const group of template) {
            for (const item of group.items) {
              const info = insertQ.run({
                department,
                designation,
                section_code: group.section_code,
                section_label: group.section_label,
                subsection_code: group.subsection_code,
                subsection_label: group.subsection_label,
                group_code: group.group_code,
                group_label: group.group_label,
                text: item.text,
                weightage: item.weightage,
                order_index: orderIndex++,
              });
              item.options.forEach((opt, i) => {
                insertOpt.run(info.lastInsertRowid, opt.text, opt.score, i);
              });
            }
          }

          // Designation-tiered criterion so senior faculty (APSG and above)
          // get a mentorship/leadership question the junior tiers don't —
          // this makes it easy to verify that different Department +
          // Designation combinations really do produce different question sets.
          if (seniorDesignations.includes(designation)) {
            const info = insertQ.run({
              department,
              designation,
              section_code: "D",
              section_label: "D. Leadership & Mentorship",
              subsection_code: "D.1",
              subsection_label: "D.1 Senior Faculty Responsibilities",
              group_code: "D1.1",
              group_label: "D1.1 Mentoring & Guidance",
              text: "Mentoring Junior Faculty / Research Scholars",
              weightage: 2,
              order_index: orderIndex++,
            });
            mentoringOptions.forEach((opt, i) => {
              insertOpt.run(info.lastInsertRowid, opt.text, opt.score, i);
            });
          } else {
            const info = insertQ.run({
              department,
              designation,
              section_code: "D",
              section_label: "D. Professional Growth",
              subsection_code: "D.1",
              subsection_label: "D.1 Early-Career Development",
              group_code: "D1.1",
              group_label: "D1.1 Certification & Upskilling",
              text: "Completion of Certification Programmes",
              weightage: 1.5,
              order_index: orderIndex++,
            });
            countOptions("certification").forEach((opt, i) => {
              insertOpt.run(info.lastInsertRowid, opt.text, opt.score, i);
            });
          }
        }
      }
    });
    tx();
  }
}

seedIfEmpty();
