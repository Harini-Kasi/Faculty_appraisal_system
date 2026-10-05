import React, { useState, useEffect } from "react";
import { UserCheck, Save, Send, Building, Award, CheckCircle, FileText } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import DepartmentAppraisalTab from "./DepartmentAppraisalTab";

export default function HodEvaluationTab({ activeTab }) {
  const { showNotification } = useNotification();
  const { session } = useAuth();
  const [subTab, setSubTab] = useState(activeTab === "dept_appraisal" ? "dept_appraisal" : "faculty_eval");

  useEffect(() => {
    if (activeTab === "dept_appraisal") {
      setSubTab("dept_appraisal");
    } else if (activeTab === "hod_eval") {
      setSubTab("faculty_eval");
    }
  }, [activeTab]);

  const [facultyList, setFacultyList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evalLoading, setEvalLoading] = useState(false);

  // Dynamic HOD Question Bank evaluation state
  const [templateData, setTemplateData] = useState(null); // { templateCode, faculty, questions, maxPossibleScore, savedEvaluation }
  const [answersMap, setAnswersMap] = useState({}); // { [qId]: { selectedOptionId, score, evidence } }
  const [remarks, setRemarks] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Department Appraisal State
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
      const dept = session?.department || "CSE";
      const data = await api.getDepartmentAppraisal(dept);
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
    setEvalLoading(true);
    try {
      const res = await api.getHodQuestionsForFaculty(staffId);
      setTemplateData(res);

      // Populate saved evaluation state if available
      const initialMap = {};
      if (res.savedEvaluation && Array.isArray(res.savedEvaluation.answers)) {
        res.savedEvaluation.answers.forEach((ans) => {
          if (ans.questionId) {
            initialMap[ans.questionId] = {
              selectedOptionId: ans.selectedOptionId || "",
              score: ans.score !== undefined ? ans.score : 0,
              evidence: ans.evidence || "",
            };
          }
        });
        setRemarks(res.savedEvaluation.remarks || "");
        setIsSubmitted(Boolean(res.savedEvaluation.isSubmitted));
      } else {
        // Default select first option or empty for each question
        (res.questions || []).forEach((q) => {
          initialMap[q.id] = {
            selectedOptionId: q.options[0]?.id || "",
            score: q.options[0]?.score || 0,
            evidence: "",
          };
        });
        setRemarks("");
        setIsSubmitted(false);
      }
      setAnswersMap(initialMap);
    } catch (err) {
      showNotification(err.message || "Could not load HOD questions for faculty.", "error");
    } finally {
      setEvalLoading(false);
    }
  }

  function handleOptionChange(questionId, selectedOptId, options) {
    const chosenOpt = options.find((opt) => String(opt.id) === String(selectedOptId));
    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: Number(selectedOptId),
        score: chosenOpt ? Number(chosenOpt.score) : 0,
      },
    }));
  }

  function handleEvidenceChange(questionId, evidenceText) {
    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        evidence: evidenceText,
      },
    }));
  }

  // Real-time calculation of total HPE score
  function calculateCurrentHpe() {
    if (!templateData || !templateData.questions) return { rawScore: 0, maxScore: 0, percentage: 0 };
    let rawScore = 0;
    let maxScore = 0;

    templateData.questions.forEach((q) => {
      const w = Number(q.weightage || 1);
      const maxOptScore = q.options.reduce((max, opt) => Math.max(max, opt.score), 0) || 5;
      maxScore += maxOptScore * w;

      const ans = answersMap[q.id];
      if (ans && ans.selectedOptionId) {
        const opt = q.options.find((o) => String(o.id) === String(ans.selectedOptionId));
        if (opt) {
          rawScore += Number(opt.score) * w;
        }
      }
    });

    const percentage = maxScore > 0 ? (rawScore / maxScore) * 100 : 0;
    return {
      rawScore: Number(rawScore.toFixed(2)),
      maxScore: Number(maxScore.toFixed(2)),
      percentage: Number(percentage.toFixed(2)),
    };
  }

  async function handleSaveHodEval(submitMode = false) {
    if (!selectedStaff || !templateData) return;
    try {
      const answersArray = Object.entries(answersMap).map(([qId, val]) => ({
        questionId: Number(qId),
        selectedOptionId: Number(val.selectedOptionId),
        score: Number(val.score),
        evidence: val.evidence || "",
      }));

      const payload = {
        username: selectedStaff,
        answers: answersArray,
        remarks,
        isSubmitted: submitMode,
      };

      const res = await api.saveHodEvaluation(payload);
      setIsSubmitted(submitMode);
      showNotification(
        submitMode
          ? `HOD Evaluation submitted! Score: ${res.hpeRawScore} (${res.hpePercentage}%)`
          : "HOD Evaluation saved as draft.",
        "success"
      );
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

  const hpeCalc = calculateCurrentHpe();

  return (
    <div className="appraisal-tab-content">
      {/* Sub-tab Switcher */}
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

          {/* Dynamic HOD Evaluation Form */}
          <div>
            {!selectedStaff && (
              <div className="card details-card" style={{ padding: "2rem", textAlign: "center" }}>
                <p>Select a faculty member from the list to perform HOD Evaluation.</p>
              </div>
            )}

            {selectedStaff && evalLoading && (
              <div className="card details-card" style={{ padding: "2rem", textAlign: "center" }}>
                <p>Loading evaluation template questions for {selectedStaff}…</p>
              </div>
            )}

            {selectedStaff && !evalLoading && templateData && (
              <div className="card details-card" style={{ padding: "1.5rem" }}>
                {/* Header Info Banner */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.25rem",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "0.85rem",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>HOD Evaluation for {templateData.faculty.name}</h3>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {templateData.faculty.department} | {templateData.faculty.designation} | Staff ID: {templateData.faculty.username}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                      }}
                    >
                      Template: {templateData.templateCode}
                    </span>
                    {isSubmitted && (
                      <span
                        style={{
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#10b981",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "12px",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <CheckCircle size={14} /> Submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Bank Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
                  {templateData.questions.map((q, idx) => {
                    const ans = answersMap[q.id] || {};
                    const selectedOpt = q.options.find((o) => String(o.id) === String(ans.selectedOptionId));
                    const itemScore = selectedOpt ? selectedOpt.score * q.weightage : 0;

                    return (
                      <div
                        key={q.id}
                        style={{
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "10px",
                          padding: "1.25rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--primary-color)" }}>
                            Q{idx + 1}. {q.text}
                          </span>
                          <span style={{ fontSize: "0.8rem", opacity: 0.8, fontWeight: "600" }}>
                            Weightage: {q.weightage}x | Score: {itemScore.toFixed(1)} / {(5 * q.weightage).toFixed(1)}
                          </span>
                        </div>

                        {/* Options Select */}
                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.25rem", display: "block" }}>
                            Rating / Option:
                          </label>
                          <select
                            className="input-styled"
                            value={ans.selectedOptionId || ""}
                            disabled={isSubmitted}
                            onChange={(e) => handleOptionChange(q.id, e.target.value, q.options)}
                            style={{ width: "100%" }}
                          >
                            <option value="">-- Select Rating Option --</option>
                            {q.options.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.text} (Score: {opt.score})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Evidence Box */}
                        <div>
                          <label style={{ fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.25rem", display: "block" }}>
                            Evidence / Remarks (Max 350 chars):
                          </label>
                          <input
                            type="text"
                            className="input-styled"
                            maxLength={350}
                            placeholder="Enter supporting details or evidence..."
                            value={ans.evidence || ""}
                            disabled={isSubmitted}
                            onChange={(e) => handleEvidenceChange(q.id, e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Score Summary Box & Remarks */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "1.25rem",
                    marginBottom: "1.5rem",
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <label style={{ fontWeight: "700", marginBottom: "0.5rem", display: "block" }}>
                      Overall HOD Assessment Remarks
                    </label>
                    <textarea
                      className="input-styled"
                      rows={3}
                      placeholder="Enter overall performance comments..."
                      value={remarks}
                      disabled={isSubmitted}
                      onChange={(e) => setRemarks(e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "10px",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.8 }}>
                      Total HPE Score
                    </span>
                    <span style={{ fontSize: "2rem", fontWeight: "800", color: "var(--primary-color)", margin: "0.25rem 0" }}>
                      {hpeCalc.rawScore} / {hpeCalc.maxScore}
                    </span>
                    <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                      HPE Rating: {hpeCalc.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn-outline-pdf"
                    onClick={() => handleSaveHodEval(false)}
                    disabled={isSubmitted}
                  >
                    <Save size={16} /> Save Draft
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleSaveHodEval(true)}
                    disabled={isSubmitted}
                  >
                    <Send size={16} /> Submit HOD Evaluation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === "dept_appraisal" && <DepartmentAppraisalTab />}
    </div>
  );
}
