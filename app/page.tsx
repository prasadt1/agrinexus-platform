import Link from "next/link";
import { HowItWorks } from "@/app/components/HowItWorks";
import { TryDemoButton } from "@/app/components/TryDemoButton";
import { OutturnMark } from "@/app/components/OutturnMark";

const WA_LINK =
  "https://wa.me/4915120105731?text=Hi%20Outturn%2C%20show%20me%20the%20advisory%20demo";

const C = {
  cream: "#F6F2EA",
  cream2: "#FBF8F2",
  ink: "#1A1714",
  muted: "#5A554C",
  faint: "#726A5C",
  green: "#157347",
  greenD: "#0F5132",
  greenTint: "#E9F1EB",
  border: "#E6E0D4",
  white: "#FFFFFF",
  teal: "#0E7490",
  amber: "#B54708",
  dark: "#14110D",
};

const SERIF = "var(--font-serif), Georgia, 'Times New Roman', serif";

function Check({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Eyebrow({ children, onDark }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <p
      style={{
        fontSize: 12,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        color: onDark ? "#6EE7A8" : C.green,
        fontWeight: 500,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: C.cream, color: C.ink, fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
      {/* Nav */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 32px",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 11 }}>
          <OutturnMark size={46} />
          <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontFamily: SERIF, fontSize: 24, color: C.ink, fontWeight: 500 }}>
              Out<span style={{ color: C.green }}>turn</span>
            </span>
            <span style={{ fontSize: 11.5, color: C.faint, marginTop: 2, letterSpacing: "0.01em" }}>
              Advice, followed through
            </span>
          </span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 14, color: C.muted }}>
          <a href="#how" style={{ color: C.muted, textDecoration: "none" }} className="hidden sm:inline">
            How it works
          </a>
          <a href="#why" style={{ color: C.muted, textDecoration: "none" }} className="hidden sm:inline">
            Why it matters
          </a>
          <a href="#pricing" style={{ color: C.muted, textDecoration: "none" }} className="hidden sm:inline">
            Plans
          </a>
          <a href="#architecture" style={{ color: C.muted, textDecoration: "none" }} className="hidden sm:inline">
            Architecture
          </a>
          <TryDemoButton
            style={{
              background: C.green,
              color: C.white,
              fontSize: 14,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try the live demo
          </TryDemoButton>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 32px 64px" }}>
        <div className="hero-grid">
          <div>
            <Eyebrow>Closed-loop farm advisory on WhatsApp</Eyebrow>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(44px, 7vw, 68px)",
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                margin: "18px 0 20px",
                fontWeight: 500,
              }}
            >
              From advice to action.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: C.muted, maxWidth: 480, margin: "0 0 28px" }}>
              A closed-loop engine nudges each farmer until they act. Outturn gives partners eyes on
              follow-through across every district, and the lever to act where it slips.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <TryDemoButton
                style={{
                  background: C.green,
                  color: C.white,
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "12px 22px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Try the live demo
              </TryDemoButton>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  color: C.ink,
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.05-.96.24-3.23-.67-2.74-1.08-4.46-3.88-4.6-4.06-.13-.18-1.1-1.46-1.1-2.79 0-1.32.7-1.97.94-2.24a1 1 0 01.72-.34c.18 0 .36.01.51.01.17 0 .39-.06.6.46.24.56.81 1.94.88 2.08.07.14.12.31.02.49-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.27.71 1.17 1.53 1.9 1.05.93 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.81.86.27.14.45.2.51.31.07.12.07.66-.17 1.34z" />
                </svg>
                See it on WhatsApp
              </a>
            </div>
            <p style={{ fontSize: 12.5, color: C.faint, margin: "12px 0 0" }}>
              Message our demo number and the engine replies like it would to a farmer: advice, then a
              follow-up nudge.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 26, fontSize: 12.5, color: C.faint }}>
              <span>Weather-timed</span>
              <span>·</span>
              <span>Tracked to done</span>
              <span>·</span>
              <span>Rolled up per district</span>
            </div>
          </div>

          {/* Product shot */}
          <div style={{ position: "relative" }}>
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 20 }}>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.faint,
                  margin: 0,
                }}
              >
                Latur cotton cohort · this month
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "12px 0 4px" }}>
                <span style={{ fontFamily: SERIF, fontSize: 52, color: C.green, lineHeight: 1, fontWeight: 500 }}>67%</span>
                <span style={{ fontSize: 14, color: C.muted }}>follow-through</span>
              </div>
              <div
                style={{
                  height: 12,
                  borderRadius: 999,
                  overflow: "hidden",
                  display: "flex",
                  background: "#F0EBE0",
                  margin: "12px 0 10px",
                }}
              >
                <div style={{ width: "67%", background: C.green }} />
                <div style={{ width: "12%", background: C.teal }} />
                <div style={{ width: "21%", background: C.amber }} />
              </div>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>28 of 42 farmers acted</p>
              <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ background: C.green, color: C.white, fontSize: 13, padding: "8px 14px", borderRadius: 9 }}>
                  Re-nudge cohort
                </span>
                <span style={{ fontSize: 13, color: C.faint }}>7 haven&apos;t acted</span>
              </div>
            </div>
            <span
              style={{
                position: "absolute",
                top: -12,
                right: -8,
                background: C.green,
                color: C.white,
                fontSize: 13,
                fontWeight: 500,
                padding: "6px 13px",
                borderRadius: 999,
              }}
            >
              +9% this month
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ background: C.cream2, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 32px" }}>
          <Eyebrow>How it works</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, margin: "12px 0 6px", fontWeight: 500 }}>
            See the loop run, end to end.
          </h2>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 620, margin: "0 0 28px", lineHeight: 1.6 }}>
            A nudge is one timely WhatsApp message telling a farmer to act now, in their own language.
            Outturn watches each district&apos;s weather, sends only when conditions are right, and follows
            up until the farmer confirms or the window closes. Tap a step or watch it play.
          </p>
          <HowItWorks />
        </div>
      </section>

      {/* Differentiator */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 32px" }}>
        <Eyebrow>The differentiator</Eyebrow>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, margin: "12px 0 26px", fontWeight: 500 }}>
          Where farm advisors stop, the loop begins.
        </h2>
        <div className="diff-grid">
          <div style={{ background: C.cream2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
            <p style={{ fontSize: 11.5, letterSpacing: "0.06em", textTransform: "uppercase", color: C.faint, margin: "0 0 14px" }}>
              Table stakes · every advisor does this
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, fontSize: 15, color: C.muted }}>
              <span style={{ display: "flex", gap: 9 }}><Check color="#B6AE9E" />WhatsApp-native advice</span>
              <span style={{ display: "flex", gap: 9 }}><Check color="#B6AE9E" />Local languages</span>
              <span style={{ display: "flex", gap: 9 }}><Check color="#B6AE9E" />Photo and voice diagnosis</span>
            </div>
          </div>
          <div style={{ background: C.white, border: `2px solid ${C.green}`, borderRadius: 14, padding: 22 }}>
            <p style={{ fontSize: 11.5, letterSpacing: "0.06em", textTransform: "uppercase", color: C.green, margin: "0 0 14px" }}>
              The closed loop · only Outturn
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, fontSize: 15, color: C.ink }}>
              <span style={{ display: "flex", gap: 9 }}><Check color={C.green} />Weather-gated nudges, fired at the right moment</span>
              <span style={{ display: "flex", gap: 9 }}><Check color={C.green} />Tracks whether the farmer actually acted</span>
              <span style={{ display: "flex", gap: 9 }}><Check color={C.green} />Reminders cancel the moment they confirm done</span>
              <span style={{ display: "flex", gap: 9 }}><Check color={C.green} />Follow-through rolled up per district</span>
              <span style={{ display: "flex", gap: 9 }}><Check color={C.green} />A control plane for partners to act on it</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 18 }}>
          Peers like Farmer.Chat, iSDA, and AgriChat deliver the advice. None we found documents the
          closed loop.
        </p>
      </section>

      {/* How partners run it */}
      <section style={{ background: C.cream2, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 32px" }}>
          <Eyebrow>For partners</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, margin: "12px 0 28px", fontWeight: 500 }}>
            Provision, license, monitor, act.
          </h2>
          <div className="steps-grid">
            {[
              ["1", "Provision a cohort", "A district’s farmers with their crops and languages. The engine starts watching that area’s weather."],
              ["2", "License it", "Activate per cohort on a Starter, Growth, or Scale plan. Checkout runs through Stripe."],
              ["3", "Monitor follow-through", "Watch confirmed action per cohort and per district, not message-delivery receipts."],
              ["4", "Act where it slips", "Re-nudge the farmers who haven’t acted, manually or on an automated schedule."],
            ].map(([n, title, body]) => (
              <div key={n}>
                <span
                  style={{
                    display: "inline-flex",
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    background: C.greenTint,
                    color: C.green,
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 12,
                  }}
                >
                  {n}
                </span>
                <h3 style={{ fontFamily: SERIF, fontSize: 19, margin: "0 0 6px", fontWeight: 500 }}>{title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>

          {/* Plans — folded under the partner section, real Stripe tiers */}
          <div id="pricing" style={{ marginTop: 44, paddingTop: 40, borderTop: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: SERIF, fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.15, margin: "0 0 6px", fontWeight: 500 }}>
              Plans that scale with your farmers.
            </h3>
            <p style={{ fontSize: 15, color: C.muted, maxWidth: 640, margin: "0 0 24px", lineHeight: 1.6 }}>
              Every plan is the full closed loop: WhatsApp advisory, audited follow-through, and the
              monitoring dashboard. You choose the tier by how many farmers you reach, and the cost per
              farmer falls as you grow. Each cohort activates through Stripe checkout.
            </p>
            <div className="arch-grid">
              {([
                ["Starter", "₹999", "up to 50 farmers", "≈ ₹240 / farmer / year", false],
                ["Growth", "₹2,999", "up to 250 farmers", "≈ ₹144 / farmer / year", true],
                ["Scale", "₹9,999", "up to 1,000 farmers", "≈ ₹120 / farmer / year", false],
              ] as [string, string, string, string, boolean][]).map(([name, price, cap, perFarmer, popular]) => (
                <div
                  key={name}
                  style={{
                    position: "relative",
                    background: C.white,
                    border: popular ? `2px solid ${C.green}` : `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: 22,
                  }}
                >
                  {popular && (
                    <span style={{ position: "absolute", top: -11, left: 22, background: C.green, color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>
                      Most popular
                    </span>
                  )}
                  <h4 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 2px", fontWeight: 500 }}>{name}</h4>
                  <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 12px" }}>{cap}</p>
                  <p style={{ margin: "0 0 4px" }}>
                    <span style={{ fontFamily: SERIF, fontSize: 30, color: C.ink, fontWeight: 500 }}>{price}</span>
                    <span style={{ fontSize: 13, color: C.faint }}> / month</span>
                  </p>
                  <p style={{ fontSize: 12.5, color: C.green, margin: "0 0 14px" }}>{perFarmer}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {["WhatsApp agronomic advisory", "Audited follow-through", "Monitoring dashboard"].map((f) => (
                      <span key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: C.muted }}>
                        <Check color={C.green} />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              <a
                href="mailto:partners@outturn.app?subject=Outturn%20partner%20pilot"
                style={{ background: C.green, color: C.white, fontSize: 14, fontWeight: 500, padding: "10px 18px", borderRadius: 10, textDecoration: "none" }}
              >
                Talk to us about a pilot
              </a>
              <span style={{ fontSize: 12.5, color: C.faint }}>
                Live prices come from Stripe checkout. Larger or government volumes: get in touch.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why it matters — dark punctuation */}
      <section id="why" style={{ background: C.dark }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "62px 32px" }}>
          <Eyebrow onDark>Why it matters</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.1, margin: "12px 0 10px", fontWeight: 500, color: C.cream }}>
            Information isn&apos;t the gap. Follow-through is.
          </h2>
          <p style={{ fontSize: 16, color: "#B7AE9E", maxWidth: 640, margin: "0 0 36px", lineHeight: 1.6 }}>
            Farmers know their crops. The right moment passes while competing demands stack up, and a
            spray tip that lands after the wind picks up behaves like no advice at all.
          </p>
          <div className="stats-grid">
            {[
              ["~126M", "smallholder and marginal farmers in India, about 86% of all holdings.", "Agriculture Census 2015-16", "https://agcensus.nic.in/document/agcen1516/T1_ac_2015_16.pdf"],
              ["up to 40%", "of global crop production lost to pests and diseases each year.", "FAO", "https://www.fao.org/newsroom/detail/Climate-change-fans-spread-of-pests-and-threatens-plants-and-crops-new-FAO-study/en"],
              ["~1:5,000", "farmers per extension worker, vs a guideline norm nearer 1:750.", "NAAS / ICRISAT", "https://naas.org.in/News/NN25032025.pdf"],
            ].map(([big, body, src, url]) => (
              <div key={big} style={{ borderTop: `1px solid rgba(255,255,255,0.14)`, paddingTop: 16 }}>
                <p style={{ fontFamily: SERIF, fontSize: 38, color: "#6EE7A8", margin: "0 0 8px", fontWeight: 500 }}>{big}</p>
                <p style={{ fontSize: 14.5, color: C.cream, lineHeight: 1.5, margin: "0 0 6px" }}>{body}</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#8A8275", textDecoration: "underline", textUnderlineOffset: 2 }}
                >
                  {src}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" style={{ maxWidth: 1180, margin: "0 auto", padding: "62px 32px" }}>
        <Eyebrow>How it&apos;s built</Eyebrow>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, margin: "12px 0 8px", fontWeight: 500 }}>
          Three planes, one DynamoDB table.
        </h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 640, margin: "0 0 28px", lineHeight: 1.6 }}>
          A multi-tenant control plane built over an award-winning delivery engine, with an
          event-driven analytics path. Not a dashboard bolted onto a database.
        </p>
        {/* Event flow — the closed loop, mapped to AWS services */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 18px", marginBottom: 14 }}>
          <div className="flow-grid">
            {([
              ["1", "Watch weather", "EventBridge · WeatherPoller λ", C.green],
              ["2", "Orchestrate", "Step Functions", C.green],
              ["3", "Send nudge", "NudgeSender λ · Meta WhatsApp Cloud API", C.green],
              ["4", "Farmer replies", "Meta webhook · API Gateway · WebhookHandler λ", C.teal],
              ["5", "Detect + record", "ResponseDetector λ · DynamoDB Streams", C.teal],
              ["6", "Roll up + show", "OutcomesAggregator λ · SUMMARY# · Vercel dashboard", C.amber],
            ] as [string, string, string, string][]).map(([n, title, svc, color]) => (
              <div
                key={n}
                style={{
                  background: C.cream2,
                  border: `1px solid ${C.border}`,
                  borderTop: `2px solid ${color}`,
                  borderRadius: 10,
                  padding: "12px 12px 14px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: color,
                    color: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 9,
                  }}
                >
                  {n}
                </span>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, margin: "0 0 4px" }}>{title}</p>
                <p style={{ fontSize: 11.5, color: C.muted, margin: 0, lineHeight: 1.4 }}>{svc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: C.muted, margin: "14px 0 0", padding: "11px 13px", background: C.cream, borderRadius: 10, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 500, color: C.ink }}>Amazon DynamoDB</span> is the single
            multi-tenant table at the centre, with two Streams consumers: the ResponseDetector flips a
            nudge to done, the OutcomesAggregator rolls it up. The loop runs on an EventBridge
            schedule, or the moment a partner re-nudges from the dashboard.
          </p>
        </div>
        {/* Plane legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginBottom: 16, fontSize: 12.5, color: C.muted }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: C.green }} />Engine, sends the nudge
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: C.teal }} />Data, one DynamoDB table and Streams
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: C.amber }} />Control, partners monitor and act
          </span>
        </div>
        <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.faint, margin: "28px 0 12px" }}>
          Built on
        </p>
        <div className="arch-grid">
          {([
            ["Amazon Web Services", "The engine and data", ["DynamoDB single table + Streams", "Lambda: poller, sender, detector, aggregator", "Step Functions · EventBridge · Secrets Manager"]],
            ["Vercel", "The control plane", ["Next.js dashboard + APIs, globally hosted", "Keyless AWS access via OIDC, no static keys", "Audit log to DynamoDB via the Vercel Marketplace integration"]],
            ["Meta", "The farmer's channel", ["WhatsApp Business Cloud API", "Interactive Done / Not Yet replies", "Delivered in the farmer's own language"]],
          ] as [string, string, string[]][]).map(([name, sub, items]) => (
            <div key={name} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontFamily: SERIF, fontSize: 19, margin: "0 0 2px", fontWeight: 500 }}>{name}</h3>
              <p style={{ fontSize: 12.5, color: C.green, margin: "0 0 13px" }}>{sub}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {items.map((it) => (
                  <span key={it} style={{ display: "flex", gap: 8, fontSize: 13, color: C.muted, lineHeight: 1.4 }}>
                    <Check color={C.green} />
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 16, maxWidth: 760, lineHeight: 1.5 }}>
          One DynamoDB table is the source of truth. The Vercel control plane activates the engine and
          reads pre-computed outcomes, reaches AWS keyless via OIDC, and writes an audit log of every
          partner action through the Vercel Marketplace DynamoDB integration.
        </p>
      </section>

      {/* Roadmap */}
      <section style={{ background: C.cream2, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 32px", display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center" }}>
          <Eyebrow>What&apos;s next</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Gamification + scorecards", "Mandi price alerts", "Adverse-weather prep", "Partner integrations"].map((r) => (
              <span key={r} style={{ fontSize: 13.5, color: C.muted, background: C.white, border: `1px solid ${C.border}`, padding: "6px 12px", borderRadius: 999 }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "72px 32px", textAlign: "center" }}>
        <Eyebrow>See it live</Eyebrow>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.08, margin: "14px 0 26px", fontWeight: 500 }}>
          From advice to action, on live data.
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <TryDemoButton
            style={{
              background: C.green,
              color: C.white,
              fontSize: 15,
              fontWeight: 500,
              padding: "12px 24px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try the live demo
          </TryDemoButton>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 500,
              color: C.ink,
              textDecoration: "none",
              padding: "12px 20px",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
            }}
          >
            See it on WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}` }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "26px 32px",
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            color: C.faint,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <OutturnMark size={28} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontFamily: SERIF, fontSize: 17, color: C.ink, fontWeight: 500 }}>
                Out<span style={{ color: C.green }}>turn</span>
              </span>
              <span style={{ fontSize: 12, color: C.faint, marginTop: 1 }}>Advice, followed through</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/judges" style={{ color: C.faint, textDecoration: "none" }}>
              Technical write-up
            </Link>
            <span>Built on the AgriNexus AI engine · Amazon DynamoDB + Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
