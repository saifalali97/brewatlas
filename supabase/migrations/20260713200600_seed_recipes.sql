-- Generates 100 professional recipes across the 50 seeded coffees and 8
-- brewing methods, each with method-appropriate equipment, realistic brew
-- parameters/results, an ordered pour structure, and origin-flavored tags.
-- Written procedurally (rather than 100 hand-typed rows) so every recipe
-- stays internally consistent (e.g. an Espresso recipe always gets an
-- espresso-capable device, sensible dose/ratio/TDS, and no pour steps).

do $$
declare
  method_ids uuid[];
  method_names text[];
  grinder_ids uuid[];
  filter_ids uuid[];
  water_ids uuid[];
  coffee_ids uuid[];
  cover_images text[] := array[
    '/images/methods/pour-over.webp', '/images/recipes/chemex.webp', '/images/recipes/cold-brew.webp',
    '/images/recipes/espresso-shot.webp', '/images/recipes/costa-rica-aeropress.webp', '/images/recipes/espresso-tonic.webp',
    '/images/recipes/origami-dripper.webp', '/images/recipes/moka-pot-classic.webp', '/images/methods/pour-over.webp',
    '/images/recipes/chemex.webp', '/images/methods/siphon.webp', '/images/recipes/moka-pot-classic.webp',
    '/images/recipes/espresso-shot.webp', '/images/recipes/cold-brew.webp', '/images/recipes/coffee-beans-macro.webp',
    '/images/recipes/cupping-flight.webp', '/images/recipes/origami-dripper.webp', '/images/methods/french-press.webp',
    '/images/methods/siphon.webp', '/images/roasters/la-cabra.webp'
  ];

  i int;
  method_id uuid;
  method_name text;
  matching_devices uuid[];
  device_id uuid;
  grinder_id uuid;
  grinder_name text;
  filter_id uuid;
  water_id uuid;
  water_name text;
  coffee_id uuid;
  coffee_name text;
  coffee_country text;

  dose numeric;
  ratio_num int;
  water_amt numeric;
  temp numeric;
  bloom_amt numeric;
  bloom_t text;
  est_time text;
  pour_count int;
  grind_size_val text;

  beverage_wt numeric;
  tds_val numeric;
  extraction numeric;
  sweetness_val int;
  acidity_val int;
  body_val int;
  bitterness_val int;
  difficulty_val text;
  featured_val boolean;
  premium_val boolean;
  ice_amt numeric;

  title text;
  slug_val text;
  description_val text;
  tasting text;
  instructions_text text;
  primary_tag text;
  secondary_tag text;
  country_notes text[];
  new_recipe_id uuid;

  remaining numeric;
  p1 numeric;
  p2 numeric;
  p3 numeric;
