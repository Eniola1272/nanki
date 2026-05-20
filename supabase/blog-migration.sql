-- =============================================================
-- Blog Migration for Nanki
-- =============================================================
-- Run this in the Supabase SQL Editor after setup.sql
-- =============================================================

-- 1. Add is_admin flag to profiles
alter table profiles
  add column if not exists is_admin boolean default false;

-- 2. Blog posts table
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null default '',
  cover_image text,
  author_id uuid references profiles(id) on delete set null,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table blog_posts enable row level security;

-- Public can view published posts
create policy "Public can view published blog posts"
  on blog_posts for select
  using (published = true);

-- Admins can view all posts (including drafts)
create policy "Admins can view all blog posts"
  on blog_posts for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Admins can create posts
create policy "Admins can create blog posts"
  on blog_posts for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Admins can update posts
create policy "Admins can update blog posts"
  on blog_posts for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Admins can delete posts
create policy "Admins can delete blog posts"
  on blog_posts for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Auto-update updated_at on change
create or replace function public.handle_blog_post_updated()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_blog_post_updated
  before update on blog_posts
  for each row execute function public.handle_blog_post_updated();
