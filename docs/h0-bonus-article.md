# Bonus content plan — +0.6 (three distinct pieces)

> Disclosure: I created this content for the purposes of entering the H0 Hackathon. #H0Hackathon

**Scoring:** +0.2 per published original piece, max **+0.6 for 3 pieces**, on a 5-point scale.
That is the highest-leverage time in the whole submission — do **three**, not one.

> ⚠️ **Do NOT assume the required 3-minute submission video double-counts** as a bonus piece.
> Treat the three pieces below as separate deliverables. (Confirm double-count rules in the H0
> Discussions tab if you want to be sure.)

## Voice guardrail (applies to all public posts)
There is **no rule against AI-assisted writing** — the only hand-written requirement is the AWS
credits request form. But Originality/Design are scored, and generic AI-slop reads as low-insight.
So: **draft with AI, then rewrite for specificity and author voice.** Lead with the real reasoning
from `h0-why-architecture.md` (phone-as-partition-key, no-connection-pool vs Aurora, Streams
rollups, one-number routing). First person ("I", per author defaults).

## The three pieces

1. **AWS Builder Center article** *(highest credibility)* — continues an established presence
   (AIdeas-finalist article already there), which doubles as provenance against the
   AI-authenticity worry. Topic: building the B2B control plane on DynamoDB single-table + Streams.
2. **LinkedIn build post** — first person, specific, a war story (e.g., the
   "partner enrolled but the farmer was never nudged" seam). Use the reach you already have.
3. **Separate YouTube technical walkthrough** — longer than the 3-min submission cut; deeper on
   the architecture "why."

---

## Article outline (reusable across pieces 1–3)

## Title options

1. "From WhatsApp advisory to B2B control plane: DynamoDB Streams on Vercel"
2. "How I wired a multi-tenant cohort dashboard to a production nudge engine"

## Outline

### Hook

- Won AWS AIdeas with delivery engine; H0 asked for shippable full-stack on Vercel + AWS Databases.

### Architecture decision: single-table multi-tenant

- Why TENANT# prefix isolation
- GSI1 (cohort members) and GSI2 (active cohorts for poller)

### The insight: control plane drives delivery

- WeatherPoller reads active cohorts from GSI2, not hardcoded districts
- Provisioning a cohort changes what the engine does

### Streams aggregation (not read-time scatter-gather)

- OutcomesAggregator Lambda
- Materialized SUMMARY# for sub-2s dashboard reads

### Vercel + AWS connection (be precise — don't overclaim)

- Next.js API routes on Vercel + AWS SDK v3, server-side only
- Scoped IAM key in Vercel env vars against an existing `agrinexus-data` table (the same table
  the delivery engine uses) — note this is the SDK path, not a Vercel-provisioned integration,
  and explain *why* (shared cross-repo table + Lambda/Step Functions/Streams need the full
  account, which the integration's limited-scope account can't provide)

### Monetization

- Tiered Stripe Checkout per cohort (Starter/Growth/Enterprise)
- Demo-activate for judges

### Lessons

- Make the backend visible in the UI (Advisory Loop hero)
- Design criterion = FE mirrors BE data model in provisioning wizard

## Publish targets

- builder.aws.com, dev.to, LinkedIn
