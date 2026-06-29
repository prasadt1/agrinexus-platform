import Link from "next/link";
import { AgriNexusWordmark } from "@/app/components/Logo";
import { ProofGallery, type ProofSection } from "./ProofGallery";

export const metadata = {
  title: "Architecture & Infrastructure Proof · Outturn",
  description:
    "Full-resolution proof of how Outturn runs: Amazon DynamoDB single-table + Streams, keyless Vercel ↔ AWS OIDC, and the product walkthrough.",
};

const LIVE_URL = "https://outturn.vercel.app";
const REPO_URL = "https://github.com/prasadt1/agrinexus-platform";

const SECTIONS: ProofSection[] = [
  {
    id: "architecture",
    title: "Architecture",
    desc: "Three planes, one DynamoDB table, and the closed advice → action → follow-through loop.",
    items: [
      { src: "/proof/arch-three-planes.png", title: "Three planes", caption: "Control (Vercel) · Data (DynamoDB) · Delivery (AgriNexus AI)" },
      { src: "/proof/arch-single-table.png", title: "Single-table design", caption: "TENANT# · COHORT# · LICENSE# · SUMMARY# + GSI1/GSI2" },
      { src: "/proof/arch-closed-loop.png", title: "The closed loop", caption: "Advice → action → measured follow-through" },
      { src: "/proof/arch-teardown.png", title: "Request teardown", caption: "How one request travels the real architecture" },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure proof — AWS + Vercel",
    desc: "Two consolidated boards stitched from the live AWS and Vercel consoles. Click to read every detail.",
    items: [
      { src: "/proof/infra-01-dynamodb.png", title: "The data plane runs on DynamoDB", caption: "Single-table · 2 GSIs · GSI2 = STATUS#active · Streams → Lambda" },
      { src: "/proof/infra-02-vercel.png", title: "Delivery, keyless identity & audit", caption: "OIDC federation · role ARNs (no secrets) · CI/CD · 2nd-account audit table" },
    ],
  },
  {
    id: "consoles",
    title: "Cloud consoles, full-resolution",
    desc: "The raw screenshots behind the boards — straight from the AWS and Vercel dashboards.",
    items: [
      { src: "/proof/proof-01-dynamodb-data.png", title: "Primary DynamoDB table", caption: "agrinexus-data — 50 live items, single-table design" },
      { src: "/proof/proof-02-dynamodb-audit.png", title: "Audit table (2nd account)", caption: "outturn-audit-log — append-only control-plane events" },
      { src: "/proof/proof-03-vercel-aws-integration.png", title: "AWS via Vercel Marketplace", caption: "outturn-audit-log installed as a managed product" },
      { src: "/proof/proof-04-vercel-keyless-env.png", title: "Keyless environment", caption: "Role ARNs only — no AWS_SECRET_ACCESS_KEY" },
    ],
  },
  {
    id: "walkthrough",
    title: "Product walkthrough",
    desc: "The control plane end to end — each screen annotated with the stack behind it.",
    items: [
      { src: "/proof/gallery-01-07-login.png", title: "Passwordless demo, real roles", caption: "Persona picker · Admin vs Viewer enforced server-side" },
      { src: "/proof/gallery-02-01-landing.png", title: "One loop", caption: "Advice → action → follow-through" },
      { src: "/proof/gallery-03-02-overview.png", title: "Follow-through, not messages sent", caption: "Outcome metrics from materialized SUMMARY# rows" },
      { src: "/proof/gallery-04-03-cohort.png", title: "Who acted, who slipped", caption: "Cohort detail — per-member follow-through" },
      { src: "/proof/gallery-05-04a-onboarding.png", title: "Empty workspace → pick a plan", caption: "New-partner onboarding + plan selector" },
      { src: "/proof/gallery-06-04c1-cohort-location.png", title: "New cohort · step 1", caption: "District, crops, languages" },
      { src: "/proof/gallery-07-04c2-cohort-reminders.png", title: "New cohort · step 2", caption: "Safe-to-spray reminder thresholds" },
      { src: "/proof/gallery-08-04c-plan-review.png", title: "New cohort · step 3", caption: "Confirm plan, continue to payment" },
      { src: "/proof/gallery-09-04b-stripe.png", title: "Stripe checkout", caption: "Real, branded per-cohort subscription" },
      { src: "/proof/gallery-10-04-billing.png", title: "Licensed subscriptions", caption: "Every cohort is a Stripe-backed license" },
      { src: "/proof/gallery-11-05-activity.png", title: "Tenant-scoped audit", caption: "Every action logged and isolated" },
      { src: "/proof/gallery-12-06-leads.png", title: "How a partner reaches us", caption: "Pilot lead capture" },
    ],
  },
];

export default function ProofPage() {
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

      <main className="px-6 sm:px-8 py-12 max-w-5xl mx-auto">
        <p
          className="text-label mb-4 inline-block px-3 py-1 rounded-full"
          style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
        >
          Full-resolution proof · Amazon DynamoDB · Vercel
        </p>
        <h1 className="text-page-title mb-3">Architecture &amp; infrastructure proof</h1>
        <p className="text-lg mb-5" style={{ color: "var(--color-text-secondary)" }}>
          The diagrams, the live AWS &amp; Vercel consoles, and the product — at full resolution, so the
          detail survives. Click any image to zoom; use the arrow keys to move through them.
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          <a href={LIVE_URL} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Live app →
          </a>
          <a href={REPO_URL} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
            Source on GitHub
          </a>
          <Link href="/judges" className="btn btn-secondary">
            For judges
          </Link>
        </div>

        <hr className="mb-10" style={{ borderColor: "var(--color-border)" }} />

        <ProofGallery sections={SECTIONS} />

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm underline" style={{ color: "var(--color-text-muted)" }}>
            ← Back to the product overview
          </Link>
        </p>
      </main>
    </div>
  );
}
