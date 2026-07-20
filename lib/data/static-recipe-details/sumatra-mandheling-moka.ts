import { getRecipeSlug } from "@/lib/data/recipes";
import { featuredRecipes } from "@/data/homepage";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";

export const sumatraMandhelingMoka: StaticRecipeDetail = {
  slug: getRecipeSlug(featuredRecipes[5]!),
  verified: true,
  coffeeDoseG: 20,
  waterAmountG: 200,
  grindSize: "Medium-fine — finer than drip, never as fine as espresso",
  waterTemperatureC: 99,
  bloomAmountG: null,
  bloomTime: null,
  pours: [
    {
      pourNumber: 1,
      waterAmountG: 200,
      timeLabel: "0:00",
      notes: "Pre-heated water in lower chamber; level grounds in basket, no tamp.",
    },
  ],
  totalBrewTime: "5:00",
  yieldG: 180,
  device: "Bialetti Moka Pot (3-cup)",
  grinder: "Burr grinder",
  filter: "Built-in screen — clean and seated properly",
  waterProfile: "Filtered, filled to safety valve",
  equipment: ["Moka pot", "Scale", "Timer", "Heat source", "Cold towel optional"],
  flavorNotes: "Cedar, dark cocoa, heavy body — almost syrupy.",
  instructions:
    "Fill the lower chamber with pre-heated filtered water to the valve. Add 20 g medium-fine coffee to the basket, level without tamping. Assemble tightly. Medium heat until coffee flows, then lower heat. Remove when the stream lightens to honey colour — before the hissing steam phase.",
  whyThisRecipeExists:
    "Moka pot is the everyday pressure brewer — not espresso, not drip. Sumatra Mandheling's earthy body fits the format. This recipe avoids the metallic bitterness that comes from cold water on a high flame.",
  whyParametersWork:
    "Pre-heated water shortens contact with the heat source so the coffee spends less time cooking. Medium-fine grind gives resistance without blocking flow. Stopping before steam prevents the final bitter phase from entering the cup.",
  expectedCup: {
    extraction:
      "Higher than drip, lower than espresso — often tastes strong even at moderate extraction. Bitterness usually means heat or grind, not always 'over-extracted' in the lab sense.",
    body: "Full and heavy. Oils remain in the cup — that is the point.",
    sweetness: "Cocoa and molasses notes if you stop early enough.",
    acidity: "Low. Should not taste sour unless the roast is very light.",
    aftertaste: "Earthy and long. Woody notes mean you left it on heat too long.",
  },
  waterChemistry: "Filtered tap is fine. Scale in the chamber affects heat transfer — descale periodically.",
  grinderNotes:
    "Too fine and the pot sputters and stalls. Too coarse and the cup tastes weak and thin. Adjust in small steps and listen to the flow.",
  filterNotes:
    "Replace gaskets when they harden. Coffee oils in the screen add rancid notes over weeks.",
  bloomExplanation: null,
  troubleshooting: {
    bitter: "Remove from heat earlier, coarser grind, or pre-heat water more aggressively.",
    sour: "Unusual — may be under-filled basket or very light roast. Try finer grind.",
    weak: "Slightly finer grind or add 1 g dose. Check basket is full and level.",
    strong: "Dilute with hot water Americano-style, or use the 2-cup pot with same dose for intensity.",
  },
  expertTips: [
    "Keep the lid open while brewing so you can see colour change.",
    "Run the base under cold water to stop extraction the moment colour lightens.",
    "Never tamp — the moka basket is not an espresso portafilter.",
  ],
  competitionNotes:
    "You will not see moka on a WBrC stage, but the heat-management lessons transfer directly to espresso dial-in.",
  whenToChoose:
    "Camping, small kitchens, or when you want strong coffee without an espresso machine.",
  bestFor:
    "Dark-roast lovers and anyone who wants one reliable strong cup with minimal gear.",
  beanRecommendations: "Sumatra Mandheling, other Indonesian wet-hulled or low-acid lots.",
  roastRecommendations: "Medium-dark to dark. Light roasts taste sharp and thin in moka.",
  waterRecommendations: "Filtered, pre-heated in a kettle before filling the chamber.",
  faq: [
    {
      question: "Tamp or not?",
      answer: "Never tamp moka. Level the grounds and screw the top on firmly.",
    },
    {
      question: "When to stop?",
      answer: "When the stream turns from dark ribbon to pale honey — before loud hissing.",
    },
  ],
  storageTips: "Serve immediately. Moka coffee on a hot plate turns bitter in minutes.",
  commonMistakes: [
    "Cold water plus high flame — cooks the coffee while pressure builds.",
    "Leaving the pot on heat through the steam phase.",
    "Tamping because 'espresso is compressed'.",
  ],
  relatedRecipeSlugs: ["signature-cortado", "kyoto-cold-brew"],
  galleryImages: ["/images/recipes/moka-pot-classic.webp"],
};
