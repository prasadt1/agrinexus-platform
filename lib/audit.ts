/**
 * Partner Activity Log (audit trail)
 *
 * Writes significant control-plane events to a DEDICATED Amazon DynamoDB table
 * provisioned through the Vercel Marketplace (visible under Vercel → Storage).
 * This is separate from the operational `agrinexus-data` table and has its own
 * OIDC-federated IAM role, injected by the Vercel AWS DynamoDB integration under
 * the `AUDIT_` prefix so it never collides with the main table's vars:
 *
 *   - AUDIT_DYNAMODB_TABLE_NAME   table name (required to enable the feature)
 *   - AUDIT_AWS_ROLE_ARN          IAM role assumed via Vercel OIDC (keyless)
 *   - AUDIT_AWS_REGION            region of the audit table
 *   - AUDIT_OIDC_AUDIENCE         optional token audience override (omit → Vercel default)
 *
 * Design guarantees:
 * - Graceful: if AUDIT_DYNAMODB_TABLE_NAME is absent (local dev, or before the
 *   table is connected) EVERY call is a silent no-op. This module can ship and
 *   merge before the table exists and never break a request.
 * - Fire-safe: logAuditEvent() never throws into its caller. A failed audit
 *   write must not fail the user action that triggered it.
 *
 * Schema (single-table, tenant-scoped):
 *   PK = TENANT#<tenantId>
 *   SK = EVENT#<ISO-8601 timestamp>#<ulid>   (chronological; newest-first via reverse query)
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { ulid } from "ulid";

const AUDIT_TABLE = process.env.AUDIT_DYNAMODB_TABLE_NAME || "";
const AUDIT_REGION =
  process.env.AUDIT_AWS_REGION || process.env.AWS_REGION || "us-east-1";

export type AuditEventType =
  | "cohort.created"
  | "cohort.activated"
  | "cycle.run"
  | "license.issued";

export interface AuditEventInput {
  tenantId: string;
  eventType: AuditEventType;
  /** Who triggered it — email, userId, or a system actor like "stripe-checkout". */
  actor: string;
  actorRole?: string;
  /** Human-readable, e.g. "Activated Latur cotton cohort (growth plan)". */
  summary: string;
  targetType?: "cohort" | "license" | "cycle";
  targetId?: string;
  district?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  actor: string;
  actorRole?: string;
  summary: string;
  targetType?: string;
  targetId?: string;
  district?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/** Whether the audit table is wired up (vars present). */
export function isAuditConfigured(): boolean {
  return !!AUDIT_TABLE;
}

// Lazy singleton. `undefined` = not yet built; `null` = intentionally disabled.
let cached: DynamoDBDocumentClient | null | undefined;

function auditClient(): DynamoDBDocumentClient | null {
  if (cached !== undefined) return cached;

  if (!AUDIT_TABLE) {
    cached = null; // feature disabled — no table provisioned
    return cached;
  }

  const config: ConstructorParameters<typeof DynamoDBClient>[0] = {
    region: AUDIT_REGION,
  };

  if (process.env.AUDIT_AWS_ROLE_ARN) {
    // Keyless: exchange the per-deployment Vercel OIDC token for short-lived STS
    // credentials by assuming the Marketplace integration's role. Audience is left
    // to the Vercel default unless AUDIT_OIDC_AUDIENCE is set, because the role's
    // trust policy is configured by the integration (not hand-set like the main role).
    config.credentials = awsCredentialsProvider({
      roleArn: process.env.AUDIT_AWS_ROLE_ARN,
      ...(process.env.AUDIT_OIDC_AUDIENCE
        ? { audience: process.env.AUDIT_OIDC_AUDIENCE }
        : {}),
    });
  }
  // else: SDK default credential chain (~/.aws/credentials) for local dev.

  cached = DynamoDBDocumentClient.from(new DynamoDBClient(config), {
    marshallOptions: { removeUndefinedValues: true },
  });
  return cached;
}

/**
 * Record a control-plane event. Best-effort and non-blocking in spirit:
 * awaited so the write lands before the serverless function freezes, but any
 * failure is swallowed so the caller's primary action always succeeds.
 */
export async function logAuditEvent(input: AuditEventInput): Promise<void> {
  const client = auditClient();
  if (!client) return; // no-op when the audit table isn't provisioned

  try {
    const createdAt = new Date().toISOString();
    const id = ulid();
    await client.send(
      new PutCommand({
        TableName: AUDIT_TABLE,
        Item: {
          PK: `TENANT#${input.tenantId}`,
          SK: `EVENT#${createdAt}#${id}`,
          id,
          eventType: input.eventType,
          actor: input.actor,
          actorRole: input.actorRole,
          summary: input.summary,
          targetType: input.targetType,
          targetId: input.targetId,
          district: input.district,
          metadata: input.metadata,
          createdAt,
        },
      })
    );
  } catch (err) {
    // Audit logging is best-effort — never surface to the caller.
    console.error("[audit] failed to write event:", err);
  }
}

/**
 * End-to-end probe of the audit table: write → read → delete a throwaway item.
 * Proves the AUDIT_* OIDC credentials, region, table name, and PK/SK schema are
 * all correct. Used by GET /api/healthcheck/audit. Returns a structured result
 * rather than throwing.
 */
export async function probeAuditTable(): Promise<{
  configured: boolean;
  table?: string;
  write?: boolean;
  read?: boolean;
  cleanup?: boolean;
  error?: string;
}> {
  const client = auditClient();
  if (!client) return { configured: false };

  const PK = "HEALTHCHECK#audit";
  const SK = `PROBE#${ulid()}`;

  try {
    await client.send(
      new PutCommand({
        TableName: AUDIT_TABLE,
        Item: {
          PK,
          SK,
          source: "vercel-audit-healthcheck",
          createdAt: new Date().toISOString(),
          ttl: Math.floor(Date.now() / 1000) + 300, // auto-expire in 5 min
        },
      })
    );

    const read = await client.send(
      new GetCommand({ TableName: AUDIT_TABLE, Key: { PK, SK } })
    );

    await client.send(
      new DeleteCommand({ TableName: AUDIT_TABLE, Key: { PK, SK } })
    );

    return {
      configured: true,
      table: AUDIT_TABLE,
      write: true,
      read: !!read.Item,
      cleanup: true,
    };
  } catch (err) {
    return {
      configured: true,
      table: AUDIT_TABLE,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/** Newest-first activity for a tenant. Returns [] when not configured or on error. */
export async function listAuditEvents(
  tenantId: string,
  limit = 50
): Promise<AuditEvent[]> {
  const client = auditClient();
  if (!client) return [];

  try {
    const res = await client.send(
      new QueryCommand({
        TableName: AUDIT_TABLE,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `TENANT#${tenantId}`,
          ":sk": "EVENT#",
        },
        ScanIndexForward: false, // newest first
        Limit: limit,
      })
    );

    return (res.Items ?? []).map((it) => ({
      id: it.id,
      eventType: it.eventType,
      actor: it.actor,
      actorRole: it.actorRole,
      summary: it.summary,
      targetType: it.targetType,
      targetId: it.targetId,
      district: it.district,
      metadata: it.metadata,
      createdAt: it.createdAt,
    }));
  } catch (err) {
    console.error("[audit] failed to query events:", err);
    return [];
  }
}
