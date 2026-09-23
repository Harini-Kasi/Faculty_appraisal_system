/* ============================================================
   Dynamic Theme Generator & Utility Functions
   Converts a primary HEX color into a complete, harmonious palette
   and applies CSS custom properties dynamically to :root.
   ============================================================ */

export const DEFAULT_THEME_COLOR = "#0B7279";

export const PRESET_THEME_COLORS = [
  { name: "Teal", hex: "#0B7279" },
  { name: "Forest Green", hex: "#0B5D55" },
  { name: "Navy", hex: "#1E3A8A" },
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Purple", hex: "#7C3AED" },
  { name: "Burgundy", hex: "#7A263A" },
  { name: "Slate", hex: "#475569" },
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
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  if (cleanHex.length !== 6) {
    return { r: 11, g: 114, b: 121 }; // Fallback to #0B7279
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
 * Generates derived CSS variable object from a primary hex color.
 */
export function generateThemeVariables(primaryHex) {
  const hex = isValidHex(primaryHex) ? formatHex(primaryHex) : DEFAULT_THEME_COLOR;
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  // Derived Lightness & Saturation bounds
  const darkL = Math.max(0, l - 10);
  const darkerL = Math.max(0, l - 18);
  const hoverL = Math.max(0, l - 8);
  const textL = Math.min(32, Math.max(15, l - 25));
  const textS = Math.min(65, Math.max(25, s * 0.75));

  // Compute text contrast on primary background button
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const btnTextColor = luminance > 0.58 ? "#0F172A" : "#FFFFFF";

  // Dynamic Sidebar Contrast calculation:
  // Use the selected theme color directly for the sidebar background.
  // Adapt logo badge background, brand text, and link colors automatically
  // depending on whether the chosen theme is light or dark.
  const isLightSidebar = luminance > 0.45 || l > 48;
  const sidebarBg = hex;
  const sidebarTextColor = isLightSidebar ? "#0F172A" : "#FFFFFF";
  const sidebarTaglineColor = isLightSidebar ? "#334155" : "rgba(255, 255, 255, 0.9)";
  // Clean white badge container to guarantee full-color reference logo legibility on all theme sidebars
  const logoBadgeBg = "#FFFFFF";
  const logoBadgeBorder = isLightSidebar ? "rgba(15, 23, 42, 0.16)" : "rgba(255, 255, 255, 0.35)";
  const sidebarLinkColor = isLightSidebar ? "#1E293B" : "rgba(255, 255, 255, 0.9)";
  const sidebarLinkHover = isLightSidebar ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.15)";
  const sidebarLinkActiveBg = isLightSidebar ? "rgba(15, 23, 42, 0.15)" : "rgba(255, 255, 255, 0.22)";
  const sidebarLinkActiveColor = isLightSidebar ? "#0F172A" : "#FFFFFF";

  const lightS = Math.min(80, Math.max(15, s * 0.5));
  const lightL = 91;

  const lighterS = Math.min(60, Math.max(10, s * 0.35));
  const lighterL = 96;

  const bgS = Math.min(40, Math.max(8, s * 0.25));
  const bgL = 98;

  const borderS = Math.min(60, Math.max(15, s * 0.4));
  const borderL = 86;

  const borderStrongS = Math.min(65, Math.max(20, s * 0.5));
  const borderStrongL = 76;

  return {
    "--primary-color": hex,
    "--primary": hex,
    "--primary-dark": `hsl(${h}, ${s}%, ${darkL}%)`,
    "--primary-darker": `hsl(${h}, ${s}%, ${darkerL}%)`,
    "--primary-hover": `hsl(${h}, ${s}%, ${hoverL}%)`,
    "--primary-light": `hsl(${h}, ${lightS}%, ${lightL}%)`,
    "--primary-lighter": `hsl(${h}, ${lighterS}%, ${lighterL}%)`,
    "--primary-very-light": `hsl(${h}, ${lighterS}%, ${lighterL}%)`,
    "--primary-bg": `hsl(${h}, ${bgS}%, ${bgL}%)`,
    "--primary-border": `hsl(${h}, ${borderS}%, ${borderL}%)`,
    "--primary-border-strong": `hsl(${h}, ${borderStrongS}%, ${borderStrongL}%)`,
    "--primary-text": `hsl(${h}, ${Math.round(textS)}%, ${Math.round(textL)}%)`,
    "--sidebar-bg": sidebarBg,
    "--sidebar-text-color": sidebarTextColor,
    "--sidebar-tagline-color": sidebarTaglineColor,
    "--sidebar-logo-badge-bg": logoBadgeBg,
    "--sidebar-logo-badge-border": logoBadgeBorder,
    "--sidebar-link-color": sidebarLinkColor,
    "--sidebar-link-hover": sidebarLinkHover,
    "--sidebar-link-active-bg": sidebarLinkActiveBg,
    "--sidebar-link-active-color": sidebarLinkActiveColor,
    "--btn-primary-text": btnTextColor,
    "--input-bg": `hsl(${h}, ${lighterS}%, ${lighterL}%)`,
    "--primary-shadow-10": `rgba(${r}, ${g}, ${b}, 0.10)`,
    "--primary-shadow-15": `rgba(${r}, ${g}, ${b}, 0.15)`,
    "--primary-shadow-20": `rgba(${r}, ${g}, ${b}, 0.20)`,
    // Aliases to keep backward compatibility with existing styles
    "--gold": hex,
    "--gold-bg": `hsl(${h}, ${lightS}%, ${lightL}%)`,
    "--gold-button": hex,
    "--gold-button-hover": `hsl(${h}, ${s}%, ${darkL}%)`,
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
