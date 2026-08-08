import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { Difficulty } from "@/types/homepage";

export type PlaceholderRecipeStep = {
  id: string;
  pourNumber: number;
  waterAmount: string;
  timeLabel: string;
  notes: string;
  /** Seconds from brew start — used by the timeline. */
  atSeconds: number;
  durationSeconds: number;
};

export type PlaceholderFlavorProfile = {
  sweetness: number;
  acidity: number;
  body: number;
  bitterness: number;
  finish: number;
};

export type PlaceholderRecipeDetail = {
  slug: string;
  name: string;
  lead: string;
  image: string;
  roasterName: string;
  roasterSlug: string;
  countrySlug: GulfDirectoryCountrySlug;
  brewMethod: string;
  difficulty: Difficulty;
  rating: number;
  brewTime: string;
  isIced: boolean;
  coffeeBeans: string;
  roastLevel: string;
  origin: string;
  process: string;
  roastDate: string;
  water: string;
  grinder: string;
  brewer: string;
  filter: string;
  dose: string;
  waterAmount: string;
  temperature: string;
  ratio: string;
  grindSize: string;
  bloom: string;
  totalBrewTime: string;
  steps: PlaceholderRecipeStep[];
  flavorProfile: PlaceholderFlavorProfile;
  tastingNotes: string;
  flavorTags: string[];
  equipment: Array<{ name: string; detail: string }>;
  similarSlugs: string[];
};

