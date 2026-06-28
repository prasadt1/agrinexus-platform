import Link from "next/link";
import { HowItWorks } from "@/app/components/HowItWorks";
import { TryDemoButton } from "@/app/components/TryDemoButton";
import { OutturnMark } from "@/app/components/OutturnMark";
import { ArchitectureGallery } from "@/app/components/architecture/ArchitectureGallery";

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
        fontSize: 13.5,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: onDark ? "#6EE7A8" : C.green,
        fontWeight: 600,
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
          <a href="#partners" style={{ color: C.muted, textDecoration: "none" }} className="hidden sm:inline">
            For partners
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
            <Eyebrow>WhatsApp crop advisory · for agri NGOs &amp; input companies</Eyebrow>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(44px, 7vw, 68px)",
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                margin: "16px 0 18px",
                fontWeight: 500,
              }}
            >
              From advice to action.
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, color: C.ink, maxWidth: 520, margin: "0 0 14px", fontWeight: 500 }}>
              Timely crop advice for farmers on WhatsApp — and proof of follow-through for the
              partners who serve them.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: C.muted, maxWidth: 515, margin: "0 0 28px" }}>
              Outturn sends weather-based guidance, then tracks which farmers actually acted on it — so
              partners see real results by district, and re-nudge the ones who haven&apos;t.
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
              Message our demo number and you&apos;ll get exactly what a farmer gets: the advice, then a
              follow-up reminder.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 26, fontSize: 12.5, color: C.faint }}>
              <span>Weather-timed advice</span>
              <span>·</span>
              <span>Proof each farmer acted</span>
              <span>·</span>
              <span>Results by district</span>
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

      {/* What it does — the capability suite */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "4px 32px 60px" }}>
        <Eyebrow>What it does</Eyebrow>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(26px, 4vw, 38px)", lineHeight: 1.12, margin: "12px 0 8px", fontWeight: 500 }}>
          A full advisory engine on WhatsApp — that closes the loop.
        </h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 690, margin: "0 0 20px", lineHeight: 1.6 }}>
          Built on AgriNexus AI —{" "}
          <a
            href="https://builder.aws.com/content/3C8hBRTcsRuQrHzE3Pq243yhXTF/aideas-finalist-agrinexus-ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: C.green, textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            winner of the AWS AIdeas Innovation Award
          </a>{" "}
          — a multimodal farm-advisory engine. Farmers get far more than a reminder; partners get proof
          it worked.
        </p>
        {/* Proof — walk the talk */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 30 }}>
          {(
            [
              ["Watch the full demo", "https://www.youtube.com/watch?v=Hr9EcblzkwI", <path key="i" d="M8 5v14l11-7z" fill="currentColor" stroke="none" />],
              ["AWS AIdeas write-up", "https://builder.aws.com/content/3C8hBRTcsRuQrHzE3Pq243yhXTF/aideas-finalist-agrinexus-ai", <path key="i" strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M15 3H7a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5z" />],
              ["Engine on GitHub", "https://github.com/prasadt1/agrinexus-ai", <path key="i" strokeLinecap="round" strokeLinejoin="round" d="M16 18l6-6-6-6M8 6l-6 6 6 6" />],
              ["Try it on WhatsApp", WA_LINK, <path key="i" strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-9 8.5 8.5 8.5 0 01-3.8-.9L3 21l1.9-5.2A8.38 8.38 0 014 11.5 8.5 8.5 0 0112 3a8.38 8.38 0 019 8.5z" />],
            ] as [string, string, React.ReactNode][]
          ).map(([label, href, icon]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13.5,
                fontWeight: 500,
                color: C.ink,
                textDecoration: "none",
                padding: "9px 15px",
                borderRadius: 999,
                border: `1px solid ${C.border}`,
                background: C.white,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} style={{ color: C.green }} aria-hidden="true">
                {icon}
              </svg>
              {label}
            </a>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {(
            [
              [
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M7 18a4 4 0 01-.5-7.97A6 6 0 0118 9.5a3.5 3.5 0 01-.5 8.5H7z" />,
                "Weather-timed advice",
                "Spray and irrigation windows from live weather, per district.",
                false,
              ],
              [
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-9 8.5 8.5 8.5 0 01-3.8-.9L3 21l1.9-5.2A8.38 8.38 0 014 11.5 8.5 8.5 0 0112 3a8.38 8.38 0 019 8.5z" />,
                "Two-way on WhatsApp",
                "Farmers reply Done or Not yet — no app to install.",
                false,
              ],
              [
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3zM19 10v2a7 7 0 01-14 0v-2M12 19v3" />,
                "Voice notes",
                "Farmers can answer by voice; advice can go out as audio.",
                false,
              ],
              [
                <g key="p"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8a2 2 0 012-2h1.5L8 4h8l1.5 2H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /><circle cx="12" cy="13" r="3.2" /></g>,
                "Photo diagnosis",
                "Send a crop photo — the engine flags pest or disease.",
                false,
              ],
              [
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                "Ask anything",
                "Farmers ask questions in their own language and get answers.",
                false,
              ],
              [
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 11-2.3-5.6M20 4v4h-4M9 12l2 2 4-4" />,
                "Follow-through + re-nudge",
                "Tracked to done — and re-nudged if not. This is the differentiator.",
                true,
              ],
            ] as [React.ReactNode, string, string, boolean][]
          ).map(([icon, title, desc, hero]) => (
            <div
              key={title}
              style={{
                background: hero ? C.greenTint : C.white,
                border: `${hero ? 2 : 1}px solid ${hero ? C.green : C.border}`,
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: hero ? C.green : C.greenTint,
                  color: hero ? C.white : C.green,
                  marginBottom: 12,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                  {icon}
                </svg>
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: 18, margin: "0 0 4px", fontWeight: 500 }}>{title}</h3>
              <p style={{ fontSize: 13.5, color: C.muted, margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
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
            A nudge is one timely WhatsApp message telling a farmer to act now, in their own language —
            like the short dry, low-wind window when spraying actually works. Outturn watches each
            district&apos;s weather, sends only when that window opens, and follows up until the farmer
            confirms or it closes. Tap a step or watch it play.
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
      <section id="partners" style={{ background: C.cream2, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
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
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.1, margin: "12px 0 16px", fontWeight: 500, color: C.cream, maxWidth: 720 }}>
            Information isn&apos;t the gap. Follow-through is.
          </h2>
          <p style={{ fontSize: 17, color: C.cream, maxWidth: 680, margin: "0 0 14px", lineHeight: 1.62 }}>
            Good crop advice already exists — it just rarely arrives in time. With far too few extension
            workers to reach everyone, no one is there at the moment it counts. And in farming, the
            moment is everything: spraying only works in a short dry, low-wind window. Miss it and the
            pass is wasted — the pest spreads, and the crop is lost.
          </p>
          <p style={{ fontSize: 16, color: "#B7AE9E", maxWidth: 680, margin: "0 0 38px", lineHeight: 1.6 }}>
            So the bottleneck was never knowing what to do. It&apos;s getting it done — the right action,
            at the right moment, across thousands of farmers at once.
          </p>
          <p style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#8A8275", margin: "0 0 18px" }}>
            The scale of the gap
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
          <p style={{ fontSize: 15.5, color: C.cream, maxWidth: 680, marginTop: 34, lineHeight: 1.6 }}>
            Outturn closes that gap — advice tracked all the way to{" "}
            <strong style={{ color: "#6EE7A8", fontWeight: 600 }}>done</strong>, so a missed window
            becomes a re-nudge instead of a lost crop.
          </p>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" style={{ maxWidth: 1180, margin: "0 auto", padding: "62px 32px" }}>
        <Eyebrow>How it&apos;s built</Eyebrow>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, margin: "12px 0 8px", fontWeight: 500 }}>
          Control plane, data plane, engine.
        </h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 680, margin: "0 0 28px", lineHeight: 1.6 }}>
          Three planes, one system. The AWS-and-WhatsApp engine sends nudges and captures replies,
          a single Amazon DynamoDB table records and rolls up every outcome, and the Vercel control
          plane reads those roll-ups and re-nudges the engine over keyless OIDC. Not a dashboard
          bolted onto a database.
        </p>
        {/* Three views of the same system: planes, teardown, receipt thread */}
        <ArchitectureGallery />
        <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.faint, margin: "28px 0 12px" }}>
          Built on
        </p>
        <div className="arch-grid">
          {([
            ["Amazon Web Services", "The engine and data", ["DynamoDB single table + Streams", "Lambda: poller, sender, detector, aggregator", "Step Functions · EventBridge · Secrets Manager"]],
            ["Vercel", "The control plane", ["Next.js dashboard + APIs, globally hosted", "Keyless AWS access via OIDC, no static keys", "Audit log to DynamoDB, keyless via OIDC"]],
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
