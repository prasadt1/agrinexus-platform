# Close the loop — consent design (A1)

**Status:** Approved (consent model A; data model shaped so B drops in later)
**Date:** 2026-06-26 · **Repos:** `agrinexus-platform` (TS), `agrinexus-ai` (Python)

## Goal
Make the closed accountability loop work for *any* farmer, gated by WhatsApp consent, with the
**phone number as the join key** across the control plane (Outturn) and the delivery engine
(AgriNexus). Close both seams:
- Self-onboard writes `PROFILE`+consent but no `MEMBERSHIP` → **auto-assign** to a matching active cohort.
- Partner-enroll writes `MEMBERSHIP` but no `PROFILE`/consent → **dual-write a pending `PROFILE`**; consent is granted when the farmer opts in.

## Data model (B-ready)
Farmer `PROFILE` (`USER#<phone>` / `PROFILE`):
- `consent`: `pending | granted | declined` (replaces today's boolean).
- `consentSource`: `self | partner | template`.
- `consentAt`: ISO timestamp (set when granted).
- Unchanged: `dialect`, `location` (→ `GSI1PK=LOCATION#<district>`), `crop` (→ `GSI1SK=CROP#<crop>`), `onboarding_state` / `onboarding_complete`.

`MEMBERSHIP` (`PHONE#<phone>` / `MEMBERSHIP`): unchanged.

**Nudge gate:** the engine sends only when `consent == 'granted'`.

**B-readiness:** B (partner-initiated template opt-in) is just a new `consentSource='template'` trigger that flips the same `pending → granted` transition — no schema change, no migration.

**Backward-compat (no migration):** legacy profiles store boolean `consent`. On read, normalize `true → granted`, `false`/absent → `pending`. Both repos apply this shim.

## Path 1 — partner enrollment (platform, TS) — `lib/entities/membership.ts`
`enrollFarmer` / `bulkEnrollFarmers`:
1. Write the `MEMBERSHIP` (as today).
2. **Upsert a `PROFILE` if absent**, seeded from the cohort: `dialect` = cohort default language,
   `location` = cohort district (`GSI1PK=LOCATION#<district>`), `crop` = cohort primary crop
   (`GSI1SK=CROP#<crop>`), `consent='pending'`, `consentSource='partner'`,
   `onboarding_complete=false`, `onboarding_state='consent'`.
   - **Never overwrite an existing profile** (esp. a `granted` one): `ConditionExpression: attribute_not_exists(PK)`.
   - Requires cohort district / crops / language — pass them through (or look up the cohort).

## Path 2 — self-onboard + convergence (engine, Python) — `src/processor/handler.py`, `src/nudge/sender.py`
`handle_onboarding`:
- **Pre-seeded pending profile (partner path):** on first contact, if a `PROFILE` exists with
  `consent=pending`, **skip the questionnaire** (district/crop already known) and jump to the consent
  step: *"You're enrolled in <partner>'s <district> <crop> program — reply YES to start."* YES →
  `consent='granted'`, `consentAt=now`; ensure the `MEMBERSHIP` exists.
- **Full self-onboard complete (consent granted):** **auto-assign** to a matching active cohort —
  query active cohorts (`GSI2 STATUS#active`) filtered by district (+crop). Exactly one match →
  write `MEMBERSHIP`. Zero or multiple → skip (deterministic; partner upload covers those).

`sender.py` consent gate: change `consent == true` → `consent in ('granted', True)` (accept legacy).

## Cross-repo contract
The `consent` field is the contract (see ADR-0002). Platform writes `pending`; engine reads/writes
`pending|granted`; both normalize legacy boolean `true → granted`.

## Edge cases
- Duplicate enrollment → upsert-if-absent is idempotent.
- Multi-cohort district match on auto-assign → skip.
- Already-`granted` farmer later partner-enrolled → keep consent, just add the `MEMBERSHIP`.
- `declined` → never nudged.

## Testing
- **Platform (TS):** enrollment writes `MEMBERSHIP` + pending `PROFILE`; existing `granted` profile
  not clobbered; bulk path covers N phones.
- **Engine (pytest):** pending profile → consent step (not full questionnaire); YES flips to
  `granted` + ensures membership; full self-onboard auto-assigns a single match, skips on ambiguity;
  sender gate blocks `pending`, allows `granted` and legacy `true`.
- **Integration (the live demo path):** enroll phone → "Hi" → consent → nudge-eligible → "done" →
  `SUMMARY#` ticks.

## Compliance
Only `granted` profiles are ever nudged; partner-enrolled stay `pending` until the farmer opts in
over WhatsApp. Fully opt-in compliant.
