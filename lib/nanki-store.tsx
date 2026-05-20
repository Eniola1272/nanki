'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Quiz, Deck, UserProfile } from '@/types/nanki';
import { INITIAL_QUIZZES, INITIAL_DECKS, INITIAL_PROFILE } from '@/lib/data/initial-data';
import { useRouter } from 'next/navigation';

interface NankiStore {
  profile: UserProfile;
  quizzes: Quiz[];
  decks: Deck[];
  toastMessage: string | null;
  showCreatorSelector: boolean;
  setShowCreatorSelector: (v: boolean) => void;
  triggerToast: (msg: string) => void;
  handleSaveQuiz: (quiz: Quiz) => void;
  handleSaveDeck: (deck: Deck) => void;
  handleDeleteQuiz: (id: string) => void;
  handleDeleteDeck: (id: string) => void;
  handleCompleteQuizPlay: (quizId: string, correct: number, wrong: number) => void;
  resetAllState: () => void;
}

const NankiContext = createContext<NankiStore | null>(null);

export function useNankiStore() {
  const ctx = useContext(NankiContext);
  if (!ctx) throw new Error('useNankiStore must be used inside NankiProvider');
  return ctx;
}

function save(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export function NankiProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCreatorSelector, setShowCreatorSelector] = useState(false);

  // Bootstrap from localStorage
  useEffect(() => {
    try {
      const p = localStorage.getItem('nanki_profile');
      const q = localStorage.getItem('nanki_quizzes');
      const d = localStorage.getItem('nanki_decks');
      if (p) setProfile(JSON.parse(p));
      if (q) setQuizzes(JSON.parse(q));
      if (d) setDecks(JSON.parse(d));
    } catch {}
  }, []);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const handleSaveQuiz = useCallback((savedQuiz: Quiz) => {
    setQuizzes(prev => {
      const exists = prev.some(q => q.id === savedQuiz.id);
      const updated = exists ? prev.map(q => q.id === savedQuiz.id ? savedQuiz : q) : [savedQuiz, ...prev];
      save('nanki_quizzes', updated);
      triggerToast(exists ? `Quiz "${savedQuiz.title}" updated!` : `Created quiz "${savedQuiz.title}"!`);
      return updated;
    });
  }, [triggerToast]);

  const handleSaveDeck = useCallback((savedDeck: Deck) => {
    setDecks(prev => {
      const exists = prev.some(d => d.id === savedDeck.id);
      const updated = exists ? prev.map(d => d.id === savedDeck.id ? savedDeck : d) : [savedDeck, ...prev];
      save('nanki_decks', updated);
      triggerToast(exists ? `Flashcards "${savedDeck.title}" updated!` : `Created deck "${savedDeck.title}"!`);
      return updated;
    });
  }, [triggerToast]);

  const handleDeleteQuiz = useCallback((id: string) => {
    setQuizzes(prev => {
      const updated = prev.filter(q => q.id !== id);
      save('nanki_quizzes', updated);
      return updated;
    });
    triggerToast('Quiz deleted.');
  }, [triggerToast]);

  const handleDeleteDeck = useCallback((id: string) => {
    setDecks(prev => {
      const updated = prev.filter(d => d.id !== id);
      save('nanki_decks', updated);
      return updated;
    });
    triggerToast('Deck deleted.');
  }, [triggerToast]);

  const handleCompleteQuizPlay = useCallback((quizId: string, correct: number, wrong: number) => {
    const total = correct + wrong;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    setProfile(prev => {
      const updated = {
        ...prev,
        totalQuizzesTaken: prev.totalQuizzesTaken + 1,
        xpProgress: Math.min(100, Math.round((prev.xpProgress + pct) / 2)),
      };
      save('nanki_profile', updated);
      return updated;
    });
    setQuizzes(prev => {
      const updated = prev.map(q =>
        q.id === quizId ? { ...q, masteredPercentage: Math.max(q.masteredPercentage || 0, pct) } : q
      );
      save('nanki_quizzes', updated);
      return updated;
    });
  }, []);

  const resetAllState = useCallback(() => {
    if (!confirm('Reset to default seed data?')) return;
    localStorage.clear();
    setProfile(INITIAL_PROFILE);
    setQuizzes(INITIAL_QUIZZES);
    setDecks(INITIAL_DECKS);
    triggerToast('Local records reset successfully!');
    router.push('/');
  }, [triggerToast, router]);

  return (
    <NankiContext.Provider value={{
      profile, quizzes, decks,
      toastMessage, showCreatorSelector, setShowCreatorSelector,
      triggerToast,
      handleSaveQuiz, handleSaveDeck,
      handleDeleteQuiz, handleDeleteDeck,
      handleCompleteQuizPlay,
      resetAllState,
    }}>
      {children}

      {/* Create selector modal */}
      {showCreatorSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-2xl p-6 border border-outline-variant shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-lg-mobile text-base font-extrabold flex items-center gap-1.5 text-on-surface">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Create New Content
              </h3>
              <button onClick={() => setShowCreatorSelector(false)} className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
              Design a multiple-choice practice quiz or pack together a deck of interactive flashcards for studying.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowCreatorSelector(false); router.push('/quiz/new'); }}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3 px-4 rounded-xl flex items-center gap-2 justify-center cursor-pointer transition-transform active:scale-95 shadow-sm text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">quiz</span>
                <span>Create Practice Quiz</span>
              </button>
              <button
                onClick={() => { setShowCreatorSelector(false); router.push('/deck/new'); }}
                className="w-full bg-surface-container-lowest hover:bg-surface-container-low text-primary border border-primary font-bold py-3 px-4 rounded-xl flex items-center gap-2 justify-center cursor-pointer transition-transform active:scale-95 text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">style</span>
                <span>Create Flashcards Deck</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-slight max-w-[340px] md:max-w-md w-full px-4">
          <div className="bg-inverse-surface text-inverse-on-surface py-3 px-4 rounded-xl shadow-xl border border-outline/20 text-xs font-semibold tracking-wide flex items-center gap-2 justify-center">
            <span className="material-symbols-outlined text-[18px] text-tertiary-fixed font-bold">info</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </NankiContext.Provider>
  );
}
