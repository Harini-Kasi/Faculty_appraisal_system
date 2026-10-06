import { getDbPool } from "../config/db.js";

export async function loadQuestionsFor(department, designation) {
  const db = await getDbPool();
  let [qRows] = await db.query(
    `SELECT * FROM questions WHERE department = ? AND designation = ? ORDER BY order_index ASC, id ASC`,
    [department, designation]
  );

  if (qRows.length === 0 && department !== "S&H") {
    [qRows] = await db.query(
      `SELECT * FROM questions WHERE department = 'Engineering' AND designation = ? ORDER BY order_index ASC, id ASC`,
      [designation]
    );
  }

  if (qRows.length === 0) {
    [qRows] = await db.query(
      `SELECT * FROM questions WHERE designation = ? ORDER BY order_index ASC, id ASC`,
      [designation]
    );
  }

  const result = [];
  for (const q of qRows) {
    const [options] = await db.query(
      "SELECT id, text, score FROM options WHERE question_id = ? ORDER BY order_index ASC, id ASC",
      [q.id]
    );
    result.push({ ...q, options });
  }
  return result;
}

export async function saveAdminQuestions(department, designation, questions) {
  const db = await getDbPool();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [existingQRows] = await connection.query(
      "SELECT id FROM questions WHERE department = ? AND designation = ?",
      [department, designation]
    );
    const existingQIds = new Set(existingQRows.map((r) => r.id));
    const keptQIds = new Set();

    for (let index = 0; index < questions.length; index++) {
      const q = questions[index];
      const payload = [
        department,
        designation,
        q.sectionCode || "",
        q.sectionLabel || "",
        q.subsectionCode || "",
        q.subsectionLabel || "",
        q.groupCode || "",
        q.groupLabel || "",
        q.text,
        q.weightage,
        index,
      ];

      const incomingId = Number(q.id);
      let questionId;
      if (incomingId > 0 && existingQIds.has(incomingId)) {
        questionId = incomingId;
        await connection.query(
          `UPDATE questions SET
             department = ?, designation = ?, section_code = ?, section_label = ?,
             subsection_code = ?, subsection_label = ?, group_code = ?, group_label = ?,
             text = ?, weightage = ?, order_index = ?
           WHERE id = ${questionId}`,
          payload
        );
      } else {
        const [qRes] = await connection.query(
          `INSERT INTO questions
             (department, designation, section_code, section_label, subsection_code,
              subsection_label, group_code, group_label, text, weightage, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          payload
        );
        questionId = qRes.insertId;
      }
      keptQIds.add(questionId);

      const [existingOptRows] = await connection.query(
        "SELECT id FROM options WHERE question_id = ?",
        [questionId]
      );
      const existingOptIds = new Set(existingOptRows.map((r) => r.id));
      const keptOptIds = new Set();

      const options = q.options || [];
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const incomingOptId = Number(opt.id);
        if (incomingOptId > 0 && existingOptIds.has(incomingOptId)) {
          await connection.query(
            "UPDATE options SET text = ?, score = ?, order_index = ? WHERE id = ? AND question_id = ?",
            [opt.text, opt.score, i, incomingOptId, questionId]
          );
          keptOptIds.add(incomingOptId);
        } else {
          const [optRes] = await connection.query(
            "INSERT INTO options (question_id, text, score, order_index) VALUES (?, ?, ?, ?)",
            [questionId, opt.text, opt.score, i]
          );
          keptOptIds.add(optRes.insertId);
        }
      }

      for (const id of existingOptIds) {
        if (!keptOptIds.has(id)) {
          await connection.query("DELETE FROM options WHERE id = ?", [id]);
        }
      }
    }

    for (const id of existingQIds) {
      if (!keptQIds.has(id)) {
        await connection.query("DELETE FROM questions WHERE id = ?", [id]);
      }
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
