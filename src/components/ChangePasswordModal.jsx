import React, { useState } from "react";
import { KeyRound, X, Lock } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { api } from "../utils/api";

export default function ChangePasswordModal({ onClose }) {
  const { showNotification } = useNotification();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
            <input
              type="password"
              id="currentPassword"
              className="input-styled"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              className="input-styled"
              placeholder="Enter new password (min. 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="input-styled"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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
