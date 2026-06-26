/**
 * Smoke tests for H0 submission checklist.
 * Run: npm run test:smoke
 *
 * Requires dev server OR set SMOKE_BASE_URL (default http://localhost:3000)
 */

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

async function fetchJson(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, init);
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { res, json };
}

async function main() {
  const failures: string[] = [];

  console.log(`Smoke tests against ${BASE}\n`);

  // Healthcheck
  const health = await fetchJson('/api/healthcheck');
  if (!health.res.ok) {
    failures.push(`healthcheck: ${health.res.status}`);
  } else {
    console.log('✓ /api/healthcheck');
  }

  // Tenant isolation via header (no session in script)
  const tenantA = await fetchJson('/api/cohorts', {
    headers: { 'X-Tenant-ID': 'demo-tenant-001' },
  });
  const tenantB = await fetchJson('/api/cohorts', {
    headers: { 'X-Tenant-ID': 'demo-tenant-002' },
  });

  if (!tenantA.res.ok || !tenantB.res.ok) {
    failures.push('cohorts list failed for demo tenants');
  } else {
    const aIds = new Set(
      (tenantA.json as { cohorts: { cohortId: string }[] }).cohorts?.map((c) => c.cohortId) || []
    );
    const bIds = new Set(
      (tenantB.json as { cohorts: { cohortId: string }[] }).cohorts?.map((c) => c.cohortId) || []
    );
    const overlap = [...aIds].filter((id) => bIds.has(id));
    if (overlap.length > 0) {
      failures.push(`tenant isolation breach: shared cohort ids ${overlap.join(', ')}`);
    } else {
      console.log('✓ tenant isolation (distinct cohort sets per tenant)');
    }
  }

  // Overview aggregates
  const overview = await fetchJson('/api/overview', {
    headers: { 'X-Tenant-ID': 'demo-tenant-001' },
  });
  if (overview.res.ok) {
    console.log('✓ /api/overview');
  } else {
    failures.push(`overview: ${overview.res.status}`);
  }

  // Billing
  const billing = await fetchJson('/api/billing', {
    headers: { 'X-Tenant-ID': 'demo-tenant-001' },
  });
  if (billing.res.ok) {
    console.log('✓ /api/billing');
  } else {
    failures.push(`billing: ${billing.res.status}`);
  }

  // Public pages
  const landing = await fetch(`${BASE}/`);
  if (landing.ok) console.log('✓ landing page');
  else failures.push(`landing: ${landing.status}`);

  const login = await fetch(`${BASE}/login`);
  if (login.ok) console.log('✓ login page');
  else failures.push(`login: ${login.status}`);

  if (failures.length) {
    console.error('\nFailures:');
    failures.forEach((f) => console.error(`  ✗ ${f}`));
    process.exit(1);
  }

  console.log('\nAll smoke tests passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
