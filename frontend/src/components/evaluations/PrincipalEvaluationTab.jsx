import React, { useState, useEffect } from "react";
import { UserCheck, Save, Send, ShieldCheck } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../utils/api";

export default function PrincipalEvaluationTab() {
  const { showNotification } = useNotification();
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [facultyList, setFacultyList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [principalForm, setPrincipalForm] = useState({
    p1: "9", p2: "9", p3: "9", p4: "9", p5: "9",
    totalScore: 90, remarks: "",
  });

  useEffect(() => {
    loadFacultyList(selectedDept);
  }, [selectedDept]);

  async function loadFacultyList(dept) {
    setLoading(true);
    try {
      const data = await api.getPrincipalFacultyList(dept);
      setFacultyList(data);
      setSelectedStaff(null);
      setCombinedData(null);
    } catch (err) {
      showNotification(err.message || "Failed to load Principal faculty list.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectFaculty(staffId) {
    setSelectedStaff(staffId);
    try {
      const data = await api.getCombinedAppraisal(staffId);
      setCombinedData(data);
      if (data.principalEvaluation) {
        setPrincipalForm({
          p1: data.principalEvaluation.p1 || "9",
          p2: data.principalEvaluation.p2 || "9",
          p3: data.principalEvaluation.p3 || "9",
          p4: data.principalEvaluation.p4 || "9",
          p5: data.principalEvaluation.p5 || "9",
          totalScore: data.principalEvaluation.total_score || 90,
          remarks: data.principalEvaluation.remarks || "",
        });
      }
    } catch (err) {
      showNotification(err.message || "Could not load faculty details.", "error");
    }
  }

  async function handleSavePrincipalEval(isSubmitted = false) {
    if (!selectedStaff) return;
    try {
      await api.savePrincipalEvaluation({
        username: selectedStaff,
        ...principalForm,
        isSubmitted,
      });
      showNotification(isSubmitted ? "Principal Evaluation submitted!" : "Principal Evaluation saved as draft.", "success");
      loadFacultyList(selectedDept);
    } catch (err) {
      showNotification(err.message || "Failed to save Principal evaluation.", "error");
    }
  }

  return (
    <div className="appraisal-tab-content">
      {/* Department Selector */}
      <div className="card details-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <label style={{ fontWeight: "600" }}>Select Department:</label>
          <select className="input-styled" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ width: "200px" }}>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="S&H">S&H</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" }}>
        {/* Faculty List */}
        <div className="card details-card" style={{ padding: "1.25rem" }}>
          <h4 style={{ marginBottom: "1rem" }}>Faculty List ({selectedDept})</h4>
          {loading && <p>Loading faculty…</p>}
          {!loading && facultyList.length === 0 && <p>No faculty found in department.</p>}
          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {facultyList.map((f) => (
                <button
                  key={f.username}
                  type="button"
                  style={{
                    textAlign: "left",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    background: selectedStaff === f.username ? "var(--primary-color)" : "var(--bg-secondary)",
                    color: selectedStaff === f.username ? "#ffffff" : "var(--text-primary)",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                  onClick={() => handleSelectFaculty(f.username)}
                >
                  <div style={{ fontWeight: "600" }}>{f.name}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                    {f.designation} • {f.principal_submitted ? "Evaluated" : "Pending"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Principal Evaluation Form */}
        <div>
          {!selectedStaff && (
            <div className="card details-card" style={{ padding: "2rem", textAlign: "center" }}>
              <p>Select a faculty member from the list to enter Principal Evaluation.</p>
            </div>
          )}

          {selectedStaff && combinedData && (
            <div className="card details-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.85rem" }}>
                <div>
                  <h3 style={{ margin: 0 }}>Principal Evaluation for {combinedData.faculty.name}</h3>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {combinedData.faculty.department} | {combinedData.faculty.designation} | Staff ID: {combinedData.faculty.username}
                  </p>
                </div>
                {combinedData.selfAppraisal && (
                  <span className="badge-status" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "0.35rem 0.75rem", borderRadius: "12px", fontWeight: "600" }}>
                    Self Score: {combinedData.selfAppraisal.totalScore} / {combinedData.selfAppraisal.maxScore}
                  </span>
                )}
              </div>

              {/* Evaluation Fields */}
              <div className="faculty-details-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="field-group">
                  <label>P1: Strategic Leadership & Vision (1-10)</label>
                  <input type="number" className="input-styled" min="1" max="10" value={principalForm.p1} onChange={(e) => setPrincipalForm({ ...principalForm, p1: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>P2: Research & Innovation Impact (1-10)</label>
                  <input type="number" className="input-styled" min="1" max="10" value={principalForm.p2} onChange={(e) => setPrincipalForm({ ...principalForm, p2: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>P3: Academic Excellence & Quality (1-10)</label>
                  <input type="number" className="input-styled" min="1" max="10" value={principalForm.p3} onChange={(e) => setPrincipalForm({ ...principalForm, p3: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>P4: Institutional Growth Contribution (1-10)</label>
                  <input type="number" className="input-styled" min="1" max="10" value={principalForm.p4} onChange={(e) => setPrincipalForm({ ...principalForm, p4: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>Total Principal Score</label>
                  <input type="number" className="input-styled" value={principalForm.totalScore} onChange={(e) => setPrincipalForm({ ...principalForm, totalScore: Number(e.target.value) })} />
                </div>
                <div className="field-group" style={{ gridColumn: "span 2" }}>
                  <label>Principal Remarks / Recommendations</label>
                  <textarea className="input-styled" rows={3} value={principalForm.remarks} onChange={(e) => setPrincipalForm({ ...principalForm, remarks: e.target.value })} placeholder="Enter Principal remarks..." />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn-outline-pdf" onClick={() => handleSavePrincipalEval(false)}>
                  <Save size={16} /> Save Draft
                </button>
                <button type="button" className="btn-primary" onClick={() => handleSavePrincipalEval(true)}>
                  <Send size={16} /> Submit Principal Evaluation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
