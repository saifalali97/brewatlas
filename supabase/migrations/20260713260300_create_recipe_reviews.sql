-- recipe_reviews: a user's 1-5 star rating and optional written review of a
-- recipe. One review per user per recipe (re-submitting updates it). Public
-- content, like the recipe itself -- ratings/reviews power "Highest Rated
-- Recipes" leaderboards and public recipe pages.

create table public.recipe_reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipe_reviews_recipe_user_key unique (recipe_id, user_id)
);

comment on table public.recipe_reviews is
  'One 1-5 star rating + optional written review per user per recipe. Public.';

create index recipe_reviews_recipe_id_idx on public.recipe_reviews (recipe_id);
create index recipe_reviews_user_id_idx on public.recipe_reviews (user_id);

create trigger recipe_reviews_set_updated_at
  before update on public.recipe_reviews
  for each row
  execute function public.set_updated_at();

alter table public.recipe_reviews enable row level security;

create policy "Recipe reviews are publicly viewable"
  on public.recipe_reviews for select
  using (true);

create policy "Users can review recipes as themselves"
  on public.recipe_reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.recipe_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.recipe_reviews for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all recipe reviews"
  on public.recipe_reviews for all
  using (public.is_admin())
  with check (public.is_admin());

-- recipe_review_helpful_votes: "Was this review helpful?" votes. One vote
-- per user per review. Public, same visibility as the review itself.

create table public.recipe_review_helpful_votes (
  review_id uuid not null references public.recipe_reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

comment on table public.recipe_review_helpful_votes is
  'Join table: which users marked which recipe reviews as helpful. Public.';

create index recipe_review_helpful_votes_review_id_idx on public.recipe_review_helpful_votes (review_id);

alter table public.recipe_review_helpful_votes enable row level security;

create policy "Helpful votes are publicly viewable"
  on public.recipe_review_helpful_votes for select
  using (true);

create policy "Users can mark reviews helpful as themselves"
  on public.recipe_review_helpful_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own helpful vote"
  on public.recipe_review_helpful_votes for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all helpful votes"
  on public.recipe_review_helpful_votes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Public view summarizing rating stats per recipe (avg rating, review
-- count), used by recipe pages and the "Highest Rated Recipes" leaderboard
-- without every consumer having to hand-roll the aggregation.
create view public.recipe_rating_summary as
select
  recipe_id,
  count(*)::bigint as review_count,
  round(avg(rating)::numeric, 2) as average_rating
from public.recipe_reviews
group by recipe_id;

comment on view public.recipe_rating_summary is
  'Per-recipe review count and average rating, derived from recipe_reviews.';

grant select on public.recipe_rating_summary to anon, authenticated;
