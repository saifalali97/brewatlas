import { resolveGulfCountryBanner } from "@/lib/gulf-directory/country-images";
import {
  findGulfCountryBySlug,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import {
  findPlaceholderGulfCountryPageRoaster,
  getPlaceholderGulfCountryPageData,
} from "@/lib/gulf-directory/country-page-data";
import type { GulfCountryPageRoaster } from "@/lib/gulf-directory/country-page-types";
import type { Difficulty } from "@/types/homepage";

/** Recipe card model for a Gulf roaster page (placeholder → future Supabase). */
export type GulfRoasterPageRecipe = {
  id: string;
  slug: string;
  name: string;
  coffeeName: string;
  brewMethod: string;
  difficulty: Difficulty;
  rating: number;
  brewTime: string;
  image: string;
  isIced: boolean;
  lead: string;
};

export type GulfRoasterPageData = {
  id: string;
  slug: string;
  name: string;
  city: string;
  countrySlug: GulfDirectoryCountrySlug;
  dbCountry: string;
  specialty: string;
  logoUrl: string | null;
  coverImage: string;
  website: string | null;
  instagram: string | null;
  about: string;
  foundedYear: number;
  locationLabel: string;
  brewingStyles: string[];
  totalRecipes: number;
  recipes: GulfRoasterPageRecipe[];
  featuredRecipeSlug: string | null;
  relatedRoasters: GulfCountryPageRoaster[];
};

type RoasterProfileSeed = {
  slug: string;
  website: string;
  instagram: string;
  foundedYear: number;
  locationLabel: string;
  about: string;
  coverImage?: string;
  recipes: GulfRoasterPageRecipe[];
  featuredRecipeSlug: string;
};

const RAW_RECIPES: GulfRoasterPageRecipe[] = [
  {
    id: "raw-r1",
    slug: "raw-v60-ethiopian",
    name: "RAW Ethiopian V60",
    coffeeName: "Ethiopia Guji Washed",
    brewMethod: "V60",
    difficulty: "Intermediate",
    rating: 4.8,
    brewTime: "3:00",
    image: "/images/methods/pour-over.webp",
    isIced: false,
    lead: "A bright, tea-like V60 profile tuned for RAW’s washed Ethiopian lots — clean florals, citrus, and a silky finish.",
  },
  {
    id: "raw-r2",
    slug: "raw-espresso-house",
    name: "RAW House Espresso",
    coffeeName: "RAW House Blend",
    brewMethod: "Espresso",
    difficulty: "Advanced",
    rating: 4.7,
    brewTime: "0:28",
    image: "/images/recipes/espresso-shot.webp",
    isIced: false,
    lead: "A syrupy, chocolate-forward espresso dialed for café consistency and milk drinks.",
  },
  {
    id: "raw-r3",
    slug: "raw-chemex-kenya",
    name: "RAW Kenya Chemex",
    coffeeName: "Kenya AA Washed",
    brewMethod: "Chemex",
    difficulty: "Intermediate",
    rating: 4.6,
    brewTime: "4:30",
    image: "/images/methods/pour-over.webp",
    isIced: false,
    lead: "A crystalline Chemex cup that showcases blackcurrant acidity and a sweet, lingering finish.",
  },
  {
    id: "raw-r4",
    slug: "raw-cold-brew-seasonal",
    name: "RAW Seasonal Cold Brew",
    coffeeName: "Seasonal Natural Lot",
    brewMethod: "Cold Brew",
    difficulty: "Beginner",
    rating: 4.5,
    brewTime: "14 hr",
    image: "/images/recipes/cold-brew.webp",
    isIced: true,
    lead: "An overnight immersion brew for fridge-ready sweetness with low bitterness.",
  },
];

const ROASTER_PROFILE_SEEDS: Record<string, RoasterProfileSeed> = {
  "raw-coffee-company": {
    slug: "raw-coffee-company",
    website: "https://rawcoffeecompany.com",
    instagram: "https://instagram.com/rawcoffeecompany",
    foundedYear: 2013,
    locationLabel: "Al Quoz, Dubai",
    about:
      "RAW Coffee Company is a home-grown UAE specialty roaster and SCA training campus in Al Quoz, Dubai. Founded by Kim Thompson and Matt Toogood, RAW sources, roasts, and supplies premium coffee for wholesale and retail across the region — with a reputation for clean filter profiles, disciplined espresso dialing, and hands-on barista education. Every BrewAtlas guide from RAW is curated for home and café consistency: clear ratios, reliable grind windows, and tasting notes that match the cup.",
    recipes: RAW_RECIPES,
    featuredRecipeSlug: "raw-v60-ethiopian",
  },
  "the-espresso-lab": {
    slug: "the-espresso-lab",
    website: "https://theespressolab.com",
    instagram: "https://instagram.com/theespressolab",
    foundedYear: 2014,
    locationLabel: "Dubai Design District",
    about:
      "The Espresso Lab is a Dubai-born artisan coffee company founded by Emirati entrepreneur Ibrahim Al Mallouhi. Known for competition-leaning espresso and carefully sourced microlots, the Lab roasts across Dubai Design District, Al Quoz, Abu Dhabi, and Sharjah — pairing technical precision with a distinctly Gulf hospitality ethos.",
    recipes: [
      {
        id: "lab-r1",
        slug: "espresso-lab-signature",
        name: "Espresso Lab Signature",
        coffeeName: "Espresso Lab House Blend",
        brewMethod: "Espresso",
        difficulty: "Advanced",
        rating: 4.7,
        brewTime: "0:28",
        image: "/images/recipes/espresso-shot.webp",
        isIced: false,
        lead: "A competition-leaning espresso recipe built for sweetness and clarity on The Espresso Lab’s house blend.",
      },
      {
        id: "lab-r2",
        slug: "espresso-lab-aeropress",
        name: "Lab Travel Aeropress",
        coffeeName: "Seasonal Single Origin",
        brewMethod: "Aeropress",
        difficulty: "Intermediate",
        rating: 4.5,
        brewTime: "2:15",
        image: "/images/methods/pour-over.webp",
        isIced: false,
        lead: "A compact Aeropress profile for bright single origins on the road or at the office.",
      },
    ],
    featuredRecipeSlug: "espresso-lab-signature",
  },
  "seven-fortunes": {
    slug: "seven-fortunes",
    website: "https://www.sevenfortunes.com",
    instagram: "https://instagram.com/sevenfortunes",
    foundedYear: 2016,
    locationLabel: "Al Quoz, Dubai",
    about:
      "Seven Fortunes is a Dubai specialty roaster focused on light-roast filter profiles, SCA training, and café equipment consulting. Their BrewAtlas guides emphasize clarity, sweetness, and repeatable pour-over structure for home baristas stepping into specialty.",
    recipes: [
      {
        id: "sf-r1",
        slug: "seven-fortunes-v60",
        name: "Seven Fortunes V60",
        coffeeName: "Ethiopia Natural",
        brewMethod: "V60",
        difficulty: "Beginner",
        rating: 4.4,
        brewTime: "3:10",
        image: "/images/methods/pour-over.webp",
        isIced: false,
        lead: "An approachable V60 framework for fruity naturals with a sweet, clean finish.",
      },
      {
        id: "sf-r2",
        slug: "seven-fortunes-chemex",
        name: "Seven Fortunes Chemex",
        coffeeName: "Colombia Washed",
        brewMethod: "Chemex",
        difficulty: "Intermediate",
        rating: 4.3,
        brewTime: "4:00",
        image: "/images/methods/pour-over.webp",
        isIced: false,
        lead: "A refined Chemex cup with caramel sweetness and soft citrus.",
      },
    ],
    featuredRecipeSlug: "seven-fortunes-v60",
  },
  "cypher-roastery": {
    slug: "cypher-roastery",
    website: "https://www.bycypher.com",
    instagram: "https://instagram.com/bycypher",
    foundedYear: 2018,
    locationLabel: "Al Quoz, Dubai",
    about:
      "Cypher Roastery sources, grades, and roasts premium coffee with a commitment to fair trade, transparency, and experimental process lots. Their BrewAtlas recipes lean into distinctive flavors — from sparkling filter cups to smooth, chocolatey cold brew.",
    recipes: [
      {
        id: "cy-r1",
        slug: "cypher-cold-brew",
        name: "Cypher Cold Brew",
        coffeeName: "Cypher Seasonal Natural",
        brewMethod: "Cold Brew",
        difficulty: "Beginner",
        rating: 4.6,
        brewTime: "14 hr",
        image: "/images/recipes/cold-brew.webp",
        isIced: true,
        lead: "A low-acid overnight immersion cold brew designed for Cypher’s experimental process lots.",
      },
      {
        id: "cy-r2",
        slug: "cypher-v60-experimental",
        name: "Cypher Experimental V60",
        coffeeName: "Anaerobic Seasonal",
        brewMethod: "V60",
        difficulty: "Advanced",
        rating: 4.5,
        brewTime: "3:20",
        image: "/images/methods/pour-over.webp",
        isIced: false,
        lead: "A precise V60 structure that keeps wild fruit notes articulate without tipping into bitterness.",
      },
    ],
    featuredRecipeSlug: "cypher-cold-brew",
  },
  "boom-coffee": {
    slug: "boom-coffee",
    website: "https://boomcoffee.ae",
    instagram: "https://instagram.com/boomcoffee",
    foundedYear: 2017,
    locationLabel: "Sharjah",
    about:
      "Boom Coffee brings everyday specialty and cold brew to Sharjah — approachable recipes for busy mornings, with a focus on sweetness, balance, and café-friendly methods.",
    recipes: [
      {
        id: "boom-r1",
        slug: "boom-espresso-everyday",
        name: "Boom Everyday Espresso",
        coffeeName: "Boom House Blend",
        brewMethod: "Espresso",
        difficulty: "Beginner",
        rating: 4.2,
        brewTime: "0:30",
        image: "/images/recipes/espresso-shot.webp",
        isIced: false,
        lead: "A forgiving espresso recipe for balanced milk drinks and straight shots.",
      },
      {
        id: "boom-r2",
        slug: "boom-moka-morning",
        name: "Boom Moka Morning",
        coffeeName: "Boom Medium Roast",
        brewMethod: "Moka Pot",
        difficulty: "Beginner",
        rating: 4.1,
        brewTime: "5:00",
        image: "/images/recipes/espresso-shot.webp",
        isIced: false,
        lead: "A stovetop moka profile with chocolate body and low bitterness.",
      },
    ],
    featuredRecipeSlug: "boom-espresso-everyday",
  },
  "gold-box-roastery": {
    slug: "gold-box-roastery",
    website: "https://goldboxroastery.com",
    instagram: "https://instagram.com/goldboxroastery",
    foundedYear: 2019,
    locationLabel: "Al Quoz, Dubai",
    about:
      "Gold Box Roastery focuses on boutique seasonal microlots for hotels, cafés, and discerning home baristas. Their BrewAtlas guides highlight delicate filter brewing that protects sweetness and aroma.",
    recipes: [
      {
        id: "gb-r1",
        slug: "gold-box-v60-microlot",
        name: "Gold Box Microlot V60",
        coffeeName: "Seasonal Microlot",
        brewMethod: "V60",
        difficulty: "Intermediate",
        rating: 4.4,
        brewTime: "3:05",
        image: "/images/methods/pour-over.webp",
        isIced: false,
        lead: "A measured V60 for delicate microlots — floral top notes and a clean finish.",
      },
    ],
    featuredRecipeSlug: "gold-box-v60-microlot",
  },
  "nightjar-coffee": {
    slug: "nightjar-coffee",
    website: "https://www.nightjar.coffee",
    instagram: "https://instagram.com/nightjarcoffee",
    foundedYear: 2015,
    locationLabel: "Alserkal Avenue, Dubai",
    about:
      "Nightjar Coffee is an award-winning Dubai roaster at Alserkal Avenue, known for artisanal roasting, cold brew production, and café operations. BrewAtlas recipes from Nightjar balance precision filter work with approachable espresso.",
    recipes: [
      {
        id: "nj-r1",
        slug: "nightjar-precision-v60",
        name: "Nightjar Precision V60",
        coffeeName: "Nightjar Seasonal Filter",
        brewMethod: "V60",
        difficulty: "Intermediate",
        rating: 4.5,
        brewTime: "3:00",
        image: "/images/methods/pour-over.webp",
        isIced: false,
        lead: "A precision filter recipe with a sweet, structured cup and clear acidity.",
      },
      {
        id: "nj-r2",
        slug: "nightjar-espresso",
        name: "Nightjar Espresso",
        coffeeName: "Nightjar Espresso Blend",
        brewMethod: "Espresso",
        difficulty: "Advanced",
        rating: 4.4,
        brewTime: "0:27",
        image: "/images/recipes/espresso-shot.webp",
        isIced: false,
        lead: "A dense, sweet espresso dialed for clarity in milk and straight shots.",
      },
    ],
    featuredRecipeSlug: "nightjar-precision-v60",
  },
};

function buildRoasterPageData(
  countrySlug: GulfDirectoryCountrySlug,
  base: GulfCountryPageRoaster,
  seed: RoasterProfileSeed,
): GulfRoasterPageData {
  const country = findGulfCountryBySlug(countrySlug)!;
  const countryPage = getPlaceholderGulfCountryPageData(countrySlug);
  const relatedRoasters = countryPage.roasters
    .filter((roaster) => roaster.slug !== base.slug)
    .slice(0, 3);

  return {
    id: base.id,
    slug: base.slug,
    name: base.name,
    city: base.city,
    countrySlug,
    dbCountry: country.dbCountry,
    specialty: base.specialty,
    logoUrl: base.logoUrl,
    coverImage: seed.coverImage ?? resolveGulfCountryBanner(countrySlug),
    website: seed.website,
    instagram: seed.instagram,
    about: seed.about,
    foundedYear: seed.foundedYear,
    locationLabel: seed.locationLabel,
    brewingStyles: base.brewMethods,
    totalRecipes: seed.recipes.length,
    recipes: seed.recipes,
    featuredRecipeSlug: seed.featuredRecipeSlug,
    relatedRoasters,
  };
}

/** Placeholder roaster page payload — swap for Supabase later without UI changes. */
export function getGulfRoasterPageData(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfRoasterPageData | null {
  const base = findPlaceholderGulfCountryPageRoaster(countrySlug, roasterSlug);
  if (!base) return null;

  const seed = ROASTER_PROFILE_SEEDS[roasterSlug];
  if (!seed) {
    const country = findGulfCountryBySlug(countrySlug)!;
    const countryPage = getPlaceholderGulfCountryPageData(countrySlug);
    return {
      id: base.id,
      slug: base.slug,
      name: base.name,
      city: base.city,
      countrySlug,
      dbCountry: country.dbCountry,
      specialty: base.specialty,
      logoUrl: base.logoUrl,
      coverImage: resolveGulfCountryBanner(countrySlug),
      website: null,
      instagram: null,
      about: `${base.name} is a verified specialty roastery in ${base.city}. Full BrewAtlas brew guides will appear here once published.`,
      foundedYear: 2018,
      locationLabel: base.city,
      brewingStyles: base.brewMethods,
      totalRecipes: 0,
      recipes: [],
      featuredRecipeSlug: null,
      relatedRoasters: countryPage.roasters
        .filter((roaster) => roaster.slug !== base.slug)
        .slice(0, 3),
    };
  }

  return buildRoasterPageData(countrySlug, base, seed);
}

export function listGulfRoasterPageParams(): Array<{
  countrySlug: GulfDirectoryCountrySlug;
  roasterSlug: string;
}> {
  return (["uae"] as const).flatMap((countrySlug) =>
    getPlaceholderGulfCountryPageData(countrySlug).roasters.map((roaster) => ({
      countrySlug,
      roasterSlug: roaster.slug,
    })),
  );
}
