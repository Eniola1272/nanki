export type PlanTier = 'FREE' | 'PRO' | 'SCHOLAR';

export type SubscriptionStatus =
  | 'INACTIVE'
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED';

export type BillingCycle = 'monthly' | 'annual';

export interface PlanLimits {
  maxQuizzes: number;
  maxDecks: number;
  exportPdfAnki: boolean;
  advancedAnalytics: boolean;
  studyReminders: boolean;
  streakProtectionPerMonth: number;
  workspaces: boolean;
  adFree: boolean;
  prioritySupport: boolean;
}

export interface UserBillingProfile {
  id: string;
  plan: PlanTier;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  has_used_trial: boolean;
  subscription_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  billing_cycle: BillingCycle | null;
}
