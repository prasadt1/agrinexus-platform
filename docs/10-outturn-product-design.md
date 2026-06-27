# Outturn — Product Design Spec

> The control plane for a multi-modal farmer **accountability engine**. This spec locks the product
> definition, maps it to the AgriNexus engine's real capabilities, and sequences the build.
> Source vision: the AgriNexus AIdeas-finalist *Productization Roadmap* (quoted in §7), grounded
> against a capability audit of `agrinexus-ai/src` (June 2026).

## 1. Thesis

**The accountability loop is the product. Triggers, copy, channel, and knowledge are pluggable.**

The engine's loop — **trigger → send → confirm → remind → detect → measure** — is domain-agnostic.
In code it is parameterized by an `activity` string ([nudge/sender.py:197](../../agrinexus-ai/src/nudge/sender.py)); only the *trigger* and *copy* are spray-specific ([weather/handler.py:189](../../agrinexus-ai/src/weather/handler.py)). Everything else — reminders, expiry, DONE/NOT-YET detection, outcome rollup — is reused unchanged for any program.

So the same loop runs: *spray window* (agri) · *irrigation reminder* · *mandi sell-window* · and beyond
agriculture, *medication adherence*, *micro-savings*, *vaccine schedules*. **Outturn is the control
plane that lets a partner configure, run, and prove these loops per cohort, across modalities.**

## 2. What Outturn is — and isn't

- **Is:** a configurable accountability control plane. A partner composes *advisory programs* per
  cohort, onboards farmers, and sees engagement + outcomes across every modality, with the ability
  to **act** when a cohort goes dark.
- **Isn't:** a follow-through dashboard for weather-spray nudges. (That's ~1/6th of the engine and is
  what exists today — see §6.)

## 3. Core abstractions

| Concept | Definition |
|---|---|
| **Cohort** | A partner's program audience — farmers grouped by district/crop. Already modeled. |
| **Program** (advisory type) | `{ trigger, copy/template, channel(s), KB binding }`. A cohort runs ≥1 programs. *New first-class concept.* |
| **Channel / modality** | text · **voice** · **photo-in (diagnosis)** · **web-chat** — all live in the engine. |
| **The loop** (engine) | `send → confirm(DONE/NOT-YET) → remind → detect → measure`. Activity-agnostic; reused per program. |
| **Act verb** | What a partner does to a stalled cohort: re-nudge · **escalate channel** (text→voice) · request a photo · human escalation. |

## 4. The control plane lifecycle (what we must complete)

| Stage | Today | Target |
|---|---|---|
| **Onboard** | API/seed only | Partner-enroll (number/CSV) **+** "share WhatsApp QR → farmer self-joins" (engine has self-onboarding + `auto_assign_cohort`) **+** farmer names |
| **Configure** | collected but **engine ignores it** (honesty bug, §6) | Cohort config (thresholds, cadence, program, channels, KB) is the **source of truth** that reaches the engine |
| **Advise** | weather→spray only | Multi-program × multi-channel, partner-selected |
| **Listen** | consent + DONE replies | Two-way RAG Q&A surfaced (volume, topics, KB-gap refusals) |
| **Detect** | passive % | "Needs attention" (underperforming / stalled / unanswered) |
| **Act** | nothing | Channel-aware act verbs incl. escalation |
| **Measure** | follow-through % only | Multi-modal: follow-through · Q&A topics · photo-diagnosis severity mix · voice engagement |

We built **Measure** (the byproduct) and left **Onboard / Configure / Advise / Act** thin. Those are the product.

## 5. How Outturn drives the engine (architecture)

**The central fix:** today the control plane *looks* like it controls the engine but mostly doesn't.
The only payload the engine receives is `{location, weather, activity:'spray'}`
([trigger-poller/route.ts:138](../app/api/demo/trigger-poller/route.ts)); per-cohort `nudgeRules` and
`features` are stored and **never read** ([weather/handler.py:142](../../agrinexus-ai/src/weather/handler.py), [sender.py:309](../../agrinexus-ai/src/nudge/sender.py)). The wizard even falsely claims thresholds are "read by WeatherPoller."

The architecture makes cohort config authoritative:
- **Config → engine:** the Step Functions input carries the cohort's `activity`, thresholds, and
  cadence; `WeatherPoller`/`NudgeSender` read them instead of hardcoded constants.
- **Modality toggles (per cohort → per farmer profile):**
  - **Voice:** the control plane writes `profile.voicePreference` (engine *reads* it but nothing
    *writes* it today — pure control-plane territory).
  - **Photo diagnosis:** flip the engine's allowlist/feature gate per cohort; persist the structured
    diagnosis (`crop/problem/severity`) as cohort analytics.
  - **Q&A / KB:** bind a cohort/partner to a `KNOWLEDGE_BASE_ID` + `GUARDRAIL_ID` for co-branded content.
