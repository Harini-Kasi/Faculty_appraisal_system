/* ============================================================
   Thin fetch wrapper for talking to the FPA API server.
   ============================================================ */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4001";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error("Could not reach the server. Please make sure the API server is running.");
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    request("/api/auth/login", { method: "POST", body: { username, password }, auth: false }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/me"),
  changePassword: (currentPassword, newPassword) =>
    request("/api/auth/change-password", { method: "POST", body: { currentPassword, newPassword } }),

  // Faculty CRUD & Bulk
  getFacultyList: () => request("/api/faculty"),
  getFaculty: (staffId) => request(`/api/faculty/${encodeURIComponent(staffId)}`),
  getFacultyByDepartment: (departmentId) =>
    request(`/api/faculty/department/${encodeURIComponent(departmentId)}`),
  createFaculty: (data) => request("/api/faculty", { method: "POST", body: data }),
  bulkCreateFaculty: (facultyList) => request("/api/faculty/bulk", { method: "POST", body: { facultyList } }),
  updateFaculty: (username, data) => request(`/api/faculty/${encodeURIComponent(username)}`, { method: "PUT", body: data }),
  deleteFaculty: (username) => request(`/api/faculty/${encodeURIComponent(username)}`, { method: "DELETE" }),
  clearFacultyData: (confirmKeyword) => request("/api/admin/clear-faculty-data", { method: "POST", body: { confirm: confirmKeyword } }),

  // Academic Details
  getAcademicDetails: (staffId) => request(`/api/faculty/${encodeURIComponent(staffId)}/academic-details`),
  saveAcademicDetails: (staffId, details) =>
    request(`/api/faculty/${encodeURIComponent(staffId)}/academic-details`, { method: "POST", body: details }),

  // Departments & Designations
  getDepartments: () => request("/api/departments"),
  getDesignations: () => request("/api/designations"),

  // Questions
  getQuestions: () => request("/api/questions"),
  getQuestionsAssigned: (staffId) => request(`/api/questions/assigned/${encodeURIComponent(staffId)}`),

  // Appraisal Submissions & Drafts
  saveAppraisalDraft: (answers, details) =>
    request("/api/appraisal/draft", { method: "POST", body: { answers, details } }),
  getAppraisalDraft: () => request("/api/appraisal/draft"),
  submitAppraisal: (answers, details) =>
    request("/api/appraisal/submit", { method: "POST", body: { answers, details } }),
  getAppraisal: (staffId) => request(`/api/appraisal/${encodeURIComponent(staffId)}`),
  getMySubmissions: () => request("/api/submissions"),
  getAppraisalSubmissions: (staffId) =>
    request(`/api/appraisal/submissions/${encodeURIComponent(staffId)}`),
  getCombinedAppraisal: (staffId) => request(`/api/faculty/combined-appraisal/${encodeURIComponent(staffId)}`),

  // HOD Evaluation
  getHodFacultyList: (department) =>
    request(`/api/hod/faculty-list${department ? `?department=${encodeURIComponent(department)}` : ""}`),
  saveHodEvaluation: (data) => request("/api/hod/evaluation", { method: "POST", body: data }),
  getHodEvaluation: (username) => request(`/api/hod/evaluation/${encodeURIComponent(username)}`),

  // Principal Evaluation
  getPrincipalFacultyList: (dept) => request(`/api/principal/faculty-list/${encodeURIComponent(dept)}`),
  savePrincipalEvaluation: (data) => request("/api/principal/evaluation", { method: "POST", body: data }),
  getPrincipalEvaluation: (username) => request(`/api/principal/evaluation/${encodeURIComponent(username)}`),

  // Reviewer (RAdmin) Evaluation
  getReviewerFacultyList: (dept) => request(`/api/reviewer/faculty-list/${encodeURIComponent(dept)}`),
  saveReviewerEvaluation: (data) => request("/api/reviewer/evaluation", { method: "POST", body: data }),
  getReviewerEvaluation: (username) => request(`/api/reviewer/evaluation/${encodeURIComponent(username)}`),

  // Dean (VAdmin) Verification
  getDeanFacultyList: (dept) => request(`/api/dean/faculty-list/${encodeURIComponent(dept)}`),
  getVadminAppraisalDetails: (username) => request(`/api/vadmin/appraisals/${encodeURIComponent(username)}`),
  saveVadminAppraisalResponses: (username, answers) =>
    request(`/api/vadmin/appraisals/${encodeURIComponent(username)}/responses`, { method: "PUT", body: { answers } }),
  saveDeanVerification: (data) => request("/api/dean/verify", { method: "POST", body: data }),
  verifyAppraisal: (username, remarks, pendingAnswers) =>
    request("/api/dean/verify", { method: "POST", body: { username, remarks, pendingAnswers } }),
  getDeanVerification: (username) => request(`/api/dean/verification/${encodeURIComponent(username)}`),

  // Department Appraisal (HOD)
  saveDepartmentAppraisalDraft: (data) => request("/api/department-appraisal/draft", { method: "POST", body: data }),
  submitDepartmentAppraisal: (data) => request("/api/department-appraisal/submit", { method: "POST", body: data }),
  getDepartmentAppraisal: (dept) => request(`/api/department-appraisal/${encodeURIComponent(dept)}`),
  getDepartmentAppraisalReport: () => request("/api/department-appraisal/reports/summary"),

  // Admin Tools
  resetSubmission: (username) => request("/api/admin/reset-submission", { method: "POST", body: { username } }),
  resetPassword: (username, newPassword, resetAll = false) =>
    request("/api/admin/reset-password", { method: "POST", body: { username, newPassword, resetAll } }),
  sendReportEmail: (recipientEmail, staffId) =>
    request("/api/admin/send-report", { method: "POST", body: { recipientEmail, staffId } }),

  // Admin Question Builder & Submissions
  getAdminQuestions: (department, designation) =>
    request(`/api/admin/questions?department=${encodeURIComponent(department)}&designation=${encodeURIComponent(designation)}`),
  saveAdminQuestions: (department, designation, questions) =>
    request("/api/admin/questions", { method: "PUT", body: { department, designation, questions } }),
  getAdminSubmissions: (department, designation) => {
    const params = new URLSearchParams();
    if (department) params.set("department", department);
    if (designation) params.set("designation", designation);
    const qs = params.toString();
    return request(`/api/admin/submissions${qs ? `?${qs}` : ""}`);
  },
  getAdminStaffList: () => request("/api/admin/staff-list"),

  // Admin Performance Analytics
  getAnalyticsByDepartment: (departmentId) =>
    request(`/api/analytics/department/${encodeURIComponent(departmentId)}`),
  getAnalyticsByFaculty: (staffId) =>
    request(`/api/analytics/faculty/${encodeURIComponent(staffId)}`),
  getAnalyticsDepartmentFaculty: (departmentId) =>
    request(`/api/analytics/department/${encodeURIComponent(departmentId)}/faculty`),
  getAnalyticsDepartmentDesignation: (departmentId) =>
    request(`/api/analytics/department/${encodeURIComponent(departmentId)}/designation`),
};
