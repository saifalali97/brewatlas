-- Seeds realistic "Personal Experience" demo data (coffee setup, taste
-- profile, and brewing history) for the demo@brewatlas.app account.
-- The account must exist in auth.users (created through the normal signup
-- flow); this migration resolves the user id dynamically by email.
--
-- Brew log entries reuse each referenced recipe's own brewing_method_id/
-- device_id via subquery, so this seed can't drift out of sync with
-- whatever those recipes actually are.

do $$
declare
  demo_user_id uuid;
  taste_profile_id uuid;
begin
  select id into demo_user_id
  from auth.users
  where email = 'demo@brewatlas.app'
  limit 1;

  if demo_user_id is null then
    raise notice 'demo@brewatlas.app not found — skipping personal experience demo seed';
    return;
  end if;

  insert into public.user_coffee_setups (
    user_id, grinder_id, brewer_device_id, xbloom_device_id, espresso_machine, kettle, scale,
    filter_type_id, favorite_mug, favorite_server, preferred_water_profile_id
  ) values (
    demo_user_id,
    (select id from public.grinders where name = 'Comandante C40'),
    (select device_id from public.recipes where id = '142527ff-44d3-48da-b60c-2aeab8611096'),
    (select id from public.xbloom_devices where name = 'xBloom Studio'),
    'Breville Barista Express',
    'Fellow Stagg EKG',
    'Acaia Pearl',
    (select id from public.filter_types where name = 'Paper (Unbleached)'),
    'Kinto SCS ceramic mug',
    'Hario V60 Range Server, 600ml',
    (select id from public.water_profiles where name = 'Fellow Aquamin')
  )
  on conflict (user_id) do nothing;

  insert into public.user_taste_profiles (
    user_id, acidity_preference, sweetness_preference, body_preference,
    fruity, chocolate, floral, nutty, fermented, tea_like, roast_preference
  ) values (
    demo_user_id,
    7, 8, 6,
    8, 6, 7, 4, 3, 6, 'Light'
  )
  on conflict (user_id) do nothing
  returning id into taste_profile_id;

  if taste_profile_id is not null then
    insert into public.user_taste_profile_processes (taste_profile_id, process)
    values
      (taste_profile_id, 'Washed'),
      (taste_profile_id, 'Natural'),
      (taste_profile_id, 'Honey')
    on conflict (taste_profile_id, process) do nothing;
  end if;

  if not exists (select 1 from public.user_brew_logs where user_id = demo_user_id limit 1) then
    insert into public.user_brew_logs (
      user_id, recipe_id, brewed_at, brewing_device_id, brewing_method_id, rating, is_favorite, notes
    )
    values
      (
        demo_user_id, '2f5a5c3d-36ee-42f8-a4cf-020cc9b314c0', now() - interval '58 days',
        (select device_id from public.recipes where id = '2f5a5c3d-36ee-42f8-a4cf-020cc9b314c0'),
        (select brewing_method_id from public.recipes where id = '2f5a5c3d-36ee-42f8-a4cf-020cc9b314c0'),
        4, false, 'Bright and clean, good clarity.'
      ),
      (
        demo_user_id, 'b6b1de7e-4e67-49c4-9047-20cd4b4caa3b', now() - interval '54 days',
        (select device_id from public.recipes where id = 'b6b1de7e-4e67-49c4-9047-20cd4b4caa3b'),
        (select brewing_method_id from public.recipes where id = 'b6b1de7e-4e67-49c4-9047-20cd4b4caa3b'),
        5, true, 'One of my best Chemex brews yet.'
      ),
      (
        demo_user_id, '95e9ec5f-9edd-422d-baca-d3d1e394a1e6', now() - interval '50 days',
        (select device_id from public.recipes where id = '95e9ec5f-9edd-422d-baca-d3d1e394a1e6'),
        (select brewing_method_id from public.recipes where id = '95e9ec5f-9edd-422d-baca-d3d1e394a1e6'),
        4, false, null
      ),
      (
        demo_user_id, '870b1df3-26cf-4ddf-941c-839389e10a31', now() - interval '47 days',
        (select device_id from public.recipes where id = '870b1df3-26cf-4ddf-941c-839389e10a31'),
        (select brewing_method_id from public.recipes where id = '870b1df3-26cf-4ddf-941c-839389e10a31'),
        3, false, 'Slightly over-extracted, need to adjust the grind finer next time.'
      ),
      (
        demo_user_id, '45858a02-19a3-4d98-9a4d-7ad625189746', now() - interval '43 days',
        (select device_id from public.recipes where id = '45858a02-19a3-4d98-9a4d-7ad625189746'),
        (select brewing_method_id from public.recipes where id = '45858a02-19a3-4d98-9a4d-7ad625189746'),
        4, false, null
      ),
      (
        demo_user_id, 'a956015b-e452-4b0e-8c48-28f612f52d95', now() - interval '40 days',
        (select device_id from public.recipes where id = 'a956015b-e452-4b0e-8c48-28f612f52d95'),
        (select brewing_method_id from public.recipes where id = 'a956015b-e452-4b0e-8c48-28f612f52d95'),
        5, true, 'Incredible florals, saving this one.'
      ),
      (
        demo_user_id, '21e9c0b1-8593-4566-8b44-4cedd60eaf54', now() - interval '36 days',
        (select device_id from public.recipes where id = '21e9c0b1-8593-4566-8b44-4cedd60eaf54'),
        (select brewing_method_id from public.recipes where id = '21e9c0b1-8593-4566-8b44-4cedd60eaf54'),
        4, false, null
      ),
      (
        demo_user_id, '142527ff-44d3-48da-b60c-2aeab8611096', now() - interval '33 days',
        (select device_id from public.recipes where id = '142527ff-44d3-48da-b60c-2aeab8611096'),
        (select brewing_method_id from public.recipes where id = '142527ff-44d3-48da-b60c-2aeab8611096'),
        4, false, 'Clean and citrusy, solid everyday brew.'
      ),
      (
        demo_user_id, 'd893315c-e60b-4434-86fe-125850ac63ce', now() - interval '29 days',
        (select device_id from public.recipes where id = 'd893315c-e60b-4434-86fe-125850ac63ce'),
        (select brewing_method_id from public.recipes where id = 'd893315c-e60b-4434-86fe-125850ac63ce'),
        5, true, 'Worth the hype.'
      ),
      (
        demo_user_id, 'b823d0e6-574a-4db7-9b8a-4a3ed3f086b5', now() - interval '25 days',
        (select device_id from public.recipes where id = 'b823d0e6-574a-4db7-9b8a-4a3ed3f086b5'),
        (select brewing_method_id from public.recipes where id = 'b823d0e6-574a-4db7-9b8a-4a3ed3f086b5'),
        3, false, null
      ),
      (
        demo_user_id, '029542bd-b4f6-42e5-bc6f-3d7bcd45e884', now() - interval '21 days',
        (select device_id from public.recipes where id = '029542bd-b4f6-42e5-bc6f-3d7bcd45e884'),
        (select brewing_method_id from public.recipes where id = '029542bd-b4f6-42e5-bc6f-3d7bcd45e884'),
        4, false, null
      ),
      (
        demo_user_id, 'c77b971f-3e17-4af7-bf73-9152cf2f7ba1', now() - interval '18 days',
        (select device_id from public.recipes where id = 'c77b971f-3e17-4af7-bf73-9152cf2f7ba1'),
        (select brewing_method_id from public.recipes where id = 'c77b971f-3e17-4af7-bf73-9152cf2f7ba1'),
        4, false, 'Good crema, balanced shot.'
      ),
      (
        demo_user_id, '002b19e4-0414-489f-80e8-e888758a7a6e', now() - interval '15 days',
        (select device_id from public.recipes where id = '002b19e4-0414-489f-80e8-e888758a7a6e'),
        (select brewing_method_id from public.recipes where id = '002b19e4-0414-489f-80e8-e888758a7a6e'),
        5, true, 'Rich and syrupy, love the honey process.'
      ),
      (
        demo_user_id, 'b6ad518a-9c05-40fd-89bd-99b4455ad873', now() - interval '11 days',
        (select device_id from public.recipes where id = 'b6ad518a-9c05-40fd-89bd-99b4455ad873'),
        (select brewing_method_id from public.recipes where id = 'b6ad518a-9c05-40fd-89bd-99b4455ad873'),
        4, false, null
      ),
      (
        demo_user_id, '0be3f934-3924-4743-aecc-fe3d22037af5', now() - interval '8 days',
        (select device_id from public.recipes where id = '0be3f934-3924-4743-aecc-fe3d22037af5'),
        (select brewing_method_id from public.recipes where id = '0be3f934-3924-4743-aecc-fe3d22037af5'),
        5, true, 'Best siphon brew this year.'
      ),
      (
        demo_user_id, null, now() - interval '5 days',
        (select id from public.devices where name = 'AeroPress'),
        (select id from public.brewing_methods where name = 'Espresso'),
        3, false, 'Dialing in a new bag from a local roaster, still adjusting the grind.'
      ),
      (
        demo_user_id, null, now() - interval '3 days',
        (select id from public.devices where name = 'Chemex Classic'),
        (select id from public.brewing_methods where name = 'Pour Over'),
        4, false, 'Quick morning pour over with the usual 1:16 ratio.'
      ),
      (
        demo_user_id, '142527ff-44d3-48da-b60c-2aeab8611096', now() - interval '1 days',
        (select device_id from public.recipes where id = '142527ff-44d3-48da-b60c-2aeab8611096'),
        (select brewing_method_id from public.recipes where id = '142527ff-44d3-48da-b60c-2aeab8611096'),
        4, false, 'Repeat brew, consistent results.'
      );
  end if;
end $$;
