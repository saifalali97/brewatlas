import type { GulfHeritagePageSlug } from "@/types/gulf-heritage";
import type { GulfHeritageReference, GulfHeritageReferenceType } from "@/types/gulf-heritage-reference";

type ResearchSourceType =
  | "official"
  | "government"
  | "book"
  | "museum"
  | "news"
  | "cultural"
  | "reference";

function mapSourceType(type: ResearchSourceType): GulfHeritageReferenceType {
  if (type === "cultural" || type === "reference") return "research";
  return type;
}

function ref(
  title: string,
  organization: string | null,
  author: string | null,
  publishedDate: string | null,
  url: string | null,
  type: ResearchSourceType,
): GulfHeritageReference {
  return {
    title,
    organization,
    author,
    publishedDate,
    accessedDate: "2026-07-19",
    url,
    type: mapSourceType(type),
  };
}

const DCT = "Department of Culture and Tourism – Abu Dhabi";
const DCT_GAHWA_PUB = ref(
  "Gahwa-Arabic coffee",
  DCT,
  null,
  null,
  "https://abudhabiculture.ae/en/Cultural-Resources/Publications/Gahwa-Arabic-coffee",
  "government",
);
const DCT_GAHWA_ICH = ref(
  "Gahwa (Arabic coffee): UNESCO inscribed element",
  DCT,
  null,
  null,
  "https://abudhabiculture.ae/en/cultural-heritage/intangible/unesco-ich-inscribed-elements/gahwa-arabic-coffee",
  "government",
);
const DCT_AL_GAHWA = ref(
  "Al Gahwa Activity Guide",
  DCT,
  null,
  null,
  "https://abudhabiculture.ae/en/Cultural-Resources/Learning-Resources/Cultural-Heritage/Al-Gahwa",
  "government",
);
const DCT_BAIT_AL_GAHWA = ref(
  "Bait Al Gahwa cultural platform",
  DCT,
  null,
  null,
  "https://abudhabiculture.ae/en/cultural-programmes/cultural-platforms/bait-al-gahwa",
  "government",
);
const BAIT_AL_GAHWA = ref(
  "Bait Al Gahwa — Home of Gahwa Heritage",
  "Department of Culture and Tourism – Abu Dhabi (Bait Al Gahwa)",
  null,
  null,
  "https://baitalgahwa.ae/en",
  "official",
);
const UNESCO_GAHWA = ref(
  "Arabic coffee, a symbol of generosity",
  "UNESCO Intangible Cultural Heritage",
  null,
  "2015",
  "https://ich.unesco.org/en/RL/arabic-coffee-a-symbol-of-generosity-02111",
  "official",
);
const SCA_WOC = ref(
  "World of Coffee Dubai to host the 2026 Cezve/Ibrik Championship",
  "Specialty Coffee Association / World Coffee Championships",
  null,
  "2025",
  "https://wcc.coffee/latest-news/announcing-wcc-dubai-2026-cic",
  "official",
);
const GULF_NEWS_SHD = ref(
  "Visitors to Sharjah Heritage Days can experience Bedouin coffee tradition",
  "Gulf News",
  null,
  "2021-03-27",
  "https://gulfnews.com/uae/visitors-to-sharjah-heritage-days-can-experience-bedouin-coffee-tradition-1.78143364",
  "news",
);
const VISIT_DUBAI_KARAK = ref(
  "Top Karak Chai Spots in Dubai",
  "Dubai Department of Economy and Tourism (Visit Dubai)",
  null,
  "2024-12-10",
  "https://www.visitdubai.com/en/articles/top-karak-chai-spots",
  "government",
);
const TABLE_TALES = ref(
  "Table Tales: The Global Nomad Cuisine of Abu Dhabi",
  "Rizzoli",
  "Hanan Sayed Worrell",
  "2018",
  "https://www.rizzoliusa.com/book/table-tales/",
  "book",
);
const SMITHSONIAN_KARAK = ref(
  "Emirati Recipes: Chai Karak and Chbaab",
  "Smithsonian Institution (Smithsonian Folklife Festival)",
  "Kathy Phung",
  "2022",
  "https://festival.si.edu/blog/emirati-recipes-chai-karak-and-chbaab",
  "official",
);
const SMITHSONIAN_UAE = ref(
  "United Arab Emirates: Living Landscape | Living Memory",
  "Smithsonian Institution (Smithsonian Folklife Festival)",
  null,
  "2022",
  "https://festival.si.edu/2022/uae",
  "official",
);
const SMITHSONIAN_RELEASE = ref(
  "UAE Cultural Traditions Explored at the 2022 Smithsonian Folklife Festival",
  "Smithsonian Institution",
  null,
  "2022",
  "https://www.si.edu/newsdesk/releases/uae-cultural-traditions-explored-2022-smithsonian-folklife-festival",
  "official",
);
const FILLI_ZAFRAN = ref(
  "What is Zafran Chai — FiLLi's Saffron Karak, Since 1991",
  "FiLLi Cafe",
  null,
  null,
  "https://fillicafe.com/what-is-zafran-chai",
  "official",
);
const FILLI_MENU = ref(
  "FiLLi Cafe Menu — Signature Chai",
  "FiLLi Cafe",
  null,
  null,
  "https://fillicafe.com/menu/signature-chai",
  "official",
);
const FILLI_TEA_HOUSE = ref(
  "Tea House Dubai — FiLLi, the Home of Karak & Chai",
  "FiLLi Cafe",
  null,
  null,
  "https://fillicafe.com/tea-house-dubai",
  "official",
);
const ARAB_AMERICA_ADANI = ref(
  "Yemeni Tea: The Jewel Of Aden Yemen",
  "Arab America",
  "Anthony Bayyouk",
  null,
  "https://www.arabamerica.com/yemeni-tea-the-jewel-of-aden-yemen/",
  "cultural",
);
const YEMEN_TEA_CULTURE = ref(
  "Tea Culture in Yemen",
  "It's Never Not Teatime",
  null,
  null,
  "https://itsnevernotteatime.com/tea-culture-in-yemen/",
  "reference",
);
const COFFEE_MUSEUM = ref(
  "Coffee Museum — About the Museum",
  "Dubai Coffee Museum",
  null,
  null,
  "https://www.coffeemuseum.ae/index.php",
  "museum",
);
const GULF_NEWS_DALLAH = ref(
  "Coffee in the Arabian Gulf (Sharjah exhibition)",
  "Gulf News",
  null,
  "2022",
  "https://gulfnews.com/travel/energising-berries-arabian-dallah-and-the-origins-of-gahwa-1.2305409",
  "news",
);
const DCT_GAHWA_PERMIT = ref(
  "Gahwa Experience Operating Permit",
  DCT,
  null,
  null,
  "https://abudhabiculture.ae/en/cultural-programmes/cultural-platforms/bait-al-gahwa/gahwa-experience-operating-permit",
  "government",
);
const DCT_HERITAGE_CAROUSEL = ref(
  "Gahwa-Arabic Coffee (heritage carousel)",
  DCT,
  null,
  null,
  "https://abudhabiculture.ae/en/heritage-carousel/gahwa-arabic-coffee",
  "government",
);

