import type { Attempt } from './stats';
import { studyDay } from './stats';
import type { QuizAttempt, Json } from '@/types/database';
import type { Quiz } from '@/types/nanki';
import { createClient } from '@/lib/db/supabase-browser';

export const progressKey = (userId: string) => `nanki_progress_v1_${userId}`;
export const draftKey = (userId: string, quizId: string) => `nanki_draft_v1_${userId}_${quizId}`;
export function readAttempts(userId: string): Attempt[] {
  try {
    const value = JSON.parse(localStorage.getItem(progressKey(userId)) || '[]');
    return Array.isArray(value) ? value.filter(a => a && typeof a.id === 'string' && a.quiz && a.total > 0 && a.correct >= 0 && a.correct <= a.total && Number.isFinite(Date.parse(a.completedAt))) : [];
  } catch { return []; }
}
export function writeAttempts(userId: string, attempts: Attempt[]) {
  localStorage.setItem(progressKey(userId), JSON.stringify(attempts));
}
export function mergeAttempts(...groups: Attempt[][]) {
  const merged = new Map<string, Attempt>();
  groups.flat().forEach(a => {
    const existing = merged.get(a.id);
    merged.set(a.id, existing?.synced && !a.synced ? existing : a);
  });
  return [...merged.values()].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

// Built-in content gets a stable, account-specific UUID before being referenced
// by an attempt. This also makes retries safe across reloads and browser tabs.
export async function databaseQuizId(userId: string, quizId: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quizId)) return quizId;
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`nanki:${userId}:${quizId}`));
  const hex = Array.from(new Uint8Array(hash)).map(n => n.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
export async function syncAttempt(userId: string, attempt: Attempt) {
  const db = createClient();
  const quizId = await databaseQuizId(userId, attempt.quizId);
  if (quizId !== attempt.quizId) {
    const { error } = await db.from('quizzes').upsert({
      id: quizId, user_id: userId, title: attempt.quiz.title,
      description: attempt.quiz.description, content: attempt.quiz.questions as unknown as Json,
      published: false,
    }, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw error;
  }
  const { error } = await db.from('quiz_attempts').upsert({
    id: attempt.id, quiz_id: quizId, user_id: userId,
    score: attempt.correct, max_score: attempt.total,
    completed_at: attempt.completedAt,
    answers: { version: 1, quiz: attempt.quiz, selections: attempt.answers, studyDay: attempt.studyDay } as unknown as Json,
  }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;
}
export function fromDatabase(row: QuizAttempt, quizzes: Quiz[]): Attempt | null {
  if (!row.completed_at || !row.max_score || row.score === null) return null;
  const data = row.answers as { version?: number; quiz?: Quiz; selections?: Record<string, number | null>; studyDay?: string } | null;
  const quiz = data?.version === 1 && data.quiz ? data.quiz : quizzes.find(q => q.id === row.quiz_id) ?? { id: row.quiz_id, title: 'Previous quiz', description: '', category: '', questions: [] };
  return { id: row.id, quizId: quiz.id, quiz, correct: row.score, total: row.max_score, answers: data?.selections ?? {}, completedAt: row.completed_at, studyDay: data?.studyDay ?? studyDay(new Date(row.completed_at)), synced: true };
}
