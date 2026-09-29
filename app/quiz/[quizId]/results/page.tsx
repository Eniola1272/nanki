'use client';

import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LikeButton from '@/components/nanki/LikeButton';
import QuizResults from '@/components/nanki/QuizResults';
import { useNankiStore } from '@/lib/nanki-store';
import { percentage, attemptXp } from '@/lib/progress/stats';
import { draftKey } from '@/lib/progress/storage';

export default function QuizResultsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const search = useSearchParams();
  const { attempts, loading, retrySync, userId } = useNankiStore();
  const history = attempts.filter(a => a.quizId === quizId);
  const result = search.get('attempt') ? history.find(a => a.id === search.get('attempt')) : history[0];
  if (loading) return <p className="p-8 text-center">Loading results…</p>;
  if (!result) return <div className="p-8 text-center"><p>No saved results found.</p><button onClick={() => router.push('/dashboard')}>Back to dashboard</button></div>;
  const previous = history[history.findIndex(a => a.id === result.id) + 1];
  const difference = previous ? percentage(result) - percentage(previous) : null;
  return <>
    <QuizResults
      quiz={result.quiz}
      correctCount={result.correct}
      wrongCount={result.total - result.correct}
      incorrectQuestionIds={result.quiz.questions.filter(q => result.answers[q.id] !== q.correctOptionIndex).map(q => q.id)}
      userAnswers={result.answers}
      progressSummary={<div className="w-full rounded-2xl border border-outline-variant p-4 mb-6 text-sm text-center space-y-2">
        <LikeButton kind="quiz" id={quizId} />
        <p>{new Date(result.completedAt).toLocaleString()} · +{attemptXp(result)} XP</p>
        <p>{difference === null ? 'Your first recorded attempt on this quiz.' : `${difference > 0 ? '+' : ''}${difference} percentage points vs. your previous attempt (${percentage(previous!)}%).`}</p>
        <p>{result.synced ? 'Saved to your account' : userId === 'guest' ? 'Saved on this device only' : 'Saved on this device · waiting to sync'}</p>
        {!result.synced && userId !== 'guest' && <button className="text-primary underline" onClick={() => void retrySync()}>Retry sync</button>}
      </div>}
      onClose={() => router.push('/profile')}
      onRetake={() => { try { localStorage.removeItem(draftKey(userId, quizId)); } catch {} router.push(`/quiz/${quizId}/play`); }}
    />
  </>;
}
