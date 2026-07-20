import { getRecipeSlug } from "@/lib/data/recipes";
import { featuredRecipes } from "@/data/homepage";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";

export const espressoTonic: StaticRecipeDetail = {
  slug: getRecipeSlug(featuredRecipes[3]!),
  verified: true,
  coffeeDoseG: 18,
  waterAmountG: 36,
  grindSize: "Fine espresso — dial for 36 g in 25–30 s",
  waterTemperatureC: 93,
  bloomAmountG: null,
  bloomTime: null,
  pours: [
    {
      pourNumber: 1,
      waterAmountG: 36,
      timeLabel: "0:00",
      notes: "Pull espresso directly onto ice and tonic in the glass.",
    },
  ],
  totalBrewTime: "30 sec",
  yieldG: 180,
  device: "Espresso machine",
  grinder: "Espresso-capable burr grinder",
  filter: "Double basket",
  waterProfile: "Filtered for espresso; tonic chilled separately",
  equipment: ["Espresso machine", "Highball glass", "Ice", "Tonic water", "Optional orange peel"],
  flavorNotes: "Kenyan blackcurrant and citrus lifted by quinine and carbonation.",
  instructions:
    "Fill a highball with ice and 120 ml cold tonic. Pull 36 g espresso (18 g dose) onto the ice. Stir once. Express orange peel over the top if you like.",
  whyThisRecipeExists:
    "Espresso tonic works when the coffee has acidity that can stand next to quinine. Kenyan SL28-style lots already taste like blackcurrant — tonic and ice turn that into something refreshing instead of sour.",
  whyParametersWork:
    "A standard 1:2 shot keeps body in a drink that would feel thin with a 1:3 lungo. Ice chills without needing a long pull. Tonic lengthens the drink so you are not drinking straight espresso over ice.",
  expectedCup: {
    extraction: "Same as a straight espresso shot — the tonic does not change extraction, only perception.",
    body: "Light-medium once mixed; effervescence lifts aromatics.",
    sweetness: "Moderate from tonic sugar and coffee sugars together. Should not taste like soda.",
    acidity: "Bright and sparkling — acidity should feel intentional, not harsh.",
    aftertaste: "Clean citrus and berry; quinine bitterness should sit in the background.",
  },
  waterChemistry:
    "Espresso water as usual. Tonic quality matters more than coffee water here — flat or overly sweet tonic ruins the balance.",
  grinderNotes: "Dial the shot before building the drink. A sour fast shot stays sour in tonic.",
  filterNotes: "Same as any espresso — clean basket, fresh flush.",
  bloomExplanation: null,
  troubleshooting: {
    bitter: "Shot over-extracted — coarser or shorter yield before adding tonic.",
    sour: "Under-extracted shot or warm tonic. Fix the espresso first.",
    weak: "Add 10 g more espresso or reduce tonic to 100 ml.",
    strong: "More ice, or top with 30 ml soda water.",
    channeling: "Fix distribution on the espresso bed — channeling tastes worse with tonic amplifying sour notes.",
  },
  expertTips: [
    "Chill the glass and tonic. Hot espresso on warm tonic loses carbonation instantly.",
    "Pour tonic first, espresso second — you get a brief layered look and less foam collapse.",
    "Peel oils from orange skin over the glass; do not drop the whole slice in unless you want pulp.",
  ],
  competitionNotes:
    "Signature drinks inspired this category in many national barista championships — the lesson is pairing acidity with complementary bitterness, not hiding coffee.",
  whenToChoose:
    "Hot afternoons, or when you want to show off a bright Kenyan or Ethiopian without milk.",
  bestFor:
    "Espresso drinkers who find straight iced shots too intense.",
  beanRecommendations: "Kenyan Nyeri or similar high-acid washed lots. Some Ethiopians work; Brazils often taste flat here.",
  roastRecommendations: "Light to medium. Dark roasts clash with tonic bitterness.",
  waterRecommendations: "Good espresso water in the machine; quality tonic out of the fridge.",
  faq: [
    {
      question: "Which tonic?",
      answer: "Quinine-forward, not overly sweet. Fever-Tree and similar work; avoid flavoured tonics.",
    },
    {
      question: "No espresso machine?",
      answer: "Strong Aeropress (15 g, 200 g water, fine grind) or cold brew concentrate — softer, still pleasant.",
    },
  ],
  storageTips: "Build to order. Carbonation dies in minutes.",
  commonMistakes: [
    "Flat tonic from an opened bottle days ago.",
    "Pulling long to fill the glass — use more tonic instead.",
    "Over-sweet tonic masking a bad shot instead of fixing the grind.",
  ],
  relatedRecipeSlugs: ["signature-cortado", "rwanda-bourbon-v60"],
  galleryImages: ["/images/recipes/espresso-tonic.webp"],
};
