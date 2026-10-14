'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DeckEditor from '@/components/nanki/DeckEditor';
import { useNankiStore } from '@/lib/nanki-store';
import type { Deck } from '@/types/nanki';

function NewDeckContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspace') || undefined;
  const { handleSaveDeck, loading, userId } = useNankiStore();

  const handleSave = async (deck: Deck) => {
    const saved = await handleSaveDeck(deck);
    if (saved) {
      if (workspaceId) {
        router.back();
      } else {
        router.push('/dashboard');
      }
    }
    return saved;
  };

  if (loading) return <p className="p-8 text-center">Loading editor…</p>;
  const initialDeck = workspaceId ? ({ organizationId: workspaceId } as Deck) : null;
  return <DeckEditor key={userId} deck={initialDeck} onSave={handleSave} onClose={() => router.back()} />;
}

export default function NewDeckPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading editor…</p>}>
      <NewDeckContent />
    </Suspense>
  );
}
