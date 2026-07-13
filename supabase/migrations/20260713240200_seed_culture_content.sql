-- Seeds the three initial culture_sections ("UAE Coffee Culture", "Arabic
-- Coffee", "Tea") and their culture_topics articles with realistic,
-- production-ready editorial content. All English (locale defaults to
-- 'en'); translated rows can be added later with the same slug/section_id
-- and a different locale.

insert into public.culture_sections (slug, eyebrow, name, description, hero_image_url, seo_title, seo_description, position)
values
  (
    'uae-coffee-culture',
    'Heritage',
    'UAE Coffee Culture',
    $$Coffee has shaped hospitality, ritual, and daily life across the United Arab Emirates for centuries. From the Bedouin encampment to the modern majlis, a shared cup of qahwa has always meant welcome, respect, and belonging. Explore the history, etiquette, and heritage behind every pour.$$,
    '/images/culture/uae-coffee-culture-hero.png',
    'UAE Coffee Culture: History, Hospitality & Heritage',
    'Discover the history of coffee in the UAE, Emirati hospitality traditions, Arabic coffee etiquette, and the role of qahwa in majlis culture and national heritage.',
    1
  ),
  (
    'arabic-coffee',
    'Qahwa',
    'Arabic Coffee',
    $$Qahwa, or Arabic coffee, is far more than a beverage — it is a ritual built around specific tools, spices, and roast styles passed down through generations. Learn about the dallah, the finjan, the cardamom and saffron that flavor every pot, and the customs that govern how it is roasted, brewed, and served.$$,
    '/images/culture/arabic-coffee-hero.png',
    'Arabic Coffee (Qahwa): Tools, Spices & Traditions',
    'A complete guide to traditional Arabic coffee — the dallah, the finjan, cardamom, saffron and cloves, roast levels, serving customs, and classic brewing methods.',
    2
  ),
  (
    'tea',
    'Chai & Karak',
    'Tea',
    $$From roadside karak stalls to the family majlis, tea culture in the UAE is every bit as rich and layered as its coffee traditions. Discover the history and character of karak, black tea, saffron tea, milk tea, Adani tea, and traditional Emirati tea.$$,
    '/images/culture/tea-hero.png',
    'Tea in the UAE: Karak, Saffron Tea & Emirati Traditions',
    'Explore the UAE''s tea culture, from spiced karak and Adani tea to saffron tea, milk tea, and the traditional Emirati tea served across the Emirates.',
    3
  );

insert into public.culture_topics (section_id, slug, title, excerpt, body, hero_image_url, seo_title, seo_description, position)
values
  (
    (select id from public.culture_sections where slug = 'uae-coffee-culture'),
    'history-of-coffee-in-the-uae',
    'The History of Coffee in the UAE',
    $$How coffee traveled from Yemeni ports to Bedouin camps and became one of the defining rituals of Emirati life.$$,
    $$Coffee's journey into the Arabian Peninsula is generally traced back to Yemen in the 15th century, where beans first brought from the Horn of Africa were roasted, ground, and brewed into a drink that spread quickly along trade and pilgrimage routes. From Yemeni ports like Mokha, qahwa moved north and east across Arabia, reaching the settlements and Bedouin encampments of what is today the United Arab Emirates well before the modern state existed.

In the desert and coastal communities that would become the UAE, coffee was never simply a commodity — it arrived alongside a code of conduct. Roasting beans over an open flame, grinding them by hand with a mortar and pestle, and brewing them in a long-spouted dallah became a daily task performed for guests as much as for the household. Archaeological and oral history both point to coffee gatherings as one of the oldest continuous social institutions in the region, predating oil, cities, and modern infrastructure by generations.

Today, that history is preserved deliberately. Heritage villages, national museums, and UNESCO's recognition of Arabic coffee as an Intangible Cultural Heritage of Humanity (shared with Saudi Arabia, Oman, and Qatar) all treat the qahwa ritual as a living artifact of Gulf identity — not a museum piece, but a custom still practiced every day in homes and majlis sittings across the seven emirates.$$,
    '/images/culture/heritage-fort.png',
    'The History of Coffee in the UAE',
    'Trace the history of coffee in the UAE, from Yemeni trade routes and Bedouin camps to its recognition as an Intangible Cultural Heritage tradition.',
    1
  ),
  (
    (select id from public.culture_sections where slug = 'uae-coffee-culture'),
    'emirati-hospitality-traditions',
    'Emirati Hospitality Traditions',
    $$Why offering coffee is the first and most important gesture of Emirati hospitality, and what it signals about welcome and respect.$$,
    $$In Emirati culture, hospitality is not a courtesy extended occasionally — it is a duty, and coffee is its opening line. The moment a guest enters a home, office, or majlis, the offer of a small cup of qahwa is typically the very first act of welcome, often arriving before introductions are finished or seats are settled.

This tradition, known broadly as "diyafa," treats generosity toward guests as a measure of a household's character. Declining a first cup can be seen as unusual, and it is customary to accept at least one serving before gently signaling that no more is needed by shaking the empty finjan slightly from side to side when handing it back. Refilling continues automatically until that signal is given — hosts rarely wait to be asked.

Dates are almost always served alongside the coffee, their sweetness balancing the drink's bitterness and cardamom spice. Together, the pairing of dates and qahwa has become an unofficial symbol of Emirati generosity, appearing at everything from small family visits to state receptions, weddings, and National Day celebrations. Understanding this ritual is often the fastest way for a visitor to understand how deeply hospitality is woven into daily Emirati life.$$,
    '/images/culture/majlis-gathering.png',
    'Emirati Hospitality Traditions',
    'Learn how Emirati hospitality traditions center on coffee and dates, the etiquette of accepting a cup, and why diyafa remains central to UAE culture.',
    2
  ),
  (
    (select id from public.culture_sections where slug = 'uae-coffee-culture'),
    'arabic-coffee-etiquette',
    'Arabic Coffee Etiquette',
    $$The unspoken rules that govern how Arabic coffee is offered, held, and declined — and why they matter.$$,
    $$Arabic coffee etiquette is built around small, precise gestures, and knowing them signals respect for the host as much as for the tradition itself. Coffee is almost always served using the right hand, in a small handleless cup called a finjan, filled only a third to a half full — a light pour is normal, not a sign of stinginess, since guests are refilled as often as they like.

Seating order matters: coffee is typically served beginning with the most senior guest or the person seated closest to the host's right, moving around the room from there. Accepting the first cup is expected, and it is polite to hold the finjan in the right hand as well. When a guest has had enough, the customary signal is a gentle side-to-side wiggle of the empty cup as it is handed back, rather than a verbal refusal — this avoids any implication that the coffee itself was unwanted.

Conversation during service tends to stay light and unhurried; the pause for coffee is itself part of the visit, not an interruption to it. Rushing through the ritual, refusing the very first cup outright, or reaching for the finjan with the left hand are the etiquette missteps most likely to be noticed by an Emirati host.$$,
    '/images/culture/coffee-etiquette.png',
    'Arabic Coffee Etiquette',
    'Understand Arabic coffee etiquette in the UAE: how qahwa is served, the right-hand custom, seating order, and how to politely decline more coffee.',
    3
  ),
  (
    (select id from public.culture_sections where slug = 'uae-coffee-culture'),
    'coffee-in-majlis-culture',
    'Coffee in Majlis Culture',
    $$How the majlis — the traditional gathering space — turns a simple cup of coffee into a forum for conversation, negotiation, and community.$$,
    $$The majlis, meaning "place of sitting," is the traditional gathering room found in Emirati homes, tribal councils, and government buildings alike, and coffee service is one of its defining rituals. Furnished with low seating along the walls and often anchored by a dallah kept warm on hot coals, the majlis is where family matters, business, and community disputes have historically been discussed over an unhurried round of qahwa.

Unlike a formal meeting, the majlis operates on an open-door principle: guests, relatives, and even strangers seeking counsel can traditionally be received, and coffee is the mechanism that opens every conversation regardless of its purpose. Elders are usually served first, and the person responsible for pouring — historically a role of some honor — moves methodically around the room, reading who has finished and who would like more.

Modern majlis spaces, from private homes to government diwans, still follow this same rhythm. Business deals, family announcements, and community decisions in the UAE are still commonly made — or at least opened — over a finjan of coffee, making the majlis one of the clearest surviving links between contemporary Emirati life and its Bedouin-era origins.$$,
    '/images/culture/majlis-gathering.png',
    'Coffee in Majlis Culture',
    'Discover how the traditional Emirati majlis uses coffee service to structure hospitality, seating order, and conversation across generations.',
    4
  ),
  (
    (select id from public.culture_sections where slug = 'uae-coffee-culture'),
    'coffee-and-uae-heritage',
    'Coffee and UAE Heritage',
    $$Why Arabic coffee is treated as a piece of national identity, from UNESCO recognition to National Day celebrations.$$,
    $$As the UAE has grown into one of the world's most modern nations, its leadership and cultural institutions have made a deliberate effort to preserve the customs that predate that transformation — and coffee sits near the top of that list. Heritage sites such as Al Fahidi Historical Neighbourhood in Dubai and the Sheikh Zayed Heritage Village regularly feature live demonstrations of coffee roasting and pouring, presented as a core part of the national story rather than a tourist novelty.

In 2015, Arabic coffee was inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity, a joint nomination between the UAE, Saudi Arabia, Oman, and Qatar that formally recognized the ritual — its preparation, its etiquette, and its symbolism of generosity — as a shared Gulf tradition worth actively protecting for future generations.

That recognition shows up in everyday civic life: government receptions, National Day events, and school heritage programs across the Emirates routinely include a coffee-serving ceremony, teaching younger generations the same gestures once used in Bedouin tents. For many Emiratis, the dallah has become a visual shorthand for heritage itself, appearing in logos, monuments, and currency alongside falcons and palm trees as an emblem of who the country is and where it came from.$$,
    '/images/culture/heritage-fort.png',
    'Coffee and UAE Heritage',
    'See how Arabic coffee became a symbol of UAE national heritage, from UNESCO Intangible Cultural Heritage status to heritage villages and National Day.',
    5
  ),
  (
    (select id from public.culture_sections where slug = 'arabic-coffee'),
    'traditional-arabic-coffee',
    'Traditional Arabic Coffee',
    $$An introduction to qahwa: the light-roasted, cardamom-spiced coffee at the heart of Gulf hospitality.$$,
    $$Traditional Arabic coffee, known as qahwa, is distinct from espresso-based or filter coffee traditions in almost every respect — roast, grind, spice, and serving style are all built around one goal: producing a light, fragrant cup that can be enjoyed continuously in small servings over the course of a long visit. Beans are typically roasted lightly to medium, ground fine, and simmered rather than brewed under pressure.

What most distinguishes qahwa is its spicing. Freshly crushed green cardamom pods are the near-universal addition, added either during brewing or steeped afterward, giving the coffee its signature floral, slightly sweet aroma. Depending on the household or region, saffron and cloves are sometimes added for extra depth and a subtle golden hue, and sugar is rarely used — the coffee is meant to be savored unsweetened, often alongside dates.

The result is a coffee that behaves less like a caffeinated beverage and more like a social pacing mechanism: a small, quickly finished cup that invites another, keeps hands occupied during conversation, and gets refilled as long as a guest remains seated. It is this combination of light spice, small portions, and continuous hospitality that makes qahwa immediately recognizable across the UAE and the wider Gulf.$$,
    '/images/culture/dallah-pour.png',
    'Traditional Arabic Coffee (Qahwa)',
    'What makes traditional Arabic coffee (qahwa) unique — its light roast, cardamom spicing, and the hospitality customs that shape how it is served.',
    1
  ),
  (
    (select id from public.culture_sections where slug = 'arabic-coffee'),
    'the-dallah',
    'The Dallah',
    $$The long-spouted pot used to brew and serve Arabic coffee — and why its shape hasn't changed in centuries.$$,
    $$The dallah is the traditional pot used to brew and pour Arabic coffee, instantly recognizable by its long, curved spout, tall narrow body, and hinged lid. Traditionally made from hammered brass or copper, older dallahs were handcrafted by regional metalworkers and often decorated with etched geometric patterns; many households still keep an ornate, ceremonial dallah for guests alongside a plainer one used for daily brewing.

Its shape is entirely functional. The narrow spout allows the coffee to be poured in a thin, controlled stream directly into a finjan without disturbing the fine sediment that naturally settles at the bottom of the pot, while the tall body keeps the liquid hot over an extended serving period. In more traditional settings, the dallah sits directly on hot coals or a small stove throughout a gathering, being topped up and reheated rather than brewed fresh for every round.

Beyond its practical role, the dallah has become one of the most recognizable visual symbols of the UAE and the wider Gulf. It appears on currency, government seals, hotel logos, and public art, standing in for hospitality itself in the same way a teapot might elsewhere — a single object that instantly communicates welcome.$$,
    '/images/culture/dallah-pour.png',
    'The Dallah: Traditional Arabic Coffee Pot',
    'Learn about the dallah, the long-spouted brass or copper pot used to brew and serve Arabic coffee, and its role as a symbol of Gulf hospitality.',
    2
  ),
  (
    (select id from public.culture_sections where slug = 'arabic-coffee'),
    'the-finjan',
    'The Finjan',
    $$The small, handleless cup Arabic coffee is served in, and the etiquette built around holding and returning it.$$,
    $$The finjan is the small, handleless cup used to serve Arabic coffee, typically holding only a few sips' worth of liquid. Its lack of a handle is deliberate: the cup is meant to be held gently by the rim or base with the right hand, cooling quickly enough that a guest can comfortably drink several rounds without waiting long between pours.

Traditional finjans are often porcelain or metal, sometimes finished in gold trim or set within a matching metal holder called a "zarf," which protects the drinker's fingers from the heat of the cup and adds a decorative flourish to the coffee service. Sets of finjans are commonly gifted for weddings or displayed as part of a formal majlis coffee setting, reflecting their significance beyond simple tableware.

The finjan is also the instrument of one of the ritual's key etiquette signals: because verbally refusing more coffee can be considered impolite, a guest instead gently shakes the empty cup from side to side while returning it to the host or server, a small gesture that communicates "no more, thank you" without a word being exchanged.$$,
    '/images/culture/finjan-cups.png',
    'The Finjan: Traditional Arabic Coffee Cup',
    'Discover the finjan, the small handleless cup used to serve Arabic coffee, and the etiquette gesture used to politely decline another pour.',
    3
  ),
  (
    (select id from public.culture_sections where slug = 'arabic-coffee'),
    'cardamom-in-arabic-coffee',
    'Cardamom in Arabic Coffee',
    $$Why green cardamom is the single most important spice in a cup of qahwa.$$,
    $$If Arabic coffee has one defining flavor beyond the coffee itself, it is cardamom. Green cardamom pods are crushed or lightly ground and added during the brewing process, releasing an aromatic oil that gives qahwa its distinctive floral, slightly citrus-like fragrance and softens the natural bitterness of the light roast beneath it.

The exact ratio of cardamom to coffee varies by household, region, and personal taste — some brews use just a pod or two per pot for a subtle background note, while others lean heavily on cardamom until it becomes the dominant aroma, with the coffee itself playing a supporting role. In many recipes, the pods are added directly to the simmering pot and left in during serving, occasionally finding their way into the finjan itself.

Beyond flavor, cardamom carries practical and cultural weight: it has long been valued in Gulf cuisine as a digestive aid and a marker of a well-stocked, generous household, since good cardamom was historically an imported luxury. Its presence in a pot of qahwa is a small but unmistakable signal of care taken in preparing a drink meant to honor a guest.$$,
    '/images/culture/arabic-coffee-spices.png',
    'Cardamom in Arabic Coffee',
    'Why green cardamom defines the taste of Arabic coffee, how much is used, and what it signals about hospitality and preparation.',
    4
  ),
  (
    (select id from public.culture_sections where slug = 'arabic-coffee'),
    'saffron-in-arabic-coffee',
    'Saffron in Arabic Coffee',
    $$How a few threads of saffron add color, fragrance, and a touch of luxury to a pot of qahwa.$$,
    $$Saffron appears in Arabic coffee less often than cardamom, but where it is used it adds an unmistakable touch of luxury. A few threads steeped into the pot lend qahwa a warm golden tint and a delicate, slightly sweet floral aroma that layers on top of the coffee's own bitterness and the cardamom's spice, producing a noticeably richer, more fragrant cup.

Because true saffron has historically been one of the most expensive spices in the world by weight, its use in coffee has often carried a social signal similar to serving a particularly fine roast or an ornate dallah — a sign of hospitality taken a step further for an honored guest or a special occasion such as a wedding, Eid gathering, or the reception of a particularly senior visitor.

Regional preferences vary: households along the UAE's coast and in areas with stronger historical trade ties to Iran and South Asia, where saffron cultivation and trade are more prominent, tend to use it more liberally in both coffee and tea. Elsewhere it remains an occasional flourish rather than an everyday ingredient, reserved for the pots poured on days that call for something extra.$$,
    '/images/culture/arabic-coffee-spices.png',
    'Saffron in Arabic Coffee',
    'Discover how saffron is used in Arabic coffee to add color, fragrance, and a sense of occasion to the traditional qahwa recipe.',
    5
  ),
  (
    (select id from public.culture_sections where slug = 'arabic-coffee'),
    'cloves-in-arabic-coffee',
    'Cloves in Arabic Coffee',
    $$The warm, slightly bitter spice that some Gulf coffee traditions add alongside cardamom.$$,
    $$Cloves show up in some regional variations of Arabic coffee as a secondary spice alongside cardamom, contributing a warm, slightly bitter, almost peppery depth that balances cardamom's brighter, more floral notes. A small number of whole cloves are typically added directly to the pot during brewing and simmered along with the ground coffee, releasing their oils gradually rather than being steeped separately.

The exact tradition of adding cloves tends to vary more by family and region than cardamom does — some households consider it essential to a properly spiced pot, while others leave it out entirely in favor of a purer cardamom-forward cup. Where it is used, cloves are almost always a background note rather than the dominant flavor, meant to round out the coffee's aroma rather than announce themselves individually.

Because cloves have a stronger, more assertive flavor than cardamom, they are usually used sparingly — often just two or three cloves per pot — since too many can quickly overwhelm the coffee's other qualities. Getting that balance right is considered a small mark of a skilled coffee preparer within the household.$$,
    '/images/culture/arabic-coffee-spices.png',
    'Cloves in Arabic Coffee',
    'Learn how cloves are used as a secondary spice in some Arabic coffee traditions, adding warmth and depth alongside cardamom.',
    6
  ),
  (
    (select id from public.culture_sections where slug = 'arabic-coffee'),
    'understanding-roast-levels',
    'Understanding Roast Levels',
    $$Why Arabic coffee is almost always roasted lighter than Western filter or espresso coffee — and what that changes in the cup.$$,
    $$Roast level is one of the clearest differences between Arabic coffee and many Western coffee traditions. While espresso and much filter coffee lean toward medium or dark roasts to build body and reduce acidity, traditional qahwa is most commonly roasted light to medium, sometimes stopping well before the beans develop significant color change at all — a style occasionally referred to as a "white" or "green" roast in the lightest cases.

This lighter approach is deliberate. A lighter roast preserves more of the bean's natural acidity and lets the added spices, particularly cardamom, come through clearly rather than competing with heavy roast bitterness. It also produces a noticeably lighter-bodied, more tea-like cup than the thick, syrupy coffee associated with darker roast traditions elsewhere in the world.

Darker roasts do exist within Gulf coffee culture and are sometimes preferred in certain households or regions, producing a heavier, more bittersweet cup closer to what many international drinkers expect from "coffee." But the lighter, spice-forward roast remains the signature style most closely associated with traditional Emirati and wider Gulf hospitality, and it is what most visitors encounter first when offered a finjan of qahwa.$$,
    '/images/culture/roast-levels.png',
    'Understanding Arabic Coffee Roast Levels',
    'Why Arabic coffee (qahwa) is typically roasted lighter than espresso or filter coffee, and how roast level changes the flavor of the cup.',
    7
  ),
  (
    (select id from public.culture_sections where slug = 'arabic-coffee'),
    'serving-traditions',
    'Serving Traditions',
    $$The customs and small ceremonies that turn pouring a cup of coffee into an act of respect.$$,
    $$Serving Arabic coffee follows a set of customs that go well beyond simply pouring a drink. The person serving — traditionally the host, a family member, or in more formal settings a dedicated server — moves through the room in a deliberate order, generally beginning with the eldest or most senior guest and working outward, holding several finjans stacked in one hand and the dallah in the other.

Each cup is poured only partially full, a light pour that is refilled as soon as it is emptied rather than served in one large serving. This constant, attentive refilling is itself part of the hospitality being offered: an empty cup left unfilled for too long can be read as inattentiveness, so servers stay close and watch for cues throughout the gathering.

The serving itself is typically accompanied by dates or occasionally other sweets, offered from a separate tray either just before or alongside the coffee. In more formal or ceremonial settings — weddings, official receptions, National Day events — the coffee service can become almost choreographed, with servers dressed in traditional attire moving in a set pattern that itself becomes part of the occasion's presentation.$$,
    '/images/culture/finjan-cups.png',
    'Arabic Coffee Serving Traditions',
    'Explore the serving customs behind Arabic coffee — pouring order, portion size, continuous refilling, and the role of dates in the ritual.',
    8
  ),
  (
    (select id from public.culture_sections where slug = 'arabic-coffee'),
    'traditional-brewing-methods',
    'Traditional Brewing Methods',
    $$How qahwa is actually made, from roasting green beans to the final simmer in the dallah.$$,
    $$Traditional Arabic coffee brewing is a multi-step process that, in its full ceremonial form, starts with raw green coffee beans rather than pre-roasted grounds. Beans are roasted over an open flame or on a stovetop in a shallow long-handled pan, stirred continuously to reach an even, typically light-to-medium color, then cooled briefly before grinding — historically by hand with a mortar and pestle, though electric grinders are common today.

The ground coffee is added to water in the dallah along with crushed cardamom (and, depending on the household, saffron or cloves) and brought to a slow simmer rather than a hard boil, which would make the coffee bitter and disturb the fine sediment. Some methods bring the pot just to the point of foaming at the rim several times, removing it from the heat each time, before letting it settle.

Once brewed, the coffee is typically left to steep briefly so the grounds settle toward the bottom, allowing it to be poured cleanly through the dallah's narrow spout without needing a separate filter. The pot is then kept warm — traditionally over hot coals — so it can be poured continuously throughout a visit rather than brewed fresh cup by cup.$$,
    '/images/culture/dallah-pour.png',
    'Traditional Arabic Coffee Brewing Methods',
    'A step-by-step look at how traditional Arabic coffee is brewed, from roasting green beans to simmering qahwa with cardamom in a dallah.',
    9
  ),
  (
    (select id from public.culture_sections where slug = 'tea'),
    'karak',
    'Karak: The UAE''s Favorite Tea',
    $$How a strong, spiced, condensed-milk tea became one of the most beloved everyday drinks in the Emirates.$$,
    $$Karak is, by a wide margin, the most popular everyday tea in the UAE — a strong black tea simmered with milk, sugar, and warming spices, traditionally cardamom and sometimes saffron or ginger, until it turns a deep reddish-brown. The name comes from the Hindi/Urdu word for "strong," a fitting description for a tea meant to be bold enough to stand up to generous amounts of milk and sugar without losing its character.

Its popularity in the UAE owes much to the country's South Asian communities, who brought the tea-making traditions of the Indian subcontinent with them and adapted them into what is now a distinctly Emirati staple. Small karak stalls and cafeterias — often just a window and a few plastic chairs — are found on nearly every street corner, serving the tea in small disposable cups at almost any hour, day or night.

Karak has become something of a social equalizer in the UAE: unlike the more ceremonial qahwa service, it is an inexpensive, unpretentious drink enjoyed by laborers, office workers, and tourists alike, often shared during a short break rather than a formal sitting. That accessibility, combined with its rich, spiced flavor, has made karak arguably the single most consumed hot beverage in the country today.$$,
    '/images/culture/karak-tea-pour.png',
    'Karak Tea: The UAE''s Favorite Tea',
    'Discover karak, the strong, spiced, condensed-milk tea found at street stalls across the UAE, and how it became a beloved everyday drink.',
    1
  ),
  (
    (select id from public.culture_sections where slug = 'tea'),
    'black-tea',
    'Black Tea Traditions',
    $$The plain, strong black tea served throughout the day in Emirati homes, often alongside — not instead of — coffee.$$,
    $$Alongside qahwa and karak, plain black tea (often called "chai" or simply "shai") holds a steady, everyday place in Emirati households. Brewed strong and typically served in small glass cups rather than mugs, it is common throughout the day — with breakfast, mid-morning, after lunch, and again in the evening — functioning as a lighter, less spiced counterpart to the more ceremonial coffee service.

Preparation is usually simple: loose black tea leaves steeped in boiling water, sometimes with a stick of cinnamon, a few mint leaves, or a light touch of sugar, though sweetness levels vary widely by household preference. Unlike karak, milk is optional rather than essential, and many Emiratis prefer their everyday black tea served plain, allowing the tea itself to be the focus rather than a canvas for spice and dairy.

Black tea's role is largely social and rhythmic rather than ceremonial — it is the drink that fills the gaps between more formal coffee servings, offered casually to family, neighbors, and coworkers throughout the day. Its simplicity and constant presence make it one of the most quietly consistent threads running through daily Emirati life.$$,
    '/images/culture/emirati-tea-gathering.png',
    'Black Tea Traditions in the UAE',
    'Learn about everyday black tea (chai) traditions in the UAE — how it is brewed, when it is served, and its role alongside Arabic coffee.',
    2
  ),
  (
    (select id from public.culture_sections where slug = 'tea'),
    'saffron-tea',
    'Saffron Tea',
    $$A golden, fragrant tea reserved for special occasions and honored guests.$$,
    $$Saffron tea takes the everyday black or green tea base and elevates it with a small pinch of saffron threads, steeped until the liquid takes on a warm golden-amber hue and a distinctive floral, slightly honeyed aroma. It is often finished with a touch of sugar and, in some households, a splash of milk or a few crushed cardamom pods to round out the flavor further.

Because saffron remains one of the most expensive spices by weight, saffron tea tends to appear on occasions that call for a little extra care — hosting an important guest, celebrating Eid, or marking a family milestone — in much the same spirit as adding saffron to a pot of qahwa. Its preparation is simple, but its presence at the table signals that the gathering is a special one.

Saffron tea is also valued for qualities beyond flavor in many households, where it has long been associated in folk tradition with soothing and warming properties, often served toward the end of a meal or during colder winter evenings. Whether served for its taste, its symbolism, or both, it remains one of the more luxurious entries in the UAE's everyday tea repertoire.$$,
    '/images/culture/karak-tea-pour.png',
    'Saffron Tea Traditions in the UAE',
    'Explore saffron tea, a golden, fragrant tea served on special occasions across the UAE, and why saffron makes it a luxury addition.',
    3
  ),
  (
    (select id from public.culture_sections where slug = 'tea'),
    'milk-tea',
    'Milk Tea',
    $$The creamy, lightly spiced tea that sits between plain black tea and a full karak.$$,
    $$Milk tea occupies a comfortable middle ground in the UAE's everyday tea culture, richer and creamier than plain black tea but generally less heavily spiced and less strongly brewed than a full karak. It is made by steeping black tea leaves and simmering them briefly with milk, producing a smooth, pale-brown cup that is gentler on the palate while still carrying more body than tea served without dairy.

Many households adjust the milk-to-water ratio to taste, and a light dusting of cardamom or a small piece of ginger is a common addition, though the spicing is typically kept subtle compared to karak's bolder profile. Sweetness levels vary as well, with sugar often added directly to the pot during simmering rather than stirred in afterward, allowing it to dissolve evenly and blend with the milk.

Milk tea is frequently the everyday choice for children and for anyone who prefers a softer, less intense drink than karak while still wanting something more substantial than a plain cup of black tea — making it one of the most commonly brewed teas in Emirati kitchens on an ordinary day.$$,
    '/images/culture/karak-tea-pour.png',
    'Milk Tea Traditions in the UAE',
    'Discover milk tea, the creamy, lightly spiced everyday tea served across Emirati households as a gentler alternative to karak.',
    4
  ),
  (
    (select id from public.culture_sections where slug = 'tea'),
    'adani-tea',
    'Adani Tea',
    $$A heavily spiced tea named after the Yemeni port city of Aden, known for its bold blend of spices.$$,
    $$Adani tea takes its name from Aden, the historic Yemeni port city, and reflects the deep, centuries-old trade and cultural ties between Yemen and the Gulf coast. It is typically a black tea base simmered with a generous blend of spices — commonly cardamom, cinnamon, cloves, and sometimes ginger or fennel — producing a bold, aromatic cup noticeably more heavily spiced than everyday black tea or even karak.

Preparation usually involves simmering the spice blend directly in water before adding tea leaves and milk, allowing the spices to fully infuse the liquid rather than sitting as a light garnish. The result is a tea that leans closer to a spiced chai in character, with a warmth and complexity that many drinkers describe as more "peppery" or "earthy" than the sweeter, milk-forward profile of karak.

Adani tea's presence in the UAE speaks to the broader story of Gulf tea culture as a crossroads tradition, shaped by Yemeni, South Asian, and East African influences arriving together through historic trade routes. It remains a favorite among those who enjoy a stronger, more heavily spiced cup than the UAE's more familiar everyday teas.$$,
    '/images/culture/emirati-tea-gathering.png',
    'Adani Tea Traditions',
    'Learn about Adani tea, a heavily spiced black tea named after the port city of Aden, and its roots in Yemeni-Gulf trade traditions.',
    5
  ),
  (
    (select id from public.culture_sections where slug = 'tea'),
    'traditional-emirati-tea',
    'Traditional Emirati Tea',
    $$How tea earned a permanent seat alongside qahwa in the Emirati hospitality ritual.$$,
    $$While Arabic coffee tends to receive most of the international attention, tea has long held an equally steady place in Emirati hospitality — often served alongside qahwa rather than in competition with it. A typical gathering might open with coffee and dates, then transition to tea later in the visit, giving guests a lighter, sweeter option as the sitting continues.

Traditional Emirati tea draws on a wide range of influences absorbed through centuries of trade — Indian and Pakistani spicing techniques, Yemeni blends like Adani tea, Iranian saffron traditions, and the UAE's own preference for cardamom — resulting in a tea culture that is genuinely varied rather than built around a single fixed recipe. What ties it together is less a specific formula and more a shared role: tea as the warm, unhurried companion to conversation.

Whether it is a glass of karak from a corner stall, a pot of saffron tea served for a special guest, or plain black tea offered throughout an ordinary afternoon, tea in the UAE functions the same way coffee does — as a small, repeated gesture of welcome that keeps a gathering going long after the first cup has been poured.$$,
    '/images/culture/emirati-tea-gathering.png',
    'Traditional Emirati Tea Culture',
    'Explore how traditional Emirati tea culture developed alongside Arabic coffee, blending Indian, Yemeni, and Iranian influences into daily hospitality.',
    6
  );
