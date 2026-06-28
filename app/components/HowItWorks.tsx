"use client";

import { useEffect, useState, useCallback } from "react";

type Step = {
  key: string;
  short: string;
  title: string;
  plain: string;
  tech: string;
  services: string[];
  stage: () => React.ReactNode;
};

/** Real-product palette, mirrored from the design tokens so each stage looks
 *  exactly like the live app rendered inside a browser/phone frame. */
const C = {
  primary: "#157347",
  primaryHover: "#0F5132",
  tint: "#E6F4EC",
  ink: "#101828",
  text2: "#475467",
  muted: "#667085",
  faint: "#98A2B3",
  border: "#E4E7EC",
  pageBg: "#F4F6F8",
  chart1: "#157347",
  chart2: "#0E7490",
  chart3: "#B54708",
  warn: "#B54708",
  warnBg: "#FEF0C7",
};

const STEP_MS = 3900;

// =============================================================================
// Frames — these are what make it read as the *real* product, not a cartoon.
// =============================================================================

function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 326,
        background: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          background: C.pageBg,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span style={{ display: "flex", gap: 5 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: 999, background: c }} />
          ))}
        </span>
        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 10.5,
            color: C.muted,
            background: "#fff",
            borderRadius: 6,
            padding: "3px 10px",
            border: `1px solid ${C.border}`,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {url}
        </span>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 220,
        background: "#000",
        borderRadius: 26,
        padding: 6,
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ background: "#ECE5DD", borderRadius: 20, overflow: "hidden" }}>
        {/* WhatsApp top bar */}
        <div
          style={{
            background: "#075E54",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
          }}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>‹</span>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
              <path d="M24 44C24 36 24 31 24 26" stroke={C.primary} strokeWidth="2.8" strokeLinecap="round" />
              <path d="M24 27C14 24 8.5 17 8.5 7C19 10 24 18 24 27Z" fill={C.primary} />
              <path d="M24 27C34 24 39.5 17 39.5 7C29 10 24 18 24 27Z" fill={C.primary} opacity="0.85" />
            </svg>
          </span>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Outturn Advisory</div>
            <div style={{ fontSize: 9, opacity: 0.8 }}>online</div>
          </div>
        </div>
        {/* Chat */}
        <div
          style={{
            padding: "12px 10px",
            minHeight: 210,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Chat bubble helpers (English-primary, native language as a subtle second line).
const bubble = (align: "in" | "out"): React.CSSProperties => ({
  borderRadius: 10,
  padding: "7px 9px 5px",
  fontSize: 12,
  lineHeight: 1.4,
  maxWidth: "88%",
  boxShadow: "0 1px 1px rgba(0,0,0,0.12)",
  background: align === "in" ? "#fff" : "#DCF8C6",
  alignSelf: align === "in" ? "flex-start" : "flex-end",
});
const metaStyle: React.CSSProperties = { fontSize: 9, color: "#667781", marginTop: 3, textAlign: "right" };
const nativeStyle: React.CSSProperties = { color: C.muted, marginTop: 4, fontSize: 10.5, fontStyle: "italic" };

// =============================================================================
// Stages — each renders a faithful slice of the live UI.
// =============================================================================

function NudgeStage({ withReply }: { withReply?: boolean }) {
  return (
    <PhoneFrame>
      <div style={bubble("in")}>
        <div style={{ color: "#111", fontWeight: 500 }}>
          Good conditions to spray your cotton in Latur today: wind 8 km/h, no rain. Reply
          &ldquo;Done&rdquo; once you&rsquo;ve sprayed. 🌾
        </div>
        <div style={nativeStyle}>आज लातूर में कपास पर छिड़काव के लिए मौसम अच्छा है।</div>
        <div style={metaStyle}>9:24 AM</div>
      </div>

      {withReply && (
        <>
          <div className="hiw-anim" style={bubble("out")}>
            <div style={{ color: "#111", fontWeight: 600 }}>
              Done ✅{" "}
              <span style={{ fontWeight: 400, color: C.muted, fontSize: 10.5 }}>(हो गया)</span>
            </div>
            <div style={{ ...metaStyle, color: "#5a8a6f" }}>
              9:51 AM <span style={{ color: "#34B7F1" }}>✓✓</span>
            </div>
          </div>
          <div className="hiw-anim" style={bubble("in")}>
            <div style={{ color: "#111" }}>Great, that&rsquo;s logged. Thank you! 🎉</div>
            <div style={nativeStyle}>बहुत अच्छा! आपका काम पूरा हो गया।</div>
            <div style={metaStyle}>9:51 AM</div>
          </div>
        </>
      )}
    </PhoneFrame>
  );
}

function WeatherStage() {
  return (
    <BrowserFrame url="outturn.vercel.app/dashboard">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>Latur</div>
          <div style={{ fontSize: 11.5, color: C.muted }}>Cotton · 24 farmers</div>
        </div>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: C.primary,
            background: C.tint,
            padding: "3px 9px",
            borderRadius: 999,
          }}
        >
          Active
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 12px",
          borderRadius: 10,
          background: C.tint,
          border: "1px solid rgba(21,115,71,0.2)",
        }}
      >
        <svg width="30" height="24" viewBox="0 0 120 92">
          <circle cx="86" cy="26" r="15" fill="#FCD34D" />
          <path d="M30 64h54a16 16 0 100-32 22 22 0 00-42 6 14 14 0 00-12 26z" fill="#fff" />
        </svg>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.primaryHover }}>Spray window clear</div>
          <div style={{ fontSize: 11, color: "#3b6b52" }}>wind 8 km/h · no rain · today</div>
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: C.faint, marginTop: 12, textAlign: "center" }}>
        Weather checked automatically · just now
      </div>
    </BrowserFrame>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} /> {label}
    </span>
  );
}

