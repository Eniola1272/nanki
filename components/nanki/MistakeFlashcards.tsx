'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useNankiStore } from '@/lib/nanki-store';
import { mistakeCards, uniqueMistakes, sourceKey } from '@/lib/review/mistakes';
import type { Attempt } from '@/lib/progress/stats';
import type { Card } from '@/types/nanki';
export default function MistakeFlashcards({attempt}:{attempt:Attempt}) {
 const {decks,userId,handleSaveDeck}=useNankiStore();
 const [open,setOpen]=useState(false),[include,setInclude]=useState(false),[cards,setCards]=useState<Card[]>([]),[selected,setSelected]=useState<string[]>([]),[target,setTarget]=useState('new'),[title,setTitle]=useState(`${attempt.quiz.title} — mistakes`),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const lock=useRef(false);
 const owned=decks.filter(d=>d.ownerId===userId&&!d.published);
 const allOwned=decks.filter(d=>d.ownerId===userId);
 const existing=allOwned.flatMap(d=>d.cards);
 const count=mistakeCards(attempt.quiz,attempt.answers,attempt.id).length;
 const reset=(includeUnanswered:boolean)=>{const next=mistakeCards(attempt.quiz,attempt.answers,attempt.id,includeUnanswered);setCards(next);setSelected(uniqueMistakes(next,existing).map(c=>c.id));};
 const save=async()=>{
  if(lock.current)return;lock.current=true;setBusy(true);setMessage('');
  try{
   const chosen=cards.filter(c=>selected.includes(c.id));
   if(!chosen.length||chosen.some(c=>!c.front.trim()||!c.back.trim())){setMessage('Select at least one card and fill in its question and answer.');return;}
   const fresh=uniqueMistakes(chosen,allOwned.flatMap(d=>d.cards));
   if(!fresh.length){setMessage('These cards are already in your decks.');return;}
   const destination=owned.find(d=>d.id===target);
   if(target!=='new'&&!destination){setMessage('Choose an available private deck.');return;}
   const deck=destination??{id:crypto.randomUUID(),title:title.trim()||'Quiz mistakes',description:'Flashcards from missed quiz answers',category:attempt.quiz.category,published:false,cards:[]};
   const success=await handleSaveDeck({...deck,cards:fresh.map(c=>({...c,id:crypto.randomUUID(),front:c.front.trim(),back:c.back.trim()}))},true);
   if(success){setMessage(`${fresh.length} cards saved. They are ready for your daily review queue.`);setSelected([]);}
  }catch{setMessage('Could not save cards. Your preview is still here; please try again.');}finally{lock.current=false;setBusy(false);}
 };
 return <div className="text-left space-y-4">
  <button className="w-full rounded-full bg-primary text-white px-5 py-3" onClick={()=>{if(!open)reset(include);setOpen(!open);}}>Create flashcards from mistakes ({count})</button>
  {open&&<div className="space-y-4 rounded-2xl border p-4 bg-white">
   {userId==='guest'?<Link className="text-primary underline" href="/auth/signin">Sign in to save mistake flashcards</Link>:<>
    <p className="text-sm text-secondary">Review and edit before saving. Each missed True/False statement becomes a separate card. Existing cards are linked below.</p>
    <fieldset disabled={busy} className="space-y-4">
     <label className="flex gap-2 text-sm"><input type="checkbox" checked={include} onChange={e=>{setInclude(e.target.checked);reset(e.target.checked);}}/>Include unanswered questions (refreshes preview)</label>
     {!cards.length&&<p>No missed answers to convert. You can include unanswered questions.</p>}
     {cards.map((c,i)=>{const found=allOwned.find(d=>d.cards.some(x=>sourceKey(x)===sourceKey(c)));return <div key={c.id} className="border rounded-2xl p-4 space-y-3">
      {found?<p className="text-sm">Already saved in <Link href={`/deck/${found.id}/edit`} className="text-primary underline">{found.title}</Link></p>:<label className="flex gap-2 text-sm"><input type="checkbox" checked={selected.includes(c.id)} onChange={e=>setSelected(p=>e.target.checked?[...p,c.id]:p.filter(id=>id!==c.id))}/>Include this card</label>}
      {(['front','back','extraNote'] as const).map(field=><label key={field} className="block text-xs text-secondary">{field==='front'?'Question':field==='back'?'Answer':'Explanation (optional)'}<textarea disabled={!!found} value={c[field]??''} rows={field==='front'?4:2} className="block w-full border rounded-xl p-3 text-sm text-on-surface mt-1" onChange={e=>setCards(p=>p.map((card,n)=>n===i?{...card,[field]:e.target.value}:card))}/></label>)}
     </div>;})}
     <label className="block text-sm">Save to a private deck<select className="block w-full border rounded-xl p-3 mt-1" value={target} onChange={e=>setTarget(e.target.value)}><option value="new">Create a new deck</option>{owned.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label>
     {target==='new'&&<label className="block text-sm">Deck title<input className="block w-full border rounded-xl p-3 mt-1" value={title} onChange={e=>setTitle(e.target.value)}/></label>}
     <button disabled={!selected.length} onClick={()=>void save()} className="bg-primary text-white rounded-full px-5 py-3 disabled:opacity-50">{busy?'Saving…':`Save ${selected.length} flashcards`}</button>
    </fieldset>
   </>}
   {message&&<p role="status" className="text-sm">{message} <Link href="/dashboard" className="text-primary underline">Daily reviews</Link></p>}
  </div>}
 </div>;
}
