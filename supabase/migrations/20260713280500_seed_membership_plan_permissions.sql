-- Seeds plan_permissions with the default matrix mirrored in
-- lib/membership/plans.ts (DEFAULT_PLAN_PERMISSIONS). Free gets capped
-- access to the "unlimited_*" features; Premium and Enterprise are
-- unlimited across the board.

insert into public.plan_permissions (plan, feature_key, is_enabled, usage_limit)
values
  -- free
  ('free', 'premium_recipes', false, null),
  ('free', 'ai_coach', false, null),
  ('free', 'unlimited_favorites', true, 10),
  ('free', 'unlimited_brew_logs', true, 20),
  ('free', 'advanced_analytics', false, null),
  ('free', 'recipe_collections', true, 1),
  -- premium
  ('premium', 'premium_recipes', true, null),
  ('premium', 'ai_coach', true, null),
  ('premium', 'unlimited_favorites', true, null),
  ('premium', 'unlimited_brew_logs', true, null),
  ('premium', 'advanced_analytics', true, null),
  ('premium', 'recipe_collections', true, null),
  -- enterprise
  ('enterprise', 'premium_recipes', true, null),
  ('enterprise', 'ai_coach', true, null),
  ('enterprise', 'unlimited_favorites', true, null),
  ('enterprise', 'unlimited_brew_logs', true, null),
  ('enterprise', 'advanced_analytics', true, null),
  ('enterprise', 'recipe_collections', true, null)
on conflict (plan, feature_key) do nothing;
