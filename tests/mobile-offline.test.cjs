const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function harness(existingDisk=new Map()){
 const disk=existingDisk,cloud=new Map();let signedIn=null,network=false,failWrite=false,loseAck=false;
 const storage={getItem:async k=>disk.get(k)??null,setItem:async(k,v)=>{if(failWrite)throw Error('full');disk.set(k,v);},removeItem:async k=>{disk.delete(k);}};
 const db={auth:{onAuthStateChange:()=>{},getSession:async()=>({data:{session:signedIn?{user:{id:signedIn}}:null},error:null})},from:()=>({upsert:async row=>{if(!network)return {error:Error('offline')};const id=`${row.user_id}/${row.id}`;if(!cloud.has(id))cloud.set(id,row);if(loseAck){loseAck=false;return {error:Error('response lost')};}return {error:null};},select:()=>{let account;const q={eq:(k,v)=>{account=v;return q;},order:()=>q,range:async(a,b)=>network?{data:[...cloud.values()].filter(r=>r.user_id===account).slice(a,b+1),error:null}:{error:Error('offline')}};return q;}})};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('mobile/src/lib/offline.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports,require:n=>n.includes('async-storage')?storage:{supabase:db},Date,Math,Map,Set,Promise});
 const service=exports.OfflineService;
 const settle=async()=>{for(let i=0;i<100;i++){await new Promise(setImmediate);if(!(await service.status()).syncing)return;}throw Error('sync did not finish');};
 return {service,exports,disk,cloud,settle,setAuth:v=>signedIn=v,setNetwork:v=>network=v,setWriteFailure:v=>failWrite=v,setLostAck:()=>loseAck=true};
}
test('offline snapshots survive storage reads; removal leaves attempts queued',async()=>{
 const h=harness();await h.service.download('quiz',{id:'q',title:'Q',questions:[{text:'Full question',options:['A'],correctAnswer:0}]});
 await h.service.record('attempt','a',{quizId:'q',score:1},'attempt-a');
 assert.equal((await h.service.read()).downloads[0].item.questions[0].text,'Full question');
 const restarted=harness(h.disk);assert.equal((await restarted.service.read()).downloads[0].item.questions[0].text,'Full question');
 assert.equal((await restarted.service.read()).events[0].id,'attempt-a');
 await h.service.removeDownload('quiz','q');const data=await h.service.read();assert.equal(data.downloads.length,0);assert.equal(data.events.length,1);assert.equal(data.events[0].synced,false);
});
test('offline writes serialize without loss, are account scoped, and are not capped at fifty',async()=>{
 const h=harness();h.setAuth('a');await h.service.initialize();await h.service.setAccount('a');await h.settle();await Promise.all(Array.from({length:65},(_,i)=>h.service.record('attempt',String(i),{score:i},`e${i}`)));await h.settle();
 assert.equal((await h.service.read()).events.length,65);await h.service.setAccount('b');await h.settle();assert.equal((await h.service.read()).events.length,0);await h.service.setAccount('a');await h.settle();assert.equal((await h.service.read()).events.length,65);
});
test('reconnect uploads once after lost acknowledgement; errors retain pending data',async()=>{
 const h=harness();h.setAuth('a');await h.service.setAccount('a');await h.settle();await h.service.record('attempt','a',{score:3},'id');await h.settle();assert.equal((await h.service.status()).pending,1);
 h.setNetwork(true);h.setLostAck();await h.service.sync();assert.equal((await h.service.status()).pending,1);assert.equal(h.cloud.size,1);
 await h.service.sync();assert.equal((await h.service.status()).pending,0);assert.equal(h.cloud.size,1);
});
test('storage failure rejects a review instead of advancing or losing it silently',async()=>{
 const h=harness();h.setWriteFailure(true);await assert.rejects(h.service.record('review','c',{reps:1}));h.setWriteFailure(false);assert.equal((await h.service.read()).events.length,0);
});
test('cloud replay preserves deletion and takes latest revision while retaining history',()=>{
 const h=harness();const events=[{id:'1',kind:'deck',entityId:'d',payload:{id:'d',title:'Old'},at:'2026-01-01',synced:true},{id:'2',kind:'deck',entityId:'d',payload:{id:'d',title:'New'},at:'2026-01-02',synced:true}];
 assert.equal(h.exports.materialize(events,'deck')[0].title,'New');events.push({id:'3',kind:'delete-deck',entityId:'d',payload:{},at:'2026-01-03',synced:true});assert.equal(h.exports.materialize(events,'deck').length,0);assert.equal(h.exports.mergeEvents(events,events).length,3);
});

test('large banks are stored in bounded chunks and reopen without truncation',async()=>{
 const h=harness();const text='Very long clinical question '.repeat(15000);
 await h.service.download('quiz',{id:'large',title:'Bank',questions:[{text}]});
 assert.ok([...h.disk.values()].every(value=>value.length<=120000));
 const restarted=harness(h.disk);assert.equal((await restarted.service.read()).downloads[0].item.questions[0].text,text);
});
