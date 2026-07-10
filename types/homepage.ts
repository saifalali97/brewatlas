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
