import React, { useState } from "react";
import { KeyRound, X, Lock, Eye, EyeOff } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { api } from "../utils/api";

export default function ChangePasswordModal({ onClose }) {
  const { showNotification } = useNotification();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification("Please fill in all password fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification("New password and confirmation do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showNotification("New password must be at least 6 characters.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      showNotification("Password changed successfully.", "success");
      onClose();
    } catch (err) {
      showNotification(err.message || "Could not change your password.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="change-password-modal card" onClick={(e) => e.stopPropagation()}>
        <header className="change-password-header">
          <div className="cp-header-title">
            <KeyRound size={22} className="cp-title-icon" />
            <h2>Change Password</h2>
          </div>
          <button type="button" className="cp-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="field-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showCurrent ? "text" : "password"}
                id="currentPassword"
                className="input-styled"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ paddingRight: "2.6rem" }}
                autoFocus
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrent(!showCurrent)}
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
                }}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="newPassword">New Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showNew ? "text" : "password"}
                id="newPassword"
                className="input-styled"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingRight: "2.6rem" }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNew(!showNew)}
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
                }}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showConfirm ? "text" : "password"}
                id="confirmPassword"
                className="input-styled"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: "2.6rem" }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirm(!showConfirm)}
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
                }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <footer className="change-password-actions">
            <button type="button" className="btn-outline-pdf" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit-pdf" disabled={submitting}>
              {submitting ? "Saving…" : "Save Password"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
