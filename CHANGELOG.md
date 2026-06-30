# Changelog

All notable changes to Outturn (the AgriNexus platform) are documented here.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] — 2026-06-29 — H0 submission

Initial public release: the B2B control plane built for the H0 — Hack the Zero
Stack hackathon (Track 2, Monetizable B2B), on top of the pre-existing AgriNexus
delivery engine.

### Added
- Multi-tenant **DynamoDB single-table** model (`TENANT#`, `COHORT#`, `LICENSE#`, `SUMMARY#`, `MEMBERSHIP`, plus engine `PROFILE` / `NUDGE#` rows).
- **Cohort provisioning wizard** — district, crops, languages, weather-rule thresholds, nudge cadence.
- **Activation as a data contract** — writes a `LICENSE#` row and a `GSI2PK = STATUS#active` key for poller discovery.
- **Control-plane-driven advisory poller** — queries active cohorts, checks district weather against rules, fires the engine's Step Functions workflow (demo poller isolated from the production schedule).
- **DynamoDB Streams rollups** — `OutcomesAggregator` Lambda materializes `SUMMARY#` rows, idempotent via `DEDUPE#<eventID>` claims.
- **Stripe Checkout** (Starter / Growth / Enterprise) + one-click demo activation.
- **Vercel OIDC → AWS STS** keyless production path; two federations into two AWS accounts (own data account + Vercel Marketplace managed audit account).
- **Consent-safe enrollment** and **audited admin re-nudge**.
- Tenant switcher, dashboard, cohort detail with live follow-through, and activity/audit log.
- Judge-facing `/judges` guide and `/proof` infrastructure gallery.

[1.0.0]: https://github.com/prasadt1/agrinexus-platform/releases/tag/v1.0.0
