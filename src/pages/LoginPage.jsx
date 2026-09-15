import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Enforce default brand color (#1D95AD) on Login page
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
      // The server authenticates the credentials and determines the
      // role, department, and designation.
      const { token, role, user } = await api.login(uname, password);

      login(token, { role, ...user });
      loadUserTheme(user.username);

      showNotification(`Welcome, ${user.name}.`, "success");

      navigate(role === "admin" ? "/admin" : "/staff");
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
    <section
      id="loginPage"
      className="login-page"
      style={{
        backgroundImage: "url('/login-background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="ledger-band"></div>

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

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className={errors.password ? "input-error" : ""}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            id="loginBtn"
            className="btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? "Signing In…" : "Sign In"}
          </button>
        </form>
      </div>
    </section>
  );
}
