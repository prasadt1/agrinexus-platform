# Outturn — Product Design Spec (v2)

> The control plane for a multi-modal farmer **accountability engine**. This spec locks the product
> definition, maps it to the AgriNexus engine's real capabilities, and sequences the build.
> Source vision: the AgriNexus AIdeas-finalist *Productization Roadmap* (§7), grounded against a
> capability audit of `agrinexus-ai/src` and reconciled with an **independent code review** (§11).
>
> **v2 changes (after independent review):** added a versioned engine↔platform contract; reframed
> modality enablement as policy resolution (not a flag write); split "live in engine" from
> "product-ready in Outturn"; re-sequenced Phase 1 as a contract-first, engine-defaults-first slice;
> softened the domain-agnosticism claim; added KB-tenancy, Q&A-attribution, idempotency, authz,
> migration, and cost/scale as first-class design items.

## 1. Thesis

**The accountability loop is the product. Triggers, copy, channel, and knowledge are pluggable.**

The engine's loop — **trigger → send → confirm → remind → detect → measure** — is parameterized by an
`activity` string ([nudge/sender.py:193](../../agrinexus-ai/src/nudge/sender.py)). The *trigger* and
*copy* are spray-specific today; the loop *mechanics* (status detection, outcome rollup) are reusable.
So the same loop can run *spray window*, *irrigation reminder*, *mandi sell-window*, and — per the
roadmap — beyond agriculture (*medication adherence*, *micro-savings*). **Outturn is the control plane
that lets a partner configure, run, and prove these loops per cohort, across modalities.**

> ⚠️ Honest scope (per review §11): "only trigger + copy change" understates the coupling. Reminder
> copy is spray-worded, cadence is hardcoded, and measurement is not yet program-dimensional.
> Generalizing the loop is real work, not a free config swap (see §9).

## 2. What Outturn is — and isn't

- **Is:** a configurable accountability control plane. A partner composes *programs* per cohort,
  onboards farmers, sees engagement + outcomes across modalities, and can **act** when a cohort goes dark.
- **Isn't:** a follow-through dashboard for weather-spray nudges. (That's what exists today.)

## 3. Core abstractions

| Concept | Definition |
|---|---|
| **Cohort** | A partner's program audience — farmers grouped by district/crop. Already modeled. |
| **Program** (advisory type) | `{ trigger, copy/template, channel(s), KB binding }`. Long-term a first-class child of a cohort; **Phase 1 uses a single implicit `default-spray` program** with `programId` as an optional forward-compat field (see §8). |
| **Channel / modality** | text · voice · photo-in (diagnosis) · web-chat — all exist in the engine. |
| **The loop** (engine) | `send → confirm(DONE/NOT-YET) → remind → detect → measure`. Activity-parameterized. |
| **Feature gate** | A capability is ON for a farmer only when **policy resolves**: `allowlist(phone) && tenantPlanAllows(feature) && cohort/programConfig(feature) && userConsent(channel)`. Not a single flag (see §5.3). |
| **Act verb** | What a partner does to a stalled cohort: re-nudge · escalate channel (text→voice) · request a photo · human escalation (stub). |

## 4. The control plane lifecycle (what we must complete)

| Stage | Today | Target |
|---|---|---|
| **Onboard** | API/seed only | Partner-enroll (number/CSV) **+** WhatsApp self-join QR (engine has `auto_assign_cohort`) **+** farmer names |
| **Configure** | collected but **engine ignores it** | Cohort config reaches the engine via a versioned contract (§5.1) |
| **Advise** | weather→spray only | Multi-program × multi-channel, partner-selected |
| **Listen** | consent + DONE replies | Two-way RAG Q&A surfaced — *after* messages are made cohort-attributable (§5.4) |
| **Detect** | passive % | "Needs attention" (underperforming / stalled / unanswered) |
| **Act** | nothing | Channel-aware act verbs, idempotent + tenant-scoped (§5.5) |
| **Measure** | follow-through % | Multi-modal — follow-through · Q&A topics · diagnosis severity · voice engagement |

## 5. Architecture

### 5.1 The engine↔platform contract (the keystone)
Today the only payload the engine receives is `{location, weather, activity:'spray'}`
([trigger-poller/route.ts:134](../app/api/demo/trigger-poller/route.ts)), and `NudgeSender` queries
farmers by `LOCATION#`. Making config real requires a **versioned, backward-compatible** Step
Functions input — and the **engine must default missing fields to today's constants before the
platform sends anything new**:

```json
{
  "schemaVersion": 1,
  "tenantId": "...", "cohortId": "...", "programId": "default-spray",
  "location": "Latur", "activity": "spray",
  "weather": { "wind_speed": 8.5, "rain": 0 },
  "rules": { "sprayConditions": { "maxWindSpeed": 15, "...": "..." }, "reminderIntervals": [24,48,72] }
}
```
Engine reads `rules.*` if present, else falls back to the current hardcoded `wind<10 && rain==0` and
`[24,48,72]`. This makes old WeatherPoller invocations (which still send the old shape) safe.

### 5.2 Programs (Phase-1-safe)
Single-table keys assume one cohort-level program today (`COHORT#`, one `PHONE#/MEMBERSHIP`,
`SUMMARY#cohortId#period`, active on `GSI2PK=STATUS#active`). First-class multi-program needs new keys
(`PROGRAM#cohortId#programId`, `SUMMARY#cohortId#programId#period`, program-level active GSI) and is
**deferred**. Phase 1 ships `programId="default-spray"` as an optional contract field so the later
migration is forward-compatible.

### 5.3 Modality enablement = policy resolution, not a flag write
The engine's `voicePreference` lives on `USER#phone/PROFILE` (per-phone, not per-cohort) and is
allowlist-gated; `is_approved_user()` is also phone-level. So "flip voice on for a cohort" is **not a
blind profile write** — it's a **feature-gate resolver**: `allowlist(phone) && tenantPlanAllows &&
cohort/programConfig && userConsent(channel)`. This resolver must exist before any per-cohort modality
toggle is claimed. (Corrects v1's "voice is an S, just write the flag.")

### 5.4 KB multi-tenancy & Q&A attribution
`KNOWLEDGE_BASE_ID`/`GUARDRAIL_ID` are **global env vars**; per-partner KB is a real design (ingestion,
tenancy, permissions, citation provenance), not wiring. And `save_message()` persists
`USER#phone/MSG#ts` **without** `tenantId`/`cohortId`/topic/refusal — so "Q&A topics by cohort" is not
honestly possible until messages are enriched (after the membership lookup that already happens).

### 5.5 Act endpoints (idempotency + authz)
A new `POST /api/cohorts/[id]/nudge` (and escalation) must be **tenant-scoped + role-gated + audited**,
carry an **`idempotencyKey`/`actId`** with a per-cohort **cooldown**, and never allow cross-tenant
Step Functions invocation. (The webhook already dedupes by `wamid`; the aggregator dedupes stream
events — act endpoints need their own key.)

## 6. Capability ledger — engine reality vs **product-readiness**

"Live in engine" ≠ "product-ready in Outturn." Product-ready = runtime-verified **and** gate-controllable
per cohort **and** cohort-attributable **and** tenant-safe.

| Capability | In engine code | Caveats | Product-ready? | Real effort |
|---|---|---|---|---|
| Weather→spray→follow-through | ✅ | — | ✅ (today) | — |
| Per-cohort nudge rules | collected, **engine ignores** | UI claim was false (now fixed) | ❌ | M (contract) |
| Voice (Transcribe/Polly) | ✅ code | allowlist-gated; flag is phone-level; runtime not re-verified | ❌ (needs gate resolver) | M |
| Photo diagnosis (Bedrock Vision) | ✅ code | allowlist-gated; saved as text, not structured analytics | ❌ (needs persistence+gate) | M |
| Two-way RAG Q&A | ✅ code | **not** cohort-attributed in storage | ❌ (needs enrichment) | M |
| Web-chat API `POST /chat` | ✅ **runtime-CONFIRMED** (live RAG + citations, this session) | global KB; CORS `*`; no tenancy | partial (embed needs tenancy) | M |
| WhatsApp self-onboarding (`auto_assign_cohort`) | ✅ confirmed | skips 0/many cohort matches | ✅-ish | M (surface it) |
| New nudge programs | loop activity-parameterized | copy/cadence coupling | ❌ until §5.2 | S–M each |
| Latent flags (mandi/personalization/voice) | declared, inert | wizard doesn't even send them | ❌ | varies |

## 7. Layered productization (from the AIdeas roadmap) → commercial model

