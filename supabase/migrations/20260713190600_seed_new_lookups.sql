-- Seed grinders, filter types, water profiles, and tags so the expanded
-- recipe form has real options to choose from.

insert into public.grinders (name, slug, manufacturer) values
  ('Baratza Encore', 'baratza-encore', 'Baratza'),
  ('Baratza Sette 270', 'baratza-sette-270', 'Baratza'),
  ('Comandante C40', 'comandante-c40', 'Comandante'),
  ('Fellow Ode 2', 'fellow-ode-2', 'Fellow'),
  ('Niche Zero', 'niche-zero', 'Niche'),
  ('Mahlkonig EK43', 'mahlkonig-ek43', 'Mahlkonig')
on conflict (slug) do nothing;

insert into public.filter_types (name, slug) values
  ('Paper (Bleached)', 'paper-bleached'),
  ('Paper (Unbleached)', 'paper-unbleached'),
  ('Metal', 'metal'),
  ('Cloth', 'cloth')
on conflict (slug) do nothing;

insert into public.water_profiles (name, slug, description) values
  ('Third Wave Water - Classic', 'third-wave-water-classic', 'Mineral packet mixed with distilled water for balanced extraction.'),
  ('Rao''s Recipe', 'raos-recipe', 'Custom mineral blend popularized by Barista Hustle.'),
  ('Local Tap Water', 'local-tap-water', 'Untreated tap water, filtered.'),
  ('Distilled + Minerals', 'distilled-plus-minerals', 'Distilled water with hand-added mineral concentrate.')
on conflict (slug) do nothing;

insert into public.tags (name, slug) values
  ('Fruity', 'fruity'),
  ('Floral', 'floral'),
  ('Chocolate', 'chocolate'),
  ('Nutty', 'nutty'),
  ('Tea-like', 'tea-like'),
  ('Bright', 'bright'),
  ('Sweet', 'sweet'),
  ('Clean', 'clean'),
  ('Competition', 'competition'),
  ('Daily Brew', 'daily-brew')
on conflict (slug) do nothing;
