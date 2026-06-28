# "How it's built" → a 3-slide media gallery (Cursor build spec)

**Goal.** Replace the single static diagram in the landing `#architecture` section with a
**scroll/click media gallery** that holds **all three** views of the same system. The visitor
can swipe/scroll horizontally or click dots/arrows to move between them. Each slide carries its
own one-line caption, so the three diagrams *together* tell the story instead of one diagram plus
four repetitive paragraphs. The three SVGs are also reusable as standalone images in the Devpost
write-up.

**Why.** The current section repeats the same 4 facts (single DynamoDB table / keyless OIDC /
re-nudge / roll-ups) across an intro, a floating footnote, a body paragraph, the cards, AND a
closing paragraph — and the footnote-then-paragraph order reads disjointed. The gallery fixes both:
say-it-once captions, and a clean section flow (eyebrow → headline → intro → **gallery** → "Built on").

The three slides:
1. **Three planes** — keep the existing `<ArchitectureLoop />` (the clean stacked diagram).
2. **The Teardown** — the closed loop annotated on the *real* product (phone + dashboard card).
3. **The Receipt Thread** — the same loop as the farmer feels it (one WhatsApp thread, stack as footnotes).

Brand tokens used throughout (match `app/page.tsx` `C`): cream `#F6F2EA`, cream2 `#FBF8F2`,
ink `#1A1714`, muted `#5A554C`, faint `#726A5C`, green `#157347`, teal `#0E7490`, amber `#B54708`,
border `#E6E0D4`, WhatsApp-green tint `#DCF8C6`. Serif = `var(--font-serif)` (Fraunces). Flat — no
gradients/shadows/glow.

---

## Files to create

```
app/components/architecture/ArchitectureGallery.tsx   (the carousel, "use client")
app/components/architecture/SlideThreePlanes.tsx      (wraps the existing ArchitectureLoop)
app/components/architecture/SlideTeardown.tsx          (new SVG, below)
app/components/architecture/SlideReceiptThread.tsx     (new SVG, below)
```

Then edit `app/page.tsx` (`#architecture` section) and `app/components/ArchitectureLoop.tsx`
(remove its in-component footnote — it moves into the slide caption).

---

## 1) `ArchitectureGallery.tsx`

Native CSS scroll-snap (works with trackpad/touch swipe), plus dot + arrow controls and keyboard.
No carousel library needed.

```tsx
"use client";
import { useCallback, useRef, useState } from "react";
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
      "Control (Vercel), Data (one Amazon DynamoDB table), Engine (AWS + WhatsApp). The engine and its table pre-dated H0 — it's the AgriNexus accountability engine that won the AWS AIdeas award; H0 added the Vercel control plane and the reporting roll-ups.",
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
      "One WhatsApp thread is the diagram: the advice, the “Done” reply, and the stack as quiet footnotes beside the messages they touch.",
    node: <SlideReceiptThread />,
  },
];

export function ArchitectureGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

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
            overflowX: "auto",
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
              style={{ flex: "0 0 100%", scrollSnapAlign: "start", minWidth: 0, padding: "26px 28px 22px" }}
            >
              {/* each diagram keeps its own horizontal-scroll fallback on small screens */}
              <div style={{ overflowX: "auto" }}>{s.node}</div>
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
        <p style={{ fontSize: 13.5, color: C.muted, margin: 0, lineHeight: 1.55, maxWidth: 760 }}>
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
          {active + 1} / {SLIDES.length} · scroll or click
        </span>
      </div>
    </div>
  );
}

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
```

Optional polish in `app/globals.css` — hide the scrollbar on the track (scroll still works):

```css
.arch-gallery-track { scrollbar-width: none; -ms-overflow-style: none; }
.arch-gallery-track::-webkit-scrollbar { display: none; }
```

---

## 2) `SlideThreePlanes.tsx`

```tsx
import { ArchitectureLoop } from "@/app/components/ArchitectureLoop";
export function SlideThreePlanes() {
  return <ArchitectureLoop />;
}
```

> In `ArchitectureLoop.tsx`, **delete the in-component footnote** (the `{/* Footnote: ... */}`
> paragraph with "won the AWS AIdeas award"). Its content now lives in this slide's caption above,
> so it isn't orphaned under the SVG anymore. Keep the SVG itself unchanged.

---

## 3) `SlideTeardown.tsx`

