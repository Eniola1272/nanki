-- Run after setup.sql and decks-migration.sql. Safe to run again.
begin;

create table if not exists public.content_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid references public.quizzes(id) on delete cascade,
  deck_id uuid references public.decks(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint one_like_target check (num_nonnulls(quiz_id, deck_id) = 1),
  unique (user_id, quiz_id),
  unique (user_id, deck_id)
);
create index if not exists content_likes_quiz_idx on public.content_likes(quiz_id);
create index if not exists content_likes_deck_idx on public.content_likes(deck_id);
alter table public.content_likes enable row level security;

drop policy if exists "Read own likes" on public.content_likes;
create policy "Read own likes" on public.content_likes for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "Like public content by other authors" on public.content_likes;
create policy "Like public content by other authors" on public.content_likes for insert to authenticated
  with check (user_id = (select auth.uid()) and (
    exists (select 1 from public.quizzes q where q.id = quiz_id and q.published = true and q.user_id <> (select auth.uid()))
    or exists (select 1 from public.decks d where d.id = deck_id and d.published = true and d.user_id <> (select auth.uid()))
  ));
drop policy if exists "Remove own likes" on public.content_likes;
create policy "Remove own likes" on public.content_likes for delete to authenticated
  using (user_id = (select auth.uid()));

-- Return aggregate counts, never the identities of other voters. Explicit
-- published checks keep private content out even though this function bypasses RLS.
create or replace function public.content_like_stats()
returns table (kind text, content_id uuid, like_count bigint, liked_by_me boolean)
language sql stable security definer set search_path = '' as $$
  select 'quiz'::text, q.id, count(l.id), coalesce(bool_or(l.user_id = auth.uid()), false)
  from public.quizzes q left join public.content_likes l on l.quiz_id = q.id
  where q.published = true group by q.id
  union all
  select 'deck'::text, d.id, count(l.id), coalesce(bool_or(l.user_id = auth.uid()), false)
  from public.decks d left join public.content_likes l on l.deck_id = d.id
  where d.published = true group by d.id;
$$;
revoke all on function public.content_like_stats() from public;
grant execute on function public.content_like_stats() to anon, authenticated;
grant select, insert, delete on public.content_likes to authenticated;
revoke update on public.content_likes from anon, authenticated;
commit;
