-- Adds the remaining origin countries requested for the seed catalog
-- (Ethiopia, Colombia, Kenya, Guatemala, Panama, and Indonesia already
-- exist from the original lookup seed).

insert into public.origins (country, region, description) values
  ('Yemen', 'Haraz & Bani Matar', 'Ancient terraced mountain plots farmed with heirloom Yemeni varieties and sun-dried on rooftops.'),
  ('Brazil', 'Sul de Minas & Mogiana', 'Rolling, low-altitude fazendas producing mostly natural and pulped-natural lots at scale.'),
  ('Rwanda', 'Nyamasheke & Huye', 'High-altitude lakeside hills known for meticulously washed, fully-washed Bourbon lots.'),
  ('Costa Rica', 'Tarrazú & West Valley', 'Volcanic soil micro-mills experimenting with honey and black-honey processing.'),
  ('El Salvador', 'Santa Ana & Chalatenango', 'Shade-grown Bourbon and Pacas farms on the slopes of the Santa Ana and Apaneca volcanic range.')
on conflict (country, region) do nothing;
