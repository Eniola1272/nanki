'use client';

import type { PlanTier, SubscriptionStatus } from '@/types/billing';

interface PlanBadgeProps {
  plan?: PlanTier;
  status?: SubscriptionStatus;
  trialEndsAt?: string | null;
  onUpgradeClick?: () => void;
}

export default function PlanBadge({
  plan = 'FREE',
  status = 'INACTIVE',
  trialEndsAt,
  onUpgradeClick,
}: PlanBadgeProps) {
  const isTrial = status === 'TRIALING';
  let trialDaysRemaining = 0;

  if (isTrial && trialEndsAt) {
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    trialDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const isPaidActive = status === 'ACTIVE';

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          isPaidActive
            ? plan === 'SCHOLAR'
              ? 'bg-secondary/15 text-secondary border border-secondary/30'
              : 'bg-primary/15 text-primary border border-primary/30'
            : isTrial
            ? 'bg-tertiary/15 text-tertiary border border-tertiary/30'
            : 'bg-surface-container-highest text-on-surface-variant'
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">
          {isPaidActive ? 'workspace_premium' : isTrial ? 'timelapse' : 'person'}
        </span>
        {isTrial
          ? `PRO TRIAL (${trialDaysRemaining}d left)`
          : isPaidActive
          ? plan === 'SCHOLAR'
            ? 'SCHOLAR'
            : 'STUDENT PRO'
          : 'FREE PLAN'}
      </span>

      {(!isPaidActive || isTrial) && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          {isTrial ? 'Keep Pro' : 'Upgrade'}
        </button>
      )}
    </div>
  );
}
