import { getDbPool } from "../config/db.js";

export async function getOptionsForQuestion(questionId) {
  const db = await getDbPool();
  const [options] = await db.query(
    "SELECT id, text, score FROM options WHERE question_id = ? ORDER BY order_index ASC, id ASC",
    [questionId]
  );
  return options;
}
