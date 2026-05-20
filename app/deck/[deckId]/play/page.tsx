'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import FlashcardPlayer from '@/components/nanki/FlashcardPlayer';
import { useNankiStore } from '@/lib/nanki-store';

export default function PlayDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const { decks } = useNankiStore();
  const deck = decks.find(d => d.id === deckId) || decks[0];

  if (!deck) return null;

  return <FlashcardPlayer deck={deck} onClose={() => router.push('/dashboard')} />;
}
