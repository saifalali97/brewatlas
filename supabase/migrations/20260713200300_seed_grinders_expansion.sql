-- Expands the grinder catalog from 6 to 20 real hand and electric grinders.

insert into public.grinders (name, slug, manufacturer) values
  ('1Zpresso J-Max', '1zpresso-j-max', '1Zpresso'),
  ('DF64 Gen 2', 'df64-gen-2', 'DF64'),
  ('Kingrinder K6', 'kingrinder-k6', 'Kingrinder'),
  ('Timemore Sculptor 064', 'timemore-sculptor-064', 'Timemore'),
  ('Weber Workshops EG-1', 'weber-workshops-eg-1', 'Weber Workshops'),
  ('Wilfa Uniform', 'wilfa-uniform', 'Wilfa'),
  ('Baratza Vario+', 'baratza-vario-plus', 'Baratza'),
  ('Ceado E37S', 'ceado-e37s', 'Ceado'),
  ('Mazzer Mini', 'mazzer-mini', 'Mazzer'),
  ('Rancilio Rocky', 'rancilio-rocky', 'Rancilio'),
  ('Option-O Lagom Mini', 'option-o-lagom-mini', 'Option-O'),
  ('Hario Skerton Pro', 'hario-skerton-pro', 'Hario'),
  ('Porlex Mini', 'porlex-mini', 'Porlex'),
  ('Kinu M47 Classic', 'kinu-m47-classic', 'Kinu')
on conflict (slug) do nothing;
