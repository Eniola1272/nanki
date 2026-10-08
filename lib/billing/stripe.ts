import Stripe from 'stripe';
import type { PlanTier, BillingCycle } from '@/types/billing';
import { PRICING_DETAILS } from './plans';

let stripeInstance: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeServer(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return stripeInstance;
}

export interface CheckoutSessionParams {
  userId: string;
  userEmail: string;
  plan: PlanTier;
  cycle: BillingCycle;
  successUrl: string;
  cancelUrl: string;
  existingCustomerId?: string | null;
}

export async function createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string | null; sessionId?: string; isMock?: boolean }> {
  const stripe = getStripeServer();

  if (!stripe) {
    // Graceful offline/local development mock mode
    const mockUrl = `${params.successUrl}?session_id=mock_session_${Date.now()}&plan=${params.plan}&cycle=${params.cycle}&mock=true`;
    return {
      url: mockUrl,
      sessionId: `mock_session_${Date.now()}`,
      isMock: true,
    };
  }

  const pricing = PRICING_DETAILS[params.plan];
  const unitAmountCents = params.cycle === 'annual'
    ? Math.round(pricing.annualTotal * 100)
    : Math.round(pricing.monthlyPrice * 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: params.existingCustomerId || undefined,
    customer_email: params.existingCustomerId ? undefined : params.userEmail,
    client_reference_id: params.userId,
    metadata: {
      userId: params.userId,
      plan: params.plan,
      billingCycle: params.cycle,
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
        plan: params.plan,
        billingCycle: params.cycle,
      },
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Nanki ${pricing.name}`,
            description: `${params.plan === 'PRO' ? 'Unlimited quizzes, flashcards, advanced analytics' : 'Full Scholar plan with team workspaces'} (${params.cycle})`,
          },
          unit_amount: unitAmountCents,
          recurring: {
            interval: params.cycle === 'annual' ? 'year' : 'month',
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}&plan=${params.plan}`,
    cancel_url: params.cancelUrl,
  });

  return {
    url: session.url,
    sessionId: session.id,
    isMock: false,
  };
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string | null; isMock?: boolean }> {
  const stripe = getStripeServer();

  if (!stripe) {
    return {
      url: returnUrl,
      isMock: true,
    };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return {
    url: session.url,
    isMock: false,
  };
}
