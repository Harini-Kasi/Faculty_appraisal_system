import React, { useState, useEffect, useMemo } from "react";
import { ShieldCheck, CheckCircle2, Save, FileText, ArrowLeft, X, ChevronDown, ChevronUp } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import StaffQuestionCard from "../staff/StaffQuestionCard";
import FacultyDetailsForm, { EMPTY_FACULTY_DETAILS } from "../staff/FacultyDetailsForm";

function groupQuestions(questions) {
  const sections = [];
  const sectionMap = new Map();

  (questions || []).forEach((q) => {
    const sKey = q.sectionLabel || q.section_label || (q.sectionCode ? `Section ${q.sectionCode}` : "Section A");
    const subKey = q.subsectionLabel || q.subsection_label || (q.subsectionCode ? `Subsection ${q.subsectionCode}` : "General");
    const grpKey = q.groupLabel || q.group_label || (q.groupCode ? `Group ${q.groupCode}` : "");

    if (!sectionMap.has(sKey)) {
      const section = { label: sKey, subsections: [], _subMap: new Map() };
      sectionMap.set(sKey, section);
      sections.push(section);
    }
    const section = sectionMap.get(sKey);

    if (!section._subMap.has(subKey)) {
      const stableKey = `${q.sectionCode || q.section_code || sKey}__${q.subsectionCode || q.subsection_code || subKey}`;
      const subsection = { label: subKey, key: stableKey, groups: [], _grpMap: new Map() };
      section._subMap.set(subKey, subsection);
      section.subsections.push(subsection);
    }
    const subsection = section._subMap.get(subKey);

    if (!subsection._grpMap.has(grpKey)) {
      const group = { label: grpKey, questions: [] };
      subsection._grpMap.set(grpKey, group);
      subsection.groups.push(group);
    }
    subsection._grpMap.get(grpKey).questions.push(q);
  });

  return sections;
}

