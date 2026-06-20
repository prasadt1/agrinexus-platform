/**
 * Healthcheck API Route
 *
 * Verifies end-to-end connectivity between Vercel and DynamoDB by:
 * 1. Writing a test item to the table
 * 2. Reading it back
 * 3. Deleting it (cleanup)
 *
 * This proves the IAM credentials and table access are correctly configured.
 */

import { NextResponse } from "next/server";
import {
  docClient,
  TABLE_NAME,
  PutCommand,
  GetCommand,
  DeleteCommand,
  isDynamoConfigured,
} from "@/lib/dynamo";

// Test item uses a dedicated partition to avoid conflicts
const TEST_PK = "HEALTHCHECK#test";
const TEST_SK = "PROBE";

export async function GET() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Check if DynamoDB is configured
  if (!isDynamoConfigured()) {
    return NextResponse.json(
      {
        status: "error",
        message: "DynamoDB not configured. Check environment variables.",
        timestamp,
        checks: {
          env_configured: false,
          write: null,
          read: null,
          cleanup: null,
        },
      },
      { status: 503 }
    );
  }

  const results: {
    env_configured: boolean;
    table_name: string;
    write: { success: boolean; duration_ms?: number; error?: string };
    read: {
      success: boolean;
      duration_ms?: number;
      data_matches?: boolean;
      error?: string;
    };
    cleanup: { success: boolean; duration_ms?: number; error?: string };
  } = {
    env_configured: true,
    table_name: TABLE_NAME,
    write: { success: false },
    read: { success: false },
    cleanup: { success: false },
  };

  const testData = {
    probe_id: `probe-${Date.now()}`,
    timestamp,
    source: "vercel-healthcheck",
  };

  try {
    // Step 1: Write test item
    const writeStart = Date.now();
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: TEST_PK,
          SK: TEST_SK,
          ...testData,
          ttl: Math.floor(Date.now() / 1000) + 300, // Auto-expire in 5 minutes
        },
      })
    );
    results.write = {
      success: true,
      duration_ms: Date.now() - writeStart,
    };

    // Step 2: Read it back
    const readStart = Date.now();
    const readResponse = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: TEST_PK,
          SK: TEST_SK,
        },
      })
    );
    const readItem = readResponse.Item;
    results.read = {
      success: !!readItem,
      duration_ms: Date.now() - readStart,
      data_matches: readItem?.probe_id === testData.probe_id,
    };

    // Step 3: Cleanup (delete the test item)
    const cleanupStart = Date.now();
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: TEST_PK,
          SK: TEST_SK,
        },
      })
    );
    results.cleanup = {
      success: true,
      duration_ms: Date.now() - cleanupStart,
    };

    const totalDuration = Date.now() - startTime;
    const allPassed =
      results.write.success && results.read.success && results.cleanup.success;

    return NextResponse.json(
      {
        status: allPassed ? "healthy" : "degraded",
        message: allPassed
          ? "DynamoDB integration verified: write, read, delete all succeeded"
          : "Some checks failed",
        timestamp,
        total_duration_ms: totalDuration,
        checks: results,
      },
      { status: allPassed ? 200 : 503 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const totalDuration = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "error",
        message: `DynamoDB operation failed: ${errorMessage}`,
        timestamp,
        total_duration_ms: totalDuration,
        checks: results,
        error: {
          name: error instanceof Error ? error.name : "UnknownError",
          message: errorMessage,
        },
      },
      { status: 503 }
    );
  }
}
