import fs from "fs";

const content = fs.readFileSync("C:\\Users\\harin\\Downloads\\facultyappraisal\\facultyappraisal\\frontend\\src\\HOD\\DepartmentAppraisal.jsx", "utf-8");

const sectionStart = content.indexOf("const Section");
if (sectionStart !== -1) {
  const sectionCode = content.substring(sectionStart, sectionStart + 4000);
  console.log(sectionCode);
} else {
  console.log("Section not found");
}
