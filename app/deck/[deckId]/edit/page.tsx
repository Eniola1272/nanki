'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import DeckEditor from '@/components/nanki/DeckEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Deck } from '@/types/nanki';

export default function EditDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const { decks, handleSaveDeck, loading, userId } = useNankiStore();
  const deck = decks.find(d => d.id === deckId) || null;

  const handleSave = async (updated: Deck) => {
    const saved = await handleSaveDeck(updated);
    if (saved) router.push('/dashboard');
    return saved;
  };

  if (loading) return <p className="p-8 text-center">Loading…</p>;
  if (!deck || (deck.ownerId && deck.ownerId !== userId)) return <p className="p-8 text-center">This content is unavailable or belongs to another author.</p>;

  return <DeckEditor key={`${userId}:${deckId}`} deck={deck} onSave={handleSave} onClose={() => router.back()} />;
}
