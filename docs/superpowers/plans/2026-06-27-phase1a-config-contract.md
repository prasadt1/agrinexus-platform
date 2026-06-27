# Phase 1A — Make Config Real (versioned engine↔platform contract) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a cohort's stored `nudgeRules` actually change engine behavior — so the control plane genuinely controls the engine — without regressing the live spray loop.

**Architecture:** Introduce a versioned Step Functions input (`schemaVersion`, ids, `rules`). The platform's cohort-aware poller applies each cohort's `sprayConditions` to the favorable decision and carries `rules` in the payload; the engine's `NudgeSender` reads `rules` for reminder/expiry cadence and **defaults to today's constants when absent**, so old invocations stay safe. Ship engine-first to dev, smoke the whole loop, then promote.

**Tech Stack:** Engine = Python 3 / AWS SAM / pytest. Platform = Next.js (TypeScript) / Vitest. DynamoDB single-table. AWS Step Functions.

**Spec:** `docs/10-outturn-product-design.md` (v2) §5.1, §8 Phase 1.

---

## Scope & explicit non-goals (read first)

**In scope (Phase 1A):**
- Versioned SFN input contract with backward-compatible engine defaults.
- Per-cohort **reminder/expiry cadence** honored by the engine (`NudgeSender`).
- Per-cohort **spray thresholds** honored by the **platform** poller's favorable gate.

**Explicitly NOT in scope (honest boundaries — documented, deferred):**
- The engine's **scheduled** `WeatherPoller` (`agrinexus-ai/src/weather/handler.py`) is **location-based and cohort-unaware**; it will keep using location-level defaults. Per-cohort thresholds take effect only on the **cohort-aware platform poller** path (`/api/demo/trigger-poller`). Making the scheduled poller cohort-aware is a later phase.
- The engine delivers nudges **by LOCATION** (`NudgeSender` queries `GSI1 LOCATION#`), not by cohort membership. When two cohorts share a district, cadence from the firing cohort's payload applies to all that district's farmers. Per-cohort delivery isolation is a later phase.
- First-class `Program` entities, per-cohort modality toggles — later phases (spec §8).

## File structure

| File | Repo | Responsibility | Action |
|---|---|---|---|
| `src/nudge/cadence.py` | engine | Pure helper: resolve `(reminder_intervals, expiry_hours)` from an optional `rules` dict | **Create** |
| `tests/nudge/test_cadence.py` | engine | Unit tests for `resolve_cadence` | **Create** |
| `src/nudge/sender.py` | engine | Use `resolve_cadence` for the reminder/expiry schedule | **Modify** (195-197, 308-314) |
| `lib/entities/types.ts` | platform | Add `nudgeRules` to `ActiveCohortProjection` | **Modify** |
| `lib/entities/cohort.ts` | platform | Add `nudgeRules` to `listActiveCohorts` projection | **Modify** (254) |
| `lib/nudge-policy.ts` | platform | Pure helpers: `isFavorable(weather, sprayConditions)` + `buildNudgePayload(cohort, weather)` | **Create** |
| `lib/nudge-policy.test.ts` | platform | Vitest for the two helpers | **Create** |
| `app/api/demo/trigger-poller/route.ts` | platform | Use the helpers; send the versioned payload | **Modify** |
| `app/dashboard/cohorts/new/page.tsx` | platform | Truthful wizard copy (post-promotion only) | **Modify** (Task 6) |

---

### Task 1: Engine — `resolve_cadence` pure helper (TDD)

**Files:**
- Create: `agrinexus-ai/src/nudge/cadence.py`
- Test: `agrinexus-ai/tests/nudge/test_cadence.py`

Contract: `rules.reminderIntervals` = ordered reminder hours; `rules.expiryHours` = expiry hour. Defaults preserve today's behavior (`reminders [24,48]`, `expiry 72`). The platform maps stored `nudgeRules.reminderIntervals=[24,48,72]` → reminders `[24,48]`, expiry `72` (Task 4).

