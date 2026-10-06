import fs from "fs";

const content = fs.readFileSync("C:\\Users\\harin\\Downloads\\facultyappraisal\\facultyappraisal\\frontend\\src\\HOD\\DepartmentAppraisal.jsx", "utf-8");

const lines = content.split("\n");
lines.forEach((line, i) => {
  if (line.includes("target") || line.includes("achievement") || line.includes("ratings.map") || line.includes("Select Rating") || line.includes("evidence")) {
    if (i < 300) {
      console.log(`L${i+1}: ${line.substring(0, 120)}`);
    }
  }
});