The phone (real WhatsApp thread) + the real dashboard hero card, stack labelled on each touchpoint,
one green loop re-firing a fresh advice. Drop this SVG in verbatim; fine-tune the loop bezier to taste.

```tsx
export function SlideTeardown() {
  return (
    <svg viewBox="0 0 1280 600" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="Teardown: the real WhatsApp thread and Outturn dashboard with each AWS, Vercel and Meta service labelled on the touchpoint it acts on, and a green re-nudge loop."
      style={{ display: "block", width: "100%", minWidth: 880, height: "auto" }}
      fontFamily="var(--font-inter), system-ui, sans-serif">
      <defs>
        <marker id="td-ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#157347" />
        </marker>
      </defs>
      <rect x="0" y="0" width="1280" height="600" fill="#F6F2EA" />
      <text x="56" y="46" fill="#157347" fontSize="12.5" letterSpacing="2" fontWeight="600">HOW IT'S BUILT · A TEARDOWN</text>

      {/* LEFT MARGIN — advice / engine */}
      <g fontSize="12.5" fill="#5A554C" textAnchor="end">
        <rect x="296" y="206" width="6" height="6" fill="#157347" /><line x1="302" y1="209" x2="248" y2="209" stroke="#CFC8B8" />
        <text x="240" y="206"><tspan fontWeight="600" fill="#1A1714">Amazon EventBridge</tspan></text><text x="240" y="221">fires every 6 hours</text>
        <rect x="296" y="268" width="6" height="6" fill="#157347" /><line x1="302" y1="271" x2="248" y2="271" stroke="#CFC8B8" />
        <text x="240" y="268"><tspan fontWeight="600" fill="#1A1714">WeatherPoller</tspan> λ</text><text x="240" y="283">→ OpenWeatherMap, dry window</text>
        <rect x="296" y="330" width="6" height="6" fill="#157347" /><line x1="302" y1="333" x2="248" y2="333" stroke="#CFC8B8" />
        <text x="240" y="330"><tspan fontWeight="600" fill="#1A1714">Step Functions → NudgeSender</tspan></text><text x="240" y="345">→ Meta WhatsApp Cloud API</text>
      </g>

      {/* PHONE */}
      <rect x="316" y="120" width="208" height="392" rx="30" fill="#FBF8F2" stroke="#1A1714" strokeWidth="1.6" />
      <rect x="380" y="132" width="80" height="7" rx="3.5" fill="#1A1714" opacity="0.25" />
      <rect x="330" y="158" width="180" height="324" rx="12" fill="#ECE5D8" />
      <rect x="340" y="176" width="160" height="104" rx="13" fill="#DCF8C6" />
      <text x="352" y="200" fontSize="11.5" fill="#1a2e1a">
        <tspan x="352" dy="0">Good window to spray</tspan>
        <tspan x="352" dy="15">cotton in Latur today —</tspan>
        <tspan x="352" dy="15">dry through evening.</tspan>
        <tspan x="352" dy="15">Reply <tspan fontWeight="700">Done</tspan> once sprayed.</tspan>
      </text>
      <text x="490" y="272" fontSize="9" fill="#6b7a5e" textAnchor="end">06:12 ✓✓</text>
      <rect x="372" y="300" width="128" height="40" rx="13" fill="#FFFFFF" stroke="#E6E0D4" />
      <text x="436" y="325" fontSize="13" fill="#157347" fontWeight="700" textAnchor="middle">Done ✓</text>
      <text x="490" y="356" fontSize="9" fill="#9aa18d" textAnchor="end">06:48</text>
      <text x="420" y="500" fontSize="11" fill="#726A5C" textAnchor="middle" letterSpacing="1">THE FARMER · WHATSAPP</text>

      {/* DASHBOARD SLAB — mirror the real hero card values */}
      <rect x="772" y="150" width="360" height="276" rx="16" fill="#FFFFFF" stroke="#E6E0D4" strokeWidth="1.2" />
      <text x="796" y="186" fontSize="10.5" fill="#726A5C" letterSpacing="1.2">LATUR COTTON COHORT · THIS MONTH</text>
      <text x="796" y="240" fontSize="48" fontFamily="Georgia, serif" fontWeight="500" fill="#157347">67%</text>
      <text x="900" y="238" fontSize="14" fill="#5A554C">follow-through</text>
      <rect x="796" y="258" width="207" height="14" rx="7" fill="#157347" />
      <rect x="1006" y="258" width="37" height="14" fill="#0E7490" />
      <rect x="1046" y="258" width="64" height="14" rx="7" fill="#B54708" />
      <text x="796" y="298" fontSize="13.5" fill="#1A1714">28 of 42 farmers acted</text>
      <rect x="796" y="312" width="134" height="32" rx="16" fill="#157347" />
      <text x="863" y="333" fontSize="12.5" fill="#FFFFFF" fontWeight="600" textAnchor="middle">Re-nudge cohort</text>
      <text x="946" y="333" fontSize="12" fill="#B54708">7 haven't acted</text>
      <text x="952" y="408" fontSize="11" fill="#726A5C" textAnchor="middle" letterSpacing="1">THE PARTNER · OUTTURN DASHBOARD (VERCEL)</text>

      {/* RIGHT MARGIN — proof / data / control */}
      <g fontSize="12.5" fill="#5A554C" textAnchor="start">
        <rect x="1132" y="206" width="6" height="6" fill="#0E7490" /><line x1="1132" y1="209" x2="1180" y2="209" stroke="#CFC8B8" />
        <text x="1188" y="206"><tspan fontWeight="600" fill="#1A1714">API Gateway → WebhookHandler</tspan></text><text x="1188" y="221">the "Done" reply lands</text>
        <rect x="1132" y="262" width="6" height="6" fill="#0E7490" /><line x1="1132" y1="265" x2="1180" y2="265" stroke="#CFC8B8" />
        <text x="1188" y="262"><tspan fontWeight="600" fill="#1A1714">DynamoDB Streams → ResponseDetector</tspan></text><text x="1188" y="277">flips the nudge to done</text>
        <rect x="1132" y="318" width="6" height="6" fill="#0E7490" /><line x1="1132" y1="321" x2="1180" y2="321" stroke="#CFC8B8" />
        <text x="1188" y="318"><tspan fontWeight="600" fill="#1A1714">OutcomesAggregator → SUMMARY#</tspan></text><text x="1188" y="333">rolls up the 67%</text>
        <rect x="1132" y="374" width="6" height="6" fill="#0E7490" /><line x1="1132" y1="377" x2="1180" y2="377" stroke="#CFC8B8" />
        <text x="1188" y="374"><tspan fontWeight="600" fill="#1A1714">Vercel · keyless OIDC</tspan></text><text x="1188" y="389">reads it, no stored keys</text>
      </g>

      {/* THE CLOSED LOOP — pill → back into the advice bubble (a circuit, not a halo) */}
      <path d="M830 330 C 760 500, 560 548, 420 548 C 300 548, 250 470, 250 380 C 250 300, 292 250, 338 232"
        fill="none" stroke="#157347" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" markerEnd="url(#td-ah)" />
      <text x="600" y="588" fontSize="13" fill="#157347" fontWeight="600" textAnchor="middle">The loop: re-nudge re-fires a fresh WhatsApp advice to the 7 who didn't act</text>
    </svg>
  );
}
```

