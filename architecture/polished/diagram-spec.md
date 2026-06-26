# Polished diagram spec (for the article & video)

Mermaid renders poorly in articles/slides. Use this spec to produce **presentation-grade** versions
of the two diagrams in [`../diagrams.md`](../diagrams.md). Calibrate the visual style to the **Iris
photography-coach** artifacts (to be supplied) and the existing house style in
`agrinexus-ai/architecture/polished/`.

## Palette (brand)
- Control / primary green: `#157347`, deep `#0F5132`, tint `#E6F4EC`
- Data / teal: `#0E7490`, tint `#E0F2F7`
- Delivery / amber: `#B54708`, tint `#FEF0C7`
- Neutrals: text `#101828` / `#475467`, border `#E4E7EC`, surface `#FFFFFF`, page `#F7F8FA`
- Type: Inter. Flat fills, 1px borders, soft shadow `0 1px 2px rgba(16,24,40,.06)`, 8–12px radius.

## Diagram A — Closed-loop (horizontal storyboard)
Six numbered stages left→right, each a rounded card, connected by arrows; the loop returns from 6→1.
1. **Provision** — partner creates a cohort in Outturn → `COHORT#` written to DynamoDB.
2. **Activate** — cohort flagged active (`GSI2`) → engine can now see it.
3. **Nudge** — poller reads active cohorts, sends a WhatsApp reminder (`NUDGE# = SENT`).
4. **Reply** — farmer replies "हो गया / Done"; engine flips `NUDGE# = DONE`.
5. **Attribute** — Streams → OutcomesAggregator resolves the reply to a cohort **by phone**, updates `SUMMARY#`.
6. **See proof** — Outturn dashboard reads one `SUMMARY#` per cohort; follow-through by district.
Caption: *one identity — the phone number — ties all three planes together.*

## Diagram B — Three-plane system
Three stacked horizontal bands, color-coded:
- **Control plane · Outturn (Vercel)** [green] — Login, Cohort wizard, Dashboard, Billing, API routes.
- **Data plane · Amazon DynamoDB** [teal] — `agrinexus-data` single table, GSI1 (cohort members),
  GSI2 (active cohorts), Streams. Draw the table as the spine spanning the middle.
- **Delivery plane · AgriNexus engine (AWS)** [amber] — Weather poller, Step Functions, NudgeSender,
  Response detector, WhatsApp API.
- Floating: OutcomesAggregator λ (Streams → `SUMMARY#`), Stripe, Secrets Manager.
Key arrows: API routes → table (tenant-scoped); GSI2 → poller; engine → table (`NUDGE#`); table →
Streams → aggregator → `SUMMARY#`; dashboard → reads `SUMMARY#`.
Label the table "the shared spine — control plane writes, delivery plane reads."

## Generation prompt (paste into an image/diagram model; tune to Iris style once shared)
```text
Create a clean, modern, flat architecture diagram (no 3D, no gradients except a subtle header band,
no drop shadows beyond a soft 1px card shadow). Style: enterprise SaaS, Inter font, generous
whitespace, rounded 10px cards, thin 1px borders.

[Paste Diagram A or Diagram B content from above.]

Colors: control plane cards green #157347 on #E6F4EC; data plane teal #0E7490 on #E0F2F7; delivery
plane amber #B54708 on #FEF0C7; text #101828/#475467; arrows #475467. Three clearly separated bands
(for B) or a 6-step left-to-right storyboard with a return arrow (for A). Labels exactly as written.
Output a wide 16:9 image suitable for a blog header and a 3-minute demo video.
```

## Deliverables
- `architecture/polished/closed-loop.(svg|png)` — Diagram A
- `architecture/polished/three-plane.(svg|png)` — Diagram B
Keep the Mermaid in `../diagrams.md` as the version-controlled source of truth; the polished exports
are for human-facing surfaces only.
