import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, KeyRound, RotateCcw, Download, Trash2, Edit, AlertTriangle, 
  CheckCircle, Mail, X, User, Building, Shield, Award, Eye, EyeOff, Lock, RefreshCw, FileText
} from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  // Custom confirmation modals (replacing raw browser alerts)
  const [reopenUser, setReopenUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showResetAllModal, setShowResetAllModal] = useState(false);

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

  async function handleDeleteFacultyConfirm() {
    if (!deleteUser) return;
    try {
      await api.deleteFaculty(deleteUser.username);
      showNotification(`Faculty member ${deleteUser.name || deleteUser.username} deleted successfully.`, "success");
      setDeleteUser(null);
      loadFaculty();
    } catch (err) {
      showNotification(err.message || "Could not delete faculty.", "error");
    }
  }

  async function handleResetSubmissionConfirm() {
    if (!reopenUser) return;
    try {
      await api.resetSubmission(reopenUser.username);
      showNotification(`Appraisal submission for ${reopenUser.name || reopenUser.username} re-opened successfully.`, "success");
      setReopenUser(null);
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
      showNotification(`Password for ${resetPwUser.name || resetPwUser.username} reset successfully.`, "success");
      setResetPwUser(null);
      setNewPassword("");
      setShowPassword(false);
    } catch (err) {
      showNotification(err.message || "Failed to reset password.", "error");
    }
  }

  async function handleResetAllPasswordsConfirm() {
    try {
      await api.resetPassword(null, "faculty123", true);
      showNotification("All faculty passwords reset to 'faculty123'.", "success");
      setShowResetAllModal(false);
    } catch (err) {
      showNotification(err.message || "Failed to reset all passwords.", "error");
    }
  }

  function generateRandomPassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let res = "";
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
    setShowPassword(true);
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

  async function handleExportExcel() {
    try {
      await api.downloadFacultyExcelReport();
      showNotification("Faculty Appraisal Excel report downloaded successfully.", "success");
    } catch (err) {
      showNotification(err.message || "Failed to export Excel report.", "error");
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
            <button type="button" className="btn-outline-pdf" onClick={() => setShowResetAllModal(true)} style={{ color: "#d97706", borderColor: "#f59e0b" }}>
              <KeyRound size={16} /> Reset All Passwords
            </button>
            <button type="button" className="btn-outline-pdf" onClick={handleExportExcel}>
              <Download size={16} /> Export Excel
            </button>
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
                        {/* Action 1: Edit Faculty */}
                        <button type="button" className="btn-icon" title="Edit Faculty" onClick={() => setEditFaculty(f)}>
                          <Edit size={16} />
                        </button>

                        {/* Action 2: Reset Password */}
                        <button type="button" className="btn-icon" title="Reset Password" onClick={() => setResetPwUser(f)}>
                          <KeyRound size={16} />
                        </button>

                        {/* Action 3: Re-open Submission */}
                        <button type="button" className="btn-icon" title="Re-open Submission" onClick={() => setReopenUser(f)}>
                          <RotateCcw size={16} />
                        </button>

                        {/* Action 4: Delete Faculty */}
                        <button type="button" className="btn-icon" title="Delete Faculty" style={{ color: "#ef4444" }} onClick={() => setDeleteUser(f)}>
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

      {/* ============================================================ */}
      {/* ACTION MODAL 1: EDIT FACULTY PROFILE                         */}
      {/* ============================================================ */}
      {editFaculty && (
        <div className="modal-backdrop">
          <div className="action-modal-card">
            <div className="action-modal-header">
              <div className="action-modal-title-group">
                <div className="action-modal-icon-badge">
                  <Edit size={22} />
                </div>
                <div>
                  <h3 className="action-modal-title">Edit Faculty Profile</h3>
                  <div className="action-modal-subtitle">Staff ID: {editFaculty.username}</div>
                </div>
              </div>
              <button type="button" className="action-modal-close" onClick={() => setEditFaculty(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateFaculty}>
              <div className="action-modal-body">
                {/* Faculty Card Badge */}
                <div className="action-modal-user-card">
                  <div className="action-modal-avatar">
                    {editFaculty.name ? editFaculty.name.charAt(0).toUpperCase() : editFaculty.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="action-modal-user-info">
                    <h4>{editFaculty.name || editFaculty.username}</h4>
                    <p>
                      <span>{editFaculty.department} Department</span> • <span>{editFaculty.designation}</span>
                    </p>
                  </div>
                </div>

                <div className="action-modal-grid full">
                  <div className="action-modal-field">
                    <label className="action-modal-label">
                      <User size={14} /> Full Name
                    </label>
                    <input
                      type="text"
                      className="input-styled"
                      value={editFaculty.name || ""}
                      onChange={(e) => setEditFaculty({ ...editFaculty, name: e.target.value })}
                      placeholder="Enter faculty full name"
                      required
                    />
                  </div>
                </div>

                <div className="action-modal-grid">
                  <div className="action-modal-field">
                    <label className="action-modal-label">
                      <Building size={14} /> Department
                    </label>
                    <select className="input-styled" value={editFaculty.department || "CSE"} onChange={(e) => setEditFaculty({ ...editFaculty, department: e.target.value })}>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="S&H">S&H</option>
                    </select>
                  </div>

                  <div className="action-modal-field">
                    <label className="action-modal-label">
                      <Award size={14} /> Designation
                    </label>
                    <select className="input-styled" value={editFaculty.designation || "AP1"} onChange={(e) => setEditFaculty({ ...editFaculty, designation: e.target.value })}>
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
                </div>

                <div className="action-modal-grid full">
                  <div className="action-modal-field">
                    <label className="action-modal-label">
                      <Shield size={14} /> System Access Role
                    </label>
                    <select className="input-styled" value={editFaculty.role || "faculty"} onChange={(e) => setEditFaculty({ ...editFaculty, role: e.target.value })}>
                      <option value="faculty">Faculty</option>
                      <option value="hod">HOD</option>
                      <option value="principal">Principal</option>
                      <option value="radmin">Reviewer (RAdmin)</option>
                      <option value="vadmin">Dean (VAdmin)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="action-modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setEditFaculty(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ACTION MODAL 2: RESET PASSWORD                               */}
      {/* ============================================================ */}
      {resetPwUser && (
        <div className="modal-backdrop">
          <div className="action-modal-card">
            <div className="action-modal-header warning">
              <div className="action-modal-title-group">
                <div className="action-modal-icon-badge">
                  <KeyRound size={22} />
                </div>
                <div>
                  <h3 className="action-modal-title">Reset Security Password</h3>
                  <div className="action-modal-subtitle">Staff ID: {resetPwUser.username}</div>
                </div>
              </div>
              <button type="button" className="action-modal-close" onClick={() => { setResetPwUser(null); setNewPassword(""); setShowPassword(false); }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="action-modal-body">
                {/* Target User Info */}
                <div className="action-modal-user-card">
                  <div className="action-modal-avatar">
                    {resetPwUser.name ? resetPwUser.name.charAt(0).toUpperCase() : resetPwUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="action-modal-user-info">
                    <h4>{resetPwUser.name || resetPwUser.username}</h4>
                    <p>{resetPwUser.department} Department • {resetPwUser.designation}</p>
                  </div>
                </div>

                <div className="action-modal-field">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="action-modal-label">
                      <Lock size={14} /> New Account Password *
                    </label>
                    <button type="button" onClick={generateRandomPassword} style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: "600", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
                      Generate Strong Password
                    </button>
                  </div>
                  <div className="action-modal-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input-styled"
                      required
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "0.85rem", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="modal-warning-box">
                  <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>Security Note:</strong> This action will immediately replace the account password for <strong>{resetPwUser.name}</strong>. Provide the new password securely.
                  </div>
                </div>
              </div>

              <div className="action-modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => { setResetPwUser(null); setNewPassword(""); setShowPassword(false); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-warning-solid">
                  <KeyRound size={16} /> Confirm Password Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ACTION MODAL 3: RE-OPEN APPRAISAL SUBMISSION                 */}
      {/* ============================================================ */}
      {reopenUser && (
        <div className="modal-backdrop">
          <div className="action-modal-card">
            <div className="action-modal-header info">
              <div className="action-modal-title-group">
                <div className="action-modal-icon-badge">
                  <RotateCcw size={22} />
                </div>
                <div>
                  <h3 className="action-modal-title">Re-open Appraisal Submission</h3>
                  <div className="action-modal-subtitle">Staff ID: {reopenUser.username}</div>
                </div>
              </div>
              <button type="button" className="action-modal-close" onClick={() => setReopenUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="action-modal-body">
              <div className="action-modal-user-card">
                <div className="action-modal-avatar">
                  {reopenUser.name ? reopenUser.name.charAt(0).toUpperCase() : reopenUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="action-modal-user-info">
                  <h4>{reopenUser.name || reopenUser.username}</h4>
                  <p>{reopenUser.department} Department • {reopenUser.designation}</p>
                </div>
              </div>

              <div className="modal-warning-box">
                <RefreshCw size={22} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>Unlock Appraisal Submission:</strong><br />
                  Re-opening submission will allow <strong>{reopenUser.name}</strong> to make changes and resubmit their performance appraisal form.
                </div>
              </div>
            </div>

            <div className="action-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setReopenUser(null)}>
                Cancel
              </button>
              <button type="button" className="btn-warning-solid" onClick={handleResetSubmissionConfirm}>
                <RotateCcw size={16} /> Re-open Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ACTION MODAL 4: DELETE FACULTY MEMBER                        */}
      {/* ============================================================ */}
      {deleteUser && (
        <div className="modal-backdrop">
          <div className="action-modal-card">
            <div className="action-modal-header danger">
              <div className="action-modal-title-group">
                <div className="action-modal-icon-badge">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="action-modal-title">Delete Faculty Account</h3>
                  <div className="action-modal-subtitle">Irreversible Administrative Action</div>
                </div>
              </div>
              <button type="button" className="action-modal-close" onClick={() => setDeleteUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="action-modal-body">
              <div className="action-modal-user-card">
                <div className="action-modal-avatar" style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" }}>
                  {deleteUser.name ? deleteUser.name.charAt(0).toUpperCase() : deleteUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="action-modal-user-info">
                  <h4>{deleteUser.name || deleteUser.username}</h4>
                  <p>Staff ID: {deleteUser.username} • {deleteUser.department}</p>
                </div>
              </div>

              <div className="modal-danger-box">
                <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>Permanent Action Warning:</strong><br />
                  Are you sure you want to delete <strong>{deleteUser.name || deleteUser.username}</strong>? All user profile data, login access, and appraisal submissions associated with this account will be permanently removed.
                </div>
              </div>
            </div>

            <div className="action-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setDeleteUser(null)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={handleDeleteFacultyConfirm}>
                <Trash2 size={16} /> Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP ACTION MODAL: CREATE NEW FACULTY                         */}
      {/* ============================================================ */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="action-modal-card" style={{ maxWidth: "560px" }}>
            <div className="action-modal-header">
              <div className="action-modal-title-group">
                <div className="action-modal-icon-badge">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 className="action-modal-title">Create New Faculty Member</h3>
                  <div className="action-modal-subtitle">Add a staff member to the appraisal system</div>
                </div>
              </div>
              <button type="button" className="action-modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty}>
              <div className="action-modal-body">
                <div className="action-modal-grid">
                  <div className="action-modal-field">
                    <label className="action-modal-label"><User size={14} /> Staff ID / Username *</label>
                    <input type="text" className="input-styled" required placeholder="e.g. CSET109" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                  <div className="action-modal-field">
                    <label className="action-modal-label"><User size={14} /> Full Name *</label>
                    <input type="text" className="input-styled" required placeholder="e.g. Dr. John Smith" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                </div>

                <div className="action-modal-grid">
                  <div className="action-modal-field">
                    <label className="action-modal-label"><Building size={14} /> Department *</label>
                    <select className="input-styled" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="S&H">S&H</option>
                    </select>
                  </div>
                  <div className="action-modal-field">
                    <label className="action-modal-label"><Award size={14} /> Designation *</label>
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
                </div>

                <div className="action-modal-grid">
                  <div className="action-modal-field">
                    <label className="action-modal-label"><Shield size={14} /> System Role</label>
                    <select className="input-styled" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                      <option value="faculty">Faculty</option>
                      <option value="hod">HOD</option>
                      <option value="principal">Principal</option>
                      <option value="radmin">Reviewer (RAdmin)</option>
                      <option value="vadmin">Dean (VAdmin)</option>
                    </select>
                  </div>
                  <div className="action-modal-field">
                    <label className="action-modal-label"><Lock size={14} /> Initial Password *</label>
                    <input type="password" className="input-styled" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="action-modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <UserPlus size={16} /> Create Faculty Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP ACTION MODAL: BULK IMPORT                                */}
      {/* ============================================================ */}
      {showBulkModal && (
        <div className="modal-backdrop">
          <div className="action-modal-card" style={{ maxWidth: "620px" }}>
            <div className="action-modal-header">
              <div className="action-modal-title-group">
                <div className="action-modal-icon-badge">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="action-modal-title">Bulk Import Faculty Records</h3>
                  <div className="action-modal-subtitle">Add multiple records using comma-separated lines</div>
                </div>
              </div>
              <button type="button" className="action-modal-close" onClick={() => setShowBulkModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBulkImport}>
              <div className="action-modal-body">
                <div className="modal-warning-box">
                  <FileText size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>Format Instructions:</strong><br />
                    <code>username, name, department, designation, role, email, password</code>
                  </div>
                </div>

                <div className="action-modal-field">
                  <textarea
                    className="input-styled"
                    rows={8}
                    style={{ height: "auto", padding: "0.85rem", fontFamily: "monospace", fontSize: "0.85rem" }}
                    placeholder={`CSET105, Dr. John Doe, CSE, Associate Professor, faculty, john@nec.edu.in, faculty123\nCSET106, Dr. Jane Smith, ECE, Professor, hod, jane@jane.edu.in, hod123`}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="action-modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Users size={16} /> Process Bulk Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP ACTION MODAL: RESET ALL PASSWORDS                        */}
      {/* ============================================================ */}
      {showResetAllModal && (
        <div className="modal-backdrop">
          <div className="action-modal-card">
            <div className="action-modal-header warning">
              <div className="action-modal-title-group">
                <div className="action-modal-icon-badge">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="action-modal-title">Reset ALL Faculty Passwords</h3>
                  <div className="action-modal-subtitle">Global Security Override</div>
                </div>
              </div>
              <button type="button" className="action-modal-close" onClick={() => setShowResetAllModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="action-modal-body">
              <div className="modal-warning-box">
                <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>High Impact Action Notice:</strong><br />
                  Are you sure you want to reset <strong>ALL faculty passwords</strong> to default (<code>faculty123</code>)? This will overwrite custom passwords for all non-admin faculty accounts across all departments.
                </div>
              </div>
            </div>

            <div className="action-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setShowResetAllModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-warning-solid" onClick={handleResetAllPasswordsConfirm}>
                <KeyRound size={16} /> Confirm Global Password Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
