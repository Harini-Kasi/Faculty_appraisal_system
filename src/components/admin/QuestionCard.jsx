import React from "react";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import OptionRow from "./OptionRow";

export default function QuestionCard({
  question,
  index,
  isFirst,
  isLast,
  onTextChange,
  onWeightageChange,
  onHierarchyChange,
  onOptionTextChange,
  onOptionScoreChange,
  onAddOption,
  onDeleteOption,
  onDeleteQuestion,
  onMoveQuestion,
}) {
  return (
    <div className="pdf-question-card card" data-id={question.id} style={{ marginBottom: "1.25rem" }}>
      <div className="question-card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span className="rq-index">Question #{String(index + 1).padStart(2, "0")}</span>
        <div className="question-card-head-actions" style={{ display: "flex", gap: "0.4rem" }}>
          <button
            type="button"
            className="btn-outline-pdf"
            style={{ padding: "0.35rem 0.6rem" }}
            title="Move up"
            disabled={isFirst}
            onClick={() => onMoveQuestion(question.id, -1)}
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            className="btn-outline-pdf"
            style={{ padding: "0.35rem 0.6rem" }}
            title="Move down"
            disabled={isLast}
            onClick={() => onMoveQuestion(question.id, 1)}
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            className="btn-outline-pdf"
            style={{ padding: "0.35rem 0.75rem", color: "var(--error)", borderColor: "var(--border-strong)" }}
            onClick={() => onDeleteQuestion(question.id)}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="faculty-details-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div className="field-group">
          <label>Section (e.g. "A. Self Appraisal")</label>
          <input
            type="text"
            className="input-styled"
            value={question.sectionLabel || ""}
            onChange={(e) => onHierarchyChange(question.id, "sectionLabel", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Subsection (e.g. "A.1 Self Development")</label>
          <input
            type="text"
            className="input-styled"
            value={question.subsectionLabel || ""}
            onChange={(e) => onHierarchyChange(question.id, "subsectionLabel", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Group (e.g. "A1.1 Knowledge / Skill Development")</label>
          <input
            type="text"
            className="input-styled"
            value={question.groupLabel || ""}
            onChange={(e) => onHierarchyChange(question.id, "groupLabel", e.target.value)}
          />
        </div>
      </div>

      <div className="field-group" style={{ marginBottom: "1rem" }}>
        <label>Question Text</label>
        <textarea
          className="input-styled"
          rows={2}
          placeholder="Enter the evaluation question criteria..."
          value={question.text}
          onChange={(e) => onTextChange(question.id, e.target.value)}
        />
      </div>

      <div className="field-group" style={{ maxWidth: "200px", marginBottom: "1.25rem" }}>
        <label>Weightage</label>
        <input
          type="number"
          className="input-styled"
          min="0"
          step="0.5"
          value={question.weightage}
          onChange={(e) => onWeightageChange(question.id, e.target.value)}
        />
      </div>

      <div className="field-group">
        <label>Answer Options &amp; Awarded Scores</label>
        <div className="options-list" style={{ display: "flex", flexDirection: "column", gap: "0.6rem", margin: "0.5rem 0" }}>
          {question.options.length === 0 ? (
            <p className="no-options-msg" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", italic: "true" }}>
              No options defined yet — click "+ Add Option" below.
            </p>
          ) : (
            question.options.map((opt, i) => (
              <OptionRow
                key={i}
                option={opt}
                index={i}
                onTextChange={(idx, val) => onOptionTextChange(question.id, idx, val)}
                onScoreChange={(idx, val) => onOptionScoreChange(question.id, idx, val)}
                onDelete={(idx) => onDeleteOption(question.id, idx)}
              />
            ))
          )}
        </div>
        <button
          type="button"
          className="btn-outline-pdf"
          style={{ width: "fit-content", marginTop: "0.4rem" }}
          onClick={() => onAddOption(question.id)}
        >
          <Plus size={14} />
          Add Option
        </button>
      </div>
    </div>
  );
}
