# 06 — Testing

> **Priority:** Focus on tests that prove multi-tenant claims and core functionality.

---

## Test Categories

| Category | Purpose | Priority |
|----------|---------|----------|
| Tenant Isolation | Prove multi-tenant security | Critical |
| Provisioning Round-Trip | Prove control→data→delivery flow | Critical |
| Aggregation Correctness | Prove Streams pipeline works | High |
| Stripe Webhook | Prove monetization mechanism | High |
| Judge Access | Prove demo works for evaluators | Critical |

---

## 1. Tenant Isolation Tests

> **Most important for multi-tenant claims.** Partner A must not see Partner B's data.

### Test 1.1: Cross-Tenant Cohort Access

**Setup:**
1. Create Tenant A with Cohort A1
2. Create Tenant B with Cohort B1
3. Authenticate as Tenant A

**Test:**
```typescript
// Attempt to read Tenant B's cohort as Tenant A
const response = await fetch('/api/cohorts/B1', {
  headers: { Authorization: `Bearer ${tenantA_jwt}` }
});

// Expected: 404 Not Found (not 403, to avoid info leak)
expect(response.status).toBe(404);
```

**Pass criteria:** Tenant A cannot read Tenant B's cohort

### Test 1.2: Cross-Tenant Cohort Listing

**Test:**
```typescript
// List cohorts as Tenant A
const response = await fetch('/api/cohorts', {
  headers: { Authorization: `Bearer ${tenantA_jwt}` }
});
const data = await response.json();

// Expected: Only Tenant A's cohorts
expect(data.cohorts.every(c => c.tenantId === tenantA_id)).toBe(true);
expect(data.cohorts.some(c => c.cohortId === 'B1')).toBe(false);
```

**Pass criteria:** Listing only returns own tenant's cohorts

### Test 1.3: Cross-Tenant Summary Access

**Test:**
```typescript
// Attempt to read Tenant B's outcomes as Tenant A
const response = await fetch('/api/cohorts/B1/outcomes?period=2026-06', {
  headers: { Authorization: `Bearer ${tenantA_jwt}` }
});

expect(response.status).toBe(404);
```

**Pass criteria:** Cannot read other tenant's outcome summaries

### Test 1.4: API Route PK Scoping

**Verification:** Every API route must use `tenantId` from JWT, not from request body.

```typescript
// BAD: Using tenantId from request (spoofable)
const { tenantId, cohortId } = await request.json();
const cohort = await getCohort(tenantId, cohortId);

// GOOD: Using tenantId from JWT (verified)
const { tenantId } = await getAuthenticatedTenant(request);
const { cohortId } = await request.json();
const cohort = await getCohort(tenantId, cohortId);
```

**Pass criteria:** Code review confirms all routes use JWT tenant

---

## 2. Provisioning Round-Trip Tests

### Test 2.1: Create Cohort → DynamoDB

**Steps:**
1. POST `/api/cohorts` with valid payload
2. Query DynamoDB directly for the item

**Test:**
```typescript
const createResponse = await fetch('/api/cohorts', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    district: 'TestDistrict',
    lat: 18.5,
    lon: 73.8,
    crops: ['cotton'],
    languages: ['hi']
  })
});

const { cohortId } = await createResponse.json();

// Direct DynamoDB check
const item = await docClient.send(new GetCommand({
  TableName: TABLE_NAME,
  Key: { PK: `TENANT#${tenantId}`, SK: `COHORT#${cohortId}` }
}));

expect(item.Item).toBeDefined();
expect(item.Item.district).toBe('TestDistrict');
expect(item.Item.status).toBe('draft');
```

**Pass criteria:** Item exists in DynamoDB with correct attributes

### Test 2.2: Cohort Appears in Dashboard

**Steps:**
1. Create cohort via API
2. Fetch `/api/cohorts` list
3. Verify new cohort is in list

**Test:**
```typescript
// ... create cohort ...

const listResponse = await fetch('/api/cohorts', {
  headers: { Authorization: `Bearer ${jwt}` }
});
const { cohorts } = await listResponse.json();

