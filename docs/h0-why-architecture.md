# H0 — The "why" narrative (the technical score)

Judges (Ronak Shah, AWS): **"It's not *which* database you chose — it's *why*."** And:
**"You don't need a million rows; you need an architecture that makes sense for your scale."**

This file is the load-bearing reasoning for the **Technical Implementation** axis. It is the
source of truth for the video narration, the Devpost write-up, the architecture-diagram
annotations, and the bonus article. Say these in your own voice — generic phrasing costs
Originality/Design points (see the voice guardrail in `h0-bonus-article.md`).

---

## The four load-bearing points

### 1. Why DynamoDB single-table
- **Identity is a phone number** — a natural partition key. The workload is **high-write and
  append-heavy** (nudges sent, inbound replies, outcomes), accessed **by phone and by tenant**,
  not relationally.
- **Tenant isolation is partition scoping**: `PK = TENANT#<id>`. A partner can only ever query
  inside their own partition prefix.
- **Two GSIs cover the only two secondary access patterns** — `GSI1` (cohort → members) and
  `GSI2` (active cohorts for the weather poller) — without duplicating data.

### 2. Why DynamoDB over Aurora (the maturity signal most teams won't say)
- Aurora's **connection-pool model fights serverless concurrency**. On Vercel you'd need
  **RDS Proxy or the Aurora Data API** to fan out across per-request function invocations.
- **DynamoDB is a stateless HTTP API with no connection pool** — the natural fit for
  per-request Vercel functions. This is the single observation that makes experienced
  engineers nod.

### 3. Why Streams, not query-time aggregation
- Dashboard reads must be **cheap and fast**. A high-write event flow shouldn't be scanned at
  read time.
- **DynamoDB Streams → OutcomesAggregator Lambda → `SUMMARY#` items** turns the event flow into
  **pre-computed, read-optimized rollups**. The dashboard reads **one item per cohort** instead
  of scanning nudge events. Event-driven, decoupled, scales with write volume.

### 4. Why one WhatsApp number + content routing
- The WhatsApp number is a **transport address, not a routing key**. Routing is
  **phone → cohort → tenant**, resolved from the data model.
- One number scales to **N tenants** with **no per-tenant provisioning** and **no extra
  Meta-approval overhead** per cohort.

---

## The connective tissue: control plane drives delivery plane

One `agrinexus-data` table feeds **both** the award-winning delivery engine (AgriNexus AI) and
the new H0 control plane. **Provisioning a cohort in the control plane changes what the engine
does** — the WeatherPoller reads active cohorts from `GSI2`, not from hardcoded districts. That
cross-repo shared table is the strongest "why" you have, and it's the reason we do **not**
repoint to a fresh Vercel-provisioned table (see eligibility note in `h0-demo-script.md`).

---

## Say it in 20 seconds (video VO)

> "Identity here is a phone number, the workload is high-write and append-heavy, and access is by
> phone and by tenant — so a DynamoDB single table fits, with tenant isolation as partition
> scoping. I chose it over Aurora because Aurora's connection pool fights serverless concurrency
> on Vercel, while DynamoDB is a stateless HTTP API with no pool. Outcomes roll up through
> Streams into pre-computed summaries, so the dashboard reads one item per cohort instead of
> scanning events. And one WhatsApp number serves every tenant, because the number is a
> transport address — routing is phone to cohort to tenant in the data model."
