-- Seed the lookup tables so recipe-creation forms (brewing method, device,
-- origin, roaster selects) and profile preferences have real rows to
-- reference. Mirrors the content already shown on the marketing pages
-- (data/homepage.ts) so the DB-backed and static catalogs stay consistent.
-- Idempotent: safe to re-run, and safe to run again after manual edits
-- thanks to the `on conflict do nothing` guards.

insert into public.brewing_methods (name, slug, description, icon) values
  ('V60', 'v60', 'Clarity and nuance with full control over every pour.', 'droplet'),
  ('Chemex', 'chemex', 'Clean, bright cups through a thick paper filter.', 'droplet'),
  ('Pour Over', 'pour-over', 'Clarity and nuance. Full control over every variable.', 'droplet'),
  ('Espresso', 'espresso', 'Pressure, precision, and the foundation of café culture.', 'flame'),
  ('French Press', 'french-press', 'Full-bodied immersion with rich oils and depth.', 'coffee'),
  ('Aeropress', 'aeropress', 'Versatile, fast, and endlessly experiment-friendly.', 'coffee'),
  ('Cold Brew', 'cold-brew', 'Slow extraction for smooth, low-acid refreshment.', 'snowflake'),
  ('Siphon', 'siphon', 'Theatrical vacuum brewing with exceptional clarity.', 'flask')
on conflict (slug) do nothing;

insert into public.devices (name, slug, manufacturer) values
  ('Hario V60', 'hario-v60', 'Hario'),
  ('Chemex Classic', 'chemex-classic', 'Chemex'),
  ('AeroPress', 'aeropress-device', 'AeroPress'),
  ('French Press', 'french-press-device', 'Bodum'),
  ('Moka Pot', 'moka-pot', 'Bialetti'),
  ('Siphon Brewer', 'siphon-brewer', 'Hario'),
  ('Espresso Machine', 'espresso-machine', 'La Marzocco'),
  ('Cold Brew Dripper', 'cold-brew-dripper', 'Toddy')
on conflict (slug) do nothing;

insert into public.origins (country, region, description) values
  ('Ethiopia', 'Gedeo & Sidama', 'Jasmine, bergamot, and bright stone fruit with tea-like clarity.'),
  ('Colombia', 'Huila & Cauca', 'Caramel, red apple, and gentle citrus with balanced sweetness.'),
  ('Kenya', 'Nyeri & Kirinyaga', 'Blackcurrant, tomato, and juicy acidity with syrupy body.'),
  ('Guatemala', 'Antigua & Huehuetenango', 'Dark chocolate, hazelnut, and honey sweetness with full body.'),
  ('Panama', 'Boquete & Volcán', 'Jasmine, mango, and tea-like elegance with luminous acidity.'),
  ('Indonesia', 'Sumatra & Java', 'Cedar, dark cocoa, and earthy depth with low acidity.')
on conflict (country, region) do nothing;

insert into public.roasters (name, country, website) values
  ('Onyx Coffee Lab', 'United States', 'https://onyxcoffeelab.com'),
  ('Counter Culture', 'United States', 'https://counterculturecoffee.com'),
  ('Saint Frank', 'United States', 'https://stfrankcoffee.com'),
  ('Tim Wendelboe', 'Norway', 'https://timwendelboe.no'),
  ('La Cabra', 'Denmark', 'https://lacabra.dk'),
  ('Koppi', 'Sweden', 'https://koppi.se')
on conflict (name) do nothing;
