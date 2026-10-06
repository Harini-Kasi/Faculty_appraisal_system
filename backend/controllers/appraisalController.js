import * as SelfAppraisalModel from "../models/SelfAppraisal.js";

export async function saveDraft(req, res) {
  try {
    const { answers, details } = req.body || {};
    const result = await SelfAppraisalModel.saveDraftSubmission(req.session.username, answers, details);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to save draft." });
  }
}

export async function getDraft(req, res) {
  try {
    const draft = await SelfAppraisalModel.getDraftSubmission(req.session.username);
    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: "Error fetching appraisal draft." });
  }
}

export async function submitAppraisal(req, res) {
  try {
    const { answers, details } = req.body || {};
    const result = await SelfAppraisalModel.processSubmission(req.session.username, answers, details);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to submit appraisal." });
  }
}

export async function getMySubmissions(req, res) {
  try {
    const submissions = await SelfAppraisalModel.getSubmissionsByUsername(req.session.username);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching submissions." });
  }
}

export async function getAppraisalSubmissions(req, res) {
  const { staffId } = req.params;
  try {
    const submissions = await SelfAppraisalModel.getSubmissionsByUsername(staffId);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching staff submissions." });
  }
}

export async function getAppraisal(req, res) {
  const { staffId } = req.params;
  try {
    const submission = await SelfAppraisalModel.getLatestSubmission(staffId);
    if (!submission) {
      return res.status(404).json({ error: "No submission found for this staff ID." });
    }
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving staff submission." });
  }
}

export async function getCombinedAppraisal(req, res) {
  const { staffId } = req.params;
  try {
    const data = await SelfAppraisalModel.getCombinedAppraisalDetails(staffId);
    if (!data) return res.status(404).json({ error: "Faculty member not found." });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving combined appraisal details." });
  }
}

export async function getPrincipalFacultyList(req, res) {
  const { dept } = req.params;
  try {
    const rows = await SelfAppraisalModel.getPrincipalFacultyList(dept);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Principal faculty list." });
  }
}

export async function savePrincipalEvaluation(req, res) {
  try {
    const username = await SelfAppraisalModel.savePrincipalEvaluation(req.body || {}, req.session.username);
    res.json({ ok: true, username });
  } catch (err) {
    res.status(400).json({ error: err.message || "Error saving Principal evaluation." });
  }
}

export async function getPrincipalEvaluation(req, res) {
  const { username } = req.params;
  try {
    const result = await SelfAppraisalModel.getPrincipalEvaluation(username);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Principal evaluation." });
  }
}

export async function getReviewerFacultyList(req, res) {
  const { dept } = req.params;
  try {
    const rows = await SelfAppraisalModel.getReviewerFacultyList(dept);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Reviewer faculty list." });
  }
}

export async function saveReviewerEvaluation(req, res) {
  try {
    const username = await SelfAppraisalModel.saveReviewerEvaluation(req.body || {}, req.session.username);
    res.json({ ok: true, username });
  } catch (err) {
    res.status(400).json({ error: err.message || "Error saving Reviewer evaluation." });
  }
}

export async function getReviewerEvaluation(req, res) {
  const { username } = req.params;
  try {
    const result = await SelfAppraisalModel.getReviewerEvaluation(username);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Reviewer evaluation." });
  }
}

export async function getDeanFacultyList(req, res) {
  const { dept } = req.params;
  try {
    const rows = await SelfAppraisalModel.getDeanFacultyList(dept);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching Dean faculty list:", err);
    res.status(500).json({ error: "Error fetching Dean faculty list." });
  }
}

export async function getVadminAppraisalDetails(req, res) {
  const { username } = req.params;
  try {
    const details = await SelfAppraisalModel.getVadminAppraisalDetails(username);
    if (!details) return res.status(404).json({ error: "Faculty member not found." });
    res.json(details);
  } catch (err) {
    console.error("VAdmin details error:", err);
    res.status(500).json({ error: "Error fetching VAdmin appraisal details." });
  }
}

export async function saveVadminAppraisalResponses(req, res) {
  const { username } = req.params;
  const { answers } = req.body || {};
  try {
    const result = await SelfAppraisalModel.saveVadminAppraisalResponses(username, answers);
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("VAdmin response update error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error updating appraisal responses." });
  }
}

export async function saveDeanVerification(req, res) {
  const { username, remarks, pendingAnswers } = req.body || {};
  if (!username) return res.status(400).json({ error: "Faculty username is required." });
  try {
    const result = await SelfAppraisalModel.saveDeanVerification({
      username,
      remarks,
      pendingAnswers,
      verifier: req.session.username,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error recording Dean verification." });
  }
}

export async function getDeanVerification(req, res) {
  const { username } = req.params;
  try {
    const result = await SelfAppraisalModel.getDeanVerification(username);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Dean verification." });
  }
}
