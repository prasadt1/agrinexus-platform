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
 * - listCohortMembers(tenantId, cohortId) - List all members in a cohort (GSI1)
 * - getMemberStats(tenantId, cohortId) - Get members with nudge stats
 */

import {
  docClient,
  TABLE_NAME,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@/lib/dynamo';
import {
  KEY_PREFIXES,
  type CohortMembershipItem,
  type CohortMembership,
  type MemberStats,
} from './types';
import { getCohort } from './cohort';
import { upsertPendingProfile } from './profile';

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
    name: item.name,
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
  phone: string,
  name?: string
): Promise<CohortMembership> {
  const now = new Date().toISOString();
  const normalized = phone.replace(/\s+/g, '').replace(/^\+?/, '');
  const trimmedName = name?.trim();

  const item: CohortMembershipItem = {
    PK: buildPhonePK(phone),
    SK: 'MEMBERSHIP',
    // GSI1: enables "list all members in cohort" queries
    GSI1PK: `COHORT#${cohortId}` as `COHORT#${string}`,
    GSI1SK: `MEMBER#${normalized}` as `MEMBER#${string}`,
    phone: normalized,
    ...(trimmedName ? { name: trimmedName } : {}),
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
  farmers: Array<{ phone: string; name?: string }>
): Promise<{ enrolled: number; phones: string[] }> {
  const results: string[] = [];

  // Look up the cohort once so each enrolled farmer also gets a consent=pending
  // PROFILE seeded from the cohort's district / crop / language. That makes the
  // farmer visible to the delivery engine (GSI1 = LOCATION#) while the engine's
  // consent gate keeps them un-nudged until they opt in over WhatsApp.
  const cohort = await getCohort(tenantId, cohortId);

  for (const { phone, name } of farmers) {
    await enrollFarmer(tenantId, cohortId, phone, name);
    if (cohort) {
      await upsertPendingProfile(phone, cohort);
    }
    const normalized = phone.replace(/\s+/g, '').replace(/^\+?/, '');
    results.push(normalized);
  }

  return {
    enrolled: results.length,
    phones: results,
  };
}

// =============================================================================
// Access Pattern: List Cohort Members
// Query GSI1: GSI1PK = COHORT#<cohortId>, GSI1SK begins_with MEMBER#
// =============================================================================

export async function listCohortMembers(
  cohortId: string
): Promise<CohortMembership[]> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `COHORT#${cohortId}`,
        ':sk': 'MEMBER#',
      },
    })
  );

  if (!response.Items) {
    return [];
  }

  return response.Items.map((item) =>
    toCohortMembership(item as CohortMembershipItem)
  );
}

// =============================================================================
// Access Pattern: Get Member Stats (with nudge activity)
// 1. Query GSI1 for members
// 2. For each member, query USER#<phone>/NUDGE# to count activity
// =============================================================================

export async function getMemberStats(
  cohortId: string
): Promise<MemberStats[]> {
  // Get all members
  const members = await listCohortMembers(cohortId);

  // For each member, query their nudge records
  const stats: MemberStats[] = [];

  for (const member of members) {
    // Query nudge records for this user
    const nudgeResponse = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${member.phone}`,
          ':sk': 'NUDGE#',
        },
        ProjectionExpression: '#s',
        ExpressionAttributeNames: { '#s': 'status' },
      })
    );

    const nudges = nudgeResponse.Items || [];
    let nudgesSent = 0;
    let nudgesCompleted = 0;
    let nudgesExpired = 0;

    for (const nudge of nudges) {
      nudgesSent++;
      const status = nudge.status as string;
      if (status === 'DONE') {
        nudgesCompleted++;
      } else if (status === 'EXPIRED') {
        nudgesExpired++;
      }
    }

    const responseRate = nudgesSent > 0 ? nudgesCompleted / nudgesSent : 0;

    stats.push({
      phone: member.phone,
      name: member.name,
      tenantId: member.tenantId,
      cohortId: member.cohortId,
      enrolledAt: member.enrolledAt,
      nudgesSent,
      nudgesCompleted,
      nudgesExpired,
      responseRate,
    });
  }

  // Sort by response rate descending (most responsive first)
  stats.sort((a, b) => b.responseRate - a.responseRate);

  return stats;
}
