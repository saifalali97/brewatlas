-- Expands the device catalog from 8 to 25 real brewing devices covering
-- pour-over, immersion, espresso, and cold brew equipment.

insert into public.devices (name, slug, manufacturer) values
  ('Kalita Wave 185', 'kalita-wave-185', 'Kalita'),
  ('Origami Dripper', 'origami-dripper', 'Origami'),
  ('Clever Dripper', 'clever-dripper', 'Abid'),
  ('Orea V3 Brewer', 'orea-v3-brewer', 'Orea'),
  ('April Brewer', 'april-brewer', 'April'),
  ('Fellow Stagg [X] Dripper', 'fellow-stagg-x-dripper', 'Fellow'),
  ('Hario Switch', 'hario-switch', 'Hario'),
  ('Beehouse Ceramic Dripper', 'beehouse-ceramic-dripper', 'Beehouse'),
  ('Bonavita Immersion Dripper', 'bonavita-immersion-dripper', 'Bonavita'),
  ('Melodrip Attachment', 'melodrip-attachment', 'Melodrip'),
  ('Timemore Crystal Eye', 'timemore-crystal-eye', 'Timemore'),
  ('Cafec Flower Dripper', 'cafec-flower-dripper', 'Cafec'),
  ('Cold Brew Tower', 'cold-brew-tower', 'Yama'),
  ('Toddy Cold Brew System', 'toddy-cold-brew-system', 'Toddy'),
  ('La Marzocco Linea Mini', 'la-marzocco-linea-mini', 'La Marzocco'),
  ('Flair Espresso Maker', 'flair-espresso-maker', 'Flair'),
  ('Wacaco Nanopresso', 'wacaco-nanopresso', 'Wacaco')
on conflict (slug) do nothing;
