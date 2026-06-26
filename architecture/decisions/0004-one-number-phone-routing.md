# ADR 0004 — One WhatsApp number, phone-based routing

**Status:** Accepted

## Context
The platform serves many tenants and cohorts. Provisioning a dedicated WhatsApp Business number per
tenant (or per cohort) carries real cost and Meta approval overhead, and would make the routing
logic depend on which number a message arrived on.

## Decision
Use **one** WhatsApp Business number as a **transport address, not a routing key**.
- **Outbound:** the poller resolves *district → recipients* before calling Meta.
- **Inbound:** a reply is matched to the farmer's open nudge by their **phone number**, and rolled
  up *phone → cohort → tenant* from the data model.

## Consequences
- Scales to N tenants on a single number, with no per-tenant provisioning or per-cohort Meta review.
- All identity and attribution depend on the phone number being the stable join key (see
  [0002](./0002-single-table-key-design.md)) — which it is, because the farmer's phone is their
  identity in both planes.
- Number-level analytics are meaningless by design; all reporting is phone-derived.
