import * as FacultyModel from "../models/Faculty.js";
import * as SelfAppraisalModel from "../models/SelfAppraisal.js";
import { generateFacultyReportCsv, generateFacultyReportExcel } from "../services/appraisalService.js";

export async function getFacultyList(req, res) {
  try {
    const rows = await FacultyModel.getAllFaculty();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching faculty list." });
  }
}

export async function getFacultyByDepartment(req, res) {
  const { departmentId } = req.params;
  try {
    const rows = await FacultyModel.getFacultyByDepartment(departmentId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching department faculty." });
  }
}

export async function getFacultyByStaffId(req, res) {
  const { staffId } = req.params;
  try {
    const faculty = await FacultyModel.findFacultyByUsername(staffId);
    if (!faculty) {
      return res.status(404).json({ error: "Faculty member not found." });
    }
    res.json({
      username: faculty.username,
      name: faculty.name,
      department: faculty.department,
      designation: faculty.designation,
      role: faculty.role,
      email: faculty.email || "",
      phone: faculty.phone || "",
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching faculty details." });
  }
}

export async function createFaculty(req, res) {
  const { username, password, name, department, designation, role, email, phone } = req.body || {};
  if (!username || !password || !name || !department || !designation) {
    return res.status(400).json({ error: "Username, password, name, department, and designation are required." });
  }

  try {
    const uname = await FacultyModel.createFaculty({ username, password, name, department, designation, role, email, phone });
    res.json({ ok: true, username: uname });
  } catch (err) {
    res.status(400).json({ error: err.message || "Error creating faculty record." });
  }
}

export async function bulkCreateFaculty(req, res) {
  const { facultyList } = req.body || {};
  if (!Array.isArray(facultyList) || facultyList.length === 0) {
    return res.status(400).json({ error: "facultyList array is required." });
  }

  try {
    const result = await FacultyModel.bulkCreateFaculty(facultyList);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: "Error processing bulk faculty creation." });
  }
}

export async function updateFaculty(req, res) {
  const { username } = req.params;
  try {
    await FacultyModel.updateFaculty(username, req.body || {});
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message || "Error updating faculty record." });
  }
}

export async function deleteFaculty(req, res) {
  const { username } = req.params;
  try {
    await FacultyModel.deleteFaculty(username);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error deleting faculty member." });
  }
}

export async function getAcademicDetails(req, res) {
  const { staffId } = req.params;
  try {
    const details = await FacultyModel.getAcademicDetails(staffId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: "Error fetching academic details." });
  }
}

export async function saveAcademicDetails(req, res) {
  const { staffId } = req.params;
  try {
    await FacultyModel.saveAcademicDetails(staffId, req.body || {});
    res.json({ ok: true, username: staffId });
  } catch (err) {
    res.status(500).json({ error: "Error saving academic details." });
  }
}

export async function exportFacultyReport(req, res) {
  const format = String(req.query.format || "json").toLowerCase();
  const department = req.query.department;

  try {
    const rows = await SelfAppraisalModel.exportFacultyReport(department);

    if (format === "csv") {
      const csv = generateFacultyReportCsv(rows);
      res.header("Content-Type", "text/csv");
      res.attachment("faculty_appraisal_report.csv");
      return res.send(csv);
    }

    if (format === "excel") {
      return await generateFacultyReportExcel(rows, res);
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error exporting report." });
  }
}
