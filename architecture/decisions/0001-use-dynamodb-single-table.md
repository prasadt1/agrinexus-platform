# ADR 0001 — Use DynamoDB (single-table) over Aurora

**Status:** Accepted

## Context
Outturn is a multi-tenant B2B control plane deployed as Next.js **server functions on Vercel**.
Access is **by phone and by tenant**; the workload is **high-write and append-heavy** (nudges sent,
inbound messages, outcome events). The frontend runs as per-request serverless invocations.

## Decision
Use **Amazon DynamoDB** (single table) as the primary backend — not Aurora PostgreSQL or Aurora DSQL.

## Rationale
- **Serverless fit (the decisive one):** DynamoDB is a stateless HTTP API with **no connection
  pool**. Aurora's pooled-connection model fights per-request serverless concurrency on Vercel —
  you'd need RDS Proxy or the Data API to fan out. DynamoDB sidesteps that entirely.
- **Access patterns are key-value**, by phone and by tenant — not relational or analytical.
- **Predictable single-digit-ms reads** at any scale; on-demand (pay-per-request) pricing.

## Consequences
- No ad-hoc SQL or joins — access patterns are designed up front (see [0002](./0002-single-table-key-design.md)).
- Aggregations are **materialized via Streams** (see [0003](./0003-streams-outcome-materialization.md)),
  not computed at read time.
- We can articulate a concrete "why this database" to database-expert judges, which is the
  highest-leverage technical signal for this hackathon.
