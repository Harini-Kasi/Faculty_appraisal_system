import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { applyTheme, isValidHex, formatHex, DEFAULT_THEME_COLOR } from "../utils/theme";
import { ArrowRight, Layout, Sparkles } from "lucide-react";

export default function ThemeSelectionPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { themeColor, updateTheme } = useTheme();

  const facultyName = session?.name || session?.username || "Faculty";

  const [selectedColor, setSelectedColor] = useState(themeColor || DEFAULT_THEME_COLOR);
  const [hexInput, setHexInput] = useState(themeColor || DEFAULT_THEME_COLOR);

  // Dynamically update DOM root variables for live preview
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

  return (
    <div className="theme-selection-page">
      <div className="theme-selection-card">
        {/* Header & Welcome Title */}
        <div className="theme-selection-header">
          <div className="brand-mark">FPA</div>
          <h1>Faculty Performance Appraisal System</h1>
          <h2 className="welcome-banner">Welcome, {facultyName}</h2>
          <p className="subtitle">Choose your preferred theme color</p>
        </div>

        {/* Custom Color Picker & Hex Input Section */}
        <div className="theme-picker-section">
          <label className="picker-label">Custom Theme Color</label>
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
              placeholder="#7A263A"
              maxLength={7}
              className="hex-text-input"
              aria-label="Hex Color Input"
            />
          </div>
        </div>

        {/* Live Color Preview */}
        <div className="preview-section">
          <h2 className="preview-title">Live Color Preview</h2>
          <div className="preview-container">
            {/* Header Preview Bar */}
            <div className="preview-header-bar">
              <div className="preview-brand-mark">FPA</div>
              <span className="preview-header-text">Faculty Performance Appraisal System</span>
            </div>

            {/* Main Preview Content */}
            <div className="preview-body">
              {/* Sidebar Preview */}
              <div className="preview-sidebar">
                <div className="preview-sidebar-title">Navigation</div>
                <div className="preview-nav-item active">
                  <Layout size={14} /> Active Menu
                </div>
                <div className="preview-nav-item">
                  <Sparkles size={14} /> Inactive Menu
                </div>
              </div>

              {/* Element Samples */}
              <div className="preview-elements">
                <div className="preview-group">
                  <span className="group-label">Primary Button</span>
                  <button type="button" className="btn-primary preview-btn" tabIndex={-1}>
                    Submit Appraisal
                  </button>
                </div>

                <div className="preview-group">
                  <span className="group-label">Badges &amp; Status</span>
                  <div className="badge-row">
                    <span className="preview-badge">Score: 94.5%</span>
                    <span className="preview-chip">Active</span>
                  </div>
                </div>

                <div className="preview-group">
                  <span className="group-label">Form Input Focus</span>
                  <input
                    type="text"
                    readOnly
                    value="Selected color applies to borders and focus state"
                    className="preview-input"
                    tabIndex={-1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="continue-section">
          <button
            type="button"
            className="btn-primary continue-btn"
            onClick={handleContinue}
          >
            Continue to FPA <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
