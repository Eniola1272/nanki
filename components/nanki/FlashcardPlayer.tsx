'use client';

import { useState, useEffect, useRef } from 'react';
import LikeButton from './LikeButton';
import type { Deck, Card } from '@/types/nanki';

interface FlashcardPlayerProps {
  deck: Deck;
  onClose: () => void;
}

export default function FlashcardPlayer({ deck, onClose }: FlashcardPlayerProps) {
  const [complete, setComplete] = useState(false);
  const advancing = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideState, setSlideState] = useState<'normal' | 'swipout' | 'slidein'>('normal');

  const cards = deck.cards;
  const currentCard: Card = cards[currentIndex] || { id: 'empty', front: 'No cards available', back: 'Please add some cards to this deck.' };
  const progressPercent = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleFeedback = () => {
    if (advancing.current || complete || !cards.length) return;
    advancing.current = true;
    setSlideState('swipout');
    timers.current.push(setTimeout(() => {
      setIsFlipped(false);
      if (currentIndex + 1 === cards.length) {
        setComplete(true);
        setSlideState('normal');
        advancing.current = false;
        return;
      }
      setCurrentIndex(prev => prev + 1);
      setSlideState('slidein');
      timers.current.push(setTimeout(() => { setSlideState('normal'); advancing.current = false; }, 300));
    }, 300));
  };

  if (complete || !cards.length) return (
    <div className="fixed inset-0 bg-primary text-on-primary z-50 flex items-center justify-center p-6">
      <main className="max-w-lg text-center space-y-6">
        <span className="material-symbols-outlined text-[72px]" aria-hidden="true">{complete ? 'celebration' : 'style'}</span>
        <h1 className="text-3xl font-extrabold">{complete ? 'Congratulations, you are all done!' : 'No flashcards yet'}</h1>
        <p>{complete ? `You reviewed all ${cards.length} cards in ${deck.title}.` : 'Add some cards to this deck to start studying.'}</p>
        {complete && <LikeButton kind="deck" id={deck.id} />}
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={onClose} className="rounded-full bg-white text-primary px-6 py-3 font-bold">Done</button>
          {complete && <button onClick={() => { setCurrentIndex(0); setIsFlipped(false); setComplete(false); }} className="rounded-full border border-white/40 px-6 py-3 font-bold">Study again</button>}
        </div>
      </main>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-primary text-on-primary z-50 flex flex-col font-sans">
      <header className="flex justify-between items-center px-4 py-3 w-full border-b border-white/10 bg-black/10">
        <button onClick={onClose} className="text-on-primary hover:bg-white/10 p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer" title="Quit Session">
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
        <div className="flex-grow max-w-[500px] px-4">
          <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div className="bg-tertiary-fixed h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="flex justify-between mt-1 text-[12px] opacity-80">
            <span>{currentIndex + 1}/{cards.length} Cards</span>
            <span className="truncate max-w-[150px] md:max-w-[250px] font-medium">Deck: {deck.title}</span>
          </div>
        </div>
        <button className="text-on-primary hover:bg-white/10 p-2 rounded-full transition-colors flex items-center justify-center opacity-40 cursor-pointer" disabled>
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-[800px] w-full mx-auto relative z-10">
        <div
          onClick={handleFlip}
          className={`w-full aspect-[4/3] max-h-[480px] max-w-[650px] cursor-pointer group select-none transition-all duration-300 ${
            slideState === 'swipout' ? '-translate-x-[120%] rotate-[-12deg] opacity-0 duration-300'
              : slideState === 'slidein' ? 'translate-x-[120%] rotate-[12deg] opacity-0 duration-75'
              : 'translate-x-0 rotate-0 opacity-100 ease-out'
          }`}
          style={{ perspective: '1200px' }}
        >
          <div
            className="w-full h-full relative transition-transform duration-500 rounded-2xl shadow-[0_12px_44px_rgba(0,0,0,0.3)] border border-white/10"
            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
          >
            {/* FRONT */}
            <div className="absolute inset-0 w-full h-full bg-surface-container-lowest text-on-surface rounded-2xl flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden' }}>
              <span className="font-label-md text-xs tracking-wider uppercase text-secondary bg-surface-container-low px-3 py-1 rounded-full mb-6">Question</span>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-surface text-center px-4 max-h-[70%] overflow-y-auto leading-snug">{currentCard.front}</h2>
              <div className="absolute bottom-6 font-caption text-xs text-outline flex items-center gap-1 opacity-70">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                Tap to view answer
              </div>
            </div>

            {/* BACK */}
            <div className="absolute inset-0 w-full h-full bg-surface-container-lowest text-on-surface rounded-2xl flex flex-col items-center justify-center p-8 text-center border-2 border-tertiary-container/20" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <span className="font-label-md text-xs tracking-wider uppercase text-tertiary bg-tertiary/10 px-3 py-1 rounded-full mb-6">Answer</span>
              <div className="flex-1 flex flex-col items-center justify-center w-full overflow-y-auto px-4">
                <p className="font-body-lg text-lg md:text-xl text-center text-on-surface max-w-prose leading-relaxed">{currentCard.back}</p>
                {currentCard.extraNote && (
                  <div className="mt-6 w-full border-t border-outline-variant/30 pt-4 text-center">
                    <span className="font-caption text-xs text-on-surface-variant italic">Note: {currentCard.extraNote}</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-6 font-caption text-xs text-outline flex items-center gap-1 opacity-70">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                Tap to view question
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 h-28 w-full flex items-center justify-center">
          {!isFlipped ? (
            <div onClick={handleFlip} className="flex flex-col items-center text-primary-fixed-dim cursor-pointer active:scale-95 transition-transform">
              <span className="material-symbols-outlined mb-1 text-[36px] animate-bounce fill">touch_app</span>
              <span className="font-label-md text-xs tracking-wider uppercase">Tap to Flip</span>
            </div>
          ) : (
            <div className="flex w-full max-w-[550px] gap-2 md:gap-3 justify-between px-2 animate-fadeIn">
              <button onClick={handleFeedback} disabled={slideState !== 'normal'} className="w-full rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 px-6 py-3 font-semibold disabled:opacity-50">
                {currentIndex + 1 === cards.length ? 'Finish flashcards' : 'Next card'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
