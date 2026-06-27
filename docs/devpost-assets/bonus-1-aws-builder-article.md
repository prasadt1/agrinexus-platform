# From a WhatsApp advisory engine to a B2B control plane: DynamoDB single-table + Streams, keyless on Vercel

> *Disclosure: I created this content for the purposes of entering the H0 Hackathon. #H0Hackathon*
>
> **DRAFT — review for author voice & specifics before publishing.** Target: AWS Builder Center (also cross-post dev.to / LinkedIn article).

Last year our WhatsApp advisory engine for smallholder farmers — AgriNexus AI — was an AWS AIdeas finalist. It does one thing well: watch the weather for a village, and when conditions are right, send a farmer a plain-language WhatsApp nudge ("good day to spray cotton in Latur — wind 8 km/h, no rain"). Farmers reply "हो गया" (done), and the loop closes.

The H0 "Hack the Zero Stack" hackathon asked a different question: can you ship a **monetizable, full-stack B2B product** on Vercel that uses an AWS database — in days, without rebuilding what already works?

What I landed on — Outturn — is a **control plane** that sits on top of the same engine. The sponsoring partner (an NGO, an agri-input company, a government extension program) provisions cohorts, sees who actually followed through, and pays per district. Here's the architecture, and more importantly, *why* each piece is the way it is.

## One table, two planes

There is exactly one DynamoDB table, `agrinexus-data`, and it feeds **both** the delivery engine and the new control plane. That shared table is the most important decision in the whole project.

- **Identity is a phone number.** That's a natural partition key. The workload is high-write and append-heavy — nudges sent, replies received, outcomes tallied — and it's accessed by phone and by tenant, never relationally. Single-table DynamoDB fits the shape of the problem.
- **Tenant isolation is partition scoping.** Every item a partner can touch lives under `PK = TENANT#<id>`. A partner query can only ever address its own prefix — there's no `WHERE tenant_id = ?` to forget. Isolation is structural.
- **Two GSIs, two access patterns.** `GSI1` maps a cohort to its members; `GSI2` lists active cohorts for the weather poller. No duplicated data, no third index "just in case."

## The control plane drives the delivery plane

Here's the part I'm proud of. When a partner activates a cohort in Outturn, its item gets a `GSI2` entry. The engine's WeatherPoller reads active cohorts **from GSI2**, not from a hardcoded list of districts. So **provisioning a cohort in the dashboard literally changes what the engine does in the field** — no deploy, no config push. Control plane and delivery plane are decoupled through the data model.

## Streams, not read-time scatter-gather

A partner dashboard has to load fast and cheap; you don't want to scan thousands of nudge events on every page view. So outcomes roll up through **DynamoDB Streams → an OutcomesAggregator Lambda → `SUMMARY#` items**. The dashboard reads **one pre-computed item per cohort**, not a scan.

One subtlety bit me: DynamoDB Streams are at-least-once, and Lambda retries failed batches. A naive `ADD` counter double-counts on replay and quietly inflates every follow-through number on the dashboard. The fix is an idempotency key — each stream `eventID` is claimed exactly once via a `DEDUPE#<eventID>` marker (a conditional `PutItem`, TTL-expiring), and replays are skipped. **Atomic ≠ idempotent; you need both.**

## Why DynamoDB over Aurora (the part most teams won't say)

The honest reason isn't "NoSQL is web-scale." It's concurrency. Aurora's connection-pool model fights serverless: on Vercel, every request is its own function invocation, and you'd reach for RDS Proxy or the Data API to keep from exhausting connections. **DynamoDB is a stateless HTTP API with no pool** — the natural fit for per-request Vercel functions. That's the observation that makes experienced engineers nod.

## The Vercel ↔ AWS connection: keyless, two ways

This is where I spent the most care, because it's easy to overclaim. Outturn talks to AWS two ways, and **neither uses a long-lived access key**:

1. **Our own table (`agrinexus-data`) via OIDC federation.** Vercel issues a per-deployment OIDC token; the Next.js server exchanges it for short-lived STS credentials by assuming a scoped IAM role (`@vercel/oidc-aws-credentials-provider`). There is no `AWS_SECRET_ACCESS_KEY` in the environment at all. I proved it with a write/read/delete health-check endpoint that runs with zero static credentials present.
2. **A Vercel-Marketplace-provisioned DynamoDB (`outturn-audit-log`) for the partner activity log.** This one is provisioned *through* Vercel, shows up in the Storage tab, and is wired with the same OIDC federation (the integration injects an `AUDIT_AWS_ROLE_ARN`). It records every control-plane action — cohort created, activated, license issued, cycle run.

Why both? The primary table is shared across two repos and needs full-account access (Lambda, Step Functions, Streams) that a Marketplace integration's limited-scope account can't grant — so OIDC against our own account is the right call. The audit log is a clean, self-contained concern, so it rides the Vercel-native integration. The result: **zero static credentials anywhere, and a genuine Storage-tab database.**

## Monetization

It's a real B2B product, so it bills like one. Each cohort activates through Stripe Checkout in three tiers (Starter / Growth / Enterprise), with a demo-activate path so hackathon judges can see an active cohort without a card. The license is just a `LICENSE#` item; billing state is more single-table data.

## What I'd tell myself at the start

- **Make the backend visible.** The dashboard's hero is an animated "advisory loop" that walks weather → nudge → reply → rollup → proof. Partners (and judges) understand the system in ten seconds because the UI mirrors the data model.
- **The frontend should mirror the backend's shape.** The provisioning wizard's steps map 1:1 to the cohort item's fields. When the FE mirrors the BE data model, the whole thing feels coherent — and that's a design win, not just an engineering one.

The engine was already good. The lesson of H0 was that a thin, honest control plane — one that *shares* the engine's table instead of forking it — turns a working pilot into something a partner will pay for.

*Built for #H0Hackathon. Live demo: https://outturn.vercel.app · Try the engine on WhatsApp: https://wa.me/4915120105731*
