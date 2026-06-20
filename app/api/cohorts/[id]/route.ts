/**
 * Single Cohort API Routes
 *
 * GET /api/cohorts/[id] - Get cohort details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError } from '@/lib/api/auth';
import { getCohort, getLicense, listCohortSummaries } from '@/lib/entities';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// =============================================================================
// GET /api/cohorts/[id] - Get Cohort Details
// =============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await getAuthContext(request);
    const { id: cohortId } = await context.params;

    // Fetch cohort
    const cohort = await getCohort(tenantId, cohortId);

    if (!cohort) {
      // Return 404, not 403, to avoid leaking info about other tenants' cohorts
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Fetch license if exists
    const license = await getLicense(tenantId, cohortId);

    // Fetch outcome summaries
    const summaries = await listCohortSummaries(tenantId, cohortId);

    return NextResponse.json({
      cohort: {
        cohortId: cohort.cohortId,
        district: cohort.district,
        lat: cohort.lat,
        lon: cohort.lon,
        status: cohort.status,
        crops: cohort.crops,
        languages: cohort.languages,
        nudgeRules: cohort.nudgeRules,
        features: cohort.features,
        createdAt: cohort.createdAt,
        activatedAt: cohort.activatedAt,
        updatedAt: cohort.updatedAt,
      },
      license: license
        ? {
            plan: license.plan,
            status: license.status,
            currentPeriodEnd: license.currentPeriodEnd,
            isDemo: license.isDemo,
          }
        : null,
      summaries: summaries.map((s) => ({
        period: s.period,
        adviceSent: s.adviceSent,
        nudgesSent: s.nudgesSent,
        nudgesCompleted: s.nudgesCompleted,
        nudgesExpired: s.nudgesExpired,
        followThroughRate: s.followThroughRate,
        byCrop: s.byCrop,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching cohort:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
