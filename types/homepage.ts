export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type FeaturedRecipe = {
  name: string;
  country: string;
  origin: string;
  brewMethod: string;
  roastLevel: string;
  difficulty: Difficulty;
  ratio: string;
  time: string;
  notes: string;
  image: string;
  premium?: boolean;
  featured?: boolean;
};

export type BrewingMethod = {
  name: string;
  description: string;
  brewTime: string;
  difficulty: Difficulty;
  body: number;
  acidity: number;
  sweetness: number;
  suitableRoast: string;
  image: string;
};

export type CoffeeOrigin = {
  country: string;
  region: string;
  tastingProfile: string;
  altitude: string;
  process: string;
  roastRecommendation: string;
  brewingMethod: string;
  image: string;
  premium?: boolean;
};

export type TopRoaster = {
  name: string;
  country: string;
  founded: string;
  specialty: string;
  rating: string;
  recipes: string;
  description: string;
  image: string;
  premium?: boolean;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  location: string;
  image: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  recipeCount: string;
  accessLevel: string;
  offlineAccess: boolean;
  favorites: string;
  aiRecommendations: boolean;
  brewTracking: string;
  prioritySupport: boolean;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export type Faq = {
  question: string;
  answer: string;
};

/**
 * The full set of localizable homepage content -- structurally identical
 * across locales (same order, same images, same numeric/enum fields used
 * for filtering or scoring), only the human-language fields differ. See
 * `lib/i18n/home-content/*` and `lib/i18n/get-home-content.ts`, which load
 * this the same way `getDictionary` loads a `Dictionary` per locale.
 */
export type HomeContent = {
  heroImage: string;
  featuredRecipes: FeaturedRecipe[];
  brewMethods: BrewingMethod[];
  coffeeOrigins: CoffeeOrigin[];
  topRoasters: TopRoaster[];
  testimonials: Testimonial[];
  pricingPlans: PricingPlan[];
  faqs: Faq[];
};
