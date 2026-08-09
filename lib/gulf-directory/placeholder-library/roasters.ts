import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { GulfCountryPageRoaster } from "@/lib/gulf-directory/country-page-types";
import type { Difficulty } from "@/types/homepage";

export type PlaceholderRoasterProfile = {
  id: string;
  name: string;
  slug: string;
  countrySlug: GulfDirectoryCountrySlug;
  city: string;
  logoUrl: string | null;
  specialty: string;
  website: string | null;
  instagram: string | null;
  foundedYear: number;
  locationLabel: string;
  about: string;
  featuredRecipeSlug: string;
};

/** All placeholder directory roasters — every recipe must attach to one of these. */
export const PLACEHOLDER_ROASTERS: PlaceholderRoasterProfile[] = [
  // UAE
  {
    id: "uae-raw",
    name: "RAW Coffee Company",
    slug: "raw-coffee-company",
    countrySlug: "uae",
    city: "Dubai",
    logoUrl: "/images/gulf-heritage/raw-coffee-company.webp",
    specialty: "Single origin & SCA training",
    website: "https://rawcoffeecompany.com",
    instagram: "https://instagram.com/rawcoffeecompany",
    foundedYear: 2013,
    locationLabel: "Al Quoz, Dubai",
    about:
      "RAW Coffee Company is a home-grown UAE specialty roaster and SCA training campus in Al Quoz, Dubai. Founded by Kim Thompson and Matt Toogood, RAW sources, roasts, and supplies premium coffee across the region with clean filter profiles and disciplined espresso dialing.",
    featuredRecipeSlug: "raw-v60-ethiopian",
  },
  {
    id: "uae-espresso-lab",
    name: "The Espresso Lab",
    slug: "the-espresso-lab",
    countrySlug: "uae",
    city: "Dubai",
    logoUrl: "/images/gulf-heritage/the-espresso-lab.webp",
    specialty: "Competition espresso & milk drinks",
    website: "https://theespressolab.com",
    instagram: "https://instagram.com/theespressolab",
    foundedYear: 2014,
    locationLabel: "Dubai Design District",
    about:
      "The Espresso Lab is a Dubai-born artisan coffee company founded by Emirati entrepreneur Ibrahim Al Mallouhi, known for competition-leaning espresso and carefully sourced microlots.",
    featuredRecipeSlug: "espresso-lab-competition-v60",
  },
  {
    id: "uae-seven-fortunes",
    name: "Seven Fortunes",
    slug: "seven-fortunes",
    countrySlug: "uae",
    city: "Abu Dhabi",
    logoUrl: "/images/gulf-heritage/seven-fortunes.webp",
    specialty: "Light-roast filter profiles",
    website: "https://www.sevenfortunes.com",
    instagram: "https://instagram.com/sevenfortunes",
    foundedYear: 2016,
    locationLabel: "Al Quoz, Dubai",
    about:
      "Seven Fortunes focuses on light-roast filter profiles, SCA training, and café consulting — with BrewAtlas guides built for clarity and sweetness.",
    featuredRecipeSlug: "seven-fortunes-natural-ethiopia",
  },
  {
    id: "uae-cypher",
    name: "Cypher Roastery",
    slug: "cypher-roastery",
    countrySlug: "uae",
    city: "Dubai",
    logoUrl: "/images/gulf-heritage/cypher-roastery.webp",
    specialty: "Experimental process lots",
    website: "https://www.bycypher.com",
    instagram: "https://instagram.com/bycypher",
    foundedYear: 2018,
    locationLabel: "Al Quoz, Dubai",
    about:
      "Cypher Roastery sources and roasts with a commitment to transparency and experimental process lots — from sparkling filter cups to chocolatey cold brew.",
    featuredRecipeSlug: "cypher-cold-brew",
  },
  {
    id: "uae-boom",
    name: "Boom Coffee",
    slug: "boom-coffee",
    countrySlug: "uae",
    city: "Sharjah",
    logoUrl: "/images/gulf-heritage/boom-coffee.webp",
    specialty: "Everyday specialty & cold brew",
    website: "https://boomcoffee.ae",
    instagram: "https://instagram.com/boomcoffee",
    foundedYear: 2017,
    locationLabel: "Sharjah",
    about:
      "Boom Coffee brings everyday specialty and approachable brew guides to Sharjah — built for busy mornings and café-friendly methods.",
    featuredRecipeSlug: "boom-aeropress-house",
  },
  {
    id: "uae-gold-box",
    name: "Gold Box Roastery",
    slug: "gold-box-roastery",
    countrySlug: "uae",
    city: "Dubai",
    logoUrl: "/images/gulf-heritage/gold-box-roastery.webp",
    specialty: "Boutique seasonal microlots",
    website: "https://goldboxroastery.com",
    instagram: "https://instagram.com/goldboxroastery",
    foundedYear: 2019,
    locationLabel: "Al Quoz, Dubai",
    about:
      "Gold Box Roastery focuses on boutique seasonal microlots for hotels, cafés, and home baristas who want delicate filter clarity.",
    featuredRecipeSlug: "gold-box-kalita-microlot",
  },
  {
    id: "uae-nightjar",
    name: "Nightjar Coffee",
    slug: "nightjar-coffee",
    countrySlug: "uae",
    city: "Abu Dhabi",
    logoUrl: "/images/gulf-heritage/nightjar-coffee.webp",
    specialty: "Precision filter & espresso",
    website: "https://www.nightjar.coffee",
    instagram: "https://instagram.com/nightjarcoffee",
    foundedYear: 2015,
    locationLabel: "Alserkal Avenue, Dubai",
    about:
      "Nightjar Coffee is an award-winning Dubai roaster known for artisanal roasting, cold brew production, and café operations.",
    featuredRecipeSlug: "nightjar-v60-precision",
  },

  // Saudi Arabia
  {
    id: "sa-camel-step",
    name: "Camel Step",
    slug: "camel-step",
    countrySlug: "saudi-arabia",
    city: "Riyadh",
    logoUrl: null,
    specialty: "Pioneer Saudi specialty roasting",
    website: "https://camelstep.com",
    instagram: "https://instagram.com/camelstep",
    foundedYear: 2013,
    locationLabel: "Riyadh",
    about:
      "Camel Step pioneered Saudi Arabia’s specialty coffee market from Riyadh, roasting premium global origins with café and home brew programs.",
    featuredRecipeSlug: "camel-step-v60-ethiopia",
  },
  {
    id: "sa-nomad",
    name: "Nomad Coffee",
    slug: "nomad-coffee",
    countrySlug: "saudi-arabia",
    city: "Riyadh",
    logoUrl: null,
    specialty: "Travel-ready filter & espresso",
    website: "https://nomad.sa",
    instagram: "https://instagram.com/nomadcoffee",
    foundedYear: 2018,
    locationLabel: "Riyadh",
    about:
      "Nomad Coffee crafts travel-ready specialty profiles for Riyadh — bright filter cups and dialed espresso for everyday brewing.",
    featuredRecipeSlug: "nomad-origami-kenya",
  },
  {
    id: "sa-medd",
    name: "Medd Cafe & Roastery",
    slug: "medd-cafe-and-roastery",
    countrySlug: "saudi-arabia",
    city: "Jeddah",
    logoUrl: null,
    specialty: "Jeddah filter & café culture",
    website: "https://meddcoffee.com",
    instagram: "https://instagram.com/meddcoffee",
    foundedYear: 2015,
    locationLabel: "Jeddah",
    about:
      "Medd Cafe & Roastery has roasted carefully selected crops in Jeddah since 2015 for retail, wholesale, and café service.",
    featuredRecipeSlug: "medd-chemex-colombia",
  },
  {
    id: "sa-brew92",
    name: "Brew92",
    slug: "brew92",
    countrySlug: "saudi-arabia",
    city: "Jeddah",
    logoUrl: null,
    specialty: "SCA-certified café roasting",
    website: "https://www.brew92.com",
    instagram: "https://instagram.com/brew92",
    foundedYear: 2016,
    locationLabel: "Jeddah",
    about:
      "Brew92 is a Jeddah specialty café and roastery brewing at 92°C with an SCA-certified team and 100% specialty-grade Arabica.",
    featuredRecipeSlug: "brew92-v60-iced-yemen",
  },
  {
    id: "sa-hjeen",
    name: "Hjeen",
    slug: "hjeen",
    countrySlug: "saudi-arabia",
    city: "Riyadh",
    logoUrl: null,
    specialty: "Roaster-lab innovation",
    website: "https://hjeen.com",
    instagram: "https://instagram.com/hjeen",
    foundedYear: 2019,
    locationLabel: "Riyadh",
    about:
      "Hjeen blends innovation and tradition in Riyadh with an integrated roaster-lab and SCA-certified roasting team.",
    featuredRecipeSlug: "hjeen-kalita-brazil",
  },

  // Kuwait
  {
    id: "kw-vol1",
    name: "VOL.1 Roastery",
    slug: "vol1-roastery",
    countrySlug: "kuwait",
    city: "Kuwait City",
    logoUrl: null,
    specialty: "Modern Kuwait specialty",
    website: "https://vol1.kw",
    instagram: "https://instagram.com/vol1roastery",
    foundedYear: 2018,
    locationLabel: "Kuwait City",
    about:
      "VOL.1 Roastery represents modern Kuwait specialty — clean cups, precise espresso, and approachable home brew guides.",
    featuredRecipeSlug: "vol1-v60-ethiopia",
  },
  {
    id: "kw-ark",
    name: "A R K Roasters",
    slug: "ark-roasters",
    countrySlug: "kuwait",
    city: "Kuwait City",
    logoUrl: null,
    specialty: "Ethical single origins",
    website: "https://ark.com.kw",
    instagram: "https://instagram.com/ark.kw",
    foundedYear: 2016,
    locationLabel: "Kuwait City",
    about:
      "A R K Roasters roasts ethically sourced single-origin coffees on a Loring S7 for Kuwait’s specialty scene.",
    featuredRecipeSlug: "ark-espresso-house",
  },
  {
    id: "kw-stockroom",
    name: "Stockroom Coffee",
    slug: "stockroom-coffee",
    countrySlug: "kuwait",
    city: "Shuwaikh",
    logoUrl: null,
    specialty: "Wholesale & training",
    website: "https://stockroomcoffee.com",
    instagram: "https://instagram.com/stockroomcoffee",
    foundedYear: 2017,
    locationLabel: "Shuwaikh",
    about:
      "Stockroom Coffee supplies beans, equipment, and training from Shuwaikh — with BrewAtlas recipes tuned for café consistency.",
    featuredRecipeSlug: "stockroom-cold-brew",
  },
  {
    id: "kw-methods",
    name: "Methods Academy and Roastery",
    slug: "methods-academy-and-roastery",
    countrySlug: "kuwait",
    city: "Kuwait City",
    logoUrl: null,
    specialty: "Academy & small-batch roasting",
    website: "https://methods.coffee",
    instagram: "https://instagram.com/methods.coffee",
    foundedYear: 2019,
    locationLabel: "Kuwait City",
    about:
      "Methods Academy and Roastery pairs small-batch roasting with barista education across Kuwait.",
    featuredRecipeSlug: "methods-aeropress-seasonal",
  },

  // Qatar
  {
    id: "qa-flat-white",
    name: "Flat White",
    slug: "flat-white",
    countrySlug: "qatar",
    city: "Doha",
    logoUrl: null,
    specialty: "Café espresso culture",
    website: "https://flatwhite.qa",
    instagram: "https://instagram.com/flatwhiteqa",
    foundedYear: 2017,
    locationLabel: "Doha",
    about:
      "Flat White brings café espresso culture to Doha with milk-friendly shots and bright filter options for home brewers.",
    featuredRecipeSlug: "flat-white-signature-espresso",
  },
  {
    id: "qa-vulcan",
    name: "Vulcan Coffee Roastery",
    slug: "vulcan-coffee-roastery",
    countrySlug: "qatar",
    city: "Doha",
    logoUrl: null,
    specialty: "Organic single origins",
    website: "https://vulcanroastery.com",
    instagram: "https://instagram.com/vulcanroastery",
    foundedYear: 2018,
    locationLabel: "Doha",
    about:
      "Vulcan Coffee Roastery sources high-quality organic beans and roasts in Qatar for wholesale and retail.",
    featuredRecipeSlug: "vulcan-v60-colombia",
  },
  {
    id: "qa-bon-bean",
    name: "Bon and Bean",
    slug: "bon-and-bean",
    countrySlug: "qatar",
    city: "Doha",
    logoUrl: null,
    specialty: "Electric air roasting",
    website: "https://bonandbean.com",
    instagram: "https://instagram.com/bonandbean",
    foundedYear: 2020,
    locationLabel: "Doha",
    about:
      "Bon and Bean uses electric air roasting in Doha for single-origin coffees and handcrafted blends.",
    featuredRecipeSlug: "bon-and-bean-chemex",
  },

  // Bahrain
  {
    id: "bh-crust",
    name: "Crust & Crema",
    slug: "crust-and-crema",
    countrySlug: "bahrain",
    city: "Manama",
    logoUrl: null,
    specialty: "Bakery café specialty",
    website: "https://crustandcrema.bh",
    instagram: "https://instagram.com/crustandcrema",
    foundedYear: 2019,
    locationLabel: "Manama",
    about:
      "Crust & Crema pairs bakery hospitality with specialty coffee in Manama — approachable espresso and filter guides.",
    featuredRecipeSlug: "crust-v60-house",
  },
  {
    id: "bh-bahrain-roastery",
    name: "Bahrain Roastery",
    slug: "bahrain-roastery",
    countrySlug: "bahrain",
    city: "Manama",
    logoUrl: null,
    specialty: "Wide specialty selection",
    website: "https://bahrainroastery.com",
    instagram: "https://instagram.com/bahrainroastery",
    foundedYear: 2016,
    locationLabel: "Manama",
    about:
      "Bahrain Roastery offers one of the GCC’s widest whole-bean selections, roasting fresh for retail and hospitality.",
    featuredRecipeSlug: "bahrain-roastery-kalita",
  },
  {
    id: "bh-black-22",
    name: "Black 22",
    slug: "black-22",
    countrySlug: "bahrain",
    city: "Manama",
    logoUrl: null,
    specialty: "Micro-roastery & training",
    website: "https://black22bh.com",
    instagram: "https://instagram.com/black22bh",
    foundedYear: 2018,
    locationLabel: "Manama",
    about:
      "Black 22 is a Bahrain specialty coffee bar and micro-roastery with SCA-aligned training and retail beans.",
    featuredRecipeSlug: "black-22-cold-brew",
  },

  // Oman
  {
    id: "om-windrose",
    name: "Windrose Coffee",
    slug: "windrose-coffee",
    countrySlug: "oman",
    city: "Muscat",
    logoUrl: null,
    specialty: "Oman’s first specialty roastery",
    website: "https://www.windrosecoffee.com",
    instagram: "https://instagram.com/windrosecoffee",
    foundedYear: 2017,
    locationLabel: "Muscat",
    about:
      "Windrose Coffee is Oman’s first specialty coffee roastery in Muscat, focused on ethically sourced, consistently roasted coffees.",
    featuredRecipeSlug: "windrose-v60-ethiopia",
  },
];

export function getPlaceholderRoasterBySlug(
  slug: string,
): PlaceholderRoasterProfile | null {
  return PLACEHOLDER_ROASTERS.find((roaster) => roaster.slug === slug) ?? null;
}

export function getPlaceholderRoastersByCountry(
  countrySlug: GulfDirectoryCountrySlug,
): PlaceholderRoasterProfile[] {
  return PLACEHOLDER_ROASTERS.filter((roaster) => roaster.countrySlug === countrySlug);
}

export function toCountryPageRoaster(
  roaster: PlaceholderRoasterProfile,
  recipeMeta: {
    recipeCount: number;
    brewMethods: string[];
    difficulties: Difficulty[];
  },
): GulfCountryPageRoaster {
  return {
    id: roaster.id,
    name: roaster.name,
    slug: roaster.slug,
    city: roaster.city,
    logoUrl: roaster.logoUrl,
    recipeCount: recipeMeta.recipeCount,
    specialty: roaster.specialty,
    brewMethods: recipeMeta.brewMethods,
    difficulties: recipeMeta.difficulties,
  };
}
