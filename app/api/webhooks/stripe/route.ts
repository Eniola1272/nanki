import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/billing/stripe';
import { processStripeWebhookEvent } from '@/lib/billing/webhook-processor';
import { createAdminClient } from '@/lib/db/supabase-admin';
import type Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      const stripe = getStripeServer();
      if (!stripe) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
      }
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid signature';
        return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
      }
    } else {
      // In local dev/test without webhook signing secret configured
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    }

    const processed = processStripeWebhookEvent({
      type: event.type,
      data: { object: event.data.object as unknown as Record<string, unknown> },
    });

    if (processed.action === 'IGNORED') {
      return NextResponse.json({ received: true, ignored: true });
    }

    const admin = createAdminClient();

    if (processed.action === 'ACTIVATE') {
      if (!processed.userId) {
        return NextResponse.json({ error: 'Missing userId in session' }, { status: 400 });
      }

      await admin
        .from('profiles')
        .update({
          plan: processed.plan,
          subscription_status: processed.subscriptionStatus,
          is_premium: processed.isPremium,
          stripe_customer_id: processed.stripeCustomerId,
          stripe_subscription_id: processed.stripeSubscriptionId,
          billing_cycle: processed.billingCycle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', processed.userId);
    } else if (processed.action === 'UPDATE') {
      let query = admin.from('profiles').update({
        subscription_status: processed.subscriptionStatus,
        is_premium: processed.isPremium,
        subscription_ends_at: processed.subscriptionEndsAt,
        updated_at: new Date().toISOString(),
      });

      if (processed.stripeSubscriptionId) {
        query = query.eq('stripe_subscription_id', processed.stripeSubscriptionId);
      } else if (processed.stripeCustomerId) {
        query = query.eq('stripe_customer_id', processed.stripeCustomerId);
      }

      await query;
    } else if (processed.action === 'CANCEL') {
      let query = admin.from('profiles').update({
        plan: processed.plan,
        subscription_status: processed.subscriptionStatus,
        is_premium: processed.isPremium,
        updated_at: new Date().toISOString(),
      });

      if (processed.stripeSubscriptionId) {
        query = query.eq('stripe_subscription_id', processed.stripeSubscriptionId);
      } else if (processed.stripeCustomerId) {
        query = query.eq('stripe_customer_id', processed.stripeCustomerId);
      }

      await query;
    }

    return NextResponse.json({ received: true, processed: processed.action });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
