import React from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { useNotification } from "../context/NotificationContext";

export default function Notification() {
  const { notification } = useNotification();
  const { visible, type, message } = notification;

  if (!visible || !message) return null;

  return (
    <div className={`toast-notification ${type || "success"}`}>
      <span className="toast-icon">
        {type === "success" ? (
          <CheckCircle2 size={20} style={{ color: "var(--success)" }} />
        ) : (
          <AlertTriangle size={20} style={{ color: "var(--error)" }} />
        )}
      </span>
      <span className="toast-text">{message}</span>
    </div>
  );
}
