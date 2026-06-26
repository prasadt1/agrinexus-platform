/**
 * AWS Secrets Manager Client
 *
 * Fetches secrets from AWS Secrets Manager with in-memory caching.
 * Falls back to environment variables for local development.
 *
 * Best Practice: Secrets are cached for the lifetime of the serverless
 * function instance to minimize API calls and latency.
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

// Cache secrets in memory (persists across warm Lambda/Vercel invocations)
const secretsCache: Map<string, { value: unknown; expiry: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Lazy-initialized client
let client: SecretsManagerClient | null = null;

function getClient(): SecretsManagerClient {
  if (!client) {
    client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }
  return client;
}

/**
 * Fetch a secret from AWS Secrets Manager with caching.
 * Returns parsed JSON if the secret is a JSON string.
 */
export async function getSecret<T = unknown>(secretName: string): Promise<T | null> {
  // Check cache first
  const cached = secretsCache.get(secretName);
  if (cached && Date.now() < cached.expiry) {
    return cached.value as T;
  }

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await getClient().send(command);

    if (!response.SecretString) {
      console.warn(`Secret ${secretName} has no string value`);
      return null;
    }

    // Try to parse as JSON, fall back to raw string
    let value: unknown;
    try {
      value = JSON.parse(response.SecretString);
    } catch {
      value = response.SecretString;
    }

    // Cache the result
    secretsCache.set(secretName, {
      value,
      expiry: Date.now() + CACHE_TTL_MS,
    });

    return value as T;
  } catch (error) {
    console.error(`Failed to fetch secret ${secretName}:`, error);
    return null;
  }
}

// =============================================================================
// Typed Secret Accessors
//
// Stripe credentials are sourced via lib/stripe-secrets.ts (Secrets Manager
// first, env fallback). Keep all application secrets in AWS Secrets Manager;
// only the bootstrap AWS credentials live in Vercel env vars.
// =============================================================================

export const WEATHER_API_KEY_SECRET = 'agrinexus/weather/api-key';

/**
 * Get the OpenWeatherMap API key.
 *
 * Source of truth: AWS Secrets Manager (secret `agrinexus/weather/api-key`,
 * stored as a plain string). Falls back to WEATHER_API_KEY env var for local dev.
 */
export async function getWeatherApiKey(): Promise<string | undefined> {
  const secret = await getSecret<string>(WEATHER_API_KEY_SECRET);
  if (typeof secret === 'string' && secret.length > 0) {
    return secret;
  }
  return process.env.WEATHER_API_KEY;
}

/**
 * Clear the secrets cache (useful for testing or forced refresh).
 */
export function clearSecretsCache(): void {
  secretsCache.clear();
}
