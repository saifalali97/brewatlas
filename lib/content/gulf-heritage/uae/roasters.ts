import type { GulfHeritageRoasterPageSlug, GulfHeritageRoasterProfileFields } from "@/types/gulf-heritage";

const EMPTY_ROASTER_PROFILE: GulfHeritageRoasterProfileFields = {
  story: null,
  foundingYear: null,
  location: null,
  websiteUrl: null,
  instagramUrl: null,
  roastingPhilosophy: null,
  coffeeLineup: null,
  brewingRecommendations: null,
  featuredBeans: null,
  awards: null,
  socialLinks: [],
};

/**
 * Roaster profile fields populated only from official roastery sources.
 * See research/gulf-heritage/uae/roasters/*.json
 */
export const UAE_ROASTER_PROFILE_FIELDS: Record<GulfHeritageRoasterPageSlug, GulfHeritageRoasterProfileFields> = {
  "raw-coffee-company": {
    ...EMPTY_ROASTER_PROFILE,
    story:
      "RAW Coffee Company is a home-grown UAE brand, internationally recognised as a market leader in Specialty Coffee. RAW is operated on a daily basis by owners Kim Thompson and Matt Toogood, both holding the first International Specialty Coffee Association (SCA) Diploma qualification in the MENA region.",
    location: "Al Quoz, Dubai, United Arab Emirates",
    websiteUrl: "https://rawcoffeecompany.com/",
    roastingPhilosophy:
      "The core of what we do is sourcing, roasting and supplying premium coffee to the local B2B and B2C market. We offer specialty coffee freshly roasted at our warehouse in Al Quoz. It is the heart and soul of everything we do at RAW.",
    awards:
      "2022 Best Homegrown Coffee Roastery BBC Good Foods winner; 2022 Awarded Proudly Dubai by DTCM; 4 x UAE Coffee Champions.",
  },
  "the-espresso-lab": {
    ...EMPTY_ROASTER_PROFILE,
    story:
      "Founded by Emirati entrepreneur Ibrahim Al Mallouhi, The Espresso Lab is a Dubai-born artisan coffee company that embodies the heart and soul of craft coffee. Ibrahim Al Mallouhi traces his passion for coffee back to his childhood days spent beside his grandmother, who roasted Arabic coffee with meticulous precision.",
    location: "Dubai Design District, Al Quoz, Abu Dhabi, and Sharjah, United Arab Emirates",
    websiteUrl: "https://theespressolab.com/",
    roastingPhilosophy:
      "Sourcing begins with identifying and selecting high-quality Microlots, followed by meticulous roasting to bring out each variety's best attributes. Every stage of the process, from grind to brew, is tailored to the final customer's preference, be it espresso, drip, or cold brew.",
    featuredBeans: "Seasonal offerings introduce exclusive, limited-release coffees sourced from distinctive regions worldwide.",
    awards:
      "UAE National Barista Championship 2016, 2017, 2018, 2025; UAE National Brewers Cup Championship 2016, 2017, 2021, 2023, 2026; UAE National Roasting Championship 2026.",
  },
  "seven-fortunes": {
    ...EMPTY_ROASTER_PROFILE,
    story:
      "At Seven Fortunes we are roasting premium coffee beans and provide SCA trainings as well as coffee shop equipment. We provide bar design, barista training, coffee shop equipment (including the La Marzocco espresso machines), equipment upkeep and general consulting.",
    location: "Al Quoz Industrial Area, Dubai, United Arab Emirates",
    websiteUrl: "https://www.sevenfortunes.com/",
    roastingPhilosophy:
      "At Seven Fortunes we are roasting premium coffee beans and provide SCA trainings as well as coffee shop equipment.",
  },
  "cypher-roastery": {
    ...EMPTY_ROASTER_PROFILE,
    story:
      "Operating out of a state-of-the art facility in Dubai, United Arab Emirates, Cypher sources, grades, and roasts specialty premium coffee to service the growing needs and taste requirements of regional wholesale consumers and specialty coffee drinkers.",
    location: "Al Quoz Industrial Area 3, Dubai, United Arab Emirates",
    websiteUrl: "https://www.bycypher.com/",
    roastingPhilosophy:
      "The company is deeply committed to the promotion of fair trade practices across the bean life-cycle with an emphasis on quality, transparency, consistency and social responsibility. We hope that our passion for Coffee will drive our innovative spirit, and through this rekindle the relationship between Arabia and Coffee.",
  },
  "boom-coffee": { ...EMPTY_ROASTER_PROFILE },
  "gold-box-roastery": {
    ...EMPTY_ROASTER_PROFILE,
    story:
      "Gold Box Coffee Roasters artistically roast green coffee beans to create world-class speciality coffees for customers, hotels and coffee shops across the United Arab Emirates.",
    location:
      "Warehouse #7, Building SMARK 3, Umm Suqeim Rd. East, Al Quoz Industrial Third, Dubai, United Arab Emirates",
    websiteUrl: "https://goldboxroastery.com/",
    awards:
      "Luca Croce: UK Brewers Cup Champion 2022–2023, World Brewers Cup 4th 2022–2023; Mon Alpas: UAE Latte Art Champion 2021–2022; Kiah Parangue: UAE Barista Champion Lavazza 2022–2023, World Lavazza Barista Champion 2022–2023; Lyndon Recera: UAE Barista Champion 2015–2016 and 2017–2018.",
  },
  "nightjar-coffee": {
    ...EMPTY_ROASTER_PROFILE,
    story:
      "Nightjar is an award-winning leader in artisanal coffee roasting, cold brew production, and all-round-good-times. Nightjar was founded by Leon Surynt, passionate about coffee and the communities it brings together who are all about \"giving a damn, and making it good.\"",
    location: "Warehouse 62, Alserkal Avenue, Al Quoz, Dubai, United Arab Emirates",
    websiteUrl: "https://www.nightjar.coffee/",
    roastingPhilosophy:
      "Artisanal Coffee | Craft Brews | Food That We Love To Eat | Top Notch Hi-Fi | All Round Good Times. Born In Dubai… Exporting Vibes.",
    featuredBeans: "Seasonal Blends, Cold Brew, Origins & Micro-Lots.",
  },
};
