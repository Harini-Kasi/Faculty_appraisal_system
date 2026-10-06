import fs from "fs";

const content = fs.readFileSync("C:\\Users\\harin\\Downloads\\facultyappraisal\\facultyappraisal\\frontend\\src\\HOD\\DepartmentAppraisal.jsx", "utf-8");

const lines = content.split("\n");
console.log("Total lines:", lines.length);

lines.forEach((line, i) => {
  if (line.includes("grid") || line.includes("Target") || line.includes("Achievement") || line.includes("Select Rating") || line.includes("score")) {
    if (i > 800) {
      console.log(`L${i+1}: ${line.substring(0, 120)}`);
    }
  }
});
