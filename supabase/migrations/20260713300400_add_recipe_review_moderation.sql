-- Phase 20.6: moderation columns on recipe_reviews. Prepares hidden/flagged
-- states for a future admin dashboard without building one now.

alter table public.recipe_reviews
  add column moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'hidden', 'flagged')),
  add column flagged_at timestamptz,
  add column flag_reason text;

comment on column public.recipe_reviews.moderation_status is
  'Moderation state: visible (public), hidden (suppressed), flagged (reported, pending review).';
comment on column public.recipe_reviews.flagged_at is
  'When the review was flagged for moderation.';
comment on column public.recipe_reviews.flag_reason is
  'Optional reason supplied when a review was flagged.';

create index recipe_reviews_recipe_moderation_idx
  on public.recipe_reviews (recipe_id, moderation_status);

-- Public readers see visible reviews, their own reviews (any status), or all if admin.
drop policy if exists "Recipe reviews are publicly viewable" on public.recipe_reviews;

create policy "Recipe reviews are publicly viewable"
  on public.recipe_reviews for select
  using (
    moderation_status = 'visible'
    or auth.uid() = user_id
    or public.is_admin()
  );

-- Rating summary excludes hidden and flagged reviews from public aggregates.
create or replace view public.recipe_rating_summary as
select
  recipe_id,
  count(*)::bigint as review_count,
  round(avg(rating)::numeric, 2) as average_rating
from public.recipe_reviews
where moderation_status = 'visible'
group by recipe_id;

comment on view public.recipe_rating_summary is
  'Per-recipe review count and average rating from publicly visible reviews only.';
