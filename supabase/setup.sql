-- =============================================================
-- Supabase Database Setup for Quiz App (nanki)
-- =============================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- This creates all tables needed after migrating from Prisma.
-- =============================================================

-- 1. Profiles table (linked to auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  is_premium boolean default false,
  stripe_customer_id text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. Organizations table
create table if not exists organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  owner_id uuid references profiles(id) not null,
  is_premium boolean default false,
  stripe_customer_id text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table organizations enable row level security;

create policy "Org members can view org"
  on organizations for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from memberships
      where memberships.organization_id = organizations.id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Owner can update org"
  on organizations for update
  using (owner_id = auth.uid());

create policy "Authenticated users can create orgs"
  on organizations for insert
  with check (auth.uid() = owner_id);


-- 3. Memberships table
create table if not exists memberships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  organization_id uuid references organizations(id) not null,
  role text default 'MEMBER' check (role in ('ADMIN', 'MEMBER', 'VIEWER')),
  joined_at timestamptz default now(),
  unique (user_id, organization_id)
);

alter table memberships enable row level security;

create policy "Members can view memberships in their org"
  on memberships for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from memberships m
      where m.organization_id = memberships.organization_id
      and m.user_id = auth.uid()
    )
  );


-- 4. Quizzes table
create table if not exists quizzes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  content jsonb not null default '{}',
  time_limit int,
  published boolean default false,
  shareable_slug text unique,
  user_id uuid references profiles(id),
  organization_id uuid references organizations(id),
  max_attempts int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table quizzes enable row level security;

create policy "Users can view their own quizzes"
  on quizzes for select
  using (user_id = auth.uid());

create policy "Users can view published quizzes"
  on quizzes for select
  using (published = true);

create policy "Users can create quizzes"
  on quizzes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own quizzes"
  on quizzes for update
  using (user_id = auth.uid());

create policy "Users can delete their own quizzes"
  on quizzes for delete
  using (user_id = auth.uid());


-- 5. Quiz Attempts table
create table if not exists quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references quizzes(id) not null,
  user_id uuid references profiles(id) not null,
  score int,
  max_score int,
  answers jsonb,
  started_at timestamptz default now(),
  completed_at timestamptz
);

alter table quiz_attempts enable row level security;

create policy "Users can view their own attempts"
  on quiz_attempts for select
  using (user_id = auth.uid());

create policy "Users can create attempts"
  on quiz_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own attempts"
  on quiz_attempts for update
  using (user_id = auth.uid());
