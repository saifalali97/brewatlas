-- Additive Gulf directory roasters (mirror: lib/data/directory/seeds/gulf-roasters.ts).
-- Idempotent upsert by slug. Safe when 20260809020000 already applied.

with seed_names (name, slug) as (
  values
  ('Absolute Coffee', 'absolute-coffee'),
  ('South Roastery', 'south-roastery'),
  ('Trivali Roastery', 'trivali-roastery'),
  ('Black Knight Roastery', 'black-knight-roastery'),
  ('Black Horse Roastery', 'black-horse-roastery'),
  ('Ananas Roastery', 'ananas-roastery'),
  ('Kiffa Roastery', 'kiffa-roastery'),
  ('C&B Roastery', 'c-and-b-roastery')
),
freed as (
  update public.roasters as occupied
  set
    slug = occupied.slug || '-pre-gulf-' || substr(occupied.id::text, 1, 8),
    updated_at = now()
  from seed_names
  where occupied.slug = seed_names.slug
    and occupied.name is distinct from seed_names.name
  returning occupied.id
)
update public.roasters as existing
set
  slug = seed_names.slug,
  updated_at = now()
from seed_names
where existing.name = seed_names.name
  and existing.slug is distinct from seed_names.slug;

insert into public.roasters (
  name,
  slug,
  country,
  emirate,
  city,
  website,
  instagram,
  description,
  specialty,
  founded_year,
  featured,
  is_uae,
  published,
  verified,
  logo_url,
  banner_image_url
)
values
  (
    'Absolute Coffee',
    'absolute-coffee',
    'United Arab Emirates',
    'Dubai',
    'Dubai',
    'https://absolute.coffee',
    'https://instagram.com/absolutecoffeeroasters',
    'UAE specialty coffee roaster focused on small-batch roasting and fruit-forward, co-fermented specialty lots, with retail shipping across the United Arab Emirates.',
    'Small-batch exotic & co-fermented lots',
    null,
    false,
    true,
    true,
    true,
    null,
    '/images/gulf-heritage/countries/uae.webp'
  ),
  (
    'South Roastery',
    'south-roastery',
    'United Arab Emirates',
    'Sharjah',
    'Sharjah',
    'https://southcoffee.ae',
    'https://instagram.com/south_roastery',
    'Sharjah specialty coffee roastery founded in 2022, roasting locally for wholesale and retail, with barista training and cupping programs through South Academy.',
    'Wholesale roasting & South Academy',
    2022,
    false,
    true,
    true,
    true,
    null,
    '/images/gulf-heritage/countries/uae.webp'
  ),
  (
    'Trivali Roastery',
    'trivali-roastery',
    'Saudi Arabia',
    null,
    'Arar',
    'https://trivali.sa',
    'https://instagram.com/tri.vali',
    'Saudi specialty coffee roastery roasting distinctive single-origin and experimental lots for retail and café customers across the Kingdom.',
    'Fruit-forward specialty lots',
    null,
    false,
    false,
    true,
    true,
    null,
    '/images/gulf-heritage/countries/saudi-arabia.webp'
  ),
  (
    'Black Knight Roastery',
    'black-knight-roastery',
    'Saudi Arabia',
    null,
    'Al Khobar',
    'https://b-k.coffee',
    'https://instagram.com/bk.coffee',
    'Al Khobar specialty coffee brand roasting premium international origins and Saudi coffee lots for retail, drip, and café channels across the Kingdom and GCC.',
    'Premium specialty & Saudi coffee',
    null,
    false,
    false,
    true,
    true,
    null,
    '/images/gulf-heritage/countries/saudi-arabia.webp'
  ),
  (
    'Black Horse Roastery',
    'black-horse-roastery',
    'Saudi Arabia',
    null,
    'Al Khobar',
    'https://blackhorse.sa',
    'https://instagram.com/BLACKHORSE_KSA',
    'Al Khobar specialty coffee roastery and café program roasting single-origin lots and house blends for retail and hospitality customers in Saudi Arabia.',
    'Specialty roasting & café program',
    null,
    false,
    false,
    true,
    true,
    null,
    '/images/gulf-heritage/countries/saudi-arabia.webp'
  ),
  (
    'Ananas Roastery',
    'ananas-roastery',
    'Saudi Arabia',
    null,
    'Dammam',
    'https://ananasroastery.com',
    'https://instagram.com/ananas_roastery',
    'Dammam specialty coffee roastery founded in 2021, roasting a wide range of approachable specialty lots and blends for retail customers across Saudi Arabia.',
    'Accessible specialty roasting',
    2021,
    false,
    false,
    true,
    true,
    null,
    '/images/gulf-heritage/countries/saudi-arabia.webp'
  ),
  (
    'Kiffa Roastery',
    'kiffa-roastery',
    'Saudi Arabia',
    null,
    'Medina',
    'https://kiffa.sa',
    'https://instagram.com/kiffa.sa',
    'Medina specialty coffee roastery roasting international origins and Saudi coffee, with retail beans, café service, and brewing accessories for home and hospitality customers.',
    'Saudi-made specialty roasting',
    null,
    false,
    false,
    true,
    true,
    null,
    '/images/gulf-heritage/countries/saudi-arabia.webp'
  ),
  (
    'C&B Roastery',
    'c-and-b-roastery',
    'Saudi Arabia',
    null,
    'Tabuk',
    'https://cup8beans.com',
    'https://instagram.com/cup8beans',
    'Tabuk specialty coffee café and roastery (Cup & Beans) selecting global and Saudi origins to roast for café service, retail beans, and franchise partners across the Kingdom.',
    'Café roasting & Saudi origins',
    null,
    false,
    false,
    true,
    true,
    null,
    '/images/gulf-heritage/countries/saudi-arabia.webp'
  )
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  emirate = excluded.emirate,
  city = excluded.city,
  website = excluded.website,
  instagram = excluded.instagram,
  description = excluded.description,
  specialty = excluded.specialty,
  founded_year = excluded.founded_year,
  featured = excluded.featured,
  is_uae = excluded.is_uae,
  published = excluded.published,
  verified = excluded.verified,
  logo_url = excluded.logo_url,
  banner_image_url = excluded.banner_image_url,
  updated_at = now();

