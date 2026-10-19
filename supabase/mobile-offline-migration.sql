-- Private, immutable mobile synchronization log. Run before deploying mobile sync.
begin;
create table if not exists public.mobile_sync_events (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null,
 kind text not null check(kind in ('quiz','deck','attempt','review','delete-quiz','delete-deck')),
 entity_id text not null,
 payload jsonb not null,
 occurred_at timestamptz not null,
 primary key(user_id,id)
);
create index if not exists mobile_sync_events_time on public.mobile_sync_events(user_id,occurred_at,id);
alter table public.mobile_sync_events enable row level security;
drop policy if exists "Read own mobile events" on public.mobile_sync_events;
create policy "Read own mobile events" on public.mobile_sync_events for select to authenticated using(user_id=auth.uid());
drop policy if exists "Append own mobile events" on public.mobile_sync_events;
create policy "Append own mobile events" on public.mobile_sync_events for insert to authenticated with check(user_id=auth.uid());
revoke all on public.mobile_sync_events from public,anon,authenticated;
grant select,insert on public.mobile_sync_events to authenticated;
commit;
