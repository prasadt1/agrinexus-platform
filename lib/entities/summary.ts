/**
 * Outcome Summary Entity - Access Pattern Functions
 *
 * Summaries are materialized views updated by the SummaryAggregator Lambda.
 * The control plane only reads them; writes come from Streams processing.
 *
 * Access patterns:
 * - getCohortSummary(tenantId, cohortId, period) - Get single period summary
 * - listCohortSummaries(tenantId, cohortId) - List all periods for a cohort
 * - getLatestCohortSummary(tenantId, cohortId) - Get most recent period
 */

import {
  docClient,
  TABLE_NAME,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@/lib/dynamo';
import {
  KEY_PREFIXES,
  type OutcomeSummaryItem,
  type OutcomeSummary,
} from './types';

// =============================================================================
// Key Builders
// =============================================================================

function buildTenantPK(tenantId: string): `TENANT#${string}` {
  return `${KEY_PREFIXES.TENANT}${tenantId}` as `TENANT#${string}`;
}

function buildSummarySK(
  cohortId: string,
  period: string
): `SUMMARY#${string}#${string}` {
  return `${KEY_PREFIXES.SUMMARY}${cohortId}#${period}` as `SUMMARY#${string}#${string}`;
}

function buildSummaryPrefix(cohortId: string): string {
  return `${KEY_PREFIXES.SUMMARY}${cohortId}#`;
}

// =============================================================================
// Transformers
// =============================================================================

function toOutcomeSummary(item: OutcomeSummaryItem): OutcomeSummary {
  return {
    cohortId: item.cohortId,
    period: item.period,
    adviceSent: item.adviceSent || 0,
    nudgesSent: item.nudgesSent || 0,
    nudgesCompleted: item.nudgesCompleted || 0,
    nudgesExpired: item.nudgesExpired || 0,
    followThroughRate: item.followThroughRate || 0,
    byCrop: item.byCrop || {},
    lastUpdatedAt: item.lastUpdatedAt,
  };
}

// =============================================================================
// Access Pattern: Get Cohort Summary for Period
// GetItem: PK = TENANT#<tenantId>, SK = SUMMARY#<cohortId>#<period>
// =============================================================================

export async function getCohortSummary(
  tenantId: string,
  cohortId: string,
  period: string
): Promise<OutcomeSummary | null> {
  const response = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPK(tenantId),
        SK: buildSummarySK(cohortId, period),
      },
    })
  );

  if (!response.Item) {
    return null;
  }

  return toOutcomeSummary(response.Item as OutcomeSummaryItem);
}

// =============================================================================
// Access Pattern: List All Summaries for Cohort
// Query: PK = TENANT#<tenantId> AND begins_with(SK, 'SUMMARY#<cohortId>#')
// Returns in chronological order (SK is sortable)
// =============================================================================

export async function listCohortSummaries(
  tenantId: string,
  cohortId: string
): Promise<OutcomeSummary[]> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': buildTenantPK(tenantId),
        ':sk': buildSummaryPrefix(cohortId),
      },
      ScanIndexForward: true, // Ascending order by period
    })
  );

  const items = (response.Items || []) as OutcomeSummaryItem[];
  return items.map(toOutcomeSummary);
}

// =============================================================================
// Access Pattern: Get Latest Summary for Cohort
// Query with ScanIndexForward=false, Limit=1
// =============================================================================

export async function getLatestCohortSummary(
  tenantId: string,
  cohortId: string
): Promise<OutcomeSummary | null> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': buildTenantPK(tenantId),
        ':sk': buildSummaryPrefix(cohortId),
      },
      ScanIndexForward: false, // Descending order
      Limit: 1,
    })
  );

  if (!response.Items || response.Items.length === 0) {
    return null;
  }

  return toOutcomeSummary(response.Items[0] as OutcomeSummaryItem);
}

// =============================================================================
// Utility: Get Current Period String
// Format: "YYYY-MM" for monthly aggregation
// =============================================================================

export function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// =============================================================================
// Access Pattern: Get Summaries for Dashboard
// Batch get latest summary for multiple cohorts
// =============================================================================

