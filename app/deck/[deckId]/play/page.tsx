'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import FlashcardPlayer from '@/components/nanki/FlashcardPlayer';
import { useNankiStore } from '@/lib/nanki-store';

export default function PlayDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const { decks, loading } = useNankiStore();
  const deck = decks.find(d => d.id === deckId);

  if (loading) return <p className="p-8 text-center">Loading flashcards…</p>;
  if (!deck) return <div className="p-8 text-center"><p>This deck is private or unavailable.</p><button onClick={() => router.push('/discover')}>Back to discovery</button></div>;

  return <FlashcardPlayer key={deck.id} deck={deck} onClose={() => router.push('/dashboard')} />;
}
