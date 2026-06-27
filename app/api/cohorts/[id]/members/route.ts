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
        name: m.name,
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
    // Accept either { farmers: [{ phone, name? }] } (new) or { phones: string[] } (legacy).
    const farmers: Array<{ phone: string; name?: string }> = Array.isArray(body.farmers)
      ? body.farmers
      : Array.isArray(body.phones)
        ? body.phones.map((phone: string) => ({ phone }))
        : [];

    if (farmers.length === 0) {
      return NextResponse.json(
        { error: 'farmers (or phones) array is required' },
        { status: 400 }
      );
    }

    // Validate phone format (basic E.164-ish check — at least 10 digits)
    const invalid = farmers.filter(
      (f) => !f || typeof f.phone !== 'string' || f.phone.replace(/\D/g, '').length < 10
    );
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid phone numbers: ${invalid.map((f) => f?.phone ?? '(empty)').join(', ')}` },
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
    const result = await bulkEnrollFarmers(tenantId, cohortId, farmers);

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
