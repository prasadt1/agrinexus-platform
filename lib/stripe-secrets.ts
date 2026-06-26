import type { PlanTier } from '@/lib/entities/types';

export interface StripeSecrets {
  secretKey: string;
  priceId?: string;
  priceIds?: Partial<Record<PlanTier, string>>;
}

function normalizePriceIds(secrets: StripeSecrets): StripeSecrets {
  return {
    ...secrets,
    priceIds: secrets.priceIds || {
      starter: secrets.priceId,
      growth: secrets.priceId,
      enterprise: secrets.priceId,
    },
  };
}

/**
 * Get Stripe credentials.
 *
 * Source of truth: AWS Secrets Manager (secret `Stripe-Secret`).
 * Environment variables are only a local-dev fallback when Secrets Manager
 * is unreachable or returns nothing.
 */
export async function getStripeSecrets(): Promise<StripeSecrets | null> {
  // Primary: AWS Secrets Manager
  const { getSecret } = await import('./secrets');
  const secrets = await getSecret<StripeSecrets>('Stripe-Secret');
  if (secrets?.secretKey) {
    return normalizePriceIds(secrets);
  }

  // Local-dev fallback: environment variables
  if (process.env.STRIPE_SECRET_KEY) {
    return normalizePriceIds({
      secretKey: process.env.STRIPE_SECRET_KEY,
      priceId: process.env.STRIPE_PRICE_ID,
      priceIds: {
        starter: process.env.STRIPE_PRICE_STARTER || process.env.STRIPE_PRICE_ID,
        growth: process.env.STRIPE_PRICE_GROWTH || process.env.STRIPE_PRICE_ID,
        enterprise: process.env.STRIPE_PRICE_ENTERPRISE || process.env.STRIPE_PRICE_ID,
      },
    });
  }

  return null;
}
