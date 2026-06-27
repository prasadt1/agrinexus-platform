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
import { getWeatherApiKey } from '@/lib/secrets';
import { isFavorable, buildNudgePayload } from '@/lib/nudge-policy';
import {
  SFNClient,
  StartExecutionCommand,
} from '@aws-sdk/client-sfn';

// Weather API configuration
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5/weather';

// Step Functions configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID || '043624892076';
const ENVIRONMENT = process.env.AGRINEXUS_ENV || 'dev';
const STATE_MACHINE_ARN = `arn:aws:states:${AWS_REGION}:${AWS_ACCOUNT_ID}:stateMachine:agrinexus-nudge-workflow-${ENVIRONMENT}`;

// Initialize Step Functions client
const sfnClient = new SFNClient({ region: AWS_REGION });

interface WeatherData {
  location: string;
  coordinates: { lat: number; lon: number };
  wind_speed: number;
  rain: number;
  temperature: number;
  humidity: number;
  mock: boolean;
}

/**
 * Fetch weather from OpenWeatherMap API
 */
async function fetchWeather(
  district: string,
  lat: number,
  lon: number
): Promise<WeatherData> {
  const apiKey = await getWeatherApiKey();

  // If no API key, return mock conditions
  if (!apiKey) {
    console.log(`Weather: No API key, using mock for ${district}`);
    return {
      location: district,
      coordinates: { lat, lon },
      wind_speed: 8.5,
      rain: 0,
      temperature: 28,
      humidity: 65,
      mock: true,
    };
  }

  try {
    const url = new URL(WEATHER_API_BASE);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lon.toString());
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', 'metric');

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`OpenWeatherMap returned ${response.status}`);
    }

    const data = await response.json();

    const wind_mps = data.wind?.speed ?? 0;
    const wind_kmh = wind_mps * 3.6;
    const rain = data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0;
    const temperature = data.main?.temp ?? 0;
    const humidity = data.main?.humidity ?? 0;

    return {
      location: district,
      coordinates: { lat, lon },
      wind_speed: wind_kmh,
      rain,
      temperature,
      humidity,
      mock: false,
    };
  } catch (error) {
    console.error(`Weather API error for ${district}:`, error);
    // Fallback to mock on error
    return {
      location: district,
      coordinates: { lat, lon },
      wind_speed: 8.5,
      rain: 0,
      temperature: 28,
      humidity: 65,
      mock: true,
    };
  }
}

/**
 * Trigger the nudge workflow via Step Functions
 */
async function triggerNudgeWorkflow(
  cohort: ActiveCohortProjection,
  weather: WeatherData
): Promise<{ executionArn: string }> {
  const input = JSON.stringify(buildNudgePayload(cohort, weather));

  const command = new StartExecutionCommand({
    stateMachineArn: STATE_MACHINE_ARN,
    input,
  });

  const response = await sfnClient.send(command);

  return { executionArn: response.executionArn! };
}

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
          const result = await triggerNudgeWorkflow(cohort, weather);
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
