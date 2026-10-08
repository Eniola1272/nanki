'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlanTier, BillingCycle } from '@/types/billing';
import { PRICING_DETAILS, PLAN_LIMITS } from '@/lib/billing/plans';
import { showToast } from '@/lib/utils/toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string | null;
  hasUsedTrial?: boolean;
  onActivateTrial?: () => Promise<boolean>;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  reason,
  hasUsedTrial = false,
  onActivateTrial,
}: UpgradeModalProps) {
  const router = useRouter();
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [loadingPlan, setLoadingPlan] = useState<PlanTier | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartTrial = async () => {
    if (!onActivateTrial) return;
    setTrialLoading(true);
    try {
      const ok = await onActivateTrial();
      if (ok) onClose();
    } finally {
      setTrialLoading(false);
    }
  };

  const handleCheckout = async (plan: PlanTier) => {
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, cycle }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast.error(data.error || 'Failed to initiate checkout.');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      showToast.error('Network error during checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          aria-label="Close dialog"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[16px]">bolt</span> Upgrade Your Memory
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface mt-1">
            Unlock Unlimited Learning
          </h2>
          {reason === 'quiz_limit' && (
            <p className="text-sm text-tertiary font-semibold mt-2">
              You&apos;ve reached the free limit of {PLAN_LIMITS.FREE.maxQuizzes} quizzes. Upgrade to keep creating without limits!
            </p>
          )}
          {reason === 'deck_limit' && (
            <p className="text-sm text-tertiary font-semibold mt-2">
              You&apos;ve reached the free limit of {PLAN_LIMITS.FREE.maxDecks} decks. Upgrade to build an unlimited flashcard library!
            </p>
          )}
          {!reason && (
            <p className="text-sm text-on-surface-variant mt-2">
              Accelerate your study sessions with advanced spaced repetition and full freedom.
            </p>
          )}
        </div>

        {/* 1-click Trial banner if eligible */}
        {!hasUsedTrial && onActivateTrial && (
          <div className="mb-6 rounded-2xl bg-primary-fixed/20 border border-primary/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-sm font-extrabold text-primary flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-[18px]">verified</span> 7-Day Free Trial Available
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Instant access to Student Pro. No credit card required upfront.
              </p>
            </div>
            <button
              onClick={handleStartTrial}
              disabled={trialLoading}
              className="bg-primary text-on-primary font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full hover:bg-primary-container transition-all shrink-0 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {trialLoading ? 'Activating…' : 'Start 7-Day Free Trial'}
            </button>
          </div>
        )}

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setCycle('monthly')}
            className={`text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              cycle === 'monthly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle('annual')}
            className={`text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              cycle === 'annual' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Annual
            <span className="text-[10px] font-bold bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">
              Save 37%
            </span>
          </button>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Student Pro */}
          <div className="relative rounded-2xl p-5 bg-surface-container-low border-2 border-primary/40 flex flex-col justify-between">
            <span className="absolute -top-2.5 right-4 bg-primary text-on-primary text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Popular
            </span>
            <div>
              <p className="text-sm font-bold text-primary">Student Pro</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-on-surface">
                  ${cycle === 'annual' ? PRICING_DETAILS.PRO.annualPrice : PRICING_DETAILS.PRO.monthlyPrice}
                </span>
                <span className="text-xs text-on-surface-variant">/mo</span>
              </div>
              {cycle === 'annual' && (
                <p className="text-[11px] text-on-surface-variant mt-0.5">Billed ${PRICING_DETAILS.PRO.annualTotal}/yr</p>
              )}
              <ul className="mt-4 space-y-2 text-xs text-on-surface">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Unlimited quizzes & decks
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Advanced spaced repetition
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> PDF & Anki export
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> 1 streak freeze per month
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> 100% ad-free experience
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleCheckout('PRO')}
              disabled={loadingPlan === 'PRO'}
              className="mt-6 w-full py-2.5 rounded-full font-bold text-xs sm:text-sm bg-primary text-on-primary hover:bg-primary-container transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingPlan === 'PRO' ? 'Redirecting…' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Scholar */}
          <div className="rounded-2xl p-5 bg-surface-container-lowest border border-outline-variant flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-secondary">Scholar</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-on-surface">
                  ${cycle === 'annual' ? PRICING_DETAILS.SCHOLAR.annualPrice : PRICING_DETAILS.SCHOLAR.monthlyPrice}
                </span>
                <span className="text-xs text-on-surface-variant">/mo</span>
              </div>
              {cycle === 'annual' && (
                <p className="text-[11px] text-on-surface-variant mt-0.5">Billed ${PRICING_DETAILS.SCHOLAR.annualTotal}/yr</p>
              )}
              <ul className="mt-4 space-y-2 text-xs text-on-surface">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Team workspaces (10 members)
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Bulk CSV templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Unlimited streak freezes
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Priority support
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleCheckout('SCHOLAR')}
              disabled={loadingPlan === 'SCHOLAR'}
              className="mt-6 w-full py-2.5 rounded-full font-bold text-xs sm:text-sm border border-outline-variant hover:bg-surface-container-high text-on-surface transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingPlan === 'SCHOLAR' ? 'Redirecting…' : 'Upgrade to Scholar'}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-on-surface-variant mt-6">
          Cancel anytime from your account settings. Secure payment powered by Stripe.
        </p>
      </div>
    </div>
  );
}
