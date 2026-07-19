/** English page titles and SEO for Gulf Heritage — no unverified editorial body copy. */

function pageSeo(title: string, topic: string) {
  return `Explore ${title} in the UAE — a BrewAtlas Gulf Heritage guide to ${topic}, published only from verified sources.`;
}

function verifiedSeo(title: string, sources: string, topic: string) {
  return `${title} in the UAE — verified Gulf Heritage guide from ${sources}. ${topic}`;
}

function ghPage(title: string, seoTitle: string, seoDescription: string, intro: string | null = null) {
  return { title, intro, seoTitle, seoDescription };
}

export const gulfHeritageCategoriesEn = {
  "arabic-coffee": {
    title: "Arabic Coffee",
    description: "Guides covering Arabic coffee topics in the UAE. Content is added as sources are verified.",
    seoTitle: "Arabic Coffee | UAE Gulf Heritage",
    seoDescription: pageSeo("Arabic Coffee", "gahwa, dallah, hospitality, and serving traditions"),
  },
  "tea-karak": {
    title: "Tea & Karak",
    description: "Guides covering tea and karak topics in the UAE. Content is added as sources are verified.",
    seoTitle: "Tea & Karak | UAE Gulf Heritage",
    seoDescription: pageSeo("Tea & Karak", "karak chai, saffron tea, and Gulf tea culture"),
  },
  "uae-roasters": {
    title: "UAE Specialty Roasters",
    description: "Roaster profiles for the UAE specialty coffee scene. Details are added as sources are verified.",
    seoTitle: "UAE Specialty Roasters | Gulf Heritage",
    seoDescription: pageSeo("UAE specialty roasters", "roasting philosophy, origins, and brewing guidance"),
  },
} as const;

