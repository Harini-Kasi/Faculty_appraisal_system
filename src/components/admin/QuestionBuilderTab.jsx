import { useRef, useState } from "react";
import { Plus, Save, Download, FileEdit } from "lucide-react";
import QuestionCard from "./QuestionCard";
import { QUESTION_BUILDER_DEPARTMENTS, DESIGNATIONS } from "../../utils/constants";
import { designationLabel } from "../../utils/storage";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../utils/api";

export default function QuestionBuilderTab() {
  const { showNotification } = useNotification();

  const [builderDept, setBuilderDept] = useState(QUESTION_BUILDER_DEPARTMENTS[0].value);
  const [builderDesig, setBuilderDesig] = useState(DESIGNATIONS[0].value);
  const [builderQuestions, setBuilderQuestions] = useState([]);
  const [builderStatus, setBuilderStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const questionIdCounter = useRef(-1);

  async function loadBuilderForm() {
    setLoading(true);
    try {
      const existing = await api.getAdminQuestions(builderDept, builderDesig);
      const loaded = existing.map((q) => ({ ...q, options: q.options.map((o) => ({ ...o })) }));
      setBuilderQuestions(loaded);
      setBuilderStatus(
        loaded.length
          ? `Loaded ${loaded.length} question(s) for ${builderDept} / ${designationLabel(builderDesig)}.`
          : `No form saved yet for ${builderDept} / ${designationLabel(builderDesig)}. Start adding questions.`
      );
    } catch (err) {
      showNotification(err.message || "Could not load questions.", "error");
    } finally {
      setLoading(false);
    }
  }

  function addQuestionCard() {
    setBuilderQuestions((prev) => [
      ...prev,
      {
        id: questionIdCounter.current--,
        sectionLabel: "",
        subsectionLabel: "",
        groupLabel: "",
        text: "",
        weightage: 1,
        options: [],
      },
    ]);
  }

  function updateQuestionText(qId, value) {
    setBuilderQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, text: value } : q)));
  }

  function updateHierarchy(qId, field, value) {
    setBuilderQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, [field]: value } : q)));
  }

  function updateQuestionWeightage(qId, value) {
    const parsed = parseFloat(value) || 0;
    setBuilderQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, weightage: parsed } : q)));
  }

  function addOptionToQuestion(qId) {
    setBuilderQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, options: [...q.options, { text: "", score: 0 }] } : q))
    );
  }

  function deleteOptionFromQuestion(qId, optIndex) {
    const q = builderQuestions.find((item) => item.id === qId);
    if (!q) return;
    if (q.options.length <= 2) {
      showNotification("Each question needs at least 2 options.", "error");
      return;
    }
    setBuilderQuestions((prev) =>
      prev.map((item) =>
        item.id === qId ? { ...item, options: item.options.filter((_, i) => i !== optIndex) } : item
      )
    );
  }

  function updateOptionText(qId, optIndex, value) {
    setBuilderQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((opt, i) => (i === optIndex ? { ...opt, text: value } : opt)) }
          : q
      )
    );
  }

  function updateOptionScore(qId, optIndex, value) {
    const parsed = parseFloat(value) || 0;
    setBuilderQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((opt, i) => (i === optIndex ? { ...opt, score: parsed } : opt)) }
          : q
      )
    );
  }

  function deleteQuestion(qId) {
    setBuilderQuestions((prev) => prev.filter((item) => item.id !== qId));
  }

  function moveQuestion(qId, direction) {
    setBuilderQuestions((prev) => {
      const index = prev.findIndex((item) => item.id === qId);
      const swapWith = index + direction;
      if (index === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  }

  async function saveBuilderForm() {
    if (builderQuestions.length === 0) {
      showNotification("Add at least one question before saving.", "error");
      return;
    }

    for (let i = 0; i < builderQuestions.length; i++) {
      const q = builderQuestions[i];
      if (!q.text.trim()) {
        showNotification(`Question ${i + 1} is missing its question text.`, "error");
        return;
      }
      if (!q.weightage || q.weightage <= 0) {
        showNotification(`Question ${i + 1} needs a weightage greater than 0.`, "error");
        return;
      }
      if (q.options.length < 2) {
        showNotification(`Question ${i + 1} needs at least 2 answer options.`, "error");
        return;
      }
      if (q.options.some((opt) => !opt.text.trim())) {
        showNotification(`Question ${i + 1} needs every option label filled in.`, "error");
        return;
      }
    }

    setSaving(true);
    try {
      await api.saveAdminQuestions(builderDept, builderDesig, builderQuestions);
      setBuilderStatus(`Saved ${builderQuestions.length} question(s) for ${builderDept} / ${designationLabel(builderDesig)}.`);
      showNotification("Form saved successfully.", "success");
      loadBuilderForm();
    } catch (err) {
      showNotification(err.message || "Could not save the form.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div id="builderTab" className="appraisal-tab-content">
      <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "1.25rem", marginTop: "-0.5rem" }}>
        Design evaluation criteria for a specific department and designation.
      </p>

      <div className="card details-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.75rem" }}>
        <div className="faculty-details-grid" style={{ gridTemplateColumns: "1fr 1fr auto", alignItems: "flex-end", gap: "1rem" }}>
          <div className="field-group">
            <label>Department</label>
            <select
              className="input-styled"
              value={builderDept}
              onChange={(e) => setBuilderDept(e.target.value)}
            >
              {QUESTION_BUILDER_DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Designation</label>
            <select
              className="input-styled"
              value={builderDesig}
              onChange={(e) => setBuilderDesig(e.target.value)}
            >
              {DESIGNATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn-submit-pdf"
            style={{ height: "42px", padding: "0 1.25rem" }}
            onClick={loadBuilderForm}
            disabled={loading}
          >
            <Download size={16} />
            {loading ? "Loading…" : "Load Form"}
          </button>
        </div>

        {builderStatus && (
          <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>
            {builderStatus}
          </div>
        )}
      </div>

      <div id="questionList" className="question-list-grid">
        {builderQuestions.length === 0 ? (
          <div
            className="empty-state card"
            style={{
              padding: "3rem 2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileEdit size={44} style={{ color: "var(--primary)", marginBottom: "0.85rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.4rem" }}>
              No Questions Added Yet
            </h3>
            <p className="empty-sub" style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: 0 }}>
              Select a Department and Designation above, then click <strong>"+ Add Question"</strong> to start building the evaluation form.
            </p>
          </div>
        ) : (
          builderQuestions.map((q, index) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={index}
              isFirst={index === 0}
              isLast={index === builderQuestions.length - 1}
              onTextChange={updateQuestionText}
              onHierarchyChange={updateHierarchy}
              onWeightageChange={updateQuestionWeightage}
              onOptionTextChange={updateOptionText}
              onOptionScoreChange={updateOptionScore}
              onAddOption={addOptionToQuestion}
              onDeleteOption={deleteOptionFromQuestion}
              onDeleteQuestion={deleteQuestion}
              onMoveQuestion={moveQuestion}
            />
          ))
        )}
      </div>

      <div className="builder-actions" style={{ display: "flex", gap: "1rem", marginTop: "1.75rem" }}>
        <button type="button" className="btn-outline-pdf" onClick={addQuestionCard}>
          <Plus size={16} />
          Add Question
        </button>
        <button type="button" className="btn-submit-pdf" onClick={saveBuilderForm} disabled={saving}>
          <Save size={16} />
          {saving ? "Saving…" : "Save Form"}
        </button>
      </div>
    </div>
  );
}
