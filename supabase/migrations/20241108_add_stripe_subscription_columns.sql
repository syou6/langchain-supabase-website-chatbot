-- Add Stripe subscription metadata columns to users table
alter table if exists public.users
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists cancel_at_period_end boolean not null default false;

create index if not exists idx_users_stripe_subscription_id on public.users (stripe_subscription_id);
create index if not exists idx_users_stripe_customer_id on public.users (stripe_customer_id);
