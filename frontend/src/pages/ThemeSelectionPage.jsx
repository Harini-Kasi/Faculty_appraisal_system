import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { applyTheme, isValidHex, formatHex, DEFAULT_THEME_COLOR, getSavedUserTheme } from "../utils/theme";
import { ArrowRight } from "lucide-react";

export default function ThemeSelectionPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { updateTheme } = useTheme();

  const [selectedColor, setSelectedColor] = useState(() => {
    return getSavedUserTheme(session?.username) || DEFAULT_THEME_COLOR;
  });
  const [hexInput, setHexInput] = useState(() => {
    return getSavedUserTheme(session?.username) || DEFAULT_THEME_COLOR;
  });

  // Dynamically update root variables as user changes color
  useEffect(() => {
    if (isValidHex(selectedColor)) {
      applyTheme(selectedColor);
    }
  }, [selectedColor]);

  const handleColorChange = (e) => {
    const val = e.target.value.toUpperCase();
    setSelectedColor(val);
    setHexInput(val);
  };

  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (isValidHex(val)) {
      setSelectedColor(formatHex(val));
    }
  };

  const handleContinue = () => {
    const finalColor = isValidHex(hexInput) ? formatHex(hexInput) : selectedColor;
    updateTheme(finalColor, session?.username);
    navigate(session?.role === "admin" ? "/admin" : "/staff");
  };

  const isAdmin = session?.role === "admin";
  const continueBtnLabel = isAdmin ? "Continue to Admin Dashboard" : "Continue to FPA Dashboard";

  return (
    <div className="theme-selection-page">
      <div className="theme-selection-card">
        {/* Header & Welcome Title */}
        <div className="theme-selection-header">
          <h1>Choose Your Theme</h1>
          <p className="subtitle">
            Choose your preferred theme color for your FPA workspace.
          </p>
        </div>

        {/* Custom Color Picker & Hex Input Section */}
        <div className="theme-picker-section">
          <label className="picker-label">Custom Primary Color</label>
          <div className="picker-controls">
            <div className="color-swatch-box">
              <input
                type="color"
                value={isValidHex(selectedColor) ? selectedColor : DEFAULT_THEME_COLOR}
                onChange={handleColorChange}
                className="color-picker-input"
                aria-label="Custom Color Picker"
              />
            </div>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              placeholder="#0B7279"
              maxLength={7}
              className="hex-text-input"
              aria-label="Hex Color Input"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="continue-section">
          <button
            type="button"
            className="btn-primary continue-btn"
            onClick={handleContinue}
          >
            {continueBtnLabel} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
