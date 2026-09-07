/* ============================================================
   Thin fetch wrapper for talking to the FPA API server.
   The base URL can be overridden with VITE_API_URL if the
   backend runs somewhere other than http://localhost:4000.
   ============================================================ */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
  login: (username, password) =>
    request("/api/auth/login", { method: "POST", body: { username, password }, auth: false }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/me"),
  changePassword: (currentPassword, newPassword) =>
    request("/api/auth/change-password", { method: "POST", body: { currentPassword, newPassword } }),

  getQuestions: () => request("/api/questions"),
  submitAppraisal: (answers, details) =>
    request("/api/submissions", { method: "POST", body: { answers, details } }),
  getMySubmissions: () => request("/api/submissions"),

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
};
