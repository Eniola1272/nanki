'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QuizEditor from '@/components/nanki/QuizEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Quiz } from '@/types/nanki';

function NewQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspace') || undefined;
  const { handleSaveQuiz, loading, userId } = useNankiStore();

  const handleSave = async (quiz: Quiz) => {
    const saved = await handleSaveQuiz(quiz);
    if (saved) {
      if (workspaceId) {
        router.back();
      } else {
        router.push('/dashboard');
      }
    }
    return saved;
  };

  if (loading) return <p className="p-8 text-center">Loading editor…</p>;
  const initialQuiz = workspaceId ? ({ organizationId: workspaceId } as Quiz) : null;
  return <QuizEditor key={userId} quiz={initialQuiz} onSave={handleSave} onClose={() => router.back()} />;
}

export default function NewQuizPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading editor…</p>}>
      <NewQuizContent />
    </Suspense>
  );
}
