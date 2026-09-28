import React, { useState, useEffect } from "react";
import { Users, UserPlus, KeyRound, RotateCcw, Download, Trash2, Edit, AlertTriangle, CheckCircle, Mail } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../utils/api";

export default function FacultyManagementTab() {
  const { showNotification } = useNotification();
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // Modals / Action States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [resetPwUser, setResetPwUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  // Forms State
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    department: "CSE",
    designation: "AP1",
    role: "faculty",
    email: "",
    phone: "",
    password: "faculty123",
  });
  const [bulkText, setBulkText] = useState("");

  async function loadFaculty() {
    setLoading(true);
    try {
      const data = await api.getFacultyList();
      setFacultyList(data);
    } catch (err) {
      showNotification(err.message || "Failed to load faculty list.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaculty();
  }, []);

  async function handleCreateFaculty(e) {
    e.preventDefault();
    try {
      await api.createFaculty(formData);
      showNotification(`Faculty ${formData.name} created successfully.`, "success");
      setShowCreateModal(false);
      setFormData({ username: "", name: "", department: "CSE", designation: "AP1", role: "faculty", email: "", phone: "", password: "faculty123" });
      loadFaculty();
    } catch (err) {
      showNotification(err.message || "Could not create faculty.", "error");
    }
  }

  async function handleUpdateFaculty(e) {
    e.preventDefault();
    try {
      await api.updateFaculty(editFaculty.username, editFaculty);
      showNotification(`Faculty ${editFaculty.username} updated successfully.`, "success");
      setEditFaculty(null);
      loadFaculty();
    } catch (err) {
      showNotification(err.message || "Could not update faculty.", "error");
    }
  }

  async function handleDeleteFaculty(username) {
    if (!window.confirm(`Are you sure you want to delete faculty member ${username}?`)) return;
    try {
      await api.deleteFaculty(username);
      showNotification(`Faculty ${username} deleted.`, "success");
      loadFaculty();
    } catch (err) {
      showNotification(err.message || "Could not delete faculty.", "error");
    }
  }

  async function handleResetSubmission(username) {
    if (!window.confirm(`Re-open submission for ${username}? This will allow the faculty member to edit their appraisal.`)) return;
    try {
      await api.resetSubmission(username);
      showNotification(`Appraisal submission for ${username} re-opened successfully.`, "success");
    } catch (err) {
      showNotification(err.message || "Failed to re-open submission.", "error");
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showNotification("Password must be at least 6 characters.", "error");
      return;
    }
    try {
      await api.resetPassword(resetPwUser.username, newPassword);
      showNotification(`Password for ${resetPwUser.username} reset successfully.`, "success");
      setResetPwUser(null);
      setNewPassword("");
    } catch (err) {
      showNotification(err.message || "Failed to reset password.", "error");
    }
  }

  async function handleResetAllPasswords() {
    if (!window.confirm("RESET ALL FACULTY PASSWORDS to 'faculty123'? This will affect all non-admin faculty!")) return;
    try {
      await api.resetPassword(null, "faculty123", true);
      showNotification("All faculty passwords reset to 'faculty123'.", "success");
    } catch (err) {
      showNotification(err.message || "Failed to reset all passwords.", "error");
    }
  }

  async function handleBulkImport(e) {
    e.preventDefault();
    try {
      const lines = bulkText.split("\n").filter((l) => l.trim());
      const facultyArray = lines.map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          username: parts[0] || "",
          name: parts[1] || parts[0] || "",
          department: parts[2] || "CSE",
          designation: parts[3] || "AP1",
          role: parts[4] || "faculty",
          email: parts[5] || "",
          password: parts[6] || "faculty123",
        };
      });

      const res = await api.bulkCreateFaculty(facultyArray);
      showNotification(`Bulk import completed: ${res.addedCount} added, ${res.skippedCount} skipped.`, "success");
      setShowBulkModal(false);
      setBulkText("");
      loadFaculty();
    } catch (err) {
      showNotification(err.message || "Bulk creation failed.", "error");
    }
  }

  const filtered = facultyList.filter((f) => {
    const q = search.toLowerCase();
    const matchesQ = f.name?.toLowerCase().includes(q) || f.username?.toLowerCase().includes(q) || f.department?.toLowerCase().includes(q);
    const matchesDept = selectedDept ? f.department === selectedDept : true;
    return matchesQ && matchesDept;
  });

  return (
    <div className="appraisal-tab-content">
      {/* Action Bar */}
      <div className="card details-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "280px" }}>
            <input
              type="text"
              className="input-styled"
              placeholder="Search faculty name, ID, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input-styled" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ width: "160px" }}>
              <option value="">All Depts</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="S&H">S&H</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="button" className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <UserPlus size={16} /> Add Faculty
            </button>
            <button type="button" className="btn-outline-pdf" onClick={() => setShowBulkModal(true)}>
              <Users size={16} /> Bulk Import
            </button>
            <button type="button" className="btn-outline-pdf" onClick={handleResetAllPasswords} style={{ color: "#d97706", borderColor: "#f59e0b" }}>
              <KeyRound size={16} /> Reset All Passwords
            </button>
            <a href="http://localhost:4001/api/reports/faculty/export?format=excel" className="btn-outline-pdf" download style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
              <Download size={16} /> Export Excel
            </a>
          </div>
        </div>
      </div>

      {/* Faculty List Table */}
      <div className="card details-card" style={{ padding: "0" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="history-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>Staff ID</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>Name</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>Department</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>Designation</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>System Role</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                    Loading faculty list…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                    No faculty records found.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((f) => (
                  <tr key={f.username} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: "600" }}>{f.username}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>{f.name}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>{f.department}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>{f.designation}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span className="badge-status" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "0.25rem 0.6rem", borderRadius: "12px", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: "600" }}>
                        {f.role || "faculty"}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button type="button" className="btn-icon" title="Edit Faculty" onClick={() => setEditFaculty(f)}>
                          <Edit size={16} />
                        </button>
                        <button type="button" className="btn-icon" title="Reset Password" onClick={() => setResetPwUser(f)}>
                          <KeyRound size={16} />
                        </button>
                        <button type="button" className="btn-icon" title="Re-open Submission" onClick={() => handleResetSubmission(f.username)}>
                          <RotateCcw size={16} />
                        </button>
                        <button type="button" className="btn-icon" title="Delete Faculty" style={{ color: "#ef4444" }} onClick={() => handleDeleteFaculty(f.username)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Faculty */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card card" style={{ maxWidth: "500px", width: "100%" }}>
            <h3 style={{ marginBottom: "1rem" }}>Create New Faculty Record</h3>
            <form onSubmit={handleCreateFaculty}>
              <div className="field-group" style={{ marginBottom: "0.85rem" }}>
                <label>Staff ID / Username *</label>
                <input type="text" className="input-styled" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="field-group" style={{ marginBottom: "0.85rem" }}>
                <label>Full Name *</label>
                <input type="text" className="input-styled" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="field-group" style={{ marginBottom: "0.85rem" }}>
                <label>Department *</label>
                <select className="input-styled" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="S&H">S&H</option>
                </select>
              </div>
              <div className="field-group" style={{ marginBottom: "0.85rem" }}>
                <label>Designation *</label>
                <select className="input-styled" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}>
                  <option value="AP1">AP1</option>
                  <option value="AP2">AP2</option>
                  <option value="AP3">AP3</option>
                  <option value="AP4">AP4</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="SH1">SH1</option>
                  <option value="SH2">SH2</option>
                  <option value="SH3">SH3</option>
                  <option value="SH4">SH4</option>
                  <option value="SH5">SH5</option>
                </select>
              </div>
              <div className="field-group" style={{ marginBottom: "0.85rem" }}>
                <label>System Role</label>
                <select className="input-styled" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="faculty">Faculty</option>
                  <option value="hod">HOD</option>
                  <option value="principal">Principal</option>
                  <option value="radmin">Reviewer (RAdmin)</option>
                  <option value="vadmin">Dean (VAdmin)</option>
                </select>
              </div>
              <div className="field-group" style={{ marginBottom: "1.25rem" }}>
                <label>Initial Password *</label>
                <input type="password" className="input-styled" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn-outline-pdf" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Faculty</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Import */}
      {showBulkModal && (
        <div className="modal-backdrop">
          <div className="modal-card card" style={{ maxWidth: "600px", width: "100%" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Bulk Import Faculty Records</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Format: <code>username, name, department, designation, role, email, password</code> (one per line)
            </p>
            <form onSubmit={handleBulkImport}>
              <div className="field-group" style={{ marginBottom: "1.25rem" }}>
                <textarea
                  className="input-styled"
                  rows={8}
                  placeholder={`CSET105, Dr. John Doe, CSE, Associate Professor, faculty, john@nec.edu.in, faculty123\nCSET106, Dr. Jane Smith, ECE, Professor, hod, jane@nec.edu.in, hod123`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn-outline-pdf" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Process Bulk Import</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Faculty */}
      {editFaculty && (
        <div className="modal-backdrop">
          <div className="modal-card card" style={{ maxWidth: "500px", width: "100%" }}>
            <h3 style={{ marginBottom: "1rem" }}>Edit Faculty ({editFaculty.username})</h3>
            <form onSubmit={handleUpdateFaculty}>
              <div className="field-group" style={{ marginBottom: "0.85rem" }}>
                <label>Full Name</label>
                <input type="text" className="input-styled" value={editFaculty.name} onChange={(e) => setEditFaculty({ ...editFaculty, name: e.target.value })} />
              </div>
              <div className="field-group" style={{ marginBottom: "0.85rem" }}>
                <label>Department</label>
                <select className="input-styled" value={editFaculty.department} onChange={(e) => setEditFaculty({ ...editFaculty, department: e.target.value })}>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="S&H">S&H</option>
                </select>
              </div>
              <div className="field-group" style={{ marginBottom: "0.85rem" }}>
                <label>Designation</label>
                <select className="input-styled" value={editFaculty.designation} onChange={(e) => setEditFaculty({ ...editFaculty, designation: e.target.value })}>
                  <option value="AP1">AP1</option>
                  <option value="AP2">AP2</option>
                  <option value="AP3">AP3</option>
                  <option value="AP4">AP4</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="SH1">SH1</option>
                  <option value="SH2">SH2</option>
                  <option value="SH3">SH3</option>
                  <option value="SH4">SH4</option>
                  <option value="SH5">SH5</option>
                </select>
              </div>
              <div className="field-group" style={{ marginBottom: "0.85rem" }}>
                <label>System Role</label>
                <select className="input-styled" value={editFaculty.role || "faculty"} onChange={(e) => setEditFaculty({ ...editFaculty, role: e.target.value })}>
                  <option value="faculty">Faculty</option>
                  <option value="hod">HOD</option>
                  <option value="principal">Principal</option>
                  <option value="radmin">Reviewer (RAdmin)</option>
                  <option value="vadmin">Dean (VAdmin)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn-outline-pdf" onClick={() => setEditFaculty(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetPwUser && (
        <div className="modal-backdrop">
          <div className="modal-card card" style={{ maxWidth: "450px", width: "100%" }}>
            <h3 style={{ marginBottom: "1rem" }}>Reset Password for {resetPwUser.name}</h3>
            <form onSubmit={handleResetPassword}>
              <div className="field-group" style={{ marginBottom: "1.25rem" }}>
                <label>New Password *</label>
                <input type="password" className="input-styled" required placeholder="Enter new password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn-outline-pdf" onClick={() => setResetPwUser(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
