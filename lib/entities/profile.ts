/**
 * Farmer Profile entity (USER#<phone> / PROFILE).
 *
 * The PROFILE row is owned by the AgriNexus delivery engine (written during
 * WhatsApp onboarding). On partner enrollment the platform PRE-SEEDS a
 * consent=pending profile so the engine can find the farmer by district
 * (GSI1 = LOCATION#<district>) — but the engine's consent gate keeps them
 * un-nudged until they opt in over WhatsApp (consent -> granted).
 *
 * Spec: docs/superpowers/specs/2026-06-26-close-the-loop-consent-design.md
 */

import { docClient, TABLE_NAME, PutCommand } from '@/lib/dynamo';
import type { ConsentState, FarmerProfileItem, Cohort } from './types';

function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/^\+?/, '');
}

/**
 * Normalize the consent value read from a profile. The engine historically
 * stored consent as a boolean; treat legacy `true` as granted so we never need
 * a data migration.
 */
export function normalizeConsent(value: unknown): ConsentState {
  if (value === true || value === 'granted') return 'granted';
  if (value === 'declined') return 'declined';
  return 'pending';
}

type CohortSeed = Pick<Cohort, 'district' | 'lat' | 'lon' | 'crops' | 'languages'>;

/**
 * Build the consent=pending PROFILE item for a partner-enrolled farmer, seeded
 * from the cohort. Pure (no I/O) so it is trivially unit-testable.
 */
export function buildPendingProfileItem(
  phone: string,
  cohort: CohortSeed,
  now: string
): FarmerProfileItem {
  const normalized = normalizePhone(phone);
  const dialect = cohort.languages[0] ?? 'hi';
  const crop = cohort.crops[0] ?? 'cotton';
  return {
    PK: `USER#${normalized}` as `USER#${string}`,
    SK: 'PROFILE',
    phone_number: normalized,
    dialect,
    location: cohort.district,
    location_coords: [cohort.lat, cohort.lon],
    crop,
    consent: 'pending',
    consentSource: 'partner',
    onboarding_complete: false,
    // The engine prompts for consent (then reads the YES) when it sees this state,
    // so a partner-enrolled farmer's first "Hi" isn't mistaken for a consent answer.
    onboarding_state: 'pending_consent',
    created_at: now,
    demo_tier: 'public',
    GSI1PK: `LOCATION#${cohort.district}` as `LOCATION#${string}`,
    GSI1SK: `CROP#${crop}` as `CROP#${string}`,
  };
}

/**
 * Upsert a pending PROFILE only if one does not already exist — never clobber an
 * existing (especially consent=granted) profile. Returns whether it was created.
 */
export async function upsertPendingProfile(
  phone: string,
  cohort: CohortSeed
): Promise<'created' | 'exists'> {
  const item = buildPendingProfileItem(phone, cohort, new Date().toISOString());
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: 'attribute_not_exists(PK)',
      })
    );
    return 'created';
  } catch (err) {
    if ((err as { name?: string }).name === 'ConditionalCheckFailedException') {
      return 'exists';
    }
    throw err;
  }
}
