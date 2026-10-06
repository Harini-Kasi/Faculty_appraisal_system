import fs from "fs";

const fileContent = fs.readFileSync("C:\\Users\\harin\\Downloads\\facultyappraisal\\facultyappraisal\\frontend\\src\\HOD\\DepartmentAppraisal.jsx", "utf-8");
const componentStart = fileContent.indexOf("export default function DepartmentAppraisal");

fs.writeFileSync("d:\\Faculty_Appraisal_System_FPA\\fpa-react\\backend\\scripts\\extracted_component.js", fileContent.substring(componentStart));
console.log("Saved extracted_component.js");
