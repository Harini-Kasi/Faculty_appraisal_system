import React from "react";
import { IdCard, User, Building2, GraduationCap } from "lucide-react";
import { designationLabel } from "../utils/storage";

export default function FacultyHeader({ session, activeTab }) {
  const getTitle = () => {
    switch (activeTab) {
      case "history":
        return "Submissions";
      case "submissions":
        return "Submissions Ledger";
      case "performance":
        return "Performance Analysis";
      case "analytics":
        return "Performance Analytics";
      case "hod_eval":
        return "HOD Evaluation";
      case "dept_appraisal":
        return "Department Appraisal";
      case "principal_eval":
        return "Principal Evaluation";
      case "reviewer_eval":
        return "Reviewer Evaluation";
      case "dean_verify":
        return "Dean Verification";
      case "builder":
        return "Question Builder";
      case "faculty_mgmt":
        return "Faculty Management";
      case "appraisal":
      default:
        return "Faculty Appraisal";
    }
  };

  return (
    <div className="faculty-top-section">
      <div className="main-page-header">
        <h1 className="main-page-title">{getTitle()}</h1>
      </div>

      <div className="faculty-info-cards-row">
        <div className="faculty-info-card">
          <div className="info-card-icon-box">
            <IdCard size={20} />
          </div>
          <div className="info-card-content">
            <span className="info-card-label">User ID</span>
            <span className="info-card-value">{session?.username || "CSE001"}</span>
          </div>
        </div>

        <div className="faculty-info-card">
          <div className="info-card-icon-box">
            <User size={20} />
          </div>
          <div className="info-card-content">
            <span className="info-card-label">Name</span>
            <span className="info-card-value">{session?.name || "Dr. Ananya Sharma"}</span>
          </div>
        </div>

        <div className="faculty-info-card">
          <div className="info-card-icon-box">
            <Building2 size={20} />
          </div>
          <div className="info-card-content">
            <span className="info-card-label">Department</span>
            <span className="info-card-value">{session?.department || "CSE"}</span>
          </div>
        </div>

        <div className="faculty-info-card">
          <div className="info-card-icon-box">
            <GraduationCap size={20} />
          </div>
          <div className="info-card-content">
            <span className="info-card-label">Designation</span>
            <span className="info-card-value">
              {session?.designation ? designationLabel(session.designation) : "Associate Professor"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
