/**
 * Partner Activity Log API
 *
 * GET /api/audit - Newest control-plane events for the authenticated tenant.
 *
 * Reads from the Vercel-Marketplace-provisioned Amazon DynamoDB audit table
 * (see lib/audit.ts). Tenant-scoped: only the caller's own tenant events are
 * returned. Degrades gracefully — returns an empty list with configured:false
 * when the audit table isn't connected yet.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, AuthError } from "@/lib/api/auth";
import { listAuditEvents, isAuditConfigured } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getAuthContext(request);
    const events = await listAuditEvents(tenantId, 50);

    return NextResponse.json({
      events,
      configured: isAuditConfigured(),
      count: events.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Error listing audit events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
