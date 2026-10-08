import type { Deck } from '../../types/nanki';
export type Rating = 'again' | 'hard' | 'good' | 'easy';
export interface ReviewEvent { id: string; deckId: string; cardId: string; rating: Rating; reviewedAt: string; day: string; synced: boolean }
export interface Schedule { interval: number; ease: number; dueAt: string; reviews: number; lastDay: string }
export interface ReviewLimits { newCards: number; reviews: number }
export const DEFAULT_LIMITS: ReviewLimits = { newCards: 20, reviews: 100 };
export const cardKey = (deckId: string, cardId: string) => JSON.stringify([deckId, cardId]);
export const localDay = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
// Version 1: deterministic SM-2-inspired intervals, with a 10-minute relearning step.
// Replay immutable events to converge after offline or concurrent device reviews.
export function advance(previous: Schedule | undefined, rating: Rating, at: string, day: string): Schedule {
  const ease = Math.max(1.3, Math.min(3, (previous?.ease ?? 2.5) + (rating === 'again' ? -.2 : rating === 'hard' ? -.15 : rating === 'easy' ? .15 : 0)));
  const last = previous?.interval ?? 0;
  const interval = rating === 'again' ? 10/1440 : rating === 'hard' ? Math.max(1, Math.round(last*1.2)) : rating === 'easy' ? Math.max(4, Math.round(last*ease*1.3)) : Math.max(1, Math.round(last*ease));
  return { interval, ease, dueAt: new Date(Date.parse(at)+interval*86400000).toISOString(), reviews: (previous?.reviews ?? 0)+1, lastDay: day };
}
export function mergeReviews(...groups: ReviewEvent[][]): ReviewEvent[] {
  const map = new Map<string, ReviewEvent>();
  for(const e of groups.flat()) if(!map.get(e.id)?.synced || e.synced) map.set(e.id,e);
  return [...map.values()].sort((a,b)=>a.reviewedAt.localeCompare(b.reviewedAt)||a.id.localeCompare(b.id));
}
export function schedules(events: ReviewEvent[]) {
  const result: Record<string, Schedule> = {};
  for(const e of mergeReviews(events)) { const key=cardKey(e.deckId,e.cardId); result[key]=advance(result[key],e.rating,e.reviewedAt,e.day); }
  return result;
}
export function reviewQueue(decks: Deck[], events: ReviewEvent[], limits: ReviewLimits, now = new Date()) {
  const states = schedules(events), day=localDay(now), introduced=new Set<string>(), reviewed=new Set<string>(), seen=new Set<string>();
  for(const e of mergeReviews(events)) { const key=cardKey(e.deckId,e.cardId); if(e.day===day) { if(!seen.has(key)) introduced.add(key); else if(!introduced.has(key)) reviewed.add(key); } seen.add(key); }
  let newRemaining=Math.max(0,limits.newCards-introduced.size), reviewRemaining=Math.max(0,limits.reviews-reviewed.size);
  const all=decks.flatMap(deck=>deck.cards.map(card=>({deck,card,state:states[cardKey(deck.id,card.id)]})));
  const due=all.filter(x=>x.state && Date.parse(x.state.dueAt)<=now.getTime()).sort((a,b)=>a.state.dueAt.localeCompare(b.state.dueAt));
  const queue=due.filter(x=>x.state.lastDay===day || reviewRemaining-->0);
  queue.push(...all.filter(x=>!x.state && newRemaining-->0));
  return {queue, due:due.length, newCount:all.filter(x=>!x.state).length, states};
}