begin
  method_ids := array(select id from public.brewing_methods order by name);
  method_names := array(select name from public.brewing_methods order by name);
  grinder_ids := array(select id from public.grinders order by name);
  filter_ids := array(select id from public.filter_types order by name);
  water_ids := array(select id from public.water_profiles order by name);
  coffee_ids := array(select id from public.coffees order by name);

  for i in 1..100 loop
    method_name := method_names[((i - 1) % array_length(method_names, 1)) + 1];
    method_id := method_ids[((i - 1) % array_length(method_ids, 1)) + 1];
    grinder_id := grinder_ids[((i - 1) % array_length(grinder_ids, 1)) + 1];
    water_id := water_ids[((i - 1) % array_length(water_ids, 1)) + 1];
    coffee_id := coffee_ids[((i - 1) % array_length(coffee_ids, 1)) + 1];

    select name into grinder_name from public.grinders where id = grinder_id;
    select name into water_name from public.water_profiles where id = water_id;
    select c.name, o.country into coffee_name, coffee_country
      from public.coffees c join public.origins o on o.id = c.origin_id
      where c.id = coffee_id;

    filter_id := case
      when method_name = 'Espresso' then null
      else filter_ids[((i - 1) % array_length(filter_ids, 1)) + 1]
    end;

    matching_devices := array(
      select d.id from public.devices d
      where
        (method_name in ('V60', 'Pour Over') and d.name ~* '(V60|Origami|Kalita|Orea|April Brewer|Switch|Beehouse|Melodrip|Crystal Eye|Flower)')
        or (method_name = 'Chemex' and d.name ~* 'Chemex')
        or (method_name = 'Espresso' and d.name ~* '(Espresso|Flair|Nanopresso|Marzocco)')
        or (method_name = 'French Press' and d.name ~* '(French Press|Clever)')
        or (method_name = 'Aeropress' and d.name ~* 'AeroPress')
        or (method_name = 'Cold Brew' and d.name ~* '(Cold Brew|Toddy)')
        or (method_name = 'Siphon' and d.name ~* 'Siphon')
      order by d.name
    );
    device_id := matching_devices[((i - 1) % greatest(array_length(matching_devices, 1), 1)) + 1];

    case method_name
      when 'V60' then
        dose := 15 + (i % 6); ratio_num := 15 + (i % 3); temp := 92 + (i % 4);
        bloom_amt := round(dose * 2); bloom_t := '0:30'; est_time := '3:' || lpad((15 + (i % 3) * 15)::text, 2, '0');
        pour_count := 4; grind_size_val := 'Medium-Fine';
      when 'Pour Over' then
        dose := 16 + (i % 5); ratio_num := 16 + (i % 2); temp := 93 + (i % 3);
        bloom_amt := round(dose * 2); bloom_t := '0:35'; est_time := '3:' || lpad((20 + (i % 3) * 10)::text, 2, '0');
        pour_count := 4; grind_size_val := 'Medium-Fine';
      when 'Chemex' then
        dose := 28 + (i % 6); ratio_num := 15 + (i % 2); temp := 93 + (i % 3);
        bloom_amt := round(dose * 2); bloom_t := '0:45'; est_time := '4:00';
        pour_count := 3; grind_size_val := 'Medium-Coarse';
      when 'Espresso' then
        dose := 18 + (i % 3); ratio_num := 2; temp := 90 + (i % 5);
        bloom_amt := null; bloom_t := null; est_time := '0:' || lpad((25 + (i % 8))::text, 2, '0');
        pour_count := 0; grind_size_val := 'Fine';
      when 'French Press' then
        dose := 28 + (i % 5); ratio_num := 15; temp := 94 + (i % 3);
        bloom_amt := null; bloom_t := null; est_time := '4:00';
        pour_count := 1; grind_size_val := 'Coarse';
      when 'Aeropress' then
        dose := 15 + (i % 4); ratio_num := 13 + (i % 3); temp := 85 + (i % 8);
        bloom_amt := null; bloom_t := null; est_time := '1:' || lpad((30 + (i % 30))::text, 2, '0');
        pour_count := 2; grind_size_val := 'Medium-Fine';
      when 'Cold Brew' then
        dose := 90 + (i % 4) * 5; ratio_num := 10; temp := 20;
        bloom_amt := null; bloom_t := null; est_time := (14 + (i % 5))::text || ' hr';
        pour_count := 1; grind_size_val := 'Coarse';
      when 'Siphon' then
        dose := 24 + (i % 4); ratio_num := 14; temp := 92 + (i % 3);
        bloom_amt := null; bloom_t := null; est_time := '3:00';
        pour_count := 1; grind_size_val := 'Medium';
      else
        dose := 18; ratio_num := 16; temp := 93;
        bloom_amt := null; bloom_t := null; est_time := '3:00';
        pour_count := 3; grind_size_val := 'Medium';
    end case;

    water_amt := round(dose * ratio_num);

    ice_amt := case when method_name = 'Cold Brew' and i % 2 = 0 then 80 + (i % 5) * 10 else null end;

    beverage_wt := case method_name
      when 'Espresso' then water_amt
      when 'Cold Brew' then round(water_amt * 0.85, 2)
      else round(water_amt * 0.9, 2)
    end;

    tds_val := case method_name
      when 'Espresso' then round((8.5 + (i % 20) / 10.0)::numeric, 2)
      when 'Cold Brew' then round((1.40 + (i % 30) / 100.0)::numeric, 2)
      else round((1.30 + (i % 15) / 100.0)::numeric, 2)
    end;

    extraction := case method_name
      when 'Espresso' then round((18 + (i % 60) / 10.0)::numeric, 1)
      else round((18 + (i % 50) / 10.0)::numeric, 1)
    end;

    acidity_val := case
      when coffee_country in ('Ethiopia', 'Kenya', 'Rwanda') then 7 + (i % 3)
      when coffee_country in ('Yemen', 'Brazil') then 5 + (i % 3)
      else 6 + (i % 3)
    end;
    sweetness_val := case
      when coffee_country in ('Yemen', 'Brazil', 'Guatemala', 'El Salvador') then 7 + (i % 3)
      else 6 + (i % 3)
    end;
    body_val := case
      when method_name in ('Espresso', 'French Press', 'Siphon') then 7 + (i % 3)
      when coffee_country in ('Brazil', 'Yemen') then 7 + (i % 2)
      else 5 + (i % 3)
    end;
    bitterness_val := case
      when method_name = 'Espresso' then 5 + (i % 3)
      when method_name in ('French Press', 'Cold Brew') then 3 + (i % 3)
      else 2 + (i % 3)
    end;

    difficulty_val := case
      when i % 5 = 0 then 'Beginner'
      when i % 5 = 4 then 'Advanced'
      else 'Intermediate'
    end;
    featured_val := (i % 7 = 0) or (i = 100);
    premium_val := (i % 4 = 0);

    country_notes := case coffee_country
      when 'Ethiopia' then array[
        'Jasmine and bergamot florals with a delicate stone fruit sweetness and a tea-like finish.',
        'Blueberry and strawberry jam with a wine-like natural sweetness and syrupy body.',
        'Honeysuckle and peach with a bright, citric acidity and a clean finish.']
      when 'Yemen' then array[
        'Dried fig and molasses with a wild, wine-like fermentation character and heavy body.',
        'Blackberry and warm baking spice with a rustic, syrupy mouthfeel.',
        'Raisin and dark chocolate with an earthy, full-bodied finish.']
      when 'Colombia' then array[
        'Red apple and caramel sweetness with a balanced, juicy acidity.',
        'Ripe cherry and brown sugar with a smooth, syrupy body.',
        'Tropical guava and honey sweetness with a clean, crisp finish.']
      when 'Panama' then array[
        'Jasmine and white peach with a delicate, tea-like body and a floral aftertaste.',
        'Bergamot and honeysuckle with a light, silky mouthfeel and a long floral finish.',
        'Lychee and orange blossom with a bright, elegant acidity.']
      when 'Kenya' then array[
        'Blackcurrant and grapefruit with a vibrant, wine-like acidity.',
        'Tomato and red berry brightness with a juicy, tangy finish.',
        'Passionfruit and lime zest with a lively, crisp acidity.']
      when 'Brazil' then array[
        'Milk chocolate and roasted almond with a heavy, creamy body.',
        'Caramel and toasted hazelnut with a smooth, low-acid finish.',
        'Peanut brittle and brown sugar with a rounded, nutty finish.']
      when 'Rwanda' then array[
        'Red plum and green apple with a bright, clean acidity.',
        'Orange zest and brown sugar with a crisp, tea-like body.',
        'Apricot and lemongrass with a clean, delicate finish.']
      when 'Costa Rica' then array[
        'Honey and butterscotch sweetness with a clean, syrupy body.',
        'Green apple and vanilla with a bright, balanced finish.',
        'Golden raisin and caramel with a smooth, honeyed mouthfeel.']
      when 'Guatemala' then array[
        'Dark chocolate and dried cherry with a full, syrupy body.',
        'Toffee and cinnamon spice with a balanced, sweet finish.',
        'Cocoa and red apple with a smooth, medium body.']
      when 'El Salvador' then array[
        'Walnut and milk chocolate with a soft, rounded finish.',
        'Brown butter and caramel with a smooth, nutty body.',
        'Toasted pecan and brown sugar with a mellow, sweet finish.']
      else array['Balanced sweetness with a smooth body and a clean finish.']
    end;
    tasting := country_notes[((i - 1) % array_length(country_notes, 1)) + 1];

    primary_tag := case coffee_country
      when 'Ethiopia' then 'Floral' when 'Yemen' then 'Fruity' when 'Colombia' then 'Sweet'
      when 'Panama' then 'Floral' when 'Kenya' then 'Bright' when 'Brazil' then 'Chocolate'
      when 'Rwanda' then 'Bright' when 'Costa Rica' then 'Clean' when 'Guatemala' then 'Chocolate'
      when 'El Salvador' then 'Nutty' else 'Clean'
    end;
    secondary_tag := case coffee_country
      when 'Ethiopia' then 'Fruity' when 'Yemen' then 'Sweet' when 'Colombia' then 'Fruity'
      when 'Panama' then 'Tea-like' when 'Kenya' then 'Fruity' when 'Brazil' then 'Nutty'
      when 'Rwanda' then 'Clean' when 'Costa Rica' then 'Sweet' when 'Guatemala' then 'Sweet'
      when 'El Salvador' then 'Chocolate' else 'Sweet'
    end;

    title := coffee_name || ' ' || method_name;
    slug_val := lower(regexp_replace(regexp_replace(trim(title), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
    description_val := format(
      '%s brewed as a %s, showcasing %s and %s character from %s.',
      coffee_name, method_name, lower(primary_tag), lower(secondary_tag), coffee_country
    );
    instructions_text := format(
      'Grind %sg of coffee on the %s to a %s consistency. Heat water to %s°C using %s, then brew with the pour structure below. Serve immediately for the best aromatics.',
      dose, grinder_name, lower(grind_size_val), temp, water_name
    );

    insert into public.recipes (
      title, slug, description, difficulty, estimated_brew_time,
      brewing_method_id, device_id, grinder_id, filter_type_id, water_profile_id, coffee_id,
      coffee_dose, water_amount, ice_amount, grind_size, water_temperature, ratio,
      bloom_amount, bloom_time, total_brew_time, beverage_weight, tds, extraction_percentage,
      tasting_notes, instructions, cover_image_url,
      sweetness, acidity, body, bitterness,
      featured, premium_only, published
    ) values (
      title, slug_val, description_val, difficulty_val, est_time,
      method_id, device_id, grinder_id, filter_id, water_id, coffee_id,
      dose, water_amt, ice_amt, grind_size_val, temp, '1:' || ratio_num,
      bloom_amt, bloom_t, est_time, beverage_wt, tds_val, extraction,
      tasting, instructions_text, cover_images[((i - 1) % array_length(cover_images, 1)) + 1],
      sweetness_val, acidity_val, body_val, bitterness_val,
      featured_val, premium_val, true
    )
    returning id into new_recipe_id;

    if pour_count = 1 then
      insert into public.recipe_pours (recipe_id, pour_number, water_amount, time_label, notes) values
        (new_recipe_id, 1, water_amt, '0:00', 'Add all the water at once and steep for the full brew time.');
    elsif pour_count = 2 then
      p1 := round(water_amt * 0.5);
      insert into public.recipe_pours (recipe_id, pour_number, water_amount, time_label, notes) values
        (new_recipe_id, 1, p1, '0:00', 'Initial pour, stir gently to saturate the grounds.'),
        (new_recipe_id, 2, water_amt - p1, '1:00', 'Top off and steep until ready to plunge.');
    elsif pour_count = 3 then
      p1 := bloom_amt;
      p2 := round((water_amt - p1) * 0.5);
      insert into public.recipe_pours (recipe_id, pour_number, water_amount, time_label, notes) values
        (new_recipe_id, 1, p1, '0:00', 'Bloom and saturate all the grounds evenly.'),
        (new_recipe_id, 2, p2, bloom_t, 'Slow spiral pour to the halfway mark.'),
        (new_recipe_id, 3, water_amt - p1 - p2, '2:00', 'Final pour to reach the target weight.');
    elsif pour_count = 4 then
      p1 := bloom_amt;
      p2 := round((water_amt - p1) * 0.4);
      p3 := round((water_amt - p1) * 0.35);
      insert into public.recipe_pours (recipe_id, pour_number, water_amount, time_label, notes) values
        (new_recipe_id, 1, p1, '0:00', 'Bloom and saturate all the grounds evenly.'),
        (new_recipe_id, 2, p2, bloom_t, 'First pour in slow, controlled circles.'),
        (new_recipe_id, 3, p3, '1:15', 'Second pour, maintaining a steady water level.'),
        (new_recipe_id, 4, water_amt - p1 - p2 - p3, '2:00', 'Final pour to reach the target weight.');
    end if;

    insert into public.recipe_tags (recipe_id, tag_id)
    select new_recipe_id, t.id from public.tags t where t.name in (primary_tag, secondary_tag)
    on conflict (recipe_id, tag_id) do nothing;

    if difficulty_val = 'Advanced' and i % 3 = 0 then
      insert into public.recipe_tags (recipe_id, tag_id)
      select new_recipe_id, t.id from public.tags t where t.name = 'Competition'
      on conflict (recipe_id, tag_id) do nothing;
    end if;

    if difficulty_val = 'Beginner' then
      insert into public.recipe_tags (recipe_id, tag_id)
      select new_recipe_id, t.id from public.tags t where t.name = 'Daily Brew'
      on conflict (recipe_id, tag_id) do nothing;
    end if;
  end loop;
end $$;
