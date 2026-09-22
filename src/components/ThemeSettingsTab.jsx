import React, { useState } from "react";
import { PRESET_THEME_COLORS } from "../utils/theme";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { Check, Palette, Sparkles, Layout, Eye, Save } from "lucide-react";

export default function ThemeSettingsTab() {
  const { themeColor, updateTheme } = useTheme();
  const { session } = useAuth();
  const { showNotification } = useNotification();

  const [customHex, setCustomHex] = useState(themeColor);

  const handleSelectColor = (hex) => {
    setCustomHex(hex);
    updateTheme(hex, session?.username);
    showNotification(`Theme color updated to ${hex.toUpperCase()}`, "success");
  };

  const handleCustomHexChange = (e) => {
    const val = e.target.value;
    setCustomHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      updateTheme(val, session?.username);
    }
  };

  return (
    <div className="theme-settings-wrapper" style={{ padding: "1.5rem 0" }}>
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              padding: "0.6rem",
              borderRadius: "8px",
              background: "var(--primary-light)",
              color: "var(--primary-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Palette size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--primary-text)" }}>
              Theme &amp; Accent Color Settings
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              Select your preferred primary theme color. Every button, border, active menu, badge, and background tint across the FPA application will automatically re-derive to match your choice.
            </p>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--primary-border)", margin: "1.5rem 0" }} />

        {/* Custom Color Picker */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.85rem", color: "var(--text)" }}>
            Custom Primary Color Picker
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", maxWidth: "420px" }}>
            <div
              style={{
                position: "relative",
                width: "46px",
                height: "46px",
                borderRadius: "10px",
                overflow: "hidden",
                border: "2px solid var(--border)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <input
                type="color"
                value={themeColor}
                onChange={(e) => handleSelectColor(e.target.value)}
                style={{
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  width: "200%",
                  height: "200%",
                  cursor: "pointer",
                  border: "none",
                }}
              />
            </div>
            <input
              type="text"
              value={customHex}
              onChange={handleCustomHexChange}
              placeholder="#1D95AD"
              maxLength={7}
              style={{
                flex: 1,
                padding: "0.65rem 0.9rem",
                fontSize: "0.95rem",
                fontFamily: "monospace",
                border: "1.5px solid var(--primary-border)",
                borderRadius: "8px",
                background: "var(--input-bg)",
                color: "var(--text)",
              }}
            />
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleSelectColor(customHex)}
              style={{ padding: "0.65rem 1.25rem", whiteSpace: "nowrap" }}
            >
              Apply Color
            </button>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--primary-border)", margin: "1.5rem 0" }} />

        {/* Live Theme Preview Section */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Eye size={18} style={{ color: "var(--primary-color)" }} />
            <h3 style={{ fontSize: "1.05rem", fontWeight: "600", color: "var(--primary-text)" }}>
              Live Theme Preview
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              gap: "1.5rem",
              padding: "1.5rem",
              borderRadius: "12px",
              background: "var(--primary-bg)",
              border: "1px solid var(--primary-border)",
            }}
          >
            {/* Sidebar Preview */}
            <div
              style={{
                background: "var(--primary-color)",
                borderRadius: "10px",
                padding: "1.25rem 1rem",
                color: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>FPA Sidebar</div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Layout size={16} /> Active Item
              </div>
              <div
                style={{
                  opacity: 0.8,
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Sparkles size={16} /> Inactive Item
              </div>
            </div>

            {/* Component Preview Elements */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h4 style={{ color: "var(--primary-text)", fontSize: "1rem", fontWeight: "700", marginBottom: "0.4rem" }}>
                  Section Heading Accent
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Sample body text using readable neutral typography.
                </p>
              </div>

              {/* Input preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxWidth: "320px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--primary-text)" }}>
                  Form Input Label
                </label>
                <input
                  type="text"
                  readOnly
                  value="Sample input with dynamic border & light background"
                  style={{
                    padding: "0.55rem 0.8rem",
                    borderRadius: "6px",
                    border: "1.5px solid var(--primary-border)",
                    background: "var(--primary-lighter)",
                    color: "var(--text)",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              {/* Action Buttons & Badge Row */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <button type="button" className="btn-primary" style={{ padding: "0.55rem 1.2rem", fontSize: "0.88rem" }}>
                  Submit Appraisal
                </button>
                <button
                  type="button"
                  style={{
                    padding: "0.55rem 1.2rem",
                    fontSize: "0.88rem",
                    borderRadius: "6px",
                    background: "var(--primary-light)",
                    color: "var(--primary-text)",
                    border: "1px solid var(--primary-border)",
                    fontWeight: "600",
                  }}
                >
                  Save Draft
                </button>

                <span
                  style={{
                    padding: "0.35rem 0.8rem",
                    borderRadius: "20px",
                    background: "var(--primary-light)",
                    color: "var(--primary-color)",
                    fontWeight: "700",
                    fontSize: "0.82rem",
                  }}
                >
                  Score: 94.5%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
