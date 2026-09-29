'use client';

import { useState } from 'react';
import { useNankiStore } from '@/lib/nanki-store';

export default function LikeButton({ kind, id }: { kind: 'quiz' | 'deck'; id: string }) {
  const { quizzes, decks, userId, toggleLike, likesAvailable } = useNankiStore();
  const [busy, setBusy] = useState(false);
  const item = (kind === 'quiz' ? quizzes : decks).find(item => item.id === id);
  if (!item?.published) return null;
  if (!likesAvailable) return <span className="text-xs opacity-70">Helpful votes unavailable</span>;
  const own = item.ownerId === userId;
  return <button type="button" aria-pressed={Boolean(item.likedByMe)} disabled={busy || own}
    title={own ? 'Learners can mark your content helpful' : item.likedByMe ? 'Remove helpful vote' : 'Was this helpful?'}
    onClick={async e => {
      e.stopPropagation();
      setBusy(true);
      try { await toggleLike(kind, id); } finally { setBusy(false); }
    }}
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold disabled:opacity-60 ${item.likedByMe ? 'bg-tertiary/10 border-tertiary text-tertiary' : 'border-current/20'}`}>
    <span className={`material-symbols-outlined text-[16px] ${item.likedByMe ? 'fill' : ''}`}>thumb_up</span>
    {busy ? 'Saving…' : `${item.likeCount ?? 0} · ${item.likedByMe ? 'Helpful ✓' : 'Helpful'}`}
  </button>;
}
