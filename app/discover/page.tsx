'use client';

import { useState } from 'react';
import Link from 'next/link';
import NankiShell from '@/components/nanki/NankiShell';
import LikeButton from '@/components/nanki/LikeButton';
import ReportModal from '@/components/nanki/ReportModal';
import { useNankiStore } from '@/lib/nanki-store';
import { discoverContent } from '@/lib/community/discovery';
import type { Quiz, Deck } from '@/types/nanki';

export default function DiscoverPage() {
  const { quizzes, decks, loading, likesAvailable, handleForkQuiz, handleForkDeck } = useNankiStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Topics');
  const [sort, setSort] = useState<'helpful' | 'newest'>('helpful');
  const [forkingId, setForkingId] = useState<string | null>(null);
  const [reportingItem, setReportingItem] = useState<{ kind: 'quiz' | 'deck'; id: string; title: string } | null>(null);

  const effectiveSort = likesAvailable ? sort : 'newest';
  const visible = discoverContent(quizzes, decks, '', 'All Topics', effectiveSort);
  const categories = ['All Topics', ...new Set(visible.map(({ content }) => content.category).filter(Boolean))];
  const results = discoverContent(quizzes, decks, searchQuery, category, effectiveSort);

  const onFork = async (kind: 'quiz' | 'deck', content: Quiz | Deck) => {
    setForkingId(content.id);
    try {
      if (kind === 'quiz') {
        await handleForkQuiz(content as Quiz);
      } else {
        await handleForkDeck(content as Deck);
      }
    } finally {
      setForkingId(null);
    }
  };

  return (
    <NankiShell>
      <main className="w-full max-w-[800px] mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="learning-welcome space-y-5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">Find quizzes & flashcards</h1>
          <p className="text-sm text-secondary">
            Explore public study material created by learners. Mark helpful content and save copies to your library.
          </p>
          <input
            aria-label="Search quizzes and flashcards"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, title, or keyword…"
            className="w-full rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-on-surface flex items-center gap-2">
              Topic
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-outline-variant bg-surface-container-lowest p-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-on-surface flex items-center gap-2">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'helpful' | 'newest')}
                className="rounded-lg border border-outline-variant bg-surface-container-lowest p-2 text-sm"
              >
                <option value="helpful">Most helpful</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>
          {!loading && !likesAvailable && (
            <p className="text-xs text-secondary">
              Helpful votes are temporarily unavailable. Results are ordered by newest.
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-secondary py-8 text-center">Loading study material…</p>
        ) : results.length === 0 ? (
          <p className="py-12 text-center text-secondary">No public quizzes or flashcards match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map(({ kind, content }) => (
              <article
                key={`${kind}:${content.id}`}
                className="flex flex-col justify-between rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 space-y-4 hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-secondary mb-2">
                    <span>
                      {content.category} · {kind === 'quiz' ? 'Quiz' : 'Flashcards'}
                    </span>
                    {content.ownerId ? (
                      <Link
                        href={`/creator/${content.ownerId}`}
                        className="text-primary hover:underline font-semibold flex items-center gap-1"
                        title="View creator collection"
                      >
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {content.ownerName ? content.ownerName : 'Creator'}
                      </Link>
                    ) : (
                      <span className="text-[11px] bg-surface-container-high px-2 py-0.5 rounded-full font-medium">
                        Starter
                      </span>
                    )}
                  </div>

                  <Link href={`/${kind}/${content.id}/play`} className="block space-y-1.5 hover:text-primary">
                    <h2 className="font-bold text-lg text-on-surface leading-snug">{content.title}</h2>
                    <p className="text-sm text-secondary line-clamp-2">{content.description}</p>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/40 pt-3">
                  <div className="flex items-center gap-1.5">
                    <LikeButton kind={kind} id={content.id} />

                    {/* Fork button */}
                    <button
                      onClick={() => onFork(kind, content)}
                      disabled={forkingId === content.id}
                      className="inline-flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
                      title="Save a copy to your library"
                    >
                      <span className="material-symbols-outlined text-[15px]">content_copy</span>
                      {forkingId === content.id ? 'Copying…' : 'Fork'}
                    </button>

                    {/* Report button */}
                    <button
                      onClick={() => setReportingItem({ kind, id: content.id, title: content.title })}
                      className="text-on-surface-variant/50 hover:text-error p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                      title="Report this content"
                    >
                      <span className="material-symbols-outlined text-[15px]">flag</span>
                    </button>
                  </div>

                  <Link href={`/${kind}/${content.id}/play`} className="text-xs font-bold text-primary hover:underline">
                    {kind === 'quiz' ? 'Take quiz' : 'Study cards'} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Content reporting modal */}
        {reportingItem && (
          <ReportModal
            isOpen={Boolean(reportingItem)}
            onClose={() => setReportingItem(null)}
            kind={reportingItem.kind}
            contentId={reportingItem.id}
            contentTitle={reportingItem.title}
          />
        )}
      </main>
    </NankiShell>
  );
}
