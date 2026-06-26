"use client";

import { useEffect, useState, useCallback } from "react";

type Step = {
  key: string;
  short: string;
  title: string;
  plain: string;
  tech: string;
  stage: () => React.ReactNode;
};

const PRIMARY = "#157347";

/** Services called out per step when "Show the tech" is on. */
const STEP_SERVICES: Record<string, string[]> = {
  weather: ["AWS Step Functions", "Amazon EventBridge", "OpenWeatherMap API"],
  nudge: ["AWS Lambda", "WhatsApp Business API"],
  reply: ["Amazon DynamoDB", "Single-table · tenant-scoped"],
  rollup: ["DynamoDB Streams", "AWS Lambda · OutcomesAggregator"],
  dashboard: ["Amazon DynamoDB · SUMMARY#", "Next.js on Vercel"],
};

function Cloud() {
  return (
    <div className="hiw-anim" style={{ textAlign: "center", color: "#fff" }}>
      <svg width="120" height="92" viewBox="0 0 120 92" fill="none">
        <circle cx="86" cy="26" r="16" fill="#FCD34D" />
        <path d="M30 64h54a16 16 0 100-32 22 22 0 00-42 6 14 14 0 00-12 26z" fill="#fff" opacity="0.96" />
        <path d="M44 72v8M60 72v10M76 72v8" stroke="#BAE6FD" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div
        style={{
          marginTop: 12,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.14)",
          padding: "5px 12px",
          borderRadius: 999,
          fontSize: 13,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: "#6EE7A8" }} /> Latur · wind 8 km/h · spray window clear
      </div>
    </div>
  );
}

