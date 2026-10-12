-- =============================================================
-- Content Moderation & Creator Discovery Migration
-- Apply after setup.sql, decks-migration.sql, and community-migration.sql
-- =============================================================
begin;

-- 1. Create content_reports table for community moderation
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid references public.quizzes(id) on delete cascade,
  deck_id uuid references public.decks(id) on delete cascade,
  reason text not null check (reason in ('inaccurate', 'inappropriate', 'spam', 'copyright', 'other')),
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  constraint one_report_target check (num_nonnulls(quiz_id, deck_id) = 1),
  unique (user_id, quiz_id),
  unique (user_id, deck_id)
);

create index if not exists content_reports_quiz_idx on public.content_reports(quiz_id);
create index if not exists content_reports_deck_idx on public.content_reports(deck_id);
create index if not exists content_reports_status_idx on public.content_reports(status);

alter table public.content_reports enable row level security;

-- Policies: Authenticated users can file reports and view their own reports
drop policy if exists "Users can view own reports" on public.content_reports;
create policy "Users can view own reports" on public.content_reports
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Users can file reports on content by others" on public.content_reports;
create policy "Users can file reports on content by others" on public.content_reports
  for insert to authenticated with check (
    user_id = (select auth.uid()) and (
      exists (select 1 from public.quizzes q where q.id = quiz_id and q.published = true and q.user_id <> (select auth.uid()))
      or exists (select 1 from public.decks d where d.id = deck_id and d.published = true and d.user_id <> (select auth.uid()))
    )
  );

grant select, insert on public.content_reports to authenticated;
revoke update, delete on public.content_reports from anon, authenticated;

-- 2. Creator profile retrieval (security-definer function returning safe public fields only)
create or replace function public.get_creator_profile(p_user_id uuid)
returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', p.id,
    'name', coalesce(p.name, 'Learner'),
    'avatar_url', coalesce(p.avatar_url, '/avatar.svg'),
    'created_at', p.created_at
  )
  from public.profiles p
  where p.id = p_user_id;
$$;

revoke all on function public.get_creator_profile(uuid) from public;
grant execute on function public.get_creator_profile(uuid) to anon, authenticated;

-- 3. Creator collection summary (stats on published content & total helpful votes)
create or replace function public.get_creator_stats(p_user_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_quiz_count integer;
  v_deck_count integer;
  v_total_likes bigint;
begin
  select count(*) into v_quiz_count
  from public.quizzes
  where user_id = p_user_id and published = true;

  select count(*) into v_deck_count
  from public.decks
  where user_id = p_user_id and published = true;

  select coalesce(sum(count), 0) into v_total_likes
  from (
    select count(l.id) as count
    from public.quizzes q
    join public.content_likes l on l.quiz_id = q.id
    where q.user_id = p_user_id and q.published = true
    group by q.id
    union all
    select count(l.id) as count
    from public.decks d
    join public.content_likes l on l.deck_id = d.id
    where d.user_id = p_user_id and d.published = true
    group by d.id
  ) counts;

  return jsonb_build_object(
    'quizzes_count', v_quiz_count,
    'decks_count', v_deck_count,
    'total_likes', v_total_likes
  );
end;
$$;

revoke all on function public.get_creator_stats(uuid) from public;
grant execute on function public.get_creator_stats(uuid) to anon, authenticated;

commit;
