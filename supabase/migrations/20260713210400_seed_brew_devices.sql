-- Seeds the initial Smart Brewing Engine device catalog.

insert into public.brew_devices (name, slug) values
  ('V60-01', 'v60-01'),
  ('V60-02', 'v60-02'),
  ('Origami', 'origami'),
  ('Kalita Wave', 'kalita-wave'),
  ('April Brewer', 'april-brewer'),
  ('Orea V4', 'orea-v4'),
  ('Switch', 'switch'),
  ('Chemex', 'chemex'),
  ('French Press', 'french-press'),
  ('AeroPress', 'aeropress')
on conflict (slug) do nothing;
