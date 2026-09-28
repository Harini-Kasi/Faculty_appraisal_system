import fs from "fs";

const sqlPath = "C:/Users/harin/Downloads/Fpas21092026.sql";
const sql = fs.readFileSync(sqlPath, "utf8");

// Extract CREATE TABLE faculty
const facultyTableMatch = sql.match(/CREATE TABLE `faculty`[\s\S]*?\);/);
console.log("=== FACULTY TABLE SCHEMA ===");
console.log(facultyTableMatch ? facultyTableMatch[0] : "Not found");

// Extract faculty INSERT statement
const facultyInserts = sql.match(/INSERT INTO `faculty` VALUES ([\s\S]*?);/);
if (facultyInserts) {
  const rowsStr = facultyInserts[1];
  console.log("\n=== SAMPLE FACULTY ROWS (first 1000 chars) ===");
  console.log(rowsStr.substring(0, 1000));
}