- [ ] **Step 1: Write the failing test**

```python
# agrinexus-ai/tests/nudge/test_cadence.py
from src.nudge.cadence import resolve_cadence

def test_defaults_when_rules_absent():
    assert resolve_cadence(None) == ([24, 48], 72)
    assert resolve_cadence({}) == ([24, 48], 72)

def test_reads_rules_when_present():
    rules = {"reminderIntervals": [12, 36], "expiryHours": 60}
    assert resolve_cadence(rules) == ([12, 36], 60)

def test_partial_rules_fall_back_per_field():
    assert resolve_cadence({"reminderIntervals": [6]}) == ([6], 72)
    assert resolve_cadence({"expiryHours": 96}) == ([24, 48], 96)

def test_empty_intervals_falls_back_to_default():
    assert resolve_cadence({"reminderIntervals": []}) == ([24, 48], 72)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd agrinexus-ai && python -m pytest tests/nudge/test_cadence.py -v`
Expected: FAIL — `ModuleNotFoundError: src.nudge.cadence`.

- [ ] **Step 3: Write minimal implementation**

```python
# agrinexus-ai/src/nudge/cadence.py
"""Resolve reminder/expiry cadence from an optional per-cohort rules dict.
Defaults preserve the engine's historical behavior so a payload without
`rules` behaves exactly as before (backward-compatible contract)."""
from typing import Optional, Dict, Any, List, Tuple

DEFAULT_REMINDERS: List[int] = [24, 48]
DEFAULT_EXPIRY_HOURS: int = 72

def resolve_cadence(rules: Optional[Dict[str, Any]]) -> Tuple[List[int], int]:
    rules = rules or {}
    reminders = rules.get("reminderIntervals")
    if not isinstance(reminders, list) or len(reminders) == 0:
        reminders = DEFAULT_REMINDERS
    expiry = rules.get("expiryHours")
    if isinstance(expiry, bool) or not isinstance(expiry, (int, float)):
        expiry = DEFAULT_EXPIRY_HOURS
    return reminders, int(expiry)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd agrinexus-ai && python -m pytest tests/nudge/test_cadence.py -v`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/nudge/cadence.py tests/nudge/test_cadence.py
git commit -m "feat(nudge): resolve_cadence helper — optional per-cohort cadence with safe defaults"
```

---

### Task 2: Engine — wire `resolve_cadence` into `NudgeSender` (no behavior change when `rules` absent)

**Files:**
- Modify: `agrinexus-ai/src/nudge/sender.py` (read `rules` at ~195-197; replace hardcoded schedule at ~308-314)

- [ ] **Step 1: Read `rules` from the event**

⚠️ **Import correctly or you crash the live Lambda.** At runtime `sender.py` is loaded as a **top-level module** (`template.yaml`: `CodeUri: src/nudge/`, `Handler: sender.lambda_handler`); there is **no parent package** and no `src/nudge/__init__.py`. A relative import (`from .cadence import ...`) raises `ImportError: attempted relative import with no known parent package` on the first invocation and **takes down the live nudge sender** — while the pytest import (`from src.nudge.cadence`) stays green, hiding the break. Use the **flat, sys.path-based** pattern the existing siblings use (`from nudge_copy import ...`, `sender.py:18-19`). `cadence.py` has no sibling imports, so it resolves both as flat `cadence` (Lambda) and `src.nudge.cadence` (pytest).

Add a top-of-file import alongside the existing `from <module> import` lines (after `sys.path.insert(0, _nudge_dir)`):

```python
from cadence import resolve_cadence
```

Then in `lambda_handler`, after `activity = event.get('activity', 'spray')` (line ~197):

```python
    reminder_intervals, expiry_hours = resolve_cadence(event.get('rules'))
```

- [ ] **Step 2: Replace the hardcoded schedule**

Replace the production-user branch (lines ~306-314):

```python
        else:
            # Production users get full closed-loop follow-ups.
            # Cadence comes from the cohort's rules (or safe defaults).
            for hours in reminder_intervals:
                create_reminder_schedule(phone_number, nudge_id, hours, dialect)
            create_expiry_schedule(phone_number, nudge_id, expiry_hours)
