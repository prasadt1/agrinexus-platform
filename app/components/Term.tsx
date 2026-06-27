"use client";

import { useEffect, useRef, useState } from "react";
import { glossary } from "@/lib/glossary";

/**
 * Inline glossable term: dashed underline that reveals a styled definition
 * popover on hover, keyboard focus, AND click/tap (so it works on touch and
 * for users who click the term instead of hovering).
 */
export function Term({
  term,
  children,
}: {
  term: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const definition = glossary[term.toLowerCase()];
  const label = children ?? term;
  if (!definition) return <>{label}</>;

  return (
    <span
      ref={ref}
      className={`term ${open ? "term-open" : ""}`}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${term}: ${definition}`}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((o) => !o);
        }
      }}
    >
      {label}
      <span className="term-q" aria-hidden="true">?</span>
      <span className="term-tip" role="tooltip">
        {definition}
      </span>
    </span>
  );
}
