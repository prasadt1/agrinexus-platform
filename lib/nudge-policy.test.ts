import { describe, it, expect } from "vitest";
import { isFavorable, buildNudgePayload } from "./nudge-policy";

const weather = { wind_speed: 12, rain: 0, temperature: 28, humidity: 70 };

describe("isFavorable", () => {
  it("defaults to wind<10 && rain==0 when no sprayConditions", () => {
    expect(isFavorable(weather, undefined)).toBe(false);          // 12 !< 10
    expect(isFavorable({ ...weather, wind_speed: 8 }, undefined)).toBe(true);
  });
  it("honors per-cohort maxWindSpeed", () => {
    expect(isFavorable(weather, { maxWindSpeed: 15, maxHumidity: 85, minTemp: 15, maxTemp: 35 })).toBe(true);
    expect(isFavorable(weather, { maxWindSpeed: 10, maxHumidity: 85, minTemp: 15, maxTemp: 35 })).toBe(false);
  });
  it("rejects when humidity/temp out of band or rain present", () => {
    const c = { maxWindSpeed: 15, maxHumidity: 60, minTemp: 15, maxTemp: 35 };
    expect(isFavorable(weather, c)).toBe(false);                  // humidity 70 > 60
    expect(isFavorable({ ...weather, rain: 1 }, { ...c, maxHumidity: 85 })).toBe(false);
  });
  it("treats maxWindSpeed as inclusive (wind == max is favorable)", () => {
    expect(isFavorable({ wind_speed: 15, rain: 0, temperature: 28, humidity: 70 },
      { maxWindSpeed: 15, maxHumidity: 85, minTemp: 15, maxTemp: 35 })).toBe(true);
  });
});

describe("buildNudgePayload", () => {
  const cohort = {
    tenantId: "demo-tenant-001", cohortId: "01ABC", district: "Latur",
    nudgeRules: { sprayConditions: { maxWindSpeed: 15, maxHumidity: 85, minTemp: 15, maxTemp: 35 }, reminderIntervals: [24, 48, 72] },
  } as any;
  it("emits a versioned payload, mapping reminderIntervals→reminders+expiry", () => {
    const p = buildNudgePayload(cohort, weather);
    expect(p.schemaVersion).toBe(1);
    expect(p.tenantId).toBe("demo-tenant-001");
    expect(p.cohortId).toBe("01ABC");
    expect(p.programId).toBe("default-spray");
    expect(p.activity).toBe("spray");
    expect(p.location).toBe("Latur");
    expect(p.rules.reminderIntervals).toEqual([24, 48]);
    expect(p.rules.expiryHours).toBe(72);
  });
  it("falls back to default cadence when cohort has no reminderIntervals", () => {
    const p = buildNudgePayload({ ...cohort, nudgeRules: {} }, weather);
    expect(p.rules.reminderIntervals).toEqual([24, 48]);
    expect(p.rules.expiryHours).toBe(72);
  });
  it("maps a single reminder interval to that reminder + default expiry", () => {
    const p = buildNudgePayload({ tenantId: "demo-t", cohortId: "01X", district: "Latur",
      nudgeRules: { reminderIntervals: [12] } } as any, { wind_speed: 8, rain: 0 });
    expect(p.rules.reminderIntervals).toEqual([12]);
    expect(p.rules.expiryHours).toBe(72);
  });
});
