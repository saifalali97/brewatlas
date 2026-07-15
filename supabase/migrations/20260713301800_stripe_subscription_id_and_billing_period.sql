-- Explicit Stripe subscription id and billing period columns (production subscription schema).
-- Keeps billing_provider_ref / billing_interval for backward compatibility.

alter table public.subscriptions
  add column if not exists stripe_subscription_id text,
  add column if not exists billing_period text check (billing_period in ('month', 'year'));

-- Backfill from existing Stripe integration columns.
update public.subscriptions
set
  stripe_subscription_id = coalesce(stripe_subscription_id, billing_provider_ref),
  billing_period = coalesce(billing_period, billing_interval)
where billing_provider = 'stripe';

create unique index if not exists subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

comment on column public.subscriptions.stripe_subscription_id is
  'Stripe Subscription id (sub_...) — mirrors billing_provider_ref when billing_provider = stripe.';

comment on column public.subscriptions.billing_period is
  'month | year — active billing cadence; mirrors billing_interval when billing_provider = stripe.';

-- Keep explicit Stripe columns in sync when the app writes billing_provider_ref / billing_interval.
create or replace function public.sync_subscription_stripe_aliases()
returns trigger
language plpgsql
as $$
begin
  new.stripe_subscription_id := coalesce(new.stripe_subscription_id, new.billing_provider_ref);
  new.billing_period := coalesce(new.billing_period, new.billing_interval);
  return new;
end;
$$;

drop trigger if exists subscriptions_stripe_aliases on public.subscriptions;

create trigger subscriptions_stripe_aliases
  before insert or update on public.subscriptions
  for each row
  execute function public.sync_subscription_stripe_aliases();

