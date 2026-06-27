# Outturn — Gemini / ChatGPT diagram prompts (H0 article gallery)

**Use for:** Devpost gallery, article embeds, video B-roll overlays.
**Skip Mermaid for these** — the Kroki-rendered Mermaid in `architecture/diagrams/exports/` stays in
the README/repo. The article gallery uses the polished split-panels below (real UI screenshot on the
left + architecture flow on the right), the same approach Iris used.

## Workflow (every diagram)
1. **Capture the matching Outturn screenshot** from the live app (see checklist) at a wide aspect.
2. **Attach it** to Gemini (Images) or ChatGPT (GPT-4o image), then paste the prompt + the STYLE PREFIX.
3. Generate **16:9 landscape** (1920×1080 mindset).
4. If the model blurs UI text → keep the AI **right panel** and composite your **real screenshot** on
   the left in Figma/Preview (30 sec). Most honest result.
5. **Verify labels** against the fact checklist before upload.

---

## STYLE PREFIX (prepend to every prompt)

```text
VISUAL STYLE (mandatory):
- Clean light editorial background #F7F8FA (or white). Not dark, not cartoon, not 3D isometric clipart.
- Primary green accents and arrows #157347; deep green #0F5132; tint fills #E6F4EC.
- Amazon DynamoDB shown as a labeled cylinder "Amazon DynamoDB · agrinexus-data" (AWS-blue/navy accent OK).
- Vercel nodes in black/white. WhatsApp node in #25D366 only for the WhatsApp box.
- Cream/dark label text, Inter or clean sans-serif, large and readable.
- Editorial hackathon systems diagram. NO purple AI gradients, NO robots, NO "AI-powered" badges,
  NO invented product names, NO Agent/LLM clipart.
- Landscape 16:9, high resolution, crisp text. Title bar at top.

ACCURACY RULE: Use ONLY these real services/keys. Do NOT add Redis, Kafka, Postgres, Aurora, Pinecone:
- Amazon DynamoDB single table "agrinexus-data" (PK/SK design; GSI1 = COHORT# (members) / LOCATION# (recipients);
  GSI2 = STATUS#active (the poller); DynamoDB Streams, NEW_AND_OLD_IMAGES)
- OutcomesAggregator Lambda (Streams -> materialized SUMMARY# items)
- AgriNexus engine: Weather poller, Step Functions nudge workflow, NudgeSender Lambda, Response Detector Lambda
- WhatsApp Business API
- Outturn control plane: Next.js App Router on Vercel (server Route Handlers), Stripe Checkout, AWS Secrets Manager
Identity/attribution is ALWAYS the farmer's phone number.
```

---

## Diagram 01 — Hero: three planes, one table
**Save as:** `diagram-01-three-plane.png` · **Caption:** *One phone-keyed DynamoDB table spans the Outturn control plane and the AgriNexus delivery engine.*
```
[PASTE STYLE PREFIX]
Create a landscape architecture infographic titled "Outturn — three planes, one DynamoDB table".
Three horizontal layers connected by green arrows:
LAYER 1 — CONTROL PLANE · Outturn (Vercel): boxes "Login / personas", "Cohort wizard", "Dashboard",
  "Billing (Stripe)", "API routes (server)".
LAYER 2 — DATA PLANE: large green cylinder "Amazon DynamoDB · agrinexus-data" as the SPINE, with
  badges "GSI1 · cohort members", "GSI2 · active cohorts", "DynamoDB Streams".
LAYER 3 — DELIVERY PLANE · AgriNexus engine (AWS): "Weather poller" -> "Step Functions" -> "NudgeSender λ"
  -> "WhatsApp Business API" -> "Response Detector λ".
Floating node "OutcomesAggregator λ" with arrows: Streams -> aggregator -> "SUMMARY#" back into the table.
Footnote: "Identity is the phone number · Outturn (new H0 control plane) runs on AgriNexus (AWS AIdeas winner)".
```

## Diagram 02 — Overview dashboard → materialized outcomes
**Attach:** overview screenshot · **Save as:** `diagram-02-overview-summary.png` · **Caption:** *The dashboard reads one materialized SUMMARY# per cohort — not a scan.*
```
[PASTE STYLE PREFIX]
Split-panel titled "Overview — read materialized outcomes".
LEFT (~42%): match the attached Outturn overview screenshot (KPI cards, follow-through breakdown bar). Label "Dashboard · app/dashboard/page.tsx".
RIGHT (~58%), vertical flow with green arrows:
1. "React · GET /api/overview"
2. "Next.js Route Handler · Vercel (server)"
3. "Query DynamoDB · SUMMARY#<cohortId>#<period>"  (green cylinder)
4. side note: "materialized by OutcomesAggregator λ from DynamoDB Streams — dashboard reads 1 item per cohort"
BOTTOM strip (monospace): "// one read per cohort, no NUDGE# scan".
```

