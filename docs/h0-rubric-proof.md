# H0 Rubric Proof — AgriNexus Platform

This is the working proof artifact for mapping **AgriNexus Platform** to the H0: Hack the
Zero Stack judging criteria, submission requirements, and FAQ clarifications. It is written so it
can support the Devpost description, demo narration, bonus article, and screenshot checklist.

Source inputs:

- Parent competition brief: `../H0: Hack the Zero Stack with Vercel v0 competition brief.md`
- Official judging criteria: Technological Implementation, Design, Impact & Real-world
  Applicability, Originality
- Build Session / FAQ clarifications: Vercel Storage proof, console-provisioned database escape
  hatch, bonus content, deadline, AI-written submission guidance
- Project docs: `README.md`, `docs/h0-architecture.md`, `docs/h0-demo-script.md`,
  `docs/h0-why-architecture.md`, `docs/h0-bonus-article.md`

## Executive Positioning

**Product / display name:** **Outturn by AgriNexus** (the H0 submission is branded "Outturn"; the
AgriNexus AI engine sits underneath). Internal identifiers — repo, DynamoDB table `agrinexus-data`,
API routes, env vars, entity keys — intentionally keep the `agrinexus` prefix.

**Submission track:** Track 2 — Monetizable B2B app.

**One-sentence claim:** AgriNexus Platform is the B2B control plane for agricultural advisory
programs: partners provision district farmer cohorts, activate paid advisory licenses, and monitor
closed-loop follow-through from WhatsApp nudges back into DynamoDB-backed dashboards.

**New vs existing boundary:** AgriNexus AI, the WhatsApp advisory delivery engine, existed before
H0 and won the AWS AIdeas Innovation Award. The H0 submission is the new Vercel-hosted B2B
platform layer: tenant-scoped dashboard, cohort provisioning, Stripe licensing, DynamoDB summaries,
and judge-ready product UX. This boundary must be stated in the video and Devpost description.

**Database choice:** Amazon DynamoDB is the primary backend. The deliberate "why" is the technical
score: phone-keyed, multi-tenant, high-write event workload; no serverless connection pool; GSIs
for active cohorts and membership; Streams for read-optimized rollups.

**Vercel claim:** The frontend and API routes are deployed on Vercel. The app connects from Vercel
server code to the existing `agrinexus-data` DynamoDB table through scoped AWS credentials in Vercel
environment variables. This table is not expected to appear in Vercel Storage — and that is fine:
the Official Rules (updated 6/10/26) explicitly accept an AWS Console screenshot of the database as
proof, and the rules prevail over the FAQ. The demo still walks the connection for clarity, not for
eligibility.

## Eligibility Gate

These are pass/fail items before any scoring starts.

| Gate | Official requirement / clarification | AgriNexus status | Evidence to show | Residual risk |
| --- | --- | --- | --- | --- |
| Track | Build one full-stack app in one track. Track 2 is B2B. | Green. AgriNexus sells advisory control-plane software to NGOs, agri-input firms, and extension programs. | Devpost track choice, README, `/judges` page, Stripe tiers. | Low. Avoid pitching it as B2C farmer app. Farmers are beneficiaries; partners are buyers. |
| Required AWS database | Must use Aurora PostgreSQL, Aurora DSQL, or DynamoDB as the primary backend. | Green. DynamoDB single table is the primary data plane. | AWS console showing `agrinexus-data`, entity keys, Streams, API reads/writes. | Low if explicit proof is captured. |
| Vercel deployment | Front end must deploy on Vercel or v0.app. | Green. Production app is `https://agrinexus-platform.vercel.app`. | Live Vercel URL in Devpost; Vercel Team ID; browser URL in video. | Low. Ensure the app remains available through judging. |
| AWS DB proof screenshot | **Settled, not a risk.** Official Rules (updated 6/10/26) explicitly accept an AWS Console screenshot of the DynamoDB resource; the Vercel integration is **not** required. Rules prevail over the FAQ. | Green. Provide an AWS Console screenshot of `agrinexus-data` (+ Streams). Vercel Storage is not expected to list this table, which is acceptable under the rules. | AWS console screenshot of DynamoDB table + Streams; Vercel env vars `DYNAMODB_TABLE_NAME` and `AWS_REGION`; live app reading table data. | Low. Just capture the screenshot; no integration work needed. |
| New/existing rule | **Settled by Devpost admin** (Shawni, 6/26/26): a pre-existing project IS eligible when the AWS Database + Vercel integration is built as new work during the submission window, with in-window commits as evidence — and you must explain the updates in the submission's "what was updated" question. | Green. The AgriNexus AI engine pre-existed; the Vercel control plane + DynamoDB integration + Streams aggregation are new in-window work (commits `09fd0cc`, `0617e05`, `25486a3` dated within the window). | The Devpost **"significant updates" field** (required); "New vs existing" table in README/Devpost; commit history; `/judges` page. | Low. The only must-do is actually filling the updates field — see Submission Fields below. |
| Working project access | Judges must be able to access/test the app free of charge through judging. | Green with demo personas and demo activation. | `/login` demo buttons; testing instructions in Devpost. | Low. Ensure auth/session cookies work in production. |
| Video | Less than 3 minutes; **must be PUBLIC on YouTube (not unlisted/private)**; shows working app; explains problem, audience, and AWS database used. | Green if script is followed. | `docs/h0-demo-script.md`; final **public** YouTube link. | Medium if video rambles, misses AWS proof, or is left unlisted/private (cannot be reviewed). |
| Architecture diagram | Must show how frontend, backend, and database connect. | Green draft exists in `docs/h0-architecture.md`. | Export diagram as PNG/PDF for Devpost and article. | Low, but diagram should be polished and not too dense. |
| Deadline and links | Deadline is June 29, 2026 5 PM PT / 8 PM ET; links cannot be fixed after wall. | Operational risk only. | Submit Devpost draft early with Vercel URL, repo URL, video URL. | High if delayed. Upload video and fill links before final polish. |