- **Act layer:** a cohort-scoped trigger endpoint (reuses the existing Step Functions workflow,
  without the global weather gate) + escalation policy (NOT-YET/no-response → voice / photo-ask / human).

## 6. Capability ledger (engine reality vs Outturn exposure)

| Engine capability | Engine status | In Outturn | Effort to wire |
|---|---|---|---|
| Weather→spray→follow-through | ✅ live | ✅ (today's product) | — |
| **Per-cohort nudge rules** (thresholds, cadence) | ⚠️ collected, **ignored by engine** | decorative | **S–M** (make it real) |
| **Voice** (Transcribe in / Polly out, per dialect) | ✅ live; `voicePreference` read-never-written | ❌ | **S** |
| **Photo diagnosis** (Bedrock Claude-Vision, structured) | ✅ live (gated) | ❌ | M |
| **Two-way RAG Q&A** (FAO/ICAR KB, cited, cohort-tagged, persisted) | ✅ live | ❌ | M |
| **Public web-chat API** (`POST /chat`, stateless, multilingual) + demo UI | ✅ live | ❌ | M (embeddable widget) |
| **WhatsApp self-onboarding** (consent + `auto_assign_cohort`) | ✅ live | ❌ | M |
| New nudge programs (irrigation/sowing/fertilizer/scouting) | loop is activity-agnostic | ❌ | S each |
| Latent flags `mandiPrices`/`personalization`/`streamingVoice` | declared, inert | stored-only | varies |
| mandi prices / govt schemes content | not in KB | ❌ | L (data feeds: eNAM/Agmarknet) |

## 7. Layered productization (from the AIdeas roadmap) → build + commercial model

| Layer | Now | Next | Commercial model |
|---|---|---|---|
| Core accountability engine | trigger→confirm→follow-up loop | packaged "loop" w/ drop-in triggers/copy | per-seat / per-beneficiary |
| Triggers & intelligence | weather-gated spray rules | + mandi/price, crop-stage, risk scoring, personalization | per-signal / per-region add-ons |
| Knowledge base | FAO + ICAR + NFSM | state-/partner-specific corpus | partner content + co-branded |
| Channels & integrations | WhatsApp | + IVR, + voice, + SMS, + state apps | white-label for NGOs/KVKs |
| Analytics & outcomes | CloudWatch + metrics | cohort analytics + outcome dashboards | per-partner dashboards |

**Go-to-market (B2B2G2C / B2B2C):** Government/extension (B2G, district/block pilots with
auditability) · MFIs/NBFCs, agri-input suppliers, contract farming (B2B2C, co-branded loop). Example
ecosystems: KVKs (ICAR), MFIs/NBFCs (RBI), mandi signals (eNAM/Agmarknet). Outturn is the surface
that operationalizes + meters all of the above.

## 8. Phased build plan (leverage-ordered: expose-built-first)

- **Phase 1 — Make it actually control.** Wire `nudgeRules` into the Step Functions payload and have
  the engine read them (kills the honesty bug). Add the **onboarding** UI (enroll-by-number/CSV +
  self-join QR) and farmer **names**. *Mostly wiring + small build.*
- **Phase 2 — Turn on the modalities.** Per-cohort **voice** toggle (`voicePreference`), **photo
  diagnosis** feature + analytics, **Q&A** volume/topics/refusal surfaced. *Almost all expose.*
- **Phase 3 — Close the loop with action.** "Needs attention" detection → channel-aware **act**
  verbs (re-nudge, **escalate text→voice**, photo-ask, human). *New build on existing engine.*
- **Phase 4 — New programs & surfaces.** Advisory-program selector (irrigation/sowing/fertilizer),
  the **embeddable web-chat widget**, feature-flag → Stripe **add-on** pricing.
- **Phase 5 — New content/signals.** mandi prices (eNAM/Agmarknet), govt schemes — genuine new build.

Phases 1–2 are mostly *wiring capabilities that already exist* → high value, low effort.

## 9. Domain-agnosticism (build agri now, architect for the rest)

The `Program` abstraction (`{trigger, copy, channel, KB}`) is domain-neutral by design. We build the
agriculture programs now, but nothing in the loop is agri-specific — the same control plane runs a
medication-adherence or micro-savings loop by swapping trigger + copy + KB. Keep program definitions
data-driven (not hardcoded) so a non-agri vertical is a config + content exercise, not a re-build.

## 10. Open decisions

1. Programs as **separate cohorts** vs **multiple programs per cohort** (recommend: program is a
   first-class child of a cohort, so one farmer group can run spray + irrigation + Q&A together).
2. Whether **self-onboarding (QR)** or **partner-enroll (CSV)** leads the demo (recommend: show both;
   self-onboard is the "zero app install" wow, CSV is the B2B reality).
3. Mandi-price source priority (eNAM API vs Agmarknet scrape) — Phase 5, defer.
4. How far to take **escalation** in v1 (recommend: text→voice + photo-ask now; human-escalation hook later).
