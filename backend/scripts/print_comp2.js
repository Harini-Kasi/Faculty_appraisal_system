import fs from "fs";

const content = fs.readFileSync("d:\\Faculty_Appraisal_System_FPA\\fpa-react\\backend\\scripts\\extracted_component.js", "utf-8");

const lines = content.split("\n");
console.log(lines.slice(300, 420).join("\n"));
