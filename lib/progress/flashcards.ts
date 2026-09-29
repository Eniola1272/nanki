import type { Deck } from '../../types/nanki';
import type { Json, Database } from '@/types/database';
import { createClient } from '@/lib/db/supabase-browser';

export interface FlashcardSession {
  id: string;
  deckId: string;
  deck: Deck;
  cardsReviewed: number;
  completedAt: string;
  studyDay: string;
  synced: boolean;
}
export const flashcardKey = (owner: string) => `nanki_flashcard_sessions_v1_${owner}`;
export const flashcardXp = (session: FlashcardSession) => 10 + session.cardsReviewed;
export function readFlashcards(owner: string): FlashcardSession[] {
  try {
    const rows = JSON.parse(localStorage.getItem(flashcardKey(owner)) || '[]');
    return Array.isArray(rows) ? rows.filter(r => typeof r?.id === 'string' && r.deck && r.cardsReviewed > 0 && Number.isFinite(Date.parse(r.completedAt))) : [];
  } catch { return []; }
}
export function mergeFlashcards(...groups: FlashcardSession[][]) {
  const rows = new Map<string, FlashcardSession>();
  groups.flat().forEach(row => { if (!rows.get(row.id)?.synced || row.synced) rows.set(row.id, row); });
  return [...rows.values()].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}
export async function syncFlashcard(owner: string, session: FlashcardSession) {
  const { error } = await createClient().from('flashcard_sessions').upsert({
    id: session.id, user_id: owner, deck_id: session.deckId,
    deck_snapshot: session.deck as unknown as Json, cards_reviewed: session.cardsReviewed,
    completed_at: session.completedAt, study_day: session.studyDay,
  }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;
}
export function flashcardFromDatabase(row: Database['public']['Tables']['flashcard_sessions']['Row']): FlashcardSession {
  return { id: row.id, deckId: row.deck_id, deck: row.deck_snapshot as unknown as Deck, cardsReviewed: row.cards_reviewed, completedAt: row.completed_at, studyDay: row.study_day, synced: true };
}
