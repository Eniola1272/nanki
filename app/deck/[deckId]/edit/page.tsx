'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import DeckEditor from '@/components/nanki/DeckEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Deck } from '@/types/nanki';

export default function EditDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const { decks, handleSaveDeck } = useNankiStore();
  const deck = decks.find(d => d.id === deckId) || null;

  const handleSave = (updated: Deck) => {
    handleSaveDeck(updated);
    router.push('/dashboard');
  };

  return <DeckEditor deck={deck} onSave={handleSave} onClose={() => router.back()} />;
}
