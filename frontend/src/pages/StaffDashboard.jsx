import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import FacultyHeader from "../components/FacultyHeader";
import AppraisalTab from "../components/staff/AppraisalTab";
import HistoryTab from "../components/staff/HistoryTab";
import PerformanceTab from "../components/staff/PerformanceTab";
import SubmissionsTab from "../components/admin/SubmissionsTab";
import PerformanceAnalyticsTab from "../components/admin/PerformanceAnalyticsTab";

import HodEvaluationTab from "../components/evaluations/HodEvaluationTab";
import DepartmentAppraisalTab from "../components/evaluations/DepartmentAppraisalTab";
import PrincipalEvaluationTab from "../components/evaluations/PrincipalEvaluationTab";
import ReviewerEvaluationTab from "../components/evaluations/ReviewerEvaluationTab";
import DeanVerificationTab from "../components/evaluations/DeanVerificationTab";

import ChangePasswordModal from "../components/ChangePasswordModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../utils/api";

export default function StaffDashboard() {
  const { session, logout } = useAuth();
  const { loadUserTheme, resetTheme } = useTheme();
  const navigate = useNavigate();

  const userRole = session?.role || "faculty";
  const defaultTab =
    userRole === "hod"
      ? "hod_eval"
      : userRole === "principal"
      ? "principal_eval"
      : userRole === "radmin"
      ? "reviewer_eval"
      : userRole === "vadmin"
      ? "dean_verify"
      : "appraisal";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (session?.username) {
      loadUserTheme(session.username);
    }
  }, [session?.username, loadUserTheme]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [userRole, defaultTab]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "history" || tab === "submissions" || tab === "performance" || tab === "analytics") {
      setHistoryRefreshKey((k) => k + 1);
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // clear local session even if server call fails
    }
    logout();
    resetTheme();
    navigate("/");
  }

  function handleSubmitted() {
    setHistoryRefreshKey((k) => k + 1);
  }

  return (
    <div className="pdf-app-layout">
      <Sidebar
        role={userRole}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        onChangePassword={() => setShowChangePassword(true)}
      />

      <main className="pdf-main-content">
        <FacultyHeader session={session} activeTab={activeTab} />

        <div className="pdf-tab-body">
          {/* Faculty / HOD Self Appraisal Tab */}
          <div className={activeTab === "appraisal" ? "" : "hidden"}>
            <AppraisalTab onSubmitted={handleSubmitted} />
          </div>

          {/* HOD Evaluation Tab */}
          <div className={activeTab === "hod_eval" ? "" : "hidden"}>
            <HodEvaluationTab />
          </div>

          {/* Department Appraisal Tab */}
          <div className={activeTab === "dept_appraisal" ? "" : "hidden"}>
            <DepartmentAppraisalTab />
          </div>

          {/* Principal Evaluation Tab */}
          <div className={activeTab === "principal_eval" ? "" : "hidden"}>
            <PrincipalEvaluationTab />
          </div>

          {/* Reviewer / RAdmin Evaluation Tab */}
          <div className={activeTab === "reviewer_eval" ? "" : "hidden"}>
            <ReviewerEvaluationTab />
          </div>

          {/* Dean / VAdmin Verification Tab */}
          <div className={activeTab === "dean_verify" ? "" : "hidden"}>
            <DeanVerificationTab />
          </div>

          {/* History / Submissions Tab */}
          <div className={activeTab === "history" ? "" : "hidden"}>
            <HistoryTab refreshKey={historyRefreshKey} />
          </div>

          <div className={activeTab === "submissions" ? "" : "hidden"}>
            <SubmissionsTab refreshKey={historyRefreshKey} />
          </div>

          {/* Performance Analysis Tab */}
          <div className={activeTab === "performance" ? "" : "hidden"}>
            <PerformanceTab />
          </div>

          <div className={activeTab === "analytics" ? "" : "hidden"}>
            <PerformanceAnalyticsTab />
          </div>
        </div>
      </main>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
