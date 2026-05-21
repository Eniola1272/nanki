'use client';

import { useRouter } from 'next/navigation';
import NankiShell from '@/components/nanki/NankiShell';
import { useNankiStore } from '@/lib/nanki-store';

function greeting(name: string) {
  const hour = new Date().getHours();
  const tod = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${tod}, ${name.split(' ')[0]}!`;
}

// ── Skeleton loaders ──────────────────────────────────────────────────────────

function QuizCardSkeleton() {
  return (
    <div className="min-w-[270px] max-w-[270px] bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col shrink-0 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-5 w-20 bg-surface-container-high rounded-lg" />
        <div className="h-5 w-5 bg-surface-container-high rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-surface-container-high rounded mb-2" />
      <div className="h-3 w-1/3 bg-surface-container rounded mb-6" />
      <div className="mt-auto space-y-1.5">
        <div className="w-full h-2 bg-surface-container-high rounded-full" />
        <div className="h-2.5 w-16 bg-surface-container rounded ml-auto" />
      </div>
    </div>
  );
}

function DeckCardSkeleton() {
  return (
    <div className="min-w-[240px] max-w-[240px] aspect-[4/3] bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col justify-center items-center shrink-0 animate-pulse gap-3">
      <div className="w-10 h-10 bg-surface-container-high rounded-full" />
      <div className="h-4 w-32 bg-surface-container-high rounded" />
      <div className="h-3 w-16 bg-surface-container rounded" />
    </div>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────

function EmptyQuizzes({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="min-w-full flex flex-col items-center justify-center py-10 gap-4 border border-dashed border-outline-variant/60 rounded-2xl text-center px-6">
      <span className="material-symbols-outlined text-[40px] text-outline-variant">quiz</span>
      <div>
        <p className="font-semibold text-on-surface text-sm">No quizzes yet.</p>
        <p className="text-xs text-on-surface-variant mt-0.5">Create your first quiz to start tracking mastery.</p>
      </div>
      <button
        onClick={onCreate}
        className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[14px]">add</span>
        Create quiz
      </button>
    </div>
  );
}

function EmptyDecks({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="min-w-full flex flex-col items-center justify-center py-10 gap-4 border border-dashed border-outline-variant/60 rounded-2xl text-center px-6">
      <span className="material-symbols-outlined text-[40px] text-outline-variant">style</span>
      <div>
        <p className="font-semibold text-on-surface text-sm">No flashcard decks yet.</p>
        <p className="text-xs text-on-surface-variant mt-0.5">Build a deck and practise with spaced repetition.</p>
      </div>
      <button
        onClick={onCreate}
        className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[14px]">add</span>
        Create deck
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { profile, quizzes, decks, loading, setShowCreatorSelector } = useNankiStore();

  const openCreate = () => setShowCreatorSelector(true);

  return (
    <NankiShell>
      <main className="w-full max-w-[800px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">

        {/* Greeting */}
        <section className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-outline-variant/30 pb-4">
          <div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-7 w-56 bg-surface-container-high rounded" />
                <div className="h-3 w-40 bg-surface-container rounded" />
              </div>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl text-on-surface font-extrabold mb-1">
                  {greeting(profile.name)}
                </h2>
                <p className="text-xs md:text-sm text-on-surface-variant">
                  Ready to master some new concepts today?
                </p>
              </>
            )}
          </div>
          {!loading && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-tertiary-container rounded-2xl text-on-tertiary-container border border-tertiary-fixed-dim/20 shadow-sm self-start md:self-auto">
              <span className="material-symbols-outlined fill text-teal-300">local_fire_department</span>
              <span className="text-xs md:text-sm font-bold">{profile.streak} Day Streak!</span>
            </div>
          )}
        </section>

        {/* Recent Quizzes */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base md:text-lg font-bold text-on-surface">My Quizzes</h3>
            <button
              onClick={() => router.push('/discover')}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Discover more
            </button>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar -mx-4 px-4 scroll-smooth">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <QuizCardSkeleton key={i} />)
            ) : quizzes.length === 0 ? (
              <EmptyQuizzes onCreate={openCreate} />
            ) : (
              quizzes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/quiz/${item.id}/play`)}
                  className="min-w-[270px] max-w-[270px] bg-surface-container-lowest border border-outline-variant hover:border-primary rounded-2xl p-4 flex flex-col hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all cursor-pointer shrink-0 relative group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">
                      {item.category || 'General'}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/quiz/${item.id}/edit`); }}
                      className="text-outline hover:text-primary p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
                      title="Edit Quiz"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant mb-4">
                    {item.questions.length} question{item.questions.length !== 1 ? 's' : ''}
                  </p>
                  <div className="mt-auto w-full">
                    <div className="w-full bg-surface-container-high rounded-full h-2 mb-1.5">
                      <div
                        className="bg-tertiary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.masteredPercentage ?? 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-secondary text-right font-medium">
                      {item.masteredPercentage ?? 0}% Mastered
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Flashcard Decks */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base md:text-lg font-bold text-on-surface">Flashcard Decks</h3>
            <button
              onClick={() => router.push('/discover')}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Discover more
            </button>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar -mx-4 px-4 scroll-smooth">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <DeckCardSkeleton key={i} />)
            ) : decks.length === 0 ? (
              <EmptyDecks onCreate={openCreate} />
            ) : (
              decks.map((deck) => (
                <div
                  key={deck.id}
                  onClick={() => router.push(`/deck/${deck.id}/play`)}
                  className="min-w-[240px] max-w-[240px] aspect-[4/3] bg-surface-container-lowest border border-outline-variant hover:border-primary rounded-2xl p-4 flex flex-col justify-center items-center text-center hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all cursor-pointer shrink-0 relative group"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/deck/${deck.id}/edit`); }}
                      className="text-outline hover:text-primary p-1.5 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
                      title="Edit Deck"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                  <span className="material-symbols-outlined text-primary mb-2 text-[36px] group-hover:scale-110 transition-transform">
                    style
                  </span>
                  <h4 className="font-bold text-base mb-1 text-on-surface truncate w-full text-center">
                    {deck.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    {deck.cards.length} Card{deck.cards.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </NankiShell>
  );
}
