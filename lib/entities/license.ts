/**
 * License Entity - Access Pattern Functions
 *
 * Access patterns:
 * - getLicense(tenantId, cohortId) - Get license for a cohort
 * - createLicense(tenantId, input) - Create license (activates cohort)
 * - listTenantLicenses(tenantId) - List all licenses for billing page
 */

import {
  docClient,
  TABLE_NAME,
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@/lib/dynamo';
import {
  KEY_PREFIXES,
  type LicenseItem,
  type License,
  type CreateLicenseInput,
} from './types';

// =============================================================================
// Key Builders
// =============================================================================

function buildTenantPK(tenantId: string): `TENANT#${string}` {
  return `${KEY_PREFIXES.TENANT}${tenantId}` as `TENANT#${string}`;
}

function buildLicenseSK(cohortId: string): `LICENSE#${string}` {
  return `${KEY_PREFIXES.LICENSE}${cohortId}` as `LICENSE#${string}`;
}

// =============================================================================
// Transformers
// =============================================================================

function toLicense(item: LicenseItem): License {
  return {
    tenantId: item.tenantId,
    cohortId: item.cohortId,
    stripeSubId: item.stripeSubId,
    plan: item.plan,
    status: item.status,
    currentPeriodStart: item.currentPeriodStart,
    currentPeriodEnd: item.currentPeriodEnd,
    isDemo: item.isDemo,
    createdAt: item.createdAt,
  };
}

// =============================================================================
// Access Pattern: Get License for Cohort
// GetItem: PK = TENANT#<tenantId>, SK = LICENSE#<cohortId>
// =============================================================================

export async function getLicense(
  tenantId: string,
  cohortId: string
): Promise<License | null> {
  const response = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPK(tenantId),
        SK: buildLicenseSK(cohortId),
      },
    })
  );

  if (!response.Item) {
    return null;
  }

  return toLicense(response.Item as LicenseItem);
}

// =============================================================================
// Access Pattern: Create License
// PutItem: New license record
//
// Note: This does NOT activate the cohort. Call activateCohort separately
// or use the transactional createLicenseAndActivate function.
// =============================================================================

export async function createLicense(
  tenantId: string,
  input: CreateLicenseInput
): Promise<License> {
  const now = new Date().toISOString();

  const item: LicenseItem = {
    PK: buildTenantPK(tenantId),
    SK: buildLicenseSK(input.cohortId),
    tenantId,
    cohortId: input.cohortId,
    stripeSubId: input.stripeSubId,
    plan: input.plan,
    status: 'active',
    currentPeriodStart: input.currentPeriodStart,
    currentPeriodEnd: input.currentPeriodEnd,
    isDemo: input.isDemo,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return toLicense(item);
}

// =============================================================================
// Access Pattern: List Tenant Licenses
// Query: PK = TENANT#<tenantId> AND begins_with(SK, 'LICENSE#')
// =============================================================================

export async function listTenantLicenses(tenantId: string): Promise<License[]> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': buildTenantPK(tenantId),
        ':sk': KEY_PREFIXES.LICENSE,
      },
    })
  );

  const items = (response.Items || []) as LicenseItem[];
  return items.map(toLicense);
}

// =============================================================================
// Access Pattern: Create Demo License (for judges)
// Creates a license with isDemo=true, no Stripe subscription
// =============================================================================

export async function createDemoLicense(
  tenantId: string,
  cohortId: string,
  plan: 'starter' | 'growth' | 'enterprise' = 'growth'
): Promise<License> {
  const now = new Date().toISOString();
  // Demo licenses last 30 days
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return createLicense(tenantId, {
    cohortId,
    stripeSubId: `demo_${cohortId}`,
    plan,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    isDemo: true,
  });
}
