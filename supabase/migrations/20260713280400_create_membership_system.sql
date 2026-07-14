-- Membership and subscription system foundation:
--   subscriptions        one row per user -- the current membership state
--   subscription_history append-only audit log of plan/status transitions
--   plan_permissions     plan-level defaults for each premium feature key
--   trial_usage          records a user's one-time free trial per plan
--                         (independent of `subscriptions` so a duplicate
--                         trial can be blocked even after the subscription
--                         row is reset back to "free")
--   feature_access        per-user resolved overrides/usage counters,
--                         layered on top of `plan_permissions`
--
-- "Guest" is not stored anywhere -- it is simply the absence of an
-- authenticated user. Every signed-in user gets exactly one
-- `subscriptions` row (created lazily on first read by
-- `lib/data/membership.ts`'s `getOrCreateSubscription`), defaulting to
-- plan = 'free'.

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium', 'enterprise')),
  status text not null default 'active' check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  billing_provider text not null default 'manual' check (billing_provider in ('manual', 'stripe', 'apple_pay', 'google_pay')),
  billing_provider_ref text,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is
  'One row per user: the current membership plan/status. The single source of truth for isPremium()/hasFeature() -- see lib/membership/access.ts.';
comment on column public.subscriptions.plan is
  'free | premium | enterprise. "enterprise" is modelled now for future multi-seat/team billing (requirement 1) even though nothing assigns it yet.';
comment on column public.subscriptions.billing_provider_ref is
  'Opaque external id (e.g. a Stripe subscription id) once a real billing adapter is wired up. Always null today -- see lib/billing/billing-adapter.ts.';

create index subscriptions_plan_idx on public.subscriptions (plan);
create index subscriptions_status_idx on public.subscriptions (status);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
  on public.subscriptions
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can create their own subscription"
  on public.subscriptions
  for insert
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can update their own subscription"
  on public.subscriptions
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Admins can delete subscriptions"
  on public.subscriptions
  for delete
  using (public.is_admin());

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_updated_at();

-- subscription_history ------------------------------------------------------

create table public.subscription_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  event_type text not null check (
    event_type in (
      'trial_started', 'trial_expired', 'trial_converted',
      'plan_upgraded', 'plan_downgraded',
      'subscription_canceled', 'subscription_reactivated', 'subscription_renewed',
      'payment_failed'
    )
  ),
  from_plan text check (from_plan in ('free', 'premium', 'enterprise')),
  to_plan text check (to_plan in ('free', 'premium', 'enterprise')),
  billing_provider text check (billing_provider in ('manual', 'stripe', 'apple_pay', 'google_pay')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.subscription_history is
  'Append-only audit log of every subscription transition (trial start/expiry, upgrades, cancellations). Never updated or deleted.';

create index subscription_history_user_id_idx on public.subscription_history (user_id, created_at desc);

alter table public.subscription_history enable row level security;

create policy "Users can view their own subscription history"
  on public.subscription_history
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own subscription history"
  on public.subscription_history
  for insert
  with check (auth.uid() = user_id or public.is_admin());

-- plan_permissions ------------------------------------------------------------

create table public.plan_permissions (
  id uuid primary key default gen_random_uuid(),
  plan text not null check (plan in ('free', 'premium', 'enterprise')),
  feature_key text not null,
  is_enabled boolean not null default false,
  usage_limit integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan, feature_key)
);

comment on table public.plan_permissions is
  'Plan-level defaults for each premium feature key (e.g. (premium, ai_coach) -> enabled, unlimited). feature_key is intentionally unconstrained text -- see requirement 3, "Future Features" -- so a new feature can be introduced as data, without a migration. See lib/membership/plans.ts for the in-code mirror/fallback.';
comment on column public.plan_permissions.usage_limit is
  'null = unlimited. Non-null caps a countable feature (e.g. favorites, brew logs, collections) per user.';

create index plan_permissions_plan_idx on public.plan_permissions (plan);

alter table public.plan_permissions enable row level security;

create policy "Plan permissions are viewable by everyone"
  on public.plan_permissions
  for select
  using (true);

create policy "Admins can manage plan permissions"
  on public.plan_permissions
  for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger plan_permissions_set_updated_at
  before update on public.plan_permissions
  for each row
  execute function public.set_updated_at();

-- trial_usage -----------------------------------------------------------------

create table public.trial_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null default 'premium' check (plan in ('free', 'premium', 'enterprise')),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'converted', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan)
);

comment on table public.trial_usage is
  'Records that a user has used their one-time free trial for a given plan. Kept independent of subscriptions so "prevent duplicate trials" (requirement 2) holds even after the trial ends and subscriptions.plan is reset back to free.';

create index trial_usage_user_id_idx on public.trial_usage (user_id);

alter table public.trial_usage enable row level security;

create policy "Users can view their own trial usage"
  on public.trial_usage
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can start their own trial"
  on public.trial_usage
  for insert
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can update their own trial usage"
  on public.trial_usage
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create trigger trial_usage_set_updated_at
  before update on public.trial_usage
  for each row
  execute function public.set_updated_at();

-- feature_access ----------------------------------------------------------------

create table public.feature_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  feature_key text not null,
  is_enabled boolean not null default true,
  usage_count integer not null default 0,
  usage_limit integer,
  granted_reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, feature_key)
);

comment on table public.feature_access is
  'Per-user resolved feature grant/override, layered on top of plan_permissions -- e.g. a comped ai_coach grant on the Free plan, or a live usage_count for a capped feature like unlimited_favorites. Absence of a row means "use the plan default" (see lib/data/membership.ts''s getMembershipSummary).';

create index feature_access_user_id_idx on public.feature_access (user_id);

alter table public.feature_access enable row level security;

create policy "Users can view their own feature access"
  on public.feature_access
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can manage their own feature access"
  on public.feature_access
  for insert
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can update their own feature access"
  on public.feature_access
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Admins can delete feature access rows"
  on public.feature_access
  for delete
  using (public.is_admin());

create trigger feature_access_set_updated_at
  before update on public.feature_access
  for each row
  execute function public.set_updated_at();
