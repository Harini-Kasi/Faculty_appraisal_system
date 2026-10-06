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
      console.error("👉 Please make sure MySQL is started (e.g. XAMPP MySQL or MySQL Service).");
      console.error("========================================================\n");
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n========================================================");
      console.error("❌ ERROR: MySQL Access Denied for user '" + DB_USER + "'.");
      console.error("========================================================\n");
    } else {
      console.error("Warning: Could not check/create database:", err.message);
    }
  }

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

  // 1. Admins Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      username VARCHAR(50) PRIMARY KEY,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB;
  `);

  // 2. Faculty Table (with role, email, phone)
  await db.query(`
    CREATE TABLE IF NOT EXISTS faculty (
      username VARCHAR(50) PRIMARY KEY,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      department VARCHAR(50) NOT NULL,
      designation VARCHAR(50) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'faculty',
      email VARCHAR(100) DEFAULT '',
      phone VARCHAR(20) DEFAULT ''
    ) ENGINE=InnoDB;
  `);

  // Add columns if migrating from older schema
  try {
    await db.query("ALTER TABLE faculty ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'faculty'");
  } catch {}
  try {
    await db.query("ALTER TABLE faculty ADD COLUMN email VARCHAR(100) DEFAULT ''");
  } catch {}
  try {
    await db.query("ALTER TABLE faculty ADD COLUMN phone VARCHAR(20) DEFAULT ''");
  } catch {}

  // 3. Departments Table with Division Maximums
  await db.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dept_code VARCHAR(50) UNIQUE NOT NULL,
      dept_name VARCHAR(100) NOT NULL,
      max_score DOUBLE NOT NULL DEFAULT 445
    ) ENGINE=InnoDB;
  `);

  try {
    await db.query("ALTER TABLE departments ADD COLUMN max_score DOUBLE NOT NULL DEFAULT 445");
  } catch {}

  // 4. Designations Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS designations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      desig_code VARCHAR(50) UNIQUE NOT NULL,
      desig_name VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB;
  `);

  // 5. Faculty Academic Details Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS faculty_academic_details (
      username VARCHAR(50) PRIMARY KEY,
      area_of_specialization VARCHAR(255) DEFAULT '',
      teaching_experience DOUBLE DEFAULT 0,
      industry_experience DOUBLE DEFAULT 0,
      courses_taught_odd TEXT,
      courses_taught_even TEXT,
      ug_projects_guided DOUBLE DEFAULT 0,
      pg_projects_guided DOUBLE DEFAULT 0,
      tutorship VARCHAR(255) DEFAULT '',
      achievements TEXT,
      updated_at VARCHAR(100),
      FOREIGN KEY (username) REFERENCES faculty(username) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 6. Questions Table
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

  // 7. Options Table
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

  // 8. Submissions Table (Self Appraisal Submissions & Drafts)
  await db.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      staff_name VARCHAR(100) NOT NULL,
      department VARCHAR(50) NOT NULL,
      designation VARCHAR(50) NOT NULL,
      total_score DOUBLE NOT NULL DEFAULT 0,
      max_score DOUBLE NOT NULL DEFAULT 0,
      api_score DOUBLE NOT NULL DEFAULT 0,
      answers_json LONGTEXT NOT NULL,
      submitted_at VARCHAR(100) NOT NULL,
      is_draft INT NOT NULL DEFAULT 0,
      is_submitted INT NOT NULL DEFAULT 1,
      is_verified INT NOT NULL DEFAULT 0,
      verified_by VARCHAR(100) DEFAULT '',
      verification_remarks TEXT,
      verified_at VARCHAR(100) DEFAULT '',
      area_of_specialization VARCHAR(255) DEFAULT '',
      teaching_experience DOUBLE DEFAULT 0,
      industry_experience DOUBLE DEFAULT 0,
      courses_taught_odd TEXT,
      courses_taught_even TEXT,
      ug_projects_guided DOUBLE DEFAULT 0,
      pg_projects_guided DOUBLE DEFAULT 0,
      tutorship VARCHAR(255) DEFAULT '',
      FOREIGN KEY (username) REFERENCES faculty(username) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  try {
    await db.query("ALTER TABLE submissions ADD COLUMN is_draft INT NOT NULL DEFAULT 0");
  } catch {}
  try {
    await db.query("ALTER TABLE submissions ADD COLUMN is_submitted INT NOT NULL DEFAULT 1");
  } catch {}
  try {
    await db.query("ALTER TABLE submissions ADD COLUMN is_verified INT NOT NULL DEFAULT 0");
  } catch {}
  try {
    await db.query("ALTER TABLE submissions ADD COLUMN verified_by VARCHAR(100) DEFAULT ''");
  } catch {}
  try {
    await db.query("ALTER TABLE submissions ADD COLUMN verification_remarks TEXT");
  } catch {}
  try {
    await db.query("ALTER TABLE submissions ADD COLUMN verified_at VARCHAR(100) DEFAULT ''");
  } catch {}
  try {
    await db.query("ALTER TABLE submissions ADD COLUMN api_score DOUBLE NOT NULL DEFAULT 0");
  } catch {}

  // 9. HOD Evaluations Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS hod_evaluations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      evaluator_username VARCHAR(50) NOT NULL,
      template_code VARCHAR(50) DEFAULT 'EVAL1',
      answers_json LONGTEXT,
      h1 TEXT, h2 TEXT, h3 TEXT, h4 TEXT, h5 TEXT, h6 TEXT,
      h7 TEXT, h8 TEXT, h9 TEXT, h10 TEXT, h11 TEXT, h12 TEXT, h13 TEXT,
      hpe DOUBLE DEFAULT 0,
      remarks TEXT,
      is_submitted INT NOT NULL DEFAULT 0,
      submitted_at VARCHAR(100),
      updated_at VARCHAR(100),
      FOREIGN KEY (username) REFERENCES faculty(username) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  try {
    await db.query("ALTER TABLE hod_evaluations ADD COLUMN template_code VARCHAR(50) DEFAULT 'EVAL1'");
  } catch {}
  try {
    await db.query("ALTER TABLE hod_evaluations ADD COLUMN answers_json LONGTEXT");
  } catch {}

  // 10. Principal Evaluations Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS principal_evaluations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      evaluator_username VARCHAR(50) NOT NULL,
      p1 TEXT, p2 TEXT, p3 TEXT, p4 TEXT, p5 TEXT,
      p6 TEXT, p7 TEXT, p8 TEXT, p9 TEXT, p10 TEXT,
      total_score DOUBLE DEFAULT 0,
      remarks TEXT,
      is_submitted INT NOT NULL DEFAULT 0,
      submitted_at VARCHAR(100),
      updated_at VARCHAR(100),
      FOREIGN KEY (username) REFERENCES faculty(username) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 11. Reviewer (RAdmin) Evaluations Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS reviewer_evaluations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      evaluator_username VARCHAR(50) NOT NULL,
      r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT, r5 TEXT,
      r6 TEXT, r7 TEXT, r8 TEXT, r9 TEXT, r10 TEXT,
      total_score DOUBLE DEFAULT 0,
      remarks TEXT,
      is_submitted INT NOT NULL DEFAULT 0,
      submitted_at VARCHAR(100),
      updated_at VARCHAR(100),
      FOREIGN KEY (username) REFERENCES faculty(username) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 12. Dean (VAdmin) Verifications Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS dean_verifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      verifier_username VARCHAR(50) NOT NULL,
      is_verified INT NOT NULL DEFAULT 1,
      remarks TEXT,
      verified_at VARCHAR(100),
      FOREIGN KEY (username) REFERENCES faculty(username) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 13. Department Appraisal Table (HOD Department Appraisal)
  await db.query(`
    CREATE TABLE IF NOT EXISTS department_appraisal (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      department VARCHAR(50) NOT NULL,
      faculty_info TEXT,
      form_data LONGTEXT,
      special_skills TEXT,
      sg1_total DOUBLE DEFAULT 0,
      sg2_total DOUBLE DEFAULT 0,
      sg3_total DOUBLE DEFAULT 0,
      sg4_total DOUBLE DEFAULT 0,
      sg5_total DOUBLE DEFAULT 0,
      sg6_total DOUBLE DEFAULT 0,
      total_score DOUBLE DEFAULT 0,
      normalized_score DOUBLE DEFAULT 0,
      department_max_score DOUBLE DEFAULT 445,
      is_draft INT DEFAULT 0,
      is_submitted INT DEFAULT 0,
      submitted_date VARCHAR(100),
      created_at VARCHAR(100),
      updated_at VARCHAR(100)
    ) ENGINE=InnoDB;
  `);

  // Seed Departments with division maximum scores
  const [depts] = await db.query("SELECT COUNT(*) AS count FROM departments");
  if (depts[0].count === 0) {
    const deptRows = [
      ["CSE", "Computer Science & Engineering", 445],
      ["IT", "Information Technology", 430],
      ["ECE", "Electronics & Communication Engineering", 450],
      ["EEE", "Electrical & Electronics Engineering", 445],
      ["Mechanical", "Mechanical Engineering", 430],
      ["Civil", "Civil Engineering", 425],
      ["AIDS", "Artificial Intelligence & Data Science", 415],
      ["S&H", "Science & Humanities", 270],
    ];
    for (const [code, name, maxScore] of deptRows) {
      await db.query("INSERT INTO departments (dept_code, dept_name, max_score) VALUES (?, ?, ?)", [code, name, maxScore]);
    }
  }

  // Seed Designations
  const [desigs] = await db.query("SELECT COUNT(*) AS count FROM designations");
  if (desigs[0].count === 0) {
    const desigRows = [
      ["AP1", "Assistant Professor (Grade 1)"],
      ["AP2", "Assistant Professor (Grade 2)"],
      ["AP3", "Assistant Professor (Grade 3)"],
      ["AP4", "Assistant Professor (Grade 4)"],
      ["Associate Professor", "Associate Professor"],
      ["Professor", "Professor"],
      ["SH1", "Science & Humanities Faculty (Grade 1)"],
      ["SH2", "Science & Humanities Faculty (Grade 2)"],
      ["SH3", "Science & Humanities Faculty (Grade 3)"],
      ["SH4", "Science & Humanities Faculty (Grade 4)"],
      ["SH5", "Science & Humanities Faculty (Grade 5)"],
    ];
    for (const [code, name] of desigRows) {
      await db.query("INSERT INTO designations (desig_code, desig_name) VALUES (?, ?)", [code, name]);
    }
  }

  // Seed Admins
  const [adminCount] = await db.query("SELECT COUNT(*) AS count FROM admins");
  if (adminCount[0].count === 0) {
    await db.query(
      "INSERT INTO admins (username, password_hash, name) VALUES (?, ?, ?)",
      ["admin", bcrypt.hashSync("admin123", 10), "System Administrator"]
    );
  }

  // Seed Role Accounts & Sample Faculty
  const [facultyCount] = await db.query("SELECT COUNT(*) AS count FROM faculty");
  if (facultyCount[0].count === 0) {
    const sample = [
      // HOD Accounts
      ["hod_cse", "hod123", "Dr. HOD CSE", "CSE", "Professor", "hod", "hod_cse@nec.edu.in"],
      ["hod_ece", "hod123", "Dr. HOD ECE", "ECE", "Professor", "hod", "hod_ece@nec.edu.in"],
      ["hod_sh", "hod123", "Dr. HOD S&H", "S&H", "Professor", "hod", "hod_sh@nec.edu.in"],
      // Principal Account
      ["principal", "principal123", "Dr. College Principal", "CSE", "Professor", "principal", "principal@nec.edu.in"],
      // Reviewer (RAdmin) Account
      ["radmin", "radmin123", "Dr. External Reviewer", "CSE", "Professor", "radmin", "radmin@nec.edu.in"],
      // Dean (VAdmin) Account
      ["vadmin", "vadmin123", "Dr. Dean Academics", "CSE", "Professor", "vadmin", "vadmin@nec.edu.in"],
      // Faculty Accounts across designations
      ["CSET031", "faculty123", "Dr. Ananya Rajan", "CSE", "Associate Professor", "faculty", "ananya@nec.edu.in"],
      ["CSET045", "faculty123", "Mr. Karthik Subramaniam", "CSE", "AP2", "faculty", "karthik@nec.edu.in"],
      ["CSET012", "faculty123", "Dr. Meera Nair", "CSE", "Professor", "faculty", "meera@nec.edu.in"],
      ["CSET099", "faculty123", "Mr. Ram Kumar", "CSE", "AP1", "faculty", "ram@nec.edu.in"],
      ["CSET100", "faculty123", "Ms. Anita Roy", "CSE", "AP3", "faculty", "anita@nec.edu.in"],
      ["CSET101", "faculty123", "Dr. Vivek Sharma", "CSE", "AP4", "faculty", "vivek@nec.edu.in"],
      ["ECET021", "faculty123", "Dr. Rajesh Kumar", "ECE", "Associate Professor", "faculty", "rajesh@nec.edu.in"],
      ["EEET015", "faculty123", "Ms. Sneha Verma", "EEE", "AP1", "faculty", "sneha@nec.edu.in"],
      ["MECH005", "faculty123", "Mr. Vikram Singh", "Mechanical", "AP3", "faculty", "vikram@nec.edu.in"],
      ["CIVIL003", "faculty123", "Dr. Suresh Patel", "Civil", "Professor", "faculty", "suresh@nec.edu.in"],
      ["SNH021", "faculty123", "Dr. Priya Venkatesh", "S&H", "SH5", "faculty", "priya@nec.edu.in"],
      ["SNH008", "faculty123", "Ms. Divya Iyer", "S&H", "SH1", "faculty", "divya@nec.edu.in"],
      ["SNH014", "faculty123", "Mr. Arjun Krishnan", "S&H", "SH3", "faculty", "arjun@nec.edu.in"],
    ];
    for (const [username, pw, name, dept, desig, role, email] of sample) {
      await db.query(
        "INSERT INTO faculty (username, password_hash, name, department, designation, role, email) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [username, bcrypt.hashSync(pw, 10), name, dept, desig, role, email || ""]
      );
    }
  }

  // Seed Questions if empty
  const [qCount] = await db.query("SELECT COUNT(*) AS count FROM questions");
  if (qCount[0].count === 0) {
    await seedQuestions(db);
  }

  // Ensure HOD Questions are imported
  const { importHodQuestions } = await import("../scripts/importHodQuestions.js");
  await importHodQuestions();
}

async function seedQuestions(db) {
  const commonOptions = {
    fdp: [
      { text: "No participation", score: 0 },
      { text: "1-2 days", score: 1 },
      { text: "3-4 days", score: 2 },
      { text: "5+ days / Funded", score: 3 },
    ],
    nptel: [
      { text: "Not Applicable / Not Completed", score: 0 },
      { text: "NPTEL course Completed / 60% to 80% score", score: 1 },
      { text: "Elite / >80% score in Non-proctored MOOC courses", score: 2 },
      { text: "Elite Silver", score: 3 },
      { text: "Elite Gold", score: 4 },
      { text: "5% Topper", score: 5 },
    ],
    visit: [
      { text: "Not Applicable / No visit", score: 0 },
      { text: "1 Visit", score: 1 },
      { text: "2 Visits", score: 2 },
      { text: "3+ Visits", score: 3 },
    ],
    publication: [
      { text: "Not Applicable / No publication", score: 0 },
      { text: "1 Paper presented / Published", score: 1 },
      { text: "2 Papers presented / Published", score: 2 },
      { text: "3+ Papers presented / Published", score: 3 },
      { text: "SCI / Scopus Indexed Publication", score: 4 },
      { text: "Q1 / Q2 High Impact Journal Publication", score: 5 },
    ],
    results: [
      { text: "Not Applicable / Below 75%", score: 0 },
      { text: "75-80%", score: 1 },
      { text: "80-85%", score: 2 },
      { text: "85-90%", score: 3 },
      { text: "90-95%", score: 4 },
      { text: "95-100%", score: 5 },
    ],
    videoContent: [
      { text: "Not Applicable", score: 0 },
      { text: "Created only one video content/Unit", score: 1 },
      { text: "25% of Video content for any one CO available in LMS & Social Media", score: 2 },
      { text: "50% of Video content for any one CO available in LMS & Social Media", score: 3 },
      { text: "100% of Video content for any one CO available in LMS & Social Media", score: 4 },
      { text: "100% of Video content for any two COs available in LMS & Social Media", score: 5 },
    ],
    socialMedia: [
      { text: "Not Applicable", score: 0 },
      { text: "Connections: 100-299 | Posts: 20-39 | Responses: 500-999", score: 1 },
      { text: "Connections: 300-599 | Posts: 40-59 | Responses: 1000-1499", score: 2 },
      { text: "Connections: 600-899 | Posts: 60-79 | Responses: 1500-1999", score: 3 },
      { text: "Connections: 900-1199 | Posts: 80-99 | Responses: 2000-2499", score: 4 },
      { text: "Connections: >1200 | Posts: >99 | Responses: >2499", score: 5 },
    ],
    courseFile: [
      { text: "Not Applicable", score: 0 },
      { text: "Deficiency in documentation", score: 1 },
      { text: "Some negative remarks", score: 2 },
      { text: "No negative remarks", score: 3 },
      { text: "Positive comments", score: 4 },
      { text: "Outstanding maintenance with timely submission & complete documentation", score: 5 },
    ],
    teachingMethod: [
      { text: "Not Applicable", score: 0 },
      { text: "Innovative practice is not properly done", score: 1 },
      { text: "Innovative Practice is documented and is available in LMS", score: 2 },
      { text: "Innovative Practice approved by HOD, Dean-Academic & Principal and posted in college website", score: 3 },
      { text: "Innovative practice is disseminated in social media after posted in college website", score: 4 },
      { text: "Innovative practice is published in Scopus/ SCI indexed journal", score: 5 },
    ],
    projectFunding: [
      { text: "Not Applicable", score: 0 },
      { text: "Participation in inter/ intra project/product exhibition", score: 1 },
      { text: "Won in inter/ intra project/product exhibition", score: 2 },
      { text: "Received fund for the worth of Rs.5000- Rs.20000", score: 3 },
      { text: "Received fund for the worth of Rs.20000- Rs.50000 | TRL 3", score: 4 },
      { text: "Received fund for the worth of >Rs.50000 | TRL 4-5", score: 5 },
    ],
  };

  const designationTemplates = {
    AP1: [
      { text: "Online courses / NPTEL / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "FDP/STTP participation", weightage: 1, options: commonOptions.fdp },
      { text: "Course file maintenance", weightage: 1, options: commonOptions.courseFile },
      { text: "Innovative teaching methods", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Student project publication", weightage: 1, options: commonOptions.publication },
      { text: "Student project/product funding", weightage: 1, options: commonOptions.projectFunding },
      { text: "Academic results", weightage: 1.5, options: commonOptions.results },
      { text: "Video content development", weightage: 1, options: commonOptions.videoContent },
      { text: "Continuous updating/self growth and institutional events / Social Media", weightage: 1, options: commonOptions.socialMedia },
    ],
    AP2: [
      { text: "Online courses / NPTEL / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "FDP/STTP participation", weightage: 1, options: commonOptions.fdp },
      { text: "Industry know-how / training", weightage: 1, options: commonOptions.visit },
      { text: "Ph.D registration status", weightage: 1, options: [{ text: "Not Registered", score: 0 }, { text: "Registered", score: 2 }, { text: "Course work completed", score: 3 }, { text: "Synopsis submitted", score: 5 }] },
      { text: "Course file maintenance", weightage: 1, options: commonOptions.courseFile },
      { text: "Innovative teaching methods", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Student project publication", weightage: 1, options: commonOptions.publication },
      { text: "Student project/product funding", weightage: 1, options: commonOptions.projectFunding },
      { text: "Academic results", weightage: 1.5, options: commonOptions.results },
      { text: "Video / e-content development", weightage: 1, options: commonOptions.videoContent },
      { text: "Social media / Self growth & institutional dissemination", weightage: 1, options: commonOptions.socialMedia },
    ],
    AP3: [
      { text: "Online courses / NPTEL / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "FDP/STTP participation", weightage: 1, options: commonOptions.fdp },
      { text: "Industrial know-how / visit", weightage: 1, options: commonOptions.visit },
      { text: "R&D / Reputed institution visits", weightage: 1, options: commonOptions.visit },
      { text: "Summer / Winter fellowship", weightage: 1, options: commonOptions.visit },
      { text: "Journal & Conference Publications", weightage: 1.5, options: commonOptions.publication },
      { text: "H-index / Citations", weightage: 1, options: [{ text: "0", score: 0 }, { text: "1-2", score: 2 }, { text: "3-5", score: 3 }, { text: ">5", score: 5 }] },
      { text: "Research projects / Grants", weightage: 1.5, options: [{ text: "No grant", score: 0 }, { text: "< 1 Lakh", score: 2 }, { text: "1 - 5 Lakhs", score: 4 }, { text: "> 5 Lakhs", score: 5 }] },
      { text: "Ph.D Supervisorship / Scholar Progress", weightage: 1, options: [{ text: "None", score: 0 }, { text: "Registered Scholar", score: 2 }, { text: "Guiding Scholars", score: 4 }, { text: "Ph.D Awarded", score: 5 }] },
      { text: "Course file maintenance", weightage: 1, options: commonOptions.courseFile },
      { text: "Innovative teaching methods", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Student project publication", weightage: 1, options: commonOptions.publication },
      { text: "Student project/product funding", weightage: 1, options: commonOptions.projectFunding },
      { text: "Academic results", weightage: 1.5, options: commonOptions.results },
      { text: "E-content development", weightage: 1, options: commonOptions.videoContent },
      { text: "Training programs / STTP organized", weightage: 1, options: commonOptions.visit },
      { text: "Department / Institution contribution", weightage: 1, options: commonOptions.courseFile },
      { text: "Social media / Self growth", weightage: 1, options: commonOptions.socialMedia },
    ],
    AP4: [
      { text: "Online courses / NPTEL / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "FDP/STTP participation", weightage: 1, options: commonOptions.fdp },
      { text: "R&D / Reputed institution visits", weightage: 1, options: commonOptions.visit },
      { text: "Summer / Winter fellowship", weightage: 1, options: commonOptions.visit },
      { text: "Industrial training", weightage: 1, options: commonOptions.visit },
      { text: "Publications (Scopus / SCI)", weightage: 1.5, options: commonOptions.publication },
      { text: "H-index / Citations", weightage: 1, options: [{ text: "0", score: 0 }, { text: "1-2", score: 2 }, { text: "3-5", score: 3 }, { text: ">5", score: 5 }] },
      { text: "Research / Project value", weightage: 1.5, options: [{ text: "No grant", score: 0 }, { text: "< 1 Lakh", score: 2 }, { text: "1 - 5 Lakhs", score: 4 }, { text: "> 5 Lakhs", score: 5 }] },
      { text: "Scholar progress / Supervisorship", weightage: 1, options: [{ text: "None", score: 0 }, { text: "Guiding 1 Scholar", score: 3 }, { text: "Guiding 2+ Scholars", score: 5 }] },
      { text: "Course file maintenance", weightage: 1, options: commonOptions.courseFile },
      { text: "Innovative teaching methods", weightage: 1, options: commonOptions.teachingMethod },
      { text: "E-content development", weightage: 1, options: commonOptions.videoContent },
      { text: "Student project publication", weightage: 1, options: commonOptions.publication },
      { text: "Student project/product funding", weightage: 1, options: commonOptions.projectFunding },
      { text: "Academic results", weightage: 1.5, options: commonOptions.results },
      { text: "Training / Workshop organized", weightage: 1, options: commonOptions.visit },
      { text: "Department / Institution contribution", weightage: 1, options: commonOptions.courseFile },
      { text: "Social media / Self growth", weightage: 1, options: commonOptions.socialMedia },
    ],
    "Associate Professor": [
      { text: "FDP / STTP participation", weightage: 1, options: commonOptions.fdp },
      { text: "Online courses / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "Industry visit / Training", weightage: 1, options: commonOptions.visit },
      { text: "R&D / Reputed institution visit", weightage: 1, options: commonOptions.visit },
      { text: "Publications in Scopus / SCI Journals", weightage: 2, options: commonOptions.publication },
      { text: "Research scholars supervision", weightage: 1.5, options: [{ text: "None", score: 0 }, { text: "1 Scholar", score: 2 }, { text: "2-3 Scholars", score: 4 }, { text: "PhD Produced", score: 5 }] },
      { text: "Revenue from granted patents", weightage: 1.5, options: [{ text: "No patent", score: 0 }, { text: "Patent filed", score: 2 }, { text: "Patent published", score: 3 }, { text: "Patent granted / Revenue generated", score: 5 }] },
      { text: "H-index / Citations", weightage: 1, options: [{ text: "0", score: 0 }, { text: "1-3", score: 2 }, { text: "4-7", score: 4 }, { text: ">7", score: 5 }] },
      { text: "Research project value / Grants", weightage: 2, options: [{ text: "No grant", score: 0 }, { text: "< 2 Lakhs", score: 2 }, { text: "2 - 10 Lakhs", score: 4 }, { text: "> 10 Lakhs", score: 5 }] },
      { text: "Consultancy works / Funding", weightage: 1.5, options: [{ text: "None", score: 0 }, { text: "< 50k", score: 2 }, { text: "50k - 2 Lakhs", score: 4 }, { text: "> 2 Lakhs", score: 5 }] },
      { text: "Video content development", weightage: 1, options: commonOptions.videoContent },
      { text: "Innovative TLP (Teaching-Learning Process)", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Student projects / product development", weightage: 1, options: commonOptions.projectFunding },
      { text: "Student publications / patent filing", weightage: 1, options: commonOptions.publication },
      { text: "Resource person in STTP / FDP / Conferences", weightage: 1, options: commonOptions.visit },
      { text: "Inter-institutional collaboration", weightage: 1, options: commonOptions.visit },
      { text: "Social media dissemination", weightage: 1, options: commonOptions.socialMedia },
      { text: "Department / Institution contribution", weightage: 1.5, options: commonOptions.courseFile },
      { text: "Special lab / centre / research facility establishment", weightage: 1.5, options: commonOptions.courseFile },
    ],
    Professor: [
      { text: "FDP / STTP participation", weightage: 1, options: commonOptions.fdp },
      { text: "Online courses / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "Industry visit / Training", weightage: 1, options: commonOptions.visit },
      { text: "R&D / Reputed institution visit", weightage: 1, options: commonOptions.visit },
      { text: "Publications in High Impact SCI/Scopus Journals", weightage: 2, options: commonOptions.publication },
      { text: "Research scholars supervision (PhD awarded)", weightage: 2, options: [{ text: "None", score: 0 }, { text: "1 PhD Awarded", score: 3 }, { text: "2+ PhDs Awarded", score: 5 }] },
      { text: "Patents / Commercialized technology revenue", weightage: 2, options: [{ text: "No patent", score: 0 }, { text: "Patent published", score: 2 }, { text: "Patent granted", score: 4 }, { text: "Commercialized / Revenue", score: 5 }] },
      { text: "H-index / Scopus Citations", weightage: 1.5, options: [{ text: "< 5", score: 1 }, { text: "5-9", score: 3 }, { text: "10+", score: 5 }] },
      { text: "Research projects / Major R&D Grants", weightage: 2, options: [{ text: "No grant", score: 0 }, { text: "< 5 Lakhs", score: 2 }, { text: "5 - 25 Lakhs", score: 4 }, { text: "> 25 Lakhs", score: 5 }] },
      { text: "Consultancy & Testing revenue", weightage: 1.5, options: [{ text: "None", score: 0 }, { text: "< 1 Lakh", score: 2 }, { text: "1 - 5 Lakhs", score: 4 }, { text: "> 5 Lakhs", score: 5 }] },
      { text: "Video content / Online course creation", weightage: 1, options: commonOptions.videoContent },
      { text: "Innovative TLP & Pedagogical initiatives", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Student projects & startup mentoring", weightage: 1, options: commonOptions.projectFunding },
      { text: "Resource person / Session chair / Keynote speaker", weightage: 1.5, options: commonOptions.visit },
      { text: "International & Inter-institutional collaboration", weightage: 1.5, options: commonOptions.visit },
      { text: "Awards / Honors / Fellowships", weightage: 1.5, options: [{ text: "None", score: 0 }, { text: "State Level", score: 3 }, { text: "National / International Level", score: 5 }] },
      { text: "Social media dissemination & institutional outreach", weightage: 1, options: commonOptions.socialMedia },
      { text: "Department / Institution leadership & contribution", weightage: 2, options: commonOptions.courseFile },
      { text: "Special lab / Centre of Excellence establishment", weightage: 2, options: commonOptions.courseFile },
    ],
    SH1: [
      { text: "Online courses / NPTEL / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "FDP / Workshop / Seminar / Conference", weightage: 1, options: commonOptions.fdp },
      { text: "Ph.D registration / progress", weightage: 1, options: [{ text: "Not Registered", score: 0 }, { text: "Registered", score: 3 }, { text: "Thesis Submitted", score: 5 }] },
      { text: "Course file maintenance", weightage: 1, options: commonOptions.courseFile },
      { text: "Innovative teaching", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Academic results", weightage: 1.5, options: commonOptions.results },
      { text: "E-content development", weightage: 1, options: commonOptions.videoContent },
      { text: "Department / Institution contribution", weightage: 1, options: commonOptions.courseFile },
      { text: "Social media / Self growth", weightage: 1, options: commonOptions.socialMedia },
    ],
    SH2: [
      { text: "Online courses / NPTEL / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "FDP / Workshop / Seminar / Conference", weightage: 1, options: commonOptions.fdp },
      { text: "Ph.D registration / progress", weightage: 1, options: [{ text: "Not Registered", score: 0 }, { text: "Registered", score: 3 }, { text: "Thesis Submitted", score: 5 }] },
      { text: "Course file maintenance", weightage: 1, options: commonOptions.courseFile },
      { text: "Innovative teaching", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Academic results", weightage: 1.5, options: commonOptions.results },
      { text: "E-content development", weightage: 1, options: commonOptions.videoContent },
      { text: "School outreach / training programs", weightage: 1, options: commonOptions.visit },
      { text: "Department / Institution contribution", weightage: 1, options: commonOptions.courseFile },
      { text: "Social media / Self growth", weightage: 1, options: commonOptions.socialMedia },
    ],
    SH3: [
      { text: "Online courses / NPTEL / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "FDP / Workshop / Seminar", weightage: 1, options: commonOptions.fdp },
      { text: "Publications (Scopus / Web of Science)", weightage: 1.5, options: commonOptions.publication },
      { text: "H-index / Citations", weightage: 1, options: [{ text: "0", score: 0 }, { text: "1-2", score: 2 }, { text: "3+", score: 5 }] },
      { text: "Research project value", weightage: 1, options: [{ text: "None", score: 0 }, { text: "< 50k", score: 2 }, { text: "> 50k", score: 5 }] },
      { text: "Scholar progress / Ph.D guidance", weightage: 1, options: [{ text: "None", score: 0 }, { text: "Guiding", score: 3 }, { text: "Degree Awarded", score: 5 }] },
      { text: "Course file maintenance", weightage: 1, options: commonOptions.courseFile },
      { text: "Innovative teaching", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Academic results", weightage: 1.5, options: commonOptions.results },
      { text: "E-content development", weightage: 1, options: commonOptions.videoContent },
      { text: "School training programs", weightage: 1, options: commonOptions.visit },
      { text: "Department / Institution contribution", weightage: 1, options: commonOptions.courseFile },
      { text: "Social media / Self growth", weightage: 1, options: commonOptions.socialMedia },
    ],
    SH4: [
      { text: "Online courses / NPTEL / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "FDP / Workshop / Seminar", weightage: 1, options: commonOptions.fdp },
      { text: "R&D / Reputed institution visit", weightage: 1, options: commonOptions.visit },
      { text: "Expert lecture / Session chair / Speaker", weightage: 1, options: commonOptions.visit },
      { text: "Publications in Scopus / SCI", weightage: 1.5, options: commonOptions.publication },
      { text: "H-index / Citations", weightage: 1, options: [{ text: "0", score: 0 }, { text: "1-3", score: 2 }, { text: "4+", score: 5 }] },
      { text: "Research project value", weightage: 1.5, options: [{ text: "None", score: 0 }, { text: "< 1 Lakh", score: 2 }, { text: "> 1 Lakh", score: 5 }] },
      { text: "Scholar progress", weightage: 1, options: [{ text: "None", score: 0 }, { text: "Guiding", score: 3 }, { text: "Awarded", score: 5 }] },
      { text: "Course file maintenance", weightage: 1, options: commonOptions.courseFile },
      { text: "Innovative teaching", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Academic results", weightage: 1.5, options: commonOptions.results },
      { text: "E-content development", weightage: 1, options: commonOptions.videoContent },
      { text: "Training programs organized", weightage: 1, options: commonOptions.visit },
      { text: "Department / Institution contribution", weightage: 1, options: commonOptions.courseFile },
      { text: "Social media / Self growth", weightage: 1, options: commonOptions.socialMedia },
    ],
    SH5: [
      { text: "FDP / STTP participation", weightage: 1, options: commonOptions.fdp },
      { text: "Online courses / NPTEL / MOOC", weightage: 1, options: commonOptions.nptel },
      { text: "R&D / Reputed institution visit", weightage: 1, options: commonOptions.visit },
      { text: "Publications (SCI / Scopus Indexed)", weightage: 2, options: commonOptions.publication },
      { text: "Research scholars supervision (PhD Produced)", weightage: 1.5, options: [{ text: "None", score: 0 }, { text: "Guiding", score: 3 }, { text: "PhD Produced", score: 5 }] },
      { text: "H-index / Citations", weightage: 1.5, options: [{ text: "< 3", score: 1 }, { text: "3-5", score: 3 }, { text: "6+", score: 5 }] },
      { text: "Research project value / Grants", weightage: 2, options: [{ text: "No grant", score: 0 }, { text: "< 2 Lakhs", score: 2 }, { text: "> 2 Lakhs", score: 5 }] },
      { text: "E-content development", weightage: 1, options: commonOptions.videoContent },
      { text: "Innovative TLP", weightage: 1, options: commonOptions.teachingMethod },
      { text: "Resource person in STTP / FDP", weightage: 1, options: commonOptions.visit },
      { text: "Inter-institutional collaboration", weightage: 1, options: commonOptions.visit },
      { text: "Social media dissemination", weightage: 1, options: commonOptions.socialMedia },
      { text: "Department / Institution contribution", weightage: 1.5, options: commonOptions.courseFile },
      { text: "Training programs organized", weightage: 1.5, options: commonOptions.visit },
    ],
  };

  const departments = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "IT", "AIDS", "S&H"];

  for (const [desig, items] of Object.entries(designationTemplates)) {
    const deptsForDesig = desig.startsWith("SH") ? ["S&H"] : departments;

    for (const department of deptsForDesig) {
      let orderIdx = 0;
      for (const item of items) {
        const [qRes] = await db.query(
          `INSERT INTO questions
            (department, designation, section_code, section_label, subsection_code,
             subsection_label, group_code, group_label, text, weightage, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            department,
            desig,
            "A",
            "A. Self Appraisal",
            "A.1",
            "A.1 Performance Criteria",
            "A1.1",
            "A1.1 Key Performance Indicators",
            item.text,
            item.weightage,
            orderIdx++,
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
  }
}
