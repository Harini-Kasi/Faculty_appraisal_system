import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DEFAULT_THEME_COLOR,
  applyTheme,
  resetToDefaultTheme,
  getSavedUserTheme,
  saveUserTheme,
} from "../utils/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeColor, setThemeColorState] = useState(DEFAULT_THEME_COLOR);
  const [currentUser, setCurrentUser] = useState(null);

  // Apply theme dynamically whenever themeColor state changes
  useEffect(() => {
    applyTheme(themeColor);
  }, [themeColor]);

  /**
   * Called when user logs in or user session is restored.
   * Loads saved theme for that staff member.
   */
  const loadUserTheme = (username) => {
    setCurrentUser(username);
    const saved = getSavedUserTheme(username);
    setThemeColorState(saved);
    applyTheme(saved);
  };

  /**
   * Updates theme color for current user, applies it immediately across the UI,
   * and saves it to localStorage.
   */
  const updateTheme = (newHexColor, username = currentUser) => {
    setThemeColorState(newHexColor);
    applyTheme(newHexColor);
    saveUserTheme(username, newHexColor);
  };

  /**
   * Resets theme back to default FPA brand color (#1D95AD) — used on Login page & logout.
   */
  const resetTheme = () => {
    setCurrentUser(null);
    setThemeColorState(DEFAULT_THEME_COLOR);
    resetToDefaultTheme();
  };

  return (
    <ThemeContext.Provider
      value={{
        themeColor,
        updateTheme,
        loadUserTheme,
        resetTheme,
        defaultColor: DEFAULT_THEME_COLOR,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