function RollupStage() {
  const total = 24;
  return (
    <BrowserFrame url="outturn.vercel.app/dashboard/cohorts/latur">
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: C.faint,
          marginBottom: 10,
          fontWeight: 600,
        }}
      >
        Follow-through breakdown
      </div>
      <div style={{ height: 34, borderRadius: 8, overflow: "hidden", display: "flex", background: C.pageBg }}>
        <div style={{ width: `${(17 / total) * 100}%`, background: C.chart1 }} />
        <div style={{ width: `${(2 / total) * 100}%`, background: C.chart2 }} />
        <div style={{ width: `${(5 / total) * 100}%`, background: C.chart3 }} />
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11.5, color: C.text2, flexWrap: "wrap" }}>
        <Legend color={C.chart1} label="Done (17)" />
        <Legend color={C.chart2} label="Pending (2)" />
        <Legend color={C.chart3} label="Expired (5)" />
      </div>
      <div style={{ marginTop: 14, fontSize: 14, fontWeight: 600, color: C.ink }}>
        17 of 24 farmers confirmed they acted
      </div>
    </BrowserFrame>
  );
}

function KpiMini({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        padding: "11px 12px",
        borderRadius: 10,
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderTop: highlight ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: C.faint,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: highlight ? C.primary : C.ink,
          marginTop: 4,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ProofStage() {
  return (
    <BrowserFrame url="outturn.vercel.app/dashboard">
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: C.faint,
          marginBottom: 10,
          fontWeight: 600,
        }}
      >
        Latur cotton cohort · this month
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <KpiMini label="Reminders sent" value="24" />
        <KpiMini label="Responses" value="17" />
        <KpiMini label="Follow-through" value="71%" highlight />
        <KpiMini label="Farmers" value="24" />
      </div>
    </BrowserFrame>
  );
}

function ActionStage() {
  return (
    <BrowserFrame url="outturn.vercel.app/dashboard/cohorts/latur">
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          background: C.warnBg,
          border: "1px solid rgba(181,71,8,0.25)",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.warn }}>7 farmers haven&rsquo;t acted yet</div>
        <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>
          Send a fresh reminder to the ones who haven&rsquo;t confirmed.
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            background: C.primary,
            padding: "7px 14px",
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(21,115,71,0.35)",
          }}
        >
          Re-nudge cohort
        </span>
      </div>
      <div
        className="hiw-anim"
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          borderRadius: 10,
          background: C.ink,
          color: "#fff",
          fontSize: 12,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6EE7A8" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Sent 5 reminders · 2 skipped (still pending)
      </div>
    </BrowserFrame>
  );
}

