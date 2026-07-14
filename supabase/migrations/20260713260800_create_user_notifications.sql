-- user_notifications: a private per-user notification inbox for
-- new_follower / recipe_liked / recipe_reviewed / badge_earned events.
-- Unlike the public activity feed, notifications are strictly owner-only.
--
-- Because a notification's recipient (user_id) is *not* the person whose
-- action triggered it (the actor), a normal `with check (auth.uid() =
-- user_id)` insert policy would block legitimate writes (e.g. user A
-- following user B must insert a row for B, not A). Rather than loosen
-- the insert policy, all inserts go through create_notification(), a
-- SECURITY DEFINER function that bypasses RLS -- the same pattern used by
-- refresh_user_community_stats(). There is no client-facing insert policy.

create table public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  notification_type text not null check (
    notification_type in ('new_follower', 'recipe_liked', 'recipe_reviewed', 'badge_earned')
  ),
  actor_id uuid references public.profiles (id) on delete set null,
  recipe_id uuid references public.recipes (id) on delete set null,
  badge_id uuid references public.badges (id) on delete set null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.user_notifications is
  'Private per-user notification inbox. Rows are only ever created via create_notification(); never inserted directly by clients.';

create index user_notifications_user_id_idx on public.user_notifications (user_id, created_at desc);
create index user_notifications_user_unread_idx on public.user_notifications (user_id) where is_read = false;

alter table public.user_notifications enable row level security;

create policy "Users can view their own notifications"
  on public.user_notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark their own notifications read"
  on public.user_notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on public.user_notifications for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all notifications"
  on public.user_notifications for all
  using (public.is_admin())
  with check (public.is_admin());

-- Creates a notification for `recipient`, bypassing RLS so the caller
-- (typically a different user, e.g. whoever just followed/liked/reviewed)
-- can deliver it. Returns the new notification id, or null if the
-- recipient is the same as the actor (no self-notifications).
create or replace function public.create_notification(
  recipient uuid,
  notif_type text,
  actor uuid default null,
  related_recipe uuid default null,
  related_badge uuid default null,
  notif_message text default ''
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

  insert into public.user_notifications (user_id, notification_type, actor_id, recipe_id, badge_id, message)
  values (recipient, notif_type, actor, related_recipe, related_badge, notif_message)
  returning id into new_id;

  return new_id;
end;
$$;

comment on function public.create_notification(uuid, text, uuid, uuid, uuid, text) is
  'Delivers a notification to `recipient` on behalf of the calling (typically different) user. No-op for self-notifications.';

grant execute on function public.create_notification(uuid, text, uuid, uuid, uuid, text) to authenticated;
