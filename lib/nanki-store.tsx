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
import { scoreQuiz, validQuestion } from '@/lib/quiz/scoring';
import { progressStats, studyDay, percentage, type Attempt } from '@/lib/progress/stats';
import { readAttempts, writeAttempts, mergeAttempts, syncAttempt, fromDatabase, databaseQuizId } from '@/lib/progress/storage';
import { type FlashcardSession, flashcardKey, readFlashcards, mergeFlashcards, syncFlashcard, flashcardFromDatabase } from '@/lib/progress/flashcards';
import type { Json, DbQuiz, Database } from '@/types/database';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NankiStore {
  profile: UserProfile;
  attempts: Attempt[];
  flashcardSessions: FlashcardSession[];
  handleCompleteFlashcards: (deck: Deck, sessionId: string) => void;
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
  handleSaveQuiz: (quiz: Quiz) => Promise<boolean>;
  handleSaveDeck: (deck: Deck) => Promise<boolean>;
  handleDeleteQuiz: (id: string) => void;
  handleDeleteDeck: (id: string) => void;
  handleCompleteQuizPlay: (quizId: string, answers: Record<string, number | null>, attemptId: string, negativeMarking?: boolean) => string;
  resetAllState: () => Promise<void>;
  signingOut: boolean;
  likesAvailable: boolean;
  toggleLike: (kind: 'quiz' | 'deck', id: string) => Promise<void>;
}

// ── DB ↔ Local converters ─────────────────────────────────────────────────────

function dbQuizToLocal(row: DbQuiz): Quiz {
  return {
    id: row.id,
    ownerId: row.user_id, published: row.published, createdAt: row.created_at,
    title: row.title,
    description: row.description ?? '',
    category: row.category ?? '',
    masteredPercentage: row.mastered_percentage ?? 0,
    questions: Array.isArray(row.content) ? (row.content as unknown as Question[]) : [],
  };
}

