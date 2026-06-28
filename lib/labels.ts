// Human-readable labels for language codes stored on cohorts (e.g. "hi" -> "Hindi").
// Partners should never see raw two-letter codes in the UI.

export const LANG_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  gu: "Gujarati",
  pa: "Punjabi",
  bn: "Bengali",
  ml: "Malayalam",
  or: "Odia",
};

export function languageLabel(code: string): string {
  const k = (code || "").trim().toLowerCase();
  if (LANG_LABELS[k]) return LANG_LABELS[k];
  return code ? code.charAt(0).toUpperCase() + code.slice(1) : code;
}

export function languageList(codes: string[]): string {
  return (codes || []).map(languageLabel).join(", ");
}
