import React from "react";
import { ClipboardList, Clock, TrendingUp, LogOut, KeyRound, ListChecks, BarChart2 } from "lucide-react";

export default function Sidebar({ role, activeTab, onTabChange, onLogout, onChangePassword }) {
  const isAdmin = role === "admin";

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <img
          src="/exact-logo.png"
          alt="Faculty Performance Appraisal System Logo"
          className="sidebar-exact-logo"
        />
        <div className="brand-text">
          <h1 className="brand-name">FPA</h1>
          <span className="brand-tagline">Faculty Performance<br />Appraisal System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
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
              className={`sidebar-link ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => onTabChange("analytics")}
            >
              <BarChart2 className="sidebar-icon" size={18} />
              <span>Performance Analytics</span>
            </button>
          </>
        ) : (
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
