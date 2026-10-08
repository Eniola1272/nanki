import type { PlanTier, SubscriptionStatus } from '@/types/billing';

export interface ProcessedWebhookResult {
  userId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan?: PlanTier;
  subscriptionStatus?: SubscriptionStatus;
  isPremium?: boolean;
  billingCycle?: 'monthly' | 'annual';
  subscriptionEndsAt?: string;
  action: 'ACTIVATE' | 'UPDATE' | 'CANCEL' | 'IGNORED';
}

export function processStripeWebhookEvent(event: {
  type: string;
  data: { object: Record<string, unknown> };
}): ProcessedWebhookResult {
  const obj = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const metadata = (obj.metadata as Record<string, string>) || {};
      const userId = (obj.client_reference_id as string) || metadata.userId;
      const stripeCustomerId = obj.customer as string;
      const stripeSubscriptionId = obj.subscription as string;
      const plan = (metadata.plan as PlanTier) || 'PRO';
      const billingCycle = (metadata.billingCycle as 'monthly' | 'annual') || 'monthly';

      return {
        action: 'ACTIVATE',
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        plan,
        subscriptionStatus: 'ACTIVE',
        isPremium: true,
        billingCycle,
      };
    }

    case 'customer.subscription.updated': {
      const stripeCustomerId = obj.customer as string;
      const stripeSubscriptionId = obj.id as string;
      const stripeStatus = obj.status as string;
      const currentPeriodEnd = typeof obj.current_period_end === 'number'
        ? new Date(obj.current_period_end * 1000).toISOString()
        : undefined;

      let subscriptionStatus: SubscriptionStatus = 'ACTIVE';
      let isPremium = true;

      if (stripeStatus === 'active' || stripeStatus === 'trialing') {
        subscriptionStatus = 'ACTIVE';
        isPremium = true;
      } else if (stripeStatus === 'past_due') {
        subscriptionStatus = 'PAST_DUE';
        isPremium = false;
      } else if (stripeStatus === 'canceled' || stripeStatus === 'unpaid') {
        subscriptionStatus = 'CANCELED';
        isPremium = false;
      }

      return {
        action: 'UPDATE',
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus,
        isPremium,
        subscriptionEndsAt: currentPeriodEnd,
      };
    }

    case 'customer.subscription.deleted': {
      const stripeCustomerId = obj.customer as string;
      const stripeSubscriptionId = obj.id as string;

      return {
        action: 'CANCEL',
        stripeCustomerId,
        stripeSubscriptionId,
        plan: 'FREE',
        subscriptionStatus: 'CANCELED',
        isPremium: false,
      };
    }

    default:
      return { action: 'IGNORED' };
  }
}
