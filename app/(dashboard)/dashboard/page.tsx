'use client';

import { useRouter } from 'next/navigation';
import NankiShell from '@/components/nanki/NankiShell';
import { useNankiStore } from '@/lib/nanki-store';

export default function DashboardPage() {
  const router = useRouter();
  const { profile, quizzes, decks, resetAllState } = useNankiStore();

  return (
    <NankiShell>
      <main className="w-full max-w-[800px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">

        {/* Greeting */}
        <section className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-outline-variant/30 pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl text-on-surface font-extrabold mb-1">Good morning, {profile.name}!</h2>
            <p className="text-xs md:text-sm text-on-surface-variant">Ready to master some new concepts today?</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-tertiary-container rounded-2xl text-on-tertiary-container border border-tertiary-fixed-dim/20 shadow-sm self-start md:self-auto">
            <span className="material-symbols-outlined fill text-teal-300">local_fire_department</span>
            <span className="text-xs md:text-sm font-bold">{profile.streak} Day Streak!</span>
          </div>
        </section>

        {/* Recent Quizzes */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base md:text-lg font-bold text-on-surface">Recent Quizzes</h3>
            <button onClick={() => router.push('/discover')} className="text-xs text-primary hover:underline cursor-pointer">View All</button>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar -mx-4 px-4 scroll-smooth">
            {quizzes.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/quiz/${item.id}/play`)}
                className="min-w-[270px] max-w-[270px] bg-surface-container-lowest border border-outline-variant hover:border-primary rounded-2xl p-4 flex flex-col hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all cursor-pointer shrink-0 relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">{item.category}</span>
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/quiz/${item.id}/edit`); }}
                    className="text-outline hover:text-primary p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
                    title="Edit Quiz"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
                <h4 className="font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors text-ellipsis overflow-hidden whitespace-nowrap">{item.title}</h4>
                <p className="text-xs text-on-surface-variant mb-4">{item.questions.length} questions</p>
                <div className="mt-auto w-full">
                  <div className="w-full bg-surface-variant rounded-full h-2 mb-1.5">
                    <div className="bg-tertiary h-2 rounded-full transition-all duration-300" style={{ width: `${item.masteredPercentage || 0}%` }}></div>
                  </div>
                  <p className="text-[10px] text-secondary text-right font-medium">{item.masteredPercentage || 0}% Mastered</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Flashcard Decks */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base md:text-lg font-bold text-on-surface">Flashcard Decks</h3>
            <button onClick={() => router.push('/discover')} className="text-xs text-primary hover:underline cursor-pointer">View All</button>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar -mx-4 px-4 scroll-smooth">
            {decks.map((deck) => (
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
                <span className="material-symbols-outlined text-primary mb-2 text-[36px] group-hover:scale-110 transition-transform">style</span>
                <h4 className="font-bold text-base mb-1 text-on-surface text-ellipsis overflow-hidden w-full">{deck.title}</h4>
                <p className="text-xs text-on-surface-variant">{deck.cards.length} Cards</p>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-6 border-t border-outline-variant/30 text-center">
          <button
            onClick={resetAllState}
            className="text-xs text-outline hover:text-error transition-colors font-medium border border-outline-variant rounded-lg px-3 py-1 bg-surface-container-low"
          >
            Reset App Data
          </button>
        </div>
      </main>
    </NankiShell>
  );
}
