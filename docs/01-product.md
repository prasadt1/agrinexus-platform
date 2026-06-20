# 01 — Product

> **Track:** H0 Track 2 — Monetizable B2B
> **Primary Database:** Amazon DynamoDB
> **Frontend:** Next.js on Vercel

---

## New vs. Existing Boundary

This distinction is critical for the H0 submission. Judges evaluate **only the new work**.

### Pre-Existing (Delivery Engine — Unchanged)

The **AgriNexus AI WhatsApp Advisory** system, built for the AIdeas Innovation Award:

- **Bedrock RAG + Vision** — crop disease diagnosis from farmer photos
- **Transcribe/Polly** — voice message processing for low-literacy farmers
- **Closed-loop nudge engine** — weather-triggered spray reminders with follow-up tracking
- **DynamoDB single-table core** — farmer profiles, conversations, nudge records
- **WhatsApp Business API integration** — message handling via Meta webhooks

### New (Built in Submission Window — What H0 Judges)

The **AgriNexus Platform** — a multi-tenant, self-serve B2B control plane:

- **Multi-tenant data modeling** — tenant isolation, cohort configs in DynamoDB
- **Self-serve provisioning** — partners create cohorts (district, crops, languages)
- **Tenant-scoped dashboard** — outcome metrics, follow-through rates
- **Streams-driven analytics** — materialized cohort summaries
- **Stripe licensing** — per-cohort subscription billing
- **Data-driven WeatherPoller** — cohort districts drive weather polling (the one bounded engine change)

---

## Buyer

**Agricultural partners running farmer programs:**

| Buyer Type | Examples | Scale |
|------------|----------|-------|
| NGOs | Digital Green, Precision Development | 10K–100K farmers |
| Agri-input firms | Bayer, UPL, local distributors | District-level programs |
| Government extension | KVKs, state agriculture departments | Block/district coverage |
| MFIs | Microfinance institutions with rural portfolios | Bundled with credit products |

**Common thread:** They need to *prove impact* to funders/boards, not just send messages.

---

## Value Proposition

> **"Provision a district cohort in minutes, see whether farmers actually acted on the advice, and license it self-serve."**

### Why It Wins Where Peers Don't

| Competitor Approach | AgriNexus Difference |
|---------------------|----------------------|
| Message delivery metrics | **Closed-loop accountability** — did the farmer spray? |
| Manual onboarding | **Self-serve provisioning** — partners do it themselves |
| Custom integrations | **Multi-tenant platform** — one deployment, many partners |
| Per-message pricing | **Per-cohort subscription** — predictable costs |

The **follow-through data** (nudge completion rates, not just delivery receipts) is the moat. Partners cannot get this from WhatsApp Business alone or generic broadcast tools.

---

## Monetization

### Model: Per-Cohort Subscription

```
Partner provisions cohort (draft)
         ↓
Partner clicks "Activate / License"
         ↓
Stripe Checkout (subscription)
         ↓
Webhook → LICENSE# written → COHORT# status = active
         ↓
Delivery engine picks up active cohort
         ↓
Monthly/annual billing via Stripe
```

### Pricing Tiers (Illustrative)

| Tier | Scope | Price | Target |
|------|-------|-------|--------|
| Starter | 1 district, ≤1,000 farmers | $50/month | Pilot programs |
| Growth | 3 districts, ≤10,000 farmers | $200/month | Regional NGOs |
| Enterprise | Unlimited districts | Custom | State governments |

### Unit Economics

From existing system: **~$0.54/farmer/year** operational cost (WhatsApp + Bedrock + infra).

Platform adds:
- Vercel hosting: ~$20/month (Pro plan)
- Stripe fees: 2.9% + $0.30 per transaction
- DynamoDB: Marginal (single table, on-demand)

**Gross margin:** 70%+ at Growth tier.

---

## Demo & Judge Access

### Requirements (from H0 rules)

- Judges must have **free working access**
- No payment required to see full functionality

### Implementation

1. **Demo login credentials** — provided in submission
2. **Demo-activate path** — button to activate cohort without Stripe payment
3. **Pre-seeded data** — sample cohort with realistic outcome metrics
4. **WhatsApp demo** — existing public demo number for live advisory test

### Demo Flow for Judges

```
1. Log in with demo credentials
2. View pre-existing "Demo District" cohort with metrics
3. Create new cohort via provisioning wizard
4. Click "Demo Activate" (bypasses Stripe)
5. See cohort appear as active
6. (Optional) Send WhatsApp message to demo number, see interaction logged
```

---

## Roadmap Items (Configure-Only)

These features are surfaced as **cohort config options** in the platform UI, demonstrating extensibility. They are **not built** this week.

| Feature | Config Option | Status |
|---------|---------------|--------|
| Mandi prices | `features.mandiPrices: true` | Roadmap |
| Personalized recommendations | `features.personalization: true` | Roadmap |
| Streaming STT | `features.streamingVoice: true` | Roadmap |
| Custom nudge campaigns | `nudgeRules.custom: [...]` | Tier 3 stretch |

The platform is the **vehicle** for these features, not the implementer. This keeps scope contained while showing product vision.

---

## Success Metrics (Post-Launch)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Partner activation | 3 paying partners in 90 days | Stripe dashboard |
| Cohort provisioning time | < 5 minutes | Analytics |
| Follow-through rate visibility | 100% of active cohorts | Dashboard completeness |
| Platform uptime | 99.5% | Vercel + AWS monitoring |

---

## Competitive Positioning

```
                    High Accountability
                           │
                           │  AgriNexus Platform
                           │  (closed-loop nudges,
                           │   outcome dashboards)
                           │
    Low Self-Serve ────────┼──────── High Self-Serve
                           │
         Custom Integrations│   WhatsApp Business
         (Precision Dev,   │   (broadcast only,
          Digital Green)   │    no follow-through)
                           │
                    Low Accountability
```

AgriNexus Platform occupies the **high-accountability, high-self-serve** quadrant — the gap in the market.
