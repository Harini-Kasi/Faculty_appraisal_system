import { getDbPool } from "../config/db.js";

export async function getAllDesignations() {
  const db = await getDbPool();
  const [rows] = await db.query(
    "SELECT desig_code AS code, desig_name AS name FROM designations ORDER BY id ASC"
  );
  return rows;
}
