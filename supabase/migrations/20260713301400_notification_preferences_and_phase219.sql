-- Phase 21.9: notification preferences, recipe favorites, mentions, and system broadcasts.

alter table public.user_notifications drop constraint if exists user_notifications_notification_type_check;

alter table public.user_notifications add constraint user_notifications_notification_type_check check (
  notification_type in (
    'new_follower',
    'recipe_liked',
    'recipe_favorited',
    'recipe_reviewed',
    'badge_earned',
    'recipe_published',
    'favorite_recipe_updated',
    'collection_updated',
    'review_received',
    'review_liked',
    'mention',
    'ai_recommendation',
    'subscription_reminder',
    'achievement_unlocked',
    'brew_log_reminder',
    'account',
    'system_announcement',
    'recipe_approval_pending',
    'recipe_approved',
    'recipe_rejected',
    'staff_action',
    'moderation_event',
    'team_notification',
    'admin_broadcast'
  )
);

create table if not exists public.user_notification_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  in_app jsonb not null default '{
    "social": true,
    "reviews": true,
    "content": true,
    "system": true,
    "mentions": true
  }'::jsonb,
  email jsonb not null default '{
    "social": false,
    "reviews": false,
    "content": false,
    "system": false,
    "mentions": false
  }'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.user_notification_preferences is
  'Per-user in-app and email notification toggles keyed by category (social, reviews, content, system, mentions). Email delivery is future-ready.';

alter table public.user_notification_preferences enable row level security;

create policy "Users read own notification preferences"
  on public.user_notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users update own notification preferences"
  on public.user_notification_preferences for update
  using (auth.uid() = user_id);

create policy "Users insert own notification preferences"
  on public.user_notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Admins manage notification preferences"
  on public.user_notification_preferences for all
  using (public.is_admin());

grant select, insert, update on public.user_notification_preferences to authenticated;

create or replace function public.broadcast_system_announcement(
  ann_title text,
  ann_message text,
  ann_metadata jsonb default '{}'::jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Only admins can broadcast system announcements';
  end if;

  insert into public.user_notifications (
    user_id,
    notification_type,
    message,
    title,
    metadata
  )
  select
    p.id,
    'system_announcement',
    coalesce(nullif(trim(ann_message), ''), 'A new BrewAtlas announcement is available.'),
    nullif(trim(ann_title), ''),
    coalesce(ann_metadata, '{}'::jsonb)
  from public.profiles p;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

comment on function public.broadcast_system_announcement(text, text, jsonb) is
  'Fan-out a system_announcement to every profile. Owner/admin only. Respects no per-user prefs at DB layer.';

grant execute on function public.broadcast_system_announcement(text, text, jsonb) to authenticated;
