'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NankiShell from '@/components/nanki/NankiShell';
import LikeButton from '@/components/nanki/LikeButton';
import ReportModal from '@/components/nanki/ReportModal';
import { useNankiStore } from '@/lib/nanki-store';
import { createClient } from '@/lib/db/supabase-browser';
import type { Quiz, Deck } from '@/types/nanki';

interface CreatorProfileData {
  id: string;
  name: string;
  avatar_url: string;
  created_at?: string;
}

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params?.id as string;

  const { quizzes, decks, loading: storeLoading, handleForkQuiz, handleForkDeck } = useNankiStore();
  const [creator, setCreator] = useState<CreatorProfileData | null>(null);
  const [loadingCreator, setLoadingCreator] = useState(true);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'decks'>('quizzes');
  const [forkingId, setForkingId] = useState<string | null>(null);

  // Report modal state
  const [reportingItem, setReportingItem] = useState<{ kind: 'quiz' | 'deck'; id: string; title: string } | null>(null);

  useEffect(() => {
    if (!creatorId) return;

    let cancelled = false;
    const fetchCreator = async () => {
      try {
        const supabase = createClient();
        // Use RPC if available, or direct profiles select
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_creator_profile', {
          p_user_id: creatorId,
        });

        if (!rpcError && rpcData) {
          const profile = rpcData as unknown as CreatorProfileData;
          if (!cancelled) setCreator(profile);
          return;
        }

        // Fallback: direct select
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, created_at')
          .eq('id', creatorId)
          .single();

        if (!cancelled) {
          if (!error && data) {
            setCreator({
              id: data.id,
              name: data.name || 'Community Creator',
              avatar_url: data.avatar_url || '/avatar.svg',
              created_at: data.created_at,
            });
          } else {
            setCreator({
              id: creatorId,
              name: 'Community Creator',
              avatar_url: '/avatar.svg',
            });
          }
        }
      } catch {
        if (!cancelled) {
          setCreator({
            id: creatorId,
            name: 'Community Creator',
            avatar_url: '/avatar.svg',
          });
        }
      } finally {
        if (!cancelled) setLoadingCreator(false);
      }
    };

    void fetchCreator();
    return () => { cancelled = true; };
  }, [creatorId]);

  const creatorQuizzes = quizzes.filter(q => q.ownerId === creatorId && q.published);
  const creatorDecks = decks.filter(d => d.ownerId === creatorId && d.published);

  const totalLikes = [...creatorQuizzes, ...creatorDecks].reduce(
    (sum, item) => sum + (item.likeCount ?? 0),
    0
  );

  const onForkQuiz = async (quiz: Quiz) => {
    setForkingId(quiz.id);
    try {
      await handleForkQuiz(quiz);
    } finally {
      setForkingId(null);
    }
  };

  const onForkDeck = async (deck: Deck) => {
    setForkingId(deck.id);
    try {
      await handleForkDeck(deck);
    } finally {
      setForkingId(null);
    }
  };

  return (
    <NankiShell>
      <main className="w-full max-w-[800px] mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        {/* Back Link */}
        <button
          onClick={() => router.push('/discover')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Discover
        </button>

        {/* Creator Hero */}
        <section className="flex flex-col items-center text-center space-y-4 py-8 px-4 rounded-3xl bg-surface-container-lowest border border-outline-variant shadow-sm">
          <div className="relative">
            <img
              alt={creator?.name || 'Creator'}
              className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-lowest shadow-md select-none"
              src={creator?.avatar_url || '/avatar.svg'}
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface">
              {loadingCreator ? 'Loading creator…' : creator?.name || 'Community Creator'}
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant max-w-sm mt-1">
              Published study collections and shared revision decks on Nanki.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="bg-primary/10 text-primary font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span> Public Creator
            </span>
          </div>
        </section>

        {/* Creator Stats */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-primary text-[20px] block mb-1">quiz</span>
            <span className="text-xl font-extrabold text-on-surface block leading-none">{creatorQuizzes.length}</span>
            <span className="text-[11px] text-on-surface-variant font-medium mt-1 block">Quizzes</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-secondary text-[20px] block mb-1">style</span>
            <span className="text-xl font-extrabold text-on-surface block leading-none">{creatorDecks.length}</span>
            <span className="text-[11px] text-on-surface-variant font-medium mt-1 block">Decks</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-tertiary text-[20px] block mb-1">thumb_up</span>
            <span className="text-xl font-extrabold text-on-surface block leading-none">{totalLikes}</span>
            <span className="text-[11px] text-on-surface-variant font-medium mt-1 block">Helpful Votes</span>
          </div>
        </section>

        {/* Collections Tab */}
        <section className="space-y-4">
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex-1 pb-3 text-center font-bold text-sm transition-colors cursor-pointer border-b-2 ${
                activeTab === 'quizzes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Public Quizzes ({creatorQuizzes.length})
            </button>
            <button
              onClick={() => setActiveTab('decks')}
              className={`flex-1 pb-3 text-center font-bold text-sm transition-colors cursor-pointer border-b-2 ${
                activeTab === 'decks'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Public Decks ({creatorDecks.length})
            </button>
          </div>

          {storeLoading ? (
            <p className="text-sm text-center py-8 text-on-surface-variant">Loading published material…</p>
          ) : (activeTab === 'quizzes' ? creatorQuizzes.length : creatorDecks.length) === 0 ? (
            <p className="text-sm text-center py-12 text-on-surface-variant">
              No public {activeTab} published yet by this creator.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeTab === 'quizzes'
                ? creatorQuizzes.map((quiz) => (
                    <article
                      key={quiz.id}
                      className="flex flex-col justify-between rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 space-y-4 hover:shadow-sm transition-shadow"
                    >
                      <Link href={`/quiz/${quiz.id}/play`} className="block space-y-2 hover:text-primary">
                        <p className="text-xs text-on-surface-variant">
                          {quiz.category} · {quiz.questions.length} Questions
                        </p>
                        <h3 className="font-bold text-lg text-on-surface leading-snug">{quiz.title}</h3>
                        <p className="text-sm text-on-surface-variant line-clamp-2">{quiz.description}</p>
                      </Link>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/40 pt-3">
                        <div className="flex items-center gap-2">
                          <LikeButton kind="quiz" id={quiz.id} />
                          <button
                            onClick={() => onForkQuiz(quiz)}
                            disabled={forkingId === quiz.id}
                            className="inline-flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
                            title="Save a copy to your library"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            {forkingId === quiz.id ? 'Copying…' : 'Fork'}
                          </button>
                          <button
                            onClick={() => setReportingItem({ kind: 'quiz', id: quiz.id, title: quiz.title })}
                            className="text-on-surface-variant/60 hover:text-error p-1 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                            title="Report this quiz"
                          >
                            <span className="material-symbols-outlined text-[16px]">flag</span>
                          </button>
                        </div>
                        <Link href={`/quiz/${quiz.id}/play`} className="text-xs font-bold text-primary">
                          Take quiz →
                        </Link>
                      </div>
                    </article>
                  ))
                : creatorDecks.map((deck) => (
                    <article
                      key={deck.id}
                      className="flex flex-col justify-between rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 space-y-4 hover:shadow-sm transition-shadow"
                    >
                      <Link href={`/deck/${deck.id}/play`} className="block space-y-2 hover:text-primary">
                        <p className="text-xs text-on-surface-variant">
                          {deck.category} · {deck.cards.length} Cards
                        </p>
                        <h3 className="font-bold text-lg text-on-surface leading-snug">{deck.title}</h3>
                        <p className="text-sm text-on-surface-variant line-clamp-2">{deck.description}</p>
                      </Link>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/40 pt-3">
                        <div className="flex items-center gap-2">
                          <LikeButton kind="deck" id={deck.id} />
                          <button
                            onClick={() => onForkDeck(deck)}
                            disabled={forkingId === deck.id}
                            className="inline-flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
                            title="Save a copy to your library"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            {forkingId === deck.id ? 'Copying…' : 'Fork'}
                          </button>
                          <button
                            onClick={() => setReportingItem({ kind: 'deck', id: deck.id, title: deck.title })}
                            className="text-on-surface-variant/60 hover:text-error p-1 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                            title="Report this deck"
                          >
                            <span className="material-symbols-outlined text-[16px]">flag</span>
                          </button>
                        </div>
                        <Link href={`/deck/${deck.id}/play`} className="text-xs font-bold text-primary">
                          Study cards →
                        </Link>
                      </div>
                    </article>
                  ))}
            </div>
          )}
        </section>

        {/* Moderation reporting modal */}
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
