-- Phase 25: production hardening — suspension self-modification guard + Stripe webhook idempotency.

-- Prevent non-admins from clearing or setting their own suspension fields.
create or replace function public.prevent_suspension_self_modification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.suspended_at is distinct from old.suspended_at then
      new.suspended_at = old.suspended_at;
    end if;
    if new.suspension_reason is distinct from old.suspension_reason then
      new.suspension_reason = old.suspension_reason;
    end if;
  end if;
  return new;
end;
$$;

comment on function public.prevent_suspension_self_modification() is
  'Blocks non-admin profile updates from modifying suspended_at or suspension_reason.';

drop trigger if exists profiles_prevent_suspension_self_modification on public.profiles;

create trigger profiles_prevent_suspension_self_modification
  before update on public.profiles
  for each row
  execute function public.prevent_suspension_self_modification();

-- Idempotency store for Stripe webhook events (service role only).
create table if not exists public.stripe_webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

comment on table public.stripe_webhook_events is
  'Processed Stripe event IDs for webhook idempotency. Written by the service role only.';

create index if not exists stripe_webhook_events_processed_at_idx
  on public.stripe_webhook_events (processed_at desc);

alter table public.stripe_webhook_events enable row level security;

revoke all on public.stripe_webhook_events from anon, authenticated;
grant select, insert, delete on public.stripe_webhook_events to service_role;
