/**
 * Cohort Members API Routes
 *
 * POST /api/cohorts/[id]/members - Enroll farmers to cohort
 *
 * Tenant-scoped: verifies cohort belongs to calling tenant before enrollment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError } from '@/lib/api/auth';
import { getCohort, bulkEnrollFarmers } from '@/lib/entities';

interface RouteContext {
  params: Promise<{ id: string }>;
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