expect(cohorts.some(c => c.cohortId === newCohortId)).toBe(true);
```

**Pass criteria:** New cohort appears in listing

### Test 2.3: Activate Cohort → GSI2 Indexed

**Steps:**
1. Create draft cohort
2. Activate via demo-activate or Stripe
3. Query GSI2 for active cohorts

**Test:**
```typescript
// ... create and activate cohort ...

const activeResponse = await docClient.send(new QueryCommand({
  TableName: TABLE_NAME,
  IndexName: 'GSI2',
  KeyConditionExpression: 'GSI2PK = :pk',
  ExpressionAttributeValues: { ':pk': 'STATUS#active' }
}));

expect(activeResponse.Items.some(i => i.cohortId === activatedCohortId)).toBe(true);
```

**Pass criteria:** Active cohort queryable via GSI2

---

## 3. Aggregation Correctness Tests

### Test 3.1: Nudge Completion Updates Summary

**Setup:**
1. Create and activate a cohort for district "TestDistrict"
2. Create a nudge record for a farmer in "TestDistrict"

**Steps:**
1. Update nudge status from `SENT` to `DONE`
2. Wait for Streams + Lambda processing (~2s)
3. Read the `SUMMARY#` item

**Test:**
```typescript
// Initial summary state
const initialSummary = await getSummary(tenantId, cohortId, '2026-06');
const initialCompleted = initialSummary?.nudgesCompleted || 0;

// Simulate nudge completion
await docClient.send(new UpdateCommand({
  TableName: TABLE_NAME,
  Key: { PK: `USER#919876543210`, SK: `NUDGE#2026-06-20T10:00:00Z#spray` },
  UpdateExpression: 'SET #status = :done',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: { ':done': 'DONE' }
}));

// Wait for aggregation
await sleep(3000);

// Check summary updated
const updatedSummary = await getSummary(tenantId, cohortId, '2026-06');
expect(updatedSummary.nudgesCompleted).toBe(initialCompleted + 1);
```

**Pass criteria:** Summary counter increments on nudge completion

### Test 3.2: Follow-Through Rate Calculation

**Test:**
```typescript
const summary = await getSummary(tenantId, cohortId, '2026-06');

const expectedRate = summary.nudgesCompleted / summary.nudgesSent;
expect(summary.followThroughRate).toBeCloseTo(expectedRate, 2);
```

**Pass criteria:** Rate is correctly computed

### Test 3.3: By-Crop Breakdown

**Test:**
```typescript
const summary = await getSummary(tenantId, cohortId, '2026-06');

expect(summary.byCrop).toBeDefined();
expect(summary.byCrop.cotton).toBeDefined();
expect(summary.byCrop.cotton.nudgesCompleted).toBeGreaterThanOrEqual(0);
```

**Pass criteria:** Crop-level metrics populated

---

## 4. Stripe Webhook Tests

### Test 4.1: Successful Checkout Creates License

**Steps:**
1. Create draft cohort
2. Simulate `checkout.session.completed` webhook

**Test:**
```typescript
const webhookPayload = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_...',
      subscription: 'sub_test_...',
      metadata: { tenantId, cohortId }
    }
  }
};

const signature = stripe.webhooks.generateTestHeaderString({
  payload: JSON.stringify(webhookPayload),
  secret: STRIPE_WEBHOOK_SECRET
});

await fetch('/api/webhooks/stripe', {
  method: 'POST',
  headers: { 'stripe-signature': signature },
  body: JSON.stringify(webhookPayload)
});

// Check license created
const license = await getLicense(tenantId, cohortId);
expect(license).toBeDefined();
expect(license.stripeSubId).toBe('sub_test_...');
expect(license.status).toBe('active');

// Check cohort activated
const cohort = await getCohort(tenantId, cohortId);
expect(cohort.status).toBe('active');
```

**Pass criteria:** License written, cohort activated

### Test 4.2: Invalid Signature Rejected

**Test:**
```typescript
const response = await fetch('/api/webhooks/stripe', {
  method: 'POST',
  headers: { 'stripe-signature': 'invalid' },
  body: JSON.stringify(webhookPayload)
});

