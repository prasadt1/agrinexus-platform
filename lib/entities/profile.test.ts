import { describe, it, expect } from 'vitest';
import { buildPendingProfileItem, normalizeConsent } from './profile';

const cohort = {
  district: 'Latur',
  lat: 18.4,
  lon: 76.6,
  crops: ['cotton', 'soybean'],
  languages: ['mr', 'hi'],
};

describe('buildPendingProfileItem', () => {
  it('seeds a consent=pending profile the engine can find by district', () => {
    const p = buildPendingProfileItem('+91 98180 00012', cohort, '2026-06-26T00:00:00.000Z');

    expect(p.PK).toBe('USER#919818000012'); // phone normalized (spaces + leading + removed)
    expect(p.SK).toBe('PROFILE');
    expect(p.consent).toBe('pending');
    expect(p.consentSource).toBe('partner');
    expect(p.onboarding_complete).toBe(false);
    expect(p.onboarding_state).toBe('consent'); // engine jumps straight to the consent step
    // The engine's NudgeSender selects recipients by GSI1 = LOCATION#<district>:
    expect(p.GSI1PK).toBe('LOCATION#Latur');
    expect(p.GSI1SK).toBe('CROP#cotton'); // first crop
    expect(p.dialect).toBe('mr'); // first language
    expect(p.location_coords).toEqual([18.4, 76.6]);
  });

  it('falls back to sensible defaults when the cohort has no crops/languages', () => {
    const p = buildPendingProfileItem('919999', { ...cohort, crops: [], languages: [] }, 'now');
    expect(p.crop).toBe('cotton');
    expect(p.dialect).toBe('hi');
    expect(p.GSI1SK).toBe('CROP#cotton');
  });
});

describe('normalizeConsent (no migration: legacy boolean coexists with the new states)', () => {
  it('treats legacy boolean true as granted', () => {
    expect(normalizeConsent(true)).toBe('granted');
  });
  it('passes the new string states through', () => {
    expect(normalizeConsent('granted')).toBe('granted');
    expect(normalizeConsent('declined')).toBe('declined');
  });
  it('defaults everything else (false / undefined / pending) to pending', () => {
    expect(normalizeConsent(false)).toBe('pending');
    expect(normalizeConsent(undefined)).toBe('pending');
    expect(normalizeConsent('pending')).toBe('pending');
  });
});
