'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useNankiStore } from '@/lib/nanki-store';
import { useReviews } from '@/lib/review/provider';
import { reviewQueue } from '@/lib/review/scheduler';
export default function ReviewQueue(){
 const {decks}=useNankiStore(), {events,limits,ready,notice,sync,saveLimits}=useReviews();
 const [editing,setEditing]=useState(false),[saving,setSaving]=useState(false);
 const [now,setNow]=useState(()=>new Date());
 useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(timer);},[]);
 const {queue,due,newCount}=reviewQueue(decks,events,limits,now);
 const deck=queue[0]?.deck;
 return <section className="rounded-3xl bg-white border border-outline-variant p-6 space-y-4">
  <div className="flex justify-between gap-3"><div><h2 className="text-lg font-bold">Your daily review</h2><p className="text-sm text-secondary">{ready?`${due} due · ${newCount} new · ${queue.length} ready within your daily limits`:'Loading reviews…'}</p></div><button className="text-primary text-sm" onClick={()=>setEditing(!editing)}>Study limits</button></div>
  {notice&&<p role="status" className="text-sm">{notice} <button className="text-primary underline" onClick={()=>void sync()}>Retry sync</button></p>}
  {ready&& (deck?<Link href={`/deck/${deck.id}/play`} className="inline-flex bg-primary text-white rounded-full px-5 py-3 text-sm">Continue reviews →</Link>:<p className="text-sm text-secondary">You’re all caught up within today’s limits. Cards marked Again return after 10 minutes.</p>)}
  {editing&&<form className="flex flex-wrap gap-4 items-end" onSubmit={async e=>{e.preventDefault();const data=new FormData(e.currentTarget);setSaving(true);try{if(await saveLimits({newCards:Number(data.get('new')),reviews:Number(data.get('reviews'))}))setEditing(false);}finally{setSaving(false);}}}>
   <label className="text-sm">New cards/day<input className="block border rounded-xl p-2 w-28" name="new" type="number" min="0" max="200" defaultValue={limits.newCards} required/></label>
   <label className="text-sm">Review cards/day<input className="block border rounded-xl p-2 w-28" name="reviews" type="number" min="1" max="1000" defaultValue={limits.reviews} required/></label>
   <button disabled={saving} className="rounded-full bg-primary text-white px-4 py-2">{saving?'Saving…':'Save limits'}</button><p className="text-xs text-secondary w-full">Limits apply across your decks. Same-day relearning does not consume another daily slot.</p>
  </form>}
 </section>;
}
