import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Save, Send } from "lucide-react";
import StaffQuestionCard from "./StaffQuestionCard";
import FacultyDetailsForm, { EMPTY_FACULTY_DETAILS, FACULTY_DETAIL_FIELDS } from "./FacultyDetailsForm";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { roundClean, readDraft, writeDraft, clearDraft } from "../../utils/storage";

function groupQuestions(questions) {
  const sections = [];
  const sectionMap = new Map();

  questions.forEach((q) => {
    const sKey = q.sectionLabel || "A. Self Appraisal";
    const subKey = q.subsectionLabel || "A.1 Self Development";
    const grpKey = q.groupLabel || "A1.1 Knowledge / Skill Development";

    if (!sectionMap.has(sKey)) {
      const section = { label: sKey, subsections: [], _subMap: new Map() };
      sectionMap.set(sKey, section);
      sections.push(section);
    }
    const section = sectionMap.get(sKey);

    if (!section._subMap.has(subKey)) {
      const stableKey = `${q.sectionCode || sKey}__${q.subsectionCode || subKey}`;
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

export default function AppraisalTab({ onSubmitted }) {
  const { showNotification } = useNotification();
  const { session } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [errorQids, setErrorQids] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState(EMPTY_FACULTY_DETAILS);
  const [detailErrorKeys, setDetailErrorKeys] = useState(new Set());
  
  // Keep subsections expanded by default so form looks like PDF on initial view
  const [expandedSubsections, setExpandedSubsections] = useState(new Set());

  function handleDetailChange(key, value) {
    setDetails((prev) => ({ ...prev, [key]: value }));
    setDetailErrorKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  function toggleSubsection(key) {
    setExpandedSubsections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      const data = await api.getQuestions();
      setQuestions(data.questions);
      const initial = {};
      const allSubKeys = new Set();

      data.questions.forEach((q) => {
        initial[q.id] = { optionId: "", evidence: "" };
      });

      // All subcategories start collapsed by default as requested
      setExpandedSubsections(new Set());

      const draft = readDraft(session?.username);
      if (draft) {
        if (draft.answers) {
          Object.keys(initial).forEach((qId) => {
            const saved = draft.answers[qId];
            if (saved) {
              initial[qId] = {
                optionId: saved.optionId ?? "",
                evidence: saved.evidence ?? "",
              };
            }
          });
        }
        setDetails({ ...EMPTY_FACULTY_DETAILS, ...(draft.details || {}) });
      } else {
        setDetails(EMPTY_FACULTY_DETAILS);
      }

      setAnswers(initial);
      setErrorQids(new Set());
      setDetailErrorKeys(new Set());
    } catch (err) {
      showNotification(err.message || "Could not load your appraisal form.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => groupQuestions(questions), [questions]);

  function handleSelectChange(qId, value) {
    setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], optionId: value } }));
    setErrorQids((prev) => {
      const next = new Set(prev);
      next.delete(qId);
      return next;
    });
  }

  function handleEvidenceChange(qId, value) {
    setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], evidence: value } }));
    setErrorQids((prev) => {
      const next = new Set(prev);
      next.delete(qId);
      return next;
    });
  }

  const { total, max } = useMemo(() => {
    let t = 0;
    let m = 0;
    questions.forEach((q) => {
      const maxOptionScore = Math.max(...q.options.map((o) => o.score));
      m += maxOptionScore;
      const answer = answers[q.id];
      if (answer && answer.optionId !== "") {
        const option = q.options.find((o) => String(o.id) === String(answer.optionId));
        if (option) t += option.score;
      }
    });
    return { total: roundClean(t), max: roundClean(m) };
  }, [questions, answers]);

  function saveDraft() {
    if (questions.length === 0) {
      showNotification("There is no form available to save yet.", "error");
      return;
    }
    setSaving(true);
    try {
      writeDraft(session?.username, { details, answers });
      showNotification("Appraisal progress saved successfully.", "success");
    } finally {
      setSaving(false);
    }
  }

  async function submitAppraisal() {
    if (questions.length === 0) {
      showNotification("There is no form available to submit.", "error");
      return;
    }

    let hasError = false;
    const newErrorQids = new Set();
    const payloadAnswers = [];

    questions.forEach((q) => {
      const answer = answers[q.id] || { optionId: "", evidence: "" };
      const evidence = answer.evidence.trim();
      if (answer.optionId === "" || !evidence) {
        newErrorQids.add(q.id);
        hasError = true;
        return;
      }
      payloadAnswers.push({ questionId: q.id, optionId: Number(answer.optionId), evidence });
    });

    const newDetailErrorKeys = new Set();
    FACULTY_DETAIL_FIELDS.forEach((field) => {
      const value = details[field.key];
      if (field.type === "number") {
        if (value === "" || value === null || Number.isNaN(Number(value)) || Number(value) < 0) {
          newDetailErrorKeys.add(field.key);
        }
      } else if (!String(value || "").trim()) {
        newDetailErrorKeys.add(field.key);
      }
    });
    if (newDetailErrorKeys.size > 0) hasError = true;

    if (hasError) {
      setErrorQids(newErrorQids);
      setDetailErrorKeys(newDetailErrorKeys);
      
      // Auto-expand any subcategory that contains missing/incomplete questions
      const errorSubKeys = new Set(expandedSubsections);
      questions.forEach((q) => {
        if (newErrorQids.has(q.id)) {
          const sKey = q.sectionLabel || "A. Self Appraisal";
          const subKey = q.subsectionLabel || "A.1 Self Development";
          errorSubKeys.add(`${q.sectionCode || sKey}__${q.subsectionCode || subKey}`);
        }
      });
      setExpandedSubsections(errorSubKeys);

      showNotification("Please complete your faculty details and answer every question with evidence before submitting.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.submitAppraisal(payloadAnswers, details);
      showNotification("Appraisal submitted successfully!", "success");
      clearDraft(session?.username);
      setDetails(EMPTY_FACULTY_DETAILS);
      setDetailErrorKeys(new Set());
      await loadQuestions();
      if (onSubmitted) onSubmitted();
    } catch (err) {
      showNotification(err.message || "Could not submit your appraisal.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="appraisalTab" className="appraisal-tab-content">
      {loading && <div className="empty-state card">Loading your appraisal form…</div>}

      {!loading && (
        <FacultyDetailsForm details={details} onChange={handleDetailChange} errorKeys={detailErrorKeys} />
      )}

      {!loading &&
        grouped.map((section) => (
          <div key={section.label} className="appraisal-section-block">
            {/* Section Title Banner (#9B527F fill) */}
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
                            const globalIndex = questions.findIndex((item) => item.id === q.id);
                            return (
                              <StaffQuestionCard
                                key={q.id}
                                question={q}
                                index={globalIndex}
                                answer={answers[q.id] || { optionId: "", evidence: "" }}
                                onSelectChange={handleSelectChange}
                                onEvidenceChange={handleEvidenceChange}
                                hasError={errorQids.has(q.id)}
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

      {!loading && questions.length === 0 && (
        <div id="staffEmptyState" className="empty-state card">
          <p>No evaluation form has been published yet for your department and designation.</p>
          <p className="empty-sub">Please check back once the admin publishes the criteria.</p>
        </div>
      )}

      {!loading && questions.length > 0 && (
        <div id="totalBar" className="pdf-total-bar card">
          <div className="total-score-display">
            <span className="total-score-label">Total Score</span>
            <span className="total-score-num">{total}</span>
            <span className="total-score-max">/ {max}</span>
          </div>

          <div className="total-bar-actions">
            <button
              type="button"
              className="btn-outline-pdf"
              onClick={saveDraft}
              disabled={saving || submitting}
            >
              <Save size={16} />
              {saving ? "Saving…" : "Save Draft"}
            </button>
            
            <button
              id="submitAppraisalBtn"
              className="btn-submit-pdf"
              onClick={submitAppraisal}
              disabled={submitting}
            >
              <Send size={16} />
              {submitting ? "Submitting…" : "Submit Appraisal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