-- Backfill country_id from legacy text country.
update public.roasters r
set country_id = c.id
from public.countries c
where r.slug in (
  'absolute-coffee',
  'south-roastery',
  'trivali-roastery',
  'black-knight-roastery',
  'black-horse-roastery',
  'ananas-roastery',
  'kiffa-roastery',
  'c-and-b-roastery'
)
  and r.country is not null
  and r.country = c.name
  and (r.country_id is distinct from c.id);

-- Seed / refresh cities referenced by the new rows.
insert into public.cities (country_id, name, slug)
select
  c.id,
  r.city,
  trim(both '-' from lower(regexp_replace(trim(r.city), '[^a-zA-Z0-9]+', '-', 'g')))
from public.countries c
join public.roasters r on r.country_id = c.id
where r.slug in (
  'absolute-coffee',
  'south-roastery',
  'trivali-roastery',
  'black-knight-roastery',
  'black-horse-roastery',
  'ananas-roastery',
  'kiffa-roastery',
  'c-and-b-roastery'
)
  and r.city is not null
  and trim(r.city) <> ''
group by c.id, r.city
on conflict (country_id, slug) do nothing;

update public.roasters r
set city_id = ci.id
from public.cities ci
where r.slug in (
  'absolute-coffee',
  'south-roastery',
  'trivali-roastery',
  'black-knight-roastery',
  'black-horse-roastery',
  'ananas-roastery',
  'kiffa-roastery',
  'c-and-b-roastery'
)
  and r.country_id = ci.country_id
  and r.city is not null
  and r.city = ci.name
  and (r.city_id is distinct from ci.id);
