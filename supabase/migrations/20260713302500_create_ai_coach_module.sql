-- BrewAtlas AI Coach Module: conversations, messages, brew sessions,
-- preferences, daily usage, and global settings.

-- Global AI Coach settings (admin-controlled feature flag).
create table public.ai_coach_settings (
  id uuid primary key default gen_random_uuid(),
  is_enabled boolean not null default true,
  free_daily_limit integer not null default 5,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.ai_coach_settings is
  'Singleton-style global AI Coach configuration. Admins can disable AI globally or adjust free-tier daily limits.';

insert into public.ai_coach_settings (is_enabled, free_daily_limit) values (true, 5);

-- User brewing preferences for personalization.
create table public.ai_coach_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  favorite_brewer text,
  favorite_grinder text,
  favorite_roast text,
  favorite_origin text,
  favorite_ratio text,
  preferred_language text not null default 'en',
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  updated_at timestamptz not null default now()
);

comment on table public.ai_coach_preferences is
  'Per-user AI Coach personalization: equipment, taste, and language preferences.';

-- Conversations (chat threads).
create table public.ai_coach_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'New conversation',
  mode text not null default 'chat' check (mode in ('chat', 'brew_doctor', 'guided_brew', 'recipe_generator', 'knowledge', 'analyzer')),
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ai_coach_conversations is
  'AI Coach conversation threads. Each thread belongs to one user and can be pinned, favorited, or renamed.';

create index ai_coach_conversations_user_updated_idx on public.ai_coach_conversations (user_id, updated_at desc);
create index ai_coach_conversations_user_pinned_idx on public.ai_coach_conversations (user_id, is_pinned desc, updated_at desc);

-- Messages within conversations.
create table public.ai_coach_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_coach_conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  feedback text check (feedback in ('like', 'dislike')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.ai_coach_messages is
  'Individual messages in an AI Coach conversation. Supports like/dislike feedback on assistant messages.';

create index ai_coach_messages_conversation_idx on public.ai_coach_messages (conversation_id, created_at asc);
create index ai_coach_messages_user_idx on public.ai_coach_messages (user_id, created_at desc);

-- Brew Memory: saved brewing sessions.
create table public.ai_coach_brew_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Untitled session',
  recipe jsonb not null default '{}'::jsonb,
  coffee text,
  grinder text,
  water text,
  temperature_c numeric(5, 2),
  rating integer check (rating between 1 and 5),
  taste_notes text,
  adjustments text,
  notes text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ai_coach_brew_sessions is
  'Saved brew sessions for Brew Memory: recipe parameters, taste notes, and adjustments.';

create index ai_coach_brew_sessions_user_idx on public.ai_coach_brew_sessions (user_id, created_at desc);
create index ai_coach_brew_sessions_favorite_idx on public.ai_coach_brew_sessions (user_id, is_favorite desc, created_at desc);

-- Daily usage tracking for rate limiting.
create table public.ai_coach_daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  usage_date date not null default current_date,
  request_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_date)
);

comment on table public.ai_coach_daily_usage is
  'Daily AI request counter per user for free-tier rate limiting.';

create index ai_coach_daily_usage_user_date_idx on public.ai_coach_daily_usage (user_id, usage_date desc);

-- Analytics events (client/server tracked).
create table public.ai_coach_analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  event_name text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.ai_coach_analytics_events is
  'AI Coach analytics: chat started, recipe generated, brew analyzed, etc.';

create index ai_coach_analytics_events_name_idx on public.ai_coach_analytics_events (event_name, created_at desc);

-- RLS policies
alter table public.ai_coach_settings enable row level security;
alter table public.ai_coach_preferences enable row level security;
alter table public.ai_coach_conversations enable row level security;
alter table public.ai_coach_messages enable row level security;
alter table public.ai_coach_brew_sessions enable row level security;
alter table public.ai_coach_daily_usage enable row level security;
alter table public.ai_coach_analytics_events enable row level security;

-- Settings: anyone can read (to check if AI is enabled), admins can update.
create policy "Anyone can read AI Coach settings"
  on public.ai_coach_settings for select
  using (true);

create policy "Admins can update AI Coach settings"
  on public.ai_coach_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- Preferences: user owns their row.
create policy "Users can manage their AI Coach preferences"
  on public.ai_coach_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all AI Coach preferences"
  on public.ai_coach_preferences for all
  using (public.is_admin())
  with check (public.is_admin());

-- Conversations
create policy "Users can manage their conversations"
  on public.ai_coach_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all conversations"
  on public.ai_coach_conversations for all
  using (public.is_admin())
  with check (public.is_admin());

-- Messages
create policy "Users can manage their messages"
  on public.ai_coach_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all messages"
  on public.ai_coach_messages for all
  using (public.is_admin())
  with check (public.is_admin());

-- Brew sessions
create policy "Users can manage their brew sessions"
  on public.ai_coach_brew_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all brew sessions"
  on public.ai_coach_brew_sessions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Daily usage
create policy "Users can read their daily usage"
  on public.ai_coach_daily_usage for select
  using (auth.uid() = user_id);

create policy "Users can insert their daily usage"
  on public.ai_coach_daily_usage for insert
  with check (auth.uid() = user_id);

create policy "Users can update their daily usage"
  on public.ai_coach_daily_usage for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all daily usage"
  on public.ai_coach_daily_usage for all
  using (public.is_admin())
  with check (public.is_admin());

-- Analytics: users can insert their own events, admins can read all.
create policy "Users can insert analytics events"
  on public.ai_coach_analytics_events for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Admins can read analytics events"
  on public.ai_coach_analytics_events for select
  using (public.is_admin());

-- Update free tier: enable ai_coach with 5 requests/day limit.
update public.plan_permissions
set is_enabled = true, usage_limit = 5
where plan = 'free' and feature_key = 'ai_coach';
