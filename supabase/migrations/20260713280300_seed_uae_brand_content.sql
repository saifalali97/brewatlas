-- Seed data for the UAE brand identity foundation: heritage highlight
-- cards, UAE-featured roasters (placeholder branding only, no real
-- trademarks), and example coffee-map locations across several emirates.

-- uae_heritage_highlights ---------------------------------------------------
-- One highlight per requirement-2 topic, each deep-linking to the relevant
-- long-form culture_topics article (see 20260713240200_seed_culture_content.sql)
-- instead of duplicating its body text.

insert into public.uae_heritage_highlights
  (slug, category, title, summary, icon_key, related_section_slug, related_topic_slug, position)
values
  (
    'history-of-coffee-in-the-uae',
    'history',
    'A Coastal Trade Route Turned Tradition',
    'Coffee reached the Trucial Coast centuries ago along Gulf trade routes, and qahwa has been a fixture of Emirati daily life ever since.',
    'ScrollText',
    'uae-coffee-culture',
    'history-of-coffee-in-the-uae',
    1
  ),
  (
    'majlis-culture',
    'majlis',
    'The Majlis: Where Coffee Meets Conversation',
    'The majlis is the heart of Emirati hospitality -- a sitting room where coffee, dates, and unhurried conversation welcome every guest.',
    'Users',
    'uae-coffee-culture',
    'coffee-in-majlis-culture',
    2
  ),
  (
    'emirati-hospitality',
    'hospitality',
    'Hospitality as a National Value',
    'Offering coffee to a guest -- however brief the visit -- is one of the clearest everyday expressions of Emirati hospitality.',
    'HeartHandshake',
    'uae-coffee-culture',
    'emirati-hospitality-traditions',
    3
  ),
  (
    'arabic-coffee-etiquette',
    'etiquette',
    'The Quiet Rules of Serving Qahwa',
    'From the right hand to the gentle shake of an empty finjan, Arabic coffee etiquette is a small, precise choreography of respect.',
    'HandHeart',
    'uae-coffee-culture',
    'arabic-coffee-etiquette',
    4
  ),
  (
    'the-brass-dallah',
    'dallah',
    'The Dallah: A Vessel of Heritage',
    'The long-spouted brass or copper dallah is as much a symbol of Emirati identity as it is a brewing vessel, often passed down for generations.',
    'Coffee',
    'arabic-coffee',
    'the-dallah',
    5
  ),
  (
    'the-finjan-tradition',
    'finjan',
    'The Finjan: Small Cup, Big Meaning',
    'Served handleless and half-full, the finjan is refilled as long as a guest wishes to stay -- and tipped gently to signal "enough."',
    'CupSoda',
    'arabic-coffee',
    'the-finjan',
    6
  ),
  (
    'coffee-serving-customs',
    'serving',
    'Serving Customs, From Home to Wedding Hall',
    'Coffee-serving order and ceremony scale from a simple family visit to grand receptions -- but the spirit of welcome stays the same.',
    'Sparkles',
    'arabic-coffee',
    'serving-traditions',
    7
  ),
  (
    'unesco-arabic-coffee-heritage',
    'unesco',
    'Recognized as Intangible Cultural Heritage',
    'Arabic coffee culture -- a symbol of generosity across the Gulf -- is inscribed on UNESCO''s Representative List of the Intangible Cultural Heritage of Humanity.',
    'Landmark',
    'uae-coffee-culture',
    'coffee-and-uae-heritage',
    8
  );

-- roasters: UAE-featured additions ------------------------------------------
-- Fictional, placeholder-branded roasters (no real trademarks/logos) used to
-- populate the "UAE Featured Roasters" brand section.

insert into public.roasters (name, slug, country, emirate, city, website, logo_url, description, featured, is_uae)
values
  (
    'Dune & Ember Roasting Co.',
    'dune-and-ember-roasting-co',
    'United Arab Emirates',
    'Dubai',
    'Al Quoz',
    'https://example.com/dune-and-ember',
    null,
    'A small-batch roastery in Al Quoz''s creative district, known for washed Yemeni and Ethiopian lots roasted for the UAE''s specialty cafes.',
    true,
    true
  ),
  (
    'Seven Sands Coffee',
    'seven-sands-coffee',
    'United Arab Emirates',
    'Abu Dhabi',
    'Al Reem Island',
    'https://example.com/seven-sands',
    null,
    'Named for the seven emirates, this roastery pairs modern light-roast profiles with traditional qahwa blends spiced with cardamom and saffron.',
    true,
    true
  ),
  (
    'Majlis Roasters',
    'majlis-roasters',
    'United Arab Emirates',
    'Sharjah',
    'Al Qasimia',
    'https://example.com/majlis-roasters',
    null,
    'A family-run roastery built around the majlis tradition of hospitality, supplying dallahs of fresh-brewed qahwa to community gatherings.',
    false,
    true
  ),
  (
    'Pearl Coast Coffee Traders',
    'pearl-coast-coffee-traders',
    'United Arab Emirates',
    'Ras Al Khaimah',
    'Al Nakheel',
    'https://example.com/pearl-coast',
    null,
    'Coffee traders with roots in the Gulf''s pearl-diving heritage, sourcing beans through cooperatives across East Africa and Yemen.',
    false,
    true
  ),
  (
    'Al Sadu Coffee House',
    'al-sadu-coffee-house',
    'United Arab Emirates',
    'Al Ain',
    'Al Ain Oasis',
    'https://example.com/al-sadu-coffee',
    null,
    'Named after the Al Sadu weaving tradition, this oasis-city roastery blends heritage motifs with a contemporary specialty-coffee menu.',
    true,
    true
  ),
  (
    'Falcon''s Rest Roastery',
    'falcons-rest-roastery',
    'United Arab Emirates',
    'Fujairah',
    'Fujairah City',
    'https://example.com/falcons-rest',
    null,
    'An East Coast roastery supplying Fujairah and Kalba''s specialty cafes, with a focus on medium-roast single origins.',
    false,
    true
  )