---

## 4) `SlideReceiptThread.tsx`

The conversation *is* the diagram. Drop in verbatim.

```tsx
export function SlideReceiptThread() {
  return (
    <svg viewBox="0 0 1100 720" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="Receipt thread: a single WhatsApp conversation as the diagram, with every AWS, Meta, DynamoDB and Vercel service as a hairline footnote, and one green re-nudge loop returning to a fresh advice."
      style={{ display: "block", width: "100%", minWidth: 760, height: "auto" }}
      fontFamily="var(--font-inter), system-ui, sans-serif">
      <defs>
        <marker id="rt-ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#157347" />
        </marker>
      </defs>
      <rect x="0" y="0" width="1100" height="720" fill="#F6F2EA" />
      <text x="565" y="42" fill="#0E7490" fontSize="12" letterSpacing="2.5" textAnchor="middle" fontWeight="600">A SINGLE THREAD · LATUR DISTRICT</text>
      <text x="565" y="60" fill="#9aa18d" fontSize="11" textAnchor="middle">one cohort, today</text>

      {/* LEFT MARGIN — the whole stack as footnotes */}
      <g fontSize="12" fill="#5A554C" textAnchor="end">
        <rect x="446" y="118" width="6" height="6" fill="#157347" /><line x1="446" y1="121" x2="412" y2="121" stroke="#CFC8B8" />
        <text x="404" y="118"><tspan fontWeight="600" fill="#1A1714">Amazon EventBridge</tspan></text><text x="404" y="133">6-hour schedule fires</text>
        <rect x="446" y="158" width="6" height="6" fill="#157347" /><line x1="446" y1="161" x2="412" y2="161" stroke="#CFC8B8" />
        <text x="404" y="158"><tspan fontWeight="600" fill="#1A1714">WeatherPoller</tspan> λ → OpenWeatherMap</text><text x="404" y="173">dry spray window detected</text>
        <rect x="446" y="198" width="6" height="6" fill="#157347" /><line x1="446" y1="201" x2="412" y2="201" stroke="#CFC8B8" />
        <text x="404" y="198"><tspan fontWeight="600" fill="#1A1714">Step Functions → NudgeSender</tspan></text><text x="404" y="213">→ Meta WhatsApp Cloud API</text>
        <rect x="446" y="300" width="6" height="6" fill="#0E7490" /><line x1="446" y1="303" x2="412" y2="303" stroke="#CFC8B8" />
        <text x="404" y="300"><tspan fontWeight="600" fill="#1A1714">API Gateway → WebhookHandler</tspan></text><text x="404" y="315">the "Done" reply lands</text>
        <rect x="446" y="392" width="6" height="6" fill="#0E7490" /><line x1="446" y1="395" x2="412" y2="395" stroke="#CFC8B8" />
        <text x="404" y="392"><tspan fontWeight="600" fill="#1A1714">DynamoDB Streams → ResponseDetector</tspan></text><text x="404" y="407">flips the nudge to done</text>
        <rect x="446" y="432" width="6" height="6" fill="#0E7490" /><line x1="446" y1="435" x2="412" y2="435" stroke="#CFC8B8" />
        <text x="404" y="432"><tspan fontWeight="600" fill="#1A1714">OutcomesAggregator → SUMMARY#</tspan></text><text x="404" y="447">rolls up the 67%</text>
        <rect x="446" y="472" width="6" height="6" fill="#0E7490" /><line x1="446" y1="475" x2="412" y2="475" stroke="#CFC8B8" />
        <text x="404" y="472"><tspan fontWeight="600" fill="#1A1714">Vercel · keyless OIDC</tspan></text><text x="404" y="487">reads the proof, no stored keys</text>
      </g>

      {/* ghost re-entry bubble */}
      <rect x="458" y="76" width="210" height="30" rx="12" fill="#DCF8C6" opacity="0.4" stroke="#157347" strokeDasharray="3 4" strokeOpacity="0.6" />
      <text x="468" y="96" fontSize="11" fill="#157347" opacity="0.85" fontStyle="italic">…and again, for the 7 who slipped</text>

      {/* THE SPINE */}
      <rect x="452" y="112" width="226" height="104" rx="14" fill="#DCF8C6" />
      <text x="466" y="136" fontSize="11.5" fill="#1a2e1a">
        <tspan x="466" dy="0">Good window to spray cotton in</tspan>
        <tspan x="466" dy="15">Latur today — dry through evening.</tspan>
        <tspan x="466" dy="15">Reply <tspan fontWeight="700">Done</tspan> once you've sprayed.</tspan>
      </text>
      <text x="668" y="208" fontSize="9" fill="#6b7a5e" textAnchor="end">06:12 ✓✓</text>
      <text x="565" y="244" fontSize="15" fontFamily="Georgia, serif" fontStyle="italic" fill="#726A5C" textAnchor="middle">the farmer sprays, then replies —</text>
      <rect x="556" y="262" width="122" height="42" rx="14" fill="#FFFFFF" stroke="#E6E0D4" />
      <text x="617" y="288" fontSize="13" fill="#157347" fontWeight="700" textAnchor="middle">Done ✓</text>

      {/* proof card */}
      <rect x="448" y="330" width="230" height="168" rx="14" fill="#FFFFFF" stroke="#E6E0D4" />
      <text x="468" y="360" fontSize="10" fill="#726A5C" letterSpacing="1">FOLLOW-THROUGH · THIS MONTH</text>
      <text x="468" y="404" fontSize="40" fontFamily="Georgia, serif" fontWeight="500" fill="#157347">67%</text>
      <rect x="468" y="418" width="190" height="12" rx="6" fill="#157347" />
      <rect x="601" y="418" width="22" height="12" fill="#0E7490" />
      <rect x="625" y="418" width="33" height="12" rx="6" fill="#B54708" />
      <text x="468" y="452" fontSize="12.5" fill="#1A1714">28 of 42 farmers acted</text>
      <rect x="468" y="464" width="120" height="26" rx="13" fill="#157347" />
      <text x="528" y="481" fontSize="11.5" fill="#FFFFFF" fontWeight="600" textAnchor="middle">Re-nudge cohort</text>

      {/* THE LOOP — right gutter, proof → fresh advice */}
      <path d="M678 477 C 880 470, 880 120, 672 104" fill="none" stroke="#157347" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" markerEnd="url(#rt-ah)" />
      <text x="892" y="300" fontSize="13" fill="#157347" fontWeight="600" transform="rotate(90 892 300)" textAnchor="middle">RE-NUDGE LOOP — a fresh advice for the 7 who didn't act</text>
      <text x="220" y="560" fontSize="12.5" fill="#726A5C" textAnchor="middle">The conversation is the diagram. Every service sits beside the message it touches.</text>
    </svg>
  );
}
```

