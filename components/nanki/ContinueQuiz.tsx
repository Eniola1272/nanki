'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { useNankiStore } from '@/lib/nanki-store';
import { draftKey } from '@/lib/progress/storage';

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

export default function ContinueQuiz() {
  const { userId, quizzes, loading } = useNankiStore();
  const saved = useSyncExternalStore(subscribe, () => {
    try {
      return JSON.stringify(quizzes.flatMap(quiz => {
        const draft = JSON.parse(localStorage.getItem(draftKey(userId, quiz.id)) || 'null');
        return draft?.signature === JSON.stringify(quiz.questions) && Number.isInteger(draft.currentIdx) && draft.currentIdx >= 0 && draft.currentIdx < quiz.questions.length
          ? [{ id: quiz.id, title: quiz.title, question: draft.currentIdx + 1, total: quiz.questions.length }] : [];
      }));
    } catch { return '[]'; }
  }, () => '[]');
  const drafts: { id: string; title: string; question: number; total: number }[] = JSON.parse(saved);
  if (loading || !drafts.length) return null;
  return <section className="space-y-3">
    <h2 className="font-bold text-lg">Continue studying</h2>
    {drafts.map(draft => <Link key={draft.id} href={`/quiz/${draft.id}/play`} className="block rounded-2xl p-4 border border-primary bg-primary/5">
      <p className="font-bold">{draft.title}</p>
      <p className="text-sm text-secondary mt-1">Resume at question {draft.question} of {draft.total} · Saved on this device →</p>
    </Link>)}
  </section>;
}
