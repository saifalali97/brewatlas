import { getRecipeSlug } from "@/lib/data/recipes";
import { featuredRecipes } from "@/data/homepage";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";

export const rwandaBourbonV60: StaticRecipeDetail = {
  slug: getRecipeSlug(featuredRecipes[7]!),
  verified: true,
  coffeeDoseG: 15,
  waterAmountG: 240,
  grindSize: "Medium-fine — Comandante ~15 clicks as a starting point",
  waterTemperatureC: 93,
  bloomAmountG: 30,
  bloomTime: "0:35",
  pours: [
    { pourNumber: 1, waterAmountG: 30, timeLabel: "0:00", notes: "Bloom with one gentle swirl." },
    { pourNumber: 2, waterAmountG: 90, timeLabel: "0:35", notes: "Pour to 120 g total." },
    { pourNumber: 3, waterAmountG: 70, timeLabel: "1:30", notes: "Pour to 190 g." },
    { pourNumber: 4, waterAmountG: 50, timeLabel: "2:15", notes: "Final pour to 240 g." },
  ],
  totalBrewTime: "3:45",
  yieldG: 215,
  device: "Origami S or Hario V60-02",
  grinder: "Burr grinder with low fines",
  filter: "Kalita wave 155/185 or V60 paper, rinsed",
  waterProfile: "~75 ppm filtered or Third Wave Classic",
  equipment: ["Origami or V60", "Gooseneck kettle", "Scale", "Timer"],
  flavorNotes: "Black tea, cranberry, brown sugar — acidity should feel structured, not sharp.",
  instructions:
    "Rinse filter and dose 15 g. Bloom 30 g, swirl once, wait 35 seconds. Execute four pours to 240 g following the schedule. Target drawdown completion between 3:30 and 4:00.",
  whyThisRecipeExists:
    "Rwandan Bourbon often tastes like black tea with red fruit — beautiful on a flat-bottom dripper that forgives small pour mistakes. Origami gives you V60-like clarity with slightly more even drainage.",
  whyParametersWork:
    "Fifteen grams keeps the brew small and hot — important for high-acid lots that go sour when the slurry cools mid-pour. Four stages maintain temperature without one violent pour that channels through the flat bed.",
  expectedCup: {
    extraction:
      "Target 19–20%. Rwandan acidity can taste 'strong' even at moderate extraction — trust balance over numbers.",
    body: "Medium-light — tea-like with a little more weight than Chemex.",
    sweetness: "Brown sugar and red fruit when drawdown is on time.",
    acidity: "Vibrant cranberry and citrus — should complement sweetness, not dominate.",
    aftertaste: "Clean tea-like finish; astringency means over-extraction.",
  },
  waterChemistry:
    "Moderate hardness. Very soft water can make Rwanda taste thin; very hard water mutes the red fruit.",
  grinderNotes:
    "Rwanda benefits from uniform particles — fines cause astringency quickly. If the cup dries out, coarsen before assuming you need more extraction.",
  filterNotes:
    "Wave filters on Origami add a touch more body than V60 paper alone. Rinse either thoroughly.",
  bloomExplanation:
    "Double-weight bloom degasses Bourbon varieties roasted light. One swirl levels the bed on a flat-bottom dripper — more swirling invites channeling.",
  troubleshooting: {
    bitter: "Coarser grind or drop temperature to 91°C.",
    sour: "Finer grind, extend bloom ten seconds, or finish drawdown closer to 4:00.",
    weak: "Increase dose to 16 g or grind slightly finer.",
    strong: "Bypass 25 g water in the server.",
    slowDrawdown: "Coarser grind — flat beds stall when too fine.",
    fastDrawdown: "Finer grind or slower pours on stages two and three.",
  },
  expertTips: [
    "Rest coffee at least a week off roast — day-three Rwanda can taste grassy.",
    "On V60, expect finish fifteen to twenty seconds earlier — stop pours at weight, not clock.",
    "Compare wave vs V60 filter once — body difference teaches filter choice.",
  ],
  competitionNotes:
    "Flat-bottom multi-pour recipes mirror routines from April Coffee and similar Nordic-style competitors who favour clarity with forgiving bed geometry.",
  whenToChoose:
    "When you have a bright African Bourbon and want tea-like clarity with less channel risk than a fast V60 spiral.",
  bestFor:
    "Brewers exploring Origami/Kalita after mastering V60 — same coffee, different geometry lesson.",
  beanRecommendations: "Rwanda Nyamasheke Bourbon, or other high-grown African Bourbon varieties.",
  roastRecommendations: "Light. Medium starts to taste baked in long pours.",
  waterRecommendations: "Third Wave Classic or filtered ~75 ppm.",
  faq: [
    {
      question: "Origami vs V60?",
      answer: "Same parameters. V60 finishes faster; stop at 240 g either way.",
    },
    {
      question: "Kalita Wave only?",
      answer: "Yes — use the same pours. The wave bottom already slows flow.",
    },
  ],
  storageTips: "Serve fresh — red fruit notes fade within thirty minutes.",
  commonMistakes: [
    "One continuous pour on a flat bed — channels down the centre.",
    "Water at rolling boil on a two-day-off roast.",
    "Confusing 'bright' with 'sour' — fix grind before blaming the origin.",
  ],
  relatedRecipeSlugs: ["ethiopian-yirgacheffe-pour-over", "panama-geisha-chemex"],
  galleryImages: ["/images/recipes/origami-dripper.webp", "/images/methods/pour-over.webp"],
};
