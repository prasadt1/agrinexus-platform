# ADR 0003 — Materialize outcomes with DynamoDB Streams

**Status:** Accepted

## Context
The dashboard must read cohort follow-through cheaply and fast. Nudge and outcome events are
high-volume and append-heavy. Scanning `NUDGE#` history on every dashboard load would be slow and
expensive, and gets worse as the program scales.

## Decision
A **DynamoDB Stream** on `agrinexus-data` triggers the **OutcomesAggregator Lambda**, which
maintains one materialized **`SUMMARY#<cohortId>#<period>`** item per cohort using atomic counter
updates (`ADD`). The dashboard reads one `SUMMARY#` item per cohort — never the event history.

Attribution: the aggregator resolves *outcome → cohort* by phone, via
`GetItem PHONE#<phone>/MEMBERSHIP`, then increments that cohort's summary.

## Consequences
- Read-optimized, decoupled, and scales with write volume rather than read volume.
- Counters use atomic `ADD`, so concurrent updates are safe; **idempotency is best-effort** —
  reprocessing the same stream record could double-count. Acceptable at current scale; flagged for
  hardening (e.g., a processed-event marker) if volume grows.
- The follow-through rate is recomputed per update; this is a read-modify-write and is eventually
  consistent under high concurrency — acceptable for a reporting surface.
