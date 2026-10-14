-- =============================================================
-- FIX: Infinite recursion detected in policy for relation "memberships"
-- Run this in your Supabase SQL Editor to immediately resolve the issue.
-- =============================================================
begin;

-- 1. Helper functions with SECURITY DEFINER to avoid RLS recursion
create or replace function public.is_org_member(org_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = org_id and user_id = check_user_id
  );
$$;

create or replace function public.is_org_admin(org_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = org_id and user_id = check_user_id and role = 'ADMIN'
  );
$$;

create or replace function public.can_create_org_content(org_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = org_id and user_id = check_user_id and role in ('ADMIN', 'MEMBER')
  );
$$;

-- Grant execution to authenticated users
grant execute on function public.is_org_member to authenticated;
grant execute on function public.is_org_admin to authenticated;
grant execute on function public.can_create_org_content to authenticated;

-- 2. Clean up recursive policies on memberships
drop policy if exists "Members can view organization memberships" on public.memberships;
drop policy if exists "Members can view memberships in their org" on public.memberships;

create policy "Members can view organization memberships" on public.memberships
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_org_member(organization_id, auth.uid())
  );

-- 3. Fix organizations policies
drop policy if exists "Members can view their organizations" on public.organizations;
drop policy if exists "Org members can view org" on public.organizations;
create policy "Members can view their organizations" on public.organizations
  for select to authenticated
  using (
    owner_id = auth.uid()
    or public.is_org_member(id, auth.uid())
  );

drop policy if exists "Owners and admins can update organization" on public.organizations;
drop policy if exists "Owner can update org" on public.organizations;
create policy "Owners and admins can update organization" on public.organizations
  for update to authenticated
  using (
    owner_id = auth.uid()
    or public.is_org_admin(id, auth.uid())
  );

-- 4. Fix quizzes policies
drop policy if exists "Members can view team quizzes" on public.quizzes;
create policy "Members can view team quizzes" on public.quizzes
  for select to authenticated
  using (
    organization_id is not null and public.is_org_member(organization_id, auth.uid())
  );

drop policy if exists "Members can create team quizzes" on public.quizzes;
create policy "Members can create team quizzes" on public.quizzes
  for insert to authenticated
  with check (
    organization_id is null or public.can_create_org_content(organization_id, auth.uid())
  );

drop policy if exists "Members can update team quizzes" on public.quizzes;
create policy "Members can update team quizzes" on public.quizzes
  for update to authenticated
  using (
    organization_id is not null and public.can_create_org_content(organization_id, auth.uid())
  );

-- 5. Fix decks policies
drop policy if exists "Members can view team decks" on public.decks;
create policy "Members can view team decks" on public.decks
  for select to authenticated
  using (
    organization_id is not null and public.is_org_member(organization_id, auth.uid())
  );

drop policy if exists "Members can create team decks" on public.decks;
create policy "Members can create team decks" on public.decks
  for insert to authenticated
  with check (
    organization_id is null or public.can_create_org_content(organization_id, auth.uid())
  );

drop policy if exists "Members can update team decks" on public.decks;
create policy "Members can update team decks" on public.decks
  for update to authenticated
  using (
    organization_id is not null and public.can_create_org_content(organization_id, auth.uid())
  );

-- 6. Fix invites policies
drop policy if exists "Admins can view organization invites" on public.organization_invites;
create policy "Admins can view organization invites" on public.organization_invites
  for select to authenticated
  using (
    public.is_org_admin(organization_id, auth.uid())
  );

drop policy if exists "Admins can create organization invites" on public.organization_invites;
create policy "Admins can create organization invites" on public.organization_invites
  for insert to authenticated
  with check (
    public.is_org_admin(organization_id, auth.uid())
  );

-- 7. Fix activities policies
drop policy if exists "Members can view workspace activities" on public.organization_activities;
create policy "Members can view workspace activities" on public.organization_activities
  for select to authenticated
  using (
    public.is_org_member(organization_id, auth.uid())
  );

drop policy if exists "Members can record workspace activities" on public.organization_activities;
create policy "Members can record workspace activities" on public.organization_activities
  for insert to authenticated
  with check (
    user_id = auth.uid() and public.is_org_member(organization_id, auth.uid())
  );

commit;
