-- evaluate_and_award_badges: the single source of truth for badge
-- criteria. Kept as one SECURITY DEFINER database function (rather than
-- duplicated in application code) so every client -- web today, a future
-- mobile app tomorrow -- gets identical, consistent badge awarding by
-- calling the same RPC after a qualifying action (brew logged, recipe
-- published, review submitted, helpful vote received, user followed).
--
-- Idempotent: already-earned badges are skipped via the unique
-- (user_id, badge_id) primary key. Newly-awarded badges get an activity
-- feed entry and a notification. Returns the keys of badges newly
-- awarded in this call (empty array if none).

create or replace function public.evaluate_and_award_badges(target_user_id uuid)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  qualifying_keys text[];
  awarded_badge_id uuid;
  awarded_badge_name text;
  newly_awarded_keys text[] := array[]::text[];
begin
  select array_remove(array[
    case when exists (
        select 1 from public.user_brew_logs where user_id = target_user_id
      ) then 'first_brew' end,
    case when (
        select count(*) from public.user_brew_logs bl
        join public.devices d on d.id = bl.brewing_device_id
        where bl.user_id = target_user_id and d.name ilike '%v60%'
      ) >= 10 then 'v60_master' end,
    case when (
        select count(*) from public.user_brew_logs bl
        join public.brewing_methods bm on bm.id = bl.brewing_method_id
        where bl.user_id = target_user_id and bm.name = 'Espresso'
      ) >= 10 then 'espresso_expert' end,
    case when (
        (select owns_xbloom from public.profiles where id = target_user_id) is true
        or exists (
          select 1 from public.user_coffee_setups
          where user_id = target_user_id and xbloom_device_id is not null
        )
      ) then 'xbloom_owner' end,
    case when (
        select count(*) from public.recipes
        where author_id = target_user_id and extraction_percentage is not null
      ) >= 3 then 'coffee_scientist' end,
    case when exists (
        select 1 from public.user_brew_logs bl
        join public.recipes r on r.id = bl.recipe_id
        join public.coffees c on c.id = r.coffee_id
        join public.origins o on o.id = c.origin_id
        where bl.user_id = target_user_id and o.country = 'Yemen'
      ) then 'uae_coffee_explorer' end,
    case when (
        select count(distinct o.id) from public.user_brew_logs bl
        join public.recipes r on r.id = bl.recipe_id
        join public.coffees c on c.id = r.coffee_id
        join public.origins o on o.id = c.origin_id
        where bl.user_id = target_user_id
      ) >= 5 then 'origin_collector' end,
    case when exists (
        select 1 from public.recipes where author_id = target_user_id and published = true
      ) then 'recipe_creator' end,
    case when (
        select count(*) from public.recipe_review_helpful_votes hv
        join public.recipe_reviews rr on rr.id = hv.review_id
        where rr.user_id = target_user_id
      ) >= 5 then 'community_helper' end,
    case when (
        (select count(*) from public.user_brew_logs where user_id = target_user_id) >= 50
        and (select count(*) from public.recipes where author_id = target_user_id and published = true) >= 5
        and (select count(*) from public.user_follows where following_id = target_user_id) >= 10
      ) then 'coffee_legend' end
  ], null) into qualifying_keys;

  for awarded_badge_id, awarded_badge_name in
    insert into public.user_badges (user_id, badge_id)
    select target_user_id, b.id
    from public.badges b
    where b.key = any(qualifying_keys)
    on conflict (user_id, badge_id) do nothing
    returning badge_id, (select name from public.badges where id = badge_id)
  loop
    newly_awarded_keys := array_append(
      newly_awarded_keys,
      (select key from public.badges where id = awarded_badge_id)
    );

    insert into public.user_activities (user_id, activity_type, badge_id)
    values (target_user_id, 'earned_badge', awarded_badge_id);

    -- No actor: this is a system event about the recipient themselves,
    -- so create_notification's self-notification guard doesn't apply.
    perform public.create_notification(
      target_user_id,
      'badge_earned',
      null,
      null,
      awarded_badge_id,
      'You earned a new badge: ' || awarded_badge_name
    );
  end loop;

  return newly_awarded_keys;
end;
$$;

comment on function public.evaluate_and_award_badges(uuid) is
  'Evaluates all badge criteria for one user and awards any newly-qualified badges (idempotent). Records an activity + notification per new badge. Returns newly-awarded badge keys.';

grant execute on function public.evaluate_and_award_badges(uuid) to authenticated;
