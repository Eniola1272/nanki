import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { Quiz, Deck } from '../types';
export type EventKind = 'quiz' | 'deck' | 'attempt' | 'review' | 'delete-quiz' | 'delete-deck';
export interface SyncEvent { id: string; kind: EventKind; entityId: string; payload: unknown; at: string; synced: boolean }
export interface Download { kind: 'quiz'|'deck'; item: Quiz|Deck; savedAt: string }
export interface OfflineData { events: SyncEvent[]; downloads: Download[] }
const EMPTY: OfflineData = { events: [], downloads: [] };
const accountKey = 'nanki_offline_account';
export const dataKey = (owner: string) => `nanki_offline_v1:${owner}`;
let owner = 'guest';
let initialized: Promise<void> | undefined;
const locks = new Map<string, Promise<unknown>>();
const listeners = new Set<()=>void>();
let syncing = false;
let message = 'Saved on this device';
let catalog: { quizzes: Quiz[]; decks: Deck[] } = { quizzes: [], decks: [] };
export const newEventId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
export function mergeEvents(...groups: SyncEvent[][]) {
 const map=new Map<string,SyncEvent>();
 for(const e of groups.flat()) if(!map.get(e.id)?.synced||e.synced) map.set(e.id,e);
 return [...map.values()].sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));
}
export function materialize<T>(events:SyncEvent[],kind:EventKind):T[]{
 const result=new Map<string,T>();
 for(const e of mergeEvents(events)) { if(e.kind===kind)result.set(e.entityId,e.payload as T);else if(e.kind===`delete-${kind}`)result.delete(e.entityId); }
 return [...result.values()];
}
const notify=()=>listeners.forEach(fn=>fn());
async function read(account:string):Promise<OfflineData>{
 const raw=await AsyncStorage.getItem(dataKey(account));
 if(!raw)return {...EMPTY};
 let value=JSON.parse(raw);
 if(value.version===2&&Array.isArray(value.parts)){
  const pieces:string[]=[];
  for(const part of value.parts){
   if(typeof part!=='string'||!part.startsWith(`${dataKey(account)}:part:`))throw new Error('Invalid offline data index');
   const piece=await AsyncStorage.getItem(part);if(piece===null)throw new Error('Offline data is incomplete');pieces.push(piece);
  }
  value=JSON.parse(pieces.join(''));
 }
 if(!Array.isArray(value.events)||!Array.isArray(value.downloads))throw new Error('Offline data could not be read. Do not clear app storage.');
 return value;
}
async function persist(account:string,value:OfflineData){
 // Commit a small manifest only after all chunks are durable. Keep the previous
 // manifest intact if storage fills up mid-save (Android has per-row limits).
 const previous=await AsyncStorage.getItem(dataKey(account));
 const oldParts: string[]=previous ? JSON.parse(previous).parts??[] : [];
 const text=JSON.stringify(value),parts:string[]=[];
 const revision=newEventId();
 try{
  for(let offset=0;offset<text.length;offset+=120000){
   const part=`${dataKey(account)}:part:${revision}:${parts.length}`;parts.push(part);
   await AsyncStorage.setItem(part,text.slice(offset,offset+120000));
  }
  await AsyncStorage.setItem(dataKey(account),JSON.stringify({version:2,parts}));
 }catch(error){
  for(const part of parts)await AsyncStorage.removeItem(part).catch(()=>{});
  throw error;
 }
 for(const part of oldParts)await AsyncStorage.removeItem(part).catch(()=>{});
}
async function change(account:string,fn:(data:OfflineData)=>OfflineData){
 const previous=locks.get(account)??Promise.resolve();
 const next=previous.catch(()=>{}).then(async()=>{const result=fn(await read(account));await persist(account,result);notify();});
 locks.set(account,next);await next;
}
function snapshot(account:string):Promise<OfflineData>{
 const next=(locks.get(account)??Promise.resolve()).catch(()=>{}).then(()=>read(account));
 locks.set(account,next);return next;
}
export const OfflineService={
 async initialize(){
  if(!initialized)initialized=(async()=>{
   owner=await AsyncStorage.getItem(accountKey)||'guest';
   // Auth callbacks switch namespaces; an expired/offline session never destroys local data.
   supabase.auth.onAuthStateChange((event,session)=>{
    if(session?.user||event==='SIGNED_OUT')void this.setAccount(session?.user.id??'guest').catch(()=>{message='Could not save account state on this device';notify();});
   });
   void supabase.auth.getSession().then(({data,error})=>{if(!error)void this.setAccount(data.session?.user.id??'guest').catch(()=>{message='Could not save account state on this device';notify();});}).catch(()=>{});
  })();
  await initialized;
 },
 async setAccount(account:string){if(owner===account)return;catalog={quizzes:[],decks:[]};owner=account;await AsyncStorage.setItem(accountKey,account);message=account==='guest'?'Guest progress stays on this device':'Waiting to sync';notify();void this.sync();},
 async account(){await this.initialize();return owner;},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 getCatalog(){return catalog;},
 async read(){await this.initialize();return snapshot(owner);},
 async status(){const data=await this.read();return {owner,pending:data.events.filter(e=>!e.synced).length,syncing,message,downloads:data.downloads.length};},
 async record(kind:EventKind,entityId:string,payload:unknown,eventId=newEventId()){
  await this.initialize();const account=owner;
  await change(account,data=>({...data,events:mergeEvents(data.events,[{id:eventId,kind,entityId,payload,at:new Date().toISOString(),synced:false}])}));
  void this.sync();
 },
 async download(kind:'quiz'|'deck',item:Quiz|Deck){
  await this.initialize();const account=owner;
  const latest=(kind==='quiz'?catalog.quizzes:catalog.decks).find(value=>value.id===item.id)??item;
  await change(account,data=>({...data,downloads:[...data.downloads.filter(d=>!(d.kind===kind&&d.item.id===item.id)),{kind,item:latest,savedAt:new Date().toISOString()}]}));
 },
 async removeDownload(kind:'quiz'|'deck',id:string){await this.initialize();await change(owner,data=>({...data,downloads:data.downloads.filter(d=>!(d.kind===kind&&d.item.id===id))}));},
 async sync(){
  await this.initialize();if(syncing||owner==='guest')return;
  const account=owner;syncing=true;message='Syncing…';notify();
  try{
   const {data:{session},error:authError}=await supabase.auth.getSession();
   if(authError||session?.user.id!==account)throw new Error('Sign in to the same account to sync');
   // The same RLS-protected library used by the website; only explicit downloads persist.
   const fetched: { quizzes: Quiz[]; decks: Deck[] } = { quizzes: [], decks: [] };
   for (const table of ['quizzes','decks'] as const) {
    for(let offset=0;;offset+=500){
     const {data,error}=await supabase.from(table).select('id,title,category,description,content').order('id').range(offset,offset+499);
     if(error)throw error;
     for(const row of data??[]) {
      if(!Array.isArray(row.content)||!row.content.length)continue;
      if(table==='quizzes')fetched.quizzes.push({id:row.id,title:row.title,category:row.category??'',description:row.description??'',questions:row.content.map(q=>({...q,type:q.type==='true-false'?'true-false':'single',correctAnswer:q.correctOptionIndex??q.correctAnswer??0,explanation:q.explanation??'',branchAnswers:q.correctTruthValues?Object.fromEntries(q.correctTruthValues.map((v:boolean,i:number)=>[i,Number(v)])):q.branchAnswers}))});
      else fetched.decks.push({id:row.id,title:row.title,category:row.category??'',cards:row.content.map(card=>({...card,deckId:row.id}))});
     }
     if(!data||data.length<500)break;
    }
   }
   if(owner!==account)return;
   catalog=fetched;notify();
   const pending=(await snapshot(account)).events.filter(e=>!e.synced);
   for(const e of pending){
    if(owner!==account)return;
    const {error}=await supabase.from('mobile_sync_events').upsert({id:e.id,user_id:account,kind:e.kind,entity_id:e.entityId,payload:e.payload,occurred_at:e.at},{onConflict:'user_id,id',ignoreDuplicates:true});
    if(error)throw error;
    await change(account,data=>({...data,events:data.events.map(row=>row.id===e.id?{...row,synced:true}:row)}));
   }
   const remote:SyncEvent[]=[];
   for(let offset=0;;offset+=500){
    if(owner!==account)return;
    const {data,error}=await supabase.from('mobile_sync_events').select('*').eq('user_id',account).order('occurred_at').order('id').range(offset,offset+499);
    if(error)throw error;
    remote.push(...(data??[]).map(row=>({id:row.id,kind:row.kind as EventKind,entityId:row.entity_id,payload:row.payload,at:new Date(row.occurred_at).toISOString(),synced:true})));
    if(!data||data.length<500)break;
   }
   await change(account,data=>({...data,events:mergeEvents(data.events,remote)}));
   if(owner===account)message=(await snapshot(account)).events.some(e=>!e.synced)?'New progress waiting to sync':'Synced to your account';
  }catch{if(owner===account)message='Sync unavailable · progress is safe on this device';}
  finally{syncing=false;notify();}
 },
};
