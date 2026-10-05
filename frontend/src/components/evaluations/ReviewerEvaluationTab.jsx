import React, { useState, useEffect } from "react";
import { UserCheck, Save, Send } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../utils/api";

export default function ReviewerEvaluationTab() {
  const { showNotification } = useNotification();
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [facultyList, setFacultyList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [reviewerForm, setReviewerForm] = useState({
    r1: "8", r2: "8", r3: "8", r4: "8", r5: "8",
    totalScore: 80, remarks: "",
  });

  useEffect(() => {
    loadFacultyList(selectedDept);
  }, [selectedDept]);

  async function loadFacultyList(dept) {
    setLoading(true);
    try {
      const data = await api.getReviewerFacultyList(dept);
      setFacultyList(data);
      setSelectedStaff(null);
      setCombinedData(null);
    } catch (err) {
      showNotification(err.message || "Failed to load Reviewer faculty list.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectFaculty(staffId) {
    setSelectedStaff(staffId);
    try {
      const data = await api.getCombinedAppraisal(staffId);
      setCombinedData(data);
      if (data.reviewerEvaluation) {
        setReviewerForm({
          r1: data.reviewerEvaluation.r1 || "8",
          r2: data.reviewerEvaluation.r2 || "8",
          r3: data.reviewerEvaluation.r3 || "8",
          r4: data.reviewerEvaluation.r4 || "8",
          r5: data.reviewerEvaluation.r5 || "8",
          totalScore: data.reviewerEvaluation.total_score || 80,
          remarks: data.reviewerEvaluation.remarks || "",
        });
      }
    } catch (err) {
      showNotification(err.message || "Could not load faculty details.", "error");
    }
  }

  async function handleSaveReviewerEval(isSubmitted = false) {
    if (!selectedStaff) return;
    try {
      await api.saveReviewerEvaluation({
        username: selectedStaff,
        ...reviewerForm,
        isSubmitted,
      });
      showNotification(isSubmitted ? "Reviewer Evaluation submitted!" : "Reviewer Evaluation saved as draft.", "success");
      loadFacultyList(selectedDept);
    } catch (err) {
      showNotification(err.message || "Failed to save Reviewer evaluation.", "error");
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
                    {f.designation} • {f.reviewer_submitted ? "Reviewed" : "Pending"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reviewer Evaluation Form */}
        <div>
          {!selectedStaff && (
            <div className="card details-card" style={{ padding: "2rem", textAlign: "center" }}>
              <p>Select a faculty member from the list to enter External Reviewer Evaluation.</p>
            </div>
          )}

          {selectedStaff && combinedData && (
            <div className="card details-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.85rem" }}>
                <div>
                  <h3 style={{ margin: 0 }}>Reviewer Evaluation for {combinedData.faculty.name}</h3>
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
                  <label>R1: Academic Audit & Course File Review (1-10)</label>
                  <input type="number" className="input-styled" min="1" max="10" value={reviewerForm.r1} onChange={(e) => setReviewerForm({ ...reviewerForm, r1: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>R2: Publications & Citation Quality (1-10)</label>
                  <input type="number" className="input-styled" min="1" max="10" value={reviewerForm.r2} onChange={(e) => setReviewerForm({ ...reviewerForm, r2: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>R3: Project Funding & Consultancy Verification (1-10)</label>
                  <input type="number" className="input-styled" min="1" max="10" value={reviewerForm.r3} onChange={(e) => setReviewerForm({ ...reviewerForm, r3: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>R4: Innovative Teaching & Pedagogy Evidence (1-10)</label>
                  <input type="number" className="input-styled" min="1" max="10" value={reviewerForm.r4} onChange={(e) => setReviewerForm({ ...reviewerForm, r4: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>Total Reviewer Score</label>
                  <input type="number" className="input-styled" value={reviewerForm.totalScore} onChange={(e) => setReviewerForm({ ...reviewerForm, totalScore: Number(e.target.value) })} />
                </div>
                <div className="field-group" style={{ gridColumn: "span 2" }}>
                  <label>Reviewer Audit Remarks & Feedback</label>
                  <textarea className="input-styled" rows={3} value={reviewerForm.remarks} onChange={(e) => setReviewerForm({ ...reviewerForm, remarks: e.target.value })} placeholder="Enter Reviewer remarks..." />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn-outline-pdf" onClick={() => handleSaveReviewerEval(false)}>
                  <Save size={16} /> Save Draft
                </button>
                <button type="button" className="btn-primary" onClick={() => handleSaveReviewerEval(true)}>
                  <Send size={16} /> Submit Reviewer Evaluation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
