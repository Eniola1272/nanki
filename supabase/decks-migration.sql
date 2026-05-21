-- =============================================================
-- Decks Migration for Nanki
-- =============================================================
-- Run in Supabase SQL Editor after setup.sql
-- =============================================================

-- 1. Add category + mastered_percentage to quizzes table
alter table quizzes
  add column if not exists category text default '',
  add column if not exists mastered_percentage int default 0;

-- 2. Decks table
create table if not exists decks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  category text default '',
  content jsonb not null default '[]',
  user_id uuid references profiles(id) on delete cascade,
  published boolean default false,
  shareable_slug text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table decks enable row level security;

create policy "Users can view their own decks"
  on decks for select
  using (user_id = auth.uid());

create policy "Users can view published decks"
  on decks for select
  using (published = true);

create policy "Users can create decks"
  on decks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own decks"
  on decks for update
  using (user_id = auth.uid());

create policy "Users can delete their own decks"
  on decks for delete
  using (user_id = auth.uid());

-- Auto-update updated_at
create or replace function public.handle_deck_updated()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_deck_updated
  before update on decks
  for each row execute function public.handle_deck_updated();
