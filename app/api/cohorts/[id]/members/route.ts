/**
 * Cohort Members API Routes
 *
 * GET  /api/cohorts/[id]/members - List members with stats
 * POST /api/cohorts/[id]/members - Enroll farmers to cohort
 *
 * Tenant-scoped: verifies cohort belongs to calling tenant.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError } from '@/lib/api/auth';
import { getCohort, bulkEnrollFarmers, getMemberStats } from '@/lib/entities';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// =============================================================================
// GET /api/cohorts/[id]/members - List Members with Stats
// =============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await getAuthContext(request);
    const { id: cohortId } = await context.params;

    // Verify cohort belongs to this tenant
    const cohort = await getCohort(tenantId, cohortId);
    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Get member stats
    const members = await getMemberStats(cohortId);

    return NextResponse.json({
      cohortId,
      memberCount: members.length,
      members: members.map((m) => ({
        phone: m.phone,
        enrolledAt: m.enrolledAt,
        nudgesSent: m.nudgesSent,
        nudgesCompleted: m.nudgesCompleted,
        nudgesExpired: m.nudgesExpired,
        responseRate: m.responseRate,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/cohorts/[id]/members - Enroll Farmers
// =============================================================================

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await getAuthContext(request);
    const { id: cohortId } = await context.params;

    // Parse request body
    const body = await request.json();
    const phones: string[] = body.phones;

    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json(
        { error: 'phones array is required' },
        { status: 400 }
      );
    }

    // Validate phone format (basic E.164-ish check)
    const invalidPhones = phones.filter(
      (p) => typeof p !== 'string' || p.length < 10
    );
    if (invalidPhones.length > 0) {
      return NextResponse.json(
        { error: `Invalid phone numbers: ${invalidPhones.join(', ')}` },
        { status: 400 }
      );
    }

    // CRITICAL: Verify cohort belongs to this tenant
    const cohort = await getCohort(tenantId, cohortId);
    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Enroll farmers
    const result = await bulkEnrollFarmers(tenantId, cohortId, phones);

    return NextResponse.json({
      message: `Enrolled ${result.enrolled} farmers to cohort ${cohortId}`,
      enrolled: result.enrolled,
      phones: result.phones,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error enrolling farmers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
