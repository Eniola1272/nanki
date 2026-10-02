'use client';

import { useState } from 'react';
import Link from 'next/link';
import NankiShell from '@/components/nanki/NankiShell';
import LikeButton from '@/components/nanki/LikeButton';
import { useNankiStore } from '@/lib/nanki-store';
import { discoverContent } from '@/lib/community/discovery';

export default function DiscoverPage() {
  const { quizzes, decks, loading, likesAvailable } = useNankiStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Topics');
  const [sort, setSort] = useState<'helpful' | 'newest'>('helpful');
  const effectiveSort = likesAvailable ? sort : 'newest';
  const visible = discoverContent(quizzes, decks, '', 'All Topics', effectiveSort);
  const categories = ['All Topics', ...new Set(visible.map(({ content }) => content.category).filter(Boolean))];
  const results = discoverContent(quizzes, decks, searchQuery, category, effectiveSort);

  return <NankiShell>
    <main className="w-full max-w-[800px] mx-auto px-4 py-8 space-y-6">
      <div className="learning-welcome space-y-5">
        <h1 className="text-2xl md:text-3xl font-extrabold">Find quizzes & flashcards</h1>
        <p className="text-sm text-secondary">Explore public study material. Mark helpful content to help other learners find it.</p>
        <input aria-label="Search quizzes and flashcards" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by topic, title, or keyword…" className="w-full rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm" />
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm">Topic <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-2">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select></label>
          <label className="text-sm">Sort <select value={sort} onChange={e => setSort(e.target.value as 'helpful' | 'newest')} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-2">
            <option value="helpful">Most helpful</option><option value="newest">Newest</option>
          </select></label>
        </div>
        {!loading && !likesAvailable && <p className="text-xs text-secondary">Helpful votes are temporarily unavailable. Results are ordered by newest.</p>}
      </div>
      {loading ? <p>Loading study material…</p> : results.length === 0 ? <p className="py-12 text-center text-secondary">No public quizzes or flashcards match your search.</p> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map(({ kind, content }) => <article key={`${kind}:${content.id}`} className="flex flex-col justify-between rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 space-y-4">
          <Link href={`/${kind}/${content.id}/play`} className="block space-y-2 hover:text-primary">
            <p className="text-xs text-secondary">{content.category} · {kind === 'quiz' ? 'Quiz' : 'Flashcards'}{!content.ownerId ? ' · Starter content' : ''}</p>
            <h2 className="font-bold text-lg">{content.title}</h2>
            <p className="text-sm text-secondary line-clamp-2">{content.description}</p>
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/40 pt-3">
            <LikeButton kind={kind} id={content.id} />
            <Link href={`/${kind}/${content.id}/play`} className="text-xs font-bold text-primary">{kind === 'quiz' ? 'Take quiz' : 'Study cards'} →</Link>
          </div>
        </article>)}
      </div>}
    </main>
  </NankiShell>;
}
