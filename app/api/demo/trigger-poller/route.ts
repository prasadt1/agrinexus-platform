/**
 * Demo Trigger Poller API
 *
 * POST /api/demo/trigger-poller
 *
 * Isolated poller that reads active cohorts from the platform and triggers
 * the nudge workflow. This does NOT touch the production WeatherPoller.
 *
 * Flow:
 * 1. Query GSI2 for STATUS#active cohorts
 * 2. Fetch weather for each cohort's coordinates
 * 3. If conditions are favorable (per-cohort rules), trigger the nudge workflow
 *
 * Safety:
 * - Production WeatherPoller remains untouched (different code, different trigger)
 * - Uses same NudgeSender Lambda via Step Functions (battle-tested delivery)
 * - On-demand only (no cron schedule)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError } from '@/lib/api/auth';
import { listActiveCohorts, type ActiveCohortProjection } from '@/lib/entities';
import { logAuditEvent } from '@/lib/audit';
import { isFavorable } from '@/lib/nudge-policy';
import { fetchWeather, triggerCohortNudge, type WeatherData } from '@/lib/nudge-trigger';

// Weather lookup + Step Functions nudge trigger live in lib/nudge-trigger.ts
// (shared with the cohort-scoped re-nudge action).

export async function POST(request: NextRequest) {
  try {
    // Require authentication (demo tenant only for safety)
    const ctx = await getAuthContext(request);
    const { tenantId } = ctx;

    // Optional: restrict to demo tenants only
    if (!tenantId.startsWith('demo-')) {
      return NextResponse.json(
        { error: 'Demo trigger only available for demo tenants' },
        { status: 403 }
      );
    }

    // Get all active cohorts from the platform
    const cohorts = await listActiveCohorts();

    if (cohorts.length === 0) {
      return NextResponse.json({
        message: 'No active cohorts to process',
        cohorts_checked: 0,
        nudges_triggered: 0,
      });
    }

    const results: Array<{
      cohortId: string;
      district: string;
      tenantId: string;
      weather: WeatherData;
      triggered: boolean;
      executionArn?: string;
    }> = [];

    // Process each active cohort
    for (const cohort of cohorts) {
      // Fetch weather for this cohort's location
      const weather = await fetchWeather(
        cohort.district,
        cohort.lat,
        cohort.lon
      );

      let triggered = false;
      let executionArn: string | undefined;

      if (isFavorable(weather, cohort.nudgeRules?.sprayConditions)) {
        try {
          const result = await triggerCohortNudge(cohort, weather);
          triggered = true;
          executionArn = result.executionArn;
          console.log(
            `Triggered nudge for ${cohort.district} (cohort ${cohort.cohortId}): ${executionArn}`
          );
        } catch (error) {
          console.error(
            `Failed to trigger nudge for ${cohort.district}:`,
            error
          );
        }
      } else {
        console.log(
          `Weather not favorable for ${cohort.district}: wind=${weather.wind_speed}km/h, rain=${weather.rain}mm`
        );
      }

      results.push({
        cohortId: cohort.cohortId,
        district: cohort.district,
        tenantId: cohort.tenantId,
        weather,
        triggered,
        executionArn,
      });
    }

    const triggered = results.filter((r) => r.triggered);

    await logAuditEvent({
      tenantId,
      eventType: 'cycle.run',
      actor: ctx.email || ctx.userId,
      actorRole: ctx.role,
      summary: `Ran advisory cycle — ${triggered.length} nudge(s) triggered across ${cohorts.length} active cohort(s)`,
      targetType: 'cycle',
      metadata: {
        cohortsChecked: cohorts.length,
        nudgesTriggered: triggered.length,
        districts: triggered.map((r) => r.district),
      },
    });

    return NextResponse.json({
      message: `Processed ${cohorts.length} active cohort(s)`,
      cohorts_checked: cohorts.length,
      nudges_triggered: triggered.length,
      results,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error in demo trigger-poller:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
