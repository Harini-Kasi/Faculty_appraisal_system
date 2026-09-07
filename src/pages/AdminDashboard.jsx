import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import QuestionBuilderTab from "../components/admin/QuestionBuilderTab";
import SubmissionsTab from "../components/admin/SubmissionsTab";
import PerformanceAnalyticsTab from "../components/admin/PerformanceAnalyticsTab";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("builder"); // 'builder' | 'submissions' | 'analytics'
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [submissionsRefreshKey, setSubmissionsRefreshKey] = useState(0);

  function handleTabChange(tab) {
    setActiveView(tab);
    if (tab === "submissions" || tab === "analytics") {
      setSubmissionsRefreshKey((k) => k + 1);
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // clear session even if server call fails
    }
    logout();
    navigate("/");
  }

  const getPageTitle = () => {
    switch (activeView) {
      case "submissions":
        return "Faculty Submissions";
      case "analytics":
        return "Performance Analytics";
      case "builder":
      default:
        return "Question Builder";
    }
  };

  return (
    <div className="pdf-app-layout">
      <Sidebar
        role="admin"
        activeTab={activeView}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        onChangePassword={() => setShowChangePassword(true)}
      />

      <main className="pdf-main-content">
        <div className="main-page-header">
          <h1 className="main-page-title">{getPageTitle()}</h1>
        </div>

        <div className="pdf-tab-body">
          <div className={activeView === "builder" ? "" : "hidden"}>
            <QuestionBuilderTab />
          </div>
          <div className={activeView === "submissions" ? "" : "hidden"}>
            <SubmissionsTab refreshKey={submissionsRefreshKey} />
          </div>
          <div className={activeView === "analytics" ? "" : "hidden"}>
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
