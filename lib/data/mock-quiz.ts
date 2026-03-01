// lib/data/mock-quiz.ts
import { Quiz } from '@/types/quiz';

export const mockQuiz: Quiz = {
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
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        text: 'Which planet is known as the Red Planet?',
        options: [
          { id: '5', text: 'Venus', isCorrect: false },
          { id: '6', text: 'Mars', isCorrect: true },
          { id: '7', text: 'Jupiter', isCorrect: false },
          { id: '8', text: 'Saturn', isCorrect: false },
        ],
        explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
        points: 1,
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        text: 'Who painted the Mona Lisa?',
        options: [
          { id: '9', text: 'Vincent van Gogh', isCorrect: false },
          { id: '10', text: 'Pablo Picasso', isCorrect: false },
          { id: '11', text: 'Leonardo da Vinci', isCorrect: true },
          { id: '12', text: 'Michelangelo', isCorrect: false },
        ],
        explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.',
        points: 1,
      },
    ],
  },
  timeLimit: 10, // 10 minutes
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};