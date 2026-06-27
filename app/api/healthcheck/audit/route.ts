/**
 * Audit-table Healthcheck
 *
 * GET /api/healthcheck/audit — proves end-to-end connectivity to the
 * Vercel-Marketplace-provisioned Amazon DynamoDB audit table (`outturn-audit-log`)
 * by doing write → read → delete via keyless OIDC federation (AUDIT_AWS_ROLE_ARN).
 *
 * Mirrors /api/healthcheck (which probes the main agrinexus-data table) so the
 * demo can show BOTH DynamoDB tables verified keyless.
 */

import { NextResponse } from "next/server";
import { probeAuditTable } from "@/lib/audit";

export async function GET() {
  const timestamp = new Date().toISOString();
  const result = await probeAuditTable();

  if (!result.configured) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Audit table not configured. Provision it via Vercel → Storage (AUDIT_* env vars missing).",
        timestamp,
        checks: result,
      },
      { status: 503 }
    );
  }

  const healthy = !!(result.write && result.read && result.cleanup);

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "error",
      message: healthy
        ? "Audit DynamoDB integration verified: write, read, delete all succeeded (keyless OIDC)"
        : `Audit table probe failed: ${result.error ?? "unknown"}`,
      timestamp,
      table_name: result.table,
      checks: result,
    },
    { status: healthy ? 200 : 503 }
  );
}
