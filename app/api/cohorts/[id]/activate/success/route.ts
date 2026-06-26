/**
 * Stripe Checkout Success Callback
 *
 * GET /api/cohorts/[id]/activate/success?session_id=...
 *
 * Verifies the Stripe session is paid, then activates the cohort.
 * Redirects to cohort detail page.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCohort,
  activateCohort,
  createLicense,
} from '@/lib/entities';
import { getStripe } from '@/lib/stripe';
import type { PlanTier } from '@/lib/entities/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: cohortId } = await context.params;
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(
        new URL(`/dashboard/cohorts/${cohortId}?error=missing_session`, request.url)
      );
    }

    const stripe = await getStripe();
    if (!stripe) {
      return NextResponse.redirect(
        new URL(`/dashboard/cohorts/${cohortId}?error=stripe_not_configured`, request.url)
      );
    }

    // Retrieve and verify the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // Verify payment succeeded
    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(
        new URL(`/dashboard/cohorts/${cohortId}?error=payment_incomplete`, request.url)
      );
    }

    // Verify cohortId matches
    if (session.metadata?.cohortId !== cohortId) {
      return NextResponse.redirect(
        new URL(`/dashboard/cohorts/${cohortId}?error=invalid_session`, request.url)
      );
    }

    const tenantId = session.metadata?.tenantId;
    if (!tenantId) {
      return NextResponse.redirect(
        new URL(`/dashboard/cohorts/${cohortId}?error=missing_tenant`, request.url)
      );
    }

    // Check cohort exists and isn't already active
    const existing = await getCohort(tenantId, cohortId);
    if (!existing) {
      return NextResponse.redirect(
        new URL(`/dashboard/cohorts/${cohortId}?error=cohort_not_found`, request.url)
      );
    }

    if (existing.status === 'active') {
      // Already activated (maybe webhook beat us)
      return NextResponse.redirect(
        new URL(`/dashboard/cohorts/${cohortId}?activated=true`, request.url)
      );
    }

    // Create license from Stripe subscription
    const subscription = session.subscription as { id: string; current_period_start: number; current_period_end: number } | null;

    if (subscription) {
      const plan = (session.metadata?.plan || 'growth') as PlanTier;
      await createLicense(tenantId, {
        cohortId,
        stripeSubId: subscription.id,
        plan,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      });
    }

    // Activate the cohort
    await activateCohort(tenantId, cohortId);

    // Redirect to cohort detail with success flag
    return NextResponse.redirect(
      new URL(`/dashboard/cohorts/${cohortId}?activated=true`, request.url)
    );
  } catch (error) {
    console.error('Error processing checkout success:', error);
    const { id: cohortId } = await context.params;
    return NextResponse.redirect(
      new URL(`/dashboard/cohorts/${cohortId}?error=activation_failed`, request.url)
    );
  }
}
