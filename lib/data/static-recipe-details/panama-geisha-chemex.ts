import { getRecipeSlug } from "@/lib/data/recipes";
import { featuredRecipes } from "@/data/homepage";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";

export const panamaGeishaChemex: StaticRecipeDetail = {
  slug: getRecipeSlug(featuredRecipes[4]!),
  verified: true,
  coffeeDoseG: 30,
  waterAmountG: 450,
  grindSize: "Medium-coarse — one step coarser than your V60 setting",
  waterTemperatureC: 94,
  bloomAmountG: 60,
  bloomTime: "0:45",
  pours: [
    { pourNumber: 1, waterAmountG: 60, timeLabel: "0:00", notes: "Bloom only. Gentle swirl." },
    { pourNumber: 2, waterAmountG: 195, timeLabel: "0:45", notes: "Pour to the middle of the bed, not the walls." },
    { pourNumber: 3, waterAmountG: 195, timeLabel: "2:30", notes: "Final pour to 450 g. Let drain completely." },
  ],
  totalBrewTime: "4:00",
  yieldG: 410,
  device: "Chemex 6-cup",
  grinder: "High-quality burr grinder — fines matter on expensive coffee",
  filter: "Chemex bonded paper, rinsed well",
  waterProfile: "Soft ~80 ppm (low alkalinity)",
  equipment: ["Chemex", "Gooseneck kettle", "Scale", "Timer"],
  flavorNotes: "Jasmine tea, mango, honey — clarity over power.",
  instructions:
    "Rinse the Chemex filter until water runs clear. Add 30 g medium-coarse grounds. Bloom with 60 g for 45 seconds. Pour second stage to 255 g, wait for drawdown to slow, then final pour to 450 g. Total time near four minutes.",
  whyThisRecipeExists:
    "Panama Geisha is expensive enough that every variable should earn its place. Chemex's thick paper strips oils that would mute florals in a French press. This recipe is for when you want to taste what you paid for.",
  whyParametersWork:
    "Thirty grams at 1:15 slows the brew enough for even extraction in a large filter. Medium-coarse grind fights the Chemex's natural slow flow — too fine and you stall past five minutes. A longer bloom suits dense, high-altitude beans.",
  expectedCup: {
    extraction:
      "Often 18–19% — Geisha can taste perfect below the 'standard' 20% because of intense aromatics. Dry finish means you went too far.",
    body: "Light, tea-like. If you want weight, switch to a V60 with the same coffee.",
    sweetness: "Delicate honey and stone fruit — subtle, not candy-like.",
    acidity: "Elegant, not sharp. Should feel like citrus zest, not vinegar.",
    aftertaste: "Long floral — jasmine should outlast the mug cooling.",
  },
  waterChemistry:
    "Soft water lets florals shine. Hard water can make Geisha taste flat and chalky. If you only have tap, filter chlorine at minimum.",
  grinderNotes:
    "Fines are the enemy on Chemex. If drawdown exceeds five minutes, coarsen rather than accepting bitterness. A sifter is overkill for most homes — a good grinder adjustment is enough.",
  filterNotes:
    "Chemex paper is thick — rinse aggressively. Unrinsed paper tastes like cardboard next to jasmine.",
  bloomExplanation:
    "Geisha is often roasted light and holds CO₂. Double-weight bloom for forty-five seconds prevents the second pour from bubbling over and channeling.",
  troubleshooting: {
    bitter: "Grind coarser or stop pouring earlier. Geisha turns astringent quickly when over-extracted.",
    sour: "Finer grind, or extend bloom ten seconds. Check that water was hot enough.",
    weak: "Increase dose to 32 g without changing ratio, or grind slightly finer.",
    strong: "Add 30 g bypass water in the server after brewing.",
    slowDrawdown: "Coarser grind. Chemex stalls are almost always grind-related.",
    fastDrawdown: "Finer grind, or pour more slowly on stage two.",
  },
  expertTips: [
    "Do not stir after the bloom unless you stalled — agitation costs clarity.",
    "Use water thirty seconds off boil; boiling onto Geisha scorches florals.",
    "Cup at two temperatures. Many competition judges taste Geisha coolest.",
  ],
  competitionNotes:
    "Chemex and similar high-clarity methods appear in WBrC when competitors want maximum separation of notes — at the cost of body.",
  whenToChoose:
    "Special occasions, competition prep, or any time florals matter more than caffeine kick.",
  bestFor:
    "Brewers who already own a gooseneck and want to taste the difference paper filtration makes.",
  beanRecommendations: "Panama Boquete Geisha or other high-elevation floral lots. Skip dark roasts entirely.",
  roastRecommendations: "Light only. If you see oil on the surface, this is not the right recipe.",
  waterRecommendations: "Soft filtered or Third Wave Light profile.",
  faq: [
    {
      question: "Origami instead?",
      answer: "Same numbers work. Expect slightly more body with a wave filter.",
    },
    {
      question: "Worth the Chemex paper cost?",
      answer: "For Geisha, yes — the filtration difference is audible in the cup.",
    },
  ],
  storageTips: "Serve within fifteen minutes. Florals are the first thing to leave.",
  commonMistakes: [
    "Grinding V60-fine and stalling five-plus minutes.",
    "Skimping on rinse water to save paper flavour.",
    "Brewing Geisha darker than light because it feels safer.",
  ],
  relatedRecipeSlugs: ["ethiopian-yirgacheffe-pour-over", "rwanda-bourbon-v60"],
  galleryImages: ["/images/recipes/chemex.webp", "/images/recipes/coffee-beans-macro.webp"],
};
