import React from "react";
import { ClipboardList, Clock, TrendingUp, LogOut, KeyRound, ListChecks, BarChart2, Users, UserCheck, ShieldCheck, Award, Building } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar({ role, activeTab, onTabChange, onLogout, onChangePassword }) {
  const { themeColor } = useTheme();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo-badge">
          <img
            src="/exact-logo.png"
            alt="National Engineering College Logo"
            className="sidebar-exact-logo"
          />
        </div>
        <div className="brand-text">
          <h1 className="brand-name">FPA</h1>
          <span className="brand-tagline">Faculty Performance<br />Appraisal System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Admin Navigation */}
        {role === "admin" && (
          <>
            <button
              type="button"
              className={`sidebar-link ${activeTab === "builder" ? "active" : ""}`}
              onClick={() => onTabChange("builder")}
            >
              <ClipboardList className="sidebar-icon" size={18} />
              <span>Question Builder</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "submissions" ? "active" : ""}`}
              onClick={() => onTabChange("submissions")}
            >
              <ListChecks className="sidebar-icon" size={18} />
              <span>Submissions</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "faculty_mgmt" ? "active" : ""}`}
              onClick={() => onTabChange("faculty_mgmt")}
            >
              <Users className="sidebar-icon" size={18} />
              <span>Faculty Management</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => onTabChange("analytics")}
            >
              <BarChart2 className="sidebar-icon" size={18} />
              <span>Performance Analytics</span>
            </button>
          </>
        )}

        {/* HOD Navigation */}
        {role === "hod" && (
          <>
            <button
              type="button"
              className={`sidebar-link ${activeTab === "appraisal" ? "active" : ""}`}
              onClick={() => onTabChange("appraisal")}
            >
              <ClipboardList className="sidebar-icon" size={18} />
              <span>Self Appraisal</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "hod_eval" ? "active" : ""}`}
              onClick={() => onTabChange("hod_eval")}
            >
              <UserCheck className="sidebar-icon" size={18} />
              <span>HOD Evaluation</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "dept_appraisal" ? "active" : ""}`}
              onClick={() => onTabChange("dept_appraisal")}
            >
              <Building className="sidebar-icon" size={18} />
              <span>Department Appraisal</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "history" ? "active" : ""}`}
              onClick={() => onTabChange("history")}
            >
              <Clock className="sidebar-icon" size={18} />
              <span>Submissions</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => onTabChange("performance")}
            >
              <TrendingUp className="sidebar-icon" size={18} />
              <span>Performance Analysis</span>
            </button>
          </>
        )}

        {/* Principal Navigation */}
        {role === "principal" && (
          <>
            <button
              type="button"
              className={`sidebar-link ${activeTab === "principal_eval" ? "active" : ""}`}
              onClick={() => onTabChange("principal_eval")}
            >
              <Award className="sidebar-icon" size={18} />
              <span>Principal Evaluation</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "submissions" ? "active" : ""}`}
              onClick={() => onTabChange("submissions")}
            >
              <ListChecks className="sidebar-icon" size={18} />
              <span>Submissions Ledger</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => onTabChange("analytics")}
            >
              <BarChart2 className="sidebar-icon" size={18} />
              <span>Performance Analytics</span>
            </button>
          </>
        )}

        {/* Reviewer / RAdmin Navigation */}
        {role === "radmin" && (
          <>
            <button
              type="button"
              className={`sidebar-link ${activeTab === "reviewer_eval" ? "active" : ""}`}
              onClick={() => onTabChange("reviewer_eval")}
            >
              <Award className="sidebar-icon" size={18} />
              <span>Reviewer Evaluation</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "submissions" ? "active" : ""}`}
              onClick={() => onTabChange("submissions")}
            >
              <ListChecks className="sidebar-icon" size={18} />
              <span>Submissions Ledger</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => onTabChange("analytics")}
            >
              <BarChart2 className="sidebar-icon" size={18} />
              <span>Performance Analytics</span>
            </button>
          </>
        )}

        {/* Dean / VAdmin Navigation */}
        {role === "vadmin" && (
          <>
            <button
              type="button"
              className={`sidebar-link ${activeTab === "dean_verify" ? "active" : ""}`}
              onClick={() => onTabChange("dean_verify")}
            >
              <ShieldCheck className="sidebar-icon" size={18} />
              <span>Dean Verification</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "submissions" ? "active" : ""}`}
              onClick={() => onTabChange("submissions")}
            >
              <ListChecks className="sidebar-icon" size={18} />
              <span>Submissions Ledger</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => onTabChange("analytics")}
            >
              <BarChart2 className="sidebar-icon" size={18} />
              <span>Performance Analytics</span>
            </button>
          </>
        )}

        {/* Faculty Navigation */}
        {(!role || role === "faculty") && (
          <>
            <button
              type="button"
              className={`sidebar-link ${activeTab === "appraisal" ? "active" : ""}`}
              onClick={() => onTabChange("appraisal")}
            >
              <ClipboardList className="sidebar-icon" size={18} />
              <span>Faculty Appraisal</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "history" ? "active" : ""}`}
              onClick={() => onTabChange("history")}
            >
              <Clock className="sidebar-icon" size={18} />
              <span>Submissions</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => onTabChange("performance")}
            >
              <TrendingUp className="sidebar-icon" size={18} />
              <span>Performance Analysis</span>
            </button>
          </>
        )}

        <div className="sidebar-divider" />

        <button
          type="button"
          className="sidebar-link"
          onClick={onChangePassword}
        >
          <KeyRound className="sidebar-icon" size={18} />
          <span>Change Password</span>
        </button>

        <button
          type="button"
          className="sidebar-link"
          onClick={onLogout}
        >
          <LogOut className="sidebar-icon" size={18} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
