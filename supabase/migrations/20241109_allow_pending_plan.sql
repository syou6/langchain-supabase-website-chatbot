-- Allow 'pending' internal plan before checkout completes
alter table if exists public.users
  alter column plan set default 'pending';

alter table if exists public.users
  drop constraint if exists users_plan_check;

alter table if exists public.users
  add constraint users_plan_check check (plan in ('pending', 'starter', 'pro', 'enterprise'));

-- Optional: ensure existing records without plan get starter fallback
update public.users
set plan = coalesce(plan, 'pending');
