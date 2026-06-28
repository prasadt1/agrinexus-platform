import { NextRequest, NextResponse } from "next/server";
import { ulid } from "ulid";
import { docClient, TABLE_NAME, PutCommand, isDynamoConfigured } from "@/lib/dynamo";
import { logAuditEvent } from "@/lib/audit";

/**
 * Public inbound-lead capture for the landing-page "Talk to us about a pilot" CTA.
 *
 * No auth: a prospect has no tenant yet. The lead is written to the main table
 * under a fixed `LEADS` partition (newest-first via the timestamped SK), and a
 * best-effort audit event is recorded. Kept deliberately resilient — a demo
 * submission should never error out on infra hiccups.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: { org?: string; email?: string; message?: string; website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (body.website && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const org = (body.org || "").trim().slice(0, 200);
  const email = (body.email || "").trim().slice(0, 200);
  const message = (body.message || "").trim().slice(0, 1000);

  if (!org) return NextResponse.json({ error: "Please tell us your organisation." }, { status: 400 });
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid work email." }, { status: 400 });
  }

  const createdAt = new Date().toISOString();
  const id = ulid();

  if (isDynamoConfigured() && TABLE_NAME) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: "LEADS",
            SK: `LEAD#${createdAt}#${id}`,
            type: "lead",
            id,
            org,
            email,
            message: message || undefined,
            source: "landing:partner-pilot",
            status: "new",
            createdAt,
          },
        })
      );
    } catch (err) {
      // Best-effort: never fail the prospect's submission on a write hiccup.
      console.error("[leads] failed to persist lead:", err);
    }
  }

  await logAuditEvent({
    tenantId: "platform",
    eventType: "lead.received",
    actor: email,
    summary: `Pilot enquiry from ${org}`,
    metadata: { org, message: message || undefined, source: "landing:partner-pilot" },
  });

  return NextResponse.json({ ok: true });
}
