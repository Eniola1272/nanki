'use client';

import { useState, type ReactNode } from 'react';
import { branchKey } from '@/lib/quiz/scoring';
import type { Quiz } from '@/types/nanki';
import Brand from '@/components/shared/Brand';

interface QuizResultsProps {
  quiz: Quiz;
  progressSummary?: ReactNode;
  correctCount: number;
  netScore?: number;
  wrongCount: number;
  incorrectQuestionIds: string[];
  userAnswers?: Record<string, number | null>;
  onClose: () => void;
  onRetake: () => void;
}

export default function QuizResults({
  quiz,
  progressSummary,
  correctCount,
  netScore,
  wrongCount,
  incorrectQuestionIds,
  userAnswers = {},
  onClose,
  onRetake,
}: QuizResultsProps) {
  const [showReview, setShowReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'mistakes' | 'all'>('mistakes');

  const totalQuestions = correctCount + wrongCount;
  const scorePercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const getFeedback = () => {
    if (scorePercent === 100) return { title: 'Perfect Score! 🏆', msg: 'Absolute excellence. You have mastered every concept here.' };
    if (scorePercent >= 80) return { title: 'Mastery Achieved! 🌟', msg: 'Incredible work. Your neural pathways are strengthening.' };
    if (scorePercent >= 50) return { title: 'Great Effort! 👍', msg: 'Good progress. A little more revision and you will ace it!' };
    return { title: 'Keep Practicing! 📚', msg: 'Review your mistakes to build stronger cognitive recall.' };
  };
  const feedback = getFeedback();

  const questionsToReview = reviewFilter === 'mistakes'
    ? quiz.questions.filter(q => incorrectQuestionIds.includes(q.id))
    : quiz.questions;

  return (
    <div className="min-h-screen bg-background text-on-background font-sans flex flex-col antialiased">
      <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 w-full z-40">
        <div className="flex justify-between items-center px-4 py-3 max-w-[800px] mx-auto">
          <div className="flex items-center gap-2">
            <Brand size="sm" />
            <span className="text-secondary text-sm border-l border-outline-variant pl-2 truncate max-w-[150px] md:max-w-[400px]">
              {quiz.title} Results
            </span>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      <main className="flex-grow pt-20 pb-24 px-4 max-w-[800px] w-full mx-auto flex flex-col justify-center">
        {!showReview ? (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="relative w-full flex justify-center mb-8 py-4">
              <div className="absolute inset-0 pointer-events-none blur-2xl"></div>
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white border border-outline-variant shadow-[0_12px_32px_rgba(0,0,0,0.06)] flex items-center justify-center z-10 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-tertiary-fixed/30 mix-blend-overlay"></div>
                <span className="material-symbols-outlined text-[100px] text-tertiary-fixed-dim select-none animate-pulse fill">psychology</span>
                <div className="absolute top-8 left-10 w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></div>
                <div className="absolute bottom-10 right-12 w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse"></div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">{netScore ?? correctCount}/{totalQuestions}</h1>
              <h2 className="text-xl md:text-2xl text-on-surface font-bold">{feedback.title}</h2>
              <p className="font-body-lg text-sm md:text-base text-secondary max-w-sm mx-auto mt-2">{feedback.msg}</p>
            </div>

            {progressSummary}

            <div className="w-full grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 flex flex-col items-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed/40 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-tertiary text-[20px] fill">check_circle</span>
                </div>
                <span className="text-2xl font-extrabold text-tertiary-container">{correctCount}</span>
                <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mt-1">Correct</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-error-container/50 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-error text-[20px] fill">cancel</span>
                </div>
                <span className="text-2xl font-extrabold text-error">{wrongCount}</span>
                <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mt-1">Needs Review</span>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
              <button onClick={onClose} className="flex-1 bg-primary text-on-primary font-bold px-6 py-3 rounded-full flex items-center justify-center gap-1 hover:bg-primary-container transition-all cursor-pointer active:scale-95 shadow-md">
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span>Done</span>
              </button>
              <button onClick={onRetake} className="flex-1 bg-surface-container-lowest text-primary border border-primary font-bold px-6 py-3 rounded-full flex items-center justify-center gap-1 hover:bg-surface-container-low transition-all cursor-pointer active:scale-95">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Retake Quiz</span>
              </button>
              {wrongCount > 0 ? (
                <button
                  onClick={() => {
                    setReviewFilter('mistakes');
                    setShowReview(true);
                  }}
                  className="flex-1 bg-surface-container-lowest text-error border border-error/40 hover:border-error font-bold px-6 py-3 rounded-full flex items-center justify-center gap-1 hover:bg-error-container/20 transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>Review missed answers</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setReviewFilter('all');
                    setShowReview(true);
                  }}
                  className="flex-1 bg-surface-container-lowest text-tertiary border border-tertiary font-bold px-6 py-3 rounded-full flex items-center justify-center gap-1 hover:bg-surface-container-low transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>Review Questions</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full animate-fadeIn">
            {/* Header & Filter tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="font-title-md text-lg font-bold flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-error">fact_check</span>
                  {reviewFilter === 'mistakes' ? 'Reviewing Mistakes' : 'Reviewing All Questions'}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold">
                  {questionsToReview.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {wrongCount > 0 && (
                  <div className="inline-flex p-1 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setReviewFilter('mistakes')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        reviewFilter === 'mistakes'
                          ? 'bg-surface-container-lowest text-error font-bold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Mistakes ({incorrectQuestionIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        reviewFilter === 'all'
                          ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      All ({quiz.questions.length})
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowReview(false)}
                  className="text-primary text-xs font-bold hover:underline cursor-pointer px-2 py-1"
                >
                  Back to Scores
                </button>
              </div>
            </div>

            {/* Questions list */}
            <div className="flex flex-col gap-5 mb-8 max-h-[600px] overflow-y-auto pr-1">
              {questionsToReview.map((q) => {
                if (q.type === 'true-false') return <article key={q.id} className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 space-y-4">
                  <h3 className="font-bold">Question {quiz.questions.findIndex(item => item.id === q.id) + 1}: {q.text}</h3>
                  {q.options.map((option, index) => {
                    const answer = userAnswers[branchKey(q.id, index)];
                    const expected = q.correctTruthValues?.[index];
                    const correct = answer === Number(expected);
                    return <div key={index} className={`rounded-xl border p-3 text-sm space-y-2 ${correct ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-error/40 bg-error/5'}`}>
                      <p className="font-semibold">{String.fromCharCode(65 + index)}. {option}</p>
                      <p>Your answer: {answer === 1 ? 'True' : answer === 0 ? 'False' : 'Unanswered'} · Correct answer: {expected ? 'True' : 'False'} · {correct ? 'Correct' : answer == null ? 'Not answered' : 'Incorrect'}</p>
                      {q.branchExplanations?.[index] && <p className="text-secondary">{q.branchExplanations[index]}</p>}
                    </div>;
                  })}
                  {q.explanation && <p className="text-sm text-secondary">{q.explanation}</p>}
                </article>;

                const userChoiceIdx = userAnswers?.[q.id];
                const wasAnswered = userChoiceIdx !== undefined && userChoiceIdx !== null;
                const isMistake = incorrectQuestionIds.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className="bg-surface-container-lowest border border-outline-variant p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-xs text-secondary uppercase font-bold tracking-wider">
                          Question {quiz.questions.findIndex(item => item.id === q.id) + 1}
                        </span>
                        {isMistake ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">close</span>
                            Mistake
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">check</span>
                            Correct
                          </span>
                        )}
                      </div>

                      {!wasAnswered && (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">timer_off</span>
                          Time ran out
                        </span>
                      )}
                    </div>

                    <h3 className="font-body-lg text-sm md:text-base font-semibold text-on-surface mb-4 leading-relaxed">
                      {q.text}
                    </h3>

                    <div className="flex flex-col gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctOptionIndex;
                        const isUserChoice = wasAnswered && userChoiceIdx === oIdx;
                        const isWrongUserChoice = isUserChoice && !isCorrect;

                        let cardStyle = 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant opacity-75';
                        let badgeCircleStyle = 'border-outline-variant bg-surface-container-low text-secondary';

                        if (isCorrect) {
                          cardStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500/30 opacity-100 shadow-sm';
                          badgeCircleStyle = 'border-emerald-500 bg-emerald-500 text-white';
                        } else if (isWrongUserChoice) {
                          cardStyle = 'bg-rose-500/10 border-rose-500 text-rose-950 dark:text-rose-100 font-semibold ring-1 ring-rose-500/30 opacity-100 shadow-sm';
                          badgeCircleStyle = 'border-rose-500 bg-rose-500 text-white';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-3.5 rounded-xl border text-xs md:text-sm flex items-center justify-between gap-3 transition-all ${cardStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${badgeCircleStyle}`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="leading-normal">{opt}</span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {/* Wrong answer badge */}
                              {isWrongUserChoice && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-300 dark:border-rose-800">
                                  <span className="material-symbols-outlined text-[15px] font-bold">close</span>
                                  Your Pick
                                </span>
                              )}

                              {/* Correct answer badge */}
                              {isCorrect && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                                  <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                                  {isUserChoice ? 'Your Pick (Correct)' : 'Correct Answer'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowReview(false)}
              className="w-full bg-primary text-on-primary py-3 rounded-full hover:bg-primary-container transition-all cursor-pointer text-center font-bold shadow-sm active:scale-98"
            >
              Finish Review
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
