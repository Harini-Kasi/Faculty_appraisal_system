import fs from "fs";

const content = fs.readFileSync("d:\\Faculty_Appraisal_System_FPA\\fpa-react\\backend\\scripts\\extracted_component.js", "utf-8");

// Print lines containing calculateTotalScore or Section component
const lines = content.split("\n");
lines.forEach((line, i) => {
  if (line.includes("calculateTotalScore") || line.includes("function Section") || line.includes("subsections") || line.includes("Chevron") || line.includes("evidence")) {
    console.log(`L${i+1}: ${line.substring(0, 120)}`);
  }
});
