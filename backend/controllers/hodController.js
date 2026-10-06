import * as SelfAppraisalModel from "../models/SelfAppraisal.js";
import * as DepartmentModel from "../models/Department.js";
import { calculateDepartmentAppraisalTotals } from "../services/appraisalService.js";
import {
  determineHodTemplate,
  getHodQuestionsByTemplate,
  calculateHpeScore,
} from "../services/hodTemplateService.js";
import { getDbPool } from "../config/db.js";

/**
 * Get HOD faculty list for the authenticated HOD's department.
 */
export async function getHodFacultyList(req, res) {
  try {
    const sessionDept = await getAuthenticatedHodDept(req);
    const rows = await SelfAppraisalModel.getHodFacultyList(
      sessionDept || req.query.department,
      req.session.username,
      req.session.role
    );
    res.json(rows);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Error fetching HOD faculty list." });
  }
}

/**
 * Get applicable HOD Questions & Options for a target faculty member.
 * Enforces HOD department authorization.
 */
export async function getHodQuestionsForFaculty(req, res) {
  const { username } = req.params;
  try {
    const db = await getDbPool();

    // 1. Fetch target faculty info
    const [faculties] = await db.query(
      "SELECT username, name, department, designation, role FROM faculty WHERE username = ?",
      [username]
    );
    if (faculties.length === 0) {
      return res.status(404).json({ error: "Faculty member not found." });
    }
    const faculty = faculties[0];

    // 2. Enforce HOD Department Security
    if (req.session.role === "hod") {
      const hodDept = await getAuthenticatedHodDept(req);
      if (hodDept && hodDept !== faculty.department) {
        return res.status(403).json({
          error: `Forbidden: HOD of ${hodDept} cannot evaluate faculty from ${faculty.department}.`,
        });
      }
    }

    // 3. Fetch tutorship from academic details
    const [academic] = await db.query(
      "SELECT tutorship FROM faculty_academic_details WHERE username = ?",
      [username]
    );
    const tutorship = academic[0]?.tutorship || "";

    // 4. Determine template code (EVAL1..EVAL12)
    const templateCode = determineHodTemplate(faculty.department, faculty.designation, tutorship);

    // 5. Fetch questions & options from DB for template
    const { questions, maxPossibleScore } = await getHodQuestionsByTemplate(templateCode);

    // 6. Fetch existing evaluation if any
    const existingEval = await SelfAppraisalModel.getHodEvaluation(username);
    let savedAnswers = [];
    if (existingEval?.answers_json) {
      try {
        savedAnswers = JSON.parse(existingEval.answers_json);
      } catch {}
    }

    res.json({
      templateCode,
      faculty: {
        username: faculty.username,
        name: faculty.name,
        department: faculty.department,
        designation: faculty.designation,
        tutorship,
      },
      questions,
      maxPossibleScore,
      savedEvaluation: existingEval
        ? {
            id: existingEval.id,
            evaluatorUsername: existingEval.evaluator_username,
            templateCode: existingEval.template_code,
            hpe: existingEval.hpe,
            remarks: existingEval.remarks,
            isSubmitted: Boolean(existingEval.is_submitted),
            submittedAt: existingEval.submitted_at,
            answers: savedAnswers,
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Error fetching HOD evaluation questions." });
  }
}

/**
 * Save / Submit HOD Evaluation for individual faculty.
 * Calculates score on backend & enforces department security.
 */
export async function saveHodEvaluation(req, res) {
  try {
    const { username, answers, remarks, isSubmitted } = req.body || {};
    if (!username) return res.status(400).json({ error: "Faculty username is required." });

    const db = await getDbPool();

    // 1. Fetch target faculty info
    const [faculties] = await db.query(
      "SELECT username, department, designation FROM faculty WHERE username = ?",
      [username]
    );
    if (faculties.length === 0) {
      return res.status(404).json({ error: "Faculty member not found." });
    }
    const faculty = faculties[0];

    // 2. Enforce HOD Department Security
    if (req.session.role === "hod") {
      const hodDept = await getAuthenticatedHodDept(req);
      if (hodDept && hodDept !== faculty.department) {
        return res.status(403).json({
          error: `Forbidden: HOD of ${hodDept} cannot evaluate faculty from ${faculty.department}.`,
        });
      }
    }

    // 3. Determine template and fetch questions
    const [academic] = await db.query(
      "SELECT tutorship FROM faculty_academic_details WHERE username = ?",
      [username]
    );
    const tutorship = academic[0]?.tutorship || "";
    const templateCode = determineHodTemplate(faculty.department, faculty.designation, tutorship);
    const { questions } = await getHodQuestionsByTemplate(templateCode);

    // 4. Calculate score on server
    const { rawScore, percentage } = calculateHpeScore(questions, answers);

    // 5. Persist evaluation
    await SelfAppraisalModel.saveHodEvaluation(
      {
        username,
        templateCode,
        answersJson: JSON.stringify(answers || []),
        hpe: rawScore,
        remarks: remarks || "",
        isSubmitted: Boolean(isSubmitted),
      },
      req.session.username
    );

    res.json({
      ok: true,
      username,
      templateCode,
      hpeRawScore: rawScore,
      hpePercentage: percentage,
      isSubmitted: Boolean(isSubmitted),
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Error saving HOD evaluation." });
  }
}

/**
 * Get existing HOD evaluation for faculty username.
 */
export async function getHodEvaluation(req, res) {
  const { username } = req.params;
  try {
    const result = await SelfAppraisalModel.getHodEvaluation(username);
    if (!result) return res.json(null);
    let answers = [];
    if (result.answers_json) {
      try {
        answers = JSON.parse(result.answers_json);
      } catch {}
    }
    res.json({
      ...result,
      is_submitted: Boolean(result.is_submitted),
      answers,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching HOD evaluation." });
  }
}

/**
 * Save Department Appraisal Draft. Enforces HOD department security.
 */
export async function saveDepartmentAppraisalDraft(req, res) {
  try {
    const result = await handleDepartmentAppraisal(req, true);
    res.json(result);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Failed to save department appraisal draft." });
  }
}

/**
 * Submit Department Appraisal. Enforces HOD department security.
 */
export async function submitDepartmentAppraisal(req, res) {
  try {
    const result = await handleDepartmentAppraisal(req, false);
    res.json(result);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Failed to submit department appraisal." });
  }
}

async function handleDepartmentAppraisal(req, isDraft) {
  const body = req.body || {};
  const { department, formData, specialSkills, facultyInfo } = body;
  if (!department) throw new Error("Department code is required.");

  // Enforce HOD Department Security
  if (req.session.role === "hod") {
    const hodDept = await getAuthenticatedHodDept(req);
    if (hodDept && hodDept !== department) {
      const err = new Error(`Forbidden: HOD of ${hodDept} cannot modify Department Appraisal for ${department}.`);
      err.status = 403;
      throw err;
    }
  }

  const deptMaxScore = await DepartmentModel.getDepartmentMaxScore(department);
  const totals = calculateDepartmentAppraisalTotals(formData, deptMaxScore);

  return await DepartmentModel.upsertDepartmentAppraisal({
    username: req.session.username,
    department,
    facultyInfo: facultyInfo || { name: req.session.name, dept: department },
    formData,
    specialSkills,
    ...totals,
    deptMaxScore,
    isDraft,
  });
}

/**
 * Get Department Appraisal for a given department.
 * Enforces HOD department security.
 */
export async function getDepartmentAppraisal(req, res) {
  const { department } = req.params;
  try {
    if (req.session.role === "hod") {
      const hodDept = await getAuthenticatedHodDept(req);
      if (hodDept && hodDept !== department) {
        return res.status(403).json({
          error: `Forbidden: HOD of ${hodDept} cannot view Department Appraisal for ${department}.`,
        });
      }
    }

    const r = await DepartmentModel.findLatestDepartmentAppraisal(department);
    if (!r) return res.json(null);
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
}

/**
 * Summary Report for Department Appraisals.
 */
export async function getDepartmentAppraisalReport(req, res) {
  try {
    const rows = await DepartmentModel.getAllDepartmentAppraisals();
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
}

/**
 * Helper to retrieve HOD's authorized department from session/DB.
 */
async function getAuthenticatedHodDept(req) {
  if (req.session.department) return req.session.department;
  const db = await getDbPool();
  const [rows] = await db.query("SELECT department FROM faculty WHERE username = ?", [req.session.username]);
  return rows[0]?.department || null;
}
