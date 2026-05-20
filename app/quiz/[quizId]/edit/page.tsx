'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import QuizEditor from '@/components/nanki/QuizEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Quiz } from '@/types/nanki';

export default function EditQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const { quizzes, handleSaveQuiz } = useNankiStore();
  const quiz = quizzes.find(q => q.id === quizId) || null;

  const handleSave = (updated: Quiz) => {
    handleSaveQuiz(updated);
    router.push('/dashboard');
  };

  return <QuizEditor quiz={quiz} onSave={handleSave} onClose={() => router.back()} />;
}
