'use client';

import { useState } from 'react';
import type { Deck, Card } from '@/types/nanki';

interface DeckEditorProps {
  deck: Deck | null;
  onSave: (deck: Deck) => void;
  onClose: () => void;
}

export default function DeckEditor({ deck, onSave, onClose }: DeckEditorProps) {
  const [title, setTitle] = useState(deck?.title || '');
  const [category, setCategory] = useState(deck?.category || 'Biology');
  const [description, setDescription] = useState(deck?.description || '');
  const [frontInput, setFrontInput] = useState('');
  const [backInput, setBackInput] = useState('');
  const [extraInput, setExtraInput] = useState('');
  const [cards, setCards] = useState<Card[]>(deck?.cards || []);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const addCard = () => {
    if (!frontInput.trim() || !backInput.trim()) { alert('Please fill out both Front and Back details.'); return; }
    const newCard: Card = { id: `card-${Date.now()}`, front: frontInput.trim(), back: backInput.trim(), extraNote: extraInput.trim() || undefined };
    setCards(p => [newCard, ...p]);
    setFrontInput(''); setBackInput(''); setExtraInput('');
  };

  const deleteCard = (id: string) => setCards(p => p.filter(c => c.id !== id));
  const toggleFlip = (id: string) => setFlippedCards(p => ({ ...p, [id]: !p[id] }));

  const applyMarkdown = (syntax: string) => {
    if (syntax === 'b') setFrontInput(p => `${p}**bold text**`);
    else if (syntax === 'i') setFrontInput(p => `${p}*italic text*`);
    else if (syntax === 'code') setFrontInput(p => `${p}\`code\``);
  };

  const handleSave = () => {
    onSave({
      id: deck?.id || `deck-${Date.now()}`,
      title: title.trim() || 'Untitled Flashcards',
      category,
      description: description.trim() || `Study card deck focused on ${category}`,
      author: deck?.author || '@you',
      cards,
    });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col antialiased pb-20">
      <header className="fixed top-0 w-full z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm px-4 py-3">
        <div className="max-w-[800px] mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <h1 className="font-title-md text-base md:text-lg text-on-surface font-bold">{deck ? 'Edit Flashcards' : 'New Flashcards'}</h1>
          </div>
          <button onClick={handleSave} className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md hover:bg-primary-container active:scale-95 transition-all cursor-pointer shadow-sm text-sm">Save Deck</button>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[800px] mx-auto pt-20 px-4 flex flex-col gap-6">
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Flashcard Deck Title (e.g. Molecular Biology)"
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 p-0 py-2 font-bold text-on-surface placeholder:text-outline text-lg md:text-2xl transition-colors focus:outline-none" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a short description for this deck..." rows={1}
              className="w-full bg-transparent border-0 p-0 text-sm md:text-base text-on-surface-variant placeholder:text-outline focus:outline-none focus:ring-0 resize-none transition-colors" />
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-outline-variant/40">
              <div className="flex items-center gap-1">
                <span className="text-secondary font-label-md text-xs uppercase tracking-wide">Category:</span>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="bg-surface-container-low text-on-surface font-semibold text-xs rounded-lg border-outline-variant px-3 py-1 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer border">
                  {['Biology', 'History', 'Physics', 'Computer Science', 'Languages', 'Math', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-2">
              <label className="font-title-md text-sm font-bold text-on-surface">Front side (Question)</label>
              <textarea value={frontInput} onChange={e => setFrontInput(e.target.value)} placeholder="Enter question or term (Markdown supported)..."
                className="w-full h-36 bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-title-md text-sm font-bold text-on-surface">Back side (Answer)</label>
              <textarea value={backInput} onChange={e => setBackInput(e.target.value)} placeholder="Enter answer or definition (Markdown supported)..."
                className="w-full h-36 bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
            </div>
          </div>

          <div className="mb-4">
            <input type="text" value={extraInput} onChange={e => setExtraInput(e.target.value)} placeholder="Extra note or hint (optional)..."
              className="w-full bg-surface-bright border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-fixed" />
          </div>

          <div className="flex justify-between items-center border-t border-outline-variant/60 pt-4">
            <div className="flex gap-2">
              {[['b', 'B', 'font-bold'], ['i', 'I', 'italic'], ['code', '<>', 'font-mono']].map(([s, label, cls]) => (
                <button key={s} onClick={() => applyMarkdown(s)}
                  className={`px-3 py-1.5 border border-outline-variant rounded-lg text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer ${cls}`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={addCard} className="bg-primary hover:bg-primary-container text-on-primary px-5 py-2 rounded-full font-label-md text-xs active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Card</span>
            </button>
          </div>
        </section>

        <div>
          <h2 className="font-title-md text-base md:text-lg text-on-background font-bold mb-4">Cards in Deck ({cards.length})</h2>
          {cards.length === 0 ? (
            <div className="text-center py-10 text-outline border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
              No cards added yet. Fill in Front & Back fields above to insert questions!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card) => {
                const isFlipped = !!flippedCards[card.id];
                return (
                  <div key={card.id} onClick={() => toggleFlip(card.id)} className="h-44 bg-transparent cursor-pointer relative group" style={{ perspective: '1000px' }}>
                    <div className="w-full h-full relative duration-500 rounded-xl border border-outline-variant shadow-sm"
                      style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'none' }}>
                      <div className="absolute inset-0 bg-surface-container-lowest rounded-xl flex items-center justify-center p-4 text-center" style={{ backfaceVisibility: 'hidden' }}>
                        <p className="font-bold text-sm md:text-base text-on-surface px-2">{card.front}</p>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); deleteCard(card.id); }}
                            className="bg-error-container/30 hover:bg-error-container text-error p-1 rounded-full transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                        <div className="absolute bottom-2 font-caption text-[10px] text-outline italic">Click to flip</div>
                      </div>
                      <div className="absolute inset-0 bg-primary-container text-on-primary-container rounded-xl flex flex-col items-center justify-center p-4 text-center border-2 border-primary"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <p className="text-xs md:text-sm leading-relaxed max-h-32 overflow-y-auto px-1">{card.back}</p>
                        <div className="absolute bottom-2 font-caption text-[10px] text-primary-container opacity-60">Click to flip back</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