/** WhatsApp-style chat using real AgriNexus AI message content (Hindi + English). */
function Phone({ stage }: { stage: "nudge" | "reply" }) {
  const bubbleBase: React.CSSProperties = {
    borderRadius: 10,
    padding: "7px 9px 5px",
    fontSize: 12,
    lineHeight: 1.4,
    maxWidth: "82%",
    boxShadow: "0 1px 1px rgba(0,0,0,0.12)",
    position: "relative",
  };
  const meta: React.CSSProperties = { fontSize: 9, color: "#667781", marginTop: 3, textAlign: "right" };

  return (
    <div className="hiw-anim" style={{ width: 230 }}>
      <div style={{ background: "#000", borderRadius: 28, padding: 6, boxShadow: "0 14px 40px rgba(0,0,0,0.4)" }}>
        <div style={{ background: "#ECE5DD", borderRadius: 22, overflow: "hidden" }}>
          {/* WhatsApp top bar */}
          <div style={{ background: "#075E54", color: "#fff", display: "flex", alignItems: "center", gap: 8, padding: "9px 10px" }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>‹</span>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                <path d="M24 44C24 36 24 31 24 26" stroke={PRIMARY} strokeWidth="2.8" strokeLinecap="round" />
                <path d="M24 27C14 24 8.5 17 8.5 7C19 10 24 18 24 27Z" fill={PRIMARY} />
                <path d="M24 27C34 24 39.5 17 39.5 7C29 10 24 18 24 27Z" fill={PRIMARY} opacity="0.85" />
              </svg>
            </span>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Outturn Advisory</div>
              <div style={{ fontSize: 9, opacity: 0.8 }}>online</div>
            </div>
          </div>

          {/* Chat */}
          <div style={{ padding: "12px 10px", minHeight: 188, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Incoming nudge */}
            <div style={{ ...bubbleBase, background: "#fff", alignSelf: "flex-start" }}>
              <div style={{ color: "#111", fontWeight: 500 }}>
                नमस्ते 🙏 आज लातूर में कपास पर छिड़काव के लिए मौसम अच्छा है — हवा 8 km/h, बारिश नहीं।
              </div>
              <div style={{ color: "#3b6b52", marginTop: 4, fontSize: 11 }}>
                Good weather to spray cotton in Latur today — wind 8 km/h, no rain. Reply &quot;हो गया&quot; once sprayed.
              </div>
              <div style={meta}>9:24 AM</div>
            </div>

            {stage === "reply" && (
              <>
                {/* Outgoing farmer reply */}
                <div className="hiw-anim" style={{ ...bubbleBase, background: "#DCF8C6", alignSelf: "flex-end" }}>
                  <div style={{ color: "#111", fontWeight: 600 }}>हो गया ✅</div>
                  <div style={{ ...meta, color: "#5a8a6f" }}>
                    9:51 AM <span style={{ color: "#34B7F1" }}>✓✓</span>
                  </div>
                </div>
                {/* Completion */}
                <div className="hiw-anim" style={{ ...bubbleBase, background: "#fff", alignSelf: "flex-start" }}>
                  <div style={{ color: "#111" }}>बहुत अच्छा! आपका काम पूरा हो गया 🎉</div>
                  <div style={{ color: "#3b6b52", marginTop: 4, fontSize: 11 }}>Great — marked complete. Thank you!</div>
                  <div style={meta}>9:51 AM</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Rollup() {
  return (
    <div className="hiw-anim" style={{ textAlign: "center" }}>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center", maxWidth: 230 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: i < 17 ? "#6EE7A8" : "rgba(255,255,255,0.32)",
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 14, color: "#fff", fontSize: 14, fontWeight: 500 }}>17 of 24 farmers confirmed</div>
    </div>
  );
}

function DashCard() {
  return (
    <div
      className="hiw-anim"
      style={{ width: 230, padding: 18, borderRadius: 14, background: "#fff", boxShadow: "0 14px 40px rgba(0,0,0,0.3)" }}
    >
      <p style={{ fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", color: "#98A2B3", margin: 0 }}>
        Follow-through rate
      </p>
      <p style={{ fontSize: 36, fontWeight: 700, color: PRIMARY, margin: "2px 0 8px", fontVariantNumeric: "tabular-nums" }}>
        70%
      </p>
      <div style={{ height: 8, borderRadius: 999, background: "#E6F4EC", overflow: "hidden" }}>
        <div style={{ width: "70%", height: "100%", background: PRIMARY }} />
      </div>
      <p style={{ fontSize: 11, color: "#475467", margin: "8px 0 0" }}>Latur cotton cohort · this month</p>
    </div>
  );
}

const STEPS: Step[] = [
  {
    key: "weather",
    short: "Watch weather",
    title: "1 · Watch the weather",
    plain: "Outturn checks each village's weather every day, looking for the right moment to act.",
    tech: "A scheduled job polls weather per cohort's district coordinates (AWS Step Functions).",
    stage: () => <Cloud />,
  },
  {
    key: "nudge",
    short: "Send reminder",
    title: "2 · Send a WhatsApp reminder",
    plain: "When conditions are right, farmers get a plain-language WhatsApp reminder — like a safe spraying window.",
    tech: "A nudge is dispatched to each farmer via the WhatsApp Business API.",
    stage: () => <Phone stage="nudge" />,
  },
  {
    key: "reply",
    short: "Farmer replies",
    title: "3 · Farmers reply",
    plain: "Farmers reply 'हो गया' (Done) right inside WhatsApp — no app to install, in their own language.",
    tech: "Each reply is written to Amazon DynamoDB in a tenant-scoped, single-table design.",
    stage: () => <Phone stage="reply" />,
  },
  {
    key: "rollup",
    short: "Roll up village",
    title: "4 · Roll up the village",
    plain: "Replies are tallied across the whole village group, so follow-through is measured — not guessed.",
    tech: "DynamoDB Streams trigger the OutcomesAggregator Lambda, which maintains a SUMMARY# record.",
    stage: () => <Rollup />,
  },
  {
    key: "dashboard",
    short: "See the proof",
    title: "5 · Partner sees the proof",
    plain: "The sponsoring partner sees real follow-through — not just messages sent — and funds what works.",
    tech: "The dashboard reads the pre-computed SUMMARY# record for fast, cheap loads.",
    stage: () => <DashCard />,
  },
];

export function HowItWorks() {
  const [index, setIndex] = useState(0);
  const [tech, setTech] = useState(false);
  const [playing, setPlaying] = useState(true);
  const step = STEPS[index];

  const next = useCallback(() => setIndex((i) => (i + 1) % STEPS.length), []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(next, 3600);
    return () => clearTimeout(t);
  }, [playing, index, next]);

  return (
    <div style={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", overflow: "hidden" }}>
      {/* Stage */}
      <div
        style={{
          position: "relative",
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0B1F17 0%, #157347 100%)",
          padding: 32,
        }}
      >
        <div key={`${step.key}-${tech}`} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          {step.stage()}
        </div>
        <button
          onClick={() => setTech((t) => !t)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(255,255,255,0.16)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            padding: "5px 11px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.25)",
            cursor: "pointer",
          }}
        >
          {tech ? "Hide the tech" : "Show the tech"}
        </button>
      </div>

      {/* Caption */}
      <div style={{ padding: 24 }}>
        <div key={`${step.key}-${tech}-cap`} className="hiw-anim" style={{ minHeight: 96 }}>
          <h3 className="text-card-title" style={{ marginBottom: 6 }}>
            {step.title}
          </h3>
          <p style={{ color: "var(--color-text-secondary)" }}>{tech ? step.tech : step.plain}</p>
          {tech && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {STEP_SERVICES[step.key].map((s) => (
                <span
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: "5px 11px",
                    borderRadius: 8,
                    background: "var(--color-primary-tint)",
                    color: "var(--color-primary-hover)",
                    border: "1px solid rgba(21,115,71,0.25)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: PRIMARY }} />
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          {STEPS.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.key}
                onClick={() => {
                  setIndex(i);
                  setPlaying(false);
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  background: active ? PRIMARY : "var(--color-surface)",
                  border: `1px solid ${active || i < index ? PRIMARY : "var(--color-border)"}`,
                  transition: "all 160ms ease",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    background: active ? "rgba(255,255,255,0.22)" : "var(--color-primary-tint)",
                    color: active ? "#fff" : PRIMARY,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: active ? "#fff" : "var(--color-text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.short}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <button onClick={() => setPlaying((p) => !p)} className="btn btn-secondary" style={{ fontSize: 13 }}>
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              setIndex(0);
              setPlaying(true);
            }}
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
          >
            Replay
          </button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-muted)" }}>
            The same loop runs live in the demo dashboard.
          </span>
        </div>
      </div>
    </div>
  );
}
