-- Phase 20.7: extend user_notifications for a scalable notification center.
-- Adds title + metadata, expands notification_type for current and future phases
-- (owner dashboard approvals, moderation, team notifications), and enables
-- Supabase Realtime delivery for live unread badges.

alter table public.user_notifications
  add column if not exists title text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

comment on column public.user_notifications.title is
  'Optional display title. When null the client resolves a localized title from notification_type + metadata.';

comment on column public.user_notifications.metadata is
  'Extensible JSON payload for deep links, approval ids, collection ids, team ids, etc.';

alter table public.user_notifications drop constraint if exists user_notifications_notification_type_check;

alter table public.user_notifications add constraint user_notifications_notification_type_check check (
  notification_type in (
    -- Social (existing)
    'new_follower',
    'recipe_liked',
    'recipe_reviewed',
    'badge_earned',
    -- Content updates
    'recipe_published',
    'favorite_recipe_updated',
    'collection_updated',
    -- Reviews
    'review_received',
    'review_liked',
    -- Recommendations & billing
    'ai_recommendation',
    'subscription_reminder',
    -- Achievements & reminders
    'achievement_unlocked',
    'brew_log_reminder',
    -- Account & system
    'account',
    'system_announcement',
    -- Future: owner dashboard / moderation (prepared, not yet emitted)
    'recipe_approval_pending',
    'recipe_approved',
    'recipe_rejected',
    'staff_action',
    'moderation_event',
    'team_notification',
    'admin_broadcast'
  )
);

create index if not exists user_notifications_user_type_idx
  on public.user_notifications (user_id, notification_type, created_at desc);

-- Realtime: safe to run repeatedly; ignores if already in publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_notifications'
  ) then
    alter publication supabase_realtime add table public.user_notifications;
  end if;
end
$$;

create or replace function public.create_notification(
  recipient uuid,
  notif_type text,
  actor uuid default null,
  related_recipe uuid default null,
  related_badge uuid default null,
  notif_message text default '',
  notif_title text default null,
  notif_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if recipient is null or (actor is not null and actor = recipient) then
    return null;
  end if;

  insert into public.user_notifications (
    user_id,
    notification_type,
    actor_id,
    recipe_id,
    badge_id,
    message,
    title,
    metadata
  )
  values (
    recipient,
    notif_type,
    actor,
    related_recipe,
    related_badge,
    notif_message,
    notif_title,
    coalesce(notif_metadata, '{}'::jsonb)
  )
  returning id into new_id;

  return new_id;
end;
$$;

comment on function public.create_notification(uuid, text, uuid, uuid, uuid, text, text, jsonb) is
  'Delivers a notification to `recipient`. No-op for self-notifications. Supports optional title and metadata for extensible inbox rendering.';

grant execute on function public.create_notification(uuid, text, uuid, uuid, uuid, text, text, jsonb) to authenticated;