const RAW_HOME = ref(
  "RAW Coffee Company",
  "RAW Coffee Company LLC",
  null,
  null,
  "https://rawcoffeecompany.com/",
  "official",
);
const RAW_ABOUT = ref(
  "About RAW Coffee Company",
  "RAW Coffee Company LLC",
  null,
  null,
  "https://rawcoffeecompany.com/pages/about",
  "official",
);
const RAW_STORY = ref(
  "Our Story",
  "RAW Coffee Company LLC",
  null,
  null,
  "https://rawcoffeecompany.com/pages/our-story",
  "official",
);

const TEL_HOME = ref(
  "Specialty Coffee & Roastery Experience",
  "The Espresso Lab",
  null,
  null,
  "https://theespressolab.com/",
  "official",
);
const TEL_STORY = ref(
  "Our Story & Specialty Coffee Journey",
  "The Espresso Lab",
  null,
  null,
  "https://theespressolab.com/our-story",
  "official",
);
const TEL_VISIT = ref(
  "Find Our Coffee Shops in UAE",
  "The Espresso Lab",
  null,
  null,
  "https://theespressolab.com/visit-us",
  "official",
);

const SF_HOME = ref(
  "Home | Seven Fortunes Coffee Roasters",
  "Seven Fortunes Coffee Roasters",
  null,
  null,
  "https://www.sevenfortunes.com/",
  "official",
);
const SF_LOCATIONS = ref(
  "Our Store Locations",
  "Seven Fortunes Coffee Roasters",
  null,
  null,
  "https://www.sevenfortunes.com/our-store-locations/",
  "official",
);

const CYPHER_HOME = ref(
  "Cypher Urban Roastery",
  "Cypher Roastery LLC",
  null,
  null,
  "https://www.bycypher.com/",
  "official",
);
const CYPHER_ROASTERY = ref(
  "Cypher Roastery",
  "Cypher Roastery LLC",
  null,
  null,
  "https://www.bycypher.com/pages/cypher-roastery",
  "official",
);
const CYPHER_FACILITY = ref(
  "Roasting Facility",
  "Cypher Roastery LLC",
  null,
  null,
  "https://www.bycypher.com/pages/roasting-facility",
  "official",
);
const CYPHER_CONTACT = ref(
  "Contact us",
  "Cypher Roastery LLC",
  null,
  null,
  "https://www.bycypher.com/pages/contact-us",
  "official",
);

