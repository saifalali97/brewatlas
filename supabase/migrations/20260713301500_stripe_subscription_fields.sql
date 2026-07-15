-- Phase 23: Stripe customer id and billing interval on subscriptions.

alter table public.subscriptions
  add column if not exists stripe_customer_id text,
  add column if not exists billing_interval text check (billing_interval in ('month', 'year'));

create unique index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

comment on column public.subscriptions.stripe_customer_id is
  'Stripe Customer id (cus_...) for Checkout and Billing Portal sessions.';

comment on column public.subscriptions.billing_interval is
  'month | year — mirrors the active Stripe Price interval when billing_provider = stripe.';
