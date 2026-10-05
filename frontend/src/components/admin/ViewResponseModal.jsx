import React from "react";
import { X, FileDown, User, Building2, GraduationCap, Calendar, Award, CheckCircle2 } from "lucide-react";
import { designationLabel } from "../../utils/storage";
import { generateSubmissionReport } from "../../utils/pdfReport";

export default function ViewResponseModal({ submission, onClose }) {
  if (!submission) return null;

  const dateStr = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleString()
    : "Recently submitted";

  const handleDownloadPDF = () => {
    generateSubmissionReport(submission);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="response-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="response-modal-header">
          <div className="header-left">
            <div className="modal-avatar">
              <User size={24} />
            </div>
            <div>
              <h2 className="modal-staff-name">{submission.staffName}</h2>
              <div className="modal-staff-meta">
                <span>{submission.username}</span> • <span>{submission.department}</span> • <span>{designationLabel(submission.designation)}</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="modal-score-badge">
              <Award size={18} />
              <span>Score: {submission.totalScore} / {submission.maxScore}</span>
            </div>
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="response-modal-body">
          {/* Submission Timestamp & Overview */}
          <div className="modal-meta-bar card">
            <div className="meta-bar-item">
              <Calendar size={16} />
              <span>Submitted on: {dateStr}</span>
            </div>
            <div className="meta-bar-item">
              <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
              <span>Status: Verified & Submitted</span>
            </div>
          </div>

          {/* Faculty Details Section */}
          {submission.details && (
            <div className="modal-section card">
              <h3 className="modal-section-title">Faculty Details</h3>
              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Area of Specialization</span>
                  <span className="modal-detail-val">{submission.details.areaOfSpecialization || "—"}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Tutorship</span>
                  <span className="modal-detail-val">{submission.details.tutorship || "—"}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Teaching Experience</span>
                  <span className="modal-detail-val">{submission.details.teachingExperience ? `${submission.details.teachingExperience} Years` : "—"}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Industry Experience</span>
                  <span className="modal-detail-val">{submission.details.industryExperience ? `${submission.details.industryExperience} Years` : "—"}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Courses Taught (Odd Sem)</span>
                  <span className="modal-detail-val">{submission.details.coursesTaughtOdd || "—"}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Courses Taught (Even Sem)</span>
                  <span className="modal-detail-val">{submission.details.coursesTaughtEven || "—"}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">UG Projects Guided</span>
                  <span className="modal-detail-val">{submission.details.ugProjectsGuided ?? "—"}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">PG Projects Guided</span>
                  <span className="modal-detail-val">{submission.details.pgProjectsGuided ?? "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Appraisal Questions & Responses */}
          <div className="modal-section card">
            <h3 className="modal-section-title">Submitted Evaluation Responses</h3>
            <div className="modal-questions-list">
              {submission.answers && submission.answers.length > 0 ? (
                submission.answers.map((ans, i) => (
                  <div key={i} className="response-question-card">
                    <div className="rq-header">
                      <span className="rq-index">Q{String(i + 1).padStart(2, "0")}</span>
                      <p className="rq-text">{ans.questionText}</p>
                    </div>

                    <div className="rq-body-grid">
                      <div className="rq-field">
                        <span className="rq-field-label">Selected Rating:</span>
                        <span className="rq-rating-badge">{ans.selectedOption || "—"}</span>
                      </div>

                      <div className="rq-field">
                        <span className="rq-field-label">Score Awarded:</span>
                        <span className="rq-score-badge">{ans.questionScore ?? ans.optionScore ?? 0}</span>
                      </div>
                    </div>

                    <div className="rq-evidence-box">
                      <span className="rq-evidence-label">Supporting Evidence:</span>
                      <p className="rq-evidence-text">{ans.evidence ? `"${ans.evidence}"` : "No evidence provided."}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data-msg">No response answers available for this submission.</p>
              )}
            </div>
          </div>
        </div>

        <footer className="response-modal-footer">
          <button type="button" className="btn-outline-pdf" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-submit-pdf" onClick={handleDownloadPDF}>
            <FileDown size={16} />
            Download PDF Report
          </button>
        </footer>
      </div>
    </div>
  );
}