on conflict (name) do nothing;

-- uae_coffee_map_locations ---------------------------------------------------
-- Example coffee shops and roasteries across several emirates. Coordinates
-- are approximate city-level placements for demo purposes.

insert into public.uae_coffee_map_locations
  (slug, name, location_type, emirate, city, address, latitude, longitude, description, website, roaster_id, featured)
values
  (
    'dune-and-ember-al-quoz',
    'Dune & Ember Roasting Co. -- Al Quoz',
    'roastery_cafe',
    'Dubai',
    'Al Quoz',
    'Al Quoz Industrial Area 1, Dubai',
    25.139200,
    55.229900,
    'Flagship roastery and cafe pouring single-origin qahwa alongside modern filter coffee.',
    'https://example.com/dune-and-ember',
    (select id from public.roasters where slug = 'dune-and-ember-roasting-co'),
    true
  ),
  (
    'seven-sands-reem-island',
    'Seven Sands Coffee -- Al Reem Island',
    'roastery_cafe',
    'Abu Dhabi',
    'Al Reem Island',
    'Shams Boulevard, Al Reem Island, Abu Dhabi',
    24.497900,
    54.404600,
    'Waterfront roastery cafe known for saffron-spiced qahwa and karak flights.',
    'https://example.com/seven-sands',
    (select id from public.roasters where slug = 'seven-sands-coffee'),
    true
  ),
  (
    'majlis-roasters-qasimia',
    'Majlis Roasters -- Al Qasimia',
    'roaster',
    'Sharjah',
    'Al Qasimia',
    'Al Qasimia, Sharjah',
    25.348800,
    55.401200,
    'Roastery supplying dallahs of fresh qahwa to community majlis gatherings across Sharjah.',
    'https://example.com/majlis-roasters',
    (select id from public.roasters where slug = 'majlis-roasters'),
    false
  ),
  (
    'pearl-coast-al-nakheel',
    'Pearl Coast Coffee Traders -- Al Nakheel',
    'roaster',
    'Ras Al Khaimah',
    'Al Nakheel',
    'Al Nakheel, Ras Al Khaimah',
    25.784600,
    55.942100,
    'Trading-house roastery with a small tasting counter overlooking the RAK creek.',
    'https://example.com/pearl-coast',
    (select id from public.roasters where slug = 'pearl-coast-coffee-traders'),
    false
  ),
  (
    'al-sadu-coffee-house-oasis',
    'Al Sadu Coffee House -- Al Ain Oasis',
    'roastery_cafe',
    'Abu Dhabi',
    'Al Ain',
    'Al Ain Oasis, Al Ain',
    24.226800,
    55.760300,
    'Oasis-side cafe pairing heritage-motif interiors with a contemporary specialty menu.',
    'https://example.com/al-sadu-coffee',
    (select id from public.roasters where slug = 'al-sadu-coffee-house'),
    true
  ),
  (
    'falcons-rest-fujairah-city',
    'Falcon''s Rest Roastery -- Fujairah City',
    'roaster',
    'Fujairah',
    'Fujairah City',
    'Corniche Road, Fujairah City',
    25.121700,
    56.336200,
    'East Coast roastery and small tasting room overlooking the Gulf of Oman.',
    'https://example.com/falcons-rest',
    (select id from public.roasters where slug = 'falcons-rest-roastery'),
    false
  ),
  (
    'old-dubai-qahwa-house',
    'Old Dubai Qahwa House',
    'cafe',
    'Dubai',
    'Al Fahidi',
    'Al Fahidi Historical Neighbourhood, Dubai',
    25.263200,
    55.298800,
    'A heritage-district cafe serving traditional qahwa with dates in a restored courtyard house.',
    null,
    null,
    true
  ),
  (
    'corniche-karak-corner',
    'Corniche Karak Corner',
    'cafe',
    'Abu Dhabi',
    'Corniche',
    'Abu Dhabi Corniche, Abu Dhabi',
    24.475700,
    54.331600,
    'A waterfront kiosk known for karak and adani tea, popular with evening walkers.',
    null,
    null,
    false
  ),
  (
    'ajman-majlis-cafe',
    'Ajman Majlis Cafe',
    'majlis',
    'Ajman',
    'Al Nuaimiya',
    'Al Nuaimiya, Ajman',
    25.407700,
    55.483300,
    'A majlis-style seating cafe hosting community gatherings over qahwa and Arabic tea.',
    null,
    null,
    false
  );
