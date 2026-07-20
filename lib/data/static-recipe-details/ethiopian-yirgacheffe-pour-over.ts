import { getRecipeSlug } from "@/lib/data/recipes";
import { featuredRecipes } from "@/data/homepage";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";

export const ethiopianYirgacheffePourOver: StaticRecipeDetail = {
  slug: getRecipeSlug(featuredRecipes[0]!),
  verified: true,
  coffeeDoseG: 18,
  waterAmountG: 288,
  grindSize: "Medium-fine — Baratza Encore ~18, or 25–28 on a 1Zpresso JX",
  waterTemperatureC: 94,
  bloomAmountG: 36,
  bloomTime: "0:30",
  pours: [
    { pourNumber: 1, waterAmountG: 36, timeLabel: "0:00", notes: "Bloom only. Swirl the dripper once so every ground is wet." },
    { pourNumber: 2, waterAmountG: 100, timeLabel: "0:30", notes: "Spiral from center outward. Stop at 136 g on the scale." },
    { pourNumber: 3, waterAmountG: 80, timeLabel: "1:15", notes: "Keep the slurry depth steady — about 1 cm above the bed." },
    { pourNumber: 4, waterAmountG: 72, timeLabel: "2:00", notes: "Final pour to 288 g. Let it drain; do not stir." },
  ],
  totalBrewTime: "3:30",
  yieldG: 260,
  device: "Hario V60-02",
  grinder: "Any consistent burr grinder",
  filter: "Hario V60 paper, rinsed",
  waterProfile: "~80 ppm total hardness, low alkalinity (Third Wave Water Classic Light, or filtered tap)",
  equipment: ["V60-02", "Gooseneck kettle", "0.1 g scale", "Timer"],
  flavorNotes: "Jasmine, bergamot, and ripe stone fruit. The finish should feel silky, not sharp.",
  instructions:
    "Rinse the filter and pre-heat the server. Add 18 g ground coffee, level the bed. At 0:00, pour 36 g water for the bloom and swirl gently. At 0:30, begin the second pour. Follow the pour schedule to 288 g total. Remove the dripper when the bed looks dry and the timer reads roughly 3:15–3:45.",
  whyThisRecipeExists:
    "Washed Yirgacheffe is one of those coffees that punishes heavy hands. Aggressive pouring or a long stall turns jasmine into bitterness. This recipe borrows the calm, multi-stage approach you see on World Brewers Cup stages — enough structure to repeat, enough restraint to let the cup stay clean.",
  whyParametersWork:
    "Eighteen grams at 1:16 gives you a small but stable brew mass: water stays hot, and you can finish before the delicate aromatics fade. Ninety-four degrees offsets heat loss without scorching a light roast. A double bloom weight releases CO₂ from high-density Ethiopian beans so the main pours do not burp and stall.",
  expectedCup: {
    extraction:
      "Aim for roughly 19–20% extraction if you measure (TDS around 1.35–1.45% in the cup). If you do not measure, trust sweetness: a dry, papery finish usually means you went past the sweet spot.",
    body: "Light to medium — more tea than syrup. You should not mistake it for a heavy natural.",
    sweetness: "Pronounced when drawdown lands near 3:30. If the cup tastes flat and thin, extraction likely ran short.",
    acidity: "Bright and citric, but integrated. It should read as juicy, not like lemon juice on its own.",
    aftertaste: "Floral and long. Bergamot and stone fruit should hang around without turning bitter.",
  },
  waterChemistry:
    "Soft water with moderate hardness (roughly 50–90 ppm) tends to highlight florals in washed Ethiopians. Very hard water can flatten acidity; very distilled water can make the cup feel hollow. If your tap water tastes of chlorine, filter it.",
  grinderNotes:
    "Particle uniformity matters more than the brand. Blade grinders will give you boulders and fines in the same cup — fine for daily drinking, not for this recipe. If your drawdown finishes before 3:00, you are probably too coarse; past 4:15, too fine.",
  filterNotes:
    "Rinse thoroughly. A dry paper filter adds a cardboard note that competes with jasmine. Pre-heating the dripper also keeps the slurry from crashing mid-brew.",
  bloomExplanation:
    "Fresh light roasts hold a lot of gas. The bloom is not ceremonial — it opens the bed so water can move through evenly on pours two through four. If your coffee is more than six weeks off roast, you can shorten the bloom to 20 seconds.",
  troubleshooting: {
    bitter: "Grind one notch coarser, or finish the last pour 15 seconds earlier. Check water temperature — boiling straight onto the bed can scorch.",
    sour: "Grind finer, or add 5 g to the bloom. A finish before 3:00 often means under-extraction.",
    weak: "Increase dose to 20 g and keep the ratio, or grind slightly finer while watching drawdown time.",
    strong: "Dilute with 20–30 g hot water in the server, or drop dose to 16 g next time.",
    slowDrawdown: "Grind coarser. If the bed looks muddy, your grinder may be producing too many fines — try a slightly coarser setting than you think you need.",
    fastDrawdown: "Grind finer, or pour more slowly on the second and third stages to give the water time in contact.",
  },
  expertTips: [
    "Spin the dripper once after the bloom, not after every pour — extra agitation costs clarity.",
    "Keep the kettle spout close to the slurry. Height creates turbulence that collapses the bed.",
    "Rest the coffee seven to fourteen days off roast. Day-two Yirgacheffe can taste grassy no matter what you do.",
    "Taste the cup at two temperatures. Acidity opens as it cools; sweetness shows best around 60°C.",
  ],
  competitionNotes:
    "Four-stage V60 recipes appear often in WBrC routines because judges can taste consistency across rounds. The trade-off is time — this is not a rush-before-work brew.",
  whenToChoose:
    "Reach for this when you have a washed Ethiopian or Kenyan with floral or citrus notes and you want the cup to taste like clear tea, not stewed fruit.",
  bestFor:
    "Home brewers comfortable with a scale and gooseneck who want to understand why pour structure changes clarity.",
  beanRecommendations:
    "Washed Yirgacheffe, Sidama, or similar high-grown Ethiopian lots. Natural Ethiopians can work but may need a coarser grind and lower temperature.",
  roastRecommendations:
    "Light to light-medium. If the beans look oily, drop temperature to 92°C and coarsen half a step.",
  waterRecommendations:
    "Filtered tap or remineralised distilled toward ~80 ppm. Avoid straight RO water without minerals.",
  faq: [
    {
      question: "Can I brew this on a Kalita Wave?",
      answer: "Yes. Same dose and ratio. Use two main pours instead of four — the flat bottom already slows drainage.",
    },
    {
      question: "Do I need a gooseneck?",
      answer: "It helps. A standard kettle makes controlled spirals harder; you can compensate by pouring from lower height and slower.",
    },
  ],
  storageTips: "Drink within twenty minutes. Florals fade fast in an open carafe.",
  commonMistakes: [
    "One continuous pour that channels through the middle of the bed.",
    "Grinding by time instead of taste — Ethiopian light roasts vary wildly by processor.",
    "Letting the slurry dry between pours, which cools the bed and stalls extraction.",
  ],
  relatedRecipeSlugs: ["rwanda-bourbon-v60", "panama-geisha-chemex", "costa-rica-honey-aeropress"],
  galleryImages: ["/images/methods/pour-over.webp", "/images/recipes/coffee-beans-macro.webp"],
};