export default function DeanVerificationTab() {
  const { showNotification } = useNotification();
  const { session } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [facultyList, setFacultyList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingResponses, setSavingResponses] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [appraisalData, setAppraisalData] = useState(null);
  const [details, setDetails] = useState(EMPTY_FACULTY_DETAILS);
  const [answers, setAnswers] = useState({});
  const [verificationRemarks, setVerificationRemarks] = useState("");
  const [expandedSubsections, setExpandedSubsections] = useState(new Set());

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      loadFacultyList(selectedDept);
    }
  }, [selectedDept]);

  async function loadDepartments() {
    try {
      const depts = await api.getDepartments();
      if (Array.isArray(depts) && depts.length > 0) {
        setDepartments(depts);
        const firstCode = depts[0].code || depts[0].short_code || depts[0].name;
        if (!depts.some((d) => (d.code || d.short_code) === selectedDept)) {
          setSelectedDept(firstCode);
        }
      } else {
        setDepartments([
          { code: "CSE", name: "Computer Science & Engineering" },
          { code: "ECE", name: "Electronics & Communication Engineering" },
          { code: "EEE", name: "Electrical & Electronics Engineering" },
          { code: "Mechanical", name: "Mechanical Engineering" },
          { code: "Civil", name: "Civil Engineering" },
          { code: "S&H", name: "Science & Humanities" },
        ]);
      }
    } catch (err) {
      setDepartments([
        { code: "CSE", name: "Computer Science & Engineering" },
        { code: "ECE", name: "Electronics & Communication Engineering" },
        { code: "EEE", name: "Electrical & Electronics Engineering" },
        { code: "Mechanical", name: "Mechanical Engineering" },
        { code: "Civil", name: "Civil Engineering" },
        { code: "S&H", name: "Science & Humanities" },
      ]);
    }
  }

  async function loadFacultyList(dept) {
    setLoadingList(true);
    try {
      const data = await api.getDeanFacultyList(dept);
      setFacultyList(Array.isArray(data) ? data : []);
      setSelectedStaff(null);
      setAppraisalData(null);
      setAnswers({});
      setDetails(EMPTY_FACULTY_DETAILS);
    } catch (err) {
      showNotification(err.message || "Failed to load faculty list.", "error");
    } finally {
      setLoadingList(false);
    }
  }

  async function handleSelectFaculty(username) {
    setSelectedStaff(username);
    setLoadingDetails(true);
    try {
      const data = await api.getVadminAppraisalDetails(username);
      setAppraisalData(data);
      setVerificationRemarks(data.verificationRemarks || "");

      // Populate protected faculty academic details
      if (data.academicDetails) {
        setDetails({
          areaOfSpecialization: data.academicDetails.areaOfSpecialization || "",
          teachingExperience: data.academicDetails.teachingExperience || 0,
          industryExperience: data.academicDetails.industryExperience || 0,
          coursesTaughtOdd: data.academicDetails.coursesTaughtOdd || "",
          coursesTaughtEven: data.academicDetails.coursesTaughtEven || "",
          ugProjectsGuided: data.academicDetails.ugProjectsGuided || 0,
          pgProjectsGuided: data.academicDetails.pgProjectsGuided || 0,
          tutorship: data.academicDetails.tutorship || "",
          achievements: data.academicDetails.achievements || "",
        });
      } else {
        setDetails(EMPTY_FACULTY_DETAILS);
      }

      // Initialize answers map from submission
      const initialAnswers = {};
      const subKeysToExpand = new Set();

      if (data.submission && Array.isArray(data.submission.answers)) {
        data.submission.answers.forEach((ans) => {
          let optId = ans.optionId;
          // If optionId is missing, match by option text
          if (!optId && ans.questionId && Array.isArray(data.questions)) {
            const q = data.questions.find((qItem) => qItem.id === ans.questionId);
            if (q && Array.isArray(q.options)) {
              const matchedOpt = q.options.find((o) => o.text === ans.selectedOption);
              if (matchedOpt) optId = matchedOpt.id;
            }
          }

          initialAnswers[ans.questionId] = {
            questionId: ans.questionId,
            optionId: optId ? String(optId) : "",
            evidence: ans.evidence || "",
          };
        });
      }

      // Expand all subsections by default so questions are visible
      if (Array.isArray(data.questions)) {
        data.questions.forEach((q) => {
          const sKey = q.sectionLabel || q.section_label || (q.sectionCode ? `Section ${q.sectionCode}` : "Section A");
          const subKey = q.subsectionLabel || q.subsection_label || (q.subsectionCode ? `Subsection ${q.subsectionCode}` : "General");
          subKeysToExpand.add(`${q.sectionCode || q.section_code || sKey}__${q.subsectionCode || q.subsection_code || subKey}`);
        });
      }

      setAnswers(initialAnswers);
      setExpandedSubsections(subKeysToExpand);
    } catch (err) {
      showNotification(err.message || "Could not load faculty appraisal details.", "error");
    } finally {
      setLoadingDetails(false);
    }
  }

  function toggleSubsection(key) {
    setExpandedSubsections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleOptionChange(questionId, optionId) {
    if (appraisalData?.isVerified) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        optionId,
      },
    }));
  }

  function handleEvidenceChange(questionId, evidence) {
    if (appraisalData?.isVerified) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        evidence,
      },
    }));
  }

  // Compute live real-time dynamic total score and max score for UI feedback
  const { liveTotalScore, liveMaxScore } = useMemo(() => {
    if (!appraisalData || !Array.isArray(appraisalData.questions)) {
      return { liveTotalScore: 0, liveMaxScore: 0 };
    }
    let totalScore = 0;
    let maxScore = 0;

    appraisalData.questions.forEach((q) => {
      const maxOptScore = q.options?.length ? Math.max(...q.options.map((o) => o.score), 0) : 0;
      maxScore += maxOptScore * (q.weightage || 1);

      const userAns = answers[q.id];
      if (userAns && userAns.optionId) {
        const selectedOpt = q.options?.find((o) => String(o.id) === String(userAns.optionId));
        if (selectedOpt) {
          totalScore += selectedOpt.score * (q.weightage || 1);
        }
      }
    });

    return {
      liveTotalScore: Math.round(totalScore * 100) / 100,
      liveMaxScore: Math.round(maxScore * 100) / 100,
    };
  }, [appraisalData, answers]);

  const grouped = useMemo(() => groupQuestions(appraisalData?.questions || []), [appraisalData?.questions]);

  async function handleSaveChanges() {
    if (!selectedStaff || appraisalData?.isVerified) return;
    setSavingResponses(true);
    try {
      const formattedAnswers = Object.values(answers);
      await api.saveVadminAppraisalResponses(selectedStaff, formattedAnswers);
      showNotification("Appraisal responses saved and score recalculated.", "success");
      // Reload details to sync server state
      await handleSelectFaculty(selectedStaff);
    } catch (err) {
      showNotification(err.message || "Failed to save response modifications.", "error");
    } finally {
      setSavingResponses(false);
    }
  }

  async function handleConfirmVerify() {
    if (!selectedStaff || appraisalData?.isVerified) return;
    setVerifying(true);
    try {
      const formattedAnswers = Object.values(answers);
      await api.verifyAppraisal(selectedStaff, verificationRemarks, formattedAnswers);
      showNotification(`Faculty appraisal for ${appraisalData?.faculty?.name} successfully verified!`, "success");
      setShowVerifyModal(false);
      // Refresh list & current faculty details
      await loadFacultyList(selectedDept);
      await handleSelectFaculty(selectedStaff);
    } catch (err) {
      showNotification(err.message || "Failed to verify appraisal.", "error");
    } finally {
      setVerifying(false);
    }
  }

  const acad = appraisalData?.academicDetails || details || {};
  const isVerified = Boolean(appraisalData?.isVerified);

  // Helper to find current selected department object or code
  const currentDeptObj = departments.find((d) => (d.code || d.short_code) === selectedDept || d.name === selectedDept);
  const currentDeptCode = currentDeptObj?.code || currentDeptObj?.short_code || selectedDept;
  const currentDeptName = currentDeptObj?.name || selectedDept;

  // Verifier display string matching user reference (e.g. Dr.Prasanna Venkateshan, Asso. Prof/ECE)
  const verifierDisplayName = session
    ? `${session.name || session.username}${session.designation ? `, ${session.designation}` : ""}${session.department ? `/${session.department}` : ""}`
    : "Dean / VAdmin";

  return (
    <div className="appraisal-tab-content" style={{ paddingBottom: "2rem" }}>
      {/* Department Selector Card */}
      <div className="card details-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontWeight: "600", fontSize: "0.95rem" }}>Select Department:</label>
          <select
            className="input-styled"
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedStaff(null);
            }}
            style={{ width: "280px" }}
          >
            {departments.map((d) => {
              const code = d.code || d.short_code || d.name;
              return (
                <option key={d.id || code} value={code}>
                  {d.name} {d.code ? `(${d.code})` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* VIEW 1: FACULTY LIST TABLE */}
      {!selectedStaff && (
        <div className="card details-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "700" }}>
              Faculty List - {currentDeptCode}
            </h2>
          </div>

          {loadingList && (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
              Loading faculty members...
            </div>
          )}

          {!loadingList && facultyList.length === 0 && (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <FileText size={40} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
              <p style={{ margin: 0 }}>No faculty members found in {currentDeptName} ({currentDeptCode}).</p>
            </div>
          )}

          {!loadingList && facultyList.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="pdf-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>USERNAME</th>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>NAME</th>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>DESIGNATION</th>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>STATUS</th>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyList.map((f) => {
                    const verified = f.is_verified === 1 || f.verification_status === "VERIFIED";
                    const isSubmitted = Boolean(f.self_submitted);

                    return (
                      <tr key={f.username} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "1rem", fontWeight: "600" }}>{f.username}</td>
                        <td style={{ padding: "1rem", fontWeight: "600" }}>{f.name}</td>
                        <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{f.designation}</td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          {verified ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#10b981",
                                padding: "0.25rem 0.65rem",
                                borderRadius: "12px",
                                fontSize: "0.78rem",
                                fontWeight: "700",
                              }}
                            >
                              <CheckCircle2 size={14} /> VERIFIED
                            </span>
                          ) : isSubmitted ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                background: "rgba(245, 158, 11, 0.15)",
                                color: "#d97706",
                                padding: "0.25rem 0.65rem",
                                borderRadius: "12px",
                                fontSize: "0.78rem",
                                fontWeight: "600",
                              }}
                            >
                              Submitted (Pending)
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "rgba(107, 114, 128, 0.12)",
                                color: "var(--text-secondary)",
                                padding: "0.25rem 0.65rem",
                                borderRadius: "12px",
                                fontSize: "0.78rem",
                              }}
                            >
                              Not Submitted
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <button
                            type="button"
                            disabled={!isSubmitted && !verified}
                            title={!isSubmitted && !verified ? "Faculty has not submitted self-appraisal yet" : ""}
                            style={{
                              background: verified ? "#10b981" : isSubmitted ? "#3b82f6" : "var(--bg-secondary)",
                              color: verified || isSubmitted ? "#ffffff" : "var(--text-secondary)",
                              border: "none",
                              padding: "0.45rem 1.1rem",
                              borderRadius: "6px",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                              cursor: isSubmitted || verified ? "pointer" : "not-allowed",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              opacity: !isSubmitted && !verified ? 0.6 : 1,
                              transition: "all 0.15s ease",
                              boxShadow: verified ? "0 2px 6px rgba(16, 185, 129, 0.25)" : isSubmitted ? "0 2px 6px rgba(59, 130, 246, 0.3)" : "none",
                            }}
                            onClick={() => (isSubmitted || verified) && handleSelectFaculty(f.username)}
                          >
                            {verified ? (
                              <>
                                <CheckCircle2 size={15} /> Verified
                              </>
                            ) : isSubmitted ? (
                              "Verify"
                            ) : (
                              "Not Submitted"
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SELECTED FACULTY INSPECTION & EDITABLE APPRAISAL */}
      {selectedStaff && (
        <div>
          {/* Back Navigation & Status Bar */}
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              className="btn-outline-pdf"
              onClick={() => {
                setSelectedStaff(null);
                setAppraisalData(null);
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
            >
              <ArrowLeft size={16} /> Back to Faculty List
            </button>

            {isVerified && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "#10b981",
                  color: "#ffffff",
                  padding: "0.4rem 1.1rem",
                  borderRadius: "20px",
                  fontWeight: "700",
                  fontSize: "0.88rem",
                }}
              >
                <CheckCircle2 size={16} /> VERIFIED BY {appraisalData?.verifiedBy || verifierDisplayName}
              </span>
            )}
          </div>

          {loadingDetails && (
            <div className="card details-card" style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)" }}>Loading faculty appraisal details...</p>
            </div>
          )}

          {!loadingDetails && appraisalData && (
            <div id="appraisalTab" className="appraisal-tab-content">
              {/* 1. PROTECTED FIRST SECTION (FACULTY INFORMATION - READ ONLY) */}
              <FacultyDetailsForm
                details={details}
                onChange={() => {}} // Read-Only: No changes permitted
                disabled={true}
                readOnly={true}
                facultyInfo={appraisalData.faculty}
                department={appraisalData.faculty?.department}
              />

              {/* 2. APPRAISAL SECTIONS & QUESTION HIERARCHY */}
              {grouped.map((section) => (
                <div key={section.label} className="appraisal-section-block">
                  {/* Section Title Banner */}
                  <div className="section-banner">
                    <h3 className="section-banner-title">{section.label || "A. Self Appraisal"}</h3>
                  </div>

                  {section.subsections.map((subsection) => {
                    const isExpanded = expandedSubsections.has(subsection.key);
                    return (
                      <div key={subsection.key} className="appraisal-subsection-block">
                        {/* Accordion header */}
                        <button
                          type="button"
                          className="subsection-accordion-btn"
                          onClick={() => toggleSubsection(subsection.key)}
                          aria-expanded={isExpanded}
                        >
                          <span className="subsection-accordion-title">{subsection.label || "A.1 Self Development"}</span>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {isExpanded &&
                          subsection.groups.map((group) => (
                            <div key={group.label} className="appraisal-group-block">
                              {group.label && <h4 className="group-heading-title">{group.label}</h4>}
                              <div className="question-list-grid">
                                {group.questions.map((q) => {
                                  const globalIndex = appraisalData.questions.findIndex((item) => item.id === q.id);
                                  return (
                                    <StaffQuestionCard
                                      key={q.id}
                                      question={q}
                                      index={globalIndex}
                                      answer={answers[q.id] || { optionId: "", evidence: "" }}
                                      onSelectChange={handleOptionChange}
                                      onEvidenceChange={handleEvidenceChange}
                                      disabled={isVerified}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* 3. ADDITIONAL ACHIEVEMENTS CARD */}
              <div className="card details-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 0.85rem 0", fontSize: "1.05rem", fontWeight: "700" }}>Additional Achievements</h4>
                <textarea
                  className="input-styled"
                  rows={4}
                  value={acad.achievements || "No additional achievements reported."}
                  disabled
                  readOnly
                  style={{ width: "100%", background: "var(--bg-secondary)", resize: "none" }}
                />
              </div>

              {/* 4. REMARKS CARD */}
              <div className="card details-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 0.85rem 0", fontSize: "1.05rem", fontWeight: "700" }}>Remarks</h4>
                <textarea
                  className="input-styled"
                  rows={3}
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                  disabled={isVerified}
                  readOnly={isVerified}
                  placeholder="Enter your remarks here..."
                  style={{ width: "100%" }}
                />
              </div>

              {/* 5. VERIFIED BY CARD */}
              <div className="card details-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 0.85rem 0", fontSize: "1.05rem", fontWeight: "700" }}>Verified By</h4>
                <input
                  type="text"
                  className="input-styled"
                  value={isVerified ? (appraisalData?.verifiedBy || verifierDisplayName) : verifierDisplayName}
                  disabled
                  readOnly
                  style={{ width: "100%" }}
                />
              </div>

              {/* 6. ACADEMIC PERFORMANCE INDEX (API) & VERIFY NOW BAR */}
              <div
                className="card details-card"
                style={{
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  justify: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  background: "rgba(99, 102, 241, 0.06)",
                  border: "1px solid var(--border-color)",
                  marginBottom: "1.5rem",
                  borderRadius: "12px",
                }}
              >
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary-color)" }}>
                  Academic Performance Index (API): {liveTotalScore.toFixed(2)}
                </div>

                <div>
                  {!isVerified ? (
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <button
                        type="button"
                        className="btn-outline-pdf"
                        onClick={handleSaveChanges}
                        disabled={savingResponses || verifying}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                      >
                        <Save size={16} /> {savingResponses ? "Saving…" : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setShowVerifyModal(true)}
                        disabled={verifying}
                        style={{
                          background: "#10b981",
                          borderColor: "#10b981",
                          padding: "0.6rem 1.5rem",
                          fontSize: "0.95rem",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        <ShieldCheck size={18} /> Verify Now
                      </button>
                    </div>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        background: "#10b981",
                        color: "#ffffff",
                        padding: "0.55rem 1.25rem",
                        borderRadius: "20px",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                      }}
                    >
                      <CheckCircle2 size={18} /> VERIFIED
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VERIFICATION CONFIRMATION MODAL */}
      {showVerifyModal && (
        <div className="modal-backdrop" onClick={() => setShowVerifyModal(false)}>
          <div className="card" style={{ width: "100%", maxWidth: "520px", padding: "1.75rem", borderRadius: "12px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={22} style={{ color: "var(--primary-color)" }} />
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>Verify Appraisal Confirmation</h3>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
                onClick={() => setShowVerifyModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "1.25rem", fontSize: "0.95rem", lineHeight: "1.5" }}>
              <p style={{ margin: "0 0 0.75rem 0" }}>
                Are you sure you want to verify the appraisal for <strong>{appraisalData?.faculty?.name}</strong>?
              </p>
              <div style={{ padding: "0.75rem", background: "rgba(245, 158, 11, 0.1)", borderLeft: "4px solid #f59e0b", borderRadius: "4px", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                <strong>Important:</strong> Once verified, further modifications to the faculty's appraisal responses will be permanently locked.
              </div>
            </div>

            <div className="field-group" style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>VAdmin Audit Remarks & Notes (Optional)</label>
              <textarea
                className="input-styled"
                rows={3}
                value={verificationRemarks}
                onChange={(e) => setVerificationRemarks(e.target.value)}
                placeholder="Enter any audit verification notes or comments..."
                style={{ width: "100%", marginTop: "0.35rem" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-outline-pdf"
                onClick={() => setShowVerifyModal(false)}
                disabled={verifying}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirmVerify}
                disabled={verifying}
                style={{ background: "#10b981", borderColor: "#10b981", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <ShieldCheck size={18} /> {verifying ? "Verifying..." : "Confirm & Verify Appraisal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
