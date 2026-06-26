import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError } from '@/lib/api/auth';
import { listTenantLicenses, listCohorts } from '@/lib/entities';

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getAuthContext(request);

    const [licenses, cohorts] = await Promise.all([
      listTenantLicenses(tenantId),
      listCohorts(tenantId),
    ]);

    const cohortMap = new Map(cohorts.map((c) => [c.cohortId, c]));

    const items = licenses.map((license) => {
      const cohort = cohortMap.get(license.cohortId);
      return {
        cohortId: license.cohortId,
        district: cohort?.district || '—',
        status: cohort?.status || 'unknown',
        plan: license.plan,
        licenseStatus: license.status,
        periodEnd: license.currentPeriodEnd,
        isDemo: license.isDemo ?? false,
      };
    });

    return NextResponse.json({ licenses: items, count: items.length });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error fetching billing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
