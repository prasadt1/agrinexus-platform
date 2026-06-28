# Devpost FINAL submission — Outturn (H0 Hackathon)

> **Purpose:** copy-paste source for the Devpost submit flow (steps 1–5). Maps every field on the submit page.
>
> **Voice:** first person singular ("I"), per repo convention.
>
> **Hard rule for this submission: NON-AI flavor.** The H0 build is deterministic — weather-threshold rules, single-table DynamoDB, Streams rollups, OIDC, Stripe. No AI/ML/LLM/Bedrock language anywhere in public copy. The advisory decision is a plain rule check (wind / humidity / temperature thresholds), not a prediction.
>
> Legend for this doc: ✅ = ready to paste · ⛔ = only you can provide (account-specific) · 🖼️ = asset to upload.

---

## STEP 1 — Manage team

Solo entry → **skip** (Save & continue). No teammates to invite.

---

## STEP 2 — Project overview

### ✅ Project name  *(max 60 chars)*

```
Outturn — Advice, followed through
```

`34 / 60 characters.`

*(Backup if you want the category in the name: `Outturn — follow-through for farm advice` = 39 chars.)*

### ✅ Elevator pitch  *(max 200 chars)*

```
A B2B layer over a WhatsApp farm-advisory engine: partners run weather-rule advisory cycles on DynamoDB + Vercel, see who acted on each nudge, and gently follow up with those who didn't.
```

`186 / 200 characters.`

---

## STEP 3 — Project details (public project page)

### ✅ "Try it out" links

- Live app (Vercel): `https://outturn.vercel.app`
- Code (GitHub): `https://github.com/prasadt1/agrinexus-platform`
- Try the field engine on WhatsApp: `https://wa.me/4915120105731`

### ✅ Built with  *(tags)*

```
next.js, react, typescript, vercel, vercel-oidc, vercel-marketplace,
amazon-dynamodb, dynamodb-streams, aws-lambda, aws-step-functions,
amazon-eventbridge, amazon-api-gateway, aws-sts, stripe,
whatsapp-cloud-api, openweathermap
```

### 🖼️ Project media

