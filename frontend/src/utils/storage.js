/* ============================================================
   Small formatting helpers shared by staff & admin views.
   Final, submitted appraisals always live on the API server — see
   utils/api.js. The one exception is the in-progress "Save" draft
   on the Appraisal form below, which is intentionally kept in
   localStorage (see AppraisalTab.jsx) because it represents an
   unsubmitted, unvalidated work-in-progress rather than a real
   submission record.
   ============================================================ */

const DRAFT_KEY_PREFIX = "fpa_draft_";

// Faculty-specific key so one faculty user's in-progress draft never
// overwrites another faculty user's draft on the same browser.
function draftKeyFor(username) {
  return username ? `${DRAFT_KEY_PREFIX}${username}` : null;
}

// Never stores passwords/tokens — only { details, answers } shape.
export function readDraft(username) {
  const key = draftKeyFor(username);
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeDraft(username, draft) {
  const key = draftKeyFor(username);
  if (!key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // localStorage may be unavailable (private browsing, quota, etc.) —
    // fail silently rather than blocking the user's Save action.
  }
}

export function clearDraft(username) {
  const key = draftKeyFor(username);
  if (!key) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function designationLabel(code) {
  const map = {
    AP1: "Assistant Professor I (AP1)",
    AP2: "Assistant Professor II (AP2)",
    AP3: "Assistant Professor III (AP3)",
    APSG: "Assistant Professor Senior Grade (APSG)",
    "Associate Professor": "Associate Professor",
    Professor: "Professor",
  };
  return map[code] || code;
}

export function roundClean(num) {
  return Math.round(num * 100) / 100;
}
