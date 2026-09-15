/* ============================================================
   Dynamic Theme Generator & Utility Functions
   Converts a primary HEX color into a complete, harmonious palette
   and applies CSS custom properties dynamically to :root.
   ============================================================ */

export const DEFAULT_THEME_COLOR = "#1D95AD";

export const PRESET_THEME_COLORS = [
  { name: "Teal", hex: "#1D95AD" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Purple", hex: "#83529B" },
  { name: "Pink", hex: "#9B527F" },
  { name: "Red", hex: "#D32F2F" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Green", hex: "#1B949F" },
];

/**
 * Converts Hex string (#RRGGBB or #RGB) to RGB object {r, g, b}
 */
export function hexToRgb(hex) {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  if (cleanHex.length !== 6) {
    return { r: 29, g: 149, b: 173 }; // Fallback to #1D95AD
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
 * Generates derived CSS variable object from a primary hex color.
 */
export function generateThemeVariables(primaryHex) {
  const hex = primaryHex && /^#[0-9A-Fa-f]{6}$/.test(primaryHex) ? primaryHex : DEFAULT_THEME_COLOR;
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  // Derived Lightness & Saturation bounds
  const darkL = Math.max(0, l - 10);
  const darkerL = Math.max(0, l - 18);
  const hoverL = Math.max(0, l - 8);
  const textL = Math.min(32, Math.max(15, l - 25));
  const textS = Math.min(65, Math.max(25, s * 0.75));

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