## Diagram 03 — Provision a cohort → drives the engine
**Attach:** wizard screenshot · **Save as:** `diagram-03-provision.png` · **Caption:** *Provisioning a cohort changes what the engine does — through GSI2.*
```
[PASTE STYLE PREFIX]
Split-panel titled "Provision — the control plane drives delivery".
LEFT: match the attached Cohort wizard screenshot (district, crops, languages, plan). Label "app/dashboard/cohorts/new".
RIGHT, flow:
1. "POST /api/cohorts"
2. "PutItem COHORT# · GSI2 = STATUS#active" (green cylinder)
3. "AgriNexus poller · Query GSI2 (active cohorts)"
4. "Step Functions -> NudgeSender λ -> WhatsApp Business API"
Callout: "No service-to-service API between repos — the shared table is the contract".
```

## Diagram 04 — The accountability loop (closed)
**Save as:** `diagram-04-loop.png` · **Caption:** *Nudge → reply → Streams → aggregator → dashboard. Attribution by phone.*
```
[PASTE STYLE PREFIX]
Horizontal 6-step storyboard titled "The accountability loop", green arrows, return arrow from 6 back to 1:
1 Provision (Outturn -> COHORT#) · 2 Activate (GSI2) · 3 Nudge (NudgeSender -> WhatsApp, NUDGE#=SENT)
4 Reply ("Done", NUDGE#=DONE) · 5 Attribute (Streams -> OutcomesAggregator -> GetItem PHONE#/MEMBERSHIP -> SUMMARY#)
6 See proof (Dashboard reads SUMMARY#). Caption under: "one identity — the phone — ties all three planes".
```

## Diagram 05 — Enrollment + consent (closing the loop)
**Attach:** members screenshot · **Save as:** `diagram-05-consent.png` · **Caption:** *Partner enrolls; the farmer opts in over WhatsApp; outcomes roll up by phone.*
```
[PASTE STYLE PREFIX]
Split-panel titled "Enrollment & consent".
LEFT: match the attached cohort members table (masked phones, response rates). Label "Cohort detail".
RIGHT, flow:
1. "Partner upload · bulkEnrollFarmers" -> writes "PHONE#/MEMBERSHIP" + "USER#/PROFILE (consent=pending)"
2. "Farmer texts 'Hi'" -> AgriNexus engine prompts consent
3. "'YES' -> consent=granted" -> now nudge-eligible
4. "Nudge -> reply -> Streams -> SUMMARY#"
Callout: "Only granted profiles are nudged (WhatsApp opt-in compliant)".
```

---

## Screenshot checklist (capture from `agrinexus-platform.vercel.app`)
- Overview dashboard (KPIs + follow-through breakdown)
- Cohort detail (members table)
- Provisioning wizard (one step)
- Advisory Loop hero with the "Run advisory cycle" button
- Billing page (demo vs Stripe licenses)
- **Proof screenshot:** AWS Console → DynamoDB → `agrinexus-data` (items + Streams enabled)

## Recommended Devpost gallery order
1 `diagram-01-three-plane` (overview) · 2 `diagram-04-loop` · 3 `diagram-02-overview-summary` (+ screenshot)
· 4 `diagram-03-provision` (+ screenshot) · 5 `diagram-05-consent` (+ screenshot). Upload screenshot then
its diagram as consecutive images so judges read pairs.

## Fact checklist (verify before publish)
- Single table `agrinexus-data`; GSI1 (COHORT# / LOCATION#); GSI2 (STATUS#active); Streams = NEW_AND_OLD_IMAGES.
- `OutcomesAggregator` Lambda (nodejs18.x) materializes `SUMMARY#`.
- Outturn = new H0 control plane; AgriNexus = pre-existing delivery engine (AWS AIdeas winner).
- **Do not claim:** all numbers live-aggregated (it's seed + one live cohort), exactly-once aggregation,
  or hard tenant isolation (demo switcher trusts a header; production uses Cognito).
