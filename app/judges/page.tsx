import Link from "next/link";
import { AgriNexusWordmark } from "@/app/components/Logo";

export const metadata = {
  title: "For Hackathon Judges · Outturn",
  description: "H0 submission guide: demo path, AWS + Vercel stack, and what was built for the hackathon.",
};

const LIVE_URL = "https://agrinexus-platform.vercel.app";
const REPO_URL = "https://github.com/prasadt1/agrinexus-platform";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-section mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function JudgesPage() {
  return (
    <div className="min-h-screen">
      <header
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <Link href="/">
          <AgriNexusWordmark />
        </Link>
        <Link href="/login" className="btn btn-primary">
          Open demo dashboard
        </Link>
      </header>

      <main className="px-8 py-12 max-w-3xl mx-auto">
        <p
          className="text-label mb-4 inline-block px-3 py-1 rounded-full"
          style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
        >
          H0 · Track 2 — Monetizable B2B · Amazon DynamoDB · Vercel
        </p>
        <h1 className="text-page-title mb-3">For hackathon judges</h1>
        <p className="text-lg mb-2" style={{ color: "var(--color-text-secondary)" }}>
          <strong>AgriNexus AI is the delivery spine; Outturn is the accountability control plane</strong>{" "}
          that proves advisory follow-through — backed by Amazon DynamoDB and deployed on Vercel. The
          delivery engine pre-existed (AWS AIdeas award winner); the Outturn control plane is what was
          built for H0.
        </p>
        <div className="flex flex-wrap gap-3 mt-5 mb-2">
          <a href={LIVE_URL} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Live app →
          </a>
          <a href={REPO_URL} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
            Source on GitHub
          </a>
        </div>

        <hr className="my-10" style={{ borderColor: "var(--color-border)" }} />

        <Section title="Try it in 60 seconds (no payment required)">
          <ol className="space-y-3" style={{ color: "var(--color-text-secondary)" }}>
            {[
              <>Open <Link href="/login" className="underline" style={{ color: "var(--color-primary)" }}>/login</Link> and click a one-click demo persona (e.g. <strong>GreenHarvest NGO — Admin</strong>).</>,
              <>On <strong>Overview</strong>, watch the <strong>Advisory Loop</strong> and press <strong>Run advisory cycle</strong> — it polls weather and fires nudges live.</>,
              <>Use the <strong>tenant switcher</strong> (sidebar) to flip between partner organisations — each sees only its own data.</>,
              <>As an Admin, create a cohort with the <strong>New cohort</strong> wizard, then <strong>Demo activate</strong> (free) or pay with a Stripe test card <code>4242 4242 4242 4242</code>.</>,
              <>Check the <strong>Billing</strong> page to see the resulting license records.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="What was built for H0">
          <div className="card mb-3">
            <p className="text-label" style={{ color: "var(--color-text-muted)" }}>Pre-existing</p>
            <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
              <strong>AgriNexus AI delivery engine</strong> — WhatsApp advisory, Bedrock RAG, nudge loop on Step
              Functions. Winner of the <strong>AWS AIdeas Innovation Award</strong> (~$0.54/farmer/year).
            </p>
          </div>
          <div className="card card-elevated" style={{ borderColor: "var(--color-primary)" }}>
            <p className="text-label" style={{ color: "var(--color-primary)" }}>New — this repo</p>
            <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
              The <strong>multi-tenant control plane</strong>: partner accounts and isolation, self-serve cohort
              provisioning, DynamoDB Streams-driven outcome analytics, tiered Stripe licensing, and the
              control-plane-drives-delivery coupling (activating a cohort registers its district for weather polling and nudges).
            </p>
          </div>
        </Section>

        <Section title="Architecture — three planes, one DynamoDB table">
          <ul className="space-y-2" style={{ color: "var(--color-text-secondary)" }}>
            <li>
              <strong>Control plane (Vercel / Next.js):</strong> login, provisioning wizard, dashboard, Stripe checkout.
            </li>
            <li>
              <strong>Data plane (Amazon DynamoDB):</strong> single <code>agrinexus-data</code> table — <code>TENANT#</code>,{" "}
              <code>COHORT#</code>, <code>LICENSE#</code>, <code>SUMMARY#</code>, membership — with GSI1 (cohort members),
              GSI2 (active cohorts) and Streams.
            </li>
            <li>
              <strong>Delivery plane (existing AgriNexus AI):</strong> weather poller → Step Functions nudge workflow → WhatsApp.
            </li>
            <li>
              <strong>Analytics:</strong> DynamoDB Streams → <code>OutcomesAggregator</code> Lambda → materialized{" "}
              <code>SUMMARY#</code> records the dashboard reads.
            </li>
          </ul>
          <p className="mt-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Full diagram and entity keys in{" "}
            <a href={`${REPO_URL}/blob/main/agrinexus-platform/docs/h0-architecture.md`} className="underline" target="_blank" rel="noopener noreferrer">
              docs/h0-architecture.md
            </a>
            .
          </p>
        </Section>

        <Section title="The deliberate AWS + Vercel stack">
          <div className="space-y-3">
            {[
              ["Amazon DynamoDB", "Primary backend — multi-tenant single-table design, GSIs, and Streams. The source of truth for tenants, cohorts, licenses, and outcomes."],
              ["AWS Lambda", "OutcomesAggregator materializes cohort summaries from Streams for fast, cheap dashboard reads."],
              ["AWS Step Functions", "Existing nudge workflow that the control plane activates per cohort."],
              ["AWS Secrets Manager", "Source of truth for Stripe + weather secrets; Vercel holds only a least-privilege bootstrap credential."],
              ["Vercel", "Hosts the Next.js control plane and API routes."],
              ["Stripe", "Per-cohort tiered Checkout (Starter / Growth / Enterprise); demo-activate path needs no payment."],
            ].map(([name, role]) => (
              <div key={name} className="flex gap-4">
                <div className="w-40 shrink-0 font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {name}
                </div>
                <div style={{ color: "var(--color-text-secondary)" }}>{role}</div>
              </div>
            ))}
          </div>
        </Section>

        <div className="card text-center" style={{ background: "var(--color-primary-tint)", borderColor: "var(--color-primary)" }}>
          <p className="mb-4" style={{ color: "var(--color-primary-hover)" }}>
            Everything on the dashboard is read live from DynamoDB — the demo data is seeded, but it travels the real architecture.
          </p>
          <Link href="/login" className="btn btn-primary">
            Open the demo dashboard
          </Link>
        </div>

        <p className="mt-10 text-center">
          <Link href="/" className="text-sm underline" style={{ color: "var(--color-text-muted)" }}>
            ← Back to the product overview
          </Link>
        </p>
      </main>
    </div>
  );
}
