/**
 * Cohort Entity - Access Pattern Functions
 *
 * Every function takes tenantId as the FIRST required argument.
 * This ensures tenant isolation is enforced in the signature, not by convention.
 *
 * Access patterns implemented:
 * - listCohorts(tenantId) - Query all cohorts for a tenant
 * - getCohort(tenantId, cohortId) - Get single cohort
 * - createCohort(tenantId, input) - Create new cohort (draft status)
 * - activateCohort(tenantId, cohortId) - Set status=active, add GSI2 keys
 * - listActiveCohorts() - Query GSI2 for WeatherPoller (cross-tenant, system use)
 */

import {
  docClient,
  TABLE_NAME,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@/lib/dynamo';
import {
  KEY_PREFIXES,
  type CohortItem,
  type Cohort,
  type CreateCohortInput,
  type ActiveCohortProjection,
} from './types';

// =============================================================================
// Key Builders (internal)
// =============================================================================

function buildTenantPK(tenantId: string): `TENANT#${string}` {
  return `${KEY_PREFIXES.TENANT}${tenantId}` as `TENANT#${string}`;
}

function buildCohortSK(cohortId: string): `COHORT#${string}` {
  return `${KEY_PREFIXES.COHORT}${cohortId}` as `COHORT#${string}`;
}

// =============================================================================
// Item → API Type Transformer
// =============================================================================

function toCohort(item: CohortItem): Cohort {
  return {
    tenantId: item.tenantId,
    cohortId: item.cohortId,
    district: item.district,
    lat: item.lat,
    lon: item.lon,
    crops: item.crops,
    languages: item.languages,
    nudgeRules: item.nudgeRules,
    features: item.features,
    status: item.status,
    createdAt: item.createdAt,
    activatedAt: item.activatedAt,
    updatedAt: item.updatedAt,
  };
}

// =============================================================================
// Access Pattern: List Tenant's Cohorts
// Query: PK = TENANT#<tenantId> AND begins_with(SK, 'COHORT#')
// =============================================================================

export async function listCohorts(tenantId: string): Promise<Cohort[]> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': buildTenantPK(tenantId),
        ':sk': KEY_PREFIXES.COHORT,
      },
    })
  );

  const items = (response.Items || []) as CohortItem[];
  return items.map(toCohort);
}

// =============================================================================
// Access Pattern: Get Cohort Details
// GetItem: PK = TENANT#<tenantId>, SK = COHORT#<cohortId>
// =============================================================================

export async function getCohort(
  tenantId: string,
  cohortId: string
): Promise<Cohort | null> {
  const response = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPK(tenantId),
        SK: buildCohortSK(cohortId),
      },
    })
  );

  if (!response.Item) {
    return null;
  }

  return toCohort(response.Item as CohortItem);
}

// =============================================================================
// Access Pattern: Create Cohort
// PutItem: New cohort with status='draft', no GSI2 keys
// =============================================================================

export async function createCohort(
  tenantId: string,
  input: CreateCohortInput
): Promise<Cohort> {
  const now = new Date().toISOString();

  const item: CohortItem = {
    PK: buildTenantPK(tenantId),
    SK: buildCohortSK(input.cohortId),
    tenantId,
    cohortId: input.cohortId,
    district: input.district,
    lat: input.lat,
    lon: input.lon,
    crops: input.crops,
    languages: input.languages,
    nudgeRules: input.nudgeRules,
    features: input.features,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    // No GSI2PK/GSI2SK - draft cohorts are not indexed for WeatherPoller
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
    })
  );

  return toCohort(item);
}

// =============================================================================
// Access Pattern: Activate Cohort
// UpdateItem: Set status='active', add GSI2PK/GSI2SK for WeatherPoller
// =============================================================================

export async function activateCohort(
  tenantId: string,
  cohortId: string
): Promise<Cohort> {
  const now = new Date().toISOString();

  const response = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPK(tenantId),
        SK: buildCohortSK(cohortId),
      },
      UpdateExpression: `
        SET #status = :active,
            activatedAt = :now,
            updatedAt = :now,
            GSI2PK = :gsi2pk,
            GSI2SK = :gsi2sk
      `,
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':active': 'active',
        ':now': now,
        ':gsi2pk': KEY_PREFIXES.STATUS_ACTIVE,
        ':gsi2sk': buildCohortSK(cohortId),
        ':tenantId': tenantId,
      },
      // Ensure the cohort exists and belongs to this tenant
      ConditionExpression: 'attribute_exists(PK) AND tenantId = :tenantId',
      ReturnValues: 'ALL_NEW',
    })
  );

  return toCohort(response.Attributes as CohortItem);
}

// =============================================================================
// Access Pattern: Deactivate Cohort (pause/expire)
// UpdateItem: Set status, remove GSI2 keys
// =============================================================================

export async function deactivateCohort(
  tenantId: string,
  cohortId: string,
  newStatus: 'paused' | 'expired'
): Promise<Cohort> {
  const now = new Date().toISOString();

  const response = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPK(tenantId),
        SK: buildCohortSK(cohortId),
      },
      UpdateExpression: `
        SET #status = :newStatus,
            updatedAt = :now
        REMOVE GSI2PK, GSI2SK
      `,
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':newStatus': newStatus,
        ':now': now,
        ':tenantId': tenantId,
      },
      ConditionExpression: 'attribute_exists(PK) AND tenantId = :tenantId',
      ReturnValues: 'ALL_NEW',
    })
  );

  return toCohort(response.Attributes as CohortItem);
}

// =============================================================================
// Access Pattern: List Active Cohorts (for WeatherPoller)
// Query GSI2: GSI2PK = 'STATUS#active'
//
// NOTE: This is a cross-tenant query used by the delivery engine.
// It returns only the projection needed for weather polling.
// =============================================================================

export async function listActiveCohorts(): Promise<ActiveCohortProjection[]> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': KEY_PREFIXES.STATUS_ACTIVE,
      },
      // Only project what WeatherPoller needs
      ProjectionExpression: 'tenantId, cohortId, district, lat, lon, crops, GSI2PK, GSI2SK',
    })
  );

  return (response.Items || []) as ActiveCohortProjection[];
}

// =============================================================================
// Access Pattern: Find Cohort by District (for SummaryAggregator)
// Query GSI2: GSI2PK = 'STATUS#active' with filter on district
//
// Returns the first active cohort for this district (assumes 1:1 mapping)
// =============================================================================

export async function findActiveCohortByDistrict(
  district: string
): Promise<ActiveCohortProjection | null> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk',
      FilterExpression: 'district = :district',
      ExpressionAttributeValues: {
        ':pk': KEY_PREFIXES.STATUS_ACTIVE,
        ':district': district,
      },
      Limit: 1,
    })
  );

  if (!response.Items || response.Items.length === 0) {
    return null;
  }

  return response.Items[0] as ActiveCohortProjection;
}
