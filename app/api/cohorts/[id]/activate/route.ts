/**
 * Cohort Activation API (Stripe-gated)
 *
 * POST /api/cohorts/[id]/activate - Create Stripe Checkout session
 *
 * Flow:
 * 1. POST creates Checkout session, returns checkoutUrl
 * 2. User completes payment on Stripe
 * 3. Stripe redirects to /dashboard/cohorts/[id]?activated=true
 * 4. Webhook (or success callback) activates the cohort
 *
 * Demo path (/demo-activate) bypasses Stripe for judges.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, AuthError, requireAdmin } from '@/lib/api/auth';
import { getCohort } from '@/lib/entities';
import { getStripe, getStripePriceIdForPlan, APP_URL } from '@/lib/stripe';
import type { PlanTier } from '@/lib/entities/types';
import { z } from 'zod';

const activateSchema = z.object({
  plan: z.enum(['starter', 'growth', 'enterprise']).default('growth'),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// =============================================================================
// POST /api/cohorts/[id]/activate - Create Stripe Checkout Session
// =============================================================================

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const ctx = await getAuthContext(request);
    requireAdmin(ctx);
    const { tenantId } = ctx;
    const { id: cohortId } = await context.params;

    let plan: PlanTier = 'growth';
    try {
      const body = await request.json();
      const parsed = activateSchema.safeParse(body);
      if (parsed.success) plan = parsed.data.plan;
    } catch {
      // empty body ok
    }

    // Verify cohort exists and belongs to this tenant
    const existing = await getCohort(tenantId, cohortId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    if (existing.status === 'active') {
      return NextResponse.json(
        { error: 'Cohort is already active' },
        { status: 400 }
      );
    }

    // Get Stripe client and price ID from Secrets Manager
    const stripe = await getStripe();
    const priceId = await getStripePriceIdForPlan(plan);

    if (!stripe || !priceId) {
      return NextResponse.json(
        {
          error: 'Stripe not configured',
          hint: 'Set STRIPE_SECRET_KEY and STRIPE_PRICE_STARTER/GROWTH/ENTERPRISE in .env.local',
        },
        { status: 503 }
      );
    }

    const productName = `AgriNexus — ${existing.district} cohort`;
    const productDescription = `District advisory license (${plan}) · cohort ${cohortId.slice(0, 8)}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        tenantId,
        cohortId,
        district: existing.district,
        plan,
      },
      subscription_data: {
        description: productDescription,
        metadata: {
          tenantId,
          cohortId,
          district: existing.district,
          plan,
          productName,
        },
      },
      success_url: `${APP_URL}/api/cohorts/${cohortId}/activate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/dashboard/cohorts/${cohortId}?canceled=true`,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      plan,
      message: `Redirect to Stripe Checkout for ${existing.district} (${plan})`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
