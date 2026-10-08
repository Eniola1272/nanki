'use client';
import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/db/supabase-browser';
import { useNankiStore } from '@/lib/nanki-store';
import { DEFAULT_LIMITS, localDay, mergeReviews, type ReviewEvent, type ReviewLimits, type Rating } from './scheduler';
const key=(owner:string)=>`nanki_reviews_v1_${owner}`;
function read(owner:string):ReviewEvent[] { try { const rows=JSON.parse(localStorage.getItem(key(owner))||'[]'); return Array.isArray(rows)?rows.filter(e=>typeof e.id==='string'&&typeof e.deckId==='string'&&typeof e.cardId==='string'&&['again','hard','good','easy'].includes(e.rating)&&Number.isFinite(Date.parse(e.reviewedAt))&&/^\d{4}-\d{2}-\d{2}$/.test(e.day)):[]; }catch{return [];} }
interface Context { events:ReviewEvent[]; limits:ReviewLimits; ready:boolean; notice:string; rate:(deck:string,card:string,rating:Rating)=>boolean; sync:()=>Promise<void>; saveLimits:(limits:ReviewLimits)=>Promise<boolean> }
const Reviews=createContext<Context|null>(null);
export function useReviews(){const value=useContext(Reviews);if(!value)throw new Error('Review provider missing');return value;}
export function ReviewProvider({children}:{children:ReactNode}) {
 const {userId,loading}=useNankiStore();
 // Remount account-specific state so pending writes cannot leak between accounts.
 return <AccountReviews key={userId} owner={userId} loading={loading}>{children}</AccountReviews>;
}
function AccountReviews({owner,loading,children}:{owner:string;loading:boolean;children:ReactNode}) {
 const [events,setEvents]=useState<ReviewEvent[]>([]), [limits,setLimits]=useState(DEFAULT_LIMITS), [ready,setReady]=useState(false), [notice,setNotice]=useState('');
 const rows=useRef<ReviewEvent[]>([]), syncing=useRef(false), active=useRef(true);
 const commit=useCallback((next:ReviewEvent[])=>{localStorage.setItem(key(owner),JSON.stringify(next));rows.current=next;setEvents(next);},[owner]);
 const sync=useCallback(async()=>{
  if(owner==='guest'||syncing.current||!active.current)return;
  syncing.current=true;
  try {
   const db=createClient();
   for(const e of rows.current.filter(e=>!e.synced)){
    const {error}=await db.from('card_reviews').upsert({id:e.id,user_id:owner,deck_id:e.deckId,card_id:e.cardId,rating:e.rating,reviewed_at:e.reviewedAt,study_day:e.day},{onConflict:'id',ignoreDuplicates:true});
    if(error)throw error;
    if(!active.current)return;
    commit(rows.current.map(x=>x.id===e.id?{...x,synced:true}:x));
   }
   const remote:ReviewEvent[]=[];
   for(let offset=0;;offset+=1000){
    const {data,error}=await db.from('card_reviews').select('*').eq('user_id',owner).order('reviewed_at').order('id').range(offset,offset+999);
    if(error)throw error;
    remote.push(...(data??[]).map(x=>({id:x.id,deckId:x.deck_id,cardId:x.card_id,rating:x.rating as Rating,reviewedAt:new Date(x.reviewed_at).toISOString(),day:x.study_day,synced:true})));
    if(!data||data.length<1000)break;
   }
   if(!active.current)return;
   commit(mergeReviews(read(owner),rows.current,remote));setNotice('');
  }catch{if(active.current)setNotice('Reviews are saved on this device. Account sync is unavailable; retry when connected.');}
  finally{syncing.current=false;}
 },[owner,commit]);
 useEffect(()=>{
  if(loading)return;
  active.current=true;
  const saved=read(owner);rows.current=saved;setEvents(saved);
  void sync().finally(()=>{if(active.current)setReady(true);});
  if(owner!=='guest')void createClient().from('review_preferences').select('*').eq('user_id',owner).maybeSingle().then(({data})=>{if(active.current&&data)setLimits({newCards:data.new_cards,reviews:data.reviews});});
  const refresh=()=>{if(document.visibilityState==='visible')void sync();};
  const storage=(e:StorageEvent)=>{if(e.key===key(owner)){const merged=mergeReviews(rows.current,read(owner));rows.current=merged;setEvents(merged);void sync();}};
  window.addEventListener('online',refresh);document.addEventListener('visibilitychange',refresh);window.addEventListener('storage',storage);
  const interval=setInterval(refresh,60000);
  return()=>{active.current=false;clearInterval(interval);window.removeEventListener('online',refresh);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('storage',storage);};
 },[loading,owner,sync]);
 const rate=(deckId:string,cardId:string,rating:Rating)=>{
  try {const event:ReviewEvent={id:crypto.randomUUID(),deckId,cardId,rating,reviewedAt:new Date().toISOString(),day:localDay(),synced:false};commit(mergeReviews(read(owner),rows.current,[event]));void sync();return true;}
  catch{setNotice('Your browser could not save this review. Free storage and try again; the card has not advanced.');return false;}
 };
 const saveLimits=async(value:ReviewLimits)=>{
  if(!Number.isInteger(value.newCards)||value.newCards<0||value.newCards>200||!Number.isInteger(value.reviews)||value.reviews<1||value.reviews>1000)return false;
  if(owner==='guest'){setLimits(value);return true;}
  const {error}=await createClient().from('review_preferences').upsert({user_id:owner,new_cards:value.newCards,reviews:value.reviews});
  if(error){setNotice('Could not save study limits. Please retry when account sync is available.');return false;}
  setLimits(value);return true;
 };
 return <Reviews.Provider value={{events,limits,ready,notice,rate,sync,saveLimits}}>{children}</Reviews.Provider>;
}
