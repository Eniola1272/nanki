// NODE_PATH=/tmp/nanki-review-db/node_modules node --test tests/review-db.cjs
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
test('review migration is repeatable, private, append-only; mistake import is idempotent',async()=>{
 const db=new PGlite();
 const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002',deck='10000000-0000-4000-8000-000000000001';
 try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth, public to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
 await db.exec(fs.readFileSync('supabase/setup.sql','utf8'));await db.exec(fs.readFileSync('supabase/decks-migration.sql','utf8'));
 const sql=fs.readFileSync('supabase/spaced-repetition-migration.sql','utf8');await db.exec(sql);await db.exec(sql);
 await db.exec(`grant select,insert,update on public.decks to authenticated;insert into auth.users(id) values('${a}'),('${b}');`);
 const asUser=async id=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');};
 await asUser(a);
 await db.query("insert into card_reviews values($1,$2,'d','c','good',now(),current_date)",['20000000-0000-4000-8000-000000000001',a]);
 await assert.rejects(db.query("insert into card_reviews values($1,$2,'d','c','good',now(),current_date)",['20000000-0000-4000-8000-000000000002',b]));
 await assert.rejects(db.exec("update card_reviews set rating='easy'"));
 await db.query('insert into review_preferences values($1,20,100)',[a]);
 await asUser(b);assert.equal((await db.query('select * from card_reviews')).rows.length,0);assert.equal((await db.query('select * from review_preferences')).rows.length,0);
 await asUser(a);
 const cards=[{id:'c',front:'Question',back:'False',source:{quizId:'q',questionId:'x',branch:1,attemptId:'a'}}];
 const save=async id=>(await db.query('select save_mistake_flashcards($1,$2,$3,$4) as result',[id,'Mistakes','General',JSON.stringify(cards)])).rows[0].result;
 assert.equal((await save(deck)).added,1);assert.equal((await save(deck)).added,0);assert.equal((await save('10000000-0000-4000-8000-000000000002')).added,0);
 assert.equal((await db.query('select content from decks where id=$1',[deck])).rows[0].content.length,1);
 await asUser(b);await assert.rejects(save(deck));assert.equal((await db.query('select * from decks')).rows.length,0);
 }finally{await db.close();}
});
