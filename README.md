# AgriNexus Platform

Multi-tenant B2B control plane for agricultural advisory services. Partners provision district cohorts, license them via Stripe, and monitor closed-loop farmer follow-through — all backed by Amazon DynamoDB on AWS and deployed on Vercel.

**Hackathon:** [H0 — Hack the Zero Stack](https://h01.devpost.com/) (Track 2: Monetizable B2B)  
**Primary database:** Amazon DynamoDB (single-table, multi-tenant, Streams-driven analytics)  
**Frontend:** Next.js on Vercel  
**For judges:** guided demo path + stack overview at [`/judges`](https://agrinexus-platform.vercel.app/judges) on the live app

## New vs existing (submission boundary)

| Component | Status |
|-----------|--------|
| **AgriNexus AI delivery engine** (WhatsApp advisory, Bedrock RAG, nudge loop, Step Functions) | Pre-existing — AWS AIdeas Innovation Award winner |
| **AgriNexus Platform** (this repo: partner provisioning, tenant isolation, dashboard, Stripe licensing, Streams aggregation) | **New — built for H0** |

The platform is the missing control plane: it lets NGOs, agri-input firms, and government extension programs ([KVK](https://en.wikipedia.org/wiki/Krishi_Vigyan_Kendra)s) provision and monitor advisory cohorts without engineering support.

## What ships

- Multi-tenant DynamoDB model (`TENANT#`, `COHORT#`, `LICENSE#`, `SUMMARY#`, membership)
- Self-serve cohort provisioning wizard (district, crops, languages, nudge rules)
- Tenant-scoped dashboard with materialized outcome summaries (DynamoDB Streams → Lambda)
- Control-plane-drives-delivery-plane coupling (active cohorts → weather poll → nudges)
- Tiered Stripe Checkout (Starter / Growth / Enterprise) + demo-activate for judges
- Cognito-ready auth with demo personas and tenant switcher

## Project structure

```
agrinexus-platform/
├── app/                    # Next.js App Router (dashboard, API routes, components)
├── lib/                    # DynamoDB entities, Stripe, auth, Lambdas
├── scripts/                # Seed and ops scripts
├── docs/                   # Architecture, design, execution plan
└── infra/                  # IAM policies
```

## Prerequisites

- Node.js 18+
- AWS account with DynamoDB table access
- (Optional) Stripe test keys, Cognito user pool, OpenWeatherMap API key

## Local development

```bash
cd agrinexus-platform
npm install
cp .env.example .env.local
# Edit .env.local with AWS credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Demo Login** on `/login` for judge access.

### Seed demo data

```bash
npm run seed
```

Creates 3 partner tenants with cohorts, farmers, and outcome summaries for a full demo loop.

### Healthcheck

Visit [http://localhost:3000/api/healthcheck](http://localhost:3000/api/healthcheck) to verify DynamoDB connectivity.

## Deploy to Vercel

1. Push to GitHub and import at [vercel.com/new](https://vercel.com/new)
2. Set environment variables from `.env.example`
3. Redeploy after env changes

**Vercel Team ID:** see project settings or `.vercel/project.json`

## Judge demo access

1. Go to `/login`
2. Click **Demo Admin — GreenHarvest NGO** (or any demo persona)
3. Explore Overview → Cohorts → cohort detail
4. **Admin:** create cohort via wizard, activate (demo or Stripe), run advisory cycle
5. **Tenant switcher:** flip between partners to see isolation

## AWS services (deliberate stack)

| Service | Role |
|---------|------|
| **DynamoDB** | Primary backend, multi-tenant single table, GSIs, Streams |
| **Lambda** | `OutcomesAggregator` — materializes cohort summaries from Streams |
| **Step Functions** | Nudge workflow (existing delivery engine) |
| **Cognito** | Partner authentication (optional; demo mode available) |
| **Secrets Manager** | Source of truth for all application secrets (Stripe, weather API key) |

## Secrets strategy

AWS Secrets Manager is the source of truth for application secrets. Only the bootstrap AWS credentials and non-sensitive config live in Vercel env vars (they are needed to authenticate to AWS in the first place).

| Secret / config | Location | Notes |
|-----------------|----------|-------|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Vercel env vars | Bootstrap credential; scoped to DynamoDB + Secrets Manager read (`infra/vercel-iam-policy.json`) |
| `AWS_REGION`, `DYNAMODB_TABLE_NAME`, `AWS_ACCOUNT_ID`, `NEXT_PUBLIC_APP_URL` | Vercel env vars | Non-sensitive config |
| Stripe key + per-tier price IDs | Secrets Manager `Stripe-Secret` | `{ secretKey, priceIds: { starter, growth, enterprise } }` |
| Weather API key | Secrets Manager `agrinexus/weather/api-key` | Plain-string secret |

Runtime access (`lib/secrets.ts`, `lib/stripe-secrets.ts`) tries Secrets Manager first and only falls back to env vars for local dev. Values are cached in-memory for 5 minutes to avoid per-request fetches. The judge demo path uses "Demo activate" and never requires Stripe to be configured.

## About AgriNexus AI

AgriNexus AI won the **AWS AIdeas Innovation Award** for a production WhatsApp advisory engine at ~$0.54/farmer/year. This platform adds the B2B layer partners need to provision, license, and monitor it.

See `docs/` for architecture, data model, design system, and the H0 execution checklist (`docs/09-h0-execution-plan.md`).
