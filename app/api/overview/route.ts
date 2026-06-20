/**
 * Overview API Route
 *
 * GET /api/overview - Get aggregated tenant metrics
 *
 * Returns:
 * - Total farmers enrolled across all cohorts
 * - Total nudges sent
 * - Overall response rate
 * - Per-cohort breakdown with latest stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError } from '@/lib/api/auth';
import {
  listCohorts,
  getAllTenantSummaries,
  listCohortMembers,
} from '@/lib/entities';

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getAuthContext(request);

    // Fetch cohorts and summaries in parallel
    const [cohorts, summaries] = await Promise.all([
      listCohorts(tenantId),
      getAllTenantSummaries(tenantId),
    ]);

    // Aggregate metrics across all summaries
    let totalNudgesSent = 0;
    let totalNudgesCompleted = 0;
    let totalNudgesExpired = 0;

    // Group summaries by cohort (latest only)
    const latestByCohort = new Map<string, typeof summaries[0]>();

    for (const summary of summaries) {
      totalNudgesSent += summary.nudgesSent || 0;
      totalNudgesCompleted += summary.nudgesCompleted || 0;
      totalNudgesExpired += summary.nudgesExpired || 0;

      // Keep latest summary per cohort
      const existing = latestByCohort.get(summary.cohortId);
      if (!existing || summary.period > existing.period) {
        latestByCohort.set(summary.cohortId, summary);
      }
    }

    // Calculate overall response rate
    const overallResponseRate =
      totalNudgesSent > 0 ? totalNudgesCompleted / totalNudgesSent : 0;

    // Count total enrolled farmers (parallel queries)
    const memberCounts = await Promise.all(
      cohorts.map(async (c) => {
        const members = await listCohortMembers(c.cohortId);
        return members.length;
      })
    );
    const totalFarmers = memberCounts.reduce((sum, count) => sum + count, 0);

    // Build cohort breakdown with stats
    const cohortBreakdown = cohorts.map((cohort) => {
      const summary = latestByCohort.get(cohort.cohortId);
      return {
        cohortId: cohort.cohortId,
        district: cohort.district,
        status: cohort.status,
        crops: cohort.crops,
        nudgesSent: summary?.nudgesSent || 0,
        nudgesCompleted: summary?.nudgesCompleted || 0,
        responseRate: summary?.followThroughRate || 0,
        lastUpdatedAt: summary?.lastUpdatedAt,
      };
    });

    // Sort by response rate descending (top performers first)
    cohortBreakdown.sort((a, b) => b.responseRate - a.responseRate);

    return NextResponse.json({
      totals: {
        farmers: totalFarmers,
        cohorts: cohorts.length,
        activeCohorts: cohorts.filter((c) => c.status === 'active').length,
        nudgesSent: totalNudgesSent,
        nudgesCompleted: totalNudgesCompleted,
        nudgesExpired: totalNudgesExpired,
        responseRate: overallResponseRate,
      },
      cohorts: cohortBreakdown,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching overview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
