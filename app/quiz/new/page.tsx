'use client';

import { useRouter } from 'next/navigation';
import QuizEditor from '@/components/nanki/QuizEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Quiz } from '@/types/nanki';

export default function NewQuizPage() {
  const router = useRouter();
  const { handleSaveQuiz, loading, userId } = useNankiStore();

  const handleSave = async (quiz: Quiz) => {
    const saved = await handleSaveQuiz(quiz);
    if (saved) router.push('/dashboard');
    return saved;
  };

  if (loading) return <p className="p-8 text-center">Loading editor…</p>;
  return <QuizEditor key={userId} quiz={null} onSave={handleSave} onClose={() => router.back()} />;
}
