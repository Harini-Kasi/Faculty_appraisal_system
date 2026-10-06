import * as FacultyModel from "../models/Faculty.js";
import * as SelfAppraisalModel from "../models/SelfAppraisal.js";
import * as QuestionModel from "../models/Question.js";
import * as AppraisalService from "../services/appraisalService.js";

export async function clearFacultyData(req, res) {
  const { confirm } = req.body || {};
  if (confirm !== "CLEAR_DATA_CONFIRMED") {
    return res.status(400).json({ error: "Confirmation keyword missing." });
  }

  try {
    await FacultyModel.clearFacultyData();
    res.json({ ok: true, message: "Faculty and appraisal data cleared while preserving Admin." });
  } catch (err) {
    res.status(500).json({ error: "Error clearing faculty data." });
  }
}

export async function resetSubmission(req, res) {
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: "Username is required." });

  try {
    await SelfAppraisalModel.resetSubmissionStatus(username);
    res.json({ ok: true, message: `Appraisal submission for ${username} has been re-opened.` });
  } catch (err) {
    res.status(500).json({ error: "Error resetting submission status." });
  }
}

export async function resetAllSubmissions(req, res) {
  try {
    await SelfAppraisalModel.resetAllFacultySubmissionsAndScores();
    res.json({ ok: true, message: "Initial status for all faculty has been set to 'Not Submitted' and score to 0." });
  } catch (err) {
    console.error("Error resetting all submissions:", err);
    res.status(500).json({ error: "Error resetting all faculty submissions and scores." });
  }
}

export async function resetPassword(req, res) {
  const { username, newPassword, resetAll } = req.body || {};
  try {
    if (resetAll === true) {
      const msg = await FacultyModel.resetFacultyPassword(null, newPassword, true);
      return res.json({ ok: true, message: msg });
    }
    if (!username || !newPassword) {
      return res.status(400).json({ error: "Username and newPassword are required." });
    }
    const msg = await FacultyModel.resetFacultyPassword(username, newPassword, false);
    res.json({ ok: true, message: msg });
  } catch (err) {
    res.status(500).json({ error: "Error resetting password." });
  }
}

export async function sendReport(req, res) {
  const { recipientEmail, staffId } = req.body || {};
  if (!recipientEmail || !staffId) {
    return res.status(400).json({ error: "recipientEmail and staffId are required." });
  }

  try {
    const info = await AppraisalService.sendAppraisalEmail(recipientEmail, staffId);
    res.json({ ok: true, message: `Report sent to ${recipientEmail}`, messageId: info.messageId });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: err.message || "Failed to send report email." });
  }
}

export async function getAdminQuestions(req, res) {
  const { department, designation } = req.query;
  if (!department || !designation) {
    return res.status(400).json({ error: "department and designation are required." });
  }
  try {
    const rows = await QuestionModel.loadQuestionsFor(department, designation);
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
}

export async function saveAdminQuestions(req, res) {
  const { department, designation, questions } = req.body || {};
  if (!department || !designation || !Array.isArray(questions)) {
    return res.status(400).json({ error: "department, designation and questions[] are required." });
  }

  try {
    await QuestionModel.saveAdminQuestions(department, designation, questions);
    res.json({ ok: true });
  } catch (err) {
    console.error("Save questions error:", err);
    res.status(500).json({ error: "Error saving question set." });
  }
}

export async function getAdminSubmissions(req, res) {
  const { department, designation } = req.query;
  try {
    const submissions = await SelfAppraisalModel.getAdminSubmissions(department, designation);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching admin submissions." });
  }
}

export async function getAdminStaffList(req, res) {
  try {
    const rows = await FacultyModel.getAllFaculty();
    res.json(rows.map((f) => ({
      username: f.username,
      name: f.name,
      department: f.department,
      designation: f.designation,
      role: f.role,
    })));
  } catch (err) {
    res.status(500).json({ error: "Error fetching staff list." });
  }
}

export async function getDepartmentAnalytics(req, res) {
  const { departmentId } = req.params;
  try {
    const data = await AppraisalService.computeDepartmentAnalytics(departmentId);
    res.json(data);
  } catch (err) {
    console.error("Analytics department error:", err);
    res.status(500).json({ error: "Error computing department analytics." });
  }
}

export async function getDepartmentFacultyAnalytics(req, res) {
  const { departmentId } = req.params;
  try {
    const result = await AppraisalService.computeDepartmentFacultyAnalytics(departmentId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error fetching department faculty analytics." });
  }
}

export async function getDepartmentDesignationAnalytics(req, res) {
  const { departmentId } = req.params;
  try {
    const result = await AppraisalService.computeDepartmentDesignationAnalytics(departmentId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error fetching designation analytics." });
  }
}

export async function getFacultyAnalytics(req, res) {
  const { staffId } = req.params;
  try {
    const result = await AppraisalService.computeFacultyAnalytics(staffId);
    if (!result) return res.status(404).json({ error: "Faculty member not found." });
    res.json(result);
  } catch (err) {
    console.error("Faculty analytics error:", err);
    res.status(500).json({ error: "Error computing individual faculty analytics." });
  }
}
