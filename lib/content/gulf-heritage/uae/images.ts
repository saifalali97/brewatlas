import type { GulfHeritagePageSlug } from "@/types/gulf-heritage";
import {
  createEmptyGulfHeritagePageImages,
  type GulfHeritageImageAsset,
  type GulfHeritagePageImages,
} from "@/types/gulf-heritage-images";

function asset(url: string, altText: string): GulfHeritageImageAsset {
  return {
    url,
    caption: null,
    altText,
    credit: "Editorial",
    license: "Licensed",
    photographer: null,
  };
}

function gh(slug: string, alt: string): GulfHeritageImageAsset {
  return asset(`/images/gulf-heritage/${slug}.webp`, alt);
}

function culture(name: string, alt: string): GulfHeritageImageAsset {
  return asset(`/images/culture/${name}.webp`, alt);
}

const ROASTER_PAGE_SLUGS = new Set<GulfHeritagePageSlug>([
  "raw-coffee-company",
  "the-espresso-lab",
  "seven-fortunes",
  "cypher-roastery",
  "boom-coffee",
  "gold-box-roastery",
  "nightjar-coffee",
]);

type PageImageExtras = {
  inline?: GulfHeritageImageAsset[];
  stepImages?: GulfHeritageImageAsset[];
  gallery?: GulfHeritageImageAsset[];
  equipment?: GulfHeritageImageAsset[];
  historical?: GulfHeritageImageAsset[];
};

function pageImages(
  slug: GulfHeritagePageSlug,
  heroAlt: string,
  extras: PageImageExtras = {},
): GulfHeritagePageImages {
  const hero = gh(slug, heroAlt);
  const isRoaster = ROASTER_PAGE_SLUGS.has(slug);

  return {
    ...createEmptyGulfHeritagePageImages(),
    hero,
    roasterCover: isRoaster ? hero : null,
    roasterLogo: isRoaster ? hero : null,
    inline: extras.inline ?? [],
    stepImages: extras.stepImages ?? [],
    gallery: extras.gallery ?? [],
    equipment: extras.equipment ?? [],
    historical: extras.historical ?? [],
  };
}