const GB_HOME = ref(
  "Gold Box Roastery",
  "Gold Box Roastery LLC",
  null,
  null,
  "https://goldboxroastery.com/",
  "official",
);
const GB_DUBAI = ref(
  "Dubai Location",
  "Gold Box Roastery LLC",
  null,
  null,
  "https://goldboxroastery.com/pages/dubai-location",
  "official",
);

const NJ_HOME = ref(
  "Nightjar Coffee Roasters",
  "Nightjar Coffee Roasters LLC",
  null,
  null,
  "https://www.nightjar.coffee/",
  "official",
);
const NJ_ALSERKAL = ref(
  "Nightjar Coffee Roasters — Alserkal Avenue",
  "Alserkal Avenue",
  null,
  null,
  "https://alserkal.online/community/nightjar/",
  "reference",
);

const ARABIC_COFFEE_REFS = [
  DCT_GAHWA_PUB,
  DCT_GAHWA_ICH,
  DCT_AL_GAHWA,
  DCT_BAIT_AL_GAHWA,
  BAIT_AL_GAHWA,
  UNESCO_GAHWA,
  SCA_WOC,
];

/** Verified references per UAE page — mapped from research/gulf-heritage/uae/. */
export const UAE_PAGE_REFERENCES: Record<GulfHeritagePageSlug, readonly GulfHeritageReference[]> = {
  "emirati-arabic-coffee": ARABIC_COFFEE_REFS,
  dallah: [DCT_GAHWA_PUB, DCT_GAHWA_ICH, UNESCO_GAHWA, GULF_NEWS_DALLAH, COFFEE_MUSEUM],
  finjan: [DCT_GAHWA_PUB, DCT_HERITAGE_CAROUSEL, DCT_AL_GAHWA, UNESCO_GAHWA],
  mihmas: [DCT_GAHWA_PUB, DCT_GAHWA_ICH, GULF_NEWS_SHD],
  cardamom: [DCT_GAHWA_PUB, GULF_NEWS_SHD],
  saffron: [GULF_NEWS_SHD, DCT_GAHWA_PUB, DCT_AL_GAHWA],
  "coffee-hospitality": [UNESCO_GAHWA, DCT_GAHWA_PUB, BAIT_AL_GAHWA, DCT_GAHWA_PERMIT],
  "coffee-etiquette": [DCT_AL_GAHWA, DCT_GAHWA_PUB, UNESCO_GAHWA, DCT_GAHWA_PERMIT],
  "coffee-serving-traditions": [DCT_HERITAGE_CAROUSEL, DCT_GAHWA_ICH, UNESCO_GAHWA, GULF_NEWS_DALLAH, COFFEE_MUSEUM],
  "karak-chai": [VISIT_DUBAI_KARAK, TABLE_TALES, SMITHSONIAN_KARAK, SMITHSONIAN_UAE, SMITHSONIAN_RELEASE],
  "black-tea": [VISIT_DUBAI_KARAK, TABLE_TALES, SMITHSONIAN_KARAK],
  "milk-tea": [VISIT_DUBAI_KARAK, TABLE_TALES, SMITHSONIAN_KARAK],
  "saffron-tea": [FILLI_ZAFRAN, FILLI_MENU, VISIT_DUBAI_KARAK, SMITHSONIAN_KARAK],
  "mint-tea": [FILLI_MENU, FILLI_TEA_HOUSE, VISIT_DUBAI_KARAK],
  "adani-tea": [ARAB_AMERICA_ADANI, YEMEN_TEA_CULTURE],
  "raw-coffee-company": [RAW_HOME, RAW_ABOUT, RAW_STORY],
  "the-espresso-lab": [TEL_HOME, TEL_STORY, TEL_VISIT],
  "seven-fortunes": [SF_HOME, SF_LOCATIONS],
  "cypher-roastery": [CYPHER_HOME, CYPHER_ROASTERY, CYPHER_FACILITY, CYPHER_CONTACT],
  "boom-coffee": [],
  "gold-box-roastery": [GB_HOME, GB_DUBAI],
  "nightjar-coffee": [NJ_HOME, NJ_ALSERKAL],
};

export function getUaePageReferences(slug: GulfHeritagePageSlug): readonly GulfHeritageReference[] {
  return UAE_PAGE_REFERENCES[slug] ?? [];
}