const STEPS: Step[] = [
  {
    key: "weather",
    short: "Weather",
    title: "1 · Watch the weather",
    plain:
      "Outturn watches each cohort's local weather for the right moment to act — like a safe, low-wind spraying window.",
    tech: "Amazon EventBridge fires on a schedule; a WeatherPoller Lambda checks OpenWeatherMap and only starts the Step Functions workflow when conditions are favorable.",
    services: ["Amazon EventBridge", "AWS Lambda · WeatherPoller", "OpenWeatherMap API", "AWS Step Functions"],
    stage: () => <WeatherStage />,
  },
  {
    key: "nudge",
    short: "Reminder",
    title: "2 · Send a WhatsApp reminder",
    plain:
      "When conditions are right, every farmer gets a plain-language WhatsApp reminder, in their own language, no app to install.",
    tech: "Step Functions invokes the NudgeSender Lambda, which sends an interactive WhatsApp message (Done / Not Yet) via Meta's WhatsApp Cloud API.",
    services: ["AWS Step Functions", "AWS Lambda · NudgeSender", "Meta WhatsApp Cloud API"],
    stage: () => <NudgeStage />,
  },
  {
    key: "reply",
    short: "Reply",
    title: "3 · Farmers reply",
    plain: "Farmers reply 'Done' right inside WhatsApp the moment they act, in the language they speak.",
    tech: "The reply hits the WhatsApp webhook (Meta to API Gateway, then a WebhookHandler Lambda), which records it in the single-table, tenant-scoped DynamoDB design.",
    services: ["Meta WhatsApp Cloud API", "Amazon API Gateway", "AWS Lambda · WebhookHandler", "Amazon DynamoDB"],
    stage: () => <NudgeStage withReply />,
  },
  {
    key: "rollup",
    short: "Roll-up",
    title: "4 · Roll up the cohort",
    plain:
      "Replies are tallied across the whole cohort, so follow-through is measured, not guessed.",
    tech: "A ResponseDetector Lambda flips the nudge to done via DynamoDB Streams; the OutcomesAggregator Lambda then rolls outcomes into a SUMMARY# record.",
    services: ["Amazon DynamoDB Streams", "AWS Lambda · ResponseDetector", "AWS Lambda · OutcomesAggregator"],
    stage: () => <RollupStage />,
  },
  {
    key: "proof",
    short: "Proof",
    title: "5 · The partner sees the proof",
    plain:
      "The sponsoring partner sees real follow-through: outcomes, not just messages sent.",
    tech: "The Vercel-hosted dashboard reads the pre-computed SUMMARY# record, so loads stay fast and cheap.",
    services: ["Vercel · Next.js", "Amazon DynamoDB · SUMMARY#"],
    stage: () => <ProofStage />,
  },
  {
    key: "action",
    short: "Re-nudge",
    title: "6 · Close the loop",
    plain:
      "Where farmers haven't acted, the partner re-nudges them in one click. Outturn skips anyone who still has a pending reminder, then reports exactly how many were reached.",
    tech: "From the Vercel control plane (keyless via OIDC), re-nudge starts a Step Functions execution; NudgeSender re-sends only to farmers without an open nudge, and the action is written to an audit log.",
    services: ["Vercel · OIDC → AWS", "AWS Step Functions · StartExecution", "Audit log · DynamoDB"],
    stage: () => <ActionStage />,
  },
];

export function HowItWorks({ allowTech = true }: { allowTech?: boolean }) {
  const [index, setIndex] = useState(0);
  const [tech, setTech] = useState(false);
  const [playing, setPlaying] = useState(true);
  const step = STEPS[index];

  const next = useCallback(() => setIndex((i) => (i + 1) % STEPS.length), []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(next, STEP_MS);
    return () => clearTimeout(t);
  }, [playing, index, next]);

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        overflow: "hidden",
      }}
    >
      <div className="hiw-2col">
        {/* LEFT — the device on a contained dark surface */}
        <div
          style={{
            position: "relative",
            minHeight: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(130% 90% at 50% -10%, rgba(110,231,168,0.10), transparent 55%), #14110D",
            padding: 22,
          }}
        >
          {playing && (
            <div
              key={`prog-${index}`}
              style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.12)" }}
            >
              <div
                style={{ height: "100%", background: "#6EE7A8", animation: `hiw-progress ${STEP_MS}ms linear forwards` }}
              />
            </div>
          )}
          <div key={`${step.key}-${tech}`} className="hiw-anim" style={{ display: "flex", justifyContent: "center" }}>
            {step.stage()}
          </div>
          {allowTech && (
            <button
              onClick={() => setTech((t) => !t)}
              style={{
                position: "absolute",
                top: 14,
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
          )}
        </div>

        {/* RIGHT — caption + vertical stepper + controls */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div key={`${step.key}-${tech}-cap`} className="hiw-anim" style={{ minHeight: 92 }}>
            <h3 className="text-card-title" style={{ marginBottom: 6 }}>
              {step.title}
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, lineHeight: 1.55 }}>
              {tech ? step.tech : step.plain}
            </p>
            {tech && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                {step.services.map((s) => (
                  <span
                    key={s}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "5px 10px",
                      borderRadius: 8,
                      background: "var(--color-primary-tint)",
                      color: "var(--color-primary-hover)",
                      border: "1px solid rgba(21,115,71,0.25)",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: C.primary }} />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Vertical stepper */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 16 }}>
            {STEPS.map((s, i) => {
              const active = i === index;
              const done = i < index;
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    setIndex(i);
                    setPlaying(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    background: active ? "var(--color-primary-tint)" : "transparent",
                    border: `1px solid ${active ? C.primary : "transparent"}`,
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
                      background: active || done ? C.primary : "var(--color-border)",
                      color: active || done ? "#fff" : "var(--color-text-muted)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 500,
                      color: active ? C.primary : "var(--color-text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.short}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 16 }}>
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
            <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--color-text-muted)" }}>
              The same loop runs in the live demo.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
