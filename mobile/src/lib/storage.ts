import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, Quiz, Deck, Flashcard, ReviewState, QuizAttempt } from '../types';
import { SAMPLE_QUIZZES, SAMPLE_DECKS } from './sample-data';
import { OfflineService, materialize } from './offline';
export interface UserSettings { hapticsEnabled:boolean; autoRevealExplanation:boolean; soundEnabled:boolean }
export const DEFAULT_PROFILE:Profile={id:'guest-local-user',name:'Student Learner',email:'',streak:0,xp:0,plan:'FREE'};
export const DEFAULT_SETTINGS:UserSettings={hapticsEnabled:true,autoRevealExplanation:true,soundEnabled:true};
async function legacy<T>(name:string,fallback:T):Promise<T>{
 if(await OfflineService.account()!=='guest')return fallback;
 const raw=await AsyncStorage.getItem(`nanki_mobile_${name}`);return raw?JSON.parse(raw):fallback;
}
async function library<T extends {id:string}>(kind:'quiz'|'deck',seed:T[]):Promise<T[]>{
 const data=await OfflineService.read();
 const old=await legacy<T[]>(kind==='quiz'?'quizzes':'decks',[]);
 const map=new Map(seed.map(x=>[x.id,x]));
 (kind==='quiz'?OfflineService.getCatalog().quizzes:OfflineService.getCatalog().decks).forEach(x=>map.set(x.id,x as unknown as T));
 old.forEach(x=>map.set(x.id,x));
 data.downloads.filter(x=>x.kind===kind).forEach(x=>map.set(x.item.id,x.item as unknown as T));
 for(const event of data.events){if(event.kind===kind)map.set(event.entityId,event.payload as T);else if(event.kind===`delete-${kind}`)map.delete(event.entityId);}
 return [...map.values()];
}
async function scoped(name:string){return `nanki_mobile_v2:${await OfflineService.account()}:${name}`;}
export const StorageService={
 async getProfile():Promise<Profile>{const raw=await AsyncStorage.getItem(await scoped('profile'));const profile=raw?JSON.parse(raw):await legacy('profile',DEFAULT_PROFILE);const events=(await OfflineService.read()).events;const earned=materialize<QuizAttempt>(events,'attempt').reduce((n,a)=>n+25+Math.round(a.percentage/2),0);return {...profile,id:(await OfflineService.account())==='guest'?'guest-local-user':await OfflineService.account(),xp:profile.xp+earned};},
 async saveProfile(profile:Profile){const earned=materialize<QuizAttempt>((await OfflineService.read()).events,'attempt').reduce((n,a)=>n+25+Math.round(a.percentage/2),0);await AsyncStorage.setItem(await scoped('profile'),JSON.stringify({...profile,xp:Math.max(0,profile.xp-earned)}));},
 async addXP(amount:number){const profile=await this.getProfile();await this.saveProfile({...profile,xp:profile.xp+amount});return profile;},
 async getSettings():Promise<UserSettings>{const raw=await AsyncStorage.getItem(await scoped('settings'));return raw?JSON.parse(raw):legacy('settings',DEFAULT_SETTINGS);},
 async saveSettings(settings:UserSettings){await AsyncStorage.setItem(await scoped('settings'),JSON.stringify(settings));},
 async getQuizzes(){return library('quiz',SAMPLE_QUIZZES);},
 async getDecks(){return library('deck',SAMPLE_DECKS);},
 async saveQuiz(quiz:Quiz){await OfflineService.record('quiz',quiz.id,quiz);},
 async saveDeck(deck:Deck){await OfflineService.record('deck',deck.id,deck);},
 async deleteQuiz(id:string){await OfflineService.record('delete-quiz',id,{});},
 async deleteDeck(id:string){await OfflineService.record('delete-deck',id,{});},
 async getReviewStates():Promise<Record<string,ReviewState>>{
  const states=await legacy<Record<string,ReviewState>>('reviews',{});
  for(const state of materialize<ReviewState>((await OfflineService.read()).events,'review'))states[state.deckId?`${state.deckId}:${state.cardId}`:state.cardId]=state;
  return states;
 },
 async saveReviewState(state:ReviewState){await OfflineService.record('review',state.deckId?`${state.deckId}:${state.cardId}`:state.cardId,state);},
 async getAttempts():Promise<QuizAttempt[]>{const old=await legacy<QuizAttempt[]>('attempts',[]);const map=new Map(old.map(a=>[a.id,a]));materialize<QuizAttempt>((await OfflineService.read()).events,'attempt').forEach(a=>map.set(a.id,a));return [...map.values()].sort((a,b)=>b.completedAt.localeCompare(a.completedAt));},
 async saveAttempt(attempt:QuizAttempt){if((await this.getAttempts()).some(a=>a.id===attempt.id))return;await OfflineService.record('attempt',attempt.id,attempt,`attempt:${attempt.id}`);},
 async getDailyReviewCards():Promise<{dueCards:Flashcard[];totalCards:number;dueCount:number;newCount:number}>{
  const cards=(await this.getDecks()).flatMap(d=>d.cards.map(c=>({...c,deckId:d.id}))),states=await this.getReviewStates();
  let newCount=0;
  const dueCards=cards.filter(c=>{const state=states[`${c.deckId}:${c.id}`]??states[c.id];if(!state){newCount++;return true;}return Date.parse(state.dueDate)<=Date.now();});
  return {dueCards,totalCards:cards.length,dueCount:dueCards.length,newCount};
 },
};
