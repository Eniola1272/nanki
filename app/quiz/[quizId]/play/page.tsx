'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import QuizPlay from '@/components/nanki/QuizPlay';
import { useNankiStore } from '@/lib/nanki-store';

export default function PlayQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const { quizzes, handleCompleteQuizPlay } = useNankiStore();
  const quiz = quizzes.find(q => q.id === quizId) || quizzes[0];

  const handleComplete = (correct: number, wrong: number, incorrectIds: string[]) => {
    handleCompleteQuizPlay(quizId, correct, wrong);
    try {
      sessionStorage.setItem(`nanki_results_${quizId}`, JSON.stringify({ correct, wrong, incorrectIds }));
    } catch {}
    router.push(`/quiz/${quizId}/results`);
  };

  if (!quiz) return null;

  return <QuizPlay quiz={quiz} onClose={() => router.push('/dashboard')} onComplete={handleComplete} />;
}
