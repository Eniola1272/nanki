export interface CommunityContent {
  ownerId?: string | null;
  published?: boolean;
  likeCount?: number;
  likedByMe?: boolean;
  createdAt?: string;
}

export interface Question {
  id: string;
  text: string;
  timer: string; // e.g. "20s"
  options: string[];
  correctOptionIndex: number;
  type?: 'multiple-choice' | 'true-false';
  correctTruthValues?: boolean[];
  branchExplanations?: string[];
  explanation?: string;
}

export interface Quiz extends CommunityContent {
  id: string;
  title: string;
  description: string;
  category: string;
  masteredPercentage?: number;
  questions: Question[];
}

export interface Card {
  source?: { quizId: string; questionId: string; branch?: number; attemptId: string };
  id: string;
  front: string;
  back: string;
  extraNote?: string;
}

export interface Deck extends CommunityContent {
  id: string;
  title: string;
  description: string;
  category: string;
  cards: Card[];
  author?: string;
  cardsCount?: number;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  level: number;
  xpProgress: number;
  streak: number;
  totalQuizzesTaken: number;
  masteryPercentage: number;
  personalBestStreak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  earned: boolean;
  colorClass: string;
}
