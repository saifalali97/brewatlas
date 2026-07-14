-- Seeds the supported xBloom hardware catalog.

insert into public.xbloom_devices (name, slug) values
  ('xBloom Studio', 'xbloom-studio'),
  ('xBloom Original', 'xbloom-original'),
  ('xBloom Lite', 'xbloom-lite'),
  ('xBloom Omni', 'xbloom-omni')
on conflict (slug) do nothing;
