# H0 Demo Script (< 3 min video)

> **Product / spoken name: Outturn** (built on AgriNexus, our AWS-AIdeas-winning advisory engine).
> Say "Outturn" on camera; mention AgriNexus AI once as the delivery engine underneath.

## Structure (2:45 target)

### 0:00–0:25 Problem + audience

- Agricultural partners (NGOs, agri-input firms, KVK extension programs) fund farmer advisory but cannot prove follow-through.
- AgriNexus AI already delivers WhatsApp advisories (Innovation Award). **New for H0: Outturn**, the B2B accountability control plane.

### 0:25–0:45 Landing + "How it works"

- Show the generic landing page; play the **How it works** explainer (weather → WhatsApp reminder → farmer reply → village roll-up → dashboard).
- Hit **Show the tech** to reveal the AWS layer on the same steps.
- Mention `/judges` holds the full demo path + stack for reviewers.
- One-click **Demo Admin — GreenHarvest NGO** login.

### 0:45–1:30 Advisory loop (money shot)

- Overview → **Advisory Loop** hero.
- Explain: provision → activate → GSI2 → weather poll → nudges → Streams → dashboard.
- Click **Run advisory cycle** — show per-cohort weather + nudge fired.
- Point to **DynamoDB Streams** badge on summary cards.
- **Drop one "why" line here** (full set in `h0-why-architecture.md`): "Outcomes roll up through
  Streams into pre-computed summaries, so the dashboard reads one item per cohort instead of
  scanning events." The *why* is the technical score, not the click-through.

### 1:30–2:00 Multi-tenant isolation

- Tenant switcher: GreenHarvest → AgriInput Corp.
- Cohorts list changes — Partner A cannot see Partner B's data.

### 2:00–2:30 Provisioning + billing

- Admin: **New Cohort** wizard (district, nudge rules, plan).
- Activate (demo or Stripe tier).
- Billing page shows LICENSE# records.

### 2:30–2:45 DynamoDB + stack (ELIGIBILITY-CRITICAL — do not skip or rush)

> ⚠️ **This is the AWS-pillar proof and it is binary pass/fail.** Our table connects via the AWS
> SDK with a scoped IAM key (not the Vercel-provisioned integration), so **`agrinexus-data` will
> NOT appear under Vercel → Storage** — the judges' default verification path. The FAQ sanctions
> the explicit escape hatch: *"walk through the connection explicitly in your demo video."* So we
> must SHOW the connection, end to end, on screen.

Walk it in this exact order (~15s):

1. **Vercel side** — show the deployed app on its `*.vercel.app` URL reading **live** data, then
   show the Vercel project **env vars** `DYNAMODB_TABLE_NAME=agrinexus-data` + `AWS_REGION`.
2. **AWS side** — click into the **AWS console → DynamoDB → `agrinexus-data`**: show real items
   (`TENANT#`, `COHORT#`, `SUMMARY#`) and **Streams enabled**.
3. **Narrate the link**: "The Vercel app you just saw connects to this DynamoDB table in my AWS
   account — same table that feeds the award-winning delivery engine."

- Close: "Outturn — proof of what your advisory program produced. Built on Vercel + Amazon DynamoDB for H0."

## Judge access

- URL: production Vercel link → **/judges** for the guided demo path + stack overview
- Login: any demo persona on `/login`
- No payment required: use **Demo activate**

## English subtitles

Add captions in YouTube editor. No copyrighted music.
