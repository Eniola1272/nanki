'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import QuizEditor from '@/components/nanki/QuizEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Quiz } from '@/types/nanki';

export default function EditQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const { quizzes, handleSaveQuiz, loading, userId } = useNankiStore();
  const quiz = quizzes.find(q => q.id === quizId) || null;

  const handleSave = async (updated: Quiz) => {
    if (await handleSaveQuiz(updated)) router.push('/dashboard');
  };

  if (loading) return <p className="p-8 text-center">Loading…</p>;
  if (!quiz || (quiz.ownerId && quiz.ownerId !== userId)) return <p className="p-8 text-center">This content is unavailable or belongs to another author.</p>;

  return <QuizEditor quiz={quiz} onSave={handleSave} onClose={() => router.back()} />;
}
