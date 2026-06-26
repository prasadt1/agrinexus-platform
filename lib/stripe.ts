/**
 * Stripe Client Configuration
 *
 * Uses AWS Secrets Manager for credentials (best practice).
 * Falls back to environment variables for local development.
 *
 * Note: Stripe client is initialized lazily on first use since
 * we need to await the secrets fetch.
 */

import Stripe from 'stripe';
import { getStripeSecrets, type StripeSecrets } from './stripe-secrets';
import type { PlanTier } from './entities/types';

// Cached Stripe instance and config
let stripeInstance: Stripe | null = null;
let stripeConfig: StripeSecrets | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize Stripe client from Secrets Manager.
 * Called lazily on first getStripe() call.
 */
async function initStripe(): Promise<void> {
  const secrets = await getStripeSecrets();

  if (!secrets?.secretKey) {
    console.warn('Stripe credentials not found - Stripe features disabled');
    return;
  }

  stripeConfig = secrets;
  stripeInstance = new Stripe(secrets.secretKey, {
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
  });
}

/**
 * Get the Stripe client instance.
 * Initializes from Secrets Manager on first call.
 */
export async function getStripe(): Promise<Stripe | null> {
  if (!initPromise) {
    initPromise = initStripe();
  }
  await initPromise;
  return stripeInstance;
}

/**
 * Get the Stripe Price ID for a plan tier.
 */
export async function getStripePriceIdForPlan(plan: PlanTier): Promise<string> {
  if (!initPromise) {
    initPromise = initStripe();
  }
  await initPromise;
  return stripeConfig?.priceIds?.[plan] || stripeConfig?.priceId || '';
}

/** @deprecated Use getStripePriceIdForPlan */
export async function getStripePriceId(): Promise<string> {
  return getStripePriceIdForPlan('growth');
}

/**
 * App URL for Stripe redirects.
 * This is safe as a public env var (no secret).
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// =============================================================================
// Legacy exports (for gradual migration)
// =============================================================================

// These synchronous exports are deprecated but kept for compatibility.
// New code should use getStripe() and getStripePriceId() instead.

/** @deprecated Use getStripe() instead */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-05-27.dahlia',
      typescript: true,
    })
  : null;

/** @deprecated Use getStripePriceId() instead */
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
