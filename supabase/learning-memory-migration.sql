-- Apply after setup.sql, decks-migration.sql and blog-migration.sql.
begin;
-- Table-level UPDATE would override column grants. Remove it and any existing
-- column grants, then allow only ordinary profile presentation fields.
revoke update on public.profiles from public, anon, authenticated;
do $$
declare col record;
begin
  for col in select column_name from information_schema.columns where table_schema = 'public' and table_name = 'profiles' loop
    execute format('revoke update (%I) on public.profiles from public, anon, authenticated', col.column_name);
  end loop;
end $$;
grant update (name, avatar_url) on public.profiles to authenticated;

-- Snapshots preserve history even if a deck is edited or removed. Text IDs also
-- support the built-in starter decks without manufacturing database deck rows.
create table if not exists public.flashcard_sessions (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  deck_id text not null,
  deck_snapshot jsonb not null,
  cards_reviewed integer not null check (cards_reviewed > 0),
  completed_at timestamptz not null,
  study_day date not null
);
alter table public.flashcard_sessions enable row level security;
drop policy if exists "Read own flashcard sessions" on public.flashcard_sessions;
create policy "Read own flashcard sessions" on public.flashcard_sessions for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Record own flashcard sessions" on public.flashcard_sessions;
create policy "Record own flashcard sessions" on public.flashcard_sessions for insert to authenticated with check (user_id = (select auth.uid()));
grant select, insert on public.flashcard_sessions to authenticated;
revoke update, delete on public.flashcard_sessions from anon, authenticated;
create index if not exists flashcard_sessions_history on public.flashcard_sessions(user_id, completed_at desc);
commit;
