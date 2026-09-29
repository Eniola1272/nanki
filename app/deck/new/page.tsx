'use client';

import { useRouter } from 'next/navigation';
import DeckEditor from '@/components/nanki/DeckEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Deck } from '@/types/nanki';

export default function NewDeckPage() {
  const router = useRouter();
  const { handleSaveDeck } = useNankiStore();

  const handleSave = async (deck: Deck) => {
    if (await handleSaveDeck(deck)) router.push('/dashboard');
  };

  return <DeckEditor deck={null} onSave={handleSave} onClose={() => router.back()} />;
}
