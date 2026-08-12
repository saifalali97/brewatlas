-- Backfill coffee product images for Dynamic Recipe catalog roasters.
-- Source: official product page og:image / storefront media (Zid / Salla).
-- Idempotent upserts by (roaster.slug, coffee.slug).

do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('south-roastery', 'guji-hambela-filter', 'https://media.zid.store/thumbs/4a599517-bf28-473f-8032-56b498f2f1cb/577b4e17-794a-48f2-810d-90f136821776-thumbnail-1000x1000-70.jpg'),
      ('south-roastery', 'shakiso-ethiopia', 'https://media.zid.store/thumbs/4a599517-bf28-473f-8032-56b498f2f1cb/f332ed98-50d7-4534-ba16-17ac13e49168-thumbnail-1000x1000-70.jpg'),
      ('south-roastery', 'coconut-colombia', 'https://media.zid.store/thumbs/4a599517-bf28-473f-8032-56b498f2f1cb/73b708f9-fc1a-422c-beda-fb6e60a6fe5f-thumbnail-1000x1000-70.jpeg'),
      ('south-roastery', 'microlot-java-colombia', 'https://media.zid.store/thumbs/4a599517-bf28-473f-8032-56b498f2f1cb/eadba6b1-fa42-4412-90e8-f7dac1a7b95c-thumbnail-1000x1000-70.jpg'),
      ('south-roastery', 'umqa-yemen', 'https://media.zid.store/thumbs/4a599517-bf28-473f-8032-56b498f2f1cb/331a8fcb-4c59-4b08-af8a-a2aec6ef4e8b-thumbnail-1000x1000-70.jpg'),
      ('south-roastery', 'strawberry-colombia', 'https://media.zid.store/thumbs/4a599517-bf28-473f-8032-56b498f2f1cb/2bcba520-81f6-41fc-9478-b109dc003629-thumbnail-1000x1000-70.jpg'),
      ('south-roastery', 'rocket-flower-colombia', 'https://media.zid.store/thumbs/4a599517-bf28-473f-8032-56b498f2f1cb/e7deaa2b-c62c-4fa9-b747-11a47a0dfe88-thumbnail-1000x1000-70.jpg'),
      ('south-roastery', 'kenya', 'https://media.zid.store/thumbs/4a599517-bf28-473f-8032-56b498f2f1cb/f9328afd-b36e-4a43-ae8f-ef156740dbfd-thumbnail-1000x1000-70.jpg'),
      ('south-roastery', 'yunnan-china', 'https://media.zid.store/thumbs/4a599517-bf28-473f-8032-56b498f2f1cb/62b0b720-587d-4ea5-b54e-9b665dd5c5d3-thumbnail-1000x1000-70.jpeg'),
      ('trivali-roastery', 'colombia-grape', 'https://media.zid.store/thumbs/b15df44e-7b6b-49a5-b6f1-79ce412dd73a/a3157ca1-036a-4d39-b125-63baa2abe995-thumbnail-1000x1000.png'),
      ('trivali-roastery', 'excelso-colombia', 'https://media.zid.store/thumbs/b15df44e-7b6b-49a5-b6f1-79ce412dd73a/50b42a96-a9f1-4aa2-9ef0-4e7ef4b16ba3-thumbnail-1000x1000.png'),
      ('trivali-roastery', 'sidamo-ethiopia', 'https://media.zid.store/thumbs/b15df44e-7b6b-49a5-b6f1-79ce412dd73a/21d3b284-0cc2-435c-9acd-1e6f33ba1365-thumbnail-1000x1000.png'),
      ('black-knight-roastery', 'lolit-ethiopia', 'https://media.zid.store/thumbs/f6a65a4f-3e16-4120-a6ce-737855e6e7fc/6cec92bb-739c-47ed-ad65-cda659c935a6-thumbnail-1000x1000.png'),
      ('black-knight-roastery', 'nardos-ethiopia', 'https://media.zid.store/thumbs/f6a65a4f-3e16-4120-a6ce-737855e6e7fc/89f4c8ec-ea8a-4e4e-9dc5-c512d9a7eddc-thumbnail-1000x1000.png'),
      ('trivali-roastery', 'ethiopia-chelchele', 'https://media.zid.store/thumbs/b15df44e-7b6b-49a5-b6f1-79ce412dd73a/8a7f6130-ebc4-4e56-88ab-8dacb5a2ff8e-thumbnail-1000x1000.png'),
      ('black-knight-roastery', 'rio-brazil', 'https://media.zid.store/thumbs/f6a65a4f-3e16-4120-a6ce-737855e6e7fc/a958f135-2e0b-4b5f-8fb3-fee7b7eeec09-thumbnail-1000x1000.png'),
      ('black-knight-roastery', 'milora-costa-rica', 'https://media.zid.store/thumbs/f6a65a4f-3e16-4120-a6ce-737855e6e7fc/85df33a0-af45-4fb1-bc33-91a11c9b9220-thumbnail-1000x1000.png'),
      ('black-knight-roastery', 'altura-colombia', 'https://media.zid.store/thumbs/f6a65a4f-3e16-4120-a6ce-737855e6e7fc/9496a342-b11a-4a75-8d08-30ee2a0b68a1-thumbnail-1000x1000.png'),
      ('trivali-roastery', 'colombia-pink-rose', 'https://media.zid.store/thumbs/b15df44e-7b6b-49a5-b6f1-79ce412dd73a/cbd02a3c-61d2-4b42-a9b3-ac491699465e-thumbnail-1000x1000.png'),
      ('black-knight-roastery', 'guji-ethiopia-bk-process', 'https://media.zid.store/thumbs/f6a65a4f-3e16-4120-a6ce-737855e6e7fc/3a68f967-f488-4086-9aee-7c6167fb3f77-thumbnail-1000x1000.png'),
      ('black-knight-roastery', 'aozora-uganda', 'https://media.zid.store/thumbs/f6a65a4f-3e16-4120-a6ce-737855e6e7fc/6f5c5d96-488e-46c6-9e13-72cabffca02c-thumbnail-1000x1000.png'),
      ('black-horse-roastery', 'colombia-pink-bourbon', 'https://cdn.salla.sa/GNxav/a6c58101-05f2-46ed-ae49-be6e309ceba7-500x500-cZWy13hH5Uxwvgn8AiBe9tzMEFgQF3Ehzgk79Mq4.png'),
      ('black-horse-roastery', 'colombia-rose-lemonade', 'https://cdn.salla.sa/GNxav/c167cafb-d586-482b-96b2-e9407ee6222d-500x500-flVk0v1sbYjxAwR0XGdIcThteq3hNsX6BbpH6y5L.jpg'),
      ('black-horse-roastery', 'colombia-mango', 'https://cdn.salla.sa/GNxav/719ddb26-2480-42ee-b46a-90d0014e6c67-500x500-UZzspXuk3g2rX2NyerCUFbZHnHvXpGhgcbUOQ2H8.jpg'),
      ('black-horse-roastery', 'ethiopia-hambela', 'https://cdn.salla.sa/GNxav/05cd604f-a4e2-4d17-aced-5f3f23d7f695-500x500-9M1d16hBPrB5sEM6lL33ARfJ8y5ZLNBqCDq3372b.png'),
      ('black-horse-roastery', 'brazil-mogiana', 'https://cdn.salla.sa/GNxav/94dd1d70-8769-4598-93b2-97e71d7b6c5f-500x500-QtaRLrENJFV1MJm8lULpwoPfiBIKdKqXVKTRHapz.png'),
      ('black-horse-roastery', 'mix-mohar', 'https://cdn.salla.sa/GNxav/3d52345c-a41f-474e-b4ac-dd6aa9fa8602-500x500-HSYw7Praw9B9YKHrK6RwtVkOrdo8Gdk5VrPqJice.png'),
      ('ananas-roastery', 'jana-haraz', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/54d7c75f-9418-4029-a8d8-ac3cf62eebe1-thumbnail-1000x1000.png'),
      ('ananas-roastery', 'hambela-naso', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/2a3d990b-c8f6-415d-9e0c-bf2d86cb9811-thumbnail-1000x1000.png'),
      ('ananas-roastery', 'yellow-pacamara', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/7efca1b2-fc24-4e25-9c4f-0ada08a77d05-thumbnail-1000x1000.png'),
      ('ananas-roastery', 'passion-vibe', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/2d6a0af9-e414-4f27-89e4-adf6f4648ba7-thumbnail-1000x1000.png'),
      ('ananas-roastery', 'flowers', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/45a11037-5426-4d60-9a59-f80cf1e1771a-thumbnail-1000x1000.png'),
      ('ananas-roastery', 'murabba', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/997f369e-460d-4541-aaf6-40eaf1cc565c-thumbnail-1000x1000.png'),
      ('ananas-roastery', 'grape', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/89c8c643-2da4-4c00-94f1-c21c899f65ad-thumbnail-1000x1000.PNG'),
      ('ananas-roastery', 'lollipop', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/02b29b26-a293-4afe-8530-8046fc3df801-thumbnail-1000x1000.png'),
      ('ananas-roastery', 'jahi-watermelon', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/4c428472-f856-4290-8b1f-f7acf4ac1542-thumbnail-1000x1000.png'),
      ('ananas-roastery', 'isabella-costa-rica', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/acc44ffa-c311-41a8-82e4-f204597f3290-thumbnail-1000x1000.png'),
      ('ananas-roastery', 'king-of-colombia', 'https://media.zid.store/thumbs/9305009e-0c37-44ab-b242-96bb2ef3d779/af90d870-3882-4fc6-a211-b8a568b0dd8b-thumbnail-1000x1000.png'),
      ('kiffa-roastery', 'uraga-yabitu', 'https://media.zid.store/thumbs/52ed14bd-6baf-41c5-b177-f31d72230645/347f00bc-1200-4969-bbd9-0d6d155f9b6c-thumbnail-1000x1000.png'),
      ('kiffa-roastery', 'cauca', 'https://media.zid.store/thumbs/52ed14bd-6baf-41c5-b177-f31d72230645/bc09887d-6ec2-46e3-b4fc-7901bde523b1-thumbnail-1000x1000.png'),
      ('kiffa-roastery', 'west-valley', 'https://media.zid.store/thumbs/52ed14bd-6baf-41c5-b177-f31d72230645/fc7af6ae-377a-4e8a-9938-9df2417a5e80-thumbnail-1000x1000.png'),
      ('kiffa-roastery', 'san-german', 'https://media.zid.store/thumbs/52ed14bd-6baf-41c5-b177-f31d72230645/58580bfa-6db4-421f-84b9-4196d6b02e6b-thumbnail-1000x1000.png'),
      ('kiffa-roastery', 'rafaello-vinhal', 'https://media.zid.store/thumbs/52ed14bd-6baf-41c5-b177-f31d72230645/da943dab-06b8-4b99-9742-ee536e20605e-thumbnail-1000x1000.png')
    ) as t(roaster_slug, coffee_slug, image_url)
  loop
    update public.coffees c
    set product_image_url = r.image_url
    from public.roasters ro
    where c.roaster_id = ro.id
      and ro.slug = r.roaster_slug
      and c.slug = r.coffee_slug
      and (c.product_image_url is distinct from r.image_url);

    update public.recipes rec
    set
      cover_image_url = r.image_url,
      updated_at = now()
    from public.coffees c
    join public.roasters ro on ro.id = c.roaster_id
    where rec.coffee_id = c.id
      and ro.slug = r.roaster_slug
      and c.slug = r.coffee_slug
      and (
        rec.cover_image_url is null
        or rec.cover_image_url like '/images/methods/%'
        or rec.cover_image_url is distinct from r.image_url
      );
  end loop;
end $$;
