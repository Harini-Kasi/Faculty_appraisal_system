import nodemailer from "nodemailer";
import ExcelJS from "exceljs";
import { Parser as Json2CsvParser } from "json2csv";
import { getDbPool } from "../config/db.js";
import { formatSubmission } from "../models/SelfAppraisal.js";

export function calculateDepartmentAppraisalTotals(formData, deptMaxScore = 445) {
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

  return { sg1, sg2, sg3, sg4, sg5, sg6, rawTotal, normalizedScore };
}

export function generateFacultyReportCsv(rows) {
  const parser = new Json2CsvParser({
    fields: ["username", "name", "department", "designation", "total_score", "max_score", "is_submitted", "is_verified"],
  });
  return parser.parse(rows);
}

export async function generateFacultyReportExcel(rows, res) {
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
  res.end();
}

export async function sendAppraisalEmail(recipientEmail, staffId) {
  const db = await getDbPool();
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials not configured in environment (SMTP_USER, SMTP_PASS).");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const [fac] = await db.query("SELECT * FROM faculty WHERE username = ?", [staffId]);
  const [sub] = await db.query(
    "SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
    [staffId]
  );

  const info = await transporter.sendMail({
    from: `"Faculty Appraisal System" <${smtpUser}>`,
    to: recipientEmail,
    subject: `Appraisal Report for ${fac[0]?.name || staffId}`,
    text: `Faculty Performance Appraisal Report Summary:\nStaff ID: ${staffId}\nName: ${fac[0]?.name}\nDepartment: ${fac[0]?.department}\nDesignation: ${fac[0]?.designation}\nTotal Score: ${sub[0]?.total_score || 0} / ${sub[0]?.max_score || 0}\nSubmission Date: ${sub[0]?.submitted_at || "N/A"}\n`,
  });

  return info;
}

export async function computeDepartmentAnalytics(departmentId) {
  const db = await getDbPool();
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

  return {
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
  };
}

export async function computeDepartmentFacultyAnalytics(departmentId) {
  const db = await getDbPool();
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

  return facultyRows.map((f) => {
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
}

export async function computeDepartmentDesignationAnalytics(departmentId) {
  const db = await getDbPool();
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

  return Array.from(desigMap.values()).map((d) => ({
    designation: d.designation,
    count: d.count,
    averagePercentage: Math.round(d.sumPct / d.count),
  }));
}

export async function computeFacultyAnalytics(staffId) {
  const db = await getDbPool();
  const [facultyRows] = await db.query(
    "SELECT username, name, department, designation FROM faculty WHERE username = ?",
    [staffId]
  );

  if (facultyRows.length === 0) return null;
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

  return {
    faculty,
    submission,
    overallScore: overallScorePct,
    categoryScores,
    strengths,
    areasForImprovement,
    departmentAverage: deptAvgPct,
  };
}