const PLACEHOLDER_RECIPES: PlaceholderRecipeDetail[] = [
  {
    slug: "raw-v60-ethiopian",
    name: "RAW Ethiopian V60",
    lead: "A bright, tea-like V60 profile tuned for RAW’s washed Ethiopian lots — clean florals, citrus, and a silky finish.",
    image: "/images/methods/pour-over.webp",
    roasterName: "RAW Coffee Company",
    roasterSlug: "raw-coffee-company",
    countrySlug: "uae",
    brewMethod: "V60",
    difficulty: "Intermediate",
    rating: 4.8,
    brewTime: "3:00",
    isIced: false,
    coffeeBeans: "Ethiopia Guji Washed",
    roastLevel: "Light",
    origin: "Guji, Ethiopia",
    process: "Washed",
    roastDate: "Within 7–21 days",
    water: "Third Wave Water / soft mineral",
    grinder: "Commandante C40 / EK43",
    brewer: "Hario V60 02",
    filter: "Hario V60 paper (rinsed)",
    dose: "15 g",
    waterAmount: "250 g",
    temperature: "93°C",
    ratio: "1:16.7",
    grindSize: "Medium-fine (pour-over)",
    bloom: "45 g / 0:45",
    totalBrewTime: "2:45–3:00",
    steps: [
      {
        id: "raw-1",
        pourNumber: 1,
        waterAmount: "45 g",
        timeLabel: "0:00–0:45",
        notes: "Bloom gently, saturating all grounds. Swirl once to release CO₂.",
        atSeconds: 0,
        durationSeconds: 45,
      },
      {
        id: "raw-2",
        pourNumber: 2,
        waterAmount: "100 g",
        timeLabel: "0:45–1:15",
        notes: "Center pour in slow concentric circles to 145 g total.",
        atSeconds: 45,
        durationSeconds: 30,
      },
      {
        id: "raw-3",
        pourNumber: 3,
        waterAmount: "105 g",
        timeLabel: "1:15–1:50",
        notes: "Continue to 250 g. Keep the slurry height steady and finish with a gentle swirl.",
        atSeconds: 75,
        durationSeconds: 35,
      },
      {
        id: "raw-4",
        pourNumber: 4,
        waterAmount: "Drawdown",
        timeLabel: "1:50–3:00",
        notes: "Allow drawdown to finish by 3:00. Target a clean, sparkling cup.",
        atSeconds: 110,
        durationSeconds: 70,
      },
    ],
    flavorProfile: { sweetness: 78, acidity: 86, body: 52, bitterness: 22, finish: 74 },
    tastingNotes: "Jasmine, bergamot, white peach, and raw cane sugar with a tea-like body.",
    flavorTags: ["Floral", "Citrus", "Tea-like", "Clean"],
    equipment: [
      { name: "Hario V60 02", detail: "Cone pour-over" },
      { name: "Gooseneck kettle", detail: "Precise pour control" },
      { name: "Scale", detail: "0.1 g accuracy" },
      { name: "Burr grinder", detail: "Medium-fine setting" },
      { name: "V60 filters", detail: "Rinse before brew" },
    ],
    similarSlugs: ["espresso-lab-signature", "cypher-cold-brew"],
  },
  {
    slug: "espresso-lab-signature",
    name: "Espresso Lab Signature",
    lead: "A competition-leaning espresso recipe built for sweetness and clarity on The Espresso Lab’s house blend.",
    image: "/images/recipes/espresso-shot.webp",
    roasterName: "The Espresso Lab",
    roasterSlug: "the-espresso-lab",
    countrySlug: "uae",
    brewMethod: "Espresso",
    difficulty: "Advanced",
    rating: 4.7,
    brewTime: "0:28",
    isIced: false,
    coffeeBeans: "Espresso Lab House Blend",
    roastLevel: "Medium",
    origin: "Brazil & Ethiopia blend",
    process: "Natural / Washed",
    roastDate: "Within 10–28 days",
    water: "Balanced mineral water (75–100 ppm)",
    grinder: "Mythos / Niche Zero",
    brewer: "Linea Classic / Decent",
    filter: "IMS precision basket",
    dose: "18.5 g",
    waterAmount: "37 g out",
    temperature: "93°C",
    ratio: "1:2",
    grindSize: "Fine (espresso)",
    bloom: "N/A",
    totalBrewTime: "26–30 sec",
    steps: [
      {
        id: "lab-1",
        pourNumber: 1,
        waterAmount: "Dose 18.5 g",
        timeLabel: "Prep",
        notes: "Distribute evenly, tamp level at ~15 kg pressure.",
        atSeconds: 0,
        durationSeconds: 20,
      },
      {
        id: "lab-2",
        pourNumber: 2,
        waterAmount: "Pre-infusion",
        timeLabel: "0:00–0:06",
        notes: "Low-pressure pre-infusion until first drops appear.",
        atSeconds: 20,
        durationSeconds: 6,
      },
      {
        id: "lab-3",
        pourNumber: 3,
        waterAmount: "37 g beverage",
        timeLabel: "0:06–0:28",
        notes: "Ramp to 9 bar. Stop at 37 g for a syrupy, balanced shot.",
        atSeconds: 26,
        durationSeconds: 22,
      },
    ],
    flavorProfile: { sweetness: 84, acidity: 58, body: 80, bitterness: 34, finish: 70 },
    tastingNotes: "Dark chocolate, almond brittle, red apple, and a lingering caramel finish.",
    flavorTags: ["Chocolate", "Nutty", "Caramel", "Balanced"],
    equipment: [
      { name: "Espresso machine", detail: "Stable 9 bar" },
      { name: "Espresso grinder", detail: "Fine adjustment" },
      { name: "Precision basket", detail: "18–20 g" },
      { name: "Scale", detail: "Shot timing & yield" },
      { name: "Distributor & tamper", detail: "Even puck prep" },
    ],
    similarSlugs: ["raw-v60-ethiopian", "cypher-cold-brew"],
  },
  {
    slug: "cypher-cold-brew",
    name: "Cypher Cold Brew",
    lead: "A low-acid overnight immersion cold brew designed for Cypher’s experimental process lots — smooth, chocolatey, and fridge-ready.",
    image: "/images/recipes/cold-brew.webp",
    roasterName: "Cypher Roastery",
    roasterSlug: "cypher-roastery",
    countrySlug: "uae",
    brewMethod: "Cold Brew",
    difficulty: "Beginner",
    rating: 4.6,
    brewTime: "14 hr",
    isIced: true,
    coffeeBeans: "Cypher Seasonal Natural",
    roastLevel: "Medium-light",
    origin: "Colombia / Ethiopia rotating",
    process: "Natural / Experimental",
    roastDate: "Within 5–30 days",
    water: "Filtered cold water",
    grinder: "Any burr grinder",
    brewer: "Immersion jar / Toddy",
    filter: "Paper or cloth cold-brew filter",
    dose: "100 g",
    waterAmount: "900 g",
    temperature: "Cold (fridge)",
    ratio: "1:9",
    grindSize: "Coarse",
    bloom: "N/A",
    totalBrewTime: "12–16 hours",
    steps: [
      {
        id: "cy-1",
        pourNumber: 1,
        waterAmount: "100 g coffee",
        timeLabel: "Prep",
        notes: "Grind coarse and add to a clean immersion vessel.",
        atSeconds: 0,
        durationSeconds: 60,
      },
      {
        id: "cy-2",
        pourNumber: 2,
        waterAmount: "900 g cold water",
        timeLabel: "0:00",
        notes: "Pour cold water over grounds. Stir to fully wet the bed.",
        atSeconds: 60,
        durationSeconds: 60,
      },
      {
        id: "cy-3",
        pourNumber: 3,
        waterAmount: "Steep",
        timeLabel: "0–14 hr",
        notes: "Cover and refrigerate for 12–16 hours. Avoid agitation.",
        atSeconds: 120,
        durationSeconds: 240,
      },
      {
        id: "cy-4",
        pourNumber: 4,
        waterAmount: "Filter",
        timeLabel: "Finish",
        notes: "Filter through paper or cloth. Serve over ice or dilute 1:1.",
        atSeconds: 360,
        durationSeconds: 60,
      },
    ],
    flavorProfile: { sweetness: 72, acidity: 30, body: 76, bitterness: 28, finish: 66 },
    tastingNotes: "Cocoa nib, ripe berry, brown sugar, and a soft, rounded mouthfeel.",
    flavorTags: ["Chocolate", "Berry", "Smooth", "Low acid"],
    equipment: [
      { name: "Immersion jar", detail: "1 L capacity" },
      { name: "Burr grinder", detail: "Coarse setting" },
      { name: "Filter", detail: "Paper or cloth" },
      { name: "Fridge", detail: "12–16 hr steep" },
      { name: "Bottle", detail: "Store concentrate" },
    ],
    similarSlugs: ["raw-v60-ethiopian", "espresso-lab-signature"],
  },
];

export function getPlaceholderRecipeDetail(slug: string): PlaceholderRecipeDetail | null {
  return PLACEHOLDER_RECIPES.find((recipe) => recipe.slug === slug) ?? null;
}

export function listPlaceholderRecipeDetails(): PlaceholderRecipeDetail[] {
  return PLACEHOLDER_RECIPES;
}
