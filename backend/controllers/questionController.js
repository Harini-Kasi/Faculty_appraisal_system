import { getAllDepartments } from "../models/Department.js";
import { getAllDesignations } from "../models/Designation.js";
import { loadQuestionsFor } from "../models/Question.js";
import { findFacultyByUsername } from "../models/Faculty.js";
import { getAssignedQuestionsForStaff } from "../models/QuestionAssignment.js";

export async function getDepartments(req, res) {
  try {
    const rows = await getAllDepartments();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching departments." });
  }
}

export async function getDesignations(req, res) {
  try {
    const rows = await getAllDesignations();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching designations." });
  }
}

export async function getQuestions(req, res) {
  try {
    const faculty = await findFacultyByUsername(req.session.username);
    if (!faculty) return res.status(404).json({ error: "Faculty record not found." });

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
}

export async function getQuestionsAssigned(req, res) {
  const { staffId } = req.params;
  try {
    const result = await getAssignedQuestionsForStaff(staffId, loadQuestionsFor);
    if (!result) return res.status(404).json({ error: "Faculty record not found." });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error loading assigned questions." });
  }
}
