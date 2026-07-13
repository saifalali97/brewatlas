-- Expands the roaster catalog from 6 to 30 well-known specialty roasters
-- for a realistic, varied recipe library.

insert into public.roasters (name, country) values
  ('Blue Bottle Coffee', 'United States'),
  ('Stumptown Coffee Roasters', 'United States'),
  ('Intelligentsia Coffee', 'United States'),
  ('George Howell Coffee', 'United States'),
  ('Heart Coffee Roasters', 'United States'),
  ('Cafe Grumpy', 'United States'),
  ('Sey Coffee', 'United States'),
  ('Ceremony Coffee Roasters', 'United States'),
  ('PT''s Coffee Roasting', 'United States'),
  ('Methodical Coffee', 'United States'),
  ('Coffee Collective', 'Denmark'),
  ('April Coffee Roasters', 'Denmark'),
  ('Nomad Coffee', 'Spain'),
  ('Drop Coffee', 'Sweden'),
  ('Five Elephant', 'Germany'),
  ('The Barn Berlin', 'Germany'),
  ('Prufrock Coffee', 'United Kingdom'),
  ('Square Mile Coffee Roasters', 'United Kingdom'),
  ('Workshop Coffee', 'United Kingdom'),
  ('Assembly Coffee', 'United Kingdom'),
  ('Manhattan Coffee Roasters', 'Netherlands'),
  ('Rocket Bean Roastery', 'Hungary'),
  ('Morgon Coffee', 'France'),
  ('Gardelli Coffee', 'Italy')
on conflict (name) do nothing;