export async function getDashboardSummaries(
  tenantId: string,
  cohortIds: string[]
): Promise<Map<string, OutcomeSummary | null>> {
  const results = new Map<string, OutcomeSummary | null>();

  // Fetch in parallel
  const promises = cohortIds.map(async (cohortId) => {
    const summary = await getLatestCohortSummary(tenantId, cohortId);
    results.set(cohortId, summary);
  });

  await Promise.all(promises);
  return results;
}

// =============================================================================
// Access Pattern: Get All Tenant Summaries (for Overview aggregation)
// Query: PK = TENANT#<tenantId> AND begins_with(SK, 'SUMMARY#')
// =============================================================================

export async function getAllTenantSummaries(
  tenantId: string
): Promise<OutcomeSummary[]> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': buildTenantPK(tenantId),
        ':sk': KEY_PREFIXES.SUMMARY,
      },
    })
  );

  const items = (response.Items || []) as OutcomeSummaryItem[];
  return items.map(toOutcomeSummary);
}

// =============================================================================
// Access Pattern: Upsert Cohort Summary (Atomic Counters)
// UpdateItem with ADD — atomic, but NOT idempotent on its own: a replayed event
// would double-count. Callers must dedupe (the OutcomesAggregator Lambda guards
// each stream event via a DEDUPE#<eventID> marker before incrementing). This
// entity helper is retained for reuse; the Lambda uses its own inline copy.
// =============================================================================

export type SummaryIncrement = {
  nudgesSent?: number;
  nudgesCompleted?: number;
  nudgesExpired?: number;
  adviceSent?: number;
};

export async function upsertCohortSummary(
  tenantId: string,
  cohortId: string,
  period: string,
  increments: SummaryIncrement
): Promise<void> {
  const now = new Date().toISOString();

  // Build SET and ADD expressions dynamically
  const updateParts: string[] = [];
  const addParts: string[] = [];
  const exprAttrNames: Record<string, string> = {};
  const exprAttrValues: Record<string, unknown> = {};

  // Always set metadata
  updateParts.push('tenantId = :tenantId');
  updateParts.push('cohortId = :cohortId');
  updateParts.push('#period = :period');
  updateParts.push('lastUpdatedAt = :now');

  exprAttrNames['#period'] = 'period';
  exprAttrValues[':tenantId'] = tenantId;
  exprAttrValues[':cohortId'] = cohortId;
  exprAttrValues[':period'] = period;
  exprAttrValues[':now'] = now;

  // Add counter increments
  if (increments.nudgesSent) {
    addParts.push('nudgesSent :nudgesSent');
    exprAttrValues[':nudgesSent'] = increments.nudgesSent;
  }
  if (increments.nudgesCompleted) {
    addParts.push('nudgesCompleted :nudgesCompleted');
    exprAttrValues[':nudgesCompleted'] = increments.nudgesCompleted;
  }
  if (increments.nudgesExpired) {
    addParts.push('nudgesExpired :nudgesExpired');
    exprAttrValues[':nudgesExpired'] = increments.nudgesExpired;
  }
  if (increments.adviceSent) {
    addParts.push('adviceSent :adviceSent');
    exprAttrValues[':adviceSent'] = increments.adviceSent;
  }

  // Build final expression
  let updateExpression = 'SET ' + updateParts.join(', ');
  if (addParts.length > 0) {
    updateExpression += ' ADD ' + addParts.join(', ');
  }

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPK(tenantId),
        SK: buildSummarySK(cohortId, period),
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
    })
  );
}

// =============================================================================
// Access Pattern: Recalculate Follow-Through Rate
// Called after incrementing counters to update the derived rate
// =============================================================================

export async function recalculateFollowThroughRate(
  tenantId: string,
  cohortId: string,
  period: string
): Promise<void> {
  // First, get current counters
  const summary = await getCohortSummary(tenantId, cohortId, period);
  if (!summary) return;

  const total = summary.nudgesSent || 0;
  const completed = summary.nudgesCompleted || 0;
  const rate = total > 0 ? completed / total : 0;

  // Update the rate
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPK(tenantId),
        SK: buildSummarySK(cohortId, period),
      },
      UpdateExpression: 'SET followThroughRate = :rate',
      ExpressionAttributeValues: {
        ':rate': rate,
      },
    })
  );
}
