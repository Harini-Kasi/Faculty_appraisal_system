/* ============================================================
   Dynamic Theme Generator & Utility Functions
   Converts a primary HEX color into a complete, harmonious palette
   and applies CSS custom properties dynamically to :root.
   ============================================================ */

export const DEFAULT_THEME_COLOR = "#4F46E5";

export const PRESET_THEME_COLORS = [
  { name: "Indigo", hex: "#4F46E5" },
];

/**
 * Validates whether string is a valid 6-character hex color (#RRGGBB or RRGGBB)
 */
export function isValidHex(hex) {
  if (!hex) return false;
  const clean = hex.trim().startsWith("#") ? hex.trim() : `#${hex.trim()}`;
  return /^#[0-9A-Fa-f]{6}$/.test(clean);
}

/**
 * Normalizes hex string into uppercase #RRGGBB format
 */
export function formatHex(hex) {
  if (!hex) return DEFAULT_THEME_COLOR;
  let clean = hex.trim();
  if (!clean.startsWith("#")) clean = `#${clean}`;
  return clean.toUpperCase();
}

/**
 * Converts Hex string (#RRGGBB or #RGB) to RGB object {r, g, b}
 */
export function hexToRgb(hex) {
  let cleanHex = hex ? hex.replace("#", "").trim() : "4F46E5";
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  if (cleanHex.length !== 6) {
    return { r: 79, g: 70, b: 229 }; // Fallback to #4F46E5
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB object to HSL object {h, s, l}
 */
export function rgbToHsl(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Checks if a hex color is light based on perceived relative luminance.
 */
export function isLightColor(hex) {
  if (!hex || !isValidHex(hex)) return false;
  const { r, g, b } = hexToRgb(formatHex(hex));
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.45;
}

/**
 * Generates derived CSS variable object for standard #4F46E5 indigo theme.
 */
export function generateThemeVariables(primaryHex) {
  const hex = DEFAULT_THEME_COLOR;
  const { r, g, b } = hexToRgb(hex);

  return {
    "--primary-color": hex,
    "--primary": hex,
    "--primary-dark": "#4338CA",
    "--primary-darker": "#3730A3",
    "--primary-hover": "#4338CA",
    "--primary-light": "#EEF2FF",
    "--primary-lighter": "#F5F3FF",
    "--primary-very-light": "#F8FAFC",
    "--primary-bg": "#F8FAFC",
    "--primary-border": "#C7D2FE",
    "--primary-border-strong": "#A5B4FC",
    "--primary-text": "#4F46E5",
    "--sidebar-bg": "#FFFFFF",
    "--sidebar-text-color": "#0F172A",
    "--sidebar-tagline-color": "#64748B",
    "--sidebar-logo-badge-bg": "#EEF2FF",
    "--sidebar-logo-badge-border": "#E0E7FF",
    "--sidebar-link-color": "#475569",
    "--sidebar-link-hover": "#F8FAFC",
    "--sidebar-link-active-bg": "#EEF2FF",
    "--sidebar-link-active-color": "#4F46E5",
    "--btn-primary-text": "#FFFFFF",
    "--input-bg": "#F8FAFC",
    "--primary-shadow-10": "rgba(79, 70, 229, 0.08)",
    "--primary-shadow-15": "rgba(79, 70, 229, 0.15)",
    "--primary-shadow-20": "rgba(79, 70, 229, 0.25)",
    "--gold": hex,
    "--gold-bg": "#EEF2FF",
    "--gold-button": hex,
    "--gold-button-hover": "#4338CA",
  };
}

/**
 * Applies the given primary hex color to the document root element.
 */
export function applyTheme(hexColor) {
  const vars = generateThemeVariables(hexColor);
  const root = document.documentElement;

  Object.entries(vars).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
}

/**
 * Resets the active theme to the default FPA brand color (#1D95AD).
 */
export function resetToDefaultTheme() {
  applyTheme(DEFAULT_THEME_COLOR);
}

/**
 * Gets saved theme color for a specific user from localStorage.
 */
export function getSavedUserTheme(username) {
  if (username) {
    const userKey = `fpaThemeColor_${username}`;
    const userTheme = localStorage.getItem(userKey);
    if (userTheme) return userTheme;
  }
  return localStorage.getItem("fpaThemeColor") || DEFAULT_THEME_COLOR;
}

/**
 * Saves theme color for a user and sets global fallback.
 */
export function saveUserTheme(username, hexColor) {
  if (username) {
    localStorage.setItem(`fpaThemeColor_${username}`, hexColor);
  }
  localStorage.setItem("fpaThemeColor", hexColor);
}
