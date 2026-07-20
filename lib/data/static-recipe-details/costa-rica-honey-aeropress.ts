import { getRecipeSlug } from "@/lib/data/recipes";
import { featuredRecipes } from "@/data/homepage";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";

export const costaRicaHoneyAeropress: StaticRecipeDetail = {
  slug: getRecipeSlug(featuredRecipes[6]!),
  verified: true,
  coffeeDoseG: 17,
  waterAmountG: 238,
  grindSize: "Medium-fine — slightly finer than pourover",
  waterTemperatureC: 88,
  bloomAmountG: null,
  bloomTime: null,
  pours: [
    {
      pourNumber: 1,
      waterAmountG: 238,
      timeLabel: "0:00",
      notes: "Pour all water, stir ten seconds, pull plunger up slightly to stop drip.",
    },
    {
      pourNumber: 2,
      waterAmountG: null,
      timeLabel: "1:45",
      notes: "Press steadily for thirty seconds until you hear a hiss.",
    },
  ],
  totalBrewTime: "2:00",
  yieldG: 220,
  device: "AeroPress (standard or inverted)",
  grinder: "Burr grinder",
  filter: "Paper (rinsed) for clarity; metal for body",
  waterProfile: "Filtered tap",
  equipment: ["AeroPress", "Scale", "Timer", "Stir paddle"],
  flavorNotes: "Red apple, honey sweetness, clean caramel finish.",
  instructions:
    "Rinse paper filter and assemble on a sturdy mug. Add 17 g medium-fine coffee. Pour 238 g water at 88°C, stir ten seconds, insert plunger slightly to prevent dripping. At 1:45, press evenly for thirty seconds.",
  whyThisRecipeExists:
    "Honey-process Tarrazú sits between washed clarity and natural sweetness. AeroPress at lower temperature pulls sugars without the astringency that boiling water can trigger on pulpy coffees.",
  whyParametersWork:
    "Immersion for just under two minutes extracts mid-range compounds; air pressure at the end adds body paper filters alone cannot. Eighty-eight degrees protects delicate honey notes that ninety-four would flatten.",
  expectedCup: {
    extraction:
      "Often 19–20% equivalent — AeroPress TDS varies with filter. Sweetness is your guide.",
    body: "Medium — fuller than V60, cleaner than French press.",
    sweetness: "High — honey process plus moderate extraction.",
    acidity: "Moderate apple-like acidity, not lemon sharp.",
    aftertaste: "Caramel and clean finish; no drying tannins.",
  },
  waterChemistry: "Standard filtered water. Honey coffees show sweetness even in neutral water — do not over-mineralise.",
  grinderNotes:
    "A finer grind than V60 but not espresso-fine. If press effort exceeds comfortable hand pressure, coarsen slightly.",
  filterNotes:
    "Paper removes oils for a cleaner cup; metal adds weight. Rinse paper to avoid trace flavour.",
  bloomExplanation: null,
  troubleshooting: {
    bitter: "Coarser grind, lower temperature (85°C), or shorten steep to 1:30.",
    sour: "Finer grind or extend steep thirty seconds before pressing.",
    weak: "Increase dose to 18 g or grind finer.",
    strong: "Add 40 g hot water to the mug after pressing.",
    slowDrawdown: "Not applicable — if press is impossible, grind is too fine.",
    fastDrawdown: "If liquid runs through before you attach plunger, grind finer.",
  },
  expertTips: [
    "Inverted method gives more control if you travel — same numbers apply.",
    "Press on a scale once to learn what thirty seconds of force feels like.",
    "Try the same coffee on V60 to taste what pressure adds.",
  ],
  competitionNotes:
    "AeroPress championships popularised short immersion plus pressure — this recipe is conservative enough for daily use but shares the same logic.",
  whenToChoose:
    "Travel, office, or when you want one cup with body and clarity without a kettle pour routine.",
  bestFor:
    "Honey and natural Central Americans, or anyone learning how temperature changes sweetness.",
  beanRecommendations: "Costa Rica Tarrazú honey, or similar Central American honey/pulped natural lots.",
  roastRecommendations: "Medium. Very light can taste sour at 88°C — raise to 90°C if needed.",
  waterRecommendations: "Filtered tap off boil two minutes for 88°C.",
  faq: [
    {
      question: "Inverted vs standard?",
      answer: "Same recipe. Inverted prevents early drip-through on finer grinds.",
    },
    {
      question: "Scale up?",
      answer: "Keep 1:14 — 20 g coffee, 280 g water, extend press time slightly if needed.",
    },
  ],
  storageTips: "Drink within fifteen minutes. Pressed coffee stales quickly.",
  commonMistakes: [
    "Boiling water on honey lots — flattens sweetness.",
    "Rushing the press in ten seconds — uneven extraction.",
    "Skipping the stir — dry pockets stay sour.",
  ],
  relatedRecipeSlugs: ["ethiopian-yirgacheffe-pour-over", "panama-geisha-chemex"],
  galleryImages: ["/images/recipes/costa-rica-aeropress.webp"],
};
