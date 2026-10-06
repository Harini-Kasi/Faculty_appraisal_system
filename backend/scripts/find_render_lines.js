import fs from "fs";

const content = fs.readFileSync("C:\\Users\\harin\\Downloads\\facultyappraisal\\facultyappraisal\\frontend\\src\\HOD\\DepartmentAppraisal.jsx", "utf-8");

const lines = content.split("\n");
lines.forEach((line, i) => {
  if (line.includes("field.name") || line.includes("field.ratings") || line.includes("target") || line.includes("onChange")) {
    if (i >= 300 && i <= 600) {
      console.log(`L${i+1}: ${line.substring(0, 120)}`);
    }
  }
});
