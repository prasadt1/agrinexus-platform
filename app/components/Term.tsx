"use client";

import { glossary } from "@/lib/glossary";

/**
 * Inline glossable term: dashed underline + a definition surfaced via the
 * native title tooltip (robust — never leaks the definition into the page text,
 * even if stylesheet loading is delayed or cached).
 */
export function Term({
  term,
  children,
}: {
  term: string;
  children?: React.ReactNode;
}) {
  const definition = glossary[term.toLowerCase()];
  const label = children ?? term;
  if (!definition) return <>{label}</>;

  return (
    <span
      title={definition}
      tabIndex={0}
      aria-label={`${term}: ${definition}`}
      style={{
        borderBottom: "1px dashed var(--color-text-muted)",
        cursor: "help",
      }}
    >
      {label}
    </span>
  );
}
