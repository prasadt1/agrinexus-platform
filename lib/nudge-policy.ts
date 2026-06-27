import type { NudgeRules } from "@/lib/entities/types";

type Weather = { wind_speed: number; rain: number; temperature?: number; humidity?: number };
type SprayConditions = NonNullable<NudgeRules["sprayConditions"]>;

/** Per-cohort favorable gate. Falls back to the engine's legacy rule when no conditions set. */
export function isFavorable(w: Weather, c?: SprayConditions): boolean {
  if (!c) return w.wind_speed < 10 && w.rain === 0;
  if (w.rain > 0) return false;
  if (w.wind_speed > c.maxWindSpeed) return false;
  if (w.humidity !== undefined && w.humidity > c.maxHumidity) return false;
  if (w.temperature !== undefined && (w.temperature < c.minTemp || w.temperature > c.maxTemp)) return false;
  return true;
}

const DEFAULT_REMINDERS = [24, 48];
const DEFAULT_EXPIRY = 72;

/** Map stored nudgeRules.reminderIntervals ([r1,r2,expiry]) → reminders + expiry. */
function splitCadence(intervals?: number[]): { reminderIntervals: number[]; expiryHours: number } {
  if (!intervals || intervals.length === 0) return { reminderIntervals: DEFAULT_REMINDERS, expiryHours: DEFAULT_EXPIRY };
  if (intervals.length === 1) return { reminderIntervals: intervals, expiryHours: DEFAULT_EXPIRY };
  return { reminderIntervals: intervals.slice(0, -1), expiryHours: intervals[intervals.length - 1] };
}

export function buildNudgePayload(cohort: any, weather: Weather) {
  const rules = cohort.nudgeRules ?? {};
  const cadence = splitCadence(rules.reminderIntervals);
  return {
    schemaVersion: 1 as const,
    tenantId: cohort.tenantId,
    cohortId: cohort.cohortId,
    programId: "default-spray" as const,
    location: cohort.district,
    activity: "spray" as const,
    weather,
    rules: { sprayConditions: rules.sprayConditions, ...cadence },
  };
}
