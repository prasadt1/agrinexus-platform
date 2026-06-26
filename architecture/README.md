# Architecture — Outturn

Outturn is the B2B control plane for agricultural advisory programs. It runs on **Vercel**
(Next.js App Router) over a single **Amazon DynamoDB** table, and drives a pre-existing WhatsApp
advisory + nudge engine, **AgriNexus** (AWS AIdeas award winner), through that shared table.

Three planes, one table:

| Plane | What it is | Tech |
|---|---|---|
| **Control** | Partner-facing app: login, cohort provisioning, dashboard, billing | Outturn — Next.js on Vercel |
| **Data** | Single multi-tenant table + GSIs + Streams | Amazon DynamoDB (`agrinexus-data`) |
| **Delivery** | Weather poll → WhatsApp nudge → reply detection | AgriNexus engine (Lambda, Step Functions) |

The identity that ties the planes together is the **farmer's phone number**. Attribution is always
by phone, never by the sending number.

## Contents
- [`diagrams.md`](./diagrams.md) — closed-loop **sequence** diagram + three-plane **system** diagram (Mermaid, brand palette).
- [`decisions/`](./decisions) — Architecture Decision Records (ADRs):
  - [0001](./decisions/0001-use-dynamodb-single-table.md) — DynamoDB single-table over Aurora
  - [0002](./decisions/0002-single-table-key-design.md) — Multi-tenant key + GSI design
  - [0003](./decisions/0003-streams-outcome-materialization.md) — Streams-materialized outcome summaries
  - [0004](./decisions/0004-one-number-phone-routing.md) — One WhatsApp number, phone-based routing
  - [0005](./decisions/0005-shared-table-control-drives-delivery.md) — Shared table; control plane drives delivery
- [`polished/`](./polished) — presentation-grade diagram spec + generation prompt for the article/video.

## Rendering
The Mermaid blocks render on GitHub directly. For slides/article, export from
[mermaid.live](https://mermaid.live) or follow [`polished/diagram-spec.md`](./polished/diagram-spec.md).
