import { getDbPool } from "../config/db.js";

export async function getAssignedQuestionsForStaff(staffId, loadQuestionsForFn) {
  const db = await getDbPool();
  const [faculties] = await db.query(
    "SELECT department, designation FROM faculty WHERE username = ?",
    [staffId]
  );
  if (faculties.length === 0) return null;
  const faculty = faculties[0];

  const rows = await loadQuestionsForFn(faculty.department, faculty.designation);
  return { staffId, department: faculty.department, designation: faculty.designation, questions: rows };
}
