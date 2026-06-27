/**
 * Cohort Re-nudge API
 *
 * POST /api/cohorts/[id]/nudge - Manually send a nudge to one cohort.
 *
 * The "act" half of the control plane: when a cohort is underperforming or
 * silent, an admin re-nudges it. Tenant-scoped + admin-gated + audited. The
 * engine's own open-nudge gate prevents double-sending to farmers who already
 * have an open nudge, so this reaches the ones who haven't acted.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError, requireAdmin } from '@/lib/api/auth';
import { getCohort } from '@/lib/entities';
import { logAuditEvent } from '@/lib/audit';
import { fetchWeather, triggerCohortNudge } from '@/lib/nudge-trigger';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const ctx = await getAuthContext(request);
    requireAdmin(ctx);
    const { tenantId } = ctx;
    const { id: cohortId } = await context.params;

    // Tenant-scoped: the cohort must belong to the caller's tenant.
    const cohort = await getCohort(tenantId, cohortId);
    if (!cohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }
    if (cohort.status !== 'active') {
      return NextResponse.json(
        { error: 'Activate the cohort before sending nudges.' },
        { status: 400 }
      );
    }

    const weather = await fetchWeather(cohort.district, cohort.lat, cohort.lon);
    const { executionArn } = await triggerCohortNudge(cohort, weather);

    await logAuditEvent({
      tenantId,
      eventType: 'cohort.renudged',
      actor: ctx.email || ctx.userId,
      actorRole: ctx.role,
      summary: `Re-nudged the ${cohort.district} cohort`,
      targetType: 'cohort',
      targetId: cohortId,
      district: cohort.district,
      metadata: { executionArn, weatherMock: weather.mock },
    });

    return NextResponse.json({
      message: `Nudge sent to the ${cohort.district} cohort`,
      executionArn,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error re-nudging cohort:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
