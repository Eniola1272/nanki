-- =============================================================
-- Subscription, Free Trial & Plan Enforcement Migration
-- Apply after learning-memory-migration.sql
-- =============================================================
begin;

-- 1. Extend profiles with subscription and trial fields
alter table public.profiles
  add column if not exists plan text not null default 'FREE' check (plan in ('FREE', 'PRO', 'SCHOLAR')),
  add column if not exists subscription_status text not null default 'INACTIVE' check (subscription_status in ('INACTIVE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED')),
  add column if not exists trial_ends_at timestamptz,
  add column if not exists has_used_trial boolean not null default false,
  add column if not exists subscription_ends_at timestamptz,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_price_id text,
  add column if not exists billing_cycle text check (billing_cycle in ('monthly', 'annual') or billing_cycle is null);

-- 2. Enforce strict column grants (reinforcing security from learning-memory-migration.sql)
-- Users can only directly edit display profile fields; billing state is guarded.
revoke update (plan, subscription_status, trial_ends_at, has_used_trial, subscription_ends_at, stripe_customer_id, stripe_subscription_id, stripe_price_id, billing_cycle)
  on public.profiles from public, anon, authenticated;
grant update (name, avatar_url) on public.profiles to authenticated;

-- 3. Stored procedure: Activate 7-Day Free Trial (1-click, no credit card required)
create or replace function public.activate_user_trial(trial_days integer default 7)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_profile public.profiles%rowtype;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_user_id
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if v_profile.has_used_trial then
    raise exception 'Trial already used on this account';
  end if;

  if v_profile.subscription_status = 'ACTIVE' then
    raise exception 'Account already has an active subscription';
  end if;

  update public.profiles
  set
    plan = 'PRO',
    subscription_status = 'TRIALING',
    trial_ends_at = now() + (trial_days || ' days')::interval,
    has_used_trial = true,
    is_premium = true,
    updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return jsonb_build_object(
    'success', true,
    'plan', v_profile.plan,
    'subscription_status', v_profile.subscription_status,
    'trial_ends_at', v_profile.trial_ends_at,
    'has_used_trial', v_profile.has_used_trial
  );
end;
$$;

grant execute on function public.activate_user_trial(integer) to authenticated;

commit;
