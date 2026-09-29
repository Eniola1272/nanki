// Run with NODE_PATH pointing to an installation of @electric-sql/pglite.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');

const author = '00000000-0000-4000-8000-000000000001';
const learner = '00000000-0000-4000-8000-000000000002';
const other = '00000000-0000-4000-8000-000000000003';
const quiz = '10000000-0000-4000-8000-000000000001';
const privateQuiz = '10000000-0000-4000-8000-000000000002';
const deck = '20000000-0000-4000-8000-000000000001';
const privateDeck = '20000000-0000-4000-8000-000000000002';

test('community migration enforces real PostgreSQL privacy and vote constraints', async t => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth, public to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
    `);
    await db.exec(fs.readFileSync('supabase/setup.sql', 'utf8'));
    await db.exec(fs.readFileSync('supabase/decks-migration.sql', 'utf8'));
    const migration = fs.readFileSync('supabase/community-migration.sql', 'utf8');
    await db.exec(migration);
    await db.exec(migration); // Deployment retries are safe.
    await db.exec(`
      grant select on public.quizzes, public.decks to anon, authenticated;
      grant update on public.quizzes, public.decks to authenticated;
      insert into auth.users(id) values ('${author}'), ('${learner}'), ('${other}');
      insert into public.quizzes(id, title, user_id, published) values
        ('${quiz}', 'Public quiz', '${author}', true), ('${privateQuiz}', 'Private quiz', '${author}', false);
      insert into public.decks(id, title, user_id, published) values
        ('${deck}', 'Public deck', '${author}', true), ('${privateDeck}', 'Private deck', '${author}', false);
    `);
    const asUser = async id => {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id ?? '']);
      await db.exec(id ? 'set role authenticated' : 'set role anon');
    };
    const like = (userId, column, id) => db.query(`insert into public.content_likes(user_id, ${column}) values ($1, $2)`, [userId, id]);

    await t.test('anonymous learners only see public content and cannot vote', async () => {
      await asUser(null);
      assert.equal((await db.query('select * from public.quizzes')).rows.length, 1);
      assert.equal((await db.query('select * from public.decks')).rows.length, 1);
      assert.equal((await db.query('select * from public.content_like_stats()')).rows.length, 2);
      await assert.rejects(like(learner, 'quiz_id', quiz), e => e.code === '42501');
    });
    await t.test('one helpful vote per learner per content item', async () => {
      await asUser(learner);
      await like(learner, 'quiz_id', quiz);
      await like(learner, 'deck_id', deck);
      await assert.rejects(like(learner, 'quiz_id', quiz), e => e.code === '23505');
      await assert.rejects(like(learner, 'deck_id', deck), e => e.code === '23505');
    });
    await t.test('self-votes, private-content votes, and forged identities are rejected', async () => {
      await asUser(author);
      await assert.rejects(like(author, 'quiz_id', quiz), e => e.code === '42501');
      await assert.rejects(like(author, 'deck_id', deck), e => e.code === '42501');
      await asUser(learner);
      await assert.rejects(like(learner, 'quiz_id', privateQuiz), e => e.code === '42501');
      await assert.rejects(like(learner, 'deck_id', privateDeck), e => e.code === '42501');
      await assert.rejects(like(other, 'quiz_id', quiz), e => e.code === '42501');
    });
    await t.test('learners cannot publish another author’s private content', async () => {
      await asUser(learner);
      assert.equal((await db.query(`update public.quizzes set published = true where id = '${privateQuiz}' returning id`)).rows.length, 0);
      assert.equal((await db.query(`update public.decks set published = true where id = '${privateDeck}' returning id`)).rows.length, 0);
    });
    await t.test('counts include all learners while voter identities remain private', async () => {
      await asUser(other);
      await like(other, 'quiz_id', quiz);
      assert.equal((await db.query('select * from public.content_likes')).rows.length, 1);
      const row = (await db.query(`select * from public.content_like_stats() where content_id = '${quiz}'`)).rows[0];
      assert.equal(Number(row.like_count), 2); assert.equal(row.liked_by_me, true);
      assert.deepEqual(Object.keys(row).sort(), ['content_id', 'kind', 'like_count', 'liked_by_me']);
      await asUser(null);
      assert.equal((await db.query(`select * from public.content_like_stats() where content_id = '${quiz}'`)).rows[0].liked_by_me, false);
    });
    await t.test('unliking removes only the learner’s vote', async () => {
      await asUser(learner);
      await db.query(`delete from public.content_likes where quiz_id = '${quiz}'`);
      assert.equal(Number((await db.query(`select * from public.content_like_stats() where content_id = '${quiz}'`)).rows[0].like_count), 1);
    });
    await t.test('making content private removes it from discovery and vote aggregates', async () => {
      await asUser(author);
      await db.query(`update public.quizzes set published = false where id = '${quiz}'`);
      await db.query(`update public.decks set published = false where id = '${deck}'`);
      await asUser(learner);
      assert.equal((await db.query('select * from public.quizzes')).rows.length, 0);
      assert.equal((await db.query('select * from public.decks')).rows.length, 0);
      assert.equal((await db.query('select * from public.content_like_stats()')).rows.length, 0);
      await assert.rejects(like(learner, 'quiz_id', quiz), e => e.code === '42501');
    });
    await t.test('republishing restores prior helpful votes', async () => {
      await asUser(author);
      await db.query(`update public.quizzes set published = true where id = '${quiz}'`);
      await asUser(null);
      assert.equal(Number((await db.query(`select * from public.content_like_stats() where content_id = '${quiz}'`)).rows[0].like_count), 1);
    });
  } finally { await db.close(); }
});
