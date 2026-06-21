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
import { getAuthContext, AuthError } from '@/lib/api/auth';
import { getCohort } from '@/lib/entities';
import { stripe, STRIPE_PRICE_ID, APP_URL } from '@/lib/stripe';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// =============================================================================
// POST /api/cohorts/[id]/activate - Create Stripe Checkout Session
// =============================================================================

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await getAuthContext(request);
    const { id: cohortId } = await context.params;

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

    // Check if Stripe is configured
    if (!stripe || !STRIPE_PRICE_ID) {
      return NextResponse.json(
        {
          error: 'Stripe not configured',
          hint: 'Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in .env.local',
        },
        { status: 503 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        tenantId,
        cohortId,
        district: existing.district,
      },
      success_url: `${APP_URL}/api/cohorts/${cohortId}/activate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/dashboard/cohorts/${cohortId}?canceled=true`,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      message: 'Redirect to Stripe Checkout to complete activation',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
