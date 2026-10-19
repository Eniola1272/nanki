const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
test('offline cloud log is private, append-only and retry safe',async()=>{
 const db=new PGlite();const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002';
 try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth, public to anon, authenticated;insert into auth.users values('${a}'),('${b}');`);
 const sql=fs.readFileSync('supabase/mobile-offline-migration.sql','utf8');await db.exec(sql);await db.exec(sql);
 const asUser=async id=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');};
 await asUser(a);
 const insert='insert into mobile_sync_events(user_id,id,kind,entity_id,payload,occurred_at) values($1,$2,\'attempt\',\'quiz\',\'{"score":2}\',now()) on conflict(user_id,id) do nothing';
 await db.query(insert,[a,'attempt-1']);await db.query(insert,[a,'attempt-1']);assert.equal((await db.query('select * from mobile_sync_events')).rows.length,1);
 await assert.rejects(db.query(insert,[b,'forged']));await assert.rejects(db.exec("update mobile_sync_events set payload='{}'"));await assert.rejects(db.exec('delete from mobile_sync_events'));
 await asUser(b);assert.equal((await db.query('select * from mobile_sync_events')).rows.length,0);await db.query(insert,[b,'attempt-1']);assert.equal((await db.query('select * from mobile_sync_events')).rows.length,1);
 await db.exec('reset role;set role anon');await assert.rejects(db.exec('select * from mobile_sync_events'));
 }finally{await db.close();}
});
