-- Seeds 50 specific coffee lots (5 each across the 10 requested origin
-- countries), linked to a roaster and origin. These are the "coffee beans"
-- that the seeded recipes below brew with.

insert into public.coffees (roaster_id, origin_id, name, farm, producer, variety, process, altitude, roast_level, roast_date)
select r.id, o.id, v.name, v.farm, v.producer, v.variety, v.process, v.altitude, v.roast_level, v.roast_date::date
from (
  values
    -- Ethiopia
    ('Onyx Coffee Lab', 'Ethiopia', 'Gedeb Washing Station', 'Gedeb Cooperative', 'Gedeb Farmers Cooperative', 'Heirloom', 'Washed', '1,900-2,100m', 'Light Roast', '2026-04-15'),
    ('Counter Culture', 'Ethiopia', 'Konga Natural', 'Konga Forest', 'Konga Smallholders', 'Heirloom', 'Natural', '2,000m', 'Light Roast', '2026-04-28'),
    ('Saint Frank', 'Ethiopia', 'Chelbesa Reserve', 'Chelbesa Estate', 'Chelbesa Farm', 'Heirloom', 'Washed', '2,200m', 'Light Roast', '2026-05-06'),
    ('Tim Wendelboe', 'Ethiopia', 'Guji Highland Honey', 'Guji Highlands', 'Guji Smallholder Union', 'Heirloom', 'Honey', '1,950m', 'Light-Medium', '2026-05-14'),
    ('La Cabra', 'Ethiopia', 'Yirgacheffe Kochere', 'Kochere Cooperative', 'Kochere Farmers', 'Heirloom', 'Washed', '2,050m', 'Light Roast', '2026-05-22'),
    -- Yemen
    ('Koppi', 'Yemen', 'Haraz Mountain Heirloom', 'Haraz Terraces', 'Haraz Smallholders', 'Yemeni Udaini', 'Natural', '2,000-2,300m', 'Medium Roast', '2026-05-30'),
    ('Blue Bottle Coffee', 'Yemen', 'Bani Matar Sundried', 'Bani Matar Terraces', 'Bani Matar Cooperative', 'Dawairi', 'Natural', '2,100m', 'Medium Roast', '2026-06-07'),
    ('Stumptown Coffee Roasters', 'Yemen', 'Al Haymah Heritage', 'Al Haymah Terraces', 'Al Haymah Growers', 'Yemeni Tuffahi', 'Natural', '1,900m', 'Medium-Dark', '2026-06-15'),
    ('Intelligentsia Coffee', 'Yemen', 'Mokha Port Reserve', 'Sana''a Highlands', 'Mokha Trading Collective', 'Yemeni Udaini', 'Natural', '2,200m', 'Medium Roast', '2026-06-23'),
    ('George Howell Coffee', 'Yemen', 'Sana''a Ancient Terrace', 'Sana''a Terraces', 'Sana''a Smallholders', 'Dawairi', 'Natural', '2,150m', 'Medium Roast', '2026-07-01'),
    -- Colombia
    ('Heart Coffee Roasters', 'Colombia', 'Huila Pink Bourbon', 'Finca El Mirador', 'Carlos Imbachí', 'Pink Bourbon', 'Washed', '1,750m', 'Light-Medium', '2026-04-15'),
    ('Cafe Grumpy', 'Colombia', 'Cauca Caturra Lot', 'Finca La Palma', 'Maria Fernanda Ortiz', 'Caturra', 'Washed', '1,800m', 'Medium Roast', '2026-04-28'),
    ('Sey Coffee', 'Colombia', 'Tolima Geisha Micro-lot', 'Finca Villa Nueva', 'Jhonny Farfán', 'Gesha', 'Honey', '1,900m', 'Light Roast', '2026-05-06'),
    ('Ceremony Coffee Roasters', 'Colombia', 'Nariño Castillo Reserve', 'Finca Buena Vista', 'Nariño Growers Group', 'Castillo', 'Washed', '2,000m', 'Medium Roast', '2026-05-14'),
    ('PT''s Coffee Roasting', 'Colombia', 'Huila Anaerobic Natural', 'Finca Potosí', 'Edwin Noreña', 'Colombia', 'Anaerobic Natural', '1,700m', 'Medium Roast', '2026-05-22'),
    -- Panama
    ('Methodical Coffee', 'Panama', 'Boquete Geisha Lot 1', 'Finca La Esmeralda', 'Price Peterson', 'Gesha', 'Washed', '1,600-1,800m', 'Light Roast', '2026-05-30'),
    ('Coffee Collective', 'Panama', 'Volcán Catuai Reserve', 'Finca Deborah', 'Ninety Plus Estates', 'Catuai', 'Honey', '1,700m', 'Light-Medium', '2026-06-07'),
    ('April Coffee Roasters', 'Panama', 'Auromar Geisha Natural', 'Finca Auromar', 'Wilford Lamastus', 'Gesha', 'Natural', '1,750m', 'Light Roast', '2026-06-15'),
    ('Nomad Coffee', 'Panama', 'Boquete Caturra Washed', 'Finca Kotowa', 'Kotowa Estate', 'Caturra', 'Washed', '1,500m', 'Medium Roast', '2026-06-23'),
    ('Drop Coffee', 'Panama', 'Elida Estate Geisha', 'Elida Estate', 'Elida Estate Family', 'Gesha', 'Washed', '1,800m', 'Light Roast', '2026-07-01'),
    -- Kenya
    ('Five Elephant', 'Kenya', 'Nyeri AA Karatina', 'Karatina Cooperative', 'Karatina Farmers Society', 'SL28 & SL34', 'Washed', '1,750m', 'Light-Medium', '2026-04-15'),
    ('The Barn Berlin', 'Kenya', 'Kirinyaga Peaberry', 'Kagumo Estate', 'Kagumo Farmers Cooperative', 'SL28', 'Washed', '1,700m', 'Light Roast', '2026-04-28'),
    ('Prufrock Coffee', 'Kenya', 'Kiambu Batian Lot', 'Gatomboya Factory', 'Gatomboya Farmers', 'Batian', 'Washed', '1,800m', 'Medium Roast', '2026-05-06'),
    ('Square Mile Coffee Roasters', 'Kenya', 'Nyeri AB Double Fermentation', 'Tegu Factory', 'Tegu Farmers Cooperative', 'SL34', 'Double Fermented Washed', '1,750m', 'Light Roast', '2026-05-14'),
    ('Workshop Coffee', 'Kenya', 'Kirinyaga Natural Reserve', 'Rungeto Estate', 'Rungeto Farmers', 'SL28 & Ruiru 11', 'Natural', '1,650m', 'Medium Roast', '2026-05-22'),
    -- Brazil
    ('Assembly Coffee', 'Brazil', 'Fazenda Sertãozinho Yellow Bourbon', 'Fazenda Sertãozinho', 'Silva Family', 'Yellow Bourbon', 'Natural', '1,100m', 'Medium Roast', '2026-05-30'),
    ('Manhattan Coffee Roasters', 'Brazil', 'Cerrado Mineiro Catuai', 'Fazenda Santa Inês', 'Cerrado Growers Cooperative', 'Catuai', 'Pulped Natural', '1,000m', 'Medium-Dark', '2026-06-07'),
    ('Rocket Bean Roastery', 'Brazil', 'Mogiana Red Catuai Reserve', 'Fazenda Rainha', 'Rainha Estate', 'Red Catuai', 'Natural', '1,050m', 'Medium Roast', '2026-06-15'),
    ('Morgon Coffee', 'Brazil', 'Carmo de Minas Mundo Novo', 'Sítio Fortaleza', 'José Renato Silva', 'Mundo Novo', 'Washed', '1,200m', 'Medium Roast', '2026-06-23'),
    ('Gardelli Coffee', 'Brazil', 'Sul de Minas Honey Yellow Bourbon', 'Fazenda Boa Vista', 'Boa Vista Estate', 'Yellow Bourbon', 'Honey', '1,150m', 'Medium Roast', '2026-07-01'),
    -- Rwanda
    ('Onyx Coffee Lab', 'Rwanda', 'Nyamasheke Bourbon Washed', 'Nyamasheke Washing Station', 'Nyamasheke Cooperative', 'Red Bourbon', 'Washed', '1,700-1,900m', 'Light-Medium', '2026-04-15'),
    ('Counter Culture', 'Rwanda', 'Huye Mountain Reserve', 'Huye Mountain Estate', 'Huye Mountain Coffee', 'Red Bourbon', 'Washed', '1,800m', 'Light Roast', '2026-04-28'),
    ('Saint Frank', 'Rwanda', 'Lake Kivu Sundried', 'Kivu Terraces', 'Kivu Smallholders', 'Red Bourbon', 'Natural', '1,750m', 'Medium Roast', '2026-05-06'),
    ('Tim Wendelboe', 'Rwanda', 'Gisenyi Cooperative Lot', 'Gisenyi Washing Station', 'Gisenyi Farmers Cooperative', 'Bourbon', 'Washed', '1,850m', 'Light Roast', '2026-05-14'),
    ('La Cabra', 'Rwanda', 'Rwanda Honey Process Micro-lot', 'Musasa Hills', 'Musasa Farmers', 'Red Bourbon', 'Honey', '1,900m', 'Light Roast', '2026-05-22'),
    -- Costa Rica
    ('Koppi', 'Costa Rica', 'Tarrazú SHB Reserve', 'Finca La Candelilla', 'La Candelilla Estate', 'Caturra', 'Washed', '1,700m', 'Medium Roast', '2026-05-30'),
    ('Blue Bottle Coffee', 'Costa Rica', 'West Valley Honey Villa Sarchí', 'Finca Rosa Blanca', 'Rosa Blanca Estate', 'Villa Sarchí', 'Honey', '1,500m', 'Medium Roast', '2026-06-07'),
    ('Stumptown Coffee Roasters', 'Costa Rica', 'Los Santos Black Honey', 'Finca Palmilera', 'Palmilera Family', 'Catuai', 'Black Honey', '1,650m', 'Medium Roast', '2026-06-15'),
    ('Intelligentsia Coffee', 'Costa Rica', 'Naranjo Natural Micro-lot', 'Finca San Diego', 'San Diego Estate', 'Catuai', 'Natural', '1,400m', 'Medium-Dark', '2026-06-23'),
    ('George Howell Coffee', 'Costa Rica', 'Tarrazú Anaerobic Caturra', 'Finca La Pastora', 'La Pastora Estate', 'Caturra', 'Anaerobic Natural', '1,750m', 'Light-Medium', '2026-07-01'),
    -- Guatemala
    ('Heart Coffee Roasters', 'Guatemala', 'Antigua Volcán de Agua', 'Finca El Injerto', 'Arturo Aguirre', 'Bourbon & Caturra', 'Washed', '1,500m', 'Medium Roast', '2026-04-15'),
    ('Cafe Grumpy', 'Guatemala', 'Huehuetenango Highland Bourbon', 'Finca La Soledad', 'La Soledad Estate', 'Bourbon', 'Washed', '1,800m', 'Light-Medium', '2026-04-28'),
    ('Sey Coffee', 'Guatemala', 'Acatenango Shade Grown', 'Finca Los Volcanes', 'Los Volcanes Family', 'Caturra', 'Washed', '1,650m', 'Medium Roast', '2026-05-06'),
    ('Ceremony Coffee Roasters', 'Guatemala', 'Atitlán Lakeside Reserve', 'Finca San Rafael', 'San Rafael Estate', 'Catuai', 'Honey', '1,550m', 'Medium Roast', '2026-05-14'),
    ('PT''s Coffee Roasting', 'Guatemala', 'Fraijanes Plateau Pacamara', 'Finca Vista Hermosa', 'Vista Hermosa Estate', 'Pacamara', 'Natural', '1,600m', 'Medium Roast', '2026-05-22'),
    -- El Salvador
    ('Methodical Coffee', 'El Salvador', 'Santa Ana Bourbon Reserve', 'Finca Las Nubes', 'Las Nubes Estate', 'Bourbon', 'Washed', '1,500m', 'Medium Roast', '2026-05-30'),
    ('Coffee Collective', 'El Salvador', 'Apaneca Pacamara Lot', 'Finca Kilimanjaro', 'Kilimanjaro Estate', 'Pacamara', 'Natural', '1,450m', 'Medium Roast', '2026-06-07'),
    ('April Coffee Roasters', 'El Salvador', 'Chalatenango Honey Pacas', 'Finca El Carmen', 'El Carmen Family', 'Pacas', 'Honey', '1,400m', 'Medium Roast', '2026-06-15'),
    ('Nomad Coffee', 'El Salvador', 'Ilamatepec Volcanic Bourbon', 'Finca Montecristo', 'Montecristo Estate', 'Bourbon', 'Washed', '1,550m', 'Medium Roast', '2026-06-23'),
    ('Drop Coffee', 'El Salvador', 'Tacuba Anaerobic Pacas', 'Finca San Rafael', 'San Rafael Cooperative', 'Pacas', 'Anaerobic Natural', '1,350m', 'Medium-Dark', '2026-07-01')
) as v(roaster_name, country, name, farm, producer, variety, process, altitude, roast_level, roast_date)
join public.roasters r on r.name = v.roaster_name
join public.origins o on o.country = v.country;
