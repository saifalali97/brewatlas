-- Phase 21.7: Review moderation dashboard indexes and helpful-vote guard.

create index if not exists recipe_reviews_moderation_created_idx
  on public.recipe_reviews (moderation_status, created_at desc);

create or replace function public.prevent_self_helpful_vote()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.recipe_reviews rr
    where rr.id = new.review_id
      and rr.user_id = new.user_id
  ) then
    raise exception 'Cannot mark your own review as helpful';
  end if;

  return new;
end;
$$;

drop trigger if exists recipe_review_helpful_votes_prevent_self on public.recipe_review_helpful_votes;

create trigger recipe_review_helpful_votes_prevent_self
  before insert on public.recipe_review_helpful_votes
  for each row
  execute function public.prevent_self_helpful_vote();