function dbDeckToLocal(row: Database['public']['Tables']['decks']['Row']): Deck {
  return {
    id: row.id,
    ownerId: row.user_id, published: row.published, createdAt: row.created_at,
    title: row.title,
    description: row.description ?? '',
    category: row.category ?? '',
    cards: Array.isArray(row.content) ? (row.content as unknown as Card[]) : [],
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
  const [signingOut, setSigningOut] = useState(false);
  const signingOutRef = useRef(false);
  const [likesAvailable, setLikesAvailable] = useState(false);
  const likeRequests = useRef(new Set<string>());
  const [showCreatorSelector, setShowCreatorSelector] = useState(false);

  const [userId, setUserId] = useState('guest');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const attemptsRef = useRef<Attempt[]>([]);
  const syncing = useRef(false);
  const [flashcardSessions, setFlashcardSessions] = useState<FlashcardSession[]>([]);
  const flashcardsRef = useRef<FlashcardSession[]>([]);
  const commitFlashcards = useCallback((rows: FlashcardSession[], owner: string) => {
    const merged = mergeFlashcards(readFlashcards(owner), rows);
    flashcardsRef.current = merged;
    setFlashcardSessions(merged);
    try { localStorage.setItem(flashcardKey(owner), JSON.stringify(merged)); }
    catch { showToast.error('Cannot save flashcard progress in this browser. Keep this page open until synced.'); }
  }, []);
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
      let session: FlashcardSession | undefined;
      while ((session = flashcardsRef.current.find(row => !row.synced))) {
        await syncFlashcard(owner, session);
        if (userIdRef.current !== owner) return;
        commitFlashcards(flashcardsRef.current.map(row => row.id === session!.id ? { ...row, synced: true } : row), owner);
      }
    } catch {
      showToast.error('Results are waiting to sync', { description: 'Your result is kept in this browser. Retry from your progress history when connected.' });
    } finally { syncing.current = false; }
  }, [commitAttempts, commitFlashcards]);

  useEffect(() => {
    const retry = () => { void retrySync(); };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [retrySync]);

  const refreshLikes = useCallback(async () => {
    const owner = userIdRef.current;
    const rows: Database['public']['Functions']['content_like_stats']['Returns'] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await createClient().rpc('content_like_stats').order('kind').order('content_id').range(offset, offset + 999);
      if (owner !== userIdRef.current) return;
      if (error) { setLikesAvailable(false); return; }
      rows.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    const apply = <T extends Quiz | Deck>(items: T[], kind: string): T[] => items.map(item => {
      const stats = rows.find(row => row.kind === kind && row.content_id === item.id);
      return { ...item, likeCount: Number(stats?.like_count ?? 0), likedByMe: stats?.liked_by_me ?? false };
    });
    setQuizzes(items => apply(items, 'quiz'));
    setDecks(items => apply(items, 'deck'));
    setLikesAvailable(true);
  }, []);

  // Read owned and public content; RLS still enforces privacy at the database.
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      const owner = user?.id ?? 'guest';
      userIdRef.current = user?.id ?? null;
      setUserId(owner);
      commitAttempts(readAttempts(owner), owner);
      commitFlashcards(readFlashcards(owner), owner);
      if (user) {
        const { data: profileRow } = await supabase.from('profiles').select('name, avatar_url').eq('id', user.id).single();
        if (cancelled) return;
        setProfile({ ...INITIAL_PROFILE, name: profileRow?.name ?? user.user_metadata?.full_name ?? 'Learner', avatar: profileRow?.avatar_url ?? user.user_metadata?.avatar_url ?? INITIAL_PROFILE.avatar });
      }
      const seedIds = user ? await Promise.all(INITIAL_QUIZZES.map(q => databaseQuizId(user.id, q.id))) : [];
      const allQuizzes: Quiz[] = [];
      const allDecks: Deck[] = [];
      for (let offset = 0; ; offset += 1000) {
        let query = supabase.from('quizzes').select('*');
        query = user ? query.or(`user_id.eq.${user.id},published.eq.true`) : query.eq('published', true);
        const { data, error } = await query.order('created_at', { ascending: false }).order('id').range(offset, offset + 999);
        if (cancelled) return;
        if (error) { showToast.error('Failed to load quizzes', { description: error.message }); break; }
        allQuizzes.push(...(data ?? []).filter(q => !seedIds.includes(q.id)).map(dbQuizToLocal));
        if (!data || data.length < 1000) break;
      }
      allQuizzes.push(...INITIAL_QUIZZES.map(q => ({ ...q, masteredPercentage: 0 })));
      setQuizzes(allQuizzes);
      for (let offset = 0; ; offset += 1000) {
        let query = supabase.from('decks').select('*');
        query = user ? query.or(`user_id.eq.${user.id},published.eq.true`) : query.eq('published', true);
        const { data, error } = await query.order('created_at', { ascending: false }).order('id').range(offset, offset + 999);
        if (cancelled) return;
        if (error) { showToast.error('Failed to load flashcards', { description: error.message }); break; }
        allDecks.push(...(data ?? []).map(dbDeckToLocal));
        if (!data || data.length < 1000) break;
      }
      setDecks([...allDecks, ...INITIAL_DECKS]);
      await refreshLikes();
      if (cancelled) return;
      if (user) {
        const remote: Attempt[] = [];
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await supabase.from('quiz_attempts').select('*').eq('user_id', user.id)
            .order('completed_at', { ascending: false }).order('id').range(offset, offset + 999);
          if (cancelled) return;
          if (error) { showToast.error('Could not load past results', { description: error.message }); break; }
          for (const row of data ?? []) {
            const attempt = fromDatabase(row, allQuizzes);
            if (attempt) remote.push(attempt);
          }
          if (!data || data.length < 1000) break;
        }
        commitAttempts(mergeAttempts(attemptsRef.current, remote), user.id);
        const sessions: FlashcardSession[] = [];
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await supabase.from('flashcard_sessions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }).order('id').range(offset, offset + 999);
          if (cancelled) return;
          if (error) { showToast.error('Could not load flashcard history. Device records are still available.'); break; }
          sessions.push(...(data ?? []).map(flashcardFromDatabase));
          if (!data || data.length < 1000) break;
        }
        commitFlashcards(mergeFlashcards(flashcardsRef.current, sessions), owner);
        void retrySync();
      }
    };
    void init().catch(() => { if (!cancelled) showToast.error('Could not load your account. Please reload to retry.'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [commitAttempts, commitFlashcards, retrySync, refreshLikes]);

  useEffect(() => {
    if (loading) return;
    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      if (!signingOutRef.current && (session?.user.id ?? null) !== userIdRef.current) {
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

  const handleSaveQuiz = useCallback(async (saved: Quiz) => {
    const owner = userIdRef.current;
    if (!owner) { showToast.error('Sign in to save a quiz.'); return false; }
    const existing = quizzes.find(q => q.id === saved.id);
    if (existing?.ownerId && existing.ownerId !== owner) { showToast.error('Only the author can edit this quiz.'); return false; }
    if (!saved.questions.every(validQuestion)) { showToast.error('Set True or False for every statement before saving.'); return false; }
    if (saved.published && !saved.questions.length) { showToast.error('Add at least one question before publishing.'); return false; }
    const id = existing?.ownerId === owner ? saved.id : crypto.randomUUID();
    try {
      const { data, error } = await createClient().from('quizzes').upsert({
        id, user_id: owner, title: saved.title, description: saved.description,
        content: saved.questions as unknown as Json, category: saved.category, published: saved.published ?? false,
      }).select('*').single();
      if (error) throw error;
      if (userIdRef.current !== owner) return false;
      const updated = dbQuizToLocal(data);
      setQuizzes(prev => [updated, ...prev.filter(q => q.id !== id)]);
      await refreshLikes();
      showToast.success(saved.published ? 'Public quiz saved.' : 'Private quiz saved.');
      return true;
    } catch { showToast.error('Could not save quiz. Your changes are still in the editor.'); return false; }
  }, [quizzes, refreshLikes]);

  const handleSaveDeck = useCallback(async (saved: Deck) => {
    const owner = userIdRef.current;
    if (!owner) { showToast.error('Sign in to save a deck.'); return false; }
    const existing = decks.find(d => d.id === saved.id);
    if (existing?.ownerId && existing.ownerId !== owner) { showToast.error('Only the author can edit this deck.'); return false; }
    if (saved.published && !saved.cards.length) { showToast.error('Add at least one card before publishing.'); return false; }
    const id = existing?.ownerId === owner ? saved.id : crypto.randomUUID();
    try {
      const { data, error } = await createClient().from('decks').upsert({
        id, user_id: owner, title: saved.title, description: saved.description,
        content: saved.cards as unknown as Json, category: saved.category, published: saved.published ?? false,
      }).select('*').single();
      if (error) throw error;
      if (userIdRef.current !== owner) return false;
      const updated = dbDeckToLocal(data);
      setDecks(prev => [updated, ...prev.filter(d => d.id !== id)]);
      await refreshLikes();
      showToast.success(saved.published ? 'Public deck saved.' : 'Private deck saved.');
      return true;
    } catch { showToast.error('Could not save deck. Your changes are still in the editor.'); return false; }
  }, [decks, refreshLikes]);

  const toggleLike = useCallback(async (kind: 'quiz' | 'deck', id: string) => {
    const owner = userIdRef.current;
    if (!owner) { showToast.info('Sign in to mark content helpful.'); return; }
    const item = (kind === 'quiz' ? quizzes : decks).find(item => item.id === id);
    if (!likesAvailable || !item?.published || item.ownerId === owner) return;
    const key = `${kind}:${id}`;
    if (likeRequests.current.has(key)) return;
    likeRequests.current.add(key);
    try {
      const db = createClient();
      const column = kind === 'quiz' ? 'quiz_id' : 'deck_id';
      const { error } = item.likedByMe
        ? await db.from('content_likes').delete().eq('user_id', owner).eq(column, id)
        : await db.from('content_likes').insert(kind === 'quiz' ? { user_id: owner, quiz_id: id } : { user_id: owner, deck_id: id });
      if (error && error.code !== '23505') throw error;
      await refreshLikes();
    } catch { showToast.error('Could not update your like. Please try again.'); }
    finally { likeRequests.current.delete(key); }
  }, [quizzes, decks, likesAvailable, refreshLikes]);

  // ── Delete quiz ────────────────────────────────────────────────────────────
  const handleDeleteQuiz = useCallback((id: string) => {
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz?.ownerId || quiz.ownerId !== userIdRef.current) return;
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
    if (!deck?.ownerId || deck.ownerId !== userIdRef.current) return;
    setDecks(prev => prev.filter(d => d.id !== id));

    ;(async () => {
      const { error } = await createClient().from('decks').delete().eq('id', id);

      if (error) {
        showToast.error('Failed to delete deck', { description: error.message });
        if (deck) setDecks(prev => [deck, ...prev]);
      } else {
        showToast.success('Deck deleted.');
      }
    })();
  }, [decks]);

  // Save locally before navigating; the stable attempt ID makes retries idempotent.
  const handleCompleteQuizPlay = useCallback((quizId: string, answers: Record<string, number | null>, attemptId: string, negativeMarking = false) => {
    if (attemptsRef.current.some(a => a.id === attemptId)) return attemptId;
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz || !quiz.questions.length) throw new Error('Quiz unavailable');
    const score = scoreQuiz(quiz, answers, negativeMarking);
    const attempt: Attempt = {
      id: attemptId, quizId, quiz, correct: score.correct, total: score.total, netScore: score.netScore, wrong: score.wrong, unanswered: score.unanswered, negativeMarking, answers,
      completedAt: new Date().toISOString(), studyDay: studyDay(), synced: false,
    };
    commitAttempts(mergeAttempts(attemptsRef.current, [attempt]), userIdRef.current ?? 'guest');
    void retrySync();
    return attempt.id;
  }, [quizzes, commitAttempts, retrySync]);

  const handleCompleteFlashcards = useCallback((deck: Deck, sessionId: string) => {
    if (!deck.cards.length || flashcardsRef.current.some(row => row.id === sessionId)) return;
    const session: FlashcardSession = { id: sessionId, deckId: deck.id, deck, cardsReviewed: deck.cards.length, completedAt: new Date().toISOString(), studyDay: studyDay(), synced: false };
    commitFlashcards(mergeFlashcards(flashcardsRef.current, [session]), userIdRef.current ?? 'guest');
    void retrySync();
  }, [commitFlashcards, retrySync]);

  const stats = progressStats(attempts, new Date(`${today}T12:00:00`), flashcardSessions);
  const trackedQuizzes = quizzes.map(q => ({ ...q, masteredPercentage: Math.max(0, ...attempts.filter(a => a.quizId === q.id).map(percentage)) }));

  const resetAllState = useCallback(async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    setSigningOut(true);
    try {
      const { error } = await createClient().auth.signOut({ scope: 'local' });
      if (error) throw error;
      userIdRef.current = null;
      attemptsRef.current = [];
      setAttempts([]);
      flashcardsRef.current = [];
      setFlashcardSessions([]);
      setProfile(INITIAL_PROFILE);
      setQuizzes([]);
      setDecks([]);
      // Full navigation clears every component's account state. Account-scoped
      // drafts and pending results stay available if this learner signs back in.
      window.location.replace('/');
    } catch {
      signingOutRef.current = false;
      setSigningOut(false);
      showToast.error('Could not log out. Please try again.');
    }
  }, []);

  return (
    <NankiContext.Provider value={{
      profile: { ...profile, ...stats }, quizzes: trackedQuizzes, decks, loading, attempts, userId, retrySync,
      toastMessage: null,
      showCreatorSelector, setShowCreatorSelector,
      triggerToast,
      handleSaveQuiz, handleSaveDeck,
      handleDeleteQuiz, handleDeleteDeck,
      handleCompleteQuizPlay,
      flashcardSessions, handleCompleteFlashcards,
      resetAllState, signingOut, likesAvailable, toggleLike,
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
