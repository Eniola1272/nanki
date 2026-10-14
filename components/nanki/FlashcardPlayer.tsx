'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNankiStore } from '@/lib/nanki-store';
import { useReviews } from '@/lib/review/provider';
import { advance, cardKey, localDay, reviewQueue, type Rating } from '@/lib/review/scheduler';
import { databaseQuizId } from '@/lib/progress/storage';
import LikeButton from './LikeButton';
import type { Deck } from '@/types/nanki';
import { hasPlanFeature } from '@/lib/billing/plans';
import { exportDeckToAnki, downloadTextFile } from '@/lib/export/anki';
import { printDeckCards } from '@/lib/export/pdf';
import UpgradeModal from '@/components/billing/UpgradeModal';
import { showToast } from '@/lib/utils/toast';

export default function FlashcardPlayer({deck,onClose}:{deck:Deck;onClose:()=>void}) {
 const {decks,userId,profile,handleCompleteFlashcards,handleForkDeck}=useNankiStore();
 const {events,limits,ready,notice,rate,sync}=useReviews();
 const [flippedId,setFlippedId]=useState<string|null>(null),[now,setNow]=useState(()=>new Date()),[finishing,setFinishing]=useState(false);
 const [forking,setForking]=useState(false);
 const [showUpgradeModal,setShowUpgradeModal]=useState(false);
 const lock=useRef(false);
 useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(timer);},[]);
 const {queue,states}=reviewQueue(decks,events,limits,now);
 const current=queue.find(x=>x.deck.id===deck.id)?.card;
 const flipped=current?.id===flippedId;
 const remaining=queue.filter(x=>x.deck.id===deck.id).length;
 const reviewed=new Set(events.filter(e=>e.deckId===deck.id&&e.day===localDay(now)).map(e=>e.cardId));
 const rateCard=(rating:Rating)=>{if(!current||lock.current)return;lock.current=true;if(rate(deck.id,current.id,rating)){setFlippedId(null);setNow(new Date());}queueMicrotask(()=>{lock.current=false;});};
 const finish=async()=>{setFinishing(true);try{if(reviewed.size){const sessionId=await databaseQuizId(userId,`reviews:${deck.id}:${localDay(now)}`);handleCompleteFlashcards({...deck,cards:deck.cards.filter(c=>reviewed.has(c.id))},sessionId);}onClose();}finally{setFinishing(false);}};
 const canExport = hasPlanFeature(profile, 'exportPdfAnki');
 const handleExportAnki = () => {
   if (!canExport) {
     setShowUpgradeModal(true);
     return;
   }
   const tsv = exportDeckToAnki(deck);
   const filename = `${deck.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-anki.txt`;
   downloadTextFile(filename, tsv);
   showToast.success('Deck exported to Anki format!');
 };
 const handleExportPdf = () => {
   if (!canExport) {
     setShowUpgradeModal(true);
     return;
   }
   printDeckCards(deck);
 };

 if(!ready)return <p className="p-10 text-center">Loading your review schedule…</p>;
 return <div className="min-h-screen bg-surface text-on-surface flex flex-col">
  <header className="bg-white border-b px-5 py-4 flex items-center justify-between gap-4">
    <button onClick={onClose} className="text-primary font-bold">← Dashboard</button>
    <span className="text-sm truncate font-bold">{deck.title}</span>
    <div className="flex items-center gap-2">
      <button onClick={handleExportPdf} title="Print flashcards" className="text-secondary hover:text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer">
        <span className="material-symbols-outlined text-[16px]">print</span>
        <span className="hidden sm:inline">Print</span>
      </button>
      <button onClick={handleExportAnki} title="Export to Anki" className="text-secondary hover:text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer">
        <span className="material-symbols-outlined text-[16px]">download</span>
        <span className="hidden sm:inline">Anki</span>
      </button>
      {deck.ownerId===userId ? (
        <Link className="text-primary text-sm shrink-0 font-bold hover:underline" href={`/deck/${deck.id}/edit`}>Edit cards</Link>
      ) : (
        <button
          onClick={async () => {
            setForking(true);
            try { await handleForkDeck(deck); }
            finally { setForking(false); }
          }}
          disabled={forking}
          className="text-primary text-xs shrink-0 font-bold hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[15px]">content_copy</span>
          {forking ? 'Copying…' : 'Fork to library'}
        </button>
      )}
    </div>
  </header>
  <main className="w-full max-w-3xl mx-auto flex-1 p-5 md:p-10 space-y-6">
   {notice&&<p role="status" className="bg-primary-fixed rounded-2xl p-4 text-sm">{notice} <button onClick={()=>void sync()} className="underline text-primary">Retry sync</button></p>}
   {userId==='guest'&&<p className="text-sm text-secondary">Guest reviews are saved on this device. Sign in to keep future reviews across devices.</p>}
   {current?<>
    <div className="flex justify-between text-sm text-secondary"><span>{remaining} ready in this deck</span><span>{reviewed.size} reviewed today</span></div>
    <article
      onClick={() => !flipped && setFlippedId(current.id)}
      className="card-interactive bg-white rounded-3xl border border-outline-variant p-6 md:p-10 space-y-6 min-h-72 transition-all duration-150 cursor-pointer active:scale-[0.985] select-none touch-manipulation shadow-xs"
    >
     <div className="flex justify-between items-center">
       <p className="text-xs uppercase tracking-widest text-primary font-bold">{flipped?'Answer':'Recall the answer'}</p>
       {!flipped && <span className="text-[11px] text-secondary">Tap card to reveal</span>}
     </div>
     <p className="text-lg leading-relaxed whitespace-pre-wrap break-words">{flipped?current.back:current.front}</p>
     {flipped&&current.extraNote&&<p className="border-t pt-5 text-sm text-secondary whitespace-pre-wrap">{current.extraNote}</p>}
     {current.source&&<Link className="inline-block text-sm text-primary" href={`/quiz/${current.source.quizId}/results?attempt=${encodeURIComponent(current.source.attemptId)}`}>Original quiz attempt →</Link>}
    </article>
    {!flipped?<button className="w-full bg-primary text-white font-bold rounded-full py-4 shadow-md hover:bg-primary-container active:scale-95 transition-all duration-150 cursor-pointer touch-manipulation select-none" onClick={()=>setFlippedId(current.id)}>Show answer</button>:<><p className="text-sm text-center text-secondary">How well did you remember?</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{(['again','hard','good','easy'] as Rating[]).map(r=>{const next=advance(states[cardKey(deck.id,current.id)],r,now.toISOString(),localDay(now));return <button key={r} onClick={()=>rateCard(r)} className="border border-primary/20 rounded-2xl p-4 bg-white hover:bg-primary-fixed text-primary transition-all duration-150 active:scale-90 active:bg-primary/10 select-none touch-manipulation cursor-pointer shadow-xs active:shadow-none"><span className="capitalize block font-semibold">{r}</span><span className="text-xs">{next.interval<1?'10 minutes':`${next.interval} day${next.interval===1?'':'s'}`}</span></button>;})}</div></>}
    <p className="text-xs text-secondary text-center">Each rating saves your place. You can leave and continue later.</p>
   </>:<section className="bg-white rounded-3xl border p-8 text-center space-y-5">
    <h1 className="text-3xl font-semibold">{deck.cards.length?'Congratulations, you are all done!':'No flashcards yet'}</h1>
    <p className="text-secondary">{deck.cards.length?`No more cards are ready in this deck within today's limits. You reviewed ${reviewed.size} cards today. Cards marked Again return after 10 minutes.`:'Add cards to this deck to start learning.'}</p>
    <div className="flex items-center justify-center gap-3">
      <LikeButton kind="deck" id={deck.id}/>
      {deck.ownerId !== userId && (
        <button
          disabled={forking}
          onClick={async () => {
            setForking(true);
            try { await handleForkDeck(deck); }
            finally { setForking(false); }
          }}
          className="border border-outline-variant text-on-surface font-bold text-sm px-5 py-2.5 rounded-full hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
          {forking ? 'Copying…' : 'Save Copy'}
        </button>
      )}
    </div>
    <button disabled={finishing} onClick={()=>void finish()} className="bg-primary text-white rounded-full px-6 py-3 font-bold hover:bg-primary-container cursor-pointer">{finishing?'Saving…':'Done'}</button>
   </section>}
  </main>
  <UpgradeModal
    isOpen={showUpgradeModal}
    onClose={() => setShowUpgradeModal(false)}
    reason="Upgrade to Student Pro to export study worksheets to PDF and flashcard decks to Anki."
  />
 </div>;
}
