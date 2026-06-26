# ADR 0002 — Multi-tenant single-table key + GSI design

**Status:** Accepted

## Context
Following [0001](./0001-use-dynamodb-single-table.md), all entities live in one table. We need
tenant isolation plus exactly two secondary access patterns: *list the members of a cohort* and
*list active cohorts for the poller*.

## Decision
One table (`agrinexus-data`), entity-typed keys:

| Entity | PK | SK | GSI |
|---|---|---|---|
| Tenant | `TENANT#<id>` | `META` | — |
| Cohort | `TENANT#<id>` | `COHORT#<id>` | `GSI2PK=STATUS#active` when active |
| License | `TENANT#<id>` | `LICENSE#<cohortId>` | — |
| Summary | `TENANT#<id>` | `SUMMARY#<cohortId>#<period>` | — |
| Membership | `PHONE#<phone>` | `MEMBERSHIP` | `GSI1PK=COHORT#<id>` |
| Farmer (engine) | `USER#<phone>` | `PROFILE` / `NUDGE#…` / `MSG#…` | `GSI1PK=LOCATION#<district>` |

- **GSI1** answers *cohort → members* (`GSI1PK=COHORT#`) and *district → farmers* (`GSI1PK=LOCATION#`).
- **GSI2** answers *active cohorts* (`GSI2PK=STATUS#active`) for the cross-tenant poller.

## Consequences
- **Tenant isolation is partition scoping:** every tenant read is keyed `PK=TENANT#<sessionTenant>`
  server-side; a partner cannot reach another partner's partition.
- **Identity is the phone number** — the join key across the control and delivery planes.
- The two GSI namespaces on `GSI1` (`COHORT#` vs `LOCATION#`) are intentionally distinct so cohort
  membership and district-based delivery selection don't collide.
