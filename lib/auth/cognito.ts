/**
 * Amazon Cognito integration (provision when COGNITO_USER_POOL_ID is set).
 *
 * Setup checklist:
 * 1. Create User Pool with custom attribute `custom:tenantId`
 * 2. Create groups: Admin, Viewer
 * 3. Set env: COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, COGNITO_REGION
 * 4. Wire verifyCognitoToken in lib/api/auth.ts using jose or aws-jwt-verify
 *
 * Until configured, demo session cookies are used (see lib/auth/session.ts).
 */

export const COGNITO_CONFIGURED = Boolean(
  process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID
);

export async function verifyCognitoToken(_token: string) {
  if (!COGNITO_CONFIGURED) {
    throw new Error('Cognito not configured');
  }
  // TODO: implement JWT verification when pool is provisioned
  throw new Error('Cognito JWT verification not yet implemented');
}