```

- [ ] **Step 3: Add a SENDER-LEVEL regression test (not just the pure helper)**

Mirror the fixture style in `tests/test_nudge_flow.py` (which monkeypatches `sender.table`). This proves `lambda_handler` itself still produces the legacy schedule with no `rules`, and the overridden schedule with `rules`:

```python
# agrinexus-ai/tests/nudge/test_sender_cadence_wiring.py
import src.nudge.sender as sender  # match the import used by tests/test_nudge_flow.py

def _wire_one_qualifying_farmer(monkeypatch, calls):
    """One allowlisted, consented, non-demo (paid) farmer in 'Latur'; capture cadence calls."""
    farmer = {"phone_number": "+910000000001", "dialect": "hi"}
    profile = {"onboarding_complete": True, "consent": "granted", "crop": "Cotton",
               "location": "Latur", "demo_tier": "paid"}
    class FakeTable:
        def query(self, **k): return {"Items": [farmer]}
        def get_item(self, **k): return {"Item": profile}
        def put_item(self, **k): pass
    monkeypatch.setattr(sender, "table", FakeTable())
    monkeypatch.setattr(sender, "is_approved_user", lambda *a, **k: True)
    monkeypatch.setattr(sender, "has_open_nudge", lambda *a, **k: False)
    monkeypatch.setattr(sender, "build_nudge_message", lambda *a, **k: "msg")
    monkeypatch.setattr(sender, "send_whatsapp_buttons", lambda *a, **k: True)
    monkeypatch.setattr(sender, "emit_metric", lambda *a, **k: None)
    monkeypatch.setattr(sender, "create_reminder_schedule",
                        lambda phone, nid, hours, dialect: calls["reminders"].append(hours))
    monkeypatch.setattr(sender, "create_expiry_schedule",
                        lambda phone, nid, hours: calls.__setitem__("expiry", hours))

def test_no_rules_yields_legacy_schedule(monkeypatch):
    calls = {"reminders": []}
    _wire_one_qualifying_farmer(monkeypatch, calls)
    sender.lambda_handler({"location": "Latur", "weather": {"wind_speed": 8.5, "rain": 0}, "activity": "spray"}, None)
    assert calls["reminders"] == [24, 48]
    assert calls["expiry"] == 72

def test_rules_override_schedule(monkeypatch):
    calls = {"reminders": []}
    _wire_one_qualifying_farmer(monkeypatch, calls)
    sender.lambda_handler({"location": "Latur", "weather": {"wind_speed": 8.5, "rain": 0},
                           "activity": "spray", "rules": {"reminderIntervals": [12], "expiryHours": 48}}, None)
    assert calls["reminders"] == [12]
    assert calls["expiry"] == 48
```

Note: confirm the exact symbol names to monkeypatch by checking `sender.py`'s imports and the import line `tests/test_nudge_flow.py` uses.

Run: `cd agrinexus-ai && python -m pytest tests/nudge/ -v` → Expected: PASS.

- [ ] **Step 4: Verify the broader suite still green**

Run: `cd agrinexus-ai && python -m pytest tests/nudge/ tests/ -q` (or the repo's standard test command — check `agrinexus-ai/README.md` / CI).
Expected: no new failures. If the existing sender tests import-mock DynamoDB/WhatsApp, do not change them.

- [ ] **Step 5: Commit**

```bash
git add src/nudge/sender.py tests/nudge/test_sender_cadence_wiring.py
git commit -m "feat(nudge): NudgeSender honors optional rules cadence (defaults preserved)"
```

---

### Task 3: Engine — deploy to **dev** and smoke (gate before any platform change)

**Files:** none (deploy)

- [ ] **Step 1: Build + deploy to dev**

Run (confirm the dev stack/profile from `agrinexus-ai/template.yaml` + README; do NOT deploy to prod yet):
```bash
cd agrinexus-ai && sam build && sam deploy --config-env dev --no-confirm-changeset
```
Expected: CHANGESET applied; `NudgeSender` updated.

- [ ] **Step 2: Seed ONE observable test farmer (so cadence is provable)**

The sender only schedules reminders for a farmer who is allowlisted (`is_approved_user`), `onboarding_complete`, `consent` granted, has no open nudge, and is **not** `demo_tier=='public'` (demo users get NO reminders). An empty/absent location matches zero farmers — proving nothing. So seed exactly one qualifying farmer in a dedicated dev location whose phone is a **test WhatsApp number you control**: write `USER#<testphone>/PROFILE` (`onboarding_complete:true, consent:'granted', demo_tier:'paid', location:'<DevDistrict>', crop:'Cotton', dialect:'hi'`), the allowlist row, and `GSI1PK=LOCATION#<DevDistrict>`. (Mirror `scripts/` seed shape.)

