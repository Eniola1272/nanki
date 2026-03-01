// types/quiz.ts
import { z } from 'zod';

// Option schema
export const OptionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

// Question schema
export const QuestionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  options: z.array(OptionSchema).min(2),
  explanation: z.string().optional(),
  points: z.number().min(1).default(1),
});

// Quiz content schema
export const QuizContentSchema = z.object({
  questions: z.array(QuestionSchema),
});

// Quiz schema (complete)
export const QuizSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  content: QuizContentSchema,
  timeLimit: z.number().optional(),
  published: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types inferred from schemas
export type Option = z.infer<typeof OptionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuizContent = z.infer<typeof QuizContentSchema>;
export type Quiz = z.infer<typeof QuizSchema>;