import type { PlanTier, PlanLimits, UserBillingProfile } from '@/types/billing';

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: {
    maxQuizzes: 10,
    maxDecks: 5,
    exportPdfAnki: false,
    advancedAnalytics: false,
    studyReminders: false,
    streakProtectionPerMonth: 0,
    workspaces: false,
    adFree: false,
    prioritySupport: false,
  },
  PRO: {
    maxQuizzes: Infinity,
    maxDecks: Infinity,
    exportPdfAnki: true,
    advancedAnalytics: true,
    studyReminders: true,
    streakProtectionPerMonth: 1,
    workspaces: false,
    adFree: true,
    prioritySupport: false,
  },
  SCHOLAR: {
    maxQuizzes: Infinity,
    maxDecks: Infinity,
    exportPdfAnki: true,
    advancedAnalytics: true,
    studyReminders: true,
    streakProtectionPerMonth: Infinity,
    workspaces: true,
    adFree: true,
    prioritySupport: true,
  },
};

export const PRICING_DETAILS = {
  FREE: {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    annualTotal: 0,
    trialDays: 0,
  },
  PRO: {
    name: 'Student Pro',
    monthlyPrice: 7.99,
    annualPrice: 4.99,
    annualTotal: 59.88,
    trialDays: 7,
  },
  SCHOLAR: {
    name: 'Scholar',
    monthlyPrice: 14.99,
    annualPrice: 9.99,
    annualTotal: 119.88,
    trialDays: 7,
  },
} as const;

export function isTrialActive(profile: Partial<UserBillingProfile> | null | undefined, now = new Date()): boolean {
  if (!profile || profile.subscription_status !== 'TRIALING') return false;
  if (!profile.trial_ends_at) return false;
  const trialEnd = new Date(profile.trial_ends_at);
  return trialEnd.getTime() > now.getTime();
}

export function getTrialDaysRemaining(profile: Partial<UserBillingProfile> | null | undefined, now = new Date()): number {
  if (!isTrialActive(profile, now) || !profile?.trial_ends_at) return 0;
  const trialEnd = new Date(profile.trial_ends_at);
  const diffMs = trialEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getEffectivePlan(profile: Partial<UserBillingProfile> | null | undefined, now = new Date()): PlanTier {
  if (!profile) return 'FREE';

  if (profile.subscription_status === 'ACTIVE') {
    return profile.plan === 'SCHOLAR' ? 'SCHOLAR' : profile.plan === 'PRO' ? 'PRO' : 'FREE';
  }

  if (profile.subscription_status === 'TRIALING' && isTrialActive(profile, now)) {
    return profile.plan === 'SCHOLAR' ? 'SCHOLAR' : 'PRO';
  }

  return 'FREE';
}

export function getPlanLimits(profile: Partial<UserBillingProfile> | null | undefined, now = new Date()): PlanLimits {
  const plan = getEffectivePlan(profile, now);
  return PLAN_LIMITS[plan];
}

export function canCreateQuiz(profile: Partial<UserBillingProfile> | null | undefined, currentCount: number, now = new Date()): boolean {
  const limits = getPlanLimits(profile, now);
  return currentCount < limits.maxQuizzes;
}

export function canCreateDeck(profile: Partial<UserBillingProfile> | null | undefined, currentCount: number, now = new Date()): boolean {
  const limits = getPlanLimits(profile, now);
  return currentCount < limits.maxDecks;
}

export function hasPlanFeature(
  profile: Partial<UserBillingProfile> | null | undefined,
  feature: keyof Omit<PlanLimits, 'maxQuizzes' | 'maxDecks' | 'streakProtectionPerMonth'>,
  now = new Date()
): boolean {
  const limits = getPlanLimits(profile, now);
  return Boolean(limits[feature]);
}
