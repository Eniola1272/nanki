import type { FlashcardSession } from './flashcards';
import type { Quiz, UserProfile } from '../../types/nanki';

export interface Attempt {
  id: string;
  quizId: string;
  quiz: Quiz;
  correct: number;
  total: number;
  negativeMarking?: boolean;
  netScore?: number;
  wrong?: number;
  unanswered?: number;
  answers: Record<string, number | null>;
  completedAt: string;
  studyDay: string;
  synced: boolean;
}

export function studyDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function percentage(a: Attempt) { return a.total ? Math.round(a.correct / a.total * 100) : 0; }
export function attemptXp(a: Attempt) { return 10 + a.correct * 2; }

export function progressStats(attempts: Attempt[], now = new Date(), flashcards: FlashcardSession[] = []) {
  const days = [...new Set([...attempts, ...flashcards].map(a => a.studyDay))].sort();
  const dayNumber = (day: string) => Date.parse(`${day}T00:00:00Z`) / 86400000;
  let best = 0, run = 0, previous = -Infinity;
  for (const day of days) {
    const n = dayNumber(day);
    run = n === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = n;
  }
  const age = dayNumber(studyDay(now)) - previous;
  const streak = age >= 0 && age <= 1 ? run : 0;
  const xp = attempts.reduce((sum, a) => sum + attemptXp(a), 0) + flashcards.reduce((sum, session) => sum + 10 + session.cardsReviewed, 0);
  const total = attempts.reduce((sum, a) => sum + a.total, 0);
  const correct = attempts.reduce((sum, a) => sum + a.correct, 0);
  const badges: UserProfile['badges'] = [
    ['cards', 'First deck', 'style', flashcards.length >= 1],
    ['first', 'First quiz', 'school', attempts.length >= 1],
    ['ten', '10 quizzes', 'memory', attempts.length >= 10],
    ['week', '7-day streak', 'bolt', best >= 7],
    ['perfect', 'Perfect score', 'star', attempts.some(a => a.total > 0 && a.correct === a.total)],
  ].map(([id, title, icon, earned]) => ({ id: String(id), title: String(title), icon: String(icon), earned: Boolean(earned), colorClass: earned ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 'bg-surface-container-high text-secondary border-outline-variant opacity-50' }));
  return { totalFlashcardSessions: flashcards.length, cardsReviewed: flashcards.reduce((sum, session) => sum + session.cardsReviewed, 0), xp, level: Math.floor(xp / 500) + 1, xpProgress: (xp % 500) / 5, streak, personalBestStreak: best, totalQuizzesTaken: attempts.length, masteryPercentage: total ? Math.round(correct / total * 100) : 0, badges };
}
