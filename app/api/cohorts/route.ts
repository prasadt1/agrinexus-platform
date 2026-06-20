/**
 * Cohort API Routes
 *
 * POST /api/cohorts - Create a new cohort (draft status)
 * GET /api/cohorts - List all cohorts for the authenticated tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { ulid } from 'ulid';
import { getAuthContext, AuthError } from '@/lib/api/auth';
import { createCohortSchema, validateBody } from '@/lib/api/validation';
import {
  createCohort,
  listCohorts,
  getLatestCohortSummary,
  type NudgeRules,
} from '@/lib/entities';

// =============================================================================
// POST /api/cohorts - Create Cohort
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate and get tenant context
    const { tenantId } = await getAuthContext(request);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateBody(createCohortSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error,
          details: validation.details,
        },
        { status: 400 }
      );
    }

    const input = validation.data;

    // Generate cohort ID
    const cohortId = ulid();

    // Default nudge rules if not provided
    const nudgeRules: NudgeRules = input.nudgeRules ?? {
      sprayConditions: {
        maxWindSpeed: 15,
        maxHumidity: 85,
        minTemp: 15,
        maxTemp: 35,
      },
      reminderIntervals: [24, 48, 72],
    };

    // Create the cohort
    const cohort = await createCohort(tenantId, {
      cohortId,
      district: input.district,
      lat: input.lat,
      lon: input.lon,
      crops: input.crops,
      languages: input.languages,
      nudgeRules,
      features: input.features,
    });

    return NextResponse.json(
      {
        cohortId: cohort.cohortId,
        status: cohort.status,
        district: cohort.district,
        createdAt: cohort.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error creating cohort:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/cohorts - List Cohorts
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate and get tenant context
    const { tenantId } = await getAuthContext(request);

    // Fetch cohorts
    const cohorts = await listCohorts(tenantId);

    // Optionally filter by status
    const statusFilter = request.nextUrl.searchParams.get('status');
    const filteredCohorts = statusFilter
      ? cohorts.filter((c) => c.status === statusFilter)
      : cohorts;

    // Fetch latest summary for each cohort (for dashboard display)
    const cohortsWithOutcomes = await Promise.all(
      filteredCohorts.map(async (cohort) => {
        const summary = await getLatestCohortSummary(tenantId, cohort.cohortId);

        return {
          cohortId: cohort.cohortId,
          district: cohort.district,
          status: cohort.status,
          crops: cohort.crops,
          languages: cohort.languages,
          createdAt: cohort.createdAt,
          activatedAt: cohort.activatedAt,
          // Include outcome summary if available
          outcomes: summary
            ? {
                period: summary.period,
                followThroughRate: summary.followThroughRate,
                nudgesSent: summary.nudgesSent,
                nudgesCompleted: summary.nudgesCompleted,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      cohorts: cohortsWithOutcomes,
      count: cohortsWithOutcomes.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error listing cohorts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