## Scoring Strategy

The hackathon has four criteria. The project should hedge all four, but the realistic category
targets are **Best Technical Implementation**, **Most Impactful**, and **Most Original**. Design
should be strong enough not to drag the score down; it is less likely to be the winning axis.

### 1. Technological Implementation

Official prompt: "Does the project show real software craftsmanship? Is the AWS Database integrated
with a deliberate data model and architecture? Does the Vercel deployment go beyond basics? Is the
app clean, purposeful and intentional?"

| What judges need to see | AgriNexus proof | Where it appears | Evidence still needed |
| --- | --- | --- | --- |
| Deliberate AWS database choice | DynamoDB chosen for phone-keyed, tenant-scoped, high-write advisory events; stateless HTTP API fits Vercel serverless better than Aurora connection pools. | `docs/h0-why-architecture.md`; video VO; Devpost description. | Say the "why DynamoDB over Aurora" sentence in the video. |
| Real data model | Single-table entities: `TENANT#`, `COHORT#`, `LICENSE#`, `SUMMARY#`, `PHONE#`; `GSI1` for cohort membership; `GSI2` for active cohorts. | `docs/h0-architecture.md`; README; code in `lib/entities/`. | AWS console screenshot with representative items. |
| Event-driven analytics | DynamoDB Streams feed `OutcomesAggregator` Lambda to materialize `SUMMARY#` items. Dashboard reads precomputed summaries instead of scanning event history. | Architecture diagram, Overview cards, LineageBadge, code in Lambda handler. | Screenshot Streams enabled + Lambda visible. |
| Control plane drives delivery plane | Provision/activate cohort in platform changes what the poller/engine sees through active-cohort access pattern. | Advisory Loop hero; `trigger-poller` demo; architecture diagram. | In video, run advisory cycle and narrate "not a static dashboard." |
| Vercel deployment beyond static hosting | Next.js app with API routes, auth/session middleware, tenant-scoped APIs, Stripe Checkout routes, healthcheck, and server-side AWS SDK calls. | Live app; `app/api/`; Vercel URL. | Show URL + live app behavior, not only slides. |
| Secrets and IAM maturity | AWS Secrets Manager is source of truth for Stripe and weather secrets; Vercel env vars hold bootstrap credentials and non-sensitive config; IAM policy scoped to needed services. | README; `.env.example`; `infra/vercel-iam-policy.json`; `lib/secrets.ts`. | If space permits, mention briefly in article, not video. |
| Monetization as implemented code | Tiered Stripe Checkout by plan + cohort metadata; billing page shows licenses. | `/dashboard/billing`; activation routes; Stripe dashboard. | Screenshot Stripe branded checkout/test product. |

Recommended technical narrative:

> "Identity here is a phone number, the workload is high-write and append-heavy, and access is by
> phone and by tenant. DynamoDB lets the Vercel app call a stateless HTTP API without managing a
> relational connection pool. Streams materialize outcomes into cohort summaries, so the dashboard
> reads one item per cohort instead of scanning nudge events."

### 2. Design

Official prompt: "Is the user experience intuitive and well-considered? Does the front-end feel
designed in relation to the back-end? Is there a cohesive, intentional balance between the two
layers that reflects full-stack thinking?"

