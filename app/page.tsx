import Link from "next/link";
import { HowItWorks } from "@/app/components/HowItWorks";
import { TryDemoButton } from "@/app/components/TryDemoButton";
import { OutturnMark } from "@/app/components/OutturnMark";
import { PartnerLeadForm } from "@/app/components/PartnerLeadForm";
import { ArchitectureGallery } from "@/app/components/architecture/ArchitectureGallery";

// The farmer-side engine demo (pre-existing AgriNexus AI). Shown as a clearly
// labeled video — not a live CTA — so the dashboard is the only thing a judge tries.
const ENGINE_DEMO_URL = "https://www.youtube.com/watch?v=Hr9EcblzkwI";
// Jump past onboarding to the nudge → "Done" moment. Adjust the seconds if the cut changes.
const ENGINE_DEMO_AT = `${ENGINE_DEMO_URL}&t=45s`;

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
              Advice that closes the loop
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
          <Link href="/login" style={{ color: C.muted, textDecoration: "none" }} className="hidden sm:inline">
            Sign in
          </Link>
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
            Try the live dashboard
          </TryDemoButton>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 32px 64px" }}>
        <div className="hero-grid">
          <div>
            <Eyebrow>WhatsApp crop advisory, built for follow-through</Eyebrow>
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
              Timely crop advice for farmers on WhatsApp — and, for the partners who serve them, a
              clear view of who&apos;s acting on it.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: C.muted, maxWidth: 515, margin: "0 0 28px" }}>
              Outturn sends weather-based guidance, sees who follows through by district, and helps
              partners follow up with the rest — so no farmer slips through the cracks.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
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
                Try the live dashboard
              </TryDemoButton>
              <div style={{ display: "inline-flex", flexDirection: "column", gap: 5 }}>
                <a
                  href={ENGINE_DEMO_AT}
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
                    background: C.white,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={C.green} aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch how it works · 90s
                </a>
                <span style={{ fontSize: 12.5, color: C.faint, paddingLeft: 2 }}>
                  the farmer side, on the AgriNexus engine.
                </span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.muted, margin: "14px 0 0", lineHeight: 1.5, maxWidth: 480 }}>
              Farmers get advice on WhatsApp — no app, no cost, it&apos;s already on their phone. The
              dashboard is where partners watch who acted.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 24, fontSize: 13, color: C.muted }}>
              <span>Weather-timed advice</span>
              <span>·</span>
              <span>Confirmed by each farmer</span>
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
                <span style={{ fontSize: 13, color: C.faint }}>14 haven&apos;t acted</span>
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

      {/* What it does — the accountability layer (the H0 contribution) */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "4px 32px 60px" }}>
        <Eyebrow>What it does</Eyebrow>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, margin: "12px 0 10px", fontWeight: 500 }}>
          The accountability layer for farm advice.
        </h2>
        <p style={{ fontSize: 16.5, color: C.ink, maxWidth: 705, margin: "0 0 30px", lineHeight: 1.6 }}>
          Outturn runs on a multi-modal, closed-loop advisory engine — it reaches farmers by text and
          voice on WhatsApp. The layer we built is what makes every piece of that advice{" "}
          <strong style={{ fontWeight: 600 }}>accountable</strong>: tracked, rolled up, audited, and
          re-sent when it slips.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {(
            [
              [
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3L20 5M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9" />,
                "Tracked to the last farmer",
                "Every WhatsApp reply resolves to Done or not — per farmer, per cohort.",
                false,
              ],
              [
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 4.5-9 4.5-9-4.5L12 3zM3 12l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />,
                "Live roll-ups on DynamoDB",
                "DynamoDB Streams aggregate every reply into per-district follow-through summaries, in real time.",
                false,
              ],
              [
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM3 9h18M7 13h5" />,
                "A control plane on Vercel",
                "A Next.js dashboard where partners watch follow-through and re-nudge who slipped — keyless to AWS via OIDC.",
                false,
              ],
              [
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />,
                "An audit trail",
                "Every cohort, license and reminder cycle recorded — not editable after the fact.",
                false,
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
              <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>
        {/* Powered-by footnote — the engine + the award, demoted to a credibility line */}
        <div
          style={{
            marginTop: 24,
            padding: "13px 18px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.cream2,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px 16px",
          }}
        >
          <span style={{ fontSize: 13.5, color: C.muted }}>
            Powered by <strong style={{ color: C.ink, fontWeight: 600 }}>AgriNexus AI</strong> — a
            multi-modal advisory engine,{" "}
            <a
              href="https://builder.aws.com/content/3C8hBRTcsRuQrHzE3Pq243yhXTF/aideas-finalist-agrinexus-ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.green, textDecoration: "underline", textUnderlineOffset: 2 }}
            >
              winner of the AWS AIdeas Innovation Award
            </a>
            .
          </span>
          <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 16, marginLeft: "auto", fontSize: 13, fontWeight: 500 }}>
            {(
              [
                ["▶ Demo", ENGINE_DEMO_URL],
                ["Code", "https://github.com/prasadt1/agrinexus-ai"],
                ["Write-up", "https://builder.aws.com/content/3C8hBRTcsRuQrHzE3Pq243yhXTF/aideas-finalist-agrinexus-ai"],
              ] as [string, string][]
            ).map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.ink, textDecoration: "none", borderBottom: `1px solid ${C.border}` }}
              >
                {label}
              </a>
            ))}
          </span>
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
              <span style={{ display: "flex", gap: 9 }}><Check color="#B6AE9E" />Voice notes and two-way chat</span>
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
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, margin: "12px 0 12px", fontWeight: 500 }}>
            Built for the teams that advise farmers.
          </h2>
          <p style={{ fontSize: 16.5, color: C.muted, maxWidth: 730, margin: "0 0 28px", lineHeight: 1.6 }}>
            A partner is any organisation that advises farmers at scale — an{" "}
            <strong style={{ color: C.ink, fontWeight: 600 }}>NGO</strong>, an{" "}
            <strong style={{ color: C.ink, fontWeight: 600 }}>agri-input company</strong> (seed,
            fertiliser, crop-protection), a{" "}
            <strong style={{ color: C.ink, fontWeight: 600 }}>co-operative or FPO</strong>, or a{" "}
            <strong style={{ color: C.ink, fontWeight: 600 }}>government extension body</strong> — a{" "}
            <a
              href="https://en.wikipedia.org/wiki/Krishi_Vigyan_Kendra"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.green, textDecoration: "underline", textUnderlineOffset: 2 }}
            >
              KVK
            </a>{" "}
            (Krishi Vigyan Kendra, the farm-science centres that carry advice to India&apos;s villages).
            Each gets its own branded, licensed workspace; the farmers just use plain WhatsApp.
          </p>
          <p style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: C.faint, margin: "0 0 18px" }}>
            How a partner runs it
          </p>
          <div className="steps-grid">
            {[
              ["1", "Add a cohort", "Group a district’s farmers by crop and language — say an NGO’s 26 cotton growers in Latur. The engine starts watching that district’s weather."],
              ["2", "Activate it", "Switch the cohort live on a Starter, Growth, or Scale plan. Checkout runs through Stripe."],
              ["3", "Watch follow-through", "See confirmed action, not delivery receipts — Latur at 67%, 28 of 42 nudges acted on."],
              ["4", "Act where it slips", "Re-nudge the farmers who haven’t acted — the 14 in Latur who didn’t — by hand or on a schedule."],
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
                <h3 style={{ fontFamily: SERIF, fontSize: 18, margin: "0 0 6px", fontWeight: 500 }}>{title}</h3>
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
              <PartnerLeadForm fallbackEmail="pilot@prasadtilloo.com" />
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
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, margin: "12px 0 16px", fontWeight: 500, color: C.cream, maxWidth: 720 }}>
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
            ["Vercel", "The control plane", ["Next.js dashboard + APIs, globally hosted", "Keyless AWS access via OIDC, no static keys", "Audit log to a Vercel Marketplace DynamoDB table"]],
            ["Meta", "The farmer's channel", ["WhatsApp Business Cloud API", "Interactive Done / Not Yet replies", "Delivered in the farmer's own language"]],
          ] as [string, string, string[]][]).map(([name, sub, items]) => (
            <div key={name} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontFamily: SERIF, fontSize: 18, margin: "0 0 2px", fontWeight: 500 }}>{name}</h3>
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
            {["Gamification + scorecards", "Mandi price alerts", "Adverse-weather prep", "Micro-finance & input-credit partners", "Partner integrations"].map((r) => (
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
            Try the live dashboard
          </TryDemoButton>
          <a
            href={ENGINE_DEMO_AT}
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill={C.green} aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch how it works · 90s
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
              <span style={{ fontSize: 12, color: C.faint, marginTop: 1 }}>Advice that closes the loop</span>
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
