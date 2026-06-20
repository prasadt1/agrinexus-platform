/**
 * Tenant Entity - Access Pattern Functions
 *
 * Access patterns:
 * - getTenant(tenantId) - Get tenant metadata
 * - createTenant(tenantId, input) - Create new tenant
 * - listTenantUsers(tenantId) - List all users for a tenant
 * - createPartnerUser(tenantId, input) - Add user to tenant
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
  type TenantItem,
  type Tenant,
  type CreateTenantInput,
  type PartnerUserItem,
  type CreatePartnerUserInput,
} from './types';

// =============================================================================
// Key Builders
// =============================================================================

function buildTenantPK(tenantId: string): `TENANT#${string}` {
  return `${KEY_PREFIXES.TENANT}${tenantId}` as `TENANT#${string}`;
}

function buildUserSK(userId: string): `USER#${string}` {
  return `${KEY_PREFIXES.USER}${userId}` as `USER#${string}`;
}

// =============================================================================
// Transformers
// =============================================================================

function toTenant(item: TenantItem): Tenant {
  return {
    tenantId: item.tenantId,
    name: item.name,
    type: item.type,
    plan: item.plan,
    stripeCustomerId: item.stripeCustomerId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// =============================================================================
// Access Pattern: Get Tenant Metadata
// GetItem: PK = TENANT#<tenantId>, SK = META
// =============================================================================

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const response = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPK(tenantId),
        SK: 'META',
      },
    })
  );

  if (!response.Item) {
    return null;
  }

  return toTenant(response.Item as TenantItem);
}

// =============================================================================
// Access Pattern: Create Tenant
// PutItem: New tenant with META sort key
// =============================================================================

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const now = new Date().toISOString();

  const item: TenantItem = {
    PK: buildTenantPK(input.tenantId),
    SK: 'META',
    tenantId: input.tenantId,
    name: input.name,
    type: input.type,
    plan: input.plan || 'starter',
    stripeCustomerId: input.stripeCustomerId,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
    })
  );

  return toTenant(item);
}

// =============================================================================
// Access Pattern: List Tenant Users
// Query: PK = TENANT#<tenantId> AND begins_with(SK, 'USER#')
// =============================================================================

export interface PartnerUser {
  tenantId: string;
  userId: string;
  cognitoSub: string;
  email: string;
  role: 'admin' | 'viewer';
  createdAt: string;
  lastLoginAt?: string;
}

function toPartnerUser(item: PartnerUserItem): PartnerUser {
  return {
    tenantId: item.tenantId,
    userId: item.userId,
    cognitoSub: item.cognitoSub,
    email: item.email,
    role: item.role,
    createdAt: item.createdAt,
    lastLoginAt: item.lastLoginAt,
  };
}

export async function listTenantUsers(tenantId: string): Promise<PartnerUser[]> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': buildTenantPK(tenantId),
        ':sk': KEY_PREFIXES.USER,
      },
    })
  );

  const items = (response.Items || []) as PartnerUserItem[];
  return items.map(toPartnerUser);
}

// =============================================================================
// Access Pattern: Create Partner User
// PutItem: New user under tenant
// =============================================================================

export async function createPartnerUser(
  tenantId: string,
  input: CreatePartnerUserInput
): Promise<PartnerUser> {
  const now = new Date().toISOString();

  const item: PartnerUserItem = {
    PK: buildTenantPK(tenantId),
    SK: buildUserSK(input.userId),
    tenantId,
    userId: input.userId,
    cognitoSub: input.cognitoSub,
    email: input.email,
    role: input.role,
    createdAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(SK)',
    })
  );

  return toPartnerUser(item);
}

// =============================================================================
// Access Pattern: Find User by Cognito Sub
// Query: Scan with filter (not ideal, but Cognito sub is unique)
// Consider adding GSI if this becomes a hot path
// =============================================================================

export async function findUserByCognitoSub(
  tenantId: string,
  cognitoSub: string
): Promise<PartnerUser | null> {
  const response = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      FilterExpression: 'cognitoSub = :sub',
      ExpressionAttributeValues: {
        ':pk': buildTenantPK(tenantId),
        ':sk': KEY_PREFIXES.USER,
        ':sub': cognitoSub,
      },
    })
  );

  if (!response.Items || response.Items.length === 0) {
    return null;
  }

  return toPartnerUser(response.Items[0] as PartnerUserItem);
}
