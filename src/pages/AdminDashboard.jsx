import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import QuestionBuilderTab from "../components/admin/QuestionBuilderTab";
import SubmissionsTab from "../components/admin/SubmissionsTab";
import PerformanceAnalyticsTab from "../components/admin/PerformanceAnalyticsTab";
import ThemeSettingsTab from "../components/ThemeSettingsTab";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../utils/api";

export default function AdminDashboard() {
  const { session, logout } = useAuth();
  const { loadUserTheme, resetTheme } = useTheme();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("builder"); // 'builder' | 'submissions' | 'analytics' | 'settings'
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [submissionsRefreshKey, setSubmissionsRefreshKey] = useState(0);

  useEffect(() => {
    if (session?.username) {
      loadUserTheme(session.username);
    }
  }, [session?.username, loadUserTheme]);

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
    resetTheme();
    navigate("/");
  }

  const getPageTitle = () => {
    switch (activeView) {
      case "submissions":
        return "Faculty Submissions";
      case "analytics":
        return "Performance Analytics";
      case "settings":
        return "Theme Settings";
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
          <div className={activeView === "settings" ? "" : "hidden"}>
            <ThemeSettingsTab />
          </div>
        </div>
      </main>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
