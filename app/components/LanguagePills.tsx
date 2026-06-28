import { languageLabel } from "@/lib/labels";

// Renders cohort languages as readable pills ("Hindi", "Marathi") instead of
// raw codes ("hi", "mr"). Use anywhere languages are shown to a partner.
export function LanguagePills({
  languages,
  className,
}: {
  languages: string[];
  className?: string;
}) {
  if (!languages || languages.length === 0) return null;
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className || ""}`}>
      {languages.map((code) => (
        <span
          key={code}
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: "var(--color-page-bg)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
          }}
        >
          {languageLabel(code)}
        </span>
      ))}
    </span>
  );
}
