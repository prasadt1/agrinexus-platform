/**
 * Stripe Client Configuration
 *
 * Uses test mode for hackathon demo.
 * Secrets via env vars only - never committed.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set - Stripe features disabled');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-05-27.dahlia',
      typescript: true,
    })
  : null;

// Price ID for cohort activation (monthly subscription)
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';

// App URL for redirects
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
