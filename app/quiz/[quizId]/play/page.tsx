'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import QuizPlay from '@/components/nanki/QuizPlay';
import { useNankiStore } from '@/lib/nanki-store';

export default function PlayQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const { quizzes, handleCompleteQuizPlay, loading, userId } = useNankiStore();
  const quiz = quizzes.find(q => q.id === quizId);

  const handleComplete = (
    correct: number,
    wrong: number,
    incorrectIds: string[],
    userAnswers: Record<string, number | null>,
    attemptId: string
  ) => {
    const id = handleCompleteQuizPlay(quizId, userAnswers, attemptId);
    router.push(`/quiz/${quizId}/results?attempt=${id}`);
  };

  if (loading) return <p className="p-8 text-center">Loading your quiz…</p>;
  if (!quiz || !quiz.questions.length) return <div className="p-8 text-center"><p>This quiz is unavailable or has no questions.</p><button onClick={() => router.push('/dashboard')}>Back to dashboard</button></div>;

  return <QuizPlay key={`${userId}:${quiz.id}`} userId={userId} quiz={quiz} onClose={() => router.push('/dashboard')} onComplete={handleComplete} />;
}
