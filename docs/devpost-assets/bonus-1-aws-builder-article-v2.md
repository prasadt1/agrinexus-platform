# Building Outturn: a Vercel control plane for a WhatsApp advisory engine on DynamoDB

> *Disclosure: I created this content for the purposes of entering the H0 Hackathon. #H0Hackathon*
>
> **DRAFT v2 - review for author voice before publishing.** Target: AWS Builder Center. This version reflects the current architecture after the OIDC, audit-log, consent, and act-loop changes.

Last year, AgriNexus AI was an AWS AIdeas finalist for a very specific farmer-facing loop: watch the weather for a district, send a WhatsApp advisory when conditions are right, and let the farmer reply when the action is done.

For H0, I did not rebuild that engine. I built the missing B2B product around it.

Outturn is the new control plane: a Vercel-hosted dashboard where an NGO, agri-input company, or extension partner can create cohorts, activate a paid program, enroll farmers, trigger advisory cycles, and see whether people actually followed through. The interesting part is not that it has charts. The interesting part is that the dashboard and the delivery engine meet through the same DynamoDB table without turning the production nudge engine into a monolith.

## The boundary: delivery engine vs control plane

The delivery engine already existed: AWS Lambda, Step Functions, DynamoDB, WhatsApp via Meta, and Bedrock-backed advisory behavior. It owns the field loop: send, remind, detect replies, and record outcomes.

The H0 work is the control plane:

- a Next.js app on Vercel
- tenant-scoped cohort provisioning
- tiered Stripe activation
- DynamoDB single-table modeling for tenants, cohorts, licenses, memberships, and summaries
- DynamoDB Streams rollups through an `OutcomesAggregator` Lambda
- Vercel OIDC federation into AWS for the production app path
- a separate Vercel Marketplace DynamoDB table for the partner activity log

That boundary matters. It keeps the public demo honest: the farmer advisory engine pre-existed, while the AWS Database + Vercel control plane integration was built for H0.

## One operational table for the loop

The main table is still `agrinexus-data`. It is shared by the control plane and the delivery engine.

The key design is intentionally boring:

```text
TENANT#<tenantId> / COHORT#<cohortId>        partner-owned cohort config
TENANT#<tenantId> / LICENSE#<cohortId>       billing state
TENANT#<tenantId> / SUMMARY#<cohortId>#YYYY-MM  materialized outcomes
PHONE#<phone> / MEMBERSHIP                   phone -> tenant/cohort join
USER#<phone> / PROFILE                       delivery-engine farmer profile
USER#<phone> / NUDGE#<timestamp>#<activity>  delivery-engine nudge events
```

That model gives me two important joins without a relational database:

1. The platform can ask, "which farmers are enrolled in this cohort?"
2. The Streams aggregator can ask, "this WhatsApp nudge event came from this phone number; which tenant and cohort should receive the outcome?"

Phone number is the cross-plane join key. Tenant isolation is not a filter bolted on later; the partner-owned rows live under `TENANT#<tenantId>`.

## Activation is a data contract

A draft cohort is just a `COHORT#` item. It does not appear in the delivery loop.

When a partner activates it, Outturn writes the license and updates the cohort to `status=active`. That update adds:

```text
GSI2PK = STATUS#active
GSI2SK = COHORT#<cohortId>
```

The platform demo poller reads that GSI and starts the engine's Step Functions workflow for active cohorts whose weather passes the cohort rules. This was a deliberate safety decision: the H0 control plane can prove the end-to-end loop without mutating the production scheduled WeatherPoller. The demo poller is on-demand, tenant-gated, and isolated, but it still calls the real nudge workflow.

The payload sent to the engine is versioned:

```json
{
  "schemaVersion": 1,
  "tenantId": "demo-greenharvest",
  "cohortId": "01J...",
  "programId": "default-spray",
  "location": "Latur",
  "activity": "spray",
  "weather": { "wind_speed": 8.5, "rain": 0 },
  "rules": {
    "sprayConditions": { "maxWindSpeed": 15, "maxHumidity": 80, "minTemp": 18, "maxTemp": 34 },
    "reminderIntervals": [24, 48],
    "expiryHours": 72
  }
}
```

The engine defaults missing fields, so older invocations keep working. That is the difference between productizing an engine and breaking it.

## Why DynamoDB instead of Aurora

The honest reason is not "NoSQL is web scale." It is fit.

The workload is high-write and event-shaped: profile rows, cohort rows, nudge records, replies, summaries, and audit events. The access patterns are known:

