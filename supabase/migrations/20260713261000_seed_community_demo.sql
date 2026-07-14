-- Seeds the badge catalog (global, always run) and realistic Coffee
-- Community demo activity for demo@brewatlas.app: profile favorites,
-- likes, saves, ratings/reviews, then recomputes stats and evaluates
-- badges so the account isn't a blank slate on first load.

insert into public.badges (key, name, description, criteria_description, icon, sort_order) values
  ('first_brew', 'First Brew', 'Logged your very first brew session.', 'Log at least 1 brew in Brewing History.', 'coffee', 1),
  ('v60_master', 'V60 Master', 'A dedicated V60 pour-over specialist.', 'Log 10+ brews on a V60 device.', 'droplet', 2),
  ('espresso_expert', 'Espresso Expert', 'Pulled shot after shot with precision.', 'Log 10+ brews using the Espresso method.', 'flame', 3),
  ('xbloom_owner', 'xBloom Owner', 'Part of the xBloom smart brewing family.', 'Own an xBloom device (profile or coffee setup).', 'cpu', 4),
  ('coffee_scientist', 'Coffee Scientist', 'Dialing in extraction with real data.', 'Publish 3+ recipes with measured TDS/extraction.', 'flask', 5),
  ('uae_coffee_explorer', 'UAE Coffee Explorer', 'Explored the roots of Arabian coffee culture.', 'Brew a recipe made with a Yemeni-origin coffee.', 'compass', 6),
  ('origin_collector', 'Origin Collector', 'A well-traveled cup, one origin at a time.', 'Brew coffees from 5+ distinct origins.', 'globe', 7),
  ('recipe_creator', 'Recipe Creator', 'Shared a recipe with the community.', 'Publish at least 1 recipe.', 'edit-3', 8),
  ('community_helper', 'Community Helper', 'Your reviews genuinely help other brewers.', 'Receive 5+ helpful votes on your reviews.', 'heart-handshake', 9),
  ('coffee_legend', 'Coffee Legend', 'A true pillar of the BrewAtlas community.', '50+ brews, 5+ published recipes, and 10+ followers.', 'trophy', 10)
on conflict (key) do nothing;

do $$
declare
  demo_user_id uuid;
  liked_recipe_ids uuid[];
  reviewed_recipe record;
begin
  select id into demo_user_id
  from auth.users
  where email = 'demo@brewatlas.app'
  limit 1;

  if demo_user_id is null then
    raise notice 'demo@brewatlas.app not found — skipping community demo seed';
    return;
  end if;

  -- Public profile favorites: reuse whatever the demo account already put
  -- in its coffee setup / taste profile so the public profile stays
  -- consistent with the private "Personal Experience" data.
  update public.profiles
  set
    owns_xbloom = true,
    favorite_origin_id = coalesce(
      favorite_origin_id,
      (select origin_id from public.coffees where name = 'Yirgacheffe Kochere' limit 1)
    ),
    favorite_coffee_id = coalesce(
      favorite_coffee_id,
      (select id from public.coffees where name = 'Yirgacheffe Kochere' limit 1)
    ),
    favorite_roaster_id = coalesce(
      favorite_roaster_id,
      (select id from public.roasters where name = 'La Cabra' limit 1)
    ),
    favorite_grinder_id = coalesce(
      favorite_grinder_id,
      (select id from public.grinders where name = 'Comandante C40' limit 1)
    )
  where id = demo_user_id;

  -- Like every recipe the demo account marked as a favorite brew session.
  select array_agg(distinct recipe_id) into liked_recipe_ids
  from public.user_brew_logs
  where user_id = demo_user_id and is_favorite = true and recipe_id is not null;

  if liked_recipe_ids is not null then
    insert into public.recipe_likes (user_id, recipe_id)
    select demo_user_id, r_id
    from unnest(liked_recipe_ids) as r_id
    on conflict (user_id, recipe_id) do nothing;
  end if;

  -- Save (favorite) a couple of well-rated brews for later, reusing the
  -- existing favorites table.
  insert into public.favorites (user_id, recipe_id)
  select demo_user_id, recipe_id
  from public.user_brew_logs
  where user_id = demo_user_id and rating = 5 and recipe_id is not null
  on conflict (user_id, recipe_id) do nothing;

  -- Turn a handful of rated brew sessions into public ratings/reviews.
  for reviewed_recipe in
    select recipe_id, rating, notes
    from public.user_brew_logs
    where user_id = demo_user_id and recipe_id is not null and notes is not null
    order by brewed_at
  loop
    insert into public.recipe_reviews (recipe_id, user_id, rating, review_text)
    values (reviewed_recipe.recipe_id, demo_user_id, reviewed_recipe.rating, reviewed_recipe.notes)
    on conflict (recipe_id, user_id) do nothing;
  end loop;

  -- Activity feed: surface the most recent brews/reviews so the feed
  -- isn't empty for the only seeded account.
  insert into public.user_activities (user_id, activity_type, recipe_id, created_at)
  select demo_user_id, 'brewed_recipe', recipe_id, brewed_at
  from public.user_brew_logs
  where user_id = demo_user_id and recipe_id is not null
  order by brewed_at desc
  limit 5;

  insert into public.user_activities (user_id, activity_type, recipe_id)
  select demo_user_id, 'reviewed_recipe', recipe_id
  from public.recipe_reviews
  where user_id = demo_user_id;

  -- Recompute public stats and award any badges the seeded activity
  -- above now qualifies the account for (e.g. First Brew, xBloom Owner,
  -- UAE Coffee Explorer if a Yemeni-origin coffee was brewed).
  perform public.refresh_user_community_stats(demo_user_id);
  perform public.evaluate_and_award_badges(demo_user_id);
end $$;