| What judges need to see | AgriNexus proof | Where it appears | Evidence still needed |
| --- | --- | --- | --- |
| Clear audience and product story | Landing page now describes partners funding advisory and seeing follow-through, not hackathon jargon. | `/`; hero copy; `/judges` page. | Record landing page and "How it works." |
| Frontend mirrors backend loop | How-it-works explainer and Advisory Loop hero make weather → WhatsApp → reply → Streams → dashboard visible. | `HowItWorks`, `AdvisoryLoopHero`, dashboard. | Use "Show the tech" toggle in video for 2-3 seconds. |
| Jargon reduction | Glossary tooltips for cohort, nudge, follow-through, advisory loop; plain language by default with technical toggles. | `Term` component; landing/dashboard copy. | Confirm no leaked tooltip definitions in production. |
| Visual coherence | Refreshed logo, dark sidebar, cards, badges, Stripe brand assets, dashboard hierarchy. | Layout, components, globals, public assets. | Final visual review; avoid over-showing raw tables. |
| Admin workflow clarity | Cohort wizard: district/crops/languages → nudge rules → plan review. | `/dashboard/cohorts/new`. | Show one concise wizard step in video. |
| Judge guidance | `/judges` separates hackathon proof from product landing page. | `/judges`. | Include link in README/Devpost. |

Design risks and mitigations:

- Risk: judges see a static dashboard. Mitigation: click "Run advisory cycle" and show live state
  change plus AWS DB proof.
- Risk: jargon ("cohort", "nudge", "Streams") overwhelms non-technical judges. Mitigation: start
  plain, then use "Show the tech" only as reveal.
- Risk: AI-generic product naming/writing. Mitigation: keep **AgriNexus** because it is domain
  specific (agriculture + nexus/control plane) and write Devpost copy in first person, not generic
  SaaS language.

### 3. Impact & Real-world Applicability

Official prompt: "Does the project solve a meaningful problem for a real audience? Does the use of
scalable database infrastructure and frontend deployment make the solution more viable — not just
functional, but potentially shippable?"

| What judges need to see | AgriNexus proof | Where it appears | Evidence still needed |
| --- | --- | --- | --- |
| Real audience | NGOs, KVK/extension programs, agri-input companies, government partners funding advisory at district/village scale. | Landing, README, Devpost description. | Define KVK/Indian terms once for international judges. |
| Meaningful problem | Partners can send advice but cannot prove farmers acted; the platform closes the "advice delivered vs action taken" gap. | Problem framing, dashboard summaries, follow-through metrics. | First 20 seconds of video must be crisp. |
| Real-world foundation | Builds on an existing WhatsApp advisory engine that already won AWS AIdeas; H0 adds the missing B2B monitoring/provisioning layer. | README "New vs existing"; article; video. | State boundary without sounding like old work is the submission. |
| Shippable B2B model | Tiered licensing, Stripe Checkout, admin provisioning, tenant isolation, demo personas, audit-friendly summaries. | Billing page, wizard, tenant switcher. | Show Stripe briefly; avoid spending too long in checkout. |
| Scalable operations | One WhatsApp number acts as transport; routing is phone → cohort → tenant; summaries prevent dashboard scans; tenant partitions isolate partner data. | Architecture narrative, diagram. | Put this in article and diagram annotation. |

Recommended impact narrative:

> "The farmer is the beneficiary, but the buyer is the partner running the program. AgriNexus gives
> that partner a control plane: who is enrolled, which cohorts are live, what advice was sent, and
> whether farmers followed through."

### 4. Originality

Official prompt: "How creative and original is the concept? Does the project demonstrate a genuine
insight about what's possible with this stack? If the idea isn't new, how significantly does this
implementation push it forward?"

| What judges need to see | AgriNexus proof | Where it appears | Evidence still needed |
| --- | --- | --- | --- |
| Not another generic CRUD/SaaS demo | The core loop connects agricultural weather advice, WhatsApp behavior, partner provisioning, and outcome accountability. | Demo arc, How-it-works, Advisory Loop. | Avoid describing it as "dashboard for farmers"; it is an accountability loop. |
| Genuine stack insight | Vercel is not just hosting; it is the partner-facing control plane. DynamoDB is not just storage; it is the routing + event + materialized summary backbone. | "Why" narrative; architecture diagram. | Say this explicitly in video/article. |
| Existing idea pushed forward | The original AgriNexus AI delivered advice. H0 adds monetizable, multi-tenant program operations and proof-of-follow-through. | New vs existing boundary. | Preserve this contrast everywhere. |
| Technical originality | One shared table connects delivery and platform; single WhatsApp number with data-model routing; Streams summaries as dashboard product primitive. | `h0-why-architecture.md`; diagram. | Diagram should show the shared table as the spine. |
| Human-authored specificity | Brief warns AI names/descriptions feel generic. AgriNexus name is specific enough; description must be first-person/specific, not AI boilerplate. | Devpost description, articles, LinkedIn. | Draft with AI if useful, then rewrite in your voice. |