> Note: JSX requires camelCase SVG attributes (`fontSize`, `strokeWidth`, `markerEnd`, `letterSpacing`,
> `textAnchor`, `strokeDasharray`, `strokeOpacity`, `fontStyle`, `fontFamily`). They're already camelCase
> above — paste as-is.

---

## 5) Edit `app/page.tsx` — wire the gallery + cut the repetition

In the `#architecture` section:

- **Keep** the eyebrow, the headline (`Control plane, data plane, engine.`) and the intro paragraph.
- **Replace** `<ArchitectureLoop />` with `<ArchitectureGallery />` (import from
  `@/app/components/architecture/ArchitectureGallery`).
- **Delete** the body paragraph that begins *"The engine runs on an Amazon EventBridge schedule…"*
  (it's now covered by slide 1's caption + the cards).
- **Delete** the closing paragraph that begins *"One DynamoDB table is the source of truth…"*
  (pure restate; also carried the inaccurate "Vercel Marketplace" claim).
- **Keep** the "Built on" cards, but fix one line (see below).

Resulting flow: `Eyebrow → headline → intro → <ArchitectureGallery/> → "Built on" cards`. Clean.

### Accuracy fix in the "Built on" cards (Vercel card, 3rd bullet)

```
- "Audit log to DynamoDB via the Vercel Marketplace integration"
+ "Audit log to DynamoDB, keyless via OIDC"
```

