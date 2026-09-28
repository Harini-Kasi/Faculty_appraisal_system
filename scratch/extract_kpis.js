import fs from "fs";
import path from "path";

const formsDir = "C:/Users/harin/Downloads/facultyappraisal/facultyappraisal/frontend/src/Forms";
const files = ["Ap1.jsx", "Ap2.jsx", "Ap3.jsx", "Ap4.jsx", "Asso.jsx", "Prof.jsx", "Sh1.jsx", "Sh2.jsx", "Sh3.jsx", "Sh4.jsx", "Sh5.jsx"];

const results = {};

files.forEach((f) => {
  const filePath = path.join(formsDir, f);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  
  // Find fields array or kpis array or formStructure
  const desig = f.replace(".jsx", "");
  results[desig] = [];

  // Look for label or text matches inside fields
  const fieldMatches = [...content.matchAll(/label:\s*["']([^"']+)["']/g)];
  results[desig] = fieldMatches.map(m => m[1]);
});

console.log(JSON.stringify(results, null, 2));
