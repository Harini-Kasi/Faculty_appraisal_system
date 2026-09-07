import React from "react";

export default function StaffQuestionCard({ question, index, answer, onSelectChange, onEvidenceChange, hasError }) {
  const selectedOption = question.options.find((o) => String(o.id) === String(answer.optionId));
  const selectedScore = selectedOption ? String(selectedOption.score) : "0";
  const maxScore = Math.max(...question.options.map((o) => o.score), 0);

  return (
    <div className={`pdf-question-card ${hasError ? "has-error" : ""}`} data-qid={question.id}>
      <h5 className="question-title">
        {index + 1}. {question.text}
      </h5>

      <div className="question-controls-row">
        <div className="question-col rating-col">
          <label className="col-label">Performance Rating</label>
          <select
            className="input-styled pdf-select"
            value={answer.optionId}
            onChange={(e) => onSelectChange(question.id, e.target.value)}
          >
            <option value="" disabled>
              Select Rating
            </option>
            {question.options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.text}
              </option>
            ))}
          </select>
        </div>

        <div className="question-col score-col">
          <label className="col-label">Score (Max: {maxScore})</label>
          <div className="score-value-box">
            <span>{selectedScore}</span>
          </div>
        </div>

        <div className="question-col evidence-col">
          <label className="col-label">Evidence Details</label>
          <input
            type="text"
            className="input-styled pdf-evidence-input"
            placeholder="Enter evidence details here..."
            value={answer.evidence}
            onChange={(e) => onEvidenceChange(question.id, e.target.value)}
          />
        </div>
      </div>

      {hasError && (
        <div className="field-error-msg">Please select a rating and provide evidence details.</div>
      )}
    </div>
  );
}
