'use client';

import { useRouter } from 'next/navigation';
import QuizEditor from '@/components/nanki/QuizEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Quiz } from '@/types/nanki';

export default function NewQuizPage() {
  const router = useRouter();
  const { handleSaveQuiz } = useNankiStore();

  const handleSave = (quiz: Quiz) => {
    handleSaveQuiz(quiz);
    router.push('/dashboard');
  };

  return <QuizEditor quiz={null} onSave={handleSave} onClose={() => router.back()} />;
}
