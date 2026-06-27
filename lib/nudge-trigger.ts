/**
 * Shared nudge-trigger helpers: fetch weather for a cohort's district and
 * start the engine's Step Functions nudge workflow with the versioned payload.
 *
 * Used by the demo poller (all active cohorts) and the cohort-scoped re-nudge
 * action (a single cohort). The engine's own `has_open_nudge` gate prevents
 * double-sending to a farmer who already has an open nudge, so a manual
 * re-nudge only reaches farmers who haven't been nudged recently.
 */
import { SFNClient, StartExecutionCommand, DescribeExecutionCommand } from '@aws-sdk/client-sfn';
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider';
import { getWeatherApiKey } from '@/lib/secrets';
import { buildNudgePayload } from '@/lib/nudge-policy';
import type { NudgeRules } from '@/lib/entities/types';

const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5/weather';

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
// The nudge workflow lives in the SAME AWS account as the assumed role. Derive
// the account from AWS_ROLE_ARN (arn:aws:iam::<acct>:role/...) — the AWS_ACCOUNT_ID
// env was set to the wrong account and silently broke StartExecution (the poller
// reported "0 triggered" and the re-nudge endpoint 500'd).
const ACCOUNT_ID =
  process.env.AWS_ROLE_ARN?.split(':')[4] ||
  process.env.AWS_ACCOUNT_ID ||
  '043624892076';
const ENVIRONMENT = process.env.AGRINEXUS_ENV || 'dev';
const STATE_MACHINE_ARN = `arn:aws:states:${AWS_REGION}:${ACCOUNT_ID}:stateMachine:agrinexus-nudge-workflow-${ENVIRONMENT}`;

// Credentials: Vercel OIDC federation on Vercel (keyless), static keys or the
// default chain locally — mirrors lib/dynamo.ts so SFN auth actually works.
const sfnConfig: ConstructorParameters<typeof SFNClient>[0] = { region: AWS_REGION };
if (process.env.AWS_ROLE_ARN) {
  sfnConfig.credentials = awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    audience: 'sts.amazonaws.com',
  });
} else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  sfnConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}
const sfnClient = new SFNClient(sfnConfig);

export interface WeatherData {
  location: string;
  coordinates: { lat: number; lon: number };
  wind_speed: number;
  rain: number;
  temperature: number;
  humidity: number;
  mock: boolean;
}

/** A cohort, reduced to what the nudge payload + weather lookup need. */
export type TriggerableCohort = {
  tenantId: string;
  cohortId: string;
  district: string;
  lat: number;
  lon: number;
  nudgeRules?: NudgeRules;
};

/** Fetch current weather for a district. Falls back to mock conditions when no API key / on error. */
export async function fetchWeather(district: string, lat: number, lon: number): Promise<WeatherData> {
  const apiKey = await getWeatherApiKey();

  const mock = (): WeatherData => ({
    location: district,
    coordinates: { lat, lon },
    wind_speed: 8.5,
    rain: 0,
    temperature: 28,
    humidity: 65,
    mock: true,
  });

  if (!apiKey) {
    console.log(`Weather: No API key, using mock for ${district}`);
    return mock();
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
    if (!response.ok) throw new Error(`OpenWeatherMap returned ${response.status}`);

    const data = await response.json();
    return {
      location: district,
      coordinates: { lat, lon },
      wind_speed: (data.wind?.speed ?? 0) * 3.6,
      rain: data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0,
      temperature: data.main?.temp ?? 0,
      humidity: data.main?.humidity ?? 0,
      mock: false,
    };
  } catch (error) {
    console.error(`Weather API error for ${district}:`, error);
    return mock();
  }
}

/** Start the engine's nudge workflow for one cohort with the versioned payload. */
export async function triggerCohortNudge(
  cohort: TriggerableCohort,
  weather: WeatherData
): Promise<{ executionArn: string }> {
  const command = new StartExecutionCommand({
    stateMachineArn: STATE_MACHINE_ARN,
    input: JSON.stringify(buildNudgePayload(cohort, weather)),
  });
  const response = await sfnClient.send(command);
  return { executionArn: response.executionArn! };
}

export type NudgeRunStatus = 'SUCCEEDED' | 'FAILED' | 'RUNNING' | 'TIMED_OUT' | 'ABORTED' | 'PENDING_REDRIVE';

export interface NudgeRunResult {
  /** Execution status; RUNNING means it hadn't finished within the poll window. */
  status: NudgeRunStatus;
  /** Reminders actually delivered this run. */
  sent: number;
  /** Eligible farmers skipped (already had an open nudge, not yet opted in, etc.). */
  skipped: number;
}

/**
 * Poll a nudge execution to completion (best-effort, short window) and read how
 * many reminders were actually sent vs skipped, so a manual re-nudge can report
 * a truthful outcome instead of a bare "success". The workflow is short (one
 * Lambda + two pass states), so it almost always resolves within the window;
 * if it doesn't, we return RUNNING and the workflow still finishes in the
 * background — the caller just can't show exact counts yet.
 */
export async function pollNudgeResult(
  executionArn: string,
  { timeoutMs = 8000, intervalMs = 700 }: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<NudgeRunResult> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await sfnClient.send(new DescribeExecutionCommand({ executionArn }));
    if (res.status && res.status !== 'RUNNING') {
      let sent = 0;
      let skipped = 0;
      try {
        const out = res.output ? JSON.parse(res.output) : {};
        sent = Number(out.nudges_sent) || 0;
        skipped = Number(out.nudges_skipped) || 0;
      } catch {
        // leave zeros — status still tells the caller it finished
      }
      return { status: res.status as NudgeRunStatus, sent, skipped };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { status: 'RUNNING', sent: 0, skipped: 0 };
}
