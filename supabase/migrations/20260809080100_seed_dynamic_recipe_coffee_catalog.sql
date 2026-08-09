-- Seed Dynamic Recipe System coffee catalog + official V60 recipes for newly added roasters.
-- Source: lib/data/directory/seeds/gulf-coffee-catalog.ts
-- Idempotent upserts by (roaster_id, coffee.slug) and recipes.slug.

do $$
declare
  v_roaster_id uuid;
  v_coffee_id uuid;
  v_recipe_id uuid;
  v_country_id uuid;
  v_city_id uuid;
  v_method_id uuid;
begin
  select id into v_method_id from public.brewing_methods where slug = 'v60' limit 1;

  -- absolute-coffee-watermelon-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Watermelon', 'watermelon', null, null,
    'Castillo, Caturra, Bourbon', 'Anaerobic Washed (co-fermented)', '1700-1900m', 'Light-medium',
    'Caldas', array['Watermelon','Melon','Ice cream']::text[], 'https://absolute.coffee/products/watermelon', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_s97blys97blys97b.png?v=1779270762',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Watermelon V60',
    'absolute-coffee-watermelon-v60-hot',
    'Roaster Recommended V60 for Watermelon — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_s97blys97blys97b.png?v=1779270762',
    'Intermediate',
    'Watermelon, Melon, Ice cream.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Watermelon',
    'Light-medium',
    'Caldas, Colombia',
    'Anaerobic Washed (co-fermented)',
    'Within 7–28 days',
    null,
    'Castillo, Caturra, Bourbon',
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-mango-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Mango', 'mango', null, null,
    'Yellow Bourbon', 'Double anaerobic / thermal shock', null, 'Light-medium',
    null, array['Ripe mango','Tropical','Clean sweet finish']::text[], 'https://absolute.coffee/products/mango', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_79q13o79q13o79q1.png?v=1779270815',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Mango V60',
    'absolute-coffee-mango-v60-hot',
    'Roaster Recommended V60 for Mango — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_79q13o79q13o79q1.png?v=1779270815',
    'Intermediate',
    'Ripe mango, Tropical, Clean sweet finish.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Mango',
    'Light-medium',
    'Colombia',
    'Double anaerobic / thermal shock',
    'Within 7–28 days',
    null,
    'Yellow Bourbon',
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-colombia-coconut-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Colombia Coconut', 'colombia-coconut', null, null,
    'Caturra', 'CO-Fermentation Washed', null, 'Light-medium',
    null, array['Coconut','Biscuit','Vanilla cream']::text[], 'https://absolute.coffee/products/colombia-coconut', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_7zddei7zddei7zdd.png?v=1779270089',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Colombia Coconut V60',
    'absolute-coffee-colombia-coconut-v60-hot',
    'Roaster Recommended V60 for Colombia Coconut — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_7zddei7zddei7zdd.png?v=1779270089',
    'Intermediate',
    'Coconut, Biscuit, Vanilla cream.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Colombia Coconut',
    'Light-medium',
    'Colombia',
    'CO-Fermentation Washed',
    'Within 7–28 days',
    null,
    'Caturra',
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-passion-fruit-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Passion Fruit', 'passion-fruit', null, null,
    'Caturra', 'CO-Fermentation Washed', null, 'Light-medium',
    null, array['Passion fruit','Peach','Mango','Pineapple']::text[], 'https://absolute.coffee/products/passion-fruit-2', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_s3kqyxs3kqyxs3kq.png?v=1779270027',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Passion Fruit V60',
    'absolute-coffee-passion-fruit-v60-hot',
    'Roaster Recommended V60 for Passion Fruit — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_s3kqyxs3kqyxs3kq.png?v=1779270027',
    'Intermediate',
    'Passion fruit, Peach, Mango, Pineapple.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Passion Fruit',
    'Light-medium',
    'Colombia',
    'CO-Fermentation Washed',
    'Within 7–28 days',
    null,
    'Caturra',
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-lychee-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Lychee', 'lychee', null, null,
    null, 'Co-Fermentation', null, 'Medium Light',
    'Antioquia & Huila', array['Lychee','Rambutan','Rose petal']::text[], 'https://absolute.coffee/products/lychee', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/eed71c7b-1972-4774-b833-e73021f73643_2b9541e8-6bab-4f9b-9042-6f75f42fdcdf.jpg?v=1783772311',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Lychee V60',
    'absolute-coffee-lychee-v60-hot',
    'Roaster Recommended V60 for Lychee — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/eed71c7b-1972-4774-b833-e73021f73643_2b9541e8-6bab-4f9b-9042-6f75f42fdcdf.jpg?v=1783772311',
    'Intermediate',
    'Lychee, Rambutan, Rose petal.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Lychee',
    'Medium Light',
    'Antioquia & Huila, Colombia',
    'Co-Fermentation',
    'Within 7–28 days',
    null,
    null,
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-strawberry-brownie-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Strawberry Brownie', 'strawberry-brownie', null, null,
    null, 'Thermal shock yeast, CO-Fermentation Washed', null, 'Light-medium',
    'Pitalito', array['Dark chocolate','Strawberry']::text[], 'https://absolute.coffee/products/strawberry-brownie', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_td27optd27optd27.png?v=1779270989',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Strawberry Brownie V60',
    'absolute-coffee-strawberry-brownie-v60-hot',
    'Roaster Recommended V60 for Strawberry Brownie — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_td27optd27optd27.png?v=1779270989',
    'Intermediate',
    'Dark chocolate, Strawberry.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Strawberry Brownie',
    'Light-medium',
    'Pitalito, Colombia',
    'Thermal shock yeast, CO-Fermentation Washed',
    'Within 7–28 days',
    null,
    null,
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-strawberry-ice-cream-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Strawberry Ice Cream', 'strawberry-ice-cream', null, null,
    'Pink Bourbon', 'Co-Fermentation', '1550-1600m', 'Medium Light',
    'Siberia, Acevedo', array['Strawberry','Ice cream','Cherry']::text[], 'https://absolute.coffee/products/strawberry-ice-cream', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/71290dca-9f84-461a-811e-714b3ffa075e_30103433-0e9c-4eed-ab4a-30feb967ce6b.jpg?v=1783772427',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Strawberry Ice Cream V60',
    'absolute-coffee-strawberry-ice-cream-v60-hot',
    'Roaster Recommended V60 for Strawberry Ice Cream — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/71290dca-9f84-461a-811e-714b3ffa075e_30103433-0e9c-4eed-ab4a-30feb967ce6b.jpg?v=1783772427',
    'Intermediate',
    'Strawberry, Ice cream, Cherry.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Strawberry Ice Cream',
    'Medium Light',
    'Siberia, Acevedo, Colombia',
    'Co-Fermentation',
    'Within 7–28 days',
    null,
    'Pink Bourbon',
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-cherry-cordial-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Cherry Cordial', 'cherry-cordial', null, null,
    null, 'Thermal shock natural', null, 'Light-medium',
    'San Adolfo, Huila', array['Rose petal','Cherry cordial','Vanilla']::text[], 'https://absolute.coffee/products/cherry-cordial', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_r6ajmrr6ajmrr6aj.png?v=1779270389',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Cherry Cordial V60',
    'absolute-coffee-cherry-cordial-v60-hot',
    'Roaster Recommended V60 for Cherry Cordial — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_r6ajmrr6ajmrr6aj.png?v=1779270389',
    'Intermediate',
    'Rose petal, Cherry cordial, Vanilla.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Cherry Cordial',
    'Light-medium',
    'San Adolfo, Huila, Colombia',
    'Thermal shock natural',
    'Within 7–28 days',
    null,
    null,
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-banana-bubblegum-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Banana Bubblegum', 'banana-bubblegum', null, null,
    null, 'Co-Fermentation', null, 'Light-medium',
    null, array['Banana','Bubblegum','Tropical candy']::text[], 'https://absolute.coffee/products/banana-bubblegum', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_yzdr6tyzdr6tyzdr.png?v=1779274298',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Banana Bubblegum V60',
    'absolute-coffee-banana-bubblegum-v60-hot',
    'Roaster Recommended V60 for Banana Bubblegum — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_yzdr6tyzdr6tyzdr.png?v=1779274298',
    'Intermediate',
    'Banana, Bubblegum, Tropical candy.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Banana Bubblegum',
    'Light-medium',
    'Colombia',
    'Co-Fermentation',
    'Within 7–28 days',
    null,
    null,
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-irish-tobacco-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Irish Tobacco', 'irish-tobacco', null, null,
    null, 'Co-Fermentation', '1650-2000m', 'Medium Light',
    'Antioquia & Huila', array['Caramel','Irish whisky','Tobacco leaf']::text[], 'https://absolute.coffee/products/irish-tobacco', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/cd77f6f7-6b45-474b-b0bd-e2690cb8d2b3.jpg?v=1783771906',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Irish Tobacco V60',
    'absolute-coffee-irish-tobacco-v60-hot',
    'Roaster Recommended V60 for Irish Tobacco — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/cd77f6f7-6b45-474b-b0bd-e2690cb8d2b3.jpg?v=1783771906',
    'Intermediate',
    'Caramel, Irish whisky, Tobacco leaf.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Irish Tobacco',
    'Medium Light',
    'Antioquia & Huila, Colombia',
    'Co-Fermentation',
    'Within 7–28 days',
    null,
    null,
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- absolute-coffee-strawberry-peach-smoothie-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'absolute-coffee' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'absolute-coffee'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Strawberry Peach Smoothie', 'strawberry-peach-smoothie', null, null,
    null, 'Co-Fermentation', null, 'Light-medium',
    null, array['Strawberry','Peach']::text[], 'https://absolute.coffee/products/strawberry-peach-smoothie', 'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_eo10k9eo10k9eo10.png?v=1779271167',
    array[200]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Strawberry Peach Smoothie V60',
    'absolute-coffee-strawberry-peach-smoothie-v60-hot',
    'Roaster Recommended V60 for Strawberry Peach Smoothie — 20 g at 1:15, 2:30-3:00.',
    'https://cdn.shopify.com/s/files/1/0600/8668/1660/files/Gemini_Generated_Image_eo10k9eo10k9eo10.png?v=1779271167',
    'Intermediate',
    'Strawberry, Peach.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Strawberry Peach Smoothie',
    'Light-medium',
    'Colombia',
    'Co-Fermentation',
    'Within 7–28 days',
    null,
    null,
    'Roaster grind: EK43 #10-11 (800-1000μm). Pour structure: 40 > 160 > 240 > 300.',
    20, 300, '1:15', 'EK43 #10-11 (800-1000μm)',
    93, '2:30-3:00', '2:30-3:00',
    'EK43 #10-11 (800-1000μm)', 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-kenya-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Kenya', 'kenya', null, null,
    'SL34, SL28', 'Washed', '1800m', 'Light-medium',
    'Othaya', array['Lychee','Blackberry','Black tea']::text[], 'https://southcoffee.ae/products/%D9%83%D9%8A%D9%86%D9%8A%D8%A7', null,
    array[250,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Kenya V60',
    'south-roastery-kenya-v60-hot',
    'BrewAtlas filter guide for Kenya from Kenya — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Lychee, Blackberry, Black tea.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Kenya',
    'Light-medium',
    'Othaya, Kenya',
    'Washed',
    'Within 7–28 days',
    null,
    'SL34, SL28',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-mango-colombia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Mango Colombia', 'mango-colombia', null, null,
    'Caturra', 'Fruit fermentation', '1730m', 'Light-medium',
    'Huila', array['Mango','Peach','Passion fruit','Lemon']::text[], 'https://southcoffee.ae/products/%D9%85%D8%A7%D9%86%D8%AC%D9%80%D9%80%D9%80%D9%80%D9%80%D9%88-%D9%83%D9%88%D9%84%D9%88%D9%85%D8%A8%D9%8A%D8%A7', null,
    array[250,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Mango Colombia V60',
    'south-roastery-mango-colombia-v60-hot',
    'BrewAtlas filter guide for Mango Colombia from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Mango, Peach, Passion fruit, Lemon.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Mango Colombia',
    'Light-medium',
    'Huila, Colombia',
    'Fruit fermentation',
    'Within 7–28 days',
    null,
    'Caturra',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-coconut-colombia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Coconut Colombia', 'coconut-colombia', null, null,
    'Bourbon', 'Fruit fermentation', '1650m', 'Light-medium',
    'Huila', array['Coconut','Tropical fruit','Milk chocolate']::text[], 'https://southcoffee.ae/products/coconut-colombia', null,
    array[250,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Coconut Colombia V60',
    'south-roastery-coconut-colombia-v60-hot',
    'BrewAtlas filter guide for Coconut Colombia from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Coconut, Tropical fruit, Milk chocolate.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Coconut Colombia',
    'Light-medium',
    'Huila, Colombia',
    'Fruit fermentation',
    'Within 7–28 days',
    null,
    'Bourbon',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-guji-hambela-filter-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Guji Hambela Filter', 'guji-hambela-filter', null, null,
    null, 'Natural', '2400m', 'Light-medium',
    'Guji', array['Jasmine','Pear','Apricot']::text[], 'https://southcoffee.ae/products/guji-hambela-natural', null,
    array[250,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Guji Hambela Filter V60',
    'south-roastery-guji-hambela-filter-v60-hot',
    'BrewAtlas filter guide for Guji Hambela Filter from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Jasmine, Pear, Apricot.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Guji Hambela Filter',
    'Light-medium',
    'Guji, Ethiopia',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-shakiso-ethiopia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Shakiso Ethiopia', 'shakiso-ethiopia', null, null,
    'Heirloom', 'Aerobic 4 days', '1900-2200m', 'Light-medium',
    'Guji', array['Floral','Red apple','Bergamot','Grape']::text[], 'https://southcoffee.ae/products/%D8%B4%D8%A7%D9%83%D9%8A%D8%B3%D9%88-%D8%A5%D8%AB%D9%8A%D9%88%D8%A8%D9%8A%D8%A7', null,
    array[250,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Shakiso Ethiopia V60',
    'south-roastery-shakiso-ethiopia-v60-hot',
    'BrewAtlas filter guide for Shakiso Ethiopia from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Floral, Red apple, Bergamot, Grape.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Shakiso Ethiopia',
    'Light-medium',
    'Guji, Ethiopia',
    'Aerobic 4 days',
    'Within 7–28 days',
    null,
    'Heirloom',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-microlot-java-colombia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Microlot Java Colombia', 'microlot-java-colombia', null, null,
    'Caturra', 'Anaerobic natural', '1350m', 'Light-medium',
    'Tolima', array['Cocoa nibs','Lemon','Brown sugar']::text[], 'https://southcoffee.ae/products/%D9%85%D8%A7%D9%8A%D9%83%D8%B1%D9%88%D9%84%D9%88%D8%AA-%D8%AC%D8%A7%D9%81%D8%A7-%D9%83%D9%88%D9%84%D9%88%D9%85%D8%A8%D9%8A%D8%A7', null,
    array[250,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Microlot Java Colombia V60',
    'south-roastery-microlot-java-colombia-v60-hot',
    'BrewAtlas filter guide for Microlot Java Colombia from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Cocoa nibs, Lemon, Brown sugar.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Microlot Java Colombia',
    'Light-medium',
    'Tolima, Colombia',
    'Anaerobic natural',
    'Within 7–28 days',
    null,
    'Caturra',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-rocket-flower-colombia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Rocket Flower Colombia', 'rocket-flower-colombia', null, null,
    'Caturra', 'Washed', '1800m', 'Light-medium',
    'Nariño', array['White flowers','Tropical fruit','White honey']::text[], 'https://southcoffee.ae/products/%D8%B1%D9%88%D9%83%D9%8A%D8%AA-%D9%81%D9%84%D8%A7%D9%88%D8%B1', null,
    array[250,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Rocket Flower Colombia V60',
    'south-roastery-rocket-flower-colombia-v60-hot',
    'BrewAtlas filter guide for Rocket Flower Colombia from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'White flowers, Tropical fruit, White honey.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Rocket Flower Colombia',
    'Light-medium',
    'Nariño, Colombia',
    'Washed',
    'Within 7–28 days',
    null,
    'Caturra',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-yunnan-china-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Yunnan China', 'yunnan-china', null, null,
    'Catimor', 'Anaerobic natural', '1600m', 'Light-medium',
    'Yunnan', array['Pineapple','Sugarcane','Dried apricot']::text[], 'https://southcoffee.ae/products/%D9%8A%D9%88%D9%86-%D9%86%D8%A7%D9%86-%D8%A7%D9%84%D8%B5%D9%8A%D9%86', null,
    array[250,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Yunnan China V60',
    'south-roastery-yunnan-china-v60-hot',
    'BrewAtlas filter guide for Yunnan China from China — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Pineapple, Sugarcane, Dried apricot.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Yunnan China',
    'Light-medium',
    'Yunnan, China',
    'Anaerobic natural',
    'Within 7–28 days',
    null,
    'Catimor',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-umqa-yemen-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Umqa Yemen', 'umqa-yemen', null, null,
    'Udaini', 'Slow anaerobic fermentation', '2200m', 'Light-medium',
    'Haraz', array['Dried fruit','Tropical fruit','Spices']::text[], 'https://southcoffee.ae/products/%D8%B9%D9%85%D9%82%D8%A9', null,
    array[125,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Umqa Yemen V60',
    'south-roastery-umqa-yemen-v60-hot',
    'BrewAtlas filter guide for Umqa Yemen from Yemen — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Dried fruit, Tropical fruit, Spices.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Umqa Yemen',
    'Light-medium',
    'Haraz, Yemen',
    'Slow anaerobic fermentation',
    'Within 7–28 days',
    null,
    'Udaini',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- south-roastery-strawberry-colombia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'south-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'uae' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'south-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Strawberry Colombia', 'strawberry-colombia', null, null,
    null, 'Not published', null, 'Light-medium',
    null, '{}'::text[], 'https://southcoffee.ae/products/%D9%81%D8%B1%D8%A7%D9%88%D9%84%D8%A9', null,
    array[250,1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Strawberry Colombia V60',
    'south-roastery-strawberry-colombia-v60-hot',
    'BrewAtlas filter guide for Strawberry Colombia from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Strawberry Colombia.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Strawberry Colombia',
    'Light-medium',
    'Colombia',
    'Not published',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- trivali-roastery-sidamo-ethiopia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'trivali-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'trivali-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Sidamo Ethiopia', 'sidamo-ethiopia', null, null,
    'Heirloom', 'Natural', '1800-2000m', 'Light-medium',
    'Guji', array['Chocolate','Molasses','Caramel']::text[], 'https://trivali.sa/products/%D8%B3%D9%8A%D8%AF%D8%A7%D9%85%D9%88-%D8%A7%D8%AB%D9%8A%D9%88%D8%A8%D9%8A', null,
    array[1000]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Sidamo Ethiopia V60',
    'trivali-roastery-sidamo-ethiopia-v60-hot',
    'BrewAtlas filter guide for Sidamo Ethiopia from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Chocolate, Molasses, Caramel.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Sidamo Ethiopia',
    'Light-medium',
    'Guji, Ethiopia',
    'Natural',
    'Within 7–28 days',
    null,
    'Heirloom',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- trivali-roastery-excelso-colombia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'trivali-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'trivali-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Excelso Colombia', 'excelso-colombia', null, null,
    'Caturra', 'Washed', '1750m', 'Light-medium',
    null, array['Chocolate','Sugarcane','Acidity']::text[], 'https://trivali.sa/products/%D9%87%D9%88%D9%8A%D9%84%D8%A7-%D9%83%D9%88%D9%84%D9%88%D9%85%D8%A8%D9%8A', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Excelso Colombia V60',
    'trivali-roastery-excelso-colombia-v60-hot',
    'BrewAtlas filter guide for Excelso Colombia from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Chocolate, Sugarcane, Acidity.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Excelso Colombia',
    'Light-medium',
    'Colombia',
    'Washed',
    'Within 7–28 days',
    null,
    'Caturra',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- trivali-roastery-colombia-pink-rose-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'trivali-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'trivali-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Colombia Pink Rose', 'colombia-pink-rose', null, null,
    null, 'Not published', null, 'Light-medium',
    null, array['Cherry','Marshmallow','Rose']::text[], 'https://trivali.sa/products/%D9%83%D9%88%D9%84%D9%88%D9%85%D8%A8%D9%8A-%D8%A8%D9%8A%D9%86%D9%83-%D8%B1%D9%88%D8%B2', null,
    array[125]::integer[], false, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Colombia Pink Rose V60',
    'trivali-roastery-colombia-pink-rose-v60-hot',
    'BrewAtlas filter guide for Colombia Pink Rose from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Cherry, Marshmallow, Rose.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.4,
    'Colombia Pink Rose',
    'Light-medium',
    'Colombia',
    'Not published',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- trivali-roastery-colombia-grape-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'trivali-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'trivali-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Colombia Grape', 'colombia-grape', null, null,
    null, 'Not published', null, 'Light-medium',
    null, '{}'::text[], 'https://trivali.sa/products/%D9%83%D9%88%D9%84%D9%88%D9%85%D8%A8%D9%8A%D8%A7-%D8%B9%D9%86%D8%A8', null,
    array[125]::integer[], false, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Colombia Grape V60',
    'trivali-roastery-colombia-grape-v60-hot',
    'BrewAtlas filter guide for Colombia Grape from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Colombia Grape.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.4,
    'Colombia Grape',
    'Light-medium',
    'Colombia',
    'Not published',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- trivali-roastery-ethiopia-chelchele-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'trivali-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'trivali-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Ethiopia Chelchele', 'ethiopia-chelchele', null, null,
    null, 'Not published', null, 'Light-medium',
    null, '{}'::text[], 'https://trivali.sa/products/%D8%A7%D8%AB%D9%8A%D9%88%D8%A8%D9%8A%D8%A7-%D8%B4%D9%8A%D9%84%D8%B4%D9%8A%D9%84%D9%8A-250g', null,
    array[250]::integer[], false, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Ethiopia Chelchele V60',
    'trivali-roastery-ethiopia-chelchele-v60-hot',
    'BrewAtlas filter guide for Ethiopia Chelchele from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Ethiopia Chelchele.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.4,
    'Ethiopia Chelchele',
    'Light-medium',
    'Ethiopia',
    'Not published',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-knight-roastery-nardos-ethiopia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-knight-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-knight-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Nardos Ethiopia', 'nardos-ethiopia', null, null,
    null, 'Anaerobic', null, 'Light-medium',
    null, '{}'::text[], 'https://b-k.coffee/en/products/%D9%86%D8%A7%D8%B1%D8%AF%D9%88%D8%B3-%D8%A7%D8%AB%D9%8A%D9%88%D8%A8%D9%8A%D8%A7-%D9%84%D8%A7%D9%87%D9%88%D8%A7%D8%A6%D9%8A-250g', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Nardos Ethiopia V60',
    'black-knight-roastery-nardos-ethiopia-v60-hot',
    'BrewAtlas filter guide for Nardos Ethiopia from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Nardos Ethiopia.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Nardos Ethiopia',
    'Light-medium',
    'Ethiopia',
    'Anaerobic',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-knight-roastery-lolit-ethiopia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-knight-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-knight-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Lolit Ethiopia', 'lolit-ethiopia', null, null,
    null, 'Natural', null, 'Light-medium',
    null, '{}'::text[], 'https://b-k.coffee/en/products/%D9%84%D9%88%D9%84%D9%8A%D8%AA-%D8%A7%D8%AB%D9%8A%D9%88%D8%A8%D9%8A%D8%A7-%D9%85%D8%AC%D9%81%D9%81-g250', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Lolit Ethiopia V60',
    'black-knight-roastery-lolit-ethiopia-v60-hot',
    'BrewAtlas filter guide for Lolit Ethiopia from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Lolit Ethiopia.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Lolit Ethiopia',
    'Light-medium',
    'Ethiopia',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-knight-roastery-milora-costa-rica-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-knight-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-knight-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Milora Costa Rica', 'milora-costa-rica', null, null,
    null, 'Full Honey', null, 'Light-medium',
    null, '{}'::text[], 'https://b-k.coffee/en/products/%D9%85%D9%8A%D9%84%D9%88%D8%B1%D8%A7-%D9%83%D9%88%D8%B3%D8%AA%D8%A7%D8%B1%D9%8A%D9%83%D8%A7-%D8%B9%D8%B3%D9%84%D9%8A-250-%D8%AC%D8%B1%D8%A7%D9%85', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Milora Costa Rica V60',
    'black-knight-roastery-milora-costa-rica-v60-hot',
    'BrewAtlas filter guide for Milora Costa Rica from Costa Rica — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Milora Costa Rica.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Milora Costa Rica',
    'Light-medium',
    'Costa Rica',
    'Full Honey',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-knight-roastery-rio-brazil-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-knight-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-knight-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Rio Brazil', 'rio-brazil', null, null,
    null, 'Natural', null, 'Light-medium',
    null, '{}'::text[], 'https://b-k.coffee/en/products/%D8%B1%D9%8A%D9%88%D9%88-%D8%A7%D9%84%D8%A8%D8%B1%D8%A7%D8%B2%D9%8A%D9%84-250', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Rio Brazil V60',
    'black-knight-roastery-rio-brazil-v60-hot',
    'BrewAtlas filter guide for Rio Brazil from Brazil — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Rio Brazil.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Rio Brazil',
    'Light-medium',
    'Brazil',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-knight-roastery-altura-colombia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-knight-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-knight-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Altura Colombia', 'altura-colombia', null, null,
    null, 'Slow drying', null, 'Light-medium',
    null, '{}'::text[], 'https://b-k.coffee/en/products/%D8%A3%D9%84%D8%AA%D9%88%D8%B1%D8%A7%D8%A7-%D9%83%D9%88%D9%84%D9%88%D9%85%D8%A8%D9%8A%D8%A7-%D8%AA%D8%AC%D9%81%D9%8A%D9%81-%D9%85%D8%B7%D9%88%D9%84-250-%D8%AC%D8%B1%D8%A7%D9%85', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Altura Colombia V60',
    'black-knight-roastery-altura-colombia-v60-hot',
    'BrewAtlas filter guide for Altura Colombia from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Altura Colombia.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Altura Colombia',
    'Light-medium',
    'Colombia',
    'Slow drying',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-knight-roastery-guji-ethiopia-bk-process-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-knight-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-knight-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Guji Ethiopia BK Process', 'guji-ethiopia-bk-process', null, null,
    null, 'BK Process', null, 'Light-medium',
    'Guji', '{}'::text[], 'https://b-k.coffee/en/products/%D9%82%D9%88%D8%AC%D9%8A-%D8%A7%D8%AB%D9%8A%D9%88%D8%A8%D9%8A%D8%A7-%D9%85%D8%B9%D8%A7%D9%84%D8%AC%D8%A9-%D8%AE%D8%A7%D8%B5%D8%A9-250g', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Guji Ethiopia BK Process V60',
    'black-knight-roastery-guji-ethiopia-bk-process-v60-hot',
    'BrewAtlas filter guide for Guji Ethiopia BK Process from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Guji Ethiopia BK Process.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Guji Ethiopia BK Process',
    'Light-medium',
    'Guji, Ethiopia',
    'BK Process',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-knight-roastery-aozora-uganda-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-knight-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-knight-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Aozora Uganda', 'aozora-uganda', null, null,
    null, 'Natural', null, 'Light-medium',
    null, '{}'::text[], 'https://b-k.coffee/en/products/%D8%A7%D9%88%D8%B2%D9%88%D8%B1%D8%A7-%D8%A7%D9%88%D8%BA%D9%86%D8%AF%D8%A7-%D9%85%D8%AC%D9%81%D9%81-250-%D8%AC%D8%B1%D8%A7%D9%85', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Aozora Uganda V60',
    'black-knight-roastery-aozora-uganda-v60-hot',
    'BrewAtlas filter guide for Aozora Uganda from Uganda — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Aozora Uganda.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Aozora Uganda',
    'Light-medium',
    'Uganda',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-horse-roastery-colombia-rose-lemonade-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-horse-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-horse-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Colombia Rose Lemonade', 'colombia-rose-lemonade', null, null,
    null, 'Not published', null, 'Light-medium',
    null, array['Lemon','Flowers','Coconut']::text[], 'https://blackhorse.sa/en/colombia-rose-lemonade/p569567530', null,
    null, false, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Colombia Rose Lemonade V60',
    'black-horse-roastery-colombia-rose-lemonade-v60-hot',
    'Roaster Recommended V60 for Colombia Rose Lemonade — 18 g at 1:15, 2:30-2:40.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Lemon, Flowers, Coconut.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.4,
    'Colombia Rose Lemonade',
    'Light-medium',
    'Colombia',
    'Not published',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    18, 280, '1:15', 'Medium-fine',
    89, '2:30-2:40', '2:30-2:40',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-horse-roastery-colombia-mango-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-horse-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-horse-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Colombia Mango', 'colombia-mango', null, null,
    'Castillo', 'Slow drying', '2000m+', 'Light-medium',
    null, array['Mango','Concord grape','Cherry']::text[], 'https://blackhorse.sa/ar/%D9%85%D8%AD%D8%B5%D9%88%D9%84-%D9%83%D9%88%D9%84%D9%88%D9%85%D8%A8%D9%8A%D8%A7-%7C-%D9%85%D8%A7%D9%86%D8%AC%D9%88/p858542902', null,
    null, false, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Colombia Mango V60',
    'black-horse-roastery-colombia-mango-v60-hot',
    'BrewAtlas filter guide for Colombia Mango from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Mango, Concord grape, Cherry.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.4,
    'Colombia Mango',
    'Light-medium',
    'Colombia',
    'Slow drying',
    'Within 7–28 days',
    null,
    'Castillo',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-horse-roastery-colombia-pink-bourbon-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-horse-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-horse-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Colombia Pink Bourbon', 'colombia-pink-bourbon', null, null,
    'Pink Bourbon', 'Natural', '2000m', 'Light-medium',
    'Huila', array['Red wine','Berry','Pineapple']::text[], 'https://blackhorse.sa/ar/%D9%83%D9%88%D9%84%D9%85%D8%A8%D9%8A-%7C-%D8%A8%D9%86%D9%83-%D8%A8%D9%88%D8%B1%D8%A8%D9%88%D9%86/p2141609654', null,
    null, false, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Colombia Pink Bourbon V60',
    'black-horse-roastery-colombia-pink-bourbon-v60-hot',
    'BrewAtlas filter guide for Colombia Pink Bourbon from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Red wine, Berry, Pineapple.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.4,
    'Colombia Pink Bourbon',
    'Light-medium',
    'Huila, Colombia',
    'Natural',
    'Within 7–28 days',
    null,
    'Pink Bourbon',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-horse-roastery-ethiopia-hambela-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-horse-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-horse-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Ethiopia Hambela', 'ethiopia-hambela', null, null,
    null, 'Natural (WYN)', '2200m+', 'Light-medium',
    'Hambela', array['Blueberry','Grape','Orange blossom']::text[], 'https://blackhorse.sa/en/ethiopia-hambela/p940864031', null,
    null, false, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Ethiopia Hambela V60',
    'black-horse-roastery-ethiopia-hambela-v60-hot',
    'BrewAtlas filter guide for Ethiopia Hambela from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Blueberry, Grape, Orange blossom.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.4,
    'Ethiopia Hambela',
    'Light-medium',
    'Hambela, Ethiopia',
    'Natural (WYN)',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-horse-roastery-brazil-mogiana-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-horse-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-horse-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Brazil Mogiana', 'brazil-mogiana', null, null,
    null, 'Natural', '1350m+', 'Light-medium',
    'Mogiana', array['Nut','Caramel','Cocoa']::text[], 'https://blackhorse.sa/en/brazil-mogiana/p1047179472', null,
    null, false, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Brazil Mogiana V60',
    'black-horse-roastery-brazil-mogiana-v60-hot',
    'BrewAtlas filter guide for Brazil Mogiana from Brazil — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Nut, Caramel, Cocoa.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.4,
    'Brazil Mogiana',
    'Light-medium',
    'Mogiana, Brazil',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- black-horse-roastery-mix-mohar-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'black-horse-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'black-horse-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Mix Mohar', 'mix-mohar', null, null,
    null, 'Special process', '2300m+', 'Light-medium',
    null, array['Apple','Red grape','Berry','Pineapple','Peach','Honey']::text[], 'https://blackhorse.sa/en/mix-mohar/p1314718821', null,
    null, false, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Mix Mohar V60',
    'black-horse-roastery-mix-mohar-v60-hot',
    'BrewAtlas filter guide for Mix Mohar from Panama — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Apple, Red grape, Berry, Pineapple, Peach, Honey.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.4,
    'Mix Mohar',
    'Light-medium',
    'Panama',
    'Special process',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-yellow-pacamara-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Yellow Pacamara', 'yellow-pacamara', null, null,
    null, 'Anaerobic', null, 'Light-medium',
    null, array['Apple','Jelly sweetness']::text[], 'https://ananasroastery.com/products/%D9%8A%D9%84%D9%88-%D8%A7%D9%8A%D9%83%D8%A7%D8%AA%D9%88-250g', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Yellow Pacamara V60',
    'ananas-roastery-yellow-pacamara-v60-hot',
    'BrewAtlas filter guide for Yellow Pacamara from El Salvador — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Apple, Jelly sweetness.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Yellow Pacamara',
    'Light-medium',
    'El Salvador',
    'Anaerobic',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-jana-haraz-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Jana Haraz', 'jana-haraz', null, null,
    null, 'Anaerobic', null, 'Light-medium',
    'Haraz', array['Mandarin','Banana','Caramel']::text[], 'https://ananasroastery.com/products/%D8%AC%D9%86%D9%89-%D8%AD%D8%B1%D8%A7%D8%B2-250G', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Jana Haraz V60',
    'ananas-roastery-jana-haraz-v60-hot',
    'BrewAtlas filter guide for Jana Haraz from Yemen — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Mandarin, Banana, Caramel.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Jana Haraz',
    'Light-medium',
    'Haraz, Yemen',
    'Anaerobic',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-hambela-naso-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Hambela Naso', 'hambela-naso', null, null,
    null, 'Natural', null, 'Light-medium',
    'Hambela', array['Berry','Strawberry','Apricot','Jasmine']::text[], 'https://ananasroastery.com/products/%D9%87%D9%85%D8%A8%D9%8A%D9%84%D8%A7-%D8%A7%D8%AB%D9%8A%D9%88%D8%A8%D9%8A-%D9%85%D8%AC%D9%81%D9%81', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Hambela Naso V60',
    'ananas-roastery-hambela-naso-v60-hot',
    'BrewAtlas filter guide for Hambela Naso from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Berry, Strawberry, Apricot, Jasmine.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Hambela Naso',
    'Light-medium',
    'Hambela, Ethiopia',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-passion-vibe-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Passion Vibe', 'passion-vibe', null, null,
    'Castillo', 'Anaerobic 48h with green passion fruit', '1450-1500m', 'Light-medium',
    'Quindio', array['Green passion fruit','Orange','Lemon peel','Panela sugar']::text[], 'https://ananasroastery.com/products/passion-vibe-coffee', null,
    array[125]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Passion Vibe V60',
    'ananas-roastery-passion-vibe-v60-hot',
    'BrewAtlas filter guide for Passion Vibe from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Green passion fruit, Orange, Lemon peel, Panela sugar.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Passion Vibe',
    'Light-medium',
    'Quindio, Colombia',
    'Anaerobic 48h with green passion fruit',
    'Within 7–28 days',
    null,
    'Castillo',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-flowers-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Flowers', 'flowers', 'Maracay', 'Felipe Arcila',
    'Pink Bourbon', 'Honey + carbonic maceration', '1450-1500m', 'Light-medium',
    'Armenia, Quindio', array['Rose','Red fruit','Cherry','Mango']::text[], 'https://ananasroastery.com/products/%D9%81%D9%84%D8%A7%D9%88%D8%B1%D8%B2-%D8%A7%D9%84%D9%81%D8%A7%D8%AE%D8%B1-125g', null,
    array[125]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Flowers V60',
    'ananas-roastery-flowers-v60-hot',
    'BrewAtlas filter guide for Flowers from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Rose, Red fruit, Cherry, Mango.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Flowers',
    'Light-medium',
    'Armenia, Quindio, Colombia',
    'Honey + carbonic maceration',
    'Within 7–28 days',
    'Felipe Arcila',
    'Pink Bourbon',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-murabba-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Murabba', 'murabba', null, null,
    'Castillo', 'Anaerobic 72h + natural strawberry', '1750-2150m', 'Light-medium',
    'Maracay, Quindio', array['Strawberry']::text[], 'https://ananasroastery.com/products/%D9%85%D8%B1%D8%A8%D9%89-%D9%85%D8%AD%D8%B5%D9%88%D9%84-%D8%A7%D9%86%D9%81%D9%8A%D9%88%D8%AC%D9%86-%D9%81%D8%A7%D8%AE%D8%B1%D8%A9', null,
    array[125]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Murabba V60',
    'ananas-roastery-murabba-v60-hot',
    'BrewAtlas filter guide for Murabba from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Strawberry.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Murabba',
    'Light-medium',
    'Maracay, Quindio, Colombia',
    'Anaerobic 72h + natural strawberry',
    'Within 7–28 days',
    null,
    'Castillo',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-grape-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Grape', 'grape', null, null,
    null, 'Anaerobic infusion (grape)', null, 'Light-medium',
    null, array['Grape','Molasses','Cocoa']::text[], 'https://ananasroastery.com/products/%D8%B3%D9%84%D8%A7%D9%81-%D8%A7%D9%81%D8%B6%D9%84-%D8%A7%D9%86%D9%81%D9%8A%D9%88%D8%AC%D9%86-%D8%B9%D9%86%D8%A8-125%D8%AC%D9%85', null,
    array[125]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Grape V60',
    'ananas-roastery-grape-v60-hot',
    'BrewAtlas filter guide for Grape from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Grape, Molasses, Cocoa.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Grape',
    'Light-medium',
    'Colombia',
    'Anaerobic infusion (grape)',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-lollipop-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Lollipop', 'lollipop', null, 'Felipe Arcila',
    null, 'Honey / 72h lychee pulp fermentation', null, 'Light-medium',
    null, array['Fruity sweetness']::text[], 'https://ananasroastery.com/products/%D8%A3%D9%81%D8%B6%D9%84-%D8%A7%D9%86%D9%81%D9%8A%D9%88%D8%AC%D9%86-%D9%84%D9%88%D9%84%D9%8A%D8%A8%D9%88%D8%A8', null,
    array[125]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Lollipop V60',
    'ananas-roastery-lollipop-v60-hot',
    'BrewAtlas filter guide for Lollipop from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Fruity sweetness.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Lollipop',
    'Light-medium',
    'Colombia',
    'Honey / 72h lychee pulp fermentation',
    'Within 7–28 days',
    'Felipe Arcila',
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-king-of-colombia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'King of Colombia', 'king-of-colombia', null, null,
    null, 'Not published', null, 'Light-medium',
    'Huila', array['Red berry','Plum','Chocolate']::text[], 'https://ananasroastery.com/products/%D9%85%D9%84%D9%83-%D9%83%D9%88%D9%84%D9%88%D9%85%D8%A8%D9%8A---%D9%83%D9%88%D9%84%D9%88%D9%85%D8%A8%D9%8A%D8%A7', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'King of Colombia V60',
    'ananas-roastery-king-of-colombia-v60-hot',
    'BrewAtlas filter guide for King of Colombia from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Red berry, Plum, Chocolate.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'King of Colombia',
    'Light-medium',
    'Huila, Colombia',
    'Not published',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-isabella-costa-rica-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Isabella Costa Rica', 'isabella-costa-rica', null, null,
    null, 'Natural', null, 'Light-medium',
    null, array['Melon','Cinnamon cake']::text[], 'https://ananasroastery.com/products/%D8%A7%D9%8A%D8%B2%D8%A7%D8%A8%D9%8A%D9%84%D8%A7-%D9%83%D9%88%D8%B3%D8%AA%D8%A7%D8%B1%D9%8A%D9%83%D8%A7-250g', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Isabella Costa Rica V60',
    'ananas-roastery-isabella-costa-rica-v60-hot',
    'BrewAtlas filter guide for Isabella Costa Rica from Costa Rica — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Melon, Cinnamon cake.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Isabella Costa Rica',
    'Light-medium',
    'Costa Rica',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- ananas-roastery-jahi-watermelon-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'ananas-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'ananas-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Jahi Watermelon', 'jahi-watermelon', null, null,
    null, 'Watermelon co-fermentation', null, 'Light-medium',
    null, array['Watermelon','Mint','Lemon','Chocolate']::text[], 'https://ananasroastery.com/products/jahi-watermelon-coffee', null,
    array[125]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Jahi Watermelon V60',
    'ananas-roastery-jahi-watermelon-v60-hot',
    'BrewAtlas filter guide for Jahi Watermelon from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Watermelon, Mint, Lemon, Chocolate.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Jahi Watermelon',
    'Light-medium',
    'Colombia',
    'Watermelon co-fermentation',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- kiffa-roastery-uraga-yabitu-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'kiffa-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'kiffa-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Uraga Yabitu', 'uraga-yabitu', null, null,
    null, 'Natural', null, 'Light-medium',
    'Uraga', array['Berry','Grape','Strawberry']::text[], 'https://kiffa.sa/products/URAGA-YABITU', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Uraga Yabitu V60',
    'kiffa-roastery-uraga-yabitu-v60-hot',
    'BrewAtlas filter guide for Uraga Yabitu from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Berry, Grape, Strawberry.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Uraga Yabitu',
    'Light-medium',
    'Uraga, Ethiopia',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- kiffa-roastery-cauca-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'kiffa-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'kiffa-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Cauca', 'cauca', null, null,
    null, 'Natural', '1950m', 'Light-medium',
    'Cauca', array['Black grape','Berry','Caramel']::text[], 'https://kiffa.sa/products/CAUCA', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Cauca V60',
    'kiffa-roastery-cauca-v60-hot',
    'BrewAtlas filter guide for Cauca from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Black grape, Berry, Caramel.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Cauca',
    'Light-medium',
    'Cauca, Colombia',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- kiffa-roastery-west-valley-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'kiffa-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'kiffa-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'West Valley', 'west-valley', null, null,
    null, 'Natural', '1300-1400m', 'Light-medium',
    null, array['Mandarin']::text[], 'https://kiffa.sa/products/WESTVALLEY', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'West Valley V60',
    'kiffa-roastery-west-valley-v60-hot',
    'BrewAtlas filter guide for West Valley from Costa Rica — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Mandarin.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'West Valley',
    'Light-medium',
    'Costa Rica',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- kiffa-roastery-san-german-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'kiffa-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'kiffa-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'San German', 'san-german', null, null,
    null, 'Raised-bed drying', '1800m', 'Light-medium',
    'Huila', '{}'::text[], 'https://kiffa.sa/products/SANGERMAN', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'San German V60',
    'kiffa-roastery-san-german-v60-hot',
    'BrewAtlas filter guide for San German from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for San German.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'San German',
    'Light-medium',
    'Huila, Colombia',
    'Raised-bed drying',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- kiffa-roastery-rafaello-vinhal-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'kiffa-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'kiffa-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Rafaello Vinhal', 'rafaello-vinhal', null, null,
    null, 'Anaerobic maceration', null, 'Light-medium',
    'Cerrado Mineiro', array['Coconut','Caramel','Dark chocolate']::text[], 'https://kiffa.sa/products/RAFAELLO', null,
    array[250]::integer[], true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Rafaello Vinhal V60',
    'kiffa-roastery-rafaello-vinhal-v60-hot',
    'BrewAtlas filter guide for Rafaello Vinhal from Brazil — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Coconut, Caramel, Dark chocolate.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Rafaello Vinhal',
    'Light-medium',
    'Cerrado Mineiro, Brazil',
    'Anaerobic maceration',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- c-and-b-roastery-chelchele-ethiopia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'c-and-b-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'c-and-b-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Chelchele Ethiopia', 'chelchele-ethiopia', null, null,
    'Heirloom', 'Natural', '1950-2200m', 'Light-medium',
    'Chelchele', array['Mango','Tropical fruit','Caramel']::text[], 'https://cup8beans.com/p1431589288', null,
    null, true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Chelchele Ethiopia V60',
    'c-and-b-roastery-chelchele-ethiopia-v60-hot',
    'Roaster Recommended V60 for Chelchele Ethiopia — 18 g at 1:16, 2:40.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Mango, Tropical fruit, Caramel.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Chelchele Ethiopia',
    'Light-medium',
    'Chelchele, Ethiopia',
    'Natural',
    'Within 7–28 days',
    null,
    'Heirloom',
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    18, 288, '1:16', 'Medium-fine',
    93, '2:40', '2:40',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- c-and-b-roastery-mananasi-uganda-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'c-and-b-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'c-and-b-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Mananasi Uganda', 'mananasi-uganda', null, null,
    null, 'Natural', null, 'Light-medium',
    'Kyanza / Kinga', array['Chocolate','Dried fruit','Pineapple']::text[], 'https://cup8beans.com/p1954804421', null,
    null, true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Mananasi Uganda V60',
    'c-and-b-roastery-mananasi-uganda-v60-hot',
    'Roaster Recommended V60 for Mananasi Uganda — 18 g at 1:16, 2:45.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Chocolate, Dried fruit, Pineapple.',
    true,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Mananasi Uganda',
    'Light-medium',
    'Kyanza / Kinga, Uganda',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    18, 288, '1:16', 'Medium-fine',
    91, '2:45', '2:45',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- c-and-b-roastery-chelba-ethiopia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'c-and-b-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'c-and-b-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Chelba Ethiopia', 'chelba-ethiopia', null, null,
    null, 'Not published', null, 'Light-medium',
    null, array['Strawberry','Cranberry','Dark chocolate']::text[], 'https://cup8beans.com/p1185641547', null,
    null, true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Chelba Ethiopia V60',
    'c-and-b-roastery-chelba-ethiopia-v60-hot',
    'BrewAtlas filter guide for Chelba Ethiopia from Ethiopia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Strawberry, Cranberry, Dark chocolate.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Chelba Ethiopia',
    'Light-medium',
    'Ethiopia',
    'Not published',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- c-and-b-roastery-planadas-colombia-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'c-and-b-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'c-and-b-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Planadas Colombia', 'planadas-colombia', 'Planadas', null,
    null, 'Not published', null, 'Light-medium',
    'Tolima / El Andio', '{}'::text[], 'https://cup8beans.com/p1691435317', null,
    null, true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Planadas Colombia V60',
    'c-and-b-roastery-planadas-colombia-v60-hot',
    'BrewAtlas filter guide for Planadas Colombia from Colombia — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Planadas Colombia.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Planadas Colombia',
    'Light-medium',
    'Tolima / El Andio, Colombia',
    'Not published',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- c-and-b-roastery-san-ignacio-costa-rica-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'c-and-b-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'c-and-b-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'San Ignacio Costa Rica', 'san-ignacio-costa-rica', null, null,
    null, 'Natural', null, 'Light-medium',
    'Los Santos', array['Cherry','Caramel','Hazelnut']::text[], 'https://cup8beans.com/p1946027218', null,
    null, true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'San Ignacio Costa Rica V60',
    'c-and-b-roastery-san-ignacio-costa-rica-v60-hot',
    'BrewAtlas filter guide for San Ignacio Costa Rica from Costa Rica — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Cherry, Caramel, Hazelnut.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'San Ignacio Costa Rica',
    'Light-medium',
    'Los Santos, Costa Rica',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- c-and-b-roastery-haraz-yemen-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'c-and-b-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'c-and-b-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Haraz Yemen', 'haraz-yemen', null, null,
    null, 'Natural', '2200-2400m', 'Light-medium',
    'Haraz', '{}'::text[], 'https://cup8beans.com/p518086018', null,
    null, true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Haraz Yemen V60',
    'c-and-b-roastery-haraz-yemen-v60-hot',
    'BrewAtlas filter guide for Haraz Yemen from Yemen — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Haraz Yemen.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Haraz Yemen',
    'Light-medium',
    'Haraz, Yemen',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

  -- c-and-b-roastery-mogiana-brazil-v60-hot
  select id into v_roaster_id from public.roasters where slug = 'c-and-b-roastery' limit 1;
  select id into v_country_id from public.countries where slug = 'saudi-arabia' limit 1;
  select ci.id into v_city_id from public.cities ci where ci.country_id = v_country_id limit 1;
  if v_roaster_id is null then raise exception 'Missing roaster slug %', 'c-and-b-roastery'; end if;

  insert into public.coffees (
    roaster_id, name, slug, farm, producer, variety, process, altitude, roast_level,
    region, flavor_notes, product_url, product_image_url, weight_options_grams,
    available, published, recommended_methods
  ) values (
    v_roaster_id, 'Mogiana Brazil', 'mogiana-brazil', null, null,
    null, 'Natural', null, 'Light-medium',
    'Alta Mogiana', '{}'::text[], 'https://cup8beans.com/p1179479567', null,
    null, true, true, array['V60','Origami','Kalita','Chemex','AeroPress','French Press']::text[]
  )
  on conflict (roaster_id, slug) where roaster_id is not null and slug is not null do update set
    name = excluded.name,
    farm = excluded.farm,
    producer = excluded.producer,
    variety = excluded.variety,
    process = excluded.process,
    altitude = excluded.altitude,
    roast_level = excluded.roast_level,
    region = excluded.region,
    flavor_notes = excluded.flavor_notes,
    product_url = excluded.product_url,
    product_image_url = excluded.product_image_url,
    weight_options_grams = excluded.weight_options_grams,
    available = excluded.available,
    published = excluded.published,
    recommended_methods = excluded.recommended_methods
  returning id into v_coffee_id;

  insert into public.recipes (
    title, slug, description, cover_image_url, difficulty,
    tasting_notes, featured, premium_only, published, status,
    recipe_kind, verification_status, serving_style,
    roaster_id, coffee_id, country_id, city_id, brewing_method_id,
    brew_method, is_iced, rating, coffee_beans, roast_level,
    bean_origin, process, roast_date_label, producer, variety,
    brewing_tips, coffee_dose, water_amount, ratio, grind_size,
    water_temperature, estimated_brew_time, total_brew_time,
    grinder_setting, water_recommendation, equipment_notes
  ) values (
    'Mogiana Brazil V60',
    'c-and-b-roastery-mogiana-brazil-v60-hot',
    'BrewAtlas filter guide for Mogiana Brazil from Brazil — customize dose, ratio, method, and hot/iced live.',
    '/images/methods/pour-over.webp',
    'Intermediate',
    'Filter profile for Mogiana Brazil.',
    false,
    false, true, 'published',
    'official', 'verified', 'hot',
    v_roaster_id, v_coffee_id, v_country_id, v_city_id, v_method_id,
    'V60', false,
    4.6,
    'Mogiana Brazil',
    'Light-medium',
    'Alta Mogiana, Brazil',
    'Natural',
    'Within 7–28 days',
    null,
    null,
    'Start with the suggested dose and ratio, then personalize pour structure for your grinder.',
    20, 300, '1:15', 'Medium-fine',
    93, '2:45–3:15', '2:45–3:15',
    null, 'Soft mineral / Third Wave Water', 'Hario V60 02'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cover_image_url = excluded.cover_image_url,
    tasting_notes = excluded.tasting_notes,
    featured = excluded.featured,
    published = excluded.published,
    status = excluded.status,
    roaster_id = excluded.roaster_id,
    coffee_id = excluded.coffee_id,
    country_id = excluded.country_id,
    coffee_dose = excluded.coffee_dose,
    water_amount = excluded.water_amount,
    ratio = excluded.ratio,
    grind_size = excluded.grind_size,
    water_temperature = excluded.water_temperature,
    coffee_beans = excluded.coffee_beans,
    bean_origin = excluded.bean_origin,
    process = excluded.process,
    updated_at = now()
  returning id into v_recipe_id;

end $$;
