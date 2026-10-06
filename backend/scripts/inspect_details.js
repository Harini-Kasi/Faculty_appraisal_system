import fs from "fs";

const content = fs.readFileSync("d:\\Faculty_Appraisal_System_FPA\\fpa-react\\backend\\scripts\\extracted_component.js", "utf-8");

const lines = content.split("\n");
console.log("--- calculateTotalScore ---");
console.log(lines.slice(225, 260).join("\n"));

const sectionIdx = lines.findIndex(l => l.includes("const Section =") || l.includes("function Section"));
console.log("--- Section component ---");
if (sectionIdx !== -1) {
  console.log(lines.slice(sectionIdx, sectionIdx + 120).join("\n"));
}
