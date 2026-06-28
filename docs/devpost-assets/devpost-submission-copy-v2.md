# Devpost submission copy v2

> **DRAFT - paste into Devpost fields after rewriting in first person where needed.**
>
> This is not one of the three +0.6 bonus pieces. It is submission-page copy that should stay aligned with the public AWS Builder / LinkedIn / YouTube assets.

## Elevator pitch

Outturn is a B2B control plane for AgriNexus AI, a WhatsApp advisory engine for smallholder farmers. The delivery engine sends weather-aware nudges and tracks farmer replies; Outturn lets partners create cohorts, activate paid programs, enroll farmers, run advisory cycles, and prove follow-through by district and crop.

Built for H0, the new work is the Vercel + Amazon DynamoDB control plane: multi-tenant cohort provisioning, Stripe licensing, OIDC-based AWS access, DynamoDB Streams outcome rollups, and an audit log backed by a Vercel Marketplace DynamoDB table.

## Inspiration

AgriNexus AI already proved the farmer-facing loop: a farmer receives a plain-language WhatsApp nudge when conditions are right, replies when the action is done, and the system records the outcome.

The missing product was accountability for the organization funding the advice. NGOs, agri-input companies, and extension programs need to know which cohorts are actually following through. Outturn turns the existing delivery engine into a monetizable B2B control plane.

## What it does

Outturn lets a partner:

- sign in through demo personas and switch between tenant contexts
- create a district/crop cohort
- configure advisory rules and reminder cadence
- activate a cohort through Stripe Checkout or a free demo activation path
- enroll farmers by phone number
- run an advisory cycle from the dashboard
- see live cohort outcomes from DynamoDB summaries
- identify cohorts that need attention and re-nudge them
- review a tenant-scoped activity log

The product is intentionally framed around one loop:

```text
provision -> activate -> poll -> nudge -> reply -> stream -> summary -> detect -> act
```

## How I built it

The frontend and control-plane API routes run on Vercel with Next.js. The operational data plane is Amazon DynamoDB, using the existing `agrinexus-data` table shared with the AgriNexus delivery engine.

The main table stores tenants, cohorts, licenses, memberships, farmer profiles, nudge events, and outcome summaries. Tenant-owned records live under `TENANT#<tenantId>`. Phone numbers are the join key between the control plane and delivery engine: `PHONE#<phone>/MEMBERSHIP` maps a farmer to a cohort, while `USER#<phone>/PROFILE` remains the engine-owned farmer profile.

When a cohort is activated, Outturn adds `GSI2PK=STATUS#active`. The platform demo poller queries that index, fetches weather for each active cohort, evaluates the cohort rules, and starts the existing Step Functions nudge workflow with a versioned payload. This proves the control-plane-to-delivery loop without mutating the production scheduled WeatherPoller.

DynamoDB Streams feed an `OutcomesAggregator` Lambda. It watches `NUDGE#` inserts and status changes, attributes each event through `PHONE#<phone>/MEMBERSHIP`, and updates one `SUMMARY#<cohortId>#<period>` item per cohort. The aggregator claims each stream event with a `DEDUPE#<eventID>` marker so Lambda retries do not double-count outcomes.

The production Vercel app uses OIDC federation into AWS through `AWS_ROLE_ARN`, so the main table path does not require a long-lived AWS access key in Vercel. A second DynamoDB table, provisioned through the Vercel Marketplace integration, stores the partner activity log and is wired through separate `AUDIT_*` OIDC variables.

## Significant updates during the submission period

AgriNexus AI, the farmer-facing WhatsApp delivery engine, pre-existed the H0 submission window. For H0 I built Outturn, a new B2B control plane and AWS Database + Vercel integration around that engine.

The in-window work includes:

- the Vercel-hosted Next.js product shell and dashboard
- tenant-scoped cohort provisioning
- DynamoDB single-table modeling for tenants, cohorts, licenses, memberships, profiles, and summaries
- GSI-based active cohort discovery for the platform demo poller
- DynamoDB Streams outcome aggregation through `OutcomesAggregator`
- idempotent stream processing with `DEDUPE#<eventID>` markers
- Stripe-based cohort activation and demo activation
- Vercel OIDC federation into AWS for the production main-table path
- Vercel Marketplace DynamoDB audit logging
- consent-safe enrollment that seeds `consent=pending` and relies on the engine sender gate before any proactive WhatsApp message is sent
- an admin re-nudge action for underperforming cohorts

The key boundary: the delivery engine is prior work; the monetizable Vercel control plane, DynamoDB integration, Streams rollups, audit table, billing flow, and control-plane-driven advisory loop are the H0 build.

## AWS database choice

I chose DynamoDB because the data model is event-shaped and high-write: advisory sends, farmer replies, cohort memberships, summaries, and audit events. The access patterns are known and key-driven, not relational:

- list this tenant's cohorts
- list this cohort's members
- list active cohorts
- attribute a phone-number event to a cohort
- read one summary item per cohort

On Vercel, DynamoDB also fits the serverless request model better than a connection-pooled database. Aurora would require connection-pool handling, RDS Proxy, or Data API decisions. DynamoDB is a stateless HTTPS API, which is the right boundary for per-request serverless functions.

## Challenges

The biggest challenge was not drawing charts. It was making the cross-system contract safe.

Partner enrollment and WhatsApp messaging live in different systems. If the platform merely wrote "this farmer is in this cohort," the engine could find that farmer and message them before they opted in. The fix was to model consent explicitly: enrollment writes membership for attribution and seeds a `consent=pending` profile, while the sender refuses to send unless consent is `granted`.

The second challenge was making outcome aggregation correct under retries. DynamoDB Streams are at-least-once, so atomic counters alone are not enough. The aggregator had to become idempotent before the dashboard numbers were trustworthy.

## What I learned

The strongest architecture in this build was not a new AI feature. It was the boundary between the existing field engine and the new control plane.

Outturn works because activation, consent, audit, summaries, and cohort state are data contracts. The UI mirrors those contracts, so judges and partners can see the loop: configure a cohort, activate it, trigger advisory delivery, receive replies, materialize outcomes, and act when the cohort goes quiet.

## What's next

The current product proves the spray-advisory loop. Next I would expand the same accountability engine into configurable programs:

- self-join QR onboarding
- per-cohort advisory programs beyond spray windows
- voice and photo diagnosis behind explicit feature gates
- richer Q&A attribution by cohort
- partner-specific knowledge bases
- channel escalation when a cohort needs attention

The pattern is generalizable, but the engine is still agriculture-specific today. The next step is careful productization, not pretending every vertical is already a config toggle.

## Demo instructions

1. Open https://outturn.vercel.app.
2. Go to `/login` and choose a one-click demo persona.
3. Open the dashboard and run the Advisory Loop.
4. Switch tenants to see isolation.
5. Create a cohort, then use demo activation or Stripe test checkout.
6. Open Activity to see audit events.
7. Open a cohort detail page to see summary outcomes, member stats, and re-nudge actions.

## Links

- Live app: https://outturn.vercel.app
- WhatsApp engine: https://wa.me/4915120105731
- Repository: https://github.com/prasadt1/agrinexus-platform
- Bonus AWS Builder article: TODO
- Bonus LinkedIn post: TODO
- Bonus YouTube technical walkthrough: TODO