- **Image gallery (3:2, ≤5 MB each):** dashboard overview, a cohort detail page (follow-through %), the architecture gallery, the WhatsApp thread. *(see `public/` + the architecture PNGs I'll export.)*
- ⛔🖼️ **Video demo link:** YouTube (public). *TODO — see bonus script `bonus-3-youtube-walkthrough-script.md`.*

### ✅ About the project  *(Project Story — target 1,500–2,000 words, Markdown)*

<!-- ===== PASTE FROM HERE ===== -->

## Inspiration

Good agronomic advice is everywhere — SMS blasts, WhatsApp groups, wall posters, and extension officers who visit when they can. What almost no one has is **any view of whether the advice was acted on.**

The organizations that pay for that advice feel this gap most. An NGO running a cotton program, an agri-input company, or a Krishi Vigyan Kendra (KVK — a government farm-science extension centre in India) can fund thousands of advisories a season and still not answer a basic question: *of the farmers we reached this week, who actually sprayed in the dry window, and who quietly slipped?*

I already had a field-facing piece that worked: a WhatsApp advisory engine that watches a district's weather, sends a plain-language message when conditions are right, and records the farmer's "Done" reply. What it was missing was the **business** around it — a way for a partner to define who they're advising, pay for it, watch follow-through, and act when a cohort goes quiet. That product is **Outturn**: a B2B control plane that turns a one-way advisory stream into a closed, measurable loop.

## What it does

Outturn is the dashboard a partner logs into. From it, a partner can:

- create a **cohort** — a district + crop group of farmers (e.g. cotton in Latur, a cotton-growing district in Maharashtra, India);
- set the **advisory rules** (safe spray thresholds) and reminder cadence;
- **activate** the cohort through Stripe (or a one-click demo activation for judges);
- **enroll farmers** by phone number;
- **run an advisory cycle** on demand and watch it go out over WhatsApp;
- see **live follow-through** per cohort — e.g. *28 of 42 farmers acted (67%)* — rolled up from real reply events;
- spot cohorts that **need attention** and **re-nudge** the farmers who didn't act;
- review a tenant-scoped **activity log** of every meaningful action.

The whole product is organized around one sentence: *provision → activate → poll → nudge → reply → summarize → detect → act.* The dashboard isn't decoration on top of an engine; it's the control surface for that loop.

## How I built it

The frontend and all control-plane API routes run on **Vercel** (Next.js, React, TypeScript). The operational data plane is **Amazon DynamoDB**. The field engine — Lambda, Step Functions, EventBridge, API Gateway, and WhatsApp via the Meta Cloud API — already existed. The H0 work was building the control plane and the AWS Database + Vercel integration that makes it a product.

**One table, two systems.** The control plane and the delivery engine meet through a single DynamoDB table (`agrinexus-data`) using a deliberately boring single-table design:

```text
TENANT#<tenantId> / COHORT#<cohortId>          partner-owned cohort config
TENANT#<tenantId> / LICENSE#<cohortId>         billing state
TENANT#<tenantId> / SUMMARY#<cohortId>#YYYY-MM  materialized outcomes
PHONE#<phone>     / MEMBERSHIP                  phone -> tenant/cohort join
USER#<phone>      / PROFILE                     field-engine farmer profile
USER#<phone>      / NUDGE#<ts>#<activity>       field-engine advisory events
```

The **phone number is the join key** across the two systems. Tenant isolation isn't a filter bolted on later — partner-owned rows physically live under `TENANT#<tenantId>`.

**Activation is a data contract, not a flag in code.** A draft cohort is just a `COHORT#` item; it's invisible to the loop. When a partner activates it, Outturn writes a `LICENSE#` row and stamps the cohort with a secondary-index key:

```text
GSI2PK = STATUS#active
GSI2SK = COHORT#<cohortId>
```

A poller queries that index for active cohorts, fetches each district's weather, and **deterministically** checks it against the cohort's rules. If the window is safe, it starts the engine's existing Step Functions workflow with a versioned payload. Crucially, this demo poller is on-demand and isolated — it never mutates the production scheduled poller — but it calls the *real* nudge workflow, so the end-to-end loop is genuine.

**Fast dashboards via Streams, not scans.** I didn't want the dashboard to recompute follow-through by scanning every advisory event on each page load. Instead, **DynamoDB Streams** feed an `OutcomesAggregator` Lambda that watches inserts and status changes — new nudge → `nudgesSent++`, `DONE` → `nudgesCompleted++`, `EXPIRED` → `nudgesExpired++` — and writes one `SUMMARY#<cohortId>#<period>` item per cohort per month. The dashboard reads that single item.

The subtle bug here is one you only meet after shipping: DynamoDB Streams are **at-least-once**, and Lambda can retry a batch, so even an atomic `ADD` can double-count. The aggregator claims each record with a `DEDUPE#<eventID>` marker before incrementing and skips anything already claimed. Atomicity and idempotency turned out to be two separate requirements before the numbers were trustworthy.

**Keyless on Vercel.** The production Vercel app reaches the shared table through **OIDC federation**: Vercel issues a per-deployment token, the app assumes an AWS role via STS, and the SDK gets short-lived credentials. There is no long-lived `AWS_SECRET_ACCESS_KEY` in the production path. A second DynamoDB table — the partner **activity log** — is provisioned through the **Vercel Marketplace** integration with its own OIDC-backed role, treated as best-effort so a missing audit table never breaks a user action.

**Consent lives in the data, at the last step.** The hardest invariant wasn't billing or charts — it was making sure enrolling a farmer never silently triggers a message. Enrollment writes the `MEMBERSHIP` row (for attribution) and seeds a `PROFILE` with `consent=pending` *only if absent*, so an already-opted-in farmer is never clobbered. The engine's sender has the final gate: if consent isn't `granted`, it skips the send.

**The "act" loop.** Reporting alone is passive, so cohorts with low follow-through are flagged "needs attention," and an admin can re-nudge them. That action is tenant-scoped, admin-gated, audited, and routed through the same Step Functions workflow, with an open-nudge gate that prevents double-sending to farmers who already have an action pending.

## A deterministic system, on purpose

There's no model guessing here, and that's a feature. "Is today a good day to advise spraying?" is a transparent rule a partner can read for themselves: is the wind below the threshold, the humidity below the threshold, the temperature in range, and the window dry? "Did the farmer act?" is a literal `DONE` reply, not an inference. Field officers can trace every step end to end — the advisory rule, the send, the reply, the rollup — and keep a record to learn what to try next season. The farmer always decides; Outturn just makes the nudge timely and the follow-up visible.

## Why Amazon DynamoDB (not Aurora)

The honest reason is fit, not fashion. The workload is high-write and event-shaped — profiles, cohorts, advisory events, replies, summaries, audit rows — and the access patterns are known and key-driven, not relational:

- get this tenant's cohorts;
- list this cohort's members;
- list all active cohorts;
- attribute a phone's advisory event to a cohort;
- read one materialized summary per cohort.

On Vercel, requests are serverless and bursty. Aurora is great, but then I'm managing connection pooling, or reaching for RDS Proxy / the Data API. DynamoDB is already a stateless HTTPS API — the natural boundary for per-request functions — and a single well-designed table plus two GSIs covers every screen.

## Challenges I ran into

The biggest challenges were boundaries, not features. **Consent across two systems:** enrollment and messaging live apart, so I had to make "enrolled" and "may be messaged" different states in the data, and put the final gate at the sender. **Idempotent rollups:** at-least-once Streams meant the first version of the dashboard could over-count follow-through; the `DEDUPE#` claim fixed it. **Productizing without breaking the engine:** the versioned, defaulted payload lets the new control plane drive the old workflow while older invocations keep working. And **keeping the demo honest:** isolating the on-demand poller from the production schedule so the integration is real but safe.

## Accomplishments I'm proud of

A judge can click through the entire loop in a couple of minutes: create a cohort, activate it, run a cycle, watch a WhatsApp advisory go out, see a reply land, and watch the follow-through number move — all on a Vercel front end backed by DynamoDB, with a Marketplace-provisioned audit trail and no stored AWS keys in production. The architecture is visible *because* the system's whole value is the loop.

## What I learned

Productization isn't a rewrite. It's drawing the right boundary around a working engine, then making that boundary **monetizable, observable, and safe**. Almost every good decision in this build was about turning behavior into an explicit data contract — activation via a GSI key, joins via phone number, outcomes via summary rows, consent via profile state, history via audit rows — so the UI could simply mirror the truth instead of inventing it.

## What's next

Self-join QR onboarding for farmers; advisory programs beyond spray windows (irrigation, sowing, pest scouting) as configurable rule sets; richer per-cohort attribution; partner-specific knowledge bases; and channel escalation when a cohort stays quiet. The pattern generalizes, but the engine is agriculture-specific today — so the next step is careful productization, not pretending every vertical is already a toggle.

<!-- ===== PASTE TO HERE ===== -->

---

## STEP 4 — Additional info (for judges/organizers)

| Field | Answer |
|---|---|
| ⛔ **Submitter Type** | *select* (Individual) |
| ⛔ **Country of Residence** | *select* (you — likely Germany per +49 / or India) |
| Organization name (if any) | *(leave blank — solo)* |
| ✅ **App Status** | **Existing** — significantly modified during the Submission Period |
| ✅ **Track** | **B2B** |
| ✅ **Which database** | **Amazon DynamoDB** |
| ⛔ **Published Vercel Link** | `https://outturn.vercel.app` *(confirm it loads with no permission wall)* |
| ⛔ **Vercel Team ID** | `team_XXXXX` — vercel.com → your team → Settings → General → Team ID |
| ✅🖼️ **Architecture diagram** (png/jpg/pdf, NOT svg) | **ready:** `docs/devpost-assets/exports/architecture-three-planes.png` (recommended — clean 3-tier) or `architecture-teardown.png` |
| 🖼️ **Screenshot proving AWS DB usage** | AWS Console → DynamoDB → `agrinexus-data` table; and/or Vercel Storage showing the Marketplace DynamoDB audit table |

### ✅ "If Existing, what did you update during the Submission Period?"

```
The farmer-facing WhatsApp advisory engine (AgriNexus) pre-existed the H0 window. During the Submission Period I built Outturn — a new B2B control plane and the AWS Database + Vercel integration around that engine. New in-window work: the Vercel/Next.js product and dashboard; tenant-scoped cohort provisioning; DynamoDB single-table modeling for tenants, cohorts, licenses, memberships, profiles, and summaries; GSI-based active-cohort discovery driving an on-demand advisory poller; DynamoDB Streams outcome rollups via an OutcomesAggregator Lambda with idempotent (DEDUPE#) processing; Stripe-based and demo cohort activation; Vercel OIDC federation into AWS (keyless production path); a Vercel Marketplace DynamoDB audit table; consent-safe enrollment gated at the sender; and an audited admin re-nudge action. The delivery engine is prior work; the control plane, DynamoDB integration, Streams rollups, audit table, billing, and control-plane-driven advisory loop are the H0 build.
```

### ✅ Testing Instructions for Judges (not public)

```
1. Open https://outturn.vercel.app — no login wall; use a one-click demo persona at /login.
2. Dashboard → run an Advisory Loop / Run advisory cycle and watch sent/skipped results.
3. Switch tenants to see isolation.
4. Create a cohort → activate via "demo activation" (free) or Stripe test checkout.
5. Open a cohort detail page to see follow-through %, member stats, and the re-nudge action.
6. Open Activity to see the audited control-plane events (Vercel Marketplace DynamoDB table).
7. Optional: message the live field engine on WhatsApp at https://wa.me/4915120105731.
```

### ✅ Optional bonus-points content URLs (use #H0Hackathon + authorship statement)

Include this exact framing with each link:
> *I created this content for the purposes of entering the H0 Hackathon. #H0Hackathon*

- ⛔ AWS Builder Center article — *publish from `bonus-1-aws-builder-article-v2.md`, paste URL*
- ⛔ LinkedIn post — *publish from `bonus-2-linkedin-post-v2.md`, paste URL*
- ⛔ YouTube walkthrough — *record from `bonus-3-youtube-walkthrough-script.md`, paste URL*

---

## STEP 5 — Submit (final checklist)

- [ ] App uses **DynamoDB** as primary backend ✅ (true)
- [ ] Frontend live on **Vercel**, no login wall ✅ (`outturn.vercel.app`)
- [ ] Teammates: n/a (solo)
- [ ] Published Vercel link live (not localhost) ✅
- [ ] **Vercel Team ID** included ⛔
- [ ] Track selected: **B2B** ✅
- [ ] Database selected: **Amazon DynamoDB** ✅
- [ ] Screenshot proving AWS DB usage uploaded 🖼️⛔
- [ ] **Architecture diagram** uploaded (a diagram, not a component list) 🖼️
- [ ] Main demo **video** on YouTube, public, shows app working + explains DynamoDB choice + problem/who/why 🖼️⛔
- [ ] Optional bonus content linked with #H0Hackathon ⛔
- [ ] Agree to Official Rules + Devpost ToS ⛔

---

## ⛔ What I need from you to finish

1. **Vercel Team ID** (`team_XXXXX`).
2. **Country of residence** + **Submitter Type** selections.
3. **YouTube demo video** URL (script ready in bonus-3).
4. **Published URLs** for the 3 bonus pieces (AWS Builder / LinkedIn / YouTube).
5. **AWS DynamoDB screenshot** (console table or Vercel Storage) — I can't reach your AWS console.
6. Confirm `outturn.vercel.app` has **no permission wall** for judges.
