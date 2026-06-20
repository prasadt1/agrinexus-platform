/**
 * Authentication Helpers
 *
 * TODO: Replace with Cognito JWT validation
 *
 * Current implementation uses X-Tenant-ID header for development.
 * Production will extract tenantId from Cognito JWT claims.
 */

import { NextRequest } from 'next/server';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

/**
 * Extract tenant context from request.
 *
 * Current: Reads X-Tenant-ID header (for development/testing)
 * Future: Validates Cognito JWT and extracts tenantId claim
 *
 * @throws Error if tenant context cannot be determined
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  // TODO: Replace with Cognito JWT validation
  // const token = request.headers.get('authorization')?.replace('Bearer ', '');
  // const claims = await verifyCognitoToken(token);
  // return { tenantId: claims.tenantId, userId: claims.sub };

  // Development: use header-based tenant ID
  const tenantId = request.headers.get('x-tenant-id');

  if (!tenantId) {
    throw new AuthError('Missing X-Tenant-ID header', 401);
  }

  // For now, userId is a placeholder
  return {
    tenantId,
    userId: 'dev-user',
  };
}

/**
 * Custom error class for auth failures.
 * Includes HTTP status code for proper response handling.
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Demo tenant ID for judges and testing.
 * This tenant is pre-seeded with sample data.
 */
export const DEMO_TENANT_ID = 'demo-tenant-001';
