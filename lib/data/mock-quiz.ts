import { Quiz } from '@prisma/client';

export const mockQuiz = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'General Knowledge Quiz',
  description: 'Test your general knowledge with this fun quiz!', // or set to null if no description
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
      // ... other questions
    ],
  },
  timeLimit: 10,
  published: true,
  shareableSlug: null,  
  userId: null,         
  organizationId: null, 
  maxAttempts: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Partial<Quiz>; // This helps TypeScript validate the shape