import fs from "fs";

const fieldsCode = fs.readFileSync("d:\\Faculty_Appraisal_System_FPA\\fpa-react\\backend\\scripts\\extracted_fields.js", "utf-8");
const sectionsCode = fs.readFileSync("d:\\Faculty_Appraisal_System_FPA\\fpa-react\\backend\\scripts\\extracted_sections.js", "utf-8");

const tabComponentContent = `import React, { useState, useEffect } from "react";
import { ChevronDown, Save, Send, Award, CheckCircle } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";

const DIVISION_SCORES = {
  CSE: 445,
  IT: 430,
  ECE: 450,
  EEE: 445,
  MECH: 430,
  CIVIL: 425,
  AIDS: 415,
  SH: 270,
  "S&H": 270,
};

${fieldsCode}

${sectionsCode}

export default function DepartmentAppraisalTab() {
  const { showNotification } = useNotification();
  const { session } = useAuth();

  const deptCode = session?.department || "CSE";
  const [formData, setFormData] = useState({});
  const [specialSkills, setSpecialSkills] = useState("");
  const [expanded, setExpanded] = useState({ sg1: true, sg2: false, sg3: false, sg4: false, sg5: false, sg6: false });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [deptResult, setDeptResult] = useState(null);

  useEffect(() => {
    loadDeptAppraisal();
  }, [session?.department]);

  async function loadDeptAppraisal() {
    setLoading(true);
    try {
      const data = await api.getDepartmentAppraisal(deptCode);
      if (data) {
        setDeptResult(data);
        setIsSubmitted(Boolean(data.isSubmitted));
        if (data.specialSkills) setSpecialSkills(data.specialSkills);
        if (data.formData && typeof data.formData === "object") {
          setFormData(data.formData);
        }
      }
    } catch (err) {
      console.error("Error loading department appraisal:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(secId) {
    setExpanded((prev) => ({ ...prev, [secId]: !prev[secId] }));
  }

  function updateRowField(fieldKey, property, value) {
    setFormData((prev) => {
      const existing = prev[fieldKey] || { target: "", achievement: "", rating: null, score: 0, evidence: "" };
      const updated = { ...existing, [property]: value };
      return { ...prev, [fieldKey]: updated };
    });
  }

  function handleRatingChange(fieldKey, fieldRatings, selectedLabel) {
    const chosenRating = fieldRatings.find((r) => r.label === selectedLabel);
    const scoreVal = chosenRating ? chosenRating.score : 0;

    setFormData((prev) => {
      const existing = prev[fieldKey] || { target: "", achievement: "", rating: null, score: 0, evidence: "" };
      return {
        ...prev,
        [fieldKey]: {
          ...existing,
          rating: chosenRating || null,
          score: scoreVal,
        },
      };
    });
  }

  // Calculate Raw Total & Normalized Final Score
  const rawTotalScore = React.useMemo(() => {
    let sum = 0;
    Object.values(formData).forEach((val) => {
      if (val && val.score) {
        sum += Number(val.score) || 0;
      }
    });
    return sum;
  }, [formData]);

  const maxDivisionScore = DIVISION_SCORES[deptCode] || DIVISION_SCORES[session?.department] || 445;
  const normalizedScore = maxDivisionScore > 0 ? Number(((rawTotalScore / maxDivisionScore) * 100).toFixed(2)) : 0;

  async function handleSave(submitMode = false) {
    setLoading(true);
    try {
      const payload = {
        department: deptCode,
        formData,
        specialSkills,
        facultyInfo: {
          name: session?.name || "HOD",
          dept: deptCode,
          designation: session?.designation || "HOD",
        },
      };

      const res = submitMode
        ? await api.submitDepartmentAppraisal(payload)
        : await api.saveDepartmentAppraisalDraft(payload);

      setDeptResult(res);
      setIsSubmitted(submitMode);
      showNotification(
        submitMode
          ? \`Department Appraisal submitted successfully! Score: \${normalizedScore}%\`
          : "Department Appraisal saved as draft.",
        "success"
      );
    } catch (err) {
      showNotification(err.message || "Failed to save department appraisal.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="appraisal-tab-content">
      {/* Top Header Card */}
      <div className="card details-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.75, display: "block", marginBottom: "0.35rem" }}>
              NAME
            </label>
            <input
              type="text"
              className="input-styled"
              value={session?.name || "Dr. Gomathi V"}
              readOnly
              style={{ width: "100%", background: "var(--bg-secondary)", fontWeight: "600" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.75, display: "block", marginBottom: "0.35rem" }}>
              DEPARTMENT
            </label>
            <input
              type="text"
              className="input-styled"
              value={deptCode}
              readOnly
              style={{ width: "100%", background: "var(--bg-secondary)", fontWeight: "600" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.75, display: "block", marginBottom: "0.35rem" }}>
              DESIGNATION
            </label>
            <input
              type="text"
              className="input-styled"
              value={session?.designation || "Professor / HOD"}
              readOnly
              style={{ width: "100%", background: "var(--bg-secondary)", fontWeight: "600" }}
            />
          </div>
        </div>
      </div>

      {/* Main Accordion Collapsible Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {SECTIONS.map((section) => {
          const isExp = Boolean(expanded[section.id]);
          return (
            <div
              key={section.id}
              className="card details-card"
              style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-color)" }}
            >
              {/* Accordion Header Card */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                style={{
                  width: "100%",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--bg-secondary)",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  textAlign: "left",
                }}
              >
                <span>{section.title}</span>
                <ChevronDown
                  size={20}
                  style={{
                    transition: "transform 0.2s ease",
                    transform: isExp ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Accordion Body */}
              {isExp && (
                <div style={{ padding: "1.25rem", background: "var(--bg-card)" }}>
                  {section.subsections.map((subsection, sIdx) => (
                    <div key={sIdx} style={{ marginBottom: "1.5rem" }}>
                      <h4
                        style={{
                          margin: "0 0 0.85rem 0",
                          paddingBottom: "0.4rem",
                          borderBottom: "1px solid var(--border-color)",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          color: "var(--primary-color)",
                        }}
                      >
                        {subsection.title}
                      </h4>

                      {/* Header Row Labels */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2.5fr 1fr 1fr 1.5fr 0.8fr 2fr",
                          gap: "0.75rem",
                          alignItems: "center",
                          padding: "0.5rem 0.75rem",
                          background: "var(--bg-secondary)",
                          borderRadius: "6px",
                          marginBottom: "0.5rem",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          opacity: 0.85,
                        }}
                      >
                        <div>Criterion / Item</div>
                        <div>Target</div>
                        <div>Achievement</div>
                        <div>Rating</div>
                        <div>Score</div>
                        <div>Evidence</div>
                      </div>

                      {/* Item Field Rows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {subsection.fields.map((field) => {
                          const row = formData[field.key] || { target: "", achievement: "", rating: null, score: 0, evidence: "" };
                          return (
                            <div
                              key={field.key}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2.5fr 1fr 1fr 1.5fr 0.8fr 2fr",
                                gap: "0.75rem",
                                alignItems: "center",
                                padding: "0.5rem 0.75rem",
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                              }}
                            >
                              <div style={{ fontWeight: "600", fontSize: "0.85rem" }}>{field.name}</div>

                              {/* Target */}
                              <input
                                type="number"
                                className="input-styled"
                                placeholder="Target"
                                value={row.target || ""}
                                disabled={isSubmitted}
                                onChange={(e) => updateRowField(field.key, "target", e.target.value)}
                                style={{ width: "100%", padding: "0.4rem 0.6rem" }}
                              />

                              {/* Achievement */}
                              <input
                                type="number"
                                className="input-styled"
                                placeholder="Achievement"
                                value={row.achievement || ""}
                                disabled={isSubmitted}
                                onChange={(e) => updateRowField(field.key, "achievement", e.target.value)}
                                style={{ width: "100%", padding: "0.4rem 0.6rem" }}
                              />

                              {/* Rating Select */}
                              <select
                                className="input-styled"
                                value={row.rating?.label || ""}
                                disabled={isSubmitted || field.disableRating}
                                onChange={(e) => handleRatingChange(field.key, field.ratings, e.target.value)}
                                style={{ width: "100%", padding: "0.4rem 0.6rem" }}
                              >
                                <option value="">Select Rating</option>
                                {field.ratings.map((r, rIdx) => (
                                  <option key={rIdx} value={r.label}>
                                    {r.label} ({r.score})
                                  </option>
                                ))}
                              </select>

                              {/* Readonly Score */}
                              <input
                                type="number"
                                className="input-styled"
                                placeholder="Score"
                                value={row.score !== undefined ? row.score : ""}
                                readOnly
                                style={{ width: "100%", padding: "0.4rem 0.6rem", background: "var(--bg-card)", fontWeight: "700", textAlign: "center" }}
                              />

                              {/* Evidence Box - EMPTY BY DEFAULT */}
                              <input
                                type="text"
                                className="input-styled"
                                placeholder="Evidence (max 350)"
                                maxLength={350}
                                value={row.evidence || ""}
                                disabled={isSubmitted}
                                onChange={(e) => updateRowField(field.key, "evidence", e.target.value)}
                                style={{ width: "100%", padding: "0.4rem 0.6rem" }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Special Achievements & Total Score Card */}
      <div
        className="card details-card"
        style={{
          padding: "1.5rem",
          marginBottom: "1.5rem",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
        }}
      >
        <div>
          <label style={{ fontWeight: "700", fontSize: "0.95rem", textTransform: "uppercase", marginBottom: "0.5rem", display: "block" }}>
            SPECIAL ACHIEVEMENTS / REWARDS / AWARDS
          </label>
          <textarea
            className="input-styled"
            rows={4}
            maxLength={500}
            placeholder="Please provide details with evidences..."
            value={specialSkills}
            disabled={isSubmitted}
            onChange={(e) => setSpecialSkills(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.8 }}>
            TOTAL SCORE
          </span>
          <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary-color)", margin: "0.35rem 0" }}>
            {normalizedScore}
          </span>
          <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Raw Score: {rawTotalScore} / Division Max: {maxDivisionScore}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn-outline-pdf"
          onClick={() => handleSave(false)}
          disabled={loading || isSubmitted}
        >
          <Save size={16} /> Save Draft
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => handleSave(true)}
          disabled={loading || isSubmitted}
        >
          <Send size={16} /> Preview & Submit
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync("d:\\Faculty_Appraisal_System_FPA\\fpa-react\\frontend\\src\\components\\evaluations\\DepartmentAppraisalTab.jsx", tabComponentContent);
console.log("DepartmentAppraisalTab.jsx successfully generated!");
