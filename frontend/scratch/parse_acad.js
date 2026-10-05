import fs from "fs";

const sqlPath = "C:/Users/harin/Downloads/Fpas21092026.sql";
const sql = fs.readFileSync(sqlPath, "utf8");

const acadInserts = sql.match(/INSERT INTO `faculty_academic_details` VALUES ([\s\S]*?);/);
if (acadInserts) {
  console.log("Found faculty_academic_details INSERT length:", acadInserts[0].length);
  console.log("Sample rows:");
  console.log(acadInserts[1].substring(0, 1000));
} else {
  console.log("No faculty_academic_details INSERT match");
}
