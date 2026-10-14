'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNankiStore } from '@/lib/nanki-store';
import { hasPlanFeature } from '@/lib/billing/plans';
import { computeAnalyticsSummary } from '@/lib/analytics/metrics';
import UpgradeModal from '@/components/billing/UpgradeModal';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { attempts, flashcardSessions, profile, handleSaveDeck, decks } = useNankiStore();
  const [timelineRange, setTimelineRange] = useState<7 | 14 | 30>(14);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [creatingCardId, setCreatingCardId] = useState<string | null>(null);

  const isPro = hasPlanFeature(profile, 'advancedAnalytics');

  const analytics = useMemo(() => {
    return computeAnalyticsSummary(attempts, flashcardSessions, timelineRange);
  }, [attempts, flashcardSessions, timelineRange]);

  const handleCreateCardFromQuestion = async (q: (typeof analytics.weakestQuestions)[0]) => {
    setCreatingCardId(q.questionId);
    try {
      let targetDeck = decks.find((d) => d.title.includes('Mistakes') || d.title.includes('Review'));
      if (!targetDeck) {
        targetDeck = {
          id: `deck-${Date.now()}`,
          title: 'Weak Areas & Review Cards',
          category: q.category || 'Medicine',
          description: 'Spaced repetition flashcards created from toughest questions.',
          cards: [],
          published: false,
        };
      }

      const newCard = {
        id: `card-${Date.now()}`,
        front: q.questionText,
        back: q.explanation || `Question from ${q.quizTitle}. Review answer keys in quiz.`,
        extraNote: `Subject: ${q.category} • Accuracy: ${q.accuracy}%`,
      };

      const updatedDeck = {
        ...targetDeck,
        cards: [newCard, ...targetDeck.cards],
      };

      await handleSaveDeck(updatedDeck);
      router.push(`/deck/${updatedDeck.id}/play`);
    } finally {
      setCreatingCardId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[28px]">insights</span>
            <h1 className="font-headline-sm text-2xl md:text-3xl font-extrabold text-on-surface">
              Performance Analytics
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {isPro ? 'Pro Active' : 'Pro Feature'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-secondary">
            Clinical mastery, question-level accuracy, and revision retention insights.
          </p>
        </div>

        {isPro && (
          <div className="flex items-center bg-surface-container-low p-1 rounded-2xl border border-outline-variant/60 shrink-0">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimelineRange(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timelineRange === r
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {r}D
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Free Plan Pro Upgrade Teaser Banner */}
      {!isPro && (
        <div className="mb-8 p-6 bg-gradient-to-r from-primary/15 via-primary/5 to-surface-container-low border border-primary/30 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[26px]">analytics</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                Unlock Pro Clinical Analytics
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  STUDENT PRO
                </span>
              </h3>
              <p className="text-xs text-secondary mt-1 leading-relaxed max-w-xl">
                Identify your weakest topics before exam day with question-level error metrics, category mastery breakdowns, daily retention trends, and PDF / Anki exports.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-primary text-on-primary font-bold text-xs px-6 py-3 rounded-full hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Start 7-Day Free Trial
          </button>
        </div>
      )}

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Overall Accuracy</span>
            <span className="material-symbols-outlined text-[20px] text-primary">target</span>
          </div>
          <p className="text-3xl font-extrabold text-on-surface">
            {analytics.overallAccuracy}%
          </p>
          <span className="text-[11px] text-secondary mt-1 block">
            Across {analytics.totalQuestionsAnswered} answered questions
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Quizzes Taken</span>
            <span className="material-symbols-outlined text-[20px] text-emerald-500">task_alt</span>
          </div>
          <p className="text-3xl font-extrabold text-on-surface">
            {analytics.totalQuizzesTaken}
          </p>
          <span className="text-[11px] text-secondary mt-1 block">
            Completed assessments
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Cards Reviewed</span>
            <span className="material-symbols-outlined text-[20px] text-amber-500">style</span>
          </div>
          <p className="text-3xl font-extrabold text-on-surface">
            {analytics.totalCardsReviewed}
          </p>
          <span className="text-[11px] text-secondary mt-1 block">
            FSRS spaced repetition
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Strongest Subject</span>
            <span className="material-symbols-outlined text-[20px] text-purple-500">military_tech</span>
          </div>
          <p className="text-xl font-extrabold text-primary truncate" title={analytics.strongestCategory}>
            {analytics.strongestCategory}
          </p>
          <span className="text-[11px] text-secondary mt-1 block truncate">
            Needs work: {analytics.weakestCategory}
          </span>
        </div>
      </div>

      {/* Main Analytics Content (Protected by Pro Gating Blur if Free) */}
      <div className={`relative ${!isPro ? 'select-none' : ''}`}>
        {!isPro && (
          <div className="absolute inset-0 z-20 backdrop-blur-[6px] bg-surface/60 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">lock</span>
            </div>
            <h3 className="font-extrabold text-lg text-on-surface mb-1">
              Detailed Question Analytics Locked
            </h3>
            <p className="text-xs text-secondary max-w-md mb-4 leading-relaxed">
              Upgrade to Student Pro to analyze question-level errors, review activity trends over time, and export flashcards to Anki.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-primary text-on-primary font-bold text-xs px-5 py-2.5 rounded-full hover:bg-primary-container transition-all shadow-md cursor-pointer"
            >
              Unlock Analytics with Pro
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* Daily Activity & Accuracy Timeline */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-base text-on-surface">Daily Learning &amp; Accuracy Trend</h3>
                <p className="text-xs text-secondary">Questions attempted and accuracy over the last {timelineRange} days.</p>
              </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 items-end min-h-[160px] pt-6 pb-2">
              {analytics.timeline.map((point) => {
                const maxQuestions = Math.max(...analytics.timeline.map((p) => p.questionsAnswered), 10);
                const heightPercent = Math.max(12, Math.round((point.questionsAnswered / maxQuestions) * 100));

                return (
                  <div key={point.date} className="flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-on-surface text-surface text-[10px] font-bold p-1.5 rounded-lg pointer-events-none whitespace-nowrap z-30 shadow-lg">
                      <div>{point.dayLabel}</div>
                      <div>{point.questionsAnswered} qs • {point.accuracy}% acc</div>
                      <div>+{point.xpEarned} XP</div>
                    </div>

                    <div className="w-full flex justify-center items-end h-28">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[24px] rounded-lg transition-all ${
                          point.questionsAnswered > 0
                            ? point.accuracy >= 75
                              ? 'bg-emerald-500 hover:bg-emerald-600'
                              : point.accuracy >= 50
                              ? 'bg-primary hover:bg-primary-container'
                              : 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-surface-container-high'
                        }`}
                      />
                    </div>
                    <span className="text-[9px] text-outline font-mono truncate max-w-full">
                      {point.date.slice(-2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-outline-variant/60 text-xs text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;= 75% Accuracy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> 50-74% Accuracy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> &lt; 50% Accuracy
              </span>
            </div>
          </div>

          {/* Category Mastery Breakdown */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-on-surface mb-1">Subject Mastery Breakdown</h3>
            <p className="text-xs text-secondary mb-6">Weighted clinical accuracy and question volume per topic.</p>

            {analytics.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-secondary py-6 text-center">Complete quizzes to populate subject mastery insights.</p>
            ) : (
              <div className="space-y-4">
                {analytics.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-on-surface">{cat.category}</span>
                      <span className="font-semibold text-secondary">
                        {cat.correctQuestions}/{cat.totalQuestions} ({cat.accuracy}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        style={{ width: `${cat.accuracy}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat.accuracy >= 75
                            ? 'bg-emerald-500'
                            : cat.accuracy >= 50
                            ? 'bg-primary'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toughest Questions Section */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-base text-on-surface">Toughest Questions &amp; Error Review</h3>
            </div>
            <p className="text-xs text-secondary mb-6">
              Questions frequently missed during your tests. Convert them into spaced-repetition flashcards to reinforce retention.
            </p>

            {analytics.weakestQuestions.length === 0 ? (
              <div className="py-8 text-center text-secondary text-xs">
                No weak questions detected. Keep practicing quizzes!
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/60">
                {analytics.weakestQuestions.map((q) => (
                  <div key={q.questionId} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-secondary">
                          {q.category}
                        </span>
                        <span className="text-xs font-bold text-error">
                          {q.accuracy}% Accuracy ({q.timesIncorrect} missed)
                        </span>
                      </div>
                      <p className="font-semibold text-xs md:text-sm text-on-surface leading-snug">
                        {q.questionText}
                      </p>
                      {q.explanation && (
                        <p className="text-xs text-secondary mt-1 bg-surface-container-low/50 p-2 rounded-xl">
                          <em>Explanation:</em> {q.explanation}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleCreateCardFromQuestion(q)}
                      disabled={creatingCardId === q.questionId}
                      className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary font-bold text-xs px-4 py-2 rounded-full transition-all shrink-0 cursor-pointer self-start md:self-auto"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_card</span>
                      {creatingCardId === q.questionId ? 'Creating…' : 'Make Flashcard'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="Upgrade to Student Pro to access detailed learning analytics, question-level metrics, and Anki/PDF exports."
      />
    </div>
  );
}
