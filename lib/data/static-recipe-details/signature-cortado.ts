import { getRecipeSlug } from "@/lib/data/recipes";
import { featuredRecipes } from "@/data/homepage";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";

export const signatureCortado: StaticRecipeDetail = {
  slug: getRecipeSlug(featuredRecipes[2]!),
  verified: true,
  coffeeDoseG: 18,
  waterAmountG: 36,
  grindSize: "Fine — adjust until 18 g yields 36 g in 25–30 seconds",
  waterTemperatureC: 93,
  bloomAmountG: null,
  bloomTime: null,
  pours: [
    {
      pourNumber: 1,
      waterAmountG: 36,
      timeLabel: "0:00",
      notes: "Extract double shot. Weigh the cup; taste if time drifts.",
    },
  ],
  totalBrewTime: "25 sec",
  yieldG: 36,
  device: "Espresso machine with stable pressure",
  grinder: "Espresso-capable burr grinder",
  filter: "18 g precision or double basket, flushed group head",
  waterProfile: "~100 ppm for espresso (Third Wave Water Espresso or filtered)",
  equipment: ["Espresso machine", "Tamper", "Scale", "Steaming pitcher", "4–5 oz glass"],
  flavorNotes: "Dense crema, sweet espresso base, and glossy microfoam in equal proportion.",
  instructions:
    "Flush the group, grind 18 g, distribute level, tamp straight. Lock in and start immediately. Stop near 36 g out between 25 and 30 seconds. Steam milk to 55–62°C with minimal stretch. Pour milk over the espresso in a small glass — roughly equal volumes.",
  whyThisRecipeExists:
    "A cortado is where espresso meets milk without losing the coffee. This is not a latte with less foam — it is a ratio exercise. Antigua Guatemala at medium-dark gives you chocolate and spice that still read through four ounces of milk.",
  whyParametersWork:
    "One-to-two in under thirty seconds keeps acidity in check for a darker-leaning roast while still extracting enough sugar. Milk volume matches espresso volume so dilution is gentle — you taste origin, not just sweetness.",
  expectedCup: {
    extraction:
      "Espresso extraction often measures 18–22% depending on machine. Crema colour and taste beat the refractometer here — stripes in the crema and a sweet finish mean you are close.",
    body: "Full, velvety from milk fat and espresso oils together.",
    sweetness: "High if the shot is not over-extracted. Milk adds lactose sweetness without needing sugar.",
    acidity: "Moderate — present but softened. Should not taste sharp unless the roast is very light.",
    aftertaste: "Chocolate and roasted nuts; milk should not leave a soapy note.",
  },
  waterChemistry:
    "Espresso is unforgiving of bad water. Scale damages machines; chlorine shows in the cup. Use filtered water within the range your machine manufacturer suggests.",
  grinderNotes:
    "Dial in by time and taste, not by someone else's number. If the shot gushes in fifteen seconds, go finer. If it drips past forty, go coarser. Note the setting when it tastes sweet.",
  filterNotes:
    "Clean, dry basket. Old coffee oils in the portafilter turn good shots rancid. Flush until the water runs clear.",
  bloomExplanation: null,
  troubleshooting: {
    bitter: "Coarser grind, lower yield (34 g), or drop temperature one degree. Check roast date — old dark coffee goes bitter fast.",
    sour: "Finer grind or slightly longer yield (38 g) if the shot ran fast.",
    weak: "Increase dose to 19 g or tighten ratio to 1:1.8.",
    strong: "Add a splash more milk or pull a shorter 34 g shot next time.",
    channeling:
      "Uneven distribution shows as blond streaks in the cup and sour-bitter at once. WDT or a leveling tool helps; tamp level, not hard.",
  },
  expertTips: [
    "Weigh output, not time alone. A scale under the cup beats guessing.",
    "Steam with the tip just below the surface until the pitcher feels warm, then bury the tip for texture.",
    "Serve in a warm glass — cortados cool quickly in small volumes.",
  ],
  competitionNotes:
    "Milk drinks rarely win brewers cup, but the balance here mirrors what many barista champions aim for in cappuccino service: sweetness without losing the coffee's identity.",
  whenToChoose:
    "When you want milk texture without drowning a single-origin espresso.",
  bestFor:
    "Espresso owners who already dial in daily and want a milk drink that still tastes like coffee.",
  beanRecommendations:
    "Central American washed or honey lots with chocolate and spice. Antigua Guatemala is the reference here.",
  roastRecommendations: "Medium to medium-dark. Very light single origins often taste sour in a cortado ratio.",
  waterRecommendations: "Filtered, in the espresso range (~75–125 ppm). Descale the machine on schedule.",
  faq: [
    {
      question: "Single or double basket?",
      answer: "Double 18 g dose. Single baskets are harder to dial evenly on many home machines.",
    },
    {
      question: "Plant milk?",
      answer: "Barista oat works if you stretch less and serve immediately — microfoam falls apart faster than dairy.",
    },
  ],
  storageTips: "Drink within two minutes of pouring milk. Neither component improves with waiting.",
  commonMistakes: [
    "Scalding milk past 65°C — flat sweetness and a cooked taste.",
    "Pulling 40 g in twenty seconds because the grind was too coarse, then masking it with milk.",
    "Skipping the flush — yesterday's shot in today's cup.",
  ],
  relatedRecipeSlugs: ["espresso-tonic", "sumatra-mandheling-moka"],
  galleryImages: ["/images/recipes/espresso-shot.webp"],
};