export const gulfHeritagePagesEn = {
  "emirati-arabic-coffee": ghPage(
    "Emirati Arabic Coffee",
    "Emirati Arabic Coffee (Gahwa) | UNESCO Heritage | UAE Gulf Heritage",
    verifiedSeo(
      "Emirati Arabic Coffee",
      "Department of Culture and Tourism – Abu Dhabi and UNESCO",
      "Preparation, hospitality, serving etiquette, and cultural significance of gahwa.",
    ),
  ),
  dallah: ghPage(
    "Dallah",
    "Dallah Coffee Pot | UAE Arabic Coffee Heritage",
    verifiedSeo(
      "The dallah",
      "DCT Abu Dhabi and Gulf News",
      "Three types of Arabic coffee pots used for boiling, filtering, and serving gahwa.",
    ),
  ),
  finjan: ghPage(
    "Finjan",
    "Finjan (Arabic Coffee Cup) | UAE Gulf Heritage",
    verifiedSeo(
      "The finjan",
      "DCT Abu Dhabi and UNESCO",
      "Small cups, guest etiquette, and serving customs for Arabic coffee.",
    ),
  ),
  mihmas: ghPage(
    "Mihmas (Coffee Roaster)",
    "Mihmas Coffee Roasting Spoon | UAE Gulf Heritage",
    verifiedSeo(
      "The mihmas",
      "DCT Abu Dhabi and Gulf News",
      "Traditional coffee roasting tools and ma`ameel equipment in Emirati gahwa.",
    ),
  ),
  cardamom: ghPage("Cardamom", "Cardamom in Arabic Coffee | UAE Gulf Heritage", pageSeo("Cardamom", "spicing Arabic coffee in the Gulf")),
  saffron: ghPage("Saffron", "Saffron in Arabic Coffee | UAE Gulf Heritage", pageSeo("Saffron", "saffron in Arabic coffee traditions")),
  "coffee-hospitality": ghPage(
    "Coffee Hospitality",
    "Arabic Coffee Hospitality & Generosity | UAE Gulf Heritage",
    verifiedSeo(
      "Arabic coffee hospitality",
      "UNESCO and DCT Abu Dhabi",
      "Generosity, majlis customs, and the role of gahwa in Emirati welcome.",
    ),
  ),
  "coffee-etiquette": ghPage(
    "Coffee Etiquette",
    "Arabic Coffee Etiquette | UNESCO & DCT | UAE Gulf Heritage",
    verifiedSeo(
      "Arabic coffee etiquette",
      "UNESCO and DCT Abu Dhabi",
      "Guest and host customs, cup-shaking signals, and serving order.",
    ),
  ),
  "coffee-serving-traditions": ghPage(
    "Coffee Serving Traditions",
    "Gahwa Serving Traditions | UAE Gulf Heritage",
    verifiedSeo(
      "Arabic coffee serving traditions",
      "DCT Abu Dhabi and UNESCO",
      "How gahwa is poured, refilled, and offered across Emirati occasions.",
    ),
  ),
  "karak-chai": ghPage(
    "Karak Chai",
    "Karak Chai Recipe & Culture | UAE Gulf Heritage",
    verifiedSeo(
      "Karak chai",
      "Smithsonian Folklife Festival, Visit Dubai, and Table Tales",
      "History, ingredients, verified recipe, and serving traditions of UAE karak.",
    ),
  ),
  "black-tea": ghPage("Black Tea", "Black Tea | UAE Gulf Heritage", pageSeo("Black Tea", "black tea in Emirati culture — pending review")),
  "milk-tea": ghPage("Milk Tea", "Milk Tea | UAE Gulf Heritage", pageSeo("Milk Tea", "milk tea traditions in the UAE — pending review")),
  "saffron-tea": ghPage(
    "Saffron Tea",
    "Saffron Tea (Zafran Karak) | UAE Gulf Heritage",
    pageSeo("Saffron Tea", "zafran karak and saffron tea — pending review"),
  ),
  "mint-tea": ghPage("Mint Tea", "Mint Tea | UAE Gulf Heritage", pageSeo("Mint Tea", "mint tea in the UAE — pending review")),
  "adani-tea": ghPage("Adani Tea", "Adani Tea | UAE Gulf Heritage", pageSeo("Adani Tea", "Adani tea heritage — pending review")),
  "raw-coffee-company": ghPage(
    "RAW Coffee Company",
    "RAW Coffee Company | Dubai Specialty Roaster | Gulf Heritage",
    verifiedSeo(
      "RAW Coffee Company",
      "official roastery website",
      "Dubai specialty roaster, SCA training campus, and award-winning UAE coffee.",
    ),
  ),
  "the-espresso-lab": ghPage(
    "The Espresso Lab",
    "The Espresso Lab | Dubai Microlot Roaster | Gulf Heritage",
    verifiedSeo(
      "The Espresso Lab",
      "official roastery website",
      "Dubai-born specialty coffee, microlot sourcing, and UAE championship roaster.",
    ),
  ),
  "seven-fortunes": ghPage(
    "Seven Fortunes",
    "Seven Fortunes Coffee Roasters | Dubai | Gulf Heritage",
    verifiedSeo(
      "Seven Fortunes",
      "official roastery website",
      "Dubai roasting, SCA barista training, and espresso equipment consulting.",
    ),
  ),
  "cypher-roastery": ghPage(
    "Cypher Roastery",
    "Cypher Urban Roastery | Dubai | Gulf Heritage",
    verifiedSeo(
      "Cypher Roastery",
      "official roastery website",
      "Dubai specialty coffee roasting, fair trade sourcing, and wholesale supply.",
    ),
  ),
  "boom-coffee": ghPage(
    "Boom Coffee",
    "Boom Coffee | UAE Gulf Heritage — Blocked",
    "Boom Coffee (UAE) — profile blocked until a verified primary source is obtained. No unverified roaster details published.",
  ),
  "gold-box-roastery": ghPage(
    "Gold Box Roastery",
    "Gold Box Coffee Roasters | Dubai | Gulf Heritage",
    verifiedSeo(
      "Gold Box Roastery",
      "official roastery website",
      "Dubai specialty coffee roasting for hotels, cafés, and wholesale customers.",
    ),
  ),
  "nightjar-coffee": ghPage(
    "Nightjar Coffee",
    "Nightjar Coffee Roasters | Alserkal Dubai | Gulf Heritage",
    verifiedSeo(
      "Nightjar Coffee",
      "official roastery website",
      "Dubai artisan roasting, cold brew, and Alserkal Avenue roastery profile.",
    ),
  ),
} as const;

export const gulfHeritageRecipeTitlesEn: Record<string, string> = {
  "smithsonian-karak-chai": "Chai Karak (Cardamom Milk Tea)",
  "table-tales-karak-chai": "Chai Karak (Cardamom Milk Tea)",
  "dct-al-gahwa-activity-guide": "Al Gahwa Activity Guide",
  "dct-gahwa-arabic-coffee-publication": "Gahwa-Arabic Coffee",
  "raw-6-simple-brewing": "6 Simple Brewing Options",
  "raw-cold-brew-recipes": "Cold Brew Mocktail & Cocktail Recipes",
  "raw-espresso-martini": "RAW Espresso Martini",
  "adani-tea-recipe": "Adani Tea recipe",
};