| Layer | Now | Next | Commercial model |
|---|---|---|---|
| Core accountability engine | trigger→confirm→follow-up loop | packaged "loop" w/ drop-in triggers/copy | per-seat / per-beneficiary |
| Triggers & intelligence | weather spray rules | + mandi/price, crop-stage, risk, personalization | per-signal / per-region add-ons |
| Knowledge base | FAO + ICAR + NFSM | partner/state corpus, co-branded | partner content |
| Channels & integrations | WhatsApp | + voice, IVR, SMS, state apps | white-label for NGOs/KVKs |
| Analytics & outcomes | CloudWatch + metrics | cohort analytics + outcome dashboards | per-partner dashboards |

**GTM (B2B2G2C / B2B2C):** Govt/extension (B2G pilots w/ auditability) · MFIs/NBFCs, agri-input,
contract farming (co-branded loop). Ecosystems: KVKs (ICAR), MFIs (RBI), mandi (eNAM/Agmarknet).

## 8. Phased build plan (contract-first, safe-sequenced)

- **Phase 0 — Immediate honesty (done in this pass):** remove the false "read by WeatherPoller" wizard
  copy + DynamoDB jargon. ✅
- **Phase 1 — Make it actually control (contract-first).** Strict order to protect the live engine:
  1. Engine accepts an optional `rules` block, **defaulting to current constants**; SAM deploy to **dev**.
  2. Platform sends the versioned payload (§5.1) **in dev**; keep one `default-spray` program.
  3. Smoke the full loop in dev: weather→nudge→reminder→detector→summary.
  4. Promote engine to prod; then the platform; **then** update wizard copy to truthfully say rules are honored.
  5. In parallel (platform-only, no engine risk): **onboarding UI** (enroll-by-number/CSV + self-join QR) + farmer **names**.
- **Phase 2 — Turn on modalities (gated, attributed).** Build the **feature-gate resolver** (§5.3);
  then per-cohort voice, photo-diagnosis (+ persist structured fields), and Q&A — with message
  **attribution enrichment** (§5.4) so analytics are honest.
- **Phase 3 — Close the loop with action.** "Needs attention" detection → channel-aware act verbs
  (re-nudge, escalate text→voice, photo-ask), idempotent + tenant-scoped (§5.5).
- **Phase 4 — New programs & surfaces.** First-class `Program` entities + migration (§5.2);
  advisory-program selector; embeddable web-chat widget (needs tenancy); feature-flag→Stripe add-ons.
- **Phase 5 — New content/signals.** mandi prices (eNAM/Agmarknet), govt schemes; KB multi-tenancy.

**Migration:** existing cohorts get `programId=default-spray`; existing summaries stay cohort-level;
program-level summaries begin only after the Phase-4 model change.

## 9. Domain-agnosticism (pattern generalizes; engine is currently agri-coupled)

The accountability **pattern** is domain-neutral, but the engine code is **deeply agricultural** today:
profile carries district/crop, onboarding validates districts/crops, the RAG prompt is farming-only,
and the trigger/copy are spray-specific. A non-agri vertical (health, finance) is a **decoupling
project** (generic profile, swappable trigger/KB/copy), not a config swap. Keep program definitions
data-driven so that decoupling is *possible* later — but the spec claims "generalizable," not "already generic."

## 10. Resolved decisions

1. **Program model:** first-class child long-term; **Phase 1 = single `default-spray` program** with an
   optional `programId` contract field for forward-compat. (Was open #1; resolved per review §11.4.)
2. **Escalation v1:** text→voice + photo-ask (live capabilities, behind the gate resolver);
   human-escalation stubbed. (Was open #4.)
3. **Onboarding demo:** show **both** self-join QR and CSV enroll. (Was open #2.)
4. **Mandi source:** eNAM vs Agmarknet — deferred to Phase 5. (Was open #3.)

## 11. What the independent review changed (provenance)

An independent code review (Cursor, reading both repos) verified the capability claims and stress-tested
the design. Outcome: **2 confirmed, 1 wrong (the wizard claim — fixed), 6 partially-true** (live-in-code
but gated / agri-coupled / not cohort-attributable). It surfaced, and this v2 adopts: the versioned SFN
contract with engine-defaults-first (§5.1); modality enablement as policy resolution (§5.3); KB tenancy
+ Q&A attribution (§5.4); act-endpoint idempotency + authz (§5.5); contract-first Phase 1 sequencing
(§8); deferring first-class Programs + per-cohort toggles; the migration plan; and softened
domain-agnosticism (§9). Separately, the web-chat `POST /chat` endpoint was confirmed **live at runtime**
this session (grounded RAG answer + FAO/ICAR citations).