- [ ] **Step 3: Direct-invoke with NO rules → legacy schedule (assert on logs)**

```bash
aws lambda invoke --function-name <dev-NudgeSender> \
  --payload '{"location":"<DevDistrict>","weather":{"wind_speed":8.5,"rain":0},"activity":"spray"}' \
  --cli-binary-format raw-in-base64-out /tmp/out.json && cat /tmp/out.json
```
Expected: `nudges_sent: 1`. Then grep the function's CloudWatch logs for the lines printed by `create_reminder_schedule`/`create_expiry_schedule` and assert reminders at **24** & **48** and expiry at **72** (or list the created EventBridge schedules: names contain `24h`/`48h`/expiry).

- [ ] **Step 4: Direct-invoke WITH rules → overridden schedule**

```bash
aws lambda invoke --function-name <dev-NudgeSender> \
  --payload '{"location":"<DevDistrict>","weather":{"wind_speed":8.5,"rain":0},"activity":"spray","rules":{"reminderIntervals":[12],"expiryHours":48}}' \
  --cli-binary-format raw-in-base64-out /tmp/out.json && cat /tmp/out.json
```
Expected: a single reminder at **12h** and expiry at **48h**. (Re-invoking is gated by `has_open_nudge` — clear the prior open `NUDGE#` row or use a second test phone between invokes.) **Gate:** do not proceed until both invokes show the expected schedules.

---

### Task 4: Platform — favorable-by-rules + versioned payload (TDD)

**Files:**
- Modify: `agrinexus-platform/lib/entities/types.ts` (add `nudgeRules?` to `ActiveCohortProjection`)
- Modify: `agrinexus-platform/lib/entities/cohort.ts:254` (projection)
- Create: `agrinexus-platform/lib/nudge-policy.ts`
- Create: `agrinexus-platform/lib/nudge-policy.test.ts`
- Modify: `agrinexus-platform/app/api/demo/trigger-poller/route.ts`

- [ ] **Step 1: Add `nudgeRules` to the projection type + query**

`types.ts`: add `nudgeRules?: NudgeRules;` to `ActiveCohortProjection`.
`cohort.ts:254`: change `ProjectionExpression` to include `nudgeRules`:
```
'tenantId, cohortId, district, lat, lon, crops, nudgeRules, GSI2PK, GSI2SK'
```

- [ ] **Step 2: Write failing tests for the pure helpers**

