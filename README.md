# AgriNexus Platform

Multi-tenant B2B control plane for agricultural advisory services. Built on Next.js (App Router) with AWS DynamoDB backend.

## Project Structure

```
agrinexus-platform/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/
│   │   └── healthcheck/    # DynamoDB integration test endpoint
│   ├── layout.tsx
│   └── page.tsx            # Home page with healthcheck UI
├── lib/                    # Shared utilities
│   └── dynamo.ts           # AWS SDK v3 DynamoDB client
├── components/             # React components (empty for now)
├── .env.example            # Environment variables template
└── VALIDATION.md           # Delivery engine architecture analysis
```

## Prerequisites

1. **Node.js 18+** and npm
2. **AWS Account** with DynamoDB table access
3. **IAM Credentials** with the following permissions:
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "dynamodb:PutItem",
       "dynamodb:GetItem",
       "dynamodb:DeleteItem",
       "dynamodb:Query"
     ],
     "Resource": "arn:aws:dynamodb:REGION:ACCOUNT:table/TABLE_NAME"
   }
   ```

## Local Development

### Step 1: Install Dependencies

```bash
cd agrinexus-platform
npm install
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your AWS credentials:

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
DYNAMODB_TABLE_NAME=agrinexus-data
```

### Step 3: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Step 4: Test DynamoDB Integration

1. Click **"Run Healthcheck"** on the home page, or
2. Visit [http://localhost:3000/api/healthcheck](http://localhost:3000/api/healthcheck) directly

A successful response looks like:

```json
{
  "status": "healthy",
  "message": "DynamoDB integration verified: write, read, delete all succeeded",
  "total_duration_ms": 145,
  "checks": {
    "env_configured": true,
    "table_name": "agrinexus-data",
    "write": { "success": true, "duration_ms": 52 },
    "read": { "success": true, "duration_ms": 38, "data_matches": true },
    "cleanup": { "success": true, "duration_ms": 41 }
  }
}
```

## Deploy to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Deploy

**Option A: Via CLI**

```bash
vercel
```

Follow the prompts to link to your Vercel account and project.

**Option B: Via GitHub**

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Vercel auto-detects Next.js

### Step 3: Configure Environment Variables in Vercel

1. Go to your project in the Vercel dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable from `.env.example`:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `AWS_REGION` | `ap-south-1` | Production, Preview, Development |
   | `AWS_ACCESS_KEY_ID` | `(your key)` | Production, Preview, Development |
   | `AWS_SECRET_ACCESS_KEY` | `(your secret)` | Production, Preview, Development |
   | `DYNAMODB_TABLE_NAME` | `agrinexus-data` | Production, Preview, Development |

4. Redeploy for changes to take effect:
   ```bash
   vercel --prod
   ```

### Step 4: Verify Deployment

Visit `https://your-project.vercel.app/api/healthcheck` to confirm DynamoDB connectivity.

## IAM Best Practices for Vercel

Create a dedicated IAM user for Vercel with **least-privilege access**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDBTableAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-south-1:ACCOUNT_ID:table/agrinexus-data",
        "arn:aws:dynamodb:ap-south-1:ACCOUNT_ID:table/agrinexus-data/index/*"
      ]
    }
  ]
}
```

**Security notes:**
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Rotate credentials periodically
- Consider using Vercel's AWS integration for automatic credential management

## Troubleshooting

### "Missing required environment variable"

Ensure all variables in `.env.example` are set in `.env.local` (local) or Vercel dashboard (production).

### "AccessDeniedException"

The IAM user lacks required permissions. Check the policy attached to your access key.

### "ResourceNotFoundException"

The DynamoDB table name is incorrect or the table doesn't exist in the specified region.

### "UnrecognizedClientException"

Invalid AWS credentials. Regenerate access keys in IAM console.

## Next Steps

This scaffold proves the Vercel → DynamoDB integration. Next features to build:

1. **Multi-tenant data model** (TENANT#, COHORT#, LICENSE# entities)
2. **Cognito authentication** (partner accounts)
3. **Cohort provisioning API** (`POST /api/cohorts`)
4. **Dashboard** (read materialized summaries)
5. **Stripe billing** (cohort activation)

See `VALIDATION.md` for architecture analysis of the existing delivery engine.
