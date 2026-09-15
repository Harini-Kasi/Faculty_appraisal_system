import {
  generateThemeVariables,
  PRESET_THEME_COLORS,
  DEFAULT_THEME_COLOR,
  hexToRgb,
  rgbToHsl
} from "../src/utils/theme.js";

console.log("=== FPA Dynamic Theme Architecture Test Suite ===");

console.log("\n1. Testing Hex to RGB and RGB to HSL conversion:");
const testHexes = ["#1D95AD", "#9B527F", "#83529B", "#D32F2F", "#1B949F"];
testHexes.forEach((hex) => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  console.log(`Hex: ${hex} => RGB: (${rgb.r}, ${rgb.g}, ${rgb.b}) => HSL: (${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
});

console.log("\n2. Testing Dynamic Theme Variable Generation for Preset Colors:");
PRESET_THEME_COLORS.forEach((color) => {
  const vars = generateThemeVariables(color.hex);
  console.log(`\nPreset [${color.name}] (${color.hex}):`);
  console.log(`  --primary-color : ${vars["--primary-color"]}`);
  console.log(`  --primary-dark  : ${vars["--primary-dark"]}`);
  console.log(`  --primary-light : ${vars["--primary-light"]}`);
  console.log(`  --primary-lighter: ${vars["--primary-lighter"]}`);
  console.log(`  --primary-bg    : ${vars["--primary-bg"]}`);
  console.log(`  --primary-border: ${vars["--primary-border"]}`);
  console.log(`  --primary-text  : ${vars["--primary-text"]}`);
  console.log(`  --primary-hover : ${vars["--primary-hover"]}`);

  // Assertions
  if (vars["--primary-color"] !== color.hex) {
    throw new Error(`Mismatch in primary color for ${color.name}`);
  }
  if (!vars["--primary-dark"].startsWith("hsl(")) {
    throw new Error(`Invalid primary dark format for ${color.name}`);
  }
});

console.log("\n3. Testing Fallback for Invalid Hex Input:");
const invalidVars = generateThemeVariables("invalid-hex");
if (invalidVars["--primary-color"] !== DEFAULT_THEME_COLOR) {
  throw new Error("Failed to fallback to default theme color on invalid hex input");
}
console.log("  Successfully fell back to default brand color:", DEFAULT_THEME_COLOR);

console.log("\n✅ All Theme System Tests Passed Successfully!");
