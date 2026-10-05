import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { api } from "../utils/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { resetTheme, loadUserTheme } = useTheme();
  const { showNotification } = useNotification();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Enforce standard default brand color (#1D95AD) on Login Page
  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  async function handleSubmit(e) {
    e.preventDefault();

    const uname = username.trim();
    const newErrors = {};

    if (!uname) newErrors.username = true;
    if (!password) newErrors.password = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification(
        "Please enter both username and password.",
        "error"
      );
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // The server authenticates credentials and returns token & user details
      const { token, role, user } = await api.login(uname, password);

      login(token, { role, ...user });
      showNotification(`Welcome, ${user.name}.`, "success");

      // Navigate directly to dashboard for role
      const targetPath = role === "admin" ? "/admin" : "/staff";
      navigate(targetPath);
    } catch (err) {
      setErrors({ password: true });
      showNotification(
        err.message || "Invalid username or password.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="loginPage" className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">FPA</div>

          <h1>
            Faculty Performance
            <br />
            Appraisal System
          </h1>

          <p className="brand-sub">
            Departmental Evaluation &amp; Scoring Ledger
          </p>
        </div>

        <form
          id="loginForm"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div className="field-group">
            <label htmlFor="username">Username</label>

            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              className={errors.username ? "input-error" : ""}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>

            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className={errors.password ? "input-error" : ""}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: "2.6rem" }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.25rem",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="loginBtn"
            className="btn-primary btn-block btn-login-submit"
            disabled={submitting}
          >
            {submitting ? "Signing In…" : "Sign In"}
          </button>
        </form>
      </div>
    </section>
  );
}
