const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:n=>deps[n],Date});return exports;}
const s=load('lib/review/scheduler.ts');
const m=load('lib/review/mistakes.ts',{'../quiz/scoring':load('lib/quiz/scoring.ts')});
const now=new Date('2026-10-08T12:00:00Z');
const event=(id,cardId,rating='good',at=now.toISOString())=>({id,deckId:'d',cardId,rating,reviewedAt:at,day:s.localDay(new Date(at)),synced:false});
const deck={id:'d',cards:[{id:'a'},{id:'b'},{id:'c'}]};
test('ratings schedule relearning and increasing intervals; replay converges despite duplicate/out-of-order events',()=>{
 const events=[event('1','a','good'),event('2','a','easy','2026-10-09T12:00:00Z')];
 const a=s.schedules(events)[s.cardKey('d','a')],b=s.schedules([events[1],events[0],events[0]])[s.cardKey('d','a')];
 assert.equal(JSON.stringify(a),JSON.stringify(b));assert.equal(a.reviews,2);assert.ok(a.interval>=4);
 assert.equal(s.advance(undefined,'again',now.toISOString(),s.localDay(now)).dueAt,'2026-10-08T12:10:00.000Z');
});
test('daily limits persist through resumed queues and Again becomes due after ten minutes',()=>{
 let q=s.reviewQueue([deck],[],{newCards:1,reviews:1},now);assert.equal(q.queue.length,1);
 const events=[event('1','a','again')];q=s.reviewQueue([deck],events,{newCards:1,reviews:1},now);assert.equal(q.queue.length,0);
 q=s.reviewQueue([deck],events,{newCards:1,reviews:1},new Date('2026-10-08T12:11:00Z'));assert.equal(q.queue.length,1);assert.equal(q.queue[0].card.id,'a');
 q=s.reviewQueue([deck],events,{newCards:1,reviews:1},new Date('2026-10-09T12:00:00Z'));assert.equal(q.queue.length,2);
});
test('review caps are global across decks and reviewed cards stay out of the resumed queue',()=>{
 const events=[event('1','a','good','2026-10-07T10:00:00Z'),event('2','b','good','2026-10-07T10:00:00Z')];
 assert.equal(s.reviewQueue([deck],events,{newCards:0,reviews:1},now).queue.length,1);
 events.push(event('3','a'));assert.equal(s.reviewQueue([deck],events,{newCards:0,reviews:1},now).queue.length,0);
});
test('mistake conversion preserves context, branch truth and source; unanswered is optional',()=>{
 const quiz={id:'qz',questions:[{id:'mc',text:'Pick one',options:['Yes','No'],correctOptionIndex:0,explanation:'Why'}, {id:'tf',text:'Regarding X',type:'true-false',options:['A','B','C','D'],correctTruthValues:[true,false,true,false],correctOptionIndex:0,branchExplanations:['a','b','c','d']}]};
 const answers={mc:1,'tf::0':1,'tf::1':1,'tf::2':null,'tf::3':0};
 const cards=m.mistakeCards(quiz,answers,'attempt');assert.equal(cards.length,2);assert.equal(cards[1].back,'False');assert.equal(cards[1].extraNote,'b');assert.ok(cards[1].front.includes('Regarding X'));assert.equal(cards[1].source.branch,1);
 assert.equal(m.mistakeCards(quiz,answers,'attempt',true).length,3);
 assert.equal(m.uniqueMistakes(m.mistakeCards(quiz,answers,'another'),cards).length,0);
 assert.equal(m.uniqueMistakes([...cards,...cards],[]).length,2);
});
test('missing explanations are not fabricated; malformed keys are excluded',()=>{
 const q={id:'z',questions:[{id:'x',text:'Question',options:['A','B'],correctOptionIndex:0}]};
 assert.equal(m.mistakeCards(q,{x:1},'a')[0].extraNote,undefined);
 q.questions[0].correctOptionIndex=5;assert.equal(m.mistakeCards(q,{x:1},'a').length,0);
});