- get this tenant's cohorts
- list this cohort's members
- list active cohorts
- attribute this phone's nudge event to a cohort
- read one materialized summary per cohort

On Vercel, the request model is serverless and bursty. Aurora can work, but then I am managing connection pooling or reaching for RDS Proxy/Data API. DynamoDB is already a stateless HTTPS API. For this control plane, that is the simpler and more natural boundary.

## Streams: fast dashboards without scans

I did not want the dashboard to compute follow-through by scanning `NUDGE#` events every time a partner loads a page.

Instead, DynamoDB Streams feed an `OutcomesAggregator` Lambda. The aggregator watches nudge inserts and status transitions:

- new nudge -> increment `nudgesSent`
- `DONE` -> increment `nudgesCompleted`
- `EXPIRED` -> increment `nudgesExpired`

It writes the result into one `SUMMARY#<cohortId>#<period>` item per cohort and month. The dashboard reads that item directly.

The important bug here is the one you only notice after building it: DynamoDB Streams are at-least-once. Lambda can retry a batch. Atomic counters are not enough, because an atomic `ADD` can still be applied twice.

The aggregator claims each stream record with a `DEDUPE#<eventID>` marker before incrementing. If a retry sees the marker, it skips the record. Atomicity and idempotency are separate requirements.

## Keyless on Vercel, in two places

There are two DynamoDB integrations in the current build.

The main operational table, `agrinexus-data`, lives in my AWS account because it is shared with Lambda, Step Functions, Streams, and the existing delivery engine. In production, the Vercel app uses OIDC federation: Vercel issues a per-deployment token, the app assumes an AWS role via STS, and the AWS SDK receives short-lived credentials. There is no long-lived `AWS_SECRET_ACCESS_KEY` in the production path. Local development can still use the normal AWS SDK fallback chain.

The second table is the partner activity log. That one is provisioned through the Vercel Marketplace DynamoDB integration and appears in Vercel Storage. It uses its own `AUDIT_` environment variables and its own OIDC-backed role. The code treats it as best-effort: if the audit table is not provisioned, user actions still work; if it is provisioned, every meaningful control-plane action is recorded.

That gives the submission both sides:

- the real shared production table where the engine and platform meet
- a Vercel-native Marketplace DynamoDB table for the audit trail

## The consent seam

The hardest product invariant was not billing or charts. It was consent.

A partner can enroll a farmer in a cohort, but that must never mean the farmer immediately receives a proactive WhatsApp message. The engine may find the farmer by district, but it must not nudge until the farmer opts in.

The fix is a two-row model:

- `PHONE#<phone>/MEMBERSHIP` says which tenant/cohort should receive attribution.
- `USER#<phone>/PROFILE` carries delivery fields and `consent`.

When the platform enrolls a farmer, it writes the membership and seeds a profile with `consent=pending`. That profile is only created if absent, so an existing opted-in farmer is never clobbered. The engine's sender has the final gate: if consent is not `granted` (or legacy `true`), it skips the nudge.

That is where the invariant belongs: in the data contract, and at the last possible sending step.

## Monetization and the "act" loop

Outturn is a B2B control plane, so activation is tied to a license. A partner activates a cohort through Stripe Checkout or a free demo-activate path for judges. Either way, the result is a `LICENSE#` row and an active cohort.

The dashboard also moved beyond passive reporting. Cohorts with low follow-through are flagged as "needs attention." An admin can re-nudge a cohort, and that endpoint is tenant-scoped, admin-gated, audited, and routed through the same Step Functions workflow. The engine's open-nudge gate prevents duplicate sends to farmers who already have an open action.

In other words, the loop is:

```text
provision -> activate -> poll -> nudge -> reply -> stream -> summary -> detect -> act
```

That is the product. The dashboard is not just observing the engine; it is a control plane for it.

## What I would keep if I rebuilt it

I would keep three decisions:

1. **Make the backend visible.** The UI literally shows the advisory loop, because that is the system's value.
2. **Let data be the contract.** GSI2 activation, membership joins, summary rows, consent states, and audit events are all explicit rows or indexes.
3. **Do not overclaim integration.** The demo poller is isolated from the production scheduled poller. The production Vercel path is keyless via OIDC, while local fallback remains pragmatic. The audit table is Vercel Marketplace-provisioned; the main table is shared operational infrastructure.

The H0 lesson for me was that productization is not a rewrite. It is drawing the right boundary around a working engine, then making that boundary monetizable, observable, and safe.

*Built for #H0Hackathon. Live demo: https://outturn.vercel.app · Try the engine on WhatsApp: https://wa.me/4915120105731*