```ts
// agrinexus-platform/lib/nudge-policy.test.ts
import { describe, it, expect } from "vitest";
import { isFavorable, buildNudgePayload } from "./nudge-policy";

const weather = { wind_speed: 12, rain: 0, temperature: 28, humidity: 70 };

describe("isFavorable", () => {
  it("defaults to wind<10 && rain==0 when no sprayConditions", () => {
    expect(isFavorable(weather, undefined)).toBe(false);          // 12 !< 10
    expect(isFavorable({ ...weather, wind_speed: 8 }, undefined)).toBe(true);
  });
  it("honors per-cohort maxWindSpeed", () => {
    expect(isFavorable(weather, { maxWindSpeed: 15, maxHumidity: 85, minTemp: 15, maxTemp: 35 })).toBe(true);
    expect(isFavorable(weather, { maxWindSpeed: 10, maxHumidity: 85, minTemp: 15, maxTemp: 35 })).toBe(false);
  });
  it("rejects when humidity/temp out of band or rain present", () => {
    const c = { maxWindSpeed: 15, maxHumidity: 60, minTemp: 15, maxTemp: 35 };
    expect(isFavorable(weather, c)).toBe(false);                  // humidity 70 > 60
    expect(isFavorable({ ...weather, rain: 1 }, { ...c, maxHumidity: 85 })).toBe(false);
  });
});

describe("buildNudgePayload", () => {
  const cohort = {
    tenantId: "demo-tenant-001", cohortId: "01ABC", district: "Latur",
    nudgeRules: { sprayConditions: { maxWindSpeed: 15, maxHumidity: 85, minTemp: 15, maxTemp: 35 }, reminderIntervals: [24, 48, 72] },
  } as any;
  it("emits a versioned payload, mapping reminderIntervals→reminders+expiry", () => {
    const p = buildNudgePayload(cohort, weather);
    expect(p.schemaVersion).toBe(1);
    expect(p.tenantId).toBe("demo-tenant-001");
    expect(p.cohortId).toBe("01ABC");
    expect(p.programId).toBe("default-spray");
    expect(p.activity).toBe("spray");
    expect(p.location).toBe("Latur");
    expect(p.rules.reminderIntervals).toEqual([24, 48]);
    expect(p.rules.expiryHours).toBe(72);
  });
  it("falls back to default cadence when cohort has no reminderIntervals", () => {
    const p = buildNudgePayload({ ...cohort, nudgeRules: {} }, weather);
    expect(p.rules.reminderIntervals).toEqual([24, 48]);
    expect(p.rules.expiryHours).toBe(72);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd agrinexus-platform && npx vitest run lib/nudge-policy.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the helpers**

```ts
// agrinexus-platform/lib/nudge-policy.ts
import type { NudgeRules } from "@/lib/entities/types";

type Weather = { wind_speed: number; rain: number; temperature?: number; humidity?: number };
type SprayConditions = NonNullable<NudgeRules["sprayConditions"]>;

/** Per-cohort favorable gate. Falls back to the engine's legacy rule when no conditions set. */
export function isFavorable(w: Weather, c?: SprayConditions): boolean {
  if (!c) return w.wind_speed < 10 && w.rain === 0;
  if (w.rain > 0) return false;
  if (w.wind_speed > c.maxWindSpeed) return false;
  if (w.humidity !== undefined && w.humidity > c.maxHumidity) return false;
  if (w.temperature !== undefined && (w.temperature < c.minTemp || w.temperature > c.maxTemp)) return false;
  return true;
}

const DEFAULT_REMINDERS = [24, 48];
const DEFAULT_EXPIRY = 72;

/** Map stored nudgeRules.reminderIntervals ([r1,r2,expiry]) → reminders + expiry. */
function splitCadence(intervals?: number[]): { reminderIntervals: number[]; expiryHours: number } {
  if (!intervals || intervals.length === 0) return { reminderIntervals: DEFAULT_REMINDERS, expiryHours: DEFAULT_EXPIRY };
  if (intervals.length === 1) return { reminderIntervals: intervals, expiryHours: DEFAULT_EXPIRY }; // one reminder, default expiry
  return { reminderIntervals: intervals.slice(0, -1), expiryHours: intervals[intervals.length - 1] };
}

