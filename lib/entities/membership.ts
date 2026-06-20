/**
 * Cohort Membership Entity - Access Pattern Functions
 *
 * Maps phone numbers to cohorts for outcome attribution.
 * Written by the platform during enrollment, read by the Streams aggregator.
 *
 * Access patterns:
 * - enrollFarmer(tenantId, cohortId, phone) - Create membership
 * - getMembership(phone) - Lookup cohort by phone (for aggregator)
 * - bulkEnrollFarmers(tenantId, cohortId, phones) - Batch enrollment
 */

import {
  docClient,
  TABLE_NAME,
  GetCommand,
  PutCommand,
} from '@/lib/dynamo';
import {
  KEY_PREFIXES,
  type CohortMembershipItem,
  type CohortMembership,
} from './types';

// =============================================================================
// Key Builders
// =============================================================================

function buildPhonePK(phone: string): `PHONE#${string}` {
  // Normalize phone: remove spaces, ensure no duplicate +
  const normalized = phone.replace(/\s+/g, '').replace(/^\+?/, '');
  return `${KEY_PREFIXES.PHONE}${normalized}` as `PHONE#${string}`;
}

// =============================================================================
// Transformers
// =============================================================================

function toCohortMembership(item: CohortMembershipItem): CohortMembership {
  return {
    phone: item.phone,
    tenantId: item.tenantId,
    cohortId: item.cohortId,
    enrolledAt: item.enrolledAt,
  };
}

// =============================================================================
// Access Pattern: Enroll Farmer to Cohort
// PutItem: PK = PHONE#<phone>, SK = MEMBERSHIP
// =============================================================================

export async function enrollFarmer(
  tenantId: string,
  cohortId: string,
  phone: string
): Promise<CohortMembership> {
  const now = new Date().toISOString();
  const normalized = phone.replace(/\s+/g, '').replace(/^\+?/, '');

  const item: CohortMembershipItem = {
    PK: buildPhonePK(phone),
    SK: 'MEMBERSHIP',
    phone: normalized,
    tenantId,
    cohortId,
    enrolledAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return toCohortMembership(item);
}

// =============================================================================
// Access Pattern: Get Membership by Phone
// GetItem: PK = PHONE#<phone>, SK = MEMBERSHIP
// Used by Streams aggregator to attribute nudges to cohorts
// =============================================================================

export async function getMembership(
  phone: string
): Promise<CohortMembership | null> {
  const response = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildPhonePK(phone),
        SK: 'MEMBERSHIP',
      },
    })
  );

  if (!response.Item) {
    return null;
  }

  return toCohortMembership(response.Item as CohortMembershipItem);
}

// =============================================================================
// Access Pattern: Bulk Enroll Farmers
// BatchWriteItem would be more efficient, but PutItem loop is simpler for demo
// =============================================================================

export async function bulkEnrollFarmers(
  tenantId: string,
  cohortId: string,
  phones: string[]
): Promise<{ enrolled: number; phones: string[] }> {
  const results: string[] = [];

  for (const phone of phones) {
    await enrollFarmer(tenantId, cohortId, phone);
    const normalized = phone.replace(/\s+/g, '').replace(/^\+?/, '');
    results.push(normalized);
  }

  return {
    enrolled: results.length,
    phones: results,
  };
}
