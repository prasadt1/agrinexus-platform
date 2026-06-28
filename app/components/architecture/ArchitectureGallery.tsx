"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { SlideThreePlanes } from "./SlideThreePlanes";
import { SlideTeardown } from "./SlideTeardown";
import { SlideReceiptThread } from "./SlideReceiptThread";

const C = {
  ink: "#1A1714", muted: "#5A554C", faint: "#726A5C",
  green: "#157347", border: "#E6E0D4", cream2: "#FBF8F2",
};
const SERIF = "var(--font-serif), Georgia, serif";

type Slide = { id: string; title: string; caption: string; node: React.ReactNode };

const SLIDES: Slide[] = [
  {
    id: "planes",
    title: "Three planes, one system",
    caption:
      "Control (Vercel), Data (one Amazon DynamoDB table), Engine (AWS + WhatsApp). The engine and its table pre-dated H0 — it's the AgriNexus accountability engine that won the AWS AIdeas Innovation Award; H0 added the Vercel control plane and the reporting roll-ups.",
    node: <SlideThreePlanes />,
  },
  {
    id: "teardown",
    title: "The closed loop, on the real product",
    caption:
      "Every AWS, Vercel and Meta service labelled on the exact touchpoint it acts on — and one green loop that re-fires a fresh WhatsApp advice to the farmers who didn't act.",
    node: <SlideTeardown />,
  },
  {
    id: "thread",
    title: "The same loop, as the farmer feels it",
    caption:
      "A weather advice arrives, the farmer replies “Done”, and that follow-through rolls up for the partner — who re-nudges the few who didn’t act. Each AWS, DynamoDB and Vercel service is noted beside the message it touches.",
    node: <SlideReceiptThread />,
  },
];

export function ArchitectureGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [trackH, setTrackH] = useState<number | undefined>(undefined);

  const goTo = useCallback((n: number) => {
    const idx = (n + SLIDES.length) % SLIDES.length;
    const child = trackRef.current?.children[idx] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActive(idx);
  }, []);

  const onScroll = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const idx = Math.round(t.scrollLeft / t.clientWidth);
    setActive(Math.max(0, Math.min(SLIDES.length - 1, idx)));
  }, []);

  // Size the panel to the active slide so short, wide diagrams don't leave dead
  // space below them (a flex row would otherwise stretch every slide to the
  // tallest one — the vertical third diagram).
  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const measure = () => {
      const el = t.children[active] as HTMLElement | undefined;
      if (el) setTrackH(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    Array.from(t.children).forEach((c) => ro.observe(c));
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active]);

  // Close the expanded view with Escape.
  useEffect(() => {
    if (expanded === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(active + 1);
        if (e.key === "ArrowLeft") goTo(active - 1);
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          ref={trackRef}
          onScroll={onScroll}
          role="group"
          aria-roledescription="carousel"
          aria-label="How Outturn is built"
          className="arch-gallery-track"
          style={{
            display: "flex",
            alignItems: "flex-start",
            overflowX: "auto",
            overflowY: "hidden",
            height: trackH,
            transition: "height .35s ease",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            background: C.cream2,
          }}
        >
          {SLIDES.map((s, n) => (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${n + 1} of ${SLIDES.length}: ${s.title}`}
              style={{ position: "relative", flex: "0 0 100%", scrollSnapAlign: "start", minWidth: 0, padding: "26px 28px 22px" }}
            >
              <button aria-label={`Expand diagram: ${s.title}`} onClick={() => setExpanded(n)} style={expandBtn}>
                <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>⤢</span> Expand
              </button>
              {/* preview fits the panel so the carousel scroll/arrows work; full detail via Expand */}
              <div className="arch-slide-fit">{s.node}</div>
            </div>
          ))}
        </div>

        <button aria-label="Previous diagram" onClick={() => goTo(active - 1)} style={arrow("left")}>
          &#8249;
        </button>
        <button aria-label="Next diagram" onClick={() => goTo(active + 1)} style={arrow("right")}>
          &#8250;
        </button>
      </div>

      {/* caption for the active slide (this REPLACES the old footnote + body paragraphs) */}
      <div style={{ marginTop: 14, minHeight: 64 }}>
        <p style={{ fontFamily: SERIF, fontSize: 17, color: C.ink, margin: "0 0 4px", fontWeight: 500 }}>
          {SLIDES[active].title}
        </p>
        <p style={{ fontSize: 13.5, color: C.muted, margin: 0, lineHeight: 1.55 }}>
          {SLIDES[active].caption}
        </p>
      </div>

      {/* dots + hint */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
        {SLIDES.map((s, n) => (
          <button
            key={s.id}
            aria-label={`Go to: ${s.title}`}
            aria-current={active === n}
            onClick={() => goTo(n)}
            style={{
              width: active === n ? 26 : 9,
              height: 9,
              borderRadius: 999,
              background: active === n ? C.green : C.border,
              border: "none",
              cursor: "pointer",
              transition: "all .25s",
              padding: 0,
            }}
          />
        ))}
        <span style={{ marginLeft: 8, fontSize: 12, color: C.faint }}>
          {active + 1} / {SLIDES.length} · scroll, click or expand
        </span>
      </div>

      {/* Expanded (full-screen) view of a single diagram */}
      {expanded !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={SLIDES[expanded].title}
          onClick={() => setExpanded(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(26,23,20,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.cream2,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              width: "min(1480px, 96vw)",
              maxHeight: "92vh",
              overflow: "auto",
              padding: "20px 24px 24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 14 }}>
              <p style={{ fontFamily: SERIF, fontSize: 19, color: C.ink, margin: 0, fontWeight: 500 }}>
                {SLIDES[expanded].title}
              </p>
              <button aria-label="Close expanded diagram" onClick={() => setExpanded(null)} style={closeBtn}>
                Close ✕
              </button>
            </div>
            <div className="arch-modal-fit">{SLIDES[expanded].node}</div>
            <p style={{ fontSize: 14, color: C.muted, margin: "14px 0 0", lineHeight: 1.55 }}>
              {SLIDES[expanded].caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const expandBtn: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  zIndex: 2,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid #E6E0D4",
  background: "rgba(255,255,255,0.92)",
  color: "#1A1714",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const closeBtn: React.CSSProperties = {
  flexShrink: 0,
  padding: "7px 14px",
  borderRadius: 999,
  border: "1px solid #E6E0D4",
  background: "#FFFFFF",
  color: "#1A1714",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

function arrow(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    ...(side === "left" ? { left: 10 } : { right: 10 }),
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: 999,
    border: "1px solid #E6E0D4",
    background: "rgba(255,255,255,0.92)",
    color: "#1A1714",
    fontSize: 20,
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}
