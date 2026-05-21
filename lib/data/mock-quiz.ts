import type { DbQuiz } from '@/types/database';

export const mockQuiz: DbQuiz = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'General Knowledge Quiz',
  description: 'Test your general knowledge with this fun quiz!',
  content: {
    questions: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        text: 'What is the capital of France?',
        options: [
          { id: '1', text: 'London', isCorrect: false },
          { id: '2', text: 'Berlin', isCorrect: false },
          { id: '3', text: 'Paris', isCorrect: true },
          { id: '4', text: 'Madrid', isCorrect: false },
        ],
        explanation: 'Paris has been the capital of France since 987 AD.',
        points: 1,
      },
    ],
  },
  category: null,
  mastered_percentage: null,
  time_limit: 10,
  published: true,
  shareable_slug: null,
  user_id: null,
  organization_id: null,
  max_attempts: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};