/**
 * Cohort Activation API
 *
 * POST /api/cohorts/[id]/activate - Activate a cohort (sets GSI2 keys for WeatherPoller)
 * POST /api/cohorts/[id]/demo-activate - Demo activation (bypasses Stripe for judges)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError } from '@/lib/api/auth';
import {
  getCohort,
  activateCohort,
  createDemoLicense,
} from '@/lib/entities';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// =============================================================================
// POST /api/cohorts/[id]/activate - Activate Cohort
// =============================================================================

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await getAuthContext(request);
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

    // Check for demo-activate path (for judges)
    const url = new URL(request.url);
    const isDemo = url.pathname.endsWith('/demo-activate');

    if (isDemo) {
      // Create demo license and activate
      await createDemoLicense(tenantId, cohortId, 'growth');
    }
    // TODO: For real activation, verify Stripe payment first

    // Activate the cohort (sets GSI2PK/GSI2SK for WeatherPoller)
    const cohort = await activateCohort(tenantId, cohortId);

    return NextResponse.json({
      cohortId: cohort.cohortId,
      status: cohort.status,
      activatedAt: cohort.activatedAt,
      message: isDemo
        ? 'Cohort activated (demo mode)'
        : 'Cohort activated',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error activating cohort:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
