# YouTube technical walkthrough — script (deeper cut, ~4 min)

> *Disclosure: I created this content for the purposes of entering the H0 Hackathon. #H0Hackathon*
>
> **DRAFT script for the SEPARATE technical walkthrough** — this is the longer "why the architecture" cut, distinct from the required 3-minute submission video. `[SHOT]` = what's on screen, `VO:` = voiceover. Narrate in your own voice.

---

### 0:00 — Cold open
[SHOT: the live landing page, outturn.vercel.app]
VO: "This is Outturn — a B2B control plane that sits on top of a WhatsApp advisory engine for farmers. I want to show you the architecture, because the interesting part isn't the UI, it's how the pieces connect on AWS and Vercel."

### 0:20 — The problem
[SHOT: the animated advisory-loop hero stepping through weather → nudge → reply → rollup → proof]
VO: "The engine watches the weather for a village and sends a farmer a WhatsApp nudge when it's a good day to act. Farmers reply 'done.' That part already exists — it was an AWS AIdeas finalist. What H0 asked me to build is the accountability layer: who actually followed through, per district, so a sponsoring partner can fund what works."

### 0:45 — One table, two planes
[SHOT: architecture diagram — agrinexus-data in the middle, delivery engine on one side, control plane on the other]
VO: "There's one DynamoDB table feeding both systems. Identity is a phone number — a natural partition key. Tenant isolation isn't a WHERE clause you can forget; it's structural — every partner item lives under a TENANT-hash prefix. Two global secondary indexes cover the only two secondary patterns: cohort-to-members, and active-cohorts-for-the-poller."

### 1:15 — Control plane drives delivery
[SHOT: dashboard — activating a cohort; then the resulting GSI2 item in the console]
VO: "When a partner activates a cohort here, it gets a GSI2 entry. The engine's weather poller reads active cohorts from that index — not a hardcoded list. So provisioning a cohort in this dashboard literally changes what the engine does in the field. No deploy."

### 1:45 — Streams and idempotency
[SHOT: the OutcomesAggregator Lambda, then a SUMMARY# item with counters]
VO: "Outcomes roll up through DynamoDB Streams into a Lambda that maintains one pre-computed summary per cohort. The dashboard reads one item, not a scan. One gotcha: streams are at-least-once and Lambda retries — so a naive counter would double-count on replay. Each event is claimed once with a dedupe marker, so replays are skipped. Atomic isn't the same as idempotent."

### 2:20 — Why DynamoDB, not Aurora
[SHOT: a simple slide — "no connection pool"]
VO: "The honest reason I chose DynamoDB over Aurora is concurrency. On Vercel, every request is its own function invocation. Aurora's connection pool fights that — you'd reach for RDS Proxy or the Data API. DynamoDB is a stateless HTTP API with no pool. It's the natural fit for per-request serverless."

### 2:50 — Keyless Vercel ↔ AWS
[SHOT: /api/healthcheck returning {"status":"healthy"}; then Vercel env vars with NO AWS_SECRET_ACCESS_KEY; then the Storage tab showing outturn-audit-log]
VO: "And the connection is keyless. Vercel issues a per-deployment OIDC token; the server exchanges it for short-lived STS credentials by assuming a scoped IAM role. There's no secret access key in the environment — I prove it with a health-check that does a write, read, and delete with zero static credentials. There are actually two DynamoDB tables: our shared table via OIDC against our own account, and a second one provisioned through the Vercel Marketplace for the audit log — which is why it shows up here in the Storage tab."

### 3:25 — Monetization + consent
[SHOT: Stripe checkout tiers; then a one-line note on the consent gate]
VO: "It bills like a real product — Stripe Checkout per cohort in three tiers, with a demo path for judges. And because we message real people, enrollment seeds a 'pending consent' state, and the engine's sender refuses to nudge anyone who hasn't opted in on WhatsApp."

### 3:50 — Close
[SHOT: the live activity feed / dashboard overview]
VO: "One table, two planes, keyless to AWS, outcomes rolled up through Streams. The link's in the description — and you can chat with the live engine on WhatsApp. Thanks for watching."

[END CARD: outturn.vercel.app · wa.me/4915120105731 · #H0Hackathon]
