-- Expands the water recipe catalog from 4 to 20 real and reference water
-- profiles used by the specialty coffee community.

insert into public.water_profiles (name, slug, description) values
  ('Barista Hustle Water', 'barista-hustle-water', 'High-precision mineral recipe targeting balanced hardness and alkalinity for even extraction.'),
  ('Lotus Water - Balanced', 'lotus-water-balanced', 'Pre-mixed mineral concentrate formulated for an all-purpose balanced cup.'),
  ('Lotus Water - Bright', 'lotus-water-bright', 'Higher-magnesium blend that emphasizes acidity and clarity.'),
  ('Lotus Water - Classic', 'lotus-water-classic', 'The original Lotus mineral blend for everyday brewing.'),
  ('Empire Blend', 'empire-blend', 'Bicarbonate-forward custom recipe for a smoother, rounder mouthfeel.'),
  ('Fellow Aquamin', 'fellow-aquamin', 'Concentrated mineral drops added to filtered water at the kettle.'),
  ('Third Wave Water - Espresso', 'third-wave-water-espresso', 'Mineral packet tuned specifically for espresso extraction and machine longevity.'),
  ('Third Wave Water - Cold Brew', 'third-wave-water-cold-brew', 'Formulated for extended cold, low-agitation extraction.'),
  ('Reverse Osmosis + Minerals', 'reverse-osmosis-plus-minerals', 'Zero-baseline RO water remineralized to SCA reference targets.'),
  ('Spring Water - Local', 'spring-water-local', 'Untreated bottled spring water used as-is.'),
  ('Cirqua Zero Concentrate', 'cirqua-zero-concentrate', 'Zero-hardness base water dosed with mineral concentrate.'),
  ('Peak Water Minerals', 'peak-water-minerals', 'Portable mineral drops designed for travel and competition brewing.'),
  ('SCA Standard Water', 'sca-standard-water', 'Water mixed to the Specialty Coffee Association reference chemistry targets.'),
  ('Aquacode Coffee Blend', 'aquacode-coffee-blend', 'Balanced calcium-to-magnesium mineral profile tuned for pour over.'),
  ('Photonic Water Blend', 'photonic-water-blend', 'High-clarity remineralized water favored for delicate light roasts.'),
  ('Filtered Tap + Pinch of Salt', 'filtered-tap-pinch-of-salt', 'Simple home remineralization trick using a pinch of salt in filtered tap water.')
on conflict (slug) do nothing;
