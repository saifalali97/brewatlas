import { getRecipeSlug } from "@/lib/data/recipes";
import { featuredRecipes } from "@/data/homepage";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";

export const kyotoColdBrew: StaticRecipeDetail = {
  slug: getRecipeSlug(featuredRecipes[1]!),
  verified: true,
  coffeeDoseG: 100,
  waterAmountG: 1200,
  grindSize: "Coarse — noticeably chunkier than French press",
  waterTemperatureC: 20,
  bloomAmountG: null,
  bloomTime: null,
  pours: [
    {
      pourNumber: 1,
      waterAmountG: 1200,
      timeLabel: "0:00",
      notes: "Combine grounds and cold water. Stir until no dry pockets remain.",
    },
  ],
  totalBrewTime: "8 hr",
  yieldG: 950,
  device: "Jar, Toddy, or Kyoto tower",
  grinder: "Burr grinder preferred",
  filter: "Fine mesh, then paper if the cup is silty",
  waterProfile: "Clean filtered water (50–150 ppm TDS)",
  equipment: ["Vessel with lid", "Scale", "Mesh sieve", "Optional paper filters"],
  flavorNotes: "Dark chocolate, caramel, and a round sweetness with little bitterness.",
  instructions:
    "Weigh 100 g coarse coffee and 1,200 g cold filtered water. Stir to saturate, cover, and refrigerate eight hours. Strain through mesh. If the cup looks cloudy, run it through paper once. Store concentrate sealed in the fridge.",
  whyThisRecipeExists:
    "Cold brew is not lazy iced coffee — done well, it is a different extraction curve. This recipe targets a concentrate you can dilute without losing sweetness, using Colombian chocolate-forward lots that still taste good when brewed cold.",
  whyParametersWork:
    "One-to-twelve keeps the concentrate strong enough for ice without tasting like watered-down diner coffee. Coarse grounds slow extraction so you get sugars and chocolate without pulling the harsh late compounds that hot water grabs in minutes. Refrigeration slows oxidation while the brew runs.",
  expectedCup: {
    extraction:
      "Cold brew often lands lower in measured extraction (around 16–18%) but tastes sweeter because fewer bitter compounds dissolve. That is normal — do not chase hot-brew TDS numbers.",
    body: "Medium-full when diluted; syrupy if drunk straight over ice.",
    sweetness: "High — cold water favours sugars over dry bitterness.",
    acidity: "Low and mellow. If you want brightness, shorten steep time or choose a lighter origin.",
    aftertaste: "Clean chocolate and caramel; should not turn woody unless over-steeped past twelve hours.",
  },
  waterChemistry:
    "Use water you would happily drink straight. Chlorine becomes obvious in cold brew. You do not need specialised mineral water — clarity matters more than chasing magnesium ratios here.",
  grinderNotes:
    "If the concentrate tastes muddy, your grind is too fine or your grinder produces excess fines. A single coarse pass beats a medium grind with a long steep.",
  filterNotes:
    "Mesh alone is fine for home use. Paper after mesh removes silty mouthfeel for service-style clarity. Skip paper if you prefer a heavier body.",
  bloomExplanation: null,
  troubleshooting: {
    bitter: "Steeped too long or grind too fine. Cut time to six hours next batch, or dilute more aggressively.",
    sour: "Uncommon in cold brew. Usually under-steeped (try ten hours) or a very light roast that wants hot water.",
    weak: "Increase dose to 110 g, or steep two hours longer before tasting.",
    strong: "Dilute 1:1 with water or milk. You can also add ice without extra water if you want chill without dilution.",
  },
  expertTips: [
    "Stir at the start — dry clumps float and extract unevenly.",
    "Label the jar with brew time. Eight hours in the fridge is different from eight on the counter.",
    "Try the same coffee hot side-by-side once. It teaches you what cold extraction leaves behind.",
  ],
  competitionNotes:
    "Cold brew rarely appears in brewers cup service, but concentrate ratios like this mirror what many specialty cafés batch overnight for service consistency.",
  whenToChoose:
    "When you want a low-acid, chocolate-forward cup, or you need coffee ready before guests arrive.",
  bestFor:
    "Batch brewers, iced coffee drinkers, and anyone who finds morning acidity harsh on an empty stomach.",
  beanRecommendations:
    "Colombian, Brazilian, or Central American lots with chocolate and nut notes. Washed or honey processes both work.",
  roastRecommendations:
    "Medium to medium-dark. Very light roasts can taste thin cold unless you shorten the recipe.",
  waterRecommendations: "Filtered tap. Avoid distilled unless you remineralise — flat water makes flat concentrate.",
  faq: [
    {
      question: "Room temperature steep?",
      answer: "Possible, but refrigerate within two hours and drink within forty-eight hours for safety.",
    },
    {
      question: "How do I serve Kyoto-style?",
      answer: "Slow drip towers produce a lighter cup. This jar method is richer — dilute over ice for a similar drinking experience.",
    },
  ],
  storageTips: "Sealed in the fridge, five days. Do not freeze brewed coffee — it separates on thawing.",
  commonMistakes: [
    "Fine grind plus twelve-hour steep — bitter, muddy concentrate.",
    "Leaving concentrate on the counter overnight.",
    "Pouring concentrate straight without tasting strength first.",
  ],
  relatedRecipeSlugs: ["ethiopian-yirgacheffe-pour-over", "sumatra-mandheling-moka"],
  galleryImages: ["/images/recipes/cold-brew.webp"],
};
