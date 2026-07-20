export type RecipeFaqItem = {
  question: string;
  answer: string;
};

export type StaticRecipePour = {
  pourNumber: number;
  waterAmountG: number | null;
  timeLabel: string | null;
  notes: string;
};

export type ExpectedCupProfile = {
  extraction: string;
  body: string;
  sweetness: string;
  acidity: string;
  aftertaste: string;
};

export type RecipeTroubleshooting = {
  bitter: string;
  sour: string;
  weak: string;
  strong: string;
  channeling?: string;
  slowDrawdown?: string;
  fastDrawdown?: string;
};

/** Full editorial brew guide for static catalog recipes (English canonical). */
export type StaticRecipeDetail = {
  slug: string;
  verified: true;
  coffeeDoseG: number;
  waterAmountG: number;
  grindSize: string;
  waterTemperatureC: number;
  bloomAmountG: number | null;
  bloomTime: string | null;
  pours: StaticRecipePour[];
  totalBrewTime: string;
  yieldG: number;
  device: string;
  grinder: string;
  filter: string | null;
  waterProfile: string;
  equipment: string[];
  flavorNotes: string;
  instructions: string;
  whyThisRecipeExists: string;
  whyParametersWork: string;
  expectedCup: ExpectedCupProfile;
  waterChemistry: string;
  grinderNotes: string;
  filterNotes: string;
  bloomExplanation: string | null;
  troubleshooting: RecipeTroubleshooting;
  expertTips: string[];
  competitionNotes: string | null;
  whenToChoose: string;
  bestFor: string;
  beanRecommendations: string;
  roastRecommendations: string;
  waterRecommendations: string;
  faq: RecipeFaqItem[];
  storageTips: string | null;
  commonMistakes: string[];
  relatedRecipeSlugs: string[];
  galleryImages: string[];
};
