import fs from "fs";

const content = fs.readFileSync("C:\\Users\\harin\\Downloads\\facultyappraisal\\facultyappraisal\\frontend\\src\\HOD\\DepartmentAppraisal.jsx", "utf-8");

const fieldRowStart = content.indexOf("const FieldRow");
if (fieldRowStart !== -1) {
  const fieldRowCode = content.substring(fieldRowStart, fieldRowStart + 3000);
  console.log(fieldRowCode);
} else {
  console.log("FieldRow not found");
}
