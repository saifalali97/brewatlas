import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageReference } from "@/types/gulf-heritage-reference";
import { localizeGulfHeritageRecipeContent } from "@/lib/content/gulf-heritage/localize";
import { getUaeVerifiedRecipeAr } from "@/lib/content/gulf-heritage/uae/verified-recipes.ar";
import type { Locale } from "@/types/i18n";
import { DEFAULT_LOCALE } from "@/types/i18n";

const SMITHSONIAN_KARAK_REF: GulfHeritageReference = {
  sourceName: "Emirati Recipes: Chai Karak and Chbaab",
  organization: "Smithsonian Institution (Smithsonian Folklife Festival)",
  publication: "Kathy Phung (2022)",
  url: "https://festival.si.edu/blog/emirati-recipes-chai-karak-and-chbaab",
  retrievedDate: "2026-07-19",
  type: "official-company",
};

const KARAK_STEP_CARDAMOM = {
  url: "/images/gulf-heritage/cardamom.webp",
  caption: null,
  altText: "Cardamom pods and spices for karak",
  credit: "Editorial",
  license: "Licensed",
  photographer: null,
} as const;

const KARAK_STEP_STEEP = {
  url: "/images/gulf-heritage/karak-chai.webp",
  caption: null,
  altText: "Karak chai resting before serving",
  credit: "Editorial",
  license: "Licensed",
  photographer: null,
} as const;

const KARAK_STEP_SERVE = {
  url: "/images/culture/karak-tea-pour.webp",
  caption: null,
  altText: "Serving karak chai in small glasses",
  credit: "Editorial",
  license: "Licensed",
  photographer: null,
} as const;

const KARAK_HERO = {
  url: "/images/gulf-heritage/karak-chai.webp",
  caption: null,
  altText: "Karak chai being poured into a glass",
  credit: "Editorial",
  license: "Licensed",
  photographer: null,
} as const;

const KARAK_STEP_SIMMER = {
  url: "/images/gulf-heritage/karak-chai-step-simmer.webp",
  caption: null,
  altText: "Karak tea simmering with cardamom and black tea",
  credit: "Editorial",
  license: "Licensed",
  photographer: null,
} as const;

const KARAK_STEP_MILK = {
  url: "/images/gulf-heritage/karak-chai-step-milk.webp",
  caption: null,
  altText: "Karak chai with evaporated milk and sugar",
  credit: "Editorial",
  license: "Licensed",
  photographer: null,
} as const;

const KARAK_STEP_STRAIN = {
  url: "/images/culture/karak-tea-pour.webp",
  caption: null,
  altText: "Straining karak chai into a serving pot",
  credit: "Editorial",
  license: "Licensed",
  photographer: null,
} as const;

