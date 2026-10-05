import React from "react";
import { Trash2 } from "lucide-react";

export default function OptionRow({ option, index, onTextChange, onScoreChange, onDelete }) {
  const optionLetter = (i) => String.fromCharCode(65 + i);

  return (
    <div className="option-row" style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
      <span className="rq-index" style={{ width: "28px", textAlign: "center" }}>{optionLetter(index)}</span>
      <input
        type="text"
        className="input-styled"
        style={{ flex: 1 }}
        placeholder={`Option ${optionLetter(index)} description`}
        value={option.text}
        onChange={(e) => onTextChange(index, e.target.value)}
      />
      <input
        type="number"
        className="input-styled"
        style={{ width: "100px" }}
        placeholder="Score"
        value={option.score}
        onChange={(e) => onScoreChange(index, e.target.value)}
      />
      <button
        type="button"
        className="btn-outline-pdf"
        style={{ padding: "0.5rem 0.6rem", color: "var(--error)", borderColor: "var(--border-strong)" }}
        title="Delete option"
        onClick={() => onDelete(index)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
