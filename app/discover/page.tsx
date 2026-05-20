'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NankiShell from '@/components/nanki/NankiShell';
import { useNankiStore } from '@/lib/nanki-store';

const CATEGORIES = ['All Topics', 'Biology', 'History', 'Physics', 'Computer Science', 'Languages', 'Math'];

export default function DiscoverPage() {
  const router = useRouter();
  const { quizzes, decks, triggerToast } = useNankiStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Topics');

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All Topics' || q.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredDecks = decks.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All Topics' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const triggerShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    triggerToast('Copied study deck sharing link to clipboard! 🔗');
  };

  return (
    <NankiShell>
      <main className="w-full max-w-[800px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">

        {/* Search */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl text-on-surface font-extrabold">Find Quizzes & Decks</h2>
          <div className="relative max-w-xl">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Biology, AP History, Spanish..."
              className="w-full pl-10 pr-4 py-3 rounded-full border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50 focus:outline-none text-sm md:text-base transition-all shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Categories</h3>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-transform hover:scale-95 duration-200 ${
                    isActive ? 'bg-primary border-primary text-on-primary font-bold' : 'bg-surface-container-highest text-on-surface border-outline-variant hover:bg-surface-variant'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Trending card */}
          <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col justify-between group hover:shadow-lg transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="px-2.5 py-1 bg-tertiary-fixed/30 text-tertiary text-[10px] font-bold uppercase rounded tracking-wider">Trending Biology</div>
                <button onClick={() => triggerToast('Topic bookmarked successfully!')} className="material-symbols-outlined text-outline hover:text-primary cursor-pointer transition-colors">bookmark_add</button>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-on-surface mb-2 group-hover:text-primary transition-colors">Cellular Respiration Mastery</h3>
              <p className="text-xs md:text-sm text-on-surface-variant mb-6 max-w-lg">
                Comprehensive deep-dive into glycolysis, Krebs cycle, and the electron transport chain. Perfect for AP Biology curriculum preparation.
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/50 pt-3 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                <span className="material-symbols-outlined text-[16px]">style</span>
                <span>142 Cards</span>
                <span className="mx-1">•</span>
                <span>@dr_biology</span>
              </div>
              <button onClick={() => router.push('/deck/deck-bio-101/play')} className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-container transition-transform active:scale-95 cursor-pointer">
                Study Now
              </button>
            </div>
          </div>

          {/* Share card */}
          <div className="md:col-span-4 bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
              <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface mb-1">Share Your Decks</h3>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">Generate direct import links for study circles.</p>
            <button onClick={triggerShare} className="w-full border border-primary text-primary px-4 py-2 text-xs rounded-xl font-bold bg-white hover:bg-surface-container-lowest hover:scale-[0.98] active:scale-95 transition-all cursor-pointer">
              Generate Share Link
            </button>
          </div>

          {/* Results */}
          {filteredQuizzes.length === 0 && filteredDecks.length === 0 ? (
            <div className="col-span-12 text-center py-12 text-outline">No quizzes or decks match your current query or category filter.</div>
          ) : (
            <>
              {filteredQuizzes.map(q => (
                <div key={q.id} onClick={() => router.push(`/quiz/${q.id}/play`)}
                  className="md:col-span-6 bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl flex flex-col justify-between hover:shadow-md cursor-pointer transition-shadow">
                  <div className="mb-4">
                    <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded uppercase">{q.category}</span>
                    <h4 className="font-bold text-base text-on-surface mt-2 mb-1">{q.title}</h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{q.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
                    <span className="text-[10px] text-secondary font-semibold">{q.questions.length} Questions</span>
                    <span className="text-[10px] uppercase font-bold text-primary">Play →</span>
                  </div>
                </div>
              ))}
              {filteredDecks.map(d => (
                <div key={d.id} onClick={() => router.push(`/deck/${d.id}/play`)}
                  className="md:col-span-6 bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl flex flex-col justify-between hover:shadow-md cursor-pointer transition-shadow">
                  <div className="mb-4">
                    <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded uppercase">{d.category}</span>
                    <h4 className="font-bold text-base text-on-surface mt-2 mb-1">{d.title}</h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{d.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
                    <span className="text-[10px] text-secondary font-semibold">{d.cards.length} Cards</span>
                    <span className="text-[10px] uppercase font-bold text-primary">Study →</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </NankiShell>
  );
}
