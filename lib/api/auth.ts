/**
 * Authentication — session cookie (demo) + X-Tenant-ID header fallback + Cognito-ready.
 */

import { NextRequest } from 'next/server';
import { getSession, type SessionPayload } from '@/lib/auth/session';
import type { UserRole } from '@/lib/entities/types';

export interface AuthContext {
  tenantId: string;
  userId: string;
  role: UserRole;
  email?: string;
  tenantName?: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

async function fromSession(request?: NextRequest): Promise<AuthContext | null> {
  const session: SessionPayload | null = await getSession();
  if (!session) return null;

  // Demo tenant switcher: allow X-Tenant-ID override for isolation demo
  const headerTenant = request?.headers.get('x-tenant-id');
  const tenantId =
    session.isDemo && headerTenant?.startsWith('demo-')
      ? headerTenant
      : session.tenantId;

  return {
    tenantId,
    userId: session.userId,
    role: session.role,
    email: session.email,
    tenantName: session.tenantName,
  };
}

/**
 * Extract tenant context from request.
 * Priority: session cookie → Authorization Bearer (future Cognito) → X-Tenant-ID
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  const sessionCtx = await fromSession(request);
  if (sessionCtx) return sessionCtx;

  // Future: Cognito JWT validation
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ') && process.env.COGNITO_USER_POOL_ID) {
    // Placeholder — wire amazon-cognito-identity-js or jose when pool is provisioned
    throw new AuthError('Cognito JWT validation not yet configured', 501);
  }

  // Header-only fallback (no verified session). Restricted to DEMO tenants so a
  // caller can never spoof X-Tenant-ID to reach a real tenant's data — that would
  // break the multi-tenant isolation guarantee the product is built on. Real
  // tenants must authenticate (Cognito-ready above); no session ⇒ 401.
  const tenantId = request.headers.get('x-tenant-id');
  if (tenantId && tenantId.startsWith('demo-')) {
    return {
      tenantId,
      userId: 'dev-user',
      role: 'admin',
    };
  }

  throw new AuthError('Not authenticated', 401);
}

export function requireAdmin(ctx: AuthContext): void {
  if (ctx.role !== 'admin') {
    throw new AuthError('Admin role required', 403);
  }
}

export const DEMO_TENANT_ID = 'demo-tenant-001';
