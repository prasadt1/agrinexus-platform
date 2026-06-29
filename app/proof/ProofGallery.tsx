"use client";

import { useCallback, useEffect, useState } from "react";

export type ProofItem = { src: string; title: string; caption: string };
export type ProofSection = { id: string; title: string; desc?: string; items: ProofItem[] };

export function ProofGallery({ sections }: { sections: ProofSection[] }) {
  // Flatten for prev/next navigation inside the lightbox.
  const flat = sections.flatMap((s) => s.items);
  const indexOf = (src: string) => flat.findIndex((i) => i.src === src);

  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((cur) => (cur === null ? cur : (cur + d + flat.length) % flat.length)),
    [flat.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const active = open === null ? null : flat[open];

  return (
    <>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="mb-12">
          <h2 className="text-section mb-1">{section.title}</h2>
          {section.desc && (
            <p className="mb-5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {section.desc}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {section.items.map((item) => (
              <button
                key={item.src}
                onClick={() => setOpen(indexOf(item.src))}
                className="card group text-left p-0 overflow-hidden cursor-zoom-in transition-shadow"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="relative" style={{ background: "var(--color-surface-muted, #EFEADD)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="w-full block"
                    style={{ aspectRatio: "3 / 2", objectFit: "cover", objectPosition: "top" }}
                  />
                  <span
                    className="absolute top-2.5 right-2.5 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(15,81,50,.9)", color: "#fff" }}
                  >
                    Click to zoom
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {item.title}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                    {item.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(8,16,12,.88)", backdropFilter: "blur(4px)" }}
        >
          {/* top bar */}
          <div className="w-full flex items-center justify-between mb-3 shrink-0" style={{ color: "#E8EDE9" }}>
            <span className="text-sm">
              {open! + 1} / {flat.length}
            </span>
            <div className="flex items-center gap-3">
              <a
                href={active.src}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm underline"
                style={{ color: "#9FE6BF" }}
              >
                Open full size ↗
              </a>
              <button onClick={close} aria-label="Close" className="text-2xl leading-none px-2" style={{ color: "#E8EDE9" }}>
                ×
              </button>
            </div>
          </div>

          {/* image */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={active.title}
              className="rounded-lg"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                background: "var(--color-surface-muted, #EFEADD)",
                boxShadow: "0 20px 60px rgba(0,0,0,.5)",
              }}
            />
          </div>

          {/* caption + nav */}
          <div className="w-full flex items-center justify-between gap-4 mt-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => step(-1)}
              aria-label="Previous"
              className="px-3 py-2 rounded-md text-sm shrink-0"
              style={{ background: "rgba(255,255,255,.1)", color: "#E8EDE9" }}
            >
              ← Prev
            </button>
            <div className="text-center min-w-0" style={{ color: "#E8EDE9" }}>
              <p className="font-semibold truncate">{active.title}</p>
              <p className="text-sm truncate" style={{ color: "#AEBcb3" }}>
                {active.caption}
              </p>
            </div>
            <button
              onClick={() => step(1)}
              aria-label="Next"
              className="px-3 py-2 rounded-md text-sm shrink-0"
              style={{ background: "rgba(255,255,255,.1)", color: "#E8EDE9" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
