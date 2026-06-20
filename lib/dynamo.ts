/**
 * AWS DynamoDB Client Configuration
 *
 * This module provides a configured DynamoDB Document Client for use
 * throughout the application.
 *
 * Credential resolution (in order):
 * 1. Explicit env vars: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY (for Vercel)
 * 2. AWS SDK default chain: ~/.aws/credentials, IAM roles, etc. (for local dev)
 *
 * Environment variables:
 * - AWS_REGION: AWS region (default: "us-east-1")
 * - DYNAMODB_TABLE_NAME: Name of the DynamoDB table (required)
 * - AWS_ACCESS_KEY_ID: IAM access key (optional for local dev)
 * - AWS_SECRET_ACCESS_KEY: IAM secret key (optional for local dev)
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  type PutCommandInput,
  type GetCommandInput,
  type QueryCommandInput,
  type DeleteCommandInput,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

// Build client config - use explicit creds if provided, otherwise SDK default chain
const hasExplicitCreds =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = {
  region: process.env.AWS_REGION || "us-east-1",
};

// Only set explicit credentials if both are provided
// Otherwise, SDK uses default credential provider chain (~/.aws/credentials, IAM roles, etc.)
if (hasExplicitCreds) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  };
}

// Create the base DynamoDB client
const client = new DynamoDBClient(clientConfig);

// Create the Document Client with marshalling options
// translateConfig ensures proper JS <-> DynamoDB type conversion
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // Don't send undefined values to DynamoDB
    convertEmptyValues: false, // Don't convert empty strings to null
  },
  unmarshallOptions: {
    wrapNumbers: false, // Return numbers as JS numbers, not strings
  },
});

// Export table name for use in commands
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "";

// Helper function to check if DynamoDB is properly configured
// For local dev, we only need table name (SDK handles creds via ~/.aws/credentials)
// For Vercel, we need explicit creds
export function isDynamoConfigured(): boolean {
  // Table name is always required
  if (!process.env.DYNAMODB_TABLE_NAME) return false;

  // If explicit creds are partially set, both must be present
  const hasAccessKey = !!process.env.AWS_ACCESS_KEY_ID;
  const hasSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY;
  if (hasAccessKey !== hasSecretKey) return false;

  return true;
}

// Export command classes for use in API routes
export {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  type PutCommandInput,
  type GetCommandInput,
  type QueryCommandInput,
  type DeleteCommandInput,
  type UpdateCommandInput,
};
