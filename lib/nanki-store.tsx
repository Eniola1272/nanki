'use client';

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import type { Quiz, Deck, UserProfile, Card, Question } from '@/types/nanki';
import { INITIAL_PROFILE } from '@/lib/data/initial-data';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';
import { showToast } from '@/lib/utils/toast';
import type { Json } from '@/types/database';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NankiStore {
  profile: UserProfile;
  quizzes: Quiz[];
  decks: Deck[];
  loading: boolean;
  /** @deprecated No longer rendered — kept for call-site compat. Use showToast directly. */
  toastMessage: string | null;
  showCreatorSelector: boolean;
  setShowCreatorSelector: (v: boolean) => void;
  /** Fires a Sonner info toast. Kept for backward compat with existing callers. */
  triggerToast: (msg: string) => void;
  handleSaveQuiz: (quiz: Quiz) => void;
  handleSaveDeck: (deck: Deck) => void;
  handleDeleteQuiz: (id: string) => void;
  handleDeleteDeck: (id: string) => void;
  handleCompleteQuizPlay: (quizId: string, correct: number, wrong: number) => void;
  resetAllState: () => void;
}

// ── DB ↔ Local converters ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbQuizToLocal(row: any): Quiz {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: row.category ?? '',
    masteredPercentage: row.mastered_percentage ?? 0,
    questions: Array.isArray(row.content) ? (row.content as Question[]) : [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbDeckToLocal(row: any): Deck {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: row.category ?? '',
    cards: Array.isArray(row.content) ? (row.content as Card[]) : [],
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

const NankiContext = createContext<NankiStore | null>(null);

export function useNankiStore() {
  const ctx = useContext(NankiContext);
  if (!ctx) throw new Error('useNankiStore must be used inside NankiProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function NankiProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const userIdRef = useRef<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatorSelector, setShowCreatorSelector] = useState(false);

  // ── Bootstrap: load user + data from Supabase ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      userIdRef.current = user.id;

      // Real profile name/avatar
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single<{ name: string | null; avatar_url: string | null }>();

      if (profileRow) {
        setProfile(prev => ({
          ...prev,
          name: profileRow.name ?? user.user_metadata?.full_name ?? prev.name,
          avatar: profileRow.avatar_url ?? user.user_metadata?.avatar_url ?? prev.avatar,
        }));
      }

      // Fetch quizzes
      const { data: quizRows, error: qErr } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (qErr) {
        showToast.error('Failed to load quizzes', { description: qErr.message });
      } else {
        setQuizzes((quizRows ?? []).map(dbQuizToLocal));
      }

      // Fetch decks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: deckRows, error: dErr } = await (supabase as any)
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dErr) {
        showToast.error('Failed to load flashcard decks', { description: dErr.message });
      } else {
        setDecks((deckRows ?? []).map(dbDeckToLocal));
      }

      setLoading(false);
    };

    init();
  }, []);

  // ── triggerToast (backward compat → Sonner info) ──────────────────────────
  const triggerToast = useCallback((msg: string) => {
    showToast.info(msg);
  }, []);

  // ── Save quiz ──────────────────────────────────────────────────────────────
  const handleSaveQuiz = useCallback((savedQuiz: Quiz) => {
    const isNew = !quizzes.some(q => q.id === savedQuiz.id);

    // Optimistic local update
    setQuizzes(prev =>
      isNew
        ? [savedQuiz, ...prev]
        : prev.map(q => q.id === savedQuiz.id ? savedQuiz : q)
    );

    // Persist to Supabase
    ;(async () => {
      const supabase = createClient();
      const payload = {
        id: savedQuiz.id,
        title: savedQuiz.title,
        description: savedQuiz.description,
        content: savedQuiz.questions as unknown as Json,
        category: savedQuiz.category,
        mastered_percentage: savedQuiz.masteredPercentage ?? 0,
        user_id: userIdRef.current,
        published: false,
      };

      const { error } = await supabase.from('quizzes').upsert(payload as any);

      if (error) {
        showToast.error(
          isNew ? 'Failed to create quiz' : 'Failed to update quiz',
          { description: error.message }
        );
        // Rollback optimistic update on error
        setQuizzes(prev =>
          isNew
            ? prev.filter(q => q.id !== savedQuiz.id)
            : prev.map(q => q.id === savedQuiz.id ? savedQuiz : q)
        );
      } else {
        showToast.success(
          isNew ? `Quiz "${savedQuiz.title}" created!` : `Quiz "${savedQuiz.title}" updated!`
        );
      }
    })();
  }, [quizzes]);

  // ── Save deck ──────────────────────────────────────────────────────────────
  const handleSaveDeck = useCallback((savedDeck: Deck) => {
    const isNew = !decks.some(d => d.id === savedDeck.id);

    // Optimistic local update
    setDecks(prev =>
      isNew
        ? [savedDeck, ...prev]
        : prev.map(d => d.id === savedDeck.id ? savedDeck : d)
    );

    // Persist to Supabase
    ;(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any;
      const payload = {
        id: savedDeck.id,
        title: savedDeck.title,
        description: savedDeck.description,
        content: savedDeck.cards,
        category: savedDeck.category,
        user_id: userIdRef.current,
        published: false,
      };

      const { error } = await db.from('decks').upsert(payload);

      if (error) {
        showToast.error(
          isNew ? 'Failed to create deck' : 'Failed to update deck',
          { description: error.message }
        );
        // Rollback
        setDecks(prev =>
          isNew
            ? prev.filter(d => d.id !== savedDeck.id)
            : prev.map(d => d.id === savedDeck.id ? savedDeck : d)
        );
      } else {
        showToast.success(
          isNew ? `Deck "${savedDeck.title}" created!` : `Deck "${savedDeck.title}" updated!`
        );
      }
    })();
  }, [decks]);

  // ── Delete quiz ────────────────────────────────────────────────────────────
  const handleDeleteQuiz = useCallback((id: string) => {
    const quiz = quizzes.find(q => q.id === id);
    setQuizzes(prev => prev.filter(q => q.id !== id));

    ;(async () => {
      const supabase = createClient();
      const { error } = await supabase.from('quizzes').delete().eq('id', id);

      if (error) {
        showToast.error('Failed to delete quiz', { description: error.message });
        // Restore on error
        if (quiz) setQuizzes(prev => [quiz, ...prev]);
      } else {
        showToast.success('Quiz deleted.');
      }
    })();
  }, [quizzes]);

  // ── Delete deck ────────────────────────────────────────────────────────────
  const handleDeleteDeck = useCallback((id: string) => {
    const deck = decks.find(d => d.id === id);
    setDecks(prev => prev.filter(d => d.id !== id));

    ;(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (createClient() as any).from('decks').delete().eq('id', id);

      if (error) {
        showToast.error('Failed to delete deck', { description: error.message });
        if (deck) setDecks(prev => [deck, ...prev]);
      } else {
        showToast.success('Deck deleted.');
      }
    })();
  }, [decks]);

  // ── Complete quiz play ─────────────────────────────────────────────────────
  const handleCompleteQuizPlay = useCallback((quizId: string, correct: number, wrong: number) => {
    const total = correct + wrong;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    let newMasteredPct = pct;

    setProfile(prev => ({
      ...prev,
      totalQuizzesTaken: prev.totalQuizzesTaken + 1,
      xpProgress: Math.min(100, Math.round((prev.xpProgress + pct) / 2)),
    }));

    setQuizzes(prev =>
      prev.map(q => {
        if (q.id !== quizId) return q;
        newMasteredPct = Math.max(q.masteredPercentage ?? 0, pct);
        return { ...q, masteredPercentage: newMasteredPct };
      })
    );

    ;(async () => {
      const supabase = createClient();
      const uid = userIdRef.current;

      // Update mastery percentage on the quiz row
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: uErr } = await (supabase.from('quizzes') as any)
        .update({ mastered_percentage: newMasteredPct })
        .eq('id', quizId);

      if (uErr) {
        showToast.error('Could not save quiz progress', { description: uErr.message });
      }

      // Record the attempt
      if (uid) {
        const { error: aErr } = await supabase.from('quiz_attempts').insert({
          quiz_id: quizId,
          user_id: uid,
          score: correct,
          max_score: total,
          completed_at: new Date().toISOString(),
        } as any);
        if (aErr) {
          showToast.error('Could not record quiz attempt', { description: aErr.message });
        }
      }
    })();
  }, []);

  // ── Reset (sign-out + redirect home) ──────────────────────────────────────
  const resetAllState = useCallback(() => {
    if (!confirm('Sign out and return to the home page?')) return;
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      router.push('/');
    });
  }, [router]);

  return (
    <NankiContext.Provider value={{
      profile, quizzes, decks, loading,
      toastMessage: null,
      showCreatorSelector, setShowCreatorSelector,
      triggerToast,
      handleSaveQuiz, handleSaveDeck,
      handleDeleteQuiz, handleDeleteDeck,
      handleCompleteQuizPlay,
      resetAllState,
    }}>
      {children}

      {/* ── Create selector modal ─────────────────────────────────────────── */}
      {showCreatorSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-2xl p-6 border border-outline-variant shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold flex items-center gap-1.5 text-on-surface">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Create New Content
              </h3>
              <button
                onClick={() => setShowCreatorSelector(false)}
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              Design a multiple-choice practice quiz or pack together a deck of interactive flashcards.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowCreatorSelector(false); router.push('/quiz/new'); }}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3 px-4 rounded-xl flex items-center gap-2 justify-center cursor-pointer transition-transform active:scale-95 shadow-sm text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">quiz</span>
                Create Practice Quiz
              </button>
              <button
                onClick={() => { setShowCreatorSelector(false); router.push('/deck/new'); }}
                className="w-full bg-surface-container-lowest hover:bg-surface-container-low text-primary border border-primary font-bold py-3 px-4 rounded-xl flex items-center gap-2 justify-center cursor-pointer transition-transform active:scale-95 text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">style</span>
                Create Flashcards Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </NankiContext.Provider>
  );
}
