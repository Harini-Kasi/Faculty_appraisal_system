import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "fpa_db";

let pool = null;

export async function getDbPool() {
  if (pool) return pool;

  // 1. Ensure the MySQL database exists
  try {
    const tempConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
    });
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await tempConnection.end();
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      console.error("\n========================================================");
      console.error("❌ ERROR: Could not connect to MySQL server at " + DB_HOST + ":" + DB_PORT);
      console.error("👉 Please make sure MySQL is started (e.g. start MySQL service or XAMPP MySQL).");
      console.error("👉 Update credentials in server/.env if needed (DB_USER, DB_PASSWORD).");
      console.error("========================================================\n");
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n========================================================");
      console.error("❌ ERROR: MySQL Access Denied for user '" + DB_USER + "'.");
      console.error("👉 Please set your correct MySQL password in server/.env (DB_PASSWORD=your_password).");
      console.error("========================================================\n");
    } else {
      console.error("Warning: Could not check/create database:", err.message);
    }
  }


  // 2. Create the connection pool
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

export async function initDb() {
  const db = await getDbPool();

  // Create tables
  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      username VARCHAR(50) PRIMARY KEY,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS faculty (
      username VARCHAR(50) PRIMARY KEY,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      department VARCHAR(50) NOT NULL,
      designation VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dept_code VARCHAR(50) UNIQUE NOT NULL,
      dept_name VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS designations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      desig_code VARCHAR(50) UNIQUE NOT NULL,
      desig_name VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      department VARCHAR(50) NOT NULL,
      designation VARCHAR(50) NOT NULL,
      section_code VARCHAR(50),
      section_label VARCHAR(255),
      subsection_code VARCHAR(50),
      subsection_label VARCHAR(255),
      group_code VARCHAR(50),
      group_label VARCHAR(255),
      text TEXT NOT NULL,
      weightage DOUBLE NOT NULL DEFAULT 1,
      order_index INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      text TEXT NOT NULL,
      score DOUBLE NOT NULL,
      order_index INT NOT NULL DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      staff_name VARCHAR(100) NOT NULL,
      department VARCHAR(50) NOT NULL,
      designation VARCHAR(50) NOT NULL,
      total_score DOUBLE NOT NULL,
      max_score DOUBLE NOT NULL,
      answers_json LONGTEXT NOT NULL,
      submitted_at VARCHAR(100) NOT NULL,
      area_of_specialization VARCHAR(255),
      teaching_experience DOUBLE,
      industry_experience DOUBLE,
      courses_taught_odd TEXT,
      courses_taught_even TEXT,
      ug_projects_guided DOUBLE,
      pg_projects_guided DOUBLE,
      tutorship VARCHAR(255),
      FOREIGN KEY (username) REFERENCES faculty(username) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // Seed Departments & Designations if empty
  const [depts] = await db.query("SELECT COUNT(*) AS count FROM departments");
  if (depts[0].count === 0) {
    const deptRows = [
      ["CSE", "Computer Science & Engineering"],
      ["ECE", "Electronics & Communication Engineering"],
      ["EEE", "Electrical & Electronics Engineering"],
      ["Mechanical", "Mechanical Engineering"],
      ["Civil", "Civil Engineering"],
      ["S&H", "Science & Humanities"],
    ];
    for (const [code, name] of deptRows) {
      await db.query("INSERT INTO departments (dept_code, dept_name) VALUES (?, ?)", [code, name]);
    }
  }

  const [desigs] = await db.query("SELECT COUNT(*) AS count FROM designations");
  if (desigs[0].count === 0) {
    const desigRows = [
      ["AP1", "Assistant Professor (Grade 1)"],
      ["AP2", "Assistant Professor (Grade 2)"],
      ["AP3", "Assistant Professor (Grade 3)"],
      ["APSG", "Assistant Professor (Senior Grade)"],
      ["Associate Professor", "Associate Professor"],
      ["Professor", "Professor"],
    ];
    for (const [code, name] of desigRows) {
      await db.query("INSERT INTO designations (desig_code, desig_name) VALUES (?, ?)", [code, name]);
    }
  }

  // Seed Admin if empty
  const [adminCount] = await db.query("SELECT COUNT(*) AS count FROM admins");
  if (adminCount[0].count === 0) {
    await db.query(
      "INSERT INTO admins (username, password_hash, name) VALUES (?, ?, ?)",
      ["admin", bcrypt.hashSync("admin123", 10), "Administrator"]
    );
  }

  // Seed Faculty if empty
  const [facultyCount] = await db.query("SELECT COUNT(*) AS count FROM faculty");
  if (facultyCount[0].count === 0) {
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
    for (const [username, pw, name, dept, desig] of sample) {
      await db.query(
        "INSERT INTO faculty (username, password_hash, name, department, designation) VALUES (?, ?, ?, ?, ?)",
        [username, bcrypt.hashSync(pw, 10), name, dept, desig]
      );
    }
  }

  // Seed Questions if empty
  const [qCount] = await db.query("SELECT COUNT(*) AS count FROM questions");
  if (qCount[0].count === 0) {
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

    const departmentsList = ["Engineering", "S&H"];
    const designationsList = ["AP1", "AP2", "AP3", "APSG", "Associate Professor", "Professor"];
    const seniorDesignations = ["APSG", "Associate Professor", "Professor"];

    for (const department of departmentsList) {
      for (const designation of designationsList) {
        let orderIndex = 0;
        for (const group of template) {
          for (const item of group.items) {
            const [qRes] = await db.query(
              `INSERT INTO questions
                (department, designation, section_code, section_label, subsection_code,
                 subsection_label, group_code, group_label, text, weightage, order_index)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                department,
                designation,
                group.section_code,
                group.section_label,
                group.subsection_code,
                group.subsection_label,
                group.group_code,
                group.group_label,
                item.text,
                item.weightage,
                orderIndex++,
              ]
            );
            const questionId = qRes.insertId;

            for (let i = 0; i < item.options.length; i++) {
              const opt = item.options[i];
              await db.query(
                "INSERT INTO options (question_id, text, score, order_index) VALUES (?, ?, ?, ?)",
                [questionId, opt.text, opt.score, i]
              );
            }
          }
        }

        if (seniorDesignations.includes(designation)) {
          const [qRes] = await db.query(
            `INSERT INTO questions
              (department, designation, section_code, section_label, subsection_code,
               subsection_label, group_code, group_label, text, weightage, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              department,
              designation,
              "D",
              "D. Leadership & Mentorship",
              "D.1",
              "D.1 Senior Faculty Responsibilities",
              "D1.1",
              "D1.1 Mentoring & Guidance",
              "Mentoring Junior Faculty / Research Scholars",
              2,
              orderIndex++,
            ]
          );
          const questionId = qRes.insertId;
          for (let i = 0; i < mentoringOptions.length; i++) {
            const opt = mentoringOptions[i];
            await db.query(
              "INSERT INTO options (question_id, text, score, order_index) VALUES (?, ?, ?, ?)",
              [questionId, opt.text, opt.score, i]
            );
          }
        } else {
          const [qRes] = await db.query(
            `INSERT INTO questions
              (department, designation, section_code, section_label, subsection_code,
               subsection_label, group_code, group_label, text, weightage, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              department,
              designation,
              "D",
              "D. Professional Growth",
              "D.1",
              "D.1 Early-Career Development",
              "D1.1",
              "D1.1 Certification & Upskilling",
              "Completion of Certification Programmes",
              1.5,
              orderIndex++,
            ]
          );
          const questionId = qRes.insertId;
          const certOpts = countOptions("certification");
          for (let i = 0; i < certOpts.length; i++) {
            const opt = certOpts[i];
            await db.query(
              "INSERT INTO options (question_id, text, score, order_index) VALUES (?, ?, ?, ?)",
              [questionId, opt.text, opt.score, i]
            );
          }
        }
      }
    }
  }
}