You reach DynamoDB by **OIDC role assumption** (`outturn-vercel-oidc`, `awsCredentialsProvider`),
not a Vercel-Marketplace-provisioned database — a technical judge could call that out. If you
installed the AWS connector *from* Vercel's marketplace, "keyless via OIDC" is still the correct,
defensible phrasing. (Also confirm the award is literally named **"AWS AIdeas"** before it ships.)

---

## 6) Reuse in the Devpost article

Devpost is markdown/HTML — it can't render React, but it *can* embed images. So:

- Save each slide's SVG as a standalone file in `public/architecture/`:
  `teardown.svg`, `receipt-thread.svg`, `three-planes.svg` (export the `<ArchitectureLoop>` SVG too).
  Each is already a self-contained `<svg>` — just wrap with the XML header
  `<?xml version="1.0" encoding="UTF-8"?>` and replace `var(--font-inter)/var(--font-serif)` with
  literal `Georgia, serif` / `system-ui, sans-serif` so they render outside the app.
- For the article, embed them as images (GitHub/most renderers accept SVG; if a host rejects SVG,
  export to PNG at 2× via any SVG→PNG step).
- Caption each image in the article with the same one-liners used in the gallery captions.

---

## 7) Pitfalls (so it doesn't regress)

1. The gallery panels are **wide** (1100–1280 viewBox). Keep each slide's inner `overflow-x: auto`
   so narrow screens scroll the diagram rather than squashing it. Don't force the SVG below ~760px wide.
2. Captions are the *only* prose under the gallery now — keep them to one line each. Do **not**
   reintroduce the deleted paragraphs; that repetition is exactly what we removed.
3. The green re-nudge loop is the **only** saturated stroke in the Teardown/Receipt-Thread SVGs.
   Teal + amber appear **only** inside the real dashboard bar. Don't add a second colored loop.
4. Dots/arrows must be real buttons with `aria-label`; the track keeps `scroll-snap` so swipe + click
   stay in sync (the `onScroll` handler updates the active dot).
5. Respect `prefers-reduced-motion` if you later animate slide transitions — default is plain scroll.
