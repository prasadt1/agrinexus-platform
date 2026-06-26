/**
 * AWS DynamoDB Client Configuration
 *
 * This module provides a configured DynamoDB Document Client for use
 * throughout the application.
 *
 * Credential resolution (in order):
 * 1. AWS_ROLE_ARN: Vercel OIDC federation — assume role via STS, no long-lived keys (production)
 * 2. Explicit env vars: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY (fallback / legacy)
 * 3. AWS SDK default chain: ~/.aws/credentials, IAM roles, etc. (for local dev)
 *
 * Environment variables:
 * - AWS_REGION: AWS region (default: "us-east-1"; pin it explicitly on Vercel — see OIDC docs)
 * - DYNAMODB_TABLE_NAME: Name of the DynamoDB table (required)
 * - AWS_ROLE_ARN: IAM role to assume via Vercel OIDC federation (preferred on Vercel)
 * - AWS_ACCESS_KEY_ID: IAM access key (fallback; optional for local dev)
 * - AWS_SECRET_ACCESS_KEY: IAM secret key (fallback; optional for local dev)
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
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

// Build client config. See header for the credential resolution order.
const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = {
  region: process.env.AWS_REGION || "us-east-1",
};

if (process.env.AWS_ROLE_ARN) {
  // Vercel OIDC federation: exchange the per-deployment OIDC token for short-lived
  // STS credentials by assuming AWS_ROLE_ARN. The `audience` must match the value
  // configured on the IAM OIDC identity provider and the role's trust policy.
  clientConfig.credentials = awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    audience: "sts.amazonaws.com",
  });
} else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  // Fallback: static IAM key (both must be present).
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}
// else: SDK default credential provider chain (~/.aws/credentials, IAM roles, etc.)

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
