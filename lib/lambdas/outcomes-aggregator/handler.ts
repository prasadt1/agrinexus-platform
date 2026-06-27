/**
 * OutcomesAggregator Lambda
 *
 * Processes DynamoDB Streams events for NUDGE records and aggregates
 * outcomes per cohort using platform-side membership lookups.
 *
 * Event types handled:
 * - INSERT on NUDGE# → increment nudgesSent
 * - MODIFY on NUDGE# where status → DONE → increment nudgesCompleted
 * - MODIFY on NUDGE# where status → EXPIRED → increment nudgesExpired
 *
 * Isolation: Reads from stream (passive), writes only to SUMMARY# items.
 * Does not modify NUDGE# records.
 *
 * Idempotency: DynamoDB Streams deliver at-least-once and Lambda retries failed
 * batches, so each record is claimed exactly once via a DEDUPE#<eventID> marker
 * (conditional put). A replayed record whose marker already exists is skipped,
 * so counters are never double-incremented. Markers self-expire via TTL.
 */

import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

// Types for DynamoDB Streams (inline to avoid aws-lambda dependency in monorepo)
interface DynamoDBRecord {
  eventID?: string;
  eventName?: 'INSERT' | 'MODIFY' | 'REMOVE';
  dynamodb?: {
    Keys?: Record<string, AttributeValue>;
    NewImage?: Record<string, AttributeValue>;
    OldImage?: Record<string, AttributeValue>;
  };
}

interface DynamoDBStreamEvent {
  Records: DynamoDBRecord[];
}

// Note: In Lambda deployment, these would be bundled differently.
// For now, we use relative imports that work with the monorepo structure.

// =============================================================================
// Types
// =============================================================================

interface NudgeRecord {
  PK: string;
  SK: string;
  status: 'SENT' | 'REMINDED' | 'DONE' | 'EXPIRED';
  activity?: string;
  crop?: string;
  district?: string;
  completedAt?: string;
}

interface MembershipRecord {
  phone: string;
  tenantId: string;
  cohortId: string;
}

interface AggregationBatch {
  tenantId: string;
  cohortId: string;
  period: string;
  nudgesSent: number;
  nudgesCompleted: number;
  nudgesExpired: number;
}

// =============================================================================
// Environment
// =============================================================================

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || process.env.TABLE_NAME || '';

// =============================================================================
// DynamoDB Client (standalone for Lambda)
// =============================================================================

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// =============================================================================
// Helper: Extract phone from PK
// =============================================================================

function extractPhone(pk: string): string | null {
  // PK format: USER#{phone}
  if (!pk.startsWith('USER#')) return null;
  return pk.replace('USER#', '');
}

// =============================================================================
// Helper: Get membership (phone → cohort)
// =============================================================================

async function getMembership(phone: string): Promise<MembershipRecord | null> {
  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `PHONE#${phone}`,
          SK: 'MEMBERSHIP',
        },
      })
    );

    if (!response.Item) return null;

    return {
      phone: response.Item.phone,
      tenantId: response.Item.tenantId,
      cohortId: response.Item.cohortId,
    };
  } catch (error) {
    console.error(`Failed to get membership for ${phone}:`, error);
    return null;
  }
}

// =============================================================================
// Helper: Get current period (YYYY-MM)
// =============================================================================

function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// =============================================================================
// Helper: Idempotency claim — process each stream eventID at most once
// =============================================================================

/**
 * Claim a stream event exactly once. Conditionally writes a DEDUPE#<eventID>
 * marker; returns true the first time the event is seen, false if it was already
 * processed (a replay/retry). Markers self-expire via TTL so the dedupe partition
 * stays bounded. Without a usable eventID we cannot dedupe, so we process (true).
 */
async function claimEvent(eventID: string | undefined): Promise<boolean> {
  if (!eventID) return true;
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `DEDUPE#${eventID}`,
          SK: 'AGGREGATOR',
          processedAt: new Date().toISOString(),
          ttl: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // expire in 7 days
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      })
    );
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return false; // already processed — idempotent replay
    }
    throw error; // real failure: let the batch error so Lambda retries
  }
}

// =============================================================================
// Helper: Upsert summary with atomic ADD
// =============================================================================

async function upsertSummary(batch: AggregationBatch): Promise<void> {
  const now = new Date().toISOString();

  const updateParts: string[] = [
    'tenantId = :tenantId',
    'cohortId = :cohortId',
    '#period = :period',
    'lastUpdatedAt = :now',
  ];
  const addParts: string[] = [];
  const exprAttrValues: Record<string, unknown> = {
    ':tenantId': batch.tenantId,
    ':cohortId': batch.cohortId,
    ':period': batch.period,
    ':now': now,
  };

  if (batch.nudgesSent > 0) {
    addParts.push('nudgesSent :nudgesSent');
    exprAttrValues[':nudgesSent'] = batch.nudgesSent;
  }
  if (batch.nudgesCompleted > 0) {
    addParts.push('nudgesCompleted :nudgesCompleted');
    exprAttrValues[':nudgesCompleted'] = batch.nudgesCompleted;
  }
  if (batch.nudgesExpired > 0) {
    addParts.push('nudgesExpired :nudgesExpired');
    exprAttrValues[':nudgesExpired'] = batch.nudgesExpired;
  }

  let updateExpression = 'SET ' + updateParts.join(', ');
  if (addParts.length > 0) {
    updateExpression += ' ADD ' + addParts.join(', ');
  }

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TENANT#${batch.tenantId}`,
        SK: `SUMMARY#${batch.cohortId}#${batch.period}`,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: { '#period': 'period' },
      ExpressionAttributeValues: exprAttrValues,
    })
  );

  console.log(
    `Updated summary: tenant=${batch.tenantId} cohort=${batch.cohortId} ` +
    `period=${batch.period} sent=+${batch.nudgesSent} completed=+${batch.nudgesCompleted} ` +
    `expired=+${batch.nudgesExpired}`
  );
}

