import React, { useState, useEffect } from "react";
import { UserCheck, Save, Send, Building, Award, CheckCircle } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";

export default function HodEvaluationTab() {
  const { showNotification } = useNotification();
  const { session } = useAuth();
  const [subTab, setSubTab] = useState("faculty_eval"); // 'faculty_eval' | 'dept_appraisal'
  const [facultyList, setFacultyList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [loading, setLoading] = useState(true);

  // HOD Evaluation Form State
  const [hodForm, setHodForm] = useState({
    h1: "5", h2: "5", h3: "5", h4: "5", h5: "5", h6: "5",
    h7: "5", h8: "5", h9: "5", h10: "5", h11: "5", h12: "5", h13: "5",
    hpe: 85, remarks: "",
  });

  // Department Appraisal Form State
  const [deptAppraisal, setDeptAppraisal] = useState({
    department: session?.department || "CSE",
    specialSkills: "",
    sg1_1: 50, sg1_2: 40,
    sg2_1: 60, sg2_2: 50,
    sg3_1: 45, sg3_2: 40,
    sg4_1: 35, sg4_2: 30,
    sg5_1: 25, sg5_2: 20,
    sg6_1: 30, sg6_2: 20,
  });
  const [deptAppraisalResult, setDeptAppraisalResult] = useState(null);

  useEffect(() => {
    loadFacultyList();
    loadDeptAppraisal();
  }, []);

  async function loadFacultyList() {
    setLoading(true);
    try {
      const data = await api.getHodFacultyList(session?.department);
      setFacultyList(data);
    } catch (err) {
      showNotification(err.message || "Failed to load faculty list for HOD evaluation.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadDeptAppraisal() {
    try {
      const data = await api.getDepartmentAppraisal(session?.department || "CSE");
      if (data) {
        setDeptAppraisalResult(data);
        if (data.formData) {
          setDeptAppraisal((prev) => ({ ...prev, ...data.formData, specialSkills: data.specialSkills || "" }));
        }
      }
    } catch {}
  }

  async function handleSelectFaculty(staffId) {
    setSelectedStaff(staffId);
    try {
      const data = await api.getCombinedAppraisal(staffId);
      setCombinedData(data);
      if (data.hodEvaluation) {
        setHodForm({
          h1: data.hodEvaluation.h1 || "5",
          h2: data.hodEvaluation.h2 || "5",
          h3: data.hodEvaluation.h3 || "5",
          h4: data.hodEvaluation.h4 || "5",
          h5: data.hodEvaluation.h5 || "5",
          h6: data.hodEvaluation.h6 || "5",
          h7: data.hodEvaluation.h7 || "5",
          h8: data.hodEvaluation.h8 || "5",
          h9: data.hodEvaluation.h9 || "5",
          h10: data.hodEvaluation.h10 || "5",
          h11: data.hodEvaluation.h11 || "5",
          h12: data.hodEvaluation.h12 || "5",
          h13: data.hodEvaluation.h13 || "5",
          hpe: data.hodEvaluation.hpe || 85,
          remarks: data.hodEvaluation.remarks || "",
        });
      }
    } catch (err) {
      showNotification(err.message || "Could not load faculty appraisal.", "error");
    }
  }

  async function handleSaveHodEval(isSubmitted = false) {
    if (!selectedStaff) return;
    try {
      await api.saveHodEvaluation({
        username: selectedStaff,
        ...hodForm,
        isSubmitted,
      });
      showNotification(isSubmitted ? "HOD Evaluation submitted successfully!" : "HOD Evaluation saved as draft.", "success");
      loadFacultyList();
    } catch (err) {
      showNotification(err.message || "Failed to save HOD evaluation.", "error");
    }
  }

  async function handleSaveDeptAppraisal(isDraft = true) {
    try {
      const payload = {
        department: session?.department || "CSE",
        formData: deptAppraisal,
        specialSkills: deptAppraisal.specialSkills,
        facultyInfo: { name: session?.name, designation: session?.designation, dept: session?.department },
      };
      const res = isDraft
        ? await api.saveDepartmentAppraisalDraft(payload)
        : await api.submitDepartmentAppraisal(payload);

      setDeptAppraisalResult(res);
      showNotification(
        isDraft
          ? "Department Appraisal saved as draft."
          : `Department Appraisal submitted! Total: ${res.rawTotal}, Normalized Score: ${res.normalizedScore}% (Max: ${res.deptMaxScore})`,
        "success"
      );
      loadDeptAppraisal();
    } catch (err) {
      showNotification(err.message || "Failed to save department appraisal.", "error");
    }
  }

  return (
    <div className="appraisal-tab-content">
      {/* Sub-tab switcher */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          className={`btn-outline-pdf ${subTab === "faculty_eval" ? "btn-primary" : ""}`}
          onClick={() => setSubTab("faculty_eval")}
        >
          <UserCheck size={16} /> Individual Faculty HOD Evaluation
        </button>
        <button
          type="button"
          className={`btn-outline-pdf ${subTab === "dept_appraisal" ? "btn-primary" : ""}`}
          onClick={() => setSubTab("dept_appraisal")}
        >
          <Building size={16} /> Department Appraisal
        </button>
      </div>

      {subTab === "faculty_eval" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" }}>
          {/* Faculty List Sidebar */}
          <div className="card details-card" style={{ padding: "1.25rem" }}>
            <h4 style={{ marginBottom: "1rem" }}>Department Faculty List</h4>
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
                      {f.designation} • {f.self_submitted ? "Self-Appraisal Submitted" : "Self-Appraisal Pending"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Evaluation Detail Form */}
          <div>
            {!selectedStaff && (
              <div className="card details-card" style={{ padding: "2rem", textAlign: "center" }}>
                <p>Select a faculty member from the list to perform HOD Evaluation.</p>
              </div>
            )}

            {selectedStaff && combinedData && (
              <div className="card details-card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.85rem" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>HOD Evaluation for {combinedData.faculty.name}</h3>
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

                {/* HOD Evaluation Fields */}
                <div className="faculty-details-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div className="field-group">
                    <label>H1: Teaching & Pedagogy (1-10)</label>
                    <input type="number" className="input-styled" min="1" max="10" value={hodForm.h1} onChange={(e) => setHodForm({ ...hodForm, h1: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>H2: Course File & LMS Maintenance (1-10)</label>
                    <input type="number" className="input-styled" min="1" max="10" value={hodForm.h2} onChange={(e) => setHodForm({ ...hodForm, h2: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>H3: Academic Results Performance (1-10)</label>
                    <input type="number" className="input-styled" min="1" max="10" value={hodForm.h3} onChange={(e) => setHodForm({ ...hodForm, h3: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>H4: Research & Publications (1-10)</label>
                    <input type="number" className="input-styled" min="1" max="10" value={hodForm.h4} onChange={(e) => setHodForm({ ...hodForm, h4: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>H5: Department Contributions (1-10)</label>
                    <input type="number" className="input-styled" min="1" max="10" value={hodForm.h5} onChange={(e) => setHodForm({ ...hodForm, h5: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>H6: Institutional Committee Roles (1-10)</label>
                    <input type="number" className="input-styled" min="1" max="10" value={hodForm.h6} onChange={(e) => setHodForm({ ...hodForm, h6: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Overall HOD Performance Rating (HPE Score %)</label>
                    <input type="number" className="input-styled" min="0" max="100" value={hodForm.hpe} onChange={(e) => setHodForm({ ...hodForm, hpe: Number(e.target.value) })} />
                  </div>
                  <div className="field-group" style={{ gridColumn: "span 2" }}>
                    <label>HOD Evaluation Remarks / Feedback</label>
                    <textarea className="input-styled" rows={3} value={hodForm.remarks} onChange={(e) => setHodForm({ ...hodForm, remarks: e.target.value })} placeholder="Enter remarks..." />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button type="button" className="btn-outline-pdf" onClick={() => handleSaveHodEval(false)}>
                    <Save size={16} /> Save Draft Evaluation
                  </button>
                  <button type="button" className="btn-primary" onClick={() => handleSaveHodEval(true)}>
                    <Send size={16} /> Submit HOD Evaluation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === "dept_appraisal" && (
        <div className="card details-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Department Performance Appraisal (HOD)</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Enter section totals and special skills for department evaluation. The backend automatically calculates section totals and normalizes score against department division maximum.
          </p>

          {deptAppraisalResult && (
            <div style={{ background: "var(--bg-secondary)", padding: "1rem 1.25rem", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div><strong>Raw Total Score:</strong> {deptAppraisalResult.totalScore || deptAppraisalResult.rawTotal || 0}</div>
                <div><strong>Normalized Score:</strong> {deptAppraisalResult.normalizedScore || 0}%</div>
                <div><strong>Division Max Score:</strong> {deptAppraisalResult.departmentMaxScore || deptAppraisalResult.deptMaxScore || 445}</div>
                <div><strong>Status:</strong> {deptAppraisalResult.isSubmitted ? "Submitted" : "Draft"}</div>
              </div>
            </div>
          )}

          <div className="faculty-details-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div className="field-group">
              <label>Section 1: Academic Excellence (sg1_1)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg1_1} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg1_1: Number(e.target.value) })} />
            </div>
            <div className="field-group">
              <label>Section 1: Curriculum Delivery (sg1_2)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg1_2} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg1_2: Number(e.target.value) })} />
            </div>

            <div className="field-group">
              <label>Section 2: Research Output (sg2_1)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg2_1} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg2_1: Number(e.target.value) })} />
            </div>
            <div className="field-group">
              <label>Section 2: Funded Projects & Grants (sg2_2)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg2_2} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg2_2: Number(e.target.value) })} />
            </div>

            <div className="field-group">
              <label>Section 3: Consultancy & Industry Collaboration (sg3_1)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg3_1} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg3_1: Number(e.target.value) })} />
            </div>
            <div className="field-group">
              <label>Section 3: Patents & Innovations (sg3_2)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg3_2} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg3_2: Number(e.target.value) })} />
            </div>

            <div className="field-group">
              <label>Section 4: Student Achievements & Placements (sg4_1)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg4_1} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg4_1: Number(e.target.value) })} />
            </div>
            <div className="field-group">
              <label>Section 4: Co-curricular Events (sg4_2)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg4_2} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg4_2: Number(e.target.value) })} />
            </div>

            <div className="field-group">
              <label>Section 5: Department Infrastructure (sg5_1)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg5_1} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg5_1: Number(e.target.value) })} />
            </div>
            <div className="field-group">
              <label>Section 5: Lab & Center of Excellence (sg5_2)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg5_2} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg5_2: Number(e.target.value) })} />
            </div>

            <div className="field-group">
              <label>Section 6: Extension & Outreach (sg6_1)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg6_1} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg6_1: Number(e.target.value) })} />
            </div>
            <div className="field-group">
              <label>Section 6: Institutional Branding (sg6_2)</label>
              <input type="number" className="input-styled" value={deptAppraisal.sg6_2} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, sg6_2: Number(e.target.value) })} />
            </div>

            <div className="field-group" style={{ gridColumn: "span 2" }}>
              <label>Special Skills & Department Strengths</label>
              <textarea className="input-styled" rows={3} value={deptAppraisal.specialSkills} onChange={(e) => setDeptAppraisal({ ...deptAppraisal, specialSkills: e.target.value })} placeholder="Enter department special skills or highlights..." />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button type="button" className="btn-outline-pdf" onClick={() => handleSaveDeptAppraisal(true)}>
              <Save size={16} /> Save Draft
            </button>
            <button type="button" className="btn-primary" onClick={() => handleSaveDeptAppraisal(false)}>
              <Send size={16} /> Submit Department Appraisal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