Originality risks and mitigations:

- Risk: "AI dashboard with Stripe" feels generic. Mitigation: lead with the closed-loop
  accountability insight and the existing farmer advisory engine.
- Risk: name perceived as AI-generated. Mitigation: keep explanation simple: **AgriNexus = the
  nexus between farmer advisory delivery and partner accountability.**
- Risk: old-work concern. Mitigation: be explicit that delivery engine is pre-existing and the H0
  control plane is new.

## Bonus Content Plan

Official bonus: publish public content about how the project was built using one of the specified
AWS Databases and Vercel. More than one piece may be submitted. Content must be public, include a
statement that it was created for H0, and use `#H0Hackathon` on social.

Target: **3 separate pieces for +0.6**. Do not assume the required demo video double-counts.

| Piece | Purpose | Must include | Status |
| --- | --- | --- | --- |
| AWS Builder Center article | Highest credibility technical proof. | DynamoDB single-table + Streams + Vercel control plane; H0 disclosure. | Draft from `docs/h0-bonus-article.md`. |
| LinkedIn build post | Human voice + reach. | The partner accountability problem, why H0, brief architecture, `#H0Hackathon`. | Not written yet. |
| Separate YouTube technical walkthrough | Longer-form proof beyond 3-min submission cut. | Architecture "why", AWS console proof, Vercel deployment, H0 disclosure. | Not recorded yet. |

Voice rule:

- AI voiceover is allowed if needed.
- Do **not** submit generic AI-written Devpost descriptions or public posts. Judges explicitly warn
  that they are recognizable and forgettable.
- Use first person and concrete details: "I built the missing control plane for an advisory engine
  I had already shipped," not "leveraging cutting-edge cloud-native synergies."

## Video Proof Map

The video must be under 3 minutes. Judges are not required to watch beyond 3 minutes, so every
criterion must appear early enough to count.

| Time | Beat | Criteria covered | Proof |
| --- | --- | --- | --- |
| 0:00-0:20 | Problem and audience | Impact, Originality | Partners fund advice but cannot prove follow-through; farmers benefit but partners buy. |
| 0:20-0:40 | Landing + How it works | Design, Impact | Weather → WhatsApp nudge → farmer reply → village roll-up → dashboard. |
| 0:40-1:20 | Advisory Loop + run cycle | Technical, Design, Originality | Shows dynamic control-plane-to-delivery-plane loop, not static seed data. |
| 1:20-1:40 | Multi-tenant isolation | Technical, B2B | Tenant switcher; cohorts/data change by partner. |
| 1:40-2:05 | Provisioning + billing | B2B monetization, Design | New cohort wizard; tiered Stripe / demo activate. |
| 2:05-2:35 | DynamoDB "why" | Technical | Single-table, no serverless connection pool, Streams summaries. |
| 2:35-2:55 | AWS proof | Eligibility, Technical | Vercel env vars → AWS console DynamoDB table/items/Streams. |
| 2:55-3:00 | Close | Impact | "Built on Vercel + DynamoDB; H0 adds the B2B control plane." |

Do not spend time in:

- Long login flows.
- Full Stripe checkout.
- Raw AWS console navigation before the viewer understands the product.
- Overexplaining prior AIdeas history. One sentence is enough.

## Screenshot / Artifact Checklist

Submission artifacts to capture:

- Live Vercel project URL: `https://agrinexus-platform.vercel.app`
- Vercel Team ID from `.vercel/project.json` / project settings
- Vercel environment variables: `DYNAMODB_TABLE_NAME=agrinexus-data`, `AWS_REGION`
- AWS DynamoDB table: `agrinexus-data`
- Representative DynamoDB items: `TENANT#`, `COHORT#`, `LICENSE#`, `SUMMARY#`, `PHONE#`
- DynamoDB Streams enabled
- `OutcomesAggregator` Lambda
- Stripe branded checkout or Stripe dashboard test products/prices
- Architecture diagram export
- Demo video YouTube URL — **PUBLIC** (not unlisted/private; unlisted and private videos cannot be reviewed)
- Repo link: feature branch or merged main, whichever is final for submission
- `/judges` page URL
- Three bonus content URLs