/** Licensed editorial image slots for UAE Gulf Heritage pages. */
export const UAE_PAGE_IMAGES: Record<GulfHeritagePageSlug, GulfHeritagePageImages> = {
  "emirati-arabic-coffee": pageImages("emirati-arabic-coffee", "Emirati Arabic coffee hospitality", {
    inline: [culture("majlis-gathering", "Majlis gathering in the UAE"), gh("coffee-hospitality", "Abu Dhabi evening hospitality")],
    gallery: [culture("uae-coffee-culture-hero", "Al Fahidi heritage district"), culture("arabic-coffee-hero", "Traditional Al Fahidi neighbourhood")],
    historical: [culture("heritage-fort", "Wind tower at Al Seef"), culture("dallah-pour", "Sheikh Zayed Grand Mosque, Abu Dhabi")],
    equipment: [gh("dallah", "Heritage guard at Qasr Al Hosn"), gh("finjan", "Historic Dubai alley at twilight")],
  }),
  dallah: pageImages("dallah", "Traditional dallah coffee service", {
    equipment: [gh("mihmas", "Dubai spice souq"), gh("cardamom", "Cardamom and spices in Dubai")],
    gallery: [culture("dallah-pour", "Grand mosque reflected pool"), culture("arabic-coffee-spices", "Date palms in Dubai")],
    historical: [culture("coffee-etiquette", "Al Fahidi lane"), gh("coffee-serving-traditions", "Al Shindagha architecture")],
    inline: [gh("emirati-arabic-coffee", "Bab Al Shams courtyard hospitality")],
  }),
  finjan: pageImages("finjan", "Finjan cups for Arabic coffee", {
    equipment: [gh("dallah", "Qasr Al Hosn heritage guard"), culture("finjan-cups", "Dubai Marina evening")],
    gallery: [culture("majlis-gathering", "Al Seef heritage café"), gh("coffee-etiquette", "Old Dubai heritage street")],
    inline: [gh("coffee-hospitality", "Abu Dhabi evening gathering")],
    historical: [culture("heritage-fort", "Traditional wind tower"), gh("finjan", "Historic Dubai twilight alley")],
  }),
  mihmas: pageImages("mihmas", "Mihmas spice mortar for Arabic coffee", {
    equipment: [gh("cardamom", "Meal spread in Dubai"), gh("saffron", "Outdoor dining in Dubai")],
    gallery: [culture("arabic-coffee-spices", "Date harvest in Dubai"), gh("mihmas", "Dubai spice souq")],
    inline: [gh("dallah", "Heritage guard at Qasr Al Hosn")],
    historical: [culture("uae-coffee-culture-hero", "Al Fahidi historical neighbourhood")],
  }),
  cardamom: pageImages("cardamom", "Cardamom for Arabic coffee", {
    equipment: [gh("mihmas", "Spice mortar context"), gh("saffron", "Saffron and garden dining")],
    gallery: [culture("arabic-coffee-spices", "Date palms"), gh("black-tea", "Dubai café at night")],
    inline: [gh("karak-chai-step-simmer", "Dubai café preparation")],
    stepImages: [gh("karak-chai-step-simmer", "Simmering karak preparation")],
  }),
  saffron: pageImages("saffron", "Saffron for Arabic coffee", {
    equipment: [gh("cardamom", "Spice and meal spread"), gh("mihmas", "Dubai spice souq")],
    gallery: [gh("saffron-tea", "Desert gathering at golden hour"), culture("emirati-tea-gathering", "Sheikh Zayed Grand Mosque")],
    inline: [gh("adani-tea", "Abu Dhabi twilight skyline")],
    stepImages: [gh("karak-chai-step-milk", "Dubai Marina dining pods")],
  }),
  "coffee-hospitality": pageImages("coffee-hospitality", "Gulf coffee hospitality in majlis", {
    inline: [culture("majlis-gathering", "Al Seef heritage architecture"), gh("emirati-arabic-coffee", "Desert resort courtyard")],
    gallery: [gh("coffee-etiquette", "Person in Al Fahidi"), gh("coffee-serving-traditions", "Al Shindagha")],
    historical: [culture("heritage-fort", "Wind tower at Al Seef"), culture("arabic-coffee-hero", "Al Fahidi warm daylight")],
  }),
  "coffee-etiquette": pageImages("coffee-etiquette", "Arabic coffee serving etiquette", {
    inline: [gh("coffee-hospitality", "Abu Dhabi evening gathering"), culture("coffee-etiquette", "Al Fahidi lane")],
    gallery: [gh("dallah", "Qasr Al Hosn guard"), gh("finjan", "Historic Dubai alley")],
    historical: [culture("dallah-pour", "Sheikh Zayed Grand Mosque arch"), culture("uae-coffee-culture-hero", "Al Fahidi")],
  }),
  "coffee-serving-traditions": pageImages("coffee-serving-traditions", "Traditional Arabic coffee service", {
    inline: [gh("coffee-etiquette", "Old Dubai street"), gh("emirati-arabic-coffee", "Courtyard hospitality")],
    gallery: [culture("majlis-gathering", "Heritage café at Al Seef"), culture("finjan-cups", "Marina evening")],
    historical: [gh("coffee-serving-traditions", "Al Shindagha architecture"), culture("heritage-fort", "Wind tower")],
    equipment: [gh("dallah", "Heritage guard"), gh("finjan", "Majlis doors at twilight")],
  }),
  "karak-chai": pageImages("karak-chai", "Karak chai in everyday UAE life", {
    inline: [culture("karak-tea-pour", "Desert golden hour"), culture("emirati-tea-gathering", "Grand mosque pool")],
    gallery: [gh("black-tea", "Dubai café Arabic signage"), gh("milk-tea", "Dubai brunch café")],
    stepImages: [
      gh("karak-chai-step-simmer", "Karak simmering"),
      gh("karak-chai-step-milk", "Milk and marina dining"),
      culture("karak-tea-pour", "Dubai Creek heritage waterfront"),
    ],
  }),
  "black-tea": pageImages("black-tea", "Emirati black tea service", {
    inline: [gh("karak-chai", "Dubai brunch café"), gh("adani-tea", "Abu Dhabi fountain twilight")],
    gallery: [culture("karak-tea-pour", "Golden hour silhouette"), gh("mint-tea", "Saadiyat Beach Club")],
    stepImages: [gh("karak-chai-step-simmer", "Tea preparation display")],
  }),
  "milk-tea": pageImages("milk-tea", "Milk tea in Gulf tradition", {
    inline: [gh("karak-chai", "Street café dining"), gh("saffron-tea", "Desert group at sunset")],
    gallery: [gh("karak-chai-step-milk", "Marina glass pods"), culture("finjan-cups", "Waterfront evening")],
    stepImages: [gh("karak-chai-step-milk", "Heating milk for karak")],
  }),
  "saffron-tea": pageImages("saffron-tea", "Saffron tea presentation", {
    inline: [gh("saffron", "Garden dining Dubai"), gh("adani-tea", "Abu Dhabi skyline")],
    gallery: [gh("mint-tea", "Saadiyat Beach Club"), culture("emirati-tea-gathering", "Grand mosque")],
    equipment: [gh("cardamom", "Spice spread"), gh("saffron", "Outdoor dining")],
  }),
  "mint-tea": pageImages("mint-tea", "Mint tea gathering", {
    inline: [gh("black-tea", "Dubai café at night"), gh("milk-tea", "Brunch café dishes")],
    gallery: [gh("karak-chai", "Everyday café life"), culture("karak-tea-pour", "Desert sunset")],
  }),
  "adani-tea": pageImages("adani-tea", "Adani spiced tea", {
    inline: [gh("saffron-tea", "Desert gathering"), gh("black-tea", "Night café façade")],
    gallery: [gh("cardamom", "Spice and ingredients"), gh("mihmas", "Spice souq")],
    stepImages: [culture("karak-tea-pour", "Straining karak at the Creek")],
  }),
  "raw-coffee-company": pageImages("raw-coffee-company", "Specialty café interior in Dubai", {
    inline: [gh("the-espresso-lab", "Pedestrians at Shazz Café"), gh("seven-fortunes", "Abra on Dubai Creek")],
    gallery: [gh("cypher-roastery", "Heritage district café"), gh("boom-coffee", "Desert camp gathering")],
    historical: [culture("roast-levels", "Dubai Marina skyline"), culture("arabic-coffee-hero", "Al Fahidi")],
  }),
  "the-espresso-lab": pageImages("the-espresso-lab", "Espresso bar in Dubai", {
    inline: [gh("raw-coffee-company", "Patron at Dubai café"), gh("gold-box-roastery", "Bustling Dubai street")],
    gallery: [gh("nightjar-coffee", "Emirati guard at Abu Dhabi fort"), gh("cypher-roastery", "Al Fahidi person")],
    historical: [culture("roast-levels", "Marina and Ain Dubai"), gh("seven-fortunes", "Creek passengers")],
  }),
  "seven-fortunes": pageImages("seven-fortunes", "Specialty roastery environment", {
    inline: [gh("boom-coffee", "Desert camp community"), gh("raw-coffee-company", "Chic Dubai café")],
    gallery: [gh("the-espresso-lab", "Shazz Café street life"), gh("gold-box-roastery", "Dubai street with people")],
    historical: [culture("majlis-gathering", "Al Seef heritage café"), culture("heritage-fort", "Wind tower")],
  }),
  "cypher-roastery": pageImages("cypher-roastery", "Roastery coffee bar", {
    inline: [gh("seven-fortunes", "Abra on Dubai Creek"), gh("nightjar-coffee", "Abu Dhabi heritage guard")],
    gallery: [gh("raw-coffee-company", "Café patron"), gh("the-espresso-lab", "Street café life")],
    historical: [culture("uae-coffee-culture-hero", "Al Fahidi"), gh("coffee-etiquette", "Old Dubai street")],
  }),
  "boom-coffee": pageImages("boom-coffee", "Premium café workspace", {
    inline: [gh("cypher-roastery", "Heritage district"), gh("gold-box-roastery", "Street life")],
    gallery: [gh("seven-fortunes", "Creek abra"), gh("nightjar-coffee", "Fort guard Abu Dhabi")],
    historical: [culture("arabic-coffee-hero", "Al Fahidi daylight"), culture("coffee-etiquette", "Heritage lane")],
  }),
  "gold-box-roastery": pageImages("gold-box-roastery", "Roasting and retail coffee space", {
    inline: [gh("boom-coffee", "Desert camp gathering"), gh("raw-coffee-company", "Dubai café patron")],
    gallery: [gh("the-espresso-lab", "Shazz Café"), gh("cypher-roastery", "Al Fahidi")],
    historical: [culture("roast-levels", "Marina skyline"), culture("majlis-gathering", "Al Seef")],
  }),
  "nightjar-coffee": pageImages("nightjar-coffee", "Evening specialty coffee atmosphere", {
    inline: [gh("gold-box-roastery", "Bustling street"), gh("black-tea", "Dubai café at night")],
    gallery: [gh("raw-coffee-company", "Evening café patron"), culture("finjan-cups", "Marina evening")],
    historical: [culture("karak-tea-pour", "Desert golden hour"), culture("emirati-tea-gathering", "Grand mosque")],
  }),
};

export function getUaePageImages(slug: GulfHeritagePageSlug): GulfHeritagePageImages {
  return UAE_PAGE_IMAGES[slug] ?? createEmptyGulfHeritagePageImages();
}
