import { getDbPool } from "../config/db.js";
import { loadQuestionsFor } from "./Question.js";

export function formatSubmission(row) {
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

export async function saveDraftSubmission(username, answers, details) {
  const db = await getDbPool();
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

export async function processSubmission(username, answers, details) {
  const db = await getDbPool();
  const [faculties] = await db.query("SELECT * FROM faculty WHERE username = ?", [username]);
  if (faculties.length === 0) throw new Error("Faculty record not found.");
  const faculty = faculties[0];

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

export async function getDraftSubmission(username) {
  const db = await getDbPool();
  const [rows] = await db.query(
    "SELECT * FROM submissions WHERE username = ? AND is_draft = 1 ORDER BY id DESC LIMIT 1",
    [username]
  );
  if (rows.length === 0) return null;
  return formatSubmission(rows[0]);
}

export async function getSubmissionsByUsername(username) {
  const db = await getDbPool();
  const [rows] = await db.query(
    "SELECT * FROM submissions WHERE username = ? ORDER BY id DESC",
    [username]
  );
  return rows.map(formatSubmission);
}

export async function getLatestSubmission(staffId) {
  const db = await getDbPool();
  const [rows] = await db.query(
    "SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
    [staffId]
  );
  if (rows.length === 0) {
    const [drafts] = await db.query(
      "SELECT * FROM submissions WHERE username = ? AND is_draft = 1 ORDER BY id DESC LIMIT 1",
      [staffId]
    );
    if (drafts.length === 0) return null;
    return formatSubmission(drafts[0]);
  }
  return formatSubmission(rows[0]);
}

export async function getCombinedAppraisalDetails(staffId) {
  const db = await getDbPool();
  const [faculties] = await db.query("SELECT username, name, department, designation, role, email, phone FROM faculty WHERE username = ?", [staffId]);
  if (faculties.length === 0) return null;

  const faculty = faculties[0];

  const [academic] = await db.query("SELECT * FROM faculty_academic_details WHERE username = ?", [staffId]);
  const [submissions] = await db.query("SELECT * FROM submissions WHERE username = ? ORDER BY id DESC LIMIT 1", [staffId]);
  const [hodEval] = await db.query("SELECT * FROM hod_evaluations WHERE username = ?", [staffId]);
  const [principalEval] = await db.query("SELECT * FROM principal_evaluations WHERE username = ?", [staffId]);
  const [reviewerEval] = await db.query("SELECT * FROM reviewer_evaluations WHERE username = ?", [staffId]);
  const [deanVerify] = await db.query("SELECT * FROM dean_verifications WHERE username = ?", [staffId]);

  return {
    faculty,
    academicDetails: academic[0] || null,
    selfAppraisal: submissions.length > 0 ? formatSubmission(submissions[0]) : null,
    hodEvaluation: hodEval[0] || null,
    principalEvaluation: principalEval[0] || null,
    reviewerEvaluation: reviewerEval[0] || null,
    deanVerification: deanVerify[0] || null,
  };
}

export async function getHodFacultyList(deptFilter, sessionUsername, sessionRole) {
  const db = await getDbPool();
  let department = deptFilter;
  if (!department && sessionRole === "hod") {
    const [fac] = await db.query("SELECT department FROM faculty WHERE username = ?", [sessionUsername]);
    department = fac[0]?.department;
  }
  const [rows] = await db.query(
    `SELECT f.username, f.name, f.department, f.designation,
            COALESCE(s.is_submitted, 0) AS self_submitted, COALESCE(s.total_score, 0) AS self_score,
            COALESCE(h.is_submitted, 0) AS hod_submitted, COALESCE(h.hpe, 0) AS hod_score
     FROM faculty f
     LEFT JOIN (SELECT username, is_submitted, total_score FROM submissions WHERE is_submitted = 1) s ON f.username = s.username
     LEFT JOIN hod_evaluations h ON f.username = h.username
     WHERE (? IS NULL OR f.department = ?) AND f.role = 'faculty'
     ORDER BY f.name ASC`,
    [department || null, department || null]
  );
  return rows;
}

export async function saveHodEvaluation(body, evaluatorUsername) {
  const db = await getDbPool();
  const { username, templateCode, answersJson, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, hpe, remarks, isSubmitted } = body || {};
  if (!username) throw new Error("Faculty username is required.");

  const now = new Date().toISOString();
  const [existing] = await db.query("SELECT id FROM hod_evaluations WHERE username = ?", [username]);

  const payload = [
    evaluatorUsername,
    templateCode || "EVAL1",
    answersJson || "[]",
    h1 || "", h2 || "", h3 || "", h4 || "", h5 || "", h6 || "",
    h7 || "", h8 || "", h9 || "", h10 || "", h11 || "", h12 || "", h13 || "",
    Number(hpe || 0), remarks || "", isSubmitted ? 1 : 0, now, now, username
  ];

  if (existing.length > 0) {
    await db.query(
      `UPDATE hod_evaluations SET
         evaluator_username=?, template_code=?, answers_json=?, h1=?, h2=?, h3=?, h4=?, h5=?, h6=?, h7=?, h8=?, h9=?, h10=?, h11=?, h12=?, h13=?,
         hpe=?, remarks=?, is_submitted=?, submitted_at=?, updated_at=?
       WHERE username=?`,
      payload
    );
  } else {
    await db.query(
      `INSERT INTO hod_evaluations
         (evaluator_username, template_code, answers_json, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, hpe, remarks, is_submitted, submitted_at, updated_at, username)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payload
    );
  }
  return username;
}

export async function getHodEvaluation(username) {
  const db = await getDbPool();
  const [rows] = await db.query("SELECT * FROM hod_evaluations WHERE username = ?", [username]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getPrincipalFacultyList(dept) {
  const db = await getDbPool();
  const [rows] = await db.query(
    `SELECT f.username, f.name, f.department, f.designation,
            COALESCE(s.is_submitted, 0) AS self_submitted, COALESCE(s.total_score, 0) AS self_score,
            COALESCE(p.is_submitted, 0) AS principal_submitted, COALESCE(p.total_score, 0) AS principal_score
     FROM faculty f
     LEFT JOIN (SELECT username, is_submitted, total_score FROM submissions WHERE is_submitted = 1) s ON f.username = s.username
     LEFT JOIN principal_evaluations p ON f.username = p.username
     WHERE f.department = ? AND f.role = 'faculty'
     ORDER BY f.name ASC`,
    [dept]
  );
  return rows;
}

export async function savePrincipalEvaluation(body, evaluatorUsername) {
  const db = await getDbPool();
  const { username, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, totalScore, remarks, isSubmitted } = body || {};
  if (!username) throw new Error("Faculty username is required.");

  const now = new Date().toISOString();
  const [existing] = await db.query("SELECT id FROM principal_evaluations WHERE username = ?", [username]);

  const payload = [
    evaluatorUsername,
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
  return username;
}

export async function getPrincipalEvaluation(username) {
  const db = await getDbPool();
  const [rows] = await db.query("SELECT * FROM principal_evaluations WHERE username = ?", [username]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getReviewerFacultyList(dept) {
  const db = await getDbPool();
  const [rows] = await db.query(
    `SELECT f.username, f.name, f.department, f.designation,
            COALESCE(s.is_submitted, 0) AS self_submitted, COALESCE(s.total_score, 0) AS self_score,
            COALESCE(r.is_submitted, 0) AS reviewer_submitted, COALESCE(r.total_score, 0) AS reviewer_score
     FROM faculty f
     LEFT JOIN (SELECT username, is_submitted, total_score FROM submissions WHERE is_submitted = 1) s ON f.username = s.username
     LEFT JOIN reviewer_evaluations r ON f.username = r.username
     WHERE f.department = ? AND f.role = 'faculty'
     ORDER BY f.name ASC`,
    [dept]
  );
  return rows;
}

export async function saveReviewerEvaluation(body, evaluatorUsername) {
  const db = await getDbPool();
  const { username, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, totalScore, remarks, isSubmitted } = body || {};
  if (!username) throw new Error("Faculty username is required.");

  const now = new Date().toISOString();
  const [existing] = await db.query("SELECT id FROM reviewer_evaluations WHERE username = ?", [username]);

  const payload = [
    evaluatorUsername,
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
  return username;
}

export async function getReviewerEvaluation(username) {
  const db = await getDbPool();
  const [rows] = await db.query("SELECT * FROM reviewer_evaluations WHERE username = ?", [username]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getDeanFacultyList(dept) {
  const db = await getDbPool();
  let query = `
    SELECT f.username, f.name, f.department, f.designation, f.role,
           s.id AS submission_id,
           COALESCE(s.is_submitted, 0) AS self_submitted, COALESCE(s.total_score, 0) AS self_score, COALESCE(s.max_score, 0) AS max_score,
           IF(s.is_verified = 1, 'VERIFIED', 'NOT SUBMITTED') AS verification_status,
           COALESCE(s.is_verified, 0) AS is_verified, s.verified_by, s.verified_at, s.verification_remarks
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
  return rows;
}

export async function loadSubmissionQuestions(username, department, designation) {
  const db = await getDbPool();
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

  result.sort((a, b) => {
    if (a.sectionCode !== b.sectionCode) return (a.sectionCode || "").localeCompare(b.sectionCode || "");
    if (a.subsectionCode !== b.subsectionCode) return (a.subsectionCode || "").localeCompare(b.subsectionCode || "");
    if (a.groupCode !== b.groupCode) return (a.groupCode || "").localeCompare(b.groupCode || "");
    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });

  return result;
}

export async function getVadminAppraisalDetails(username) {
  const db = await getDbPool();
  const [faculties] = await db.query(
    "SELECT username, name, department, designation, role, email, phone FROM faculty WHERE username = ?",
    [username]
  );
  if (faculties.length === 0) return null;
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
  const questions = await loadSubmissionQuestions(username, faculty.department, faculty.designation);

  return {
    faculty,
    academicDetails,
    submission,
    questions,
    isVerified: submission ? Boolean(submission.isVerified) : false,
    verificationStatus: submission && submission.isVerified ? "VERIFIED" : "PENDING",
    verifiedBy: submission?.verifiedBy || "",
    verifiedAt: submission?.verifiedAt || "",
    verificationRemarks: submission?.verificationRemarks || "",
  };
}

export async function saveVadminAppraisalResponses(username, answers) {
  const db = await getDbPool();
  const [subRows] = await db.query(
    "SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
    [username]
  );
  if (subRows.length === 0) {
    const err = new Error("No submitted appraisal found for this faculty member.");
    err.status = 404;
    throw err;
  }
  const submission = subRows[0];

  if (submission.is_verified === 1) {
    const err = new Error("Cannot modify an appraisal that has already been verified.");
    err.status = 403;
    throw err;
  }

  const [faculties] = await db.query("SELECT department, designation FROM faculty WHERE username = ?", [username]);
  if (faculties.length === 0) {
    const err = new Error("Faculty not found.");
    err.status = 404;
    throw err;
  }
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

  return { totalScore, maxScore, answers: lineItems };
}

export async function saveDeanVerification({ username, remarks, pendingAnswers, verifier }) {
  const db = await getDbPool();
  const now = new Date().toISOString();

  const [subRows] = await db.query(
    "SELECT * FROM submissions WHERE username = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1",
    [username]
  );
  if (subRows.length === 0) {
    const err = new Error("No submitted appraisal found to verify.");
    err.status = 404;
    throw err;
  }
  const submission = subRows[0];

  if (submission.is_verified === 1) {
    const err = new Error("This appraisal has already been verified and cannot be verified again.");
    err.status = 400;
    throw err;
  }

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

  return {
    username,
    isVerified: true,
    verificationStatus: "VERIFIED",
    verifiedBy: verifier,
    verifiedAt: now,
    totalScore: updatedSub[0]?.total_score || submission.total_score,
    maxScore: updatedSub[0]?.max_score || submission.max_score,
  };
}

export async function getDeanVerification(username) {
  const db = await getDbPool();
  const [rows] = await db.query("SELECT * FROM dean_verifications WHERE username = ?", [username]);
  return rows.length > 0 ? rows[0] : null;
}

export async function resetSubmissionStatus(username) {
  const db = await getDbPool();
  await db.query("DELETE FROM submissions WHERE username = ?", [username]);
  await db.query("DELETE FROM hod_evaluations WHERE username = ?", [username]);
  await db.query("DELETE FROM dean_verifications WHERE username = ?", [username]);
}

export async function resetAllFacultySubmissionsAndScores() {
  const db = await getDbPool();
  await db.query("DELETE FROM submissions");
  await db.query("DELETE FROM hod_evaluations");
  await db.query("DELETE FROM principal_evaluations");
  await db.query("DELETE FROM reviewer_evaluations");
  await db.query("DELETE FROM dean_verifications");
  await db.query("DELETE FROM department_appraisal");
}

export async function getAdminSubmissions(department, designation) {
  const db = await getDbPool();
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
  return rows.map(formatSubmission);
}

export async function exportFacultyReport(department) {
  const db = await getDbPool();
  const [rows] = await db.query(
    `SELECT f.username, f.name, f.department, f.designation,
            COALESCE(s.total_score, 0) AS total_score, COALESCE(s.max_score, 0) AS max_score, s.submitted_at,
            COALESCE(s.is_submitted, 0) AS is_submitted, COALESCE(s.is_verified, 0) AS is_verified
     FROM faculty f
     LEFT JOIN (SELECT * FROM submissions WHERE is_submitted = 1) s ON f.username = s.username
     WHERE (? IS NULL OR f.department = ?)
     ORDER BY f.department ASC, f.name ASC`,
    [department || null, department || null]
  );
  return rows;
}