## Devpost Submission Fields (required text)

Per the Devpost admin confirmation (6/26/26), the **"significant updates during the submission
period"** field is where eligibility for a pre-existing project is established. Do not leave it
generic. Draft (in first person, then tighten):

> AgriNexus AI — the WhatsApp advisory delivery engine — pre-existed this hackathon (AWS AIdeas
> award). For H0 I built **Outturn**, a new B2B control plane, entirely within the submission
> window: the Vercel/Next.js app and its **DynamoDB integration** (single-table multi-tenant model,
> GSIs, Streams), the `OutcomesAggregator` Lambda that materializes cohort summaries, tenant-scoped
> provisioning + dashboard, and tiered Stripe licensing. The AWS Database + Vercel integration is
> new in-window work; commit history (`09fd0cc`, `0617e05`, `25486a3`, dated within the window) is
> the evidence.

Also confirm these submission fields are filled before the wall: track (B2B), which database
(DynamoDB), text description (own voice), public YouTube link, architecture diagram, Vercel project
link + Team ID, AWS-DB proof screenshot.

## Scope & Integrity (public-safe claims)

State these boundaries honestly in the video, Devpost description, and any public content. They keep
the submission credible to a database-expert panel and avoid overclaiming.

- **Demo data is partly seeded.** One cohort is driven live end-to-end on camera; other cohorts are
  seeded to show multi-tenant scale. Say which is which. Do **not** claim "all data is live."
- **Aggregation is eventually consistent, not exactly-once.** DynamoDB Streams → `OutcomesAggregator`
  Lambda materializes `SUMMARY#` rollups. Describe it as event-driven, read-optimized aggregation.
  Do **not** claim exactly-once processing or strict real-time consistency.
- **Tenant isolation is application-enforced partition scoping, not a hard security boundary.**
  Queries are scoped by `PK = TENANT#<id>`. Describe it as multi-tenant isolation at the
  data-access layer. Do **not** claim hardened/guaranteed isolation, per-tenant encryption, or a
  formally audited boundary.
- **Auth in the demo is one-click personas** for fast judge exploration and tenant switching; the
  production path is Cognito JWT. Frame personas as a demo affordance, not the production auth model.
- **Delivery requires opt-in.** Partner enrollment creates the cohort/analytics record; farmer
  WhatsApp opt-in establishes delivery consent. Outcome attribution is by phone number.
- **Outturn surfaces where to act; it does not perform the field intervention.** The intervention is
  human and off-app. Do **not** say the platform "triggers interventions."

## "What To Tell Cursor Now"

Use this prompt for the next focused implementation/writing pass:

> We are preparing AgriNexus Platform for the H0 Hack the Zero Stack submission. Use
> `docs/h0-rubric-proof.md` as the controlling rubric. Do not add new product scope unless it
> directly improves one of the four judging criteria or fixes an eligibility/proof gap. Prioritize:
> (1) export/polish the architecture diagram around the shared DynamoDB spine; (2) draft the
> Devpost text description in first person and in Prasad's voice, avoiding generic AI phrasing;
> (3) draft three public bonus pieces for +0.6; (4) produce the word-for-word 3-minute video VO
> that includes the Vercel env var → AWS DynamoDB console proof because `agrinexus-data` does not
> appear in Vercel Storage. Preserve the new-vs-existing boundary: AgriNexus AI delivery engine
> pre-existed; the H0 submission is the new Vercel B2B control plane.

## Final Hedging Assessment

| Criterion / requirement | Hedged? | Confidence | What can still improve score |
| --- | --- | --- | --- |
| Eligibility | Yes | High | AWS-DB-proof and new/existing gates are now settled by the rules + admin confirmation; remaining work is capturing the screenshot, filling the "updates" field, and submitting links early. |
| Technical Implementation | Yes | High | Polish diagram and say the DynamoDB "why" clearly. |
| Design | Yes | Medium | Keep the demo path crisp; avoid jargon; show product before console. |
| Impact | Yes | High | Lead with partner accountability and farmer follow-through, not generic agriculture. |
| Originality | Yes | High | Emphasize closed-loop accountability + shared table + one-number routing. |
| Bonus points | Planned, not done | Medium | Publish 3 separate public pieces with required H0 disclosure. |
| Submission ops | Partially | Medium | Upload video early; fill Devpost draft now; avoid repo changes after deadline. |

Bottom line: the product now hedges all four judging criteria. The remaining work is less about
feature building and more about **proof packaging**: architecture diagram, voice-specific
description, proof screenshots, and bonus content.
