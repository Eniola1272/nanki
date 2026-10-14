-- =============================================================
-- Workspaces, Team Decks & Collaborative Quiz Banks Migration
-- Apply after setup.sql, decks-migration.sql, and subscription-migration.sql
-- =============================================================
begin;

-- 1. Ensure decks table supports organization association
alter table public.decks
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create index if not exists decks_organization_id_idx on public.decks(organization_id);
create index if not exists quizzes_organization_id_idx on public.quizzes(organization_id);

alter table public.organizations
  add column if not exists description text;

-- 2. Organizations RLS policies
drop policy if exists "Members can view their organizations" on public.organizations;
create policy "Members can view their organizations" on public.organizations
  for select to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.memberships m
      where m.organization_id = organizations.id and m.user_id = auth.uid()
    )
  );

drop policy if exists "Owners and admins can update organization" on public.organizations;
create policy "Owners and admins can update organization" on public.organizations
  for update to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.memberships m
      where m.organization_id = organizations.id and m.user_id = auth.uid() and m.role = 'ADMIN'
    )
  );

-- 3. Memberships RLS policies
drop policy if exists "Members can view organization memberships" on public.memberships;
create policy "Members can view organization memberships" on public.memberships
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.memberships m
      where m.organization_id = memberships.organization_id and m.user_id = auth.uid()
    )
  );

-- 4. Organization content policies for quizzes and decks
drop policy if exists "Members can view team quizzes" on public.quizzes;
create policy "Members can view team quizzes" on public.quizzes
  for select to authenticated
  using (
    organization_id is not null and exists (
      select 1 from public.memberships m
      where m.organization_id = quizzes.organization_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "Members can create team quizzes" on public.quizzes;
create policy "Members can create team quizzes" on public.quizzes
  for insert to authenticated
  with check (
    organization_id is null or exists (
      select 1 from public.memberships m
      where m.organization_id = quizzes.organization_id and m.user_id = auth.uid() and m.role in ('ADMIN', 'MEMBER')
    )
  );

drop policy if exists "Members can view team decks" on public.decks;
create policy "Members can view team decks" on public.decks
  for select to authenticated
  using (
    organization_id is not null and exists (
      select 1 from public.memberships m
      where m.organization_id = decks.organization_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "Members can create team decks" on public.decks;
create policy "Members can create team decks" on public.decks
  for insert to authenticated
  with check (
    organization_id is null or exists (
      select 1 from public.memberships m
      where m.organization_id = decks.organization_id and m.user_id = auth.uid() and m.role in ('ADMIN', 'MEMBER')
    )
  );

-- 5. Organization Invites table
create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'MEMBER' check (role in ('ADMIN', 'MEMBER', 'VIEWER')),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  token text unique not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  unique (organization_id, email)
);

create index if not exists org_invites_org_idx on public.organization_invites(organization_id);
create index if not exists org_invites_token_idx on public.organization_invites(token);
alter table public.organization_invites enable row level security;

drop policy if exists "Admins can view organization invites" on public.organization_invites;
create policy "Admins can view organization invites" on public.organization_invites
  for select to authenticated
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = organization_invites.organization_id and m.user_id = auth.uid() and m.role = 'ADMIN'
    )
  );

drop policy if exists "Admins can create organization invites" on public.organization_invites;
create policy "Admins can create organization invites" on public.organization_invites
  for insert to authenticated
  with check (
    exists (
      select 1 from public.memberships m
      where m.organization_id = organization_invites.organization_id and m.user_id = auth.uid() and m.role = 'ADMIN'
    )
  );

grant select, insert on public.organization_invites to authenticated;

-- 6. Organization Activity Feed
create table if not exists public.organization_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('created_quiz', 'created_deck', 'completed_quiz', 'reviewed_cards', 'joined_workspace', 'invited_member')),
  target_title text not null,
  target_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists org_activities_org_idx on public.organization_activities(organization_id, created_at desc);
alter table public.organization_activities enable row level security;

drop policy if exists "Members can view workspace activities" on public.organization_activities;
create policy "Members can view workspace activities" on public.organization_activities
  for select to authenticated
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = organization_activities.organization_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "Members can record workspace activities" on public.organization_activities;
create policy "Members can record workspace activities" on public.organization_activities
  for insert to authenticated
  with check (
    user_id = auth.uid() and exists (
      select 1 from public.memberships m
      where m.organization_id = organization_activities.organization_id and m.user_id = auth.uid()
    )
  );

grant select, insert on public.organization_activities to authenticated;

commit;
