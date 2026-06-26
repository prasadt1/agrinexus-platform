# ADR 0005 — Shared table: the control plane drives the delivery engine

**Status:** Accepted

## Context
The **AgriNexus** WhatsApp advisory + nudge engine pre-existed this hackathon (it won the AWS AIdeas
Innovation Award). **Outturn** is the new B2B control plane. Both run in one AWS account. The goal
is for partner actions in Outturn to actually change what the engine does — without bolting an API
between two codebases under deadline.

## Decision
Both share the single **`agrinexus-data`** table as the integration surface:
- Provisioning/activating a cohort in Outturn writes `COHORT#` with `GSI2PK=STATUS#active`.
- The engine's poller reads **active cohorts from `GSI2`** (data-driven) instead of hardcoded
  districts.
- Outcomes the engine writes (`NUDGE#` status transitions) stream to Outturn's aggregator
  (see [0003](./0003-streams-outcome-materialization.md)).

## Consequences
- The control plane changes the delivery plane's behavior **through the database**, with no direct
  service-to-service coupling — a clean seam between two repos.
- The **new-vs-existing boundary is explicit and honest**: AgriNexus = pre-existing delivery engine;
  Outturn = the new H0 control plane. This is the framing used in the submission.
- Both planes must agree on key shapes; the schema in [0002](./0002-single-table-key-design.md) is
  the contract.
