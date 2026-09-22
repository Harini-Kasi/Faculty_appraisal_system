import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ThemeSelectionPage from "./pages/ThemeSelectionPage";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Notification from "./components/Notification";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ThemeProvider>
          <HashRouter>
            <Notification />
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/theme-selection"
                element={
                  <ProtectedRoute>
                    <ThemeSelectionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute role="faculty">
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </HashRouter>
        </ThemeProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
