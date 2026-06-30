# Security Policy

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security or privacy problems.

Email **prasad@prasadtilloo.com** with:

- a description of the issue and its impact,
- steps to reproduce (if applicable), and
- any relevant logs — **with all secrets and personal data redacted**.

I aim to acknowledge reports within a few days.

## Handling secrets and PII

- No long-lived AWS keys exist in the production path — Vercel reaches AWS via **OIDC federation → STS** (short-lived credentials).
- Application secrets (Stripe key, weather API key) live in **AWS Secrets Manager**, not in the repo.
- Never include real phone numbers, tokens, or credentials in issues, PRs, logs, or tests. Use placeholders (e.g. `+10000000000`).
- Farmer phone numbers are PII — treat any data export accordingly.

## Scope

This policy covers the Outturn control plane in this repository. The farmer-facing
[AgriNexus AI](https://github.com/prasadt1/agrinexus-ai) delivery engine has its own
security policy in its repository.
