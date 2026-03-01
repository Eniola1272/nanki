// app/quiz/[quizId]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { mockQuiz } from '@/lib/data/mock-quiz';
import { QuizRunner } from './components/QuizRunner';

interface QuizPageProps {
  params: Promise<{  // Changed: params is now a Promise
    quizId: string;
  }>;
}

async function getQuiz(quizId: string) {
  // For now, return mock data
  if (quizId === mockQuiz.id) {
    return mockQuiz;
  }
  return null;
}

export default async function QuizPage({ params }: QuizPageProps) {
  // Await the params Promise
  const { quizId } = await params;  // Fixed: await params before accessing
  
  const quiz = await getQuiz(quizId);

  if (!quiz) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading quiz...</div>
        </div>
      }>
        <QuizRunner quiz={quiz} />
      </Suspense>
    </div>
  );
}