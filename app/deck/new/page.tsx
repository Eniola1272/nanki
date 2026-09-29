'use client';

import { useRouter } from 'next/navigation';
import DeckEditor from '@/components/nanki/DeckEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Deck } from '@/types/nanki';

export default function NewDeckPage() {
  const router = useRouter();
  const { handleSaveDeck, loading, userId } = useNankiStore();

  const handleSave = async (deck: Deck) => {
    const saved = await handleSaveDeck(deck);
    if (saved) router.push('/dashboard');
    return saved;
  };

  if (loading) return <p className="p-8 text-center">Loading editor…</p>;
  return <DeckEditor key={userId} deck={null} onSave={handleSave} onClose={() => router.back()} />;
}
