'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuizResults from '@/components/nanki/QuizResults';
import { useNankiStore } from '@/lib/nanki-store';

interface ResultsData {
  correct: number;
  wrong: number;
  incorrectIds: string[];
}

export default function QuizResultsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const { quizzes } = useNankiStore();
  const quiz = quizzes.find(q => q.id === quizId) || quizzes[0];
  const [results, setResults] = useState<ResultsData | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`nanki_results_${quizId}`);
      if (stored) setResults(JSON.parse(stored));
    } catch {}
  }, [quizId]);

  if (!quiz || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center space-y-4">
          <p className="text-on-surface-variant">No results found.</p>
          <button onClick={() => router.push('/dashboard')} className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold cursor-pointer">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizResults
      quiz={quiz}
      correctCount={results.correct}
      wrongCount={results.wrong}
      incorrectQuestionIds={results.incorrectIds}
      onClose={() => router.push('/dashboard')}
      onRetake={() => router.push(`/quiz/${quizId}/play`)}
    />
  );
}
