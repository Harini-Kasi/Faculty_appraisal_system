/* ============================================================
   Generates a per-submission "Faculty Performance Appraisal
   Report" PDF for the admin's Submissions page.

   Uses only the historical data already stored on the submission
   object (answers_json / formatted faculty details) — it never
   re-reads the current question builder, so a report always
   reflects what was true at the time the appraisal was submitted,
   even if the questions have since changed.
   ============================================================ */

import { jsPDF } from "jspdf";
import { designationLabel } from "./storage";

const PAGE_WIDTH = 210; // A4, mm
const PAGE_HEIGHT = 297;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 5.4;

const PRIMARY_COLOR = [101, 34, 60]; // matches --primary (burgundy)
const MUTED_COLOR = [107, 95, 102]; // matches --text-secondary
const TEXT_COLOR = [36, 27, 33]; // matches --text
const RULE_COLOR = [216, 197, 208]; // matches --border-strong

function safeFilenamePart(value) {
  return String(value || "unknown")
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";
}

function formatValue(value) {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

export function generateSubmissionReport(submission) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  function ensureSpace(neededHeight) {
    if (y + neededHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  // Writes `text`, wrapped to `maxWidth`, one physical line at a time so
  // page breaks can be inserted mid-paragraph without losing content.
  function writeWrapped(text, x, { size = 10, bold = false, color = TEXT_COLOR, maxWidth } = {}) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const width = maxWidth ?? CONTENT_WIDTH - (x - MARGIN);
    const lines = doc.splitTextToSize(text, width);
    lines.forEach((line) => {
      ensureSpace(LINE_HEIGHT);
      doc.text(line, x, y);
      y += LINE_HEIGHT;
    });
  }

  function addRule() {
    ensureSpace(4);
    doc.setDrawColor(...RULE_COLOR);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 4;
  }

  function addSectionHeading(text) {
    ensureSpace(LINE_HEIGHT + 4);
    y += 2;
    writeWrapped(text, MARGIN, { size: 13, bold: true, color: PRIMARY_COLOR });
    addRule();
  }

  function addLabelValue(label, value) {
    writeWrapped(`${label}: ${formatValue(value)}`, MARGIN, { size: 10 });
  }

  // ---- Title ----
  writeWrapped("FACULTY PERFORMANCE APPRAISAL REPORT", MARGIN, { size: 16, bold: true, color: PRIMARY_COLOR });
  y += 1;
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.7);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  // ---- Faculty Details ----
  const d = submission.details || {};
  addSectionHeading("Faculty Details");
  addLabelValue("Staff Name", submission.staffName);
  addLabelValue("Staff ID / Username", submission.username);
  addLabelValue("Department", submission.department);
  addLabelValue("Designation", designationLabel(submission.designation));
  addLabelValue("Tutorship", d.tutorship);
  addLabelValue("Area of Specialization", d.areaOfSpecialization);
  addLabelValue("Teaching Experience (years)", d.teachingExperience);
  addLabelValue("Industry Experience (years)", d.industryExperience);
  addLabelValue("Courses Taught (Odd Semester)", d.coursesTaughtOdd);
  addLabelValue("Courses Taught (Even Semester)", d.coursesTaughtEven);
  addLabelValue("UG Projects Guided", d.ugProjectsGuided);
  addLabelValue("PG Projects Guided", d.pgProjectsGuided);
  y += 3;

  // ---- Appraisal Summary ----
  addSectionHeading("Appraisal Summary");
  addLabelValue("Total Score", `${formatValue(submission.totalScore)} / ${formatValue(submission.maxScore)}`);
  addLabelValue("Maximum Score", submission.maxScore);
  addLabelValue(
    "Submission Date",
    submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "—"
  );
  y += 3;

  // ---- Detailed Appraisal ----
  addSectionHeading("Detailed Appraisal");
  const answers = Array.isArray(submission.answers) ? submission.answers : [];
  if (answers.length === 0) {
    writeWrapped("No answers were recorded for this submission.", MARGIN, { size: 10 });
  }
  answers.forEach((ans, i) => {
    ensureSpace(LINE_HEIGHT * 2);
    writeWrapped(`Q${String(i + 1).padStart(2, "0")}. ${formatValue(ans.questionText)}`, MARGIN, {
      size: 10.5,
      bold: true,
    });
    writeWrapped(`Selected Option: ${formatValue(ans.selectedOption)}`, MARGIN + 4, { size: 9.5 });
    if (ans.optionScore !== undefined) {
      writeWrapped(`Option Score: ${formatValue(ans.optionScore)}`, MARGIN + 4, { size: 9.5 });
    }
    if (ans.weightage !== undefined) {
      writeWrapped(`Weightage: ${formatValue(ans.weightage)}`, MARGIN + 4, { size: 9.5 });
    }
    writeWrapped(`Question Score: ${formatValue(ans.questionScore)}`, MARGIN + 4, { size: 9.5 });
    writeWrapped(`Evidence: ${formatValue(ans.evidence)}`, MARGIN + 4, { size: 9.5, color: MUTED_COLOR });
    y += 3;
  });

  // ---- Final Total ----
  ensureSpace(LINE_HEIGHT + 6);
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.7);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;
  writeWrapped(`Total Score: ${formatValue(submission.totalScore)} / ${formatValue(submission.maxScore)}`, MARGIN, {
    size: 12,
    bold: true,
    color: PRIMARY_COLOR,
  });

  // ---- Page numbers ----
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED_COLOR);
    doc.text(`Page ${p} of ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: "right" });
  }

  const dateStr = submission.submittedAt
    ? new Date(submission.submittedAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const idPart = safeFilenamePart(submission.username || submission.staffName);
  const filename = `FPA_Report_${idPart}_${dateStr}.pdf`;

  doc.save(filename);
}
