import { HashRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
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
