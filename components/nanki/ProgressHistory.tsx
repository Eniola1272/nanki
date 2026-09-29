'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNankiStore } from '@/lib/nanki-store';
import { percentage, progressStats } from '@/lib/progress/stats';

export default function ProgressHistory() {
  const { attempts, loading, retrySync, userId } = useNankiStore();
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(10);
  const filtered = attempts.filter(a => filter === 'all' || a.quizId === filter);
  const quizzes = [...new Map(attempts.map(a => [a.quizId, a.quiz.title])).entries()];
  const pending = attempts.filter(a => !a.synced).length;
  const stats = progressStats(attempts);
  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-bold text-lg">Your progress</h2>
      <select aria-label="Filter attempt history by quiz" value={filter} onChange={e => { setFilter(e.target.value); setLimit(10); }} className="border border-outline-variant rounded-xl p-2 bg-surface-container-lowest text-sm max-w-full">
        <option value="all">All quizzes</option>
        {quizzes.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
      </select>
    </div>
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 text-sm space-y-2">
      <p className="font-bold">Level {stats.level} · {stats.xp} XP · {500 - stats.xp % 500} XP to level {stats.level + 1}</p>
      <p className="text-secondary">Earn 10 XP for finishing a quiz and 2 XP for each correct answer. Every 500 XP earns a level, including retakes.</p>
      <p className="text-secondary">Complete a quiz each day to build your streak. Days follow your local calendar; multiple quizzes in one day count as one streak day.</p>
      <p>Overall accuracy: {stats.masteryPercentage}%</p>
      {pending > 0 && <p>{pending} result{pending === 1 ? '' : 's'} {userId === 'guest' ? 'saved on this device only.' : 'waiting to sync.'} {userId !== 'guest' && <button className="text-primary underline" onClick={() => void retrySync()}>Retry sync</button>}</p>}
    </div>
    {loading ? <p>Loading history…</p> : filtered.length === 0 ? <p className="text-secondary text-sm">Complete your first quiz to start your history and compare future attempts.</p> : <>
      <div className="space-y-3">
        {filtered.slice(0, limit).map(attempt => {
          const history = attempts.filter(a => a.quizId === attempt.quizId);
          const previous = history[history.findIndex(a => a.id === attempt.id) + 1];
          const delta = previous ? percentage(attempt) - percentage(previous) : null;
          return <Link key={attempt.id} href={`/quiz/${attempt.quizId}/results?attempt=${attempt.id}`} className="block rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 hover:border-primary">
            <div className="flex justify-between gap-3"><h3 className="font-bold text-sm">{attempt.quiz.title}</h3><span className="font-bold text-primary whitespace-nowrap">{percentage(attempt)}%</span></div>
            <p className="text-xs text-secondary mt-1">{new Date(attempt.completedAt).toLocaleString()} · {attempt.correct}/{attempt.total} correct</p>
            <p className="text-xs mt-2">{delta === null ? 'First recorded attempt' : `${delta > 0 ? '+' : ''}${delta} percentage points vs. previous`} · {attempt.synced ? 'Synced' : 'On this device'} · Review answers →</p>
          </Link>;
        })}
      </div>
      {filtered.length > limit && <button onClick={() => setLimit(n => n + 10)} className="text-primary text-sm font-bold">Show more attempts</button>}
    </>}
  </section>;
}
