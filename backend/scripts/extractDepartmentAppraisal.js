import fs from "fs";

const fileContent = fs.readFileSync("C:\\Users\\harin\\Downloads\\facultyappraisal\\facultyappraisal\\frontend\\src\\HOD\\DepartmentAppraisal.jsx", "utf-8");

console.log("File length:", fileContent.length);

const sectionFieldsStart = fileContent.indexOf("const SECTION_FIELDS = [");
const sectionsStart = fileContent.indexOf("const SECTIONS = [");
const componentStart = fileContent.indexOf("export default function DepartmentAppraisal");

console.log("SECTION_FIELDS pos:", sectionFieldsStart);
console.log("SECTIONS pos:", sectionsStart);
console.log("Component pos:", componentStart);

if (sectionFieldsStart !== -1 && sectionsStart !== -1) {
  const sectionFieldsCode = fileContent.substring(sectionFieldsStart, sectionsStart);
  fs.writeFileSync("d:\\Faculty_Appraisal_System_FPA\\fpa-react\\backend\\scripts\\extracted_fields.js", sectionFieldsCode);
  console.log("Saved extracted_fields.js");
}

if (sectionsStart !== -1 && componentStart !== -1) {
  const sectionsCode = fileContent.substring(sectionsStart, componentStart);
  fs.writeFileSync("d:\\Faculty_Appraisal_System_FPA\\fpa-react\\backend\\scripts\\extracted_sections.js", sectionsCode);
  console.log("Saved extracted_sections.js");
}
