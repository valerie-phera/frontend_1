/** Max characters shown for notes chips on /result-with-details */
export const NOTES_DISPLAY_MAX_LENGTH = 85;

/**
 * Compact notes for pill UI (single line, ellipsis when long).
 */
export function formatNotesForDisplay(notes, maxLength = NOTES_DISPLAY_MAX_LENGTH) {
  const text = String(notes ?? "").trim();
  if (!text) return "";
  const compact = text.replace(/\s+/g, " ");
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength).trimEnd()}...`;
}

/**
 * Full notes text for PDF / structured export rows.
 */
export function formatNotesForPdf(notes) {
  return String(notes ?? "").trim();
}