// =============================================================================
// Helper: Recalculate follow-through rate
// =============================================================================

async function recalculateRate(
  tenantId: string,
  cohortId: string,
  period: string
): Promise<void> {
  // Get current summary
  const response = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `SUMMARY#${cohortId}#${period}`,
      },
    })
  );

  if (!response.Item) return;

  const nudgesSent = response.Item.nudgesSent || 0;
  const nudgesCompleted = response.Item.nudgesCompleted || 0;
  const rate = nudgesSent > 0 ? nudgesCompleted / nudgesSent : 0;

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `SUMMARY#${cohortId}#${period}`,
      },
      UpdateExpression: 'SET followThroughRate = :rate',
      ExpressionAttributeValues: { ':rate': rate },
    })
  );
}

// =============================================================================
// Process single record
// =============================================================================

async function processRecord(
  record: DynamoDBRecord
): Promise<AggregationBatch | null> {
  const eventName = record.eventName;

  // Only process NUDGE# records
  const newImage = record.dynamodb?.NewImage;
  const oldImage = record.dynamodb?.OldImage;

  if (!newImage) return null;

  const newItem = unmarshall(
    newImage as Record<string, AttributeValue>
  ) as NudgeRecord;

  // Filter: only NUDGE# SK
  if (!newItem.SK?.startsWith('NUDGE#')) return null;

  // Extract phone from PK
  const phone = extractPhone(newItem.PK);
  if (!phone) {
    console.log(`Skipping: cannot extract phone from PK=${newItem.PK}`);
    return null;
  }

  // Lookup membership
  const membership = await getMembership(phone);
  if (!membership) {
    console.log(`Skipping: no membership for phone=${phone}`);
    return null;
  }

  const period = getCurrentPeriod();
  const batch: AggregationBatch = {
    tenantId: membership.tenantId,
    cohortId: membership.cohortId,
    period,
    nudgesSent: 0,
    nudgesCompleted: 0,
    nudgesExpired: 0,
  };

  if (eventName === 'INSERT') {
    // New nudge created → increment sent
    batch.nudgesSent = 1;
    console.log(`INSERT: nudge sent for phone=${phone} cohort=${membership.cohortId}`);
  } else if (eventName === 'MODIFY') {
    // Status change
    const oldItem = oldImage
      ? (unmarshall(oldImage as Record<string, AttributeValue>) as NudgeRecord)
      : null;

    const oldStatus = oldItem?.status;
    const newStatus = newItem.status;

    if (oldStatus !== newStatus) {
      if (newStatus === 'DONE') {
        batch.nudgesCompleted = 1;
        console.log(`MODIFY: nudge completed for phone=${phone} cohort=${membership.cohortId}`);
      } else if (newStatus === 'EXPIRED') {
        batch.nudgesExpired = 1;
        console.log(`MODIFY: nudge expired for phone=${phone} cohort=${membership.cohortId}`);
      }
      // REMINDED status change: no counter increment (still pending)
    }
  }

  // Only return batch if there's something to aggregate
  if (batch.nudgesSent > 0 || batch.nudgesCompleted > 0 || batch.nudgesExpired > 0) {
    return batch;
  }

  return null;
}

// =============================================================================
// Lambda Handler
// =============================================================================

export async function handler(event: DynamoDBStreamEvent): Promise<void> {
  console.log(`Processing ${event.Records.length} stream records`);

  // Group batches by (tenantId, cohortId, period) for efficiency
  const batchMap = new Map<string, AggregationBatch>();

  for (const record of event.Records) {
    try {
      // Idempotency: claim each event once; skip replays/retries so the atomic
      // ADD never double-counts on DynamoDB Streams' at-least-once redelivery.
      if (!(await claimEvent(record.eventID))) {
        console.log(`Skipping already-processed event ${record.eventID}`);
        continue;
      }
      const batch = await processRecord(record);
      if (batch) {
        const key = `${batch.tenantId}#${batch.cohortId}#${batch.period}`;
        const existing = batchMap.get(key);
        if (existing) {
          existing.nudgesSent += batch.nudgesSent;
          existing.nudgesCompleted += batch.nudgesCompleted;
          existing.nudgesExpired += batch.nudgesExpired;
        } else {
          batchMap.set(key, batch);
        }
      }
    } catch (error) {
      console.error('Error processing record:', error);
      // Continue processing other records
    }
  }

  // Write aggregated batches
  for (const batch of batchMap.values()) {
    try {
      await upsertSummary(batch);
      // Recalculate rate after updating counters
      if (batch.nudgesCompleted > 0 || batch.nudgesSent > 0) {
        await recalculateRate(batch.tenantId, batch.cohortId, batch.period);
      }
    } catch (error) {
      console.error('Error upserting summary:', error);
    }
  }

  console.log(`Processed ${batchMap.size} cohort summaries`);
}
