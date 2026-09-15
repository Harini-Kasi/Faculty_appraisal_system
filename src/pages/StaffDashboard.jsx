import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import FacultyHeader from "../components/FacultyHeader";
import AppraisalTab from "../components/staff/AppraisalTab";
import HistoryTab from "../components/staff/HistoryTab";
import PerformanceTab from "../components/staff/PerformanceTab";
import ThemeSettingsTab from "../components/ThemeSettingsTab";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../utils/api";

export default function StaffDashboard() {
  const { session, logout } = useAuth();
  const { loadUserTheme, resetTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appraisal");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (session?.username) {
      loadUserTheme(session.username);
    }
  }, [session?.username, loadUserTheme]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "history" || tab === "performance") {
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
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        onChangePassword={() => setShowChangePassword(true)}
      />

      <main className="pdf-main-content">
        <FacultyHeader session={session} activeTab={activeTab} />

        <div className="pdf-tab-body">
          <div className={activeTab === "appraisal" ? "" : "hidden"}>
            <AppraisalTab onSubmitted={handleSubmitted} />
          </div>
          <div className={activeTab === "history" ? "" : "hidden"}>
            <HistoryTab refreshKey={historyRefreshKey} />
          </div>
          <div className={activeTab === "performance" ? "" : "hidden"}>
            <PerformanceTab />
          </div>
          <div className={activeTab === "settings" ? "" : "hidden"}>
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