/** Verified chai karak recipe — transcribed from Smithsonian Folklife Festival (Table Tales, 2018). */
export const SMITHSONIAN_KARAK_CHAI_RECIPE: GulfHeritageRecipeReference = {
  slug: "smithsonian-karak-chai",
  title: "Chai Karak (Cardamom Milk Tea)",
  difficulty: "Beginner",
  preparationTime: "About 20 minutes",
  servingSize: "3 cups (700 ml)",
  equipmentList: [
    "Medium saucepan",
    "Strainer",
    "Thermal carafe or teapot",
    "Small tea glasses or teacups",
  ],
  ingredientsList: [
    { name: "Hot water", amount: "3", unit: "cups (700 ml)", notes: null },
    { name: "Cardamom pods, crushed", amount: "6", unit: "pods", notes: null },
    {
      name: "Loose-leaf black tea",
      amount: "3–4",
      unit: "teaspoons",
      notes: "If using teabags, cut open the bag to use the loose tea.",
    },
    { name: "Evaporated milk", amount: "3/4", unit: "cup (180 ml)", notes: null },
    { name: "Granulated sugar", amount: "2", unit: "tablespoons", notes: "Adjust to taste" },
    { name: "Saffron", amount: "1", unit: "pinch", notes: "Optional" },
  ],
  steps: [
    {
      order: 1,
      instruction:
        "Combine the water, cardamom pods, and loose-leaf tea in a medium saucepan. If using teabags, cut open the bag to use the loose tea.",
      image: KARAK_STEP_CARDAMOM,
      duration: null,
    },
    {
      order: 2,
      instruction:
        "Allow the mixture to boil on high heat for 5 to 8 minutes or until aromatic, stirring regularly.",
      image: KARAK_STEP_SIMMER,
      duration: "5–8 minutes",
    },
    {
      order: 3,
      instruction:
        "Turn the heat down to medium and add milk and sugar to taste. Increase the amount of milk for a creamier tea. Stir the chai karak until thoroughly heated, but don't let the milk boil.",
      image: KARAK_STEP_MILK,
      duration: null,
    },
    {
      order: 4,
      instruction: "Remove from heat, cover, and let steep for 5 minutes.",
      image: KARAK_STEP_STEEP,
      duration: "5 minutes",
    },
    {
      order: 5,
      instruction:
        "Strain the chai karak into a thermal carafe or teapot. As an option, add a few sprigs of saffron either to the carafe/teapot or the tea glasses.",
      image: KARAK_STEP_STRAIN,
      duration: null,
    },
    {
      order: 6,
      instruction: "Serve hot in small tea glasses or teacups.",
      image: KARAK_STEP_SERVE,
      duration: null,
    },
  ],
  tips: [
    "Increase the amount of milk for a creamier tea.",
    "Add a few sprigs of saffron to the carafe, teapot, or tea glasses for optional saffron karak.",
  ],
  notes:
    "Recipe by Ahmed Al Bawardi and Hanan Sayed Worrell, from Table Tales: The Global Nomad Cuisine of Abu Dhabi (Rizzoli, 2018), republished on the Smithsonian Folklife Festival blog (2022).",
  warnings: ["Do not let the milk boil after adding it."],
  references: [SMITHSONIAN_KARAK_REF],
  stepImages: [KARAK_HERO, KARAK_STEP_SIMMER, KARAK_STEP_MILK, KARAK_STEP_STRAIN],
  country: "United Arab Emirates",
  region: null,
  yield: "3 cups (700 ml)",
  brewMethod: "Stovetop simmer",
  equipment: null,
  ingredients: null,
  preparationSteps: null,
  waterTemperature: "High heat to boil water and tea; medium heat to heat milk without boiling",
  time: "About 20 minutes",
  servingNotes: "Serve hot in small tea glasses or teacups.",
  method: "Stovetop",
  coffee: null,
  grinder: null,
  grindSize: null,
  water: "3 cups (700 ml)",
  coffeeDose: null,
  waterRatio: null,
  bloom: null,
  pourSchedule: null,
  brewTime: null,
  tds: null,
  extractionYield: null,
  images: ["/images/gulf-heritage/karak-chai.webp"],
  verification: {
    status: "verified",
    sourceName: "Smithsonian Folklife Festival",
    sourceUrl: "https://festival.si.edu/blog/emirati-recipes-chai-karak-and-chbaab",
    originalAuthor: "Ahmed Al Bawardi and Hanan Sayed Worrell",
    publication: "Table Tales: The Global Nomad Cuisine of Abu Dhabi (Rizzoli, 2018)",
    publishedDate: "2022",
    lastVerified: "2026-07-19",
    recipeVersion: "1.0",
  },
};

export const UAE_VERIFIED_RECIPES: Record<string, GulfHeritageRecipeReference> = {
  "smithsonian-karak-chai": SMITHSONIAN_KARAK_CHAI_RECIPE,
};

export function getUaeVerifiedRecipe(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): GulfHeritageRecipeReference | undefined {
  const english = UAE_VERIFIED_RECIPES[slug];
  if (!english) return undefined;
  if (locale === DEFAULT_LOCALE) return english;
  return localizeGulfHeritageRecipeContent(english, getUaeVerifiedRecipeAr(slug));
}