expect(response.status).toBe(400);
```

**Pass criteria:** Invalid webhooks rejected

---

## 5. Judge Access Tests

### Test 5.1: Demo Login Works

**Steps:**
1. Navigate to `/login`
2. Enter demo credentials
3. Verify redirect to `/dashboard`

**Manual test checklist:**
- [ ] Demo email: `demo@agrinexus.ai`
- [ ] Demo password: [from submission]
- [ ] Login succeeds
- [ ] Dashboard loads with sample cohort

### Test 5.2: Demo Activate Works

**Steps:**
1. Log in as demo user
2. Navigate to draft cohort
3. Click "Demo Activate"
4. Verify cohort status changes to active

**Test:**
```typescript
const response = await fetch(`/api/cohorts/${cohortId}/demo-activate`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${demoJwt}` }
});

expect(response.ok).toBe(true);

const cohort = await getCohort(demoTenantId, cohortId);
expect(cohort.status).toBe('active');
```

**Pass criteria:** Demo activation works without Stripe

### Test 5.3: Dashboard Load Time

**Test:**
```typescript
const start = Date.now();
const response = await fetch('/dashboard');
const loadTime = Date.now() - start;

expect(loadTime).toBeLessThan(2000); // <2s
```

**Pass criteria:** Dashboard loads under 2 seconds

### Test 5.4: Pre-Seeded Data Visible

**Manual test checklist:**
- [ ] Demo tenant has at least one cohort
- [ ] Cohort has realistic outcome metrics
- [ ] Follow-through rate is displayed
- [ ] Charts/cards render correctly

---

## Test Environment

### Local Testing

```bash
# Run dev server
npm run dev

# Run tests (if using Jest/Vitest)
npm test
```

### Deployed Testing

```bash
# Test against Vercel preview
NEXT_PUBLIC_API_URL=https://your-preview.vercel.app npm test
```

### DynamoDB Test Data

```typescript
// Seed script for test data
async function seedTestData() {
  // Create test tenant
  await createTenant({
    tenantId: 'test-tenant-001',
    name: 'Test NGO',
    type: 'ngo'
  });

  // Create test cohort
  await createCohort('test-tenant-001', {
    district: 'Latur',
    lat: 18.4088,
    lon: 76.5604,
    crops: ['cotton'],
    languages: ['hi']
  });

  // Create test summary with realistic data
  await createSummary('test-tenant-001', 'test-cohort-001', '2026-06', {
    adviceSent: 2500,
    nudgesSent: 1234,
    nudgesCompleted: 963,
    followThroughRate: 0.78,
    byCrop: {
      cotton: {
        nudgesSent: 1234,
        nudgesCompleted: 963,
        followThroughRate: 0.78
      }
    }
  });
}
```

---

## Test Matrix

| Test | Type | Automated | Manual | Priority |
|------|------|-----------|--------|----------|
| Cross-tenant cohort access | Isolation | ✓ | | Critical |
| Cross-tenant listing | Isolation | ✓ | | Critical |
| Cross-tenant summary | Isolation | ✓ | | Critical |
| Create cohort → DynamoDB | Integration | ✓ | | Critical |
| Cohort in dashboard | Integration | ✓ | ✓ | Critical |
| Activate → GSI2 | Integration | ✓ | | High |
| Nudge → Summary update | Streams | ✓ | | High |
| Follow-through rate | Calculation | ✓ | | Medium |
| By-crop breakdown | Calculation | ✓ | | Medium |
| Stripe webhook | Integration | ✓ | | High |
| Invalid signature | Security | ✓ | | Medium |
| Demo login | E2E | | ✓ | Critical |
| Demo activate | E2E | ✓ | ✓ | Critical |
| Dashboard <2s | Performance | ✓ | ✓ | High |
| Pre-seeded data | Visual | | ✓ | High |

---

## Pre-Submission Checklist

- [ ] All critical tests passing
- [ ] Demo credentials working
- [ ] Demo cohort has metrics
- [ ] Dashboard loads <2s
- [ ] Tenant isolation verified
- [ ] Stripe webhook verified (test mode)
- [ ] Demo-activate path working
