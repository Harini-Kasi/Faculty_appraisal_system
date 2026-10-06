import { getDbPool } from "../config/db.js";

/**
 * Determine old HOD Evaluation template (EVAL1..EVAL12) based on faculty department, designation, and tutorship.
 */
export function determineHodTemplate(department, designation, tutorship) {
  const dept = String(department || "").trim();
  const des = String(designation || "").trim();
  const tut = String(tutorship || "5").trim();

  const isSH = dept === "Science & Humanities" || dept === "S&H";

  if (isSH) {
    if (tut === "1") {
      const isSeniorSH = ["SH2", "SH3", "SH4", "SH5", "sh2", "sh3", "sh4", "sh5"].includes(des);
      return isSeniorSH ? "EVAL5" : "EVAL4";
    } else if (tut === "5" || !tut || tut === "0") {
      return "EVAL3";
    }
    return "EVAL3";
  }

  // Engineering & other departments
  if (tut === "2") { // II Year Tutor
    if (des === "AP1" || des === "ap1") return "EVAL1";
    if (des === "AP2" || des === "ap2") return "EVAL7";
    return "EVAL10";
  } else if (tut === "3") { // III Year Tutor
    if (des === "AP2" || des === "ap2") return "EVAL8";
    return "EVAL6";
  } else if (tut === "4") { // IV Year Tutor
    if (des === "AP1" || des === "ap1") return "EVAL2";
    if (des === "AP2" || des === "ap2") return "EVAL9";
    return "EVAL11";
  } else {
    return "EVAL12";
  }
}

/**
 * Get HOD questions & options for a given template code (EVAL1..EVAL12).
 */
export async function getHodQuestionsByTemplate(templateCode) {
  const db = await getDbPool();
  const [qRows] = await db.query(
    `SELECT id, department, designation, section_code, section_label,
            subsection_code, subsection_label, group_code, group_label,
            text, weightage, order_index
     FROM questions
     WHERE designation = 'HOD' AND group_code = ?
     ORDER BY order_index ASC, id ASC`,
    [templateCode]
  );

  const questions = [];
  let maxPossibleScore = 0;

  for (const q of qRows) {
    const [options] = await db.query(
      `SELECT id, question_id, text, score, order_index
       FROM options
       WHERE question_id = ?
       ORDER BY order_index ASC, id ASC`,
      [q.id]
    );

    const maxOptScore = options.reduce((max, opt) => Math.max(max, opt.score), 0);
    maxPossibleScore += (maxOptScore || 5) * (q.weightage || 1);

    questions.push({
      id: q.id,
      department: q.department,
      designation: q.designation,
      sectionCode: q.section_code,
      sectionLabel: q.section_label,
      subsectionCode: q.subsection_code,
      subsectionLabel: q.subsection_label,
      groupCode: q.group_code,
      groupLabel: q.group_label,
      text: q.text,
      weightage: q.weightage,
      orderIndex: q.order_index,
      options: options.map((opt) => ({
        id: opt.id,
        questionId: opt.question_id,
        text: opt.text,
        score: opt.score,
        orderIndex: opt.order_index,
      })),
    });
  }

  return { questions, maxPossibleScore };
}

/**
 * Calculate total HPE raw score and percentage from user answers & question bank.
 */
export function calculateHpeScore(questions, answers) {
  let rawScore = 0;
  let maxScore = 0;

  const answersMap = new Map();
  if (Array.isArray(answers)) {
    for (const a of answers) {
      answersMap.set(Number(a.questionId), a);
    }
  } else if (answers && typeof answers === "object") {
    for (const [qId, a] of Object.entries(answers)) {
      answersMap.set(Number(qId), typeof a === "object" ? a : { selectedOptionId: a });
    }
  }

  for (const q of questions) {
    const w = Number(q.weightage || 1);
    const maxOptScore = q.options.reduce((max, opt) => Math.max(max, opt.score), 0) || 5;
    maxScore += maxOptScore * w;

    const ans = answersMap.get(Number(q.id));
    if (ans) {
      let optScore = 0;
      if (ans.selectedOptionId) {
        const foundOpt = q.options.find((opt) => Number(opt.id) === Number(ans.selectedOptionId));
        if (foundOpt) optScore = Number(foundOpt.score);
      } else if (ans.score !== undefined && ans.score !== null) {
        optScore = Number(ans.score);
      }
      rawScore += optScore * w;
    }
  }

  const percentage = maxScore > 0 ? (rawScore / maxScore) * 100 : 0;
  return {
    rawScore: Number(rawScore.toFixed(2)),
    maxScore: Number(maxScore.toFixed(2)),
    percentage: Number(percentage.toFixed(2)),
  };
}
