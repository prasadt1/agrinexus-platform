# H0 Execution Checklist

Living checklist for AgriNexus Platform H0 submission.

> ⏰ **Deadline (corrected from official FAQ): Jun 29, 2026, 8:00 PM EDT ≈ 2:00 AM Jun 30 CEST.**
> Last full working day is **Jun 29** — submit that **morning**. The earlier "17:00 CET" figure
> was wrong. **Links (YouTube + repo) are immutable after the deadline** — they must be in Devpost
> before the wall, not staged to add at the buzzer. Don't touch the repo post-submission; fork to
> keep building.

## Phase 0 — Foundation

- [x] Fix `--color-success` / `--color-warning` tokens in `app/globals.css`
- [x] Replace fabricated `farmersReached` with real `members.length`
- [x] Rewrite README (new vs existing, Innovation Award, judge access)
- [x] Idempotent seed script (`npm run seed`) — 3 tenants, cohorts, farmers, summaries

## Phase 1 — Design & brand

- [x] Deep ink sidebar palette + elevation scale in `globals.css`
- [x] Dark sidebar in `app/dashboard/layout.tsx`
- [x] New logo mark component (`app/components/Logo.tsx`) + dynamic `app/icon.tsx` + `app/opengraph-image.tsx`
- [x] Toast/inline errors (replace `alert()`)
- [x] Layered cards + loop-aware empty states

## Phase 2 — Auth & multi-tenancy

- [x] Demo personas + session cookies (`lib/auth/`)
- [x] `/login` with one-click demo logins
- [x] Tenant switcher in sidebar (X-Tenant-ID override for demo isolation)
- [x] Role gating (Admin vs Viewer) on API + UI
- [x] Cognito placeholder (`lib/auth/cognito.ts`) — wire when pool provisioned

## Phase 3 — Provisioning wizard

- [x] `/dashboard/cohorts/new` multi-step wizard
- [x] Step 1: district, crops, languages
- [x] Step 2: nudge rules
- [x] Step 3: review + plan selection
- [x] Admin-only gate

## Phase 4 — Advisory Loop hero

- [x] Interactive loop diagram on Overview (`AdvisoryLoopHero`)
- [x] "Run advisory cycle" CTA → `trigger-poller`
- [x] Live results per cohort
- [x] "Materialized via DynamoDB Streams" lineage cue (`LineageBadge`)

## Phase 5 — Stripe & billing

- [x] `getStripePriceIdForPlan(plan)` — Starter / Growth / Enterprise
- [x] Dynamic Checkout metadata (cohort + district + plan)
- [x] Plan from session metadata on success
- [x] `/dashboard/billing` page
- [x] Stripe Dashboard branding (tight logo/icon, light panel + green accent, tiered descriptions)

## Phase 6 — Data polish

- [x] Real farmer counts on cohort detail
- [x] Mini sparklines on Overview cohort rows
- [x] Seed script for 2–3 farmers × 2–3 cohorts per tenant

## Phase 7 — Landing

- [x] B2B landing at `/` (audience, value prop, demo CTA)
- [x] Gloss KVK and Indian terms for international judges

## Phase 8 — Submission artifacts

- [x] Architecture diagram (`docs/h0-architecture.md`)
- [x] Demo script + video outline (`docs/h0-demo-script.md`)
- [x] "Why" narrative — the technical score (`docs/h0-why-architecture.md`)
- [x] Bonus content plan — 3 distinct pieces, +0.6 (`docs/h0-bonus-article.md`)
- [ ] **Write & publish 3 bonus pieces** (AWS Builder Center / LinkedIn / separate YouTube) — in author voice
- [ ] Capture live screenshots (AWS console, Stripe, Vercel env vars)
- [x] Vercel Team ID in `.vercel/project.json` (project lives under `prasadtilloo-8765s-projects`)

### Eligibility note — AWS database proof (binary pass/fail)

- **Confirmed (CLI):** prod env vars are `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` /
  `DYNAMODB_TABLE_NAME` / `AWS_REGION`, and Vercel integrations = **"No resources found."**
- ⇒ `agrinexus-data` does **NOT** appear under Vercel → Storage. Decision: **Floor path** —
  walk the Vercel→DynamoDB connection explicitly in the demo video (FAQ-sanctioned). See the
  eligibility-critical beat in `docs/h0-demo-script.md`.

## Phase 9 — Tests

- [x] `npm run test:smoke` script
- [x] `npm run build` passes
- [x] Run seed against live DynamoDB before demo
- [x] Manual: tiered Stripe test checkout (growth → ₹2,999 verified on prod)
- [x] Manual: run-cycle E2E on production (login → overview → seeded data verified)

## Agent handoff notes

- **Single session** for UI spine — completed in this pass
- Remaining manual: Stripe branding upload, screenshot capture, video recording, Cognito pool provisioning (optional upgrade from demo auth)
