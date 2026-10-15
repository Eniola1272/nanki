export type QuestionType = 'single' | 'multiple' | 'true-false';

export interface Question {
  id: string;
  text: string;
  type?: QuestionType;
  options: string[];
  correctAnswer: number;
  explanation: string;
  // For True/False branches:
  branchAnswers?: Record<number, number>; // index -> 1 (true), 0 (false)
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  description: string;
  questions: Question[];
  masteredPercentage?: number;
  negativeMarking?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  extraNote?: string;
  deckId: string;
}

export interface Deck {
  id: string;
  title: string;
  category: string;
  cards: Flashcard[];
}

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewState {
  cardId: string;
  reps: number;
  interval: number; // in days
  easeFactor: number;
  dueDate: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  streak: number;
  xp: number;
  plan: 'FREE' | 'PRO' | 'SCHOLAR';
}
