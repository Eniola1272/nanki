'use client';

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import type { Quiz, Deck, UserProfile, Card, Question } from '@/types/nanki';
import { INITIAL_PROFILE, INITIAL_QUIZZES, INITIAL_DECKS } from '@/lib/data/initial-data';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';
import { showToast } from '@/lib/utils/toast';
import { progressStats, studyDay, percentage, type Attempt } from '@/lib/progress/stats';
import { readAttempts, writeAttempts, mergeAttempts, syncAttempt, fromDatabase, databaseQuizId } from '@/lib/progress/storage';
import type { Json } from '@/types/database';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NankiStore {
  profile: UserProfile;
  attempts: Attempt[];
  userId: string;
  retrySync: () => Promise<void>;
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
  handleCompleteQuizPlay: (quizId: string, answers: Record<string, number | null>, attemptId: string) => string;
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
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES.map(q => ({ ...q, masteredPercentage: 0 })));
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [loading, setLoading] = useState(true);
  const [showCreatorSelector, setShowCreatorSelector] = useState(false);

  const [userId, setUserId] = useState('guest');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const attemptsRef = useRef<Attempt[]>([]);
  const syncing = useRef(false);
  const [today, setToday] = useState(() => studyDay());
  useEffect(() => {
    const timer = setInterval(() => setToday(studyDay()), 60000);
    return () => clearInterval(timer);
  }, []);

  const commitAttempts = useCallback((next: Attempt[], owner: string) => {
    const merged = mergeAttempts(readAttempts(owner), next);
    attemptsRef.current = merged;
    setAttempts(merged);
    try { writeAttempts(owner, merged); }
    catch { showToast.error('Browser storage is unavailable', { description: 'Keep this page open until your results have synced.' }); }
  }, []);

  const retrySync = useCallback(async () => {
    const owner = userIdRef.current;
    if (!owner || syncing.current) return;
    syncing.current = true;
    try {
      let attempt: Attempt | undefined;
      while ((attempt = attemptsRef.current.find(a => !a.synced))) {
        await syncAttempt(owner, attempt);
        if (userIdRef.current !== owner) return;
        commitAttempts(attemptsRef.current.map(a => a.id === attempt!.id ? { ...a, synced: true } : a), owner);
      }
    } catch {
      showToast.error('Results are waiting to sync', { description: 'Your result is kept in this browser. Retry from your progress history when connected.' });
    } finally { syncing.current = false; }
  }, [commitAttempts]);

  useEffect(() => {
    const retry = () => { void retrySync(); };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [retrySync]);

  // ── Bootstrap: load user + data from Supabase ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        commitAttempts(readAttempts('guest'), 'guest');
        setLoading(false);
        return;
      }
      userIdRef.current = user.id;
      setUserId(user.id);
      commitAttempts(readAttempts(user.id), user.id);

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
      }
      const seedIds = await Promise.all(INITIAL_QUIZZES.map(q => databaseQuizId(user.id, q.id)));
      const ownedQuizzes = (quizRows ?? []).filter(q => !seedIds.includes(q.id)).map(dbQuizToLocal);
      const allQuizzes = [...ownedQuizzes, ...INITIAL_QUIZZES.map(q => ({ ...q, masteredPercentage: 0 }))];
      setQuizzes(allQuizzes);
      // Fetch every page so totals and streaks remain correct beyond 1,000 attempts.
      const remote: Attempt[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase.from('quiz_attempts').select('*').eq('user_id', user.id)
          .order('completed_at', { ascending: false }).order('id').range(offset, offset + 999);
        if (error) { showToast.error('Could not load past results', { description: error.message }); break; }
        for (const row of data ?? []) {
          const attempt = fromDatabase(row, allQuizzes);
          if (attempt) remote.push(attempt);
        }
        if (!data || data.length < 1000) break;
      }
      commitAttempts(mergeAttempts(attemptsRef.current, remote), user.id);
      void retrySync();

      // Fetch decks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: deckRows, error: dErr } = await (supabase as any)
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dErr) {
        showToast.error('Failed to load flashcard decks', { description: dErr.message });
      } else if (deckRows && deckRows.length > 0) {
        setDecks(deckRows.map(dbDeckToLocal));
      }

      setLoading(false);
    };

    void init().catch(() => showToast.error('Could not load your account. Please reload to retry.')).finally(() => setLoading(false));
  }, [commitAttempts, retrySync]);

  useEffect(() => {
    if (loading) return;
    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      if ((session?.user.id ?? null) !== userIdRef.current) {
        userIdRef.current = null;
        window.location.reload();
      }
    });
    return () => subscription.unsubscribe();
  }, [loading]);

  // ── triggerToast (backward compat → Sonner info) ──────────────────────────
  const triggerToast = useCallback((msg: string) => {
    showToast.info(msg);
  }, []);

  // ── Save quiz ──────────────────────────────────────────────────────────────
  const handleSaveQuiz = useCallback((savedQuiz: Quiz) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(savedQuiz.id);
    const normalizedQuiz = isUuid ? savedQuiz : {
      ...savedQuiz,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : savedQuiz.id,
    };

    const isNew = !quizzes.some(q => q.id === normalizedQuiz.id);

    // Optimistic local update
    setQuizzes(prev =>
      isNew
        ? [normalizedQuiz, ...prev]
        : prev.map(q => q.id === normalizedQuiz.id ? normalizedQuiz : q)
    );

    // If guest/local mode without auth, keep local and notify
    if (!userIdRef.current) {
      showToast.success(
        isNew ? `Quiz "${normalizedQuiz.title}" created!` : `Quiz "${normalizedQuiz.title}" updated!`
      );
      return;
    }

    // Persist to Supabase
    ;(async () => {
      const supabase = createClient();
      const payload = {
        id: normalizedQuiz.id,
        title: normalizedQuiz.title,
        description: normalizedQuiz.description,
        content: normalizedQuiz.questions as unknown as Json,
        category: normalizedQuiz.category,
        mastered_percentage: normalizedQuiz.masteredPercentage ?? 0,
        user_id: userIdRef.current,
        published: false,
      };

      const { error } = await supabase.from('quizzes').upsert(payload);

      if (error) {
        showToast.error(
          isNew ? 'Failed to create quiz' : 'Failed to update quiz',
          { description: error.message }
        );
        // Rollback optimistic update on error
        setQuizzes(prev =>
          isNew
            ? prev.filter(q => q.id !== normalizedQuiz.id)
            : prev.map(q => q.id === normalizedQuiz.id ? normalizedQuiz : q)
        );
      } else {
        showToast.success(
          isNew ? `Quiz "${normalizedQuiz.title}" created!` : `Quiz "${normalizedQuiz.title}" updated!`
        );
      }
    })();
  }, [quizzes]);

  // ── Save deck ──────────────────────────────────────────────────────────────
  const handleSaveDeck = useCallback((savedDeck: Deck) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(savedDeck.id);
    const normalizedDeck = isUuid ? savedDeck : {
      ...savedDeck,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : savedDeck.id,
    };

    const isNew = !decks.some(d => d.id === normalizedDeck.id);

    // Optimistic local update
    setDecks(prev =>
      isNew
        ? [normalizedDeck, ...prev]
        : prev.map(d => d.id === normalizedDeck.id ? normalizedDeck : d)
    );

    // If guest/local mode without auth, keep local and notify
    if (!userIdRef.current) {
      showToast.success(
        isNew ? `Deck "${normalizedDeck.title}" created!` : `Deck "${normalizedDeck.title}" updated!`
      );
      return;
    }

    // Persist to Supabase
    ;(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any;
      const payload = {
        id: normalizedDeck.id,
        title: normalizedDeck.title,
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

  // Save locally before navigating; the stable attempt ID makes retries idempotent.
  const handleCompleteQuizPlay = useCallback((quizId: string, answers: Record<string, number | null>, attemptId: string) => {
    if (attemptsRef.current.some(a => a.id === attemptId)) return attemptId;
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz || !quiz.questions.length) throw new Error('Quiz unavailable');
    const correct = quiz.questions.filter(q => answers[q.id] === q.correctOptionIndex).length;
    const attempt: Attempt = {
      id: attemptId, quizId, quiz, correct, total: quiz.questions.length, answers,
      completedAt: new Date().toISOString(), studyDay: studyDay(), synced: false,
    };
    commitAttempts(mergeAttempts(attemptsRef.current, [attempt]), userIdRef.current ?? 'guest');
    void retrySync();
    return attempt.id;
  }, [quizzes, commitAttempts, retrySync]);

  const stats = progressStats(attempts, new Date(`${today}T12:00:00`));
  const trackedQuizzes = quizzes.map(q => ({ ...q, masteredPercentage: Math.max(0, ...attempts.filter(a => a.quizId === q.id).map(percentage)) }));

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
      profile: { ...profile, ...stats }, quizzes: trackedQuizzes, decks, loading, attempts, userId, retrySync,
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
