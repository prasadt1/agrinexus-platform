/**
 * Demo Activation API
 *
 * POST /api/cohorts/[id]/demo-activate - Activate without Stripe (for judges)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError, requireAdmin } from '@/lib/api/auth';
import {
  getCohort,
  activateCohort,
  createDemoLicense,
} from '@/lib/entities';
import { logAuditEvent } from '@/lib/audit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const ctx = await getAuthContext(request);
    requireAdmin(ctx);
    const { tenantId } = ctx;
    const { id: cohortId } = await context.params;

    // Verify cohort exists and belongs to this tenant
    const existing = await getCohort(tenantId, cohortId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    if (existing.status === 'active') {
      return NextResponse.json(
        { error: 'Cohort is already active' },
        { status: 400 }
      );
    }

    // Create demo license (no Stripe)
    const license = await createDemoLicense(tenantId, cohortId, 'growth');

    // Activate the cohort (sets GSI2PK/GSI2SK for WeatherPoller)
    const cohort = await activateCohort(tenantId, cohortId);

    await logAuditEvent({
      tenantId,
      eventType: 'cohort.activated',
      actor: ctx.email || ctx.userId,
      actorRole: ctx.role,
      summary: `Activated ${existing.district} cohort (demo, ${license.plan} plan)`,
      targetType: 'cohort',
      targetId: cohortId,
      district: existing.district,
      metadata: { demo: true, plan: license.plan },
    });

    return NextResponse.json({
      cohortId: cohort.cohortId,
      status: cohort.status,
      activatedAt: cohort.activatedAt,
      license: {
        plan: license.plan,
        isDemo: license.isDemo,
        periodEnd: license.currentPeriodEnd,
      },
      message: 'Cohort activated in demo mode (no billing)',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error demo-activating cohort:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