export function buildNudgePayload(cohort: any, weather: Weather) {
  const rules = cohort.nudgeRules ?? {};
  const cadence = splitCadence(rules.reminderIntervals);
  return {
    schemaVersion: 1 as const,
    tenantId: cohort.tenantId,
    cohortId: cohort.cohortId,
    programId: "default-spray" as const,
    location: cohort.district,
    activity: "spray" as const,
    weather,
    rules: { sprayConditions: rules.sprayConditions, ...cadence },
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd agrinexus-platform && npx vitest run lib/nudge-policy.test.ts`
Expected: PASS.

- [ ] **Step 6: Wire helpers into the trigger-poller**

In `app/api/demo/trigger-poller/route.ts`: replace the inline `favorable` computation in `fetchWeather` usage with `isFavorable(weather, cohort.nudgeRules?.sprayConditions)`, and replace the `StartExecutionCommand` input (`{ location, weather, activity:'spray' }`) with `JSON.stringify(buildNudgePayload(cohort, weather))`. Keep the existing demo-tenant guard and per-cohort loop.

- [ ] **Step 7: Typecheck + build**

Run: `cd agrinexus-platform && npx tsc --noEmit && npm run build`
Expected: exit 0; route still present.

- [ ] **Step 8: Commit**

```bash
git add lib/entities/types.ts lib/entities/cohort.ts lib/nudge-policy.ts lib/nudge-policy.test.ts app/api/demo/trigger-poller/route.ts
git commit -m "feat(control): per-cohort favorable gate + versioned nudge payload (rules now reach the engine)"
```

---

### Task 5: Dev end-to-end smoke (the whole loop)

**Files:** none (verification). Engine is on dev (Task 3); deploy the platform branch to a **preview** or run locally against the **dev** table.

- [ ] **Step 1:** Create a cohort with non-default rules (e.g. `maxWindSpeed: 20`, `reminderIntervals: [12, 36, 60]`) via the wizard/API against the dev table; activate it; enroll a dev/test phone (consented).
- [ ] **Step 2:** Trigger `POST /api/demo/trigger-poller` (demo tenant). Confirm the SFN execution input contains `schemaVersion`, `cohortId`, and `rules`.
- [ ] **Step 3:** In CloudWatch for the dev `NudgeSender`, confirm reminders scheduled at **12 & 36** and expiry at **60** (not 24/48/72) — proving the cohort's rules flowed end-to-end.
- [ ] **Step 4:** Confirm a cohort with strict `maxWindSpeed` below the current wind does **not** fire (favorable gate honored platform-side).
- [ ] **Gate:** all four pass before promotion.

---

### Task 6: Promote to prod + truthful wizard copy

- [ ] **Step 1:** Promote the engine to prod: `cd agrinexus-ai && sam deploy --config-env prod ...` (confirm the prod config). The change is backward-compatible (defaults), so the scheduled location-based WeatherPoller is unaffected.
- [ ] **Step 2:** Deploy the platform to production (`vercel deploy --prod`) and re-point the canonical alias (`vercel alias set <url> outturn.vercel.app` — known gotcha).
- [ ] **Step 3:** Now that rules are honored on the cohort-aware path, make the wizard copy fully truthful. In `app/dashboard/cohorts/new/page.tsx` Step 2, replace the current helper line (exact anchor): `"The safe-spray window for this cohort — the weather conditions under which farmers are nudged to spray."` with: `"These limits decide when this cohort's farmers are nudged to spray, and how reminders are paced."` Commit + redeploy.
- [ ] **Step 4:** Verify prod: trigger a demo cycle, confirm rules in the SFN input and the cadence in CloudWatch, and that `outturn.vercel.app/api/healthcheck` is still healthy.

---

## Verification & rollback

- **Backward-compat invariant:** a payload without `rules` MUST produce the legacy 24/48/72 schedule. Proven by Task 1 unit tests + Task 2's **sender-level** regression test + Task 3's integration smoke. This is what makes the engine deploy safe ahead of the platform.
- **Rollback:** the engine change is purely additive; reverting `sender.py` + redeploying restores prior behavior. The platform change is revertible by redeploying the prior build. No data migration is performed in Phase 1A.
- **Out-of-scope reminders (do not silently expand):** scheduled-poller cohort-awareness and per-cohort delivery isolation remain deferred (see Scope). If touched, that's a new plan.
