'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProgressHistory from '@/components/nanki/ProgressHistory';
import NankiShell from '@/components/nanki/NankiShell';
import PlanBadge from '@/components/billing/PlanBadge';
import { useNankiStore } from '@/lib/nanki-store';
import { PLAN_LIMITS } from '@/lib/billing/plans';
import { showToast } from '@/lib/utils/toast';

export default function ProfilePage() {
  const {
    profile,
    quizzes: allQuizzes,
    decks: allDecks,
    userId,
    resetAllState,
    signingOut,
    handleDeleteQuiz,
    handleDeleteDeck,
    effectivePlan,
    isTrial,
    trialDaysRemaining,
    openUpgradeModal,
    activateTrial,
  } = useNankiStore();
  const quizzes = allQuizzes.filter(q => q.ownerId === userId);
  const decks = allDecks.filter(d => d.ownerId === userId);
  const [profileTab, setProfileTab] = useState<'quizzes' | 'decks'>('quizzes');
  const [portalLoading, setPortalLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/create-portal-session', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast.error(data.error || 'Failed to open billing portal');
      }
    } catch {
      showToast.error('Network error opening billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setTrialLoading(true);
    try {
      await activateTrial();
    } finally {
      setTrialLoading(false);
    }
  };

  const quizLimit = PLAN_LIMITS[effectivePlan].maxQuizzes;
  const deckLimit = PLAN_LIMITS[effectivePlan].maxDecks;
  const quizPct = quizLimit === Infinity ? 100 : Math.min(100, (quizzes.length / quizLimit) * 100);
  const deckPct = deckLimit === Infinity ? 100 : Math.min(100, (decks.length / deckLimit) * 100);

  return (
    <NankiShell>
      <main className="w-full max-w-[800px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">

        {/* Profile header */}
        <section className="flex flex-col items-center text-center space-y-4 py-8 px-4 rounded-3xl bg-surface-container-lowest border border-outline-variant">
          <div className="relative">
            <img alt="Profile Large" className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-lowest shadow-md select-none" src={profile.avatar} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface">{profile.name}</h1>
            <p className="text-xs md:text-sm text-on-surface-variant max-w-sm mt-1">{profile.bio}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <PlanBadge
              plan={profile.plan}
              status={profile.subscriptionStatus}
              trialEndsAt={profile.trialEndsAt}
              onUpgradeClick={() => openUpgradeModal()}
            />
            <span className="bg-surface-container-highest text-on-surface-variant font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">Level {profile.level}</span>
            <span className="bg-tertiary/10 text-tertiary font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">{profile.totalQuizzesTaken === 0 ? 'New learner' : 'Active learner'}</span>
          </div>
        </section>

        {/* Subscription & Plan Limits card */}
        <section className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/50">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Membership & Plan</span>
              <h2 className="text-lg font-extrabold text-on-surface mt-0.5">
                {effectivePlan === 'SCHOLAR'
                  ? 'Scholar Workspace Plan'
                  : effectivePlan === 'PRO'
                  ? isTrial
                    ? `Student Pro (7-Day Trial — ${trialDaysRemaining}d remaining)`
                    : 'Student Pro Plan'
                  : 'Free Starter Plan'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {!profile.hasUsedTrial && effectivePlan === 'FREE' && (
                <button
                  onClick={handleStartTrial}
                  disabled={trialLoading}
                  className="bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-full hover:bg-primary-container transition-all cursor-pointer disabled:opacity-50"
                >
                  {trialLoading ? 'Activating…' : 'Start 7-Day Pro Trial'}
                </button>
              )}
              {effectivePlan === 'FREE' || isTrial ? (
                <button
                  onClick={() => openUpgradeModal()}
                  className="bg-primary-fixed text-primary font-bold text-xs px-4 py-2 rounded-full hover:bg-primary-container hover:text-on-primary transition-all cursor-pointer"
                >
                  Upgrade Plan
                </button>
              ) : profile.stripeCustomerId ? (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="border border-outline-variant text-on-surface font-bold text-xs px-4 py-2 rounded-full hover:bg-surface-container-high transition-all cursor-pointer disabled:opacity-50"
                >
                  {portalLoading ? 'Opening portal…' : 'Manage Subscription'}
                </button>
              ) : null}
            </div>
          </div>

          {/* Usage Quotas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">quiz</span> Quizzes Created
                </span>
                <span className="font-extrabold text-on-surface-variant">
                  {quizLimit === Infinity ? `${quizzes.length} (Unlimited)` : `${quizzes.length} / ${quizLimit}`}
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    quizLimit !== Infinity && quizzes.length >= quizLimit ? 'bg-error' : 'bg-primary'
                  }`}
                  style={{ width: `${quizPct}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">style</span> Flashcard Decks
                </span>
                <span className="font-extrabold text-on-surface-variant">
                  {deckLimit === Infinity ? `${decks.length} (Unlimited)` : `${decks.length} / ${deckLimit}`}
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    deckLimit !== Infinity && decks.length >= deckLimit ? 'bg-error' : 'bg-secondary'
                  }`}
                  style={{ width: `${deckPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <button onClick={() => void resetAllState()} disabled={signingOut} className="rounded-full border border-outline-variant px-5 py-2 text-sm font-bold disabled:opacity-50">{signingOut ? 'Logging out…' : 'Log out'}</button>

        {/* Stats bento */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 md:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 flex flex-col justify-between items-start shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 text-primary mb-4 font-bold text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
              <span>Next level progress</span>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-end mb-1">
                <span className="text-2xl font-extrabold text-on-surface leading-none">{profile.xpProgress}%</span>
                <span className="text-[11px] text-tertiary font-bold">Level {profile.level + 1}</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full transition-all duration-300" style={{ width: `${profile.xpProgress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-1.5 text-secondary font-bold text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-secondary text-[20px]">quiz</span>
              <span>Total Quizzes</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-on-surface block leading-none mb-1">{profile.totalQuizzesTaken}</span>
              <span className="text-xs text-secondary font-medium">Completed attempts</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-1.5 text-tertiary font-bold text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-tertiary fill text-[20px]">local_fire_department</span>
              <span>Current Streak</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-on-surface block leading-none mb-1">{profile.streak} Days</span>
              <span className="text-xs text-secondary font-medium">Personal best: {profile.personalBestStreak}</span>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <div className="flex justify-between items-center bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-4 gap-4 overflow-x-auto hide-scrollbar">
            {profile.badges.map(badge => (
              <div key={badge.id} className="flex-shrink-0 w-24 flex flex-col items-center gap-1">
                <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${badge.colorClass}`}>
                  <span className={`material-symbols-outlined text-[28px] ${badge.earned ? 'fill' : ''}`}>{badge.icon}</span>
                </div>
                <span className="text-[10px] text-center text-on-surface-variant font-bold leading-tight">{badge.title}</span>
              </div>
            ))}
          </div>
        </section>

        <ProgressHistory />

        {/* My content tabs */}
        <section className="space-y-4">
          <div className="flex border-b border-outline-variant">
            {(['quizzes', 'decks'] as const).map(tab => (
              <button key={tab} onClick={() => setProfileTab(tab)}
                className={`flex-1 pb-3 text-center font-bold text-sm transition-colors cursor-pointer border-b-2 ${profileTab === tab ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-on-surface'}`}>
                {tab === 'quizzes' ? 'My Quizzes' : 'My Decks'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {(profileTab === 'quizzes' ? quizzes.length : decks.length) === 0 && <p className="text-sm text-secondary">You haven’t created any {profileTab} yet.</p>}
            {profileTab === 'quizzes' ? quizzes.map(item => (
              <div key={item.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">science</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{item.title}</h4>
                    <p className="text-xs text-secondary">{item.category} · {item.published ? 'Public' : 'Private'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-sm font-bold text-tertiary">{item.masteredPercentage || 0}% best</span>
                    <span className="text-[10px] text-outline">{item.questions.length} Questions</span>
                  </div>
                  <Link href={`/quiz/${item.id}/edit`} className="text-xs font-bold text-primary">Edit</Link>
                  <button
                    onClick={() => { if (confirm(`Delete quiz "${item.title}"?`)) handleDeleteQuiz(item.id); }}
                    className="text-outline hover:text-error p-1 hover:bg-surface-container rounded-full"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            )) : decks.map(deck => (
              <div key={deck.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">style</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{deck.title}</h4>
                    <p className="text-xs text-secondary">{deck.cards.length} Flashcards · {deck.published ? 'Public' : 'Private'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-sm font-bold text-primary">Study mode</span>
                    <span className="text-[10px] text-outline">{deck.cards.length} cards</span>
                  </div>
                  <Link href={`/deck/${deck.id}/edit`} className="text-xs font-bold text-primary">Edit</Link>
                  <button
                    onClick={() => { if (confirm(`Delete deck "${deck.title}"?`)) handleDeleteDeck(deck.id); }}
                    className="text-outline hover:text-error p-1 hover:bg-surface-container rounded-full"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </NankiShell>
  );
}
