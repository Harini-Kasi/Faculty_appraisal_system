import React, { useState } from "react";
import { Eye, FileDown, User, Calendar, Award } from "lucide-react";
import { designationLabel } from "../utils/storage";
import { generateSubmissionReport } from "../utils/pdfReport";
import { useNotification } from "../context/NotificationContext";
import ViewResponseModal from "./admin/ViewResponseModal";

export default function SubmissionCard({ submission, hideWeightage = false, showReportButton = true }) {
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { showNotification } = useNotification();
  
  const dateStr = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  function handleGenerateReport(event) {
    event.stopPropagation();
    setGenerating(true);
    try {
      generateSubmissionReport(submission);
    } catch (err) {
      showNotification(err.message || "Could not generate the PDF report.", "error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <div className="pdf-submission-card card">
        <div className="sub-card-left">
          <div className="sub-avatar">
            <User size={22} />
          </div>
          <div className="sub-info">
            <div className="sub-name-row">
              <h3 className="sub-staff-name">{submission.staffName}</h3>
              <span className="sub-dept-badge">{submission.department}</span>
            </div>
            <div className="sub-meta-row">
              <span className="sub-meta-item">{submission.username}</span>
              <span className="sub-bullet">•</span>
              <span className="sub-meta-item">{designationLabel(submission.designation)}</span>
              <span className="sub-bullet">•</span>
              <span className="sub-meta-item">
                <Calendar size={13} style={{ marginRight: 4, display: "inline" }} />
                {dateStr}
              </span>
            </div>
          </div>
        </div>

        <div className="sub-card-right">
          <div className="sub-score-badge">
            <Award size={16} />
            <span className="sub-score-num">{submission.totalScore}</span>
            <span className="sub-score-max">/ {submission.maxScore}</span>
          </div>

          <div className="sub-actions-row">
            <button
              type="button"
              className="btn-view-response"
              onClick={() => setShowModal(true)}
              title="View complete submitted appraisal response"
            >
              <Eye size={16} />
              View Response
            </button>

            {showReportButton && (
              <button
                type="button"
                className="btn-download-report"
                onClick={handleGenerateReport}
                disabled={generating}
                title={`Generate PDF report for ${submission.staffName}`}
              >
                <FileDown size={16} />
                {generating ? "Generating…" : "PDF Report"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ViewResponseModal submission={submission} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
