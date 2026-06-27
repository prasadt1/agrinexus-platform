# H0 Architecture Diagram

Three planes, one DynamoDB table.

```mermaid
flowchart TB
  subgraph control [Control Plane - Vercel Next.js]
    Login[Login / Demo personas]
    Wizard[Cohort provisioning wizard]
    Dash[Dashboard + Advisory Loop]
    Billing[Billing / Stripe Checkout]
  end

  subgraph data [Data Plane - Amazon DynamoDB]
    Table[(agrinexus-data single table)]
    GSI1[GSI1: COHORT members]
    GSI2[GSI2: STATUS active cohorts]
    Streams[DynamoDB Streams]
  end

  subgraph delivery [Delivery Plane - Existing AgriNexus AI]
    Poller[Demo WeatherPoller API]
    SFN[Step Functions nudge workflow]
    WA[WhatsApp farmers]
  end

  subgraph analytics [Analytics]
    Lambda[OutcomesAggregator Lambda]
    Summary[SUMMARY materialized items]
  end

  Login --> Dash
  Wizard -->|PutItem COHORT| Table
  Billing -->|LICENSE on payment| Table
  Dash -->|Query tenant scoped| Table
  Table --> GSI1
  Table --> GSI2
  GSI2 --> Poller
  Poller --> SFN
  SFN --> WA
  WA -->|NUDGE events| Table
  Streams --> Lambda
  Lambda --> Summary
  Summary --> Table
  Dash -->|Read SUMMARY| Table
```

## Entity keys

| Entity | PK | SK |
|--------|----|----|
| Tenant | TENANT#id | META |
| Cohort | TENANT#id | COHORT#id |
| License | TENANT#id | LICENSE#cohortId |
| Summary | TENANT#id | SUMMARY#cohortId#period |
| Membership | PHONE#phone | MEMBERSHIP |

## Vercel deployment

- Project: agrinexus-platform
- Team ID: see `.vercel/project.json` → `orgId`

## AWS proof screenshots

> ⚠️ **`agrinexus-data` will NOT appear under Vercel → Storage.** We connect via the AWS SDK with
> a scoped IAM key, not the Vercel-provisioned integration, so the judges' default verification
> path (Vercel dashboard → Storage) shows nothing. Proof must come from the explicit
> console + env-var walkthrough below and in the demo video (FAQ-sanctioned escape hatch).

Capture for submission:

1. DynamoDB table items (TENANT#, COHORT#, SUMMARY#)
2. DynamoDB Streams enabled
3. OutcomesAggregator Lambda
4. Vercel env vars (AWS_REGION, DYNAMODB_TABLE_NAME) — proves the deployed app's connection
5. Stripe test dashboard with branded checkout
