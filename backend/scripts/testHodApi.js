import { getDbPool } from "../config/db.js";
import { determineHodTemplate, getHodQuestionsByTemplate, calculateHpeScore } from "../services/hodTemplateService.js";

async function testHodIntegration() {
  console.log("🧪 Testing HOD Integration...");

  const db = await getDbPool();

  // Test 1: HOD template selection
  const t1 = determineHodTemplate("CSE", "AP1", "2"); // II Year Tutor, AP1 -> EVAL1
  const t2 = determineHodTemplate("CSE", "Associate Professor", "2"); // II Year Tutor, Asso -> EVAL10
  const t3 = determineHodTemplate("S&H", "SH1", "1"); // S&H Tutor, SH1 -> EVAL4
  const t4 = determineHodTemplate("S&H", "SH3", "1"); // S&H Tutor, SH3 -> EVAL5
  const t5 = determineHodTemplate("ECE", "AP2", "5"); // Non tutor -> EVAL12

  console.log("Template selection results:", { t1, t2, t3, t4, t5 });

  if (t1 !== "EVAL1" || t2 !== "EVAL10" || t3 !== "EVAL4" || t4 !== "EVAL5" || t5 !== "EVAL12") {
    throw new Error("❌ Template selection test failed!");
  }
  console.log("✅ HOD Template selection test PASSED!");

  // Test 2: Fetch questions for template EVAL10
  const { questions, maxPossibleScore } = await getHodQuestionsByTemplate("EVAL10");
  console.log(`EVAL10 loaded ${questions.length} questions, max score: ${maxPossibleScore}`);

  if (questions.length !== 10) {
    throw new Error("❌ Question bank query test failed!");
  }
  console.log("✅ Question bank query test PASSED!");

  // Test 3: Score calculation test
  const sampleAnswers = questions.map((q) => ({
    questionId: q.id,
    selectedOptionId: q.options[0]?.id, // Select 5-score option
    score: q.options[0]?.score,
  }));

  const { rawScore, percentage } = calculateHpeScore(questions, sampleAnswers);
  console.log(`Calculated HPE score: ${rawScore} / ${maxPossibleScore} (${percentage}%)`);

  if (percentage !== 100) {
    throw new Error("❌ Score calculation test failed!");
  }
  console.log("✅ Score calculation test PASSED!");

  console.log("🎉 ALL HOD INTEGRATION BACKEND TESTS PASSED!");
  process.exit(0);
}

testHodIntegration().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
