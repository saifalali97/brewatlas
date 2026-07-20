export type BrewSessionStep = {
  id: string;
  sessionId: string;
  stepNumber: number;
  action: string;
  waterAdded: number | null;
  duration: string | null;
  notes: string | null;
};

export type BrewSessionPhoto = {
  id: string;
  sessionId: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
};

export type BrewSessionTag = {
  id: string;
  sessionId: string;
  tag: string;
};

export type BrewSessionAiAnalysis = {
  id: string;
  sessionId: string;
  summary: string;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  createdAt: string;
};

export type BrewSessionSummary = {
  id: string;
  userId: string;
  recipeId: string | null;
  recipeTitle: string | null;
  recipeSlug: string | null;
  coffeeName: string | null;
  roaster: string | null;
  origin: string | null;
  roastLevel: string | null;
  processing: string | null;
  brewMethod: string | null;
  grinder: string | null;
  brewer: string | null;
  rating: number | null;
  favorite: boolean;
  dose: number | null;
  water: number | null;
  ratio: string | null;
  temperature: number | null;
  yieldAmount: number | null;
  createdAt: string;
  tagCount: number;
};

export type BrewSessionDetail = BrewSessionSummary & {
  kettle: string | null;
  filter: string | null;
  grinderSetting: string | null;
  bloomTime: string | null;
  brewTime: string | null;
  tds: number | null;
  extractionYield: number | null;
  notes: string | null;
  updatedAt: string;
  steps: BrewSessionStep[];
  photos: BrewSessionPhoto[];
  tags: BrewSessionTag[];
  aiAnalysis: BrewSessionAiAnalysis | null;
};

export type BrewSessionSearchResult = {
  sessions: BrewSessionSummary[];
  totalCount: number;
};

export type BrewSessionUserAnalytics = {
  brewsThisWeek: number;
  brewsThisMonth: number;
  averageRating: number | null;
  favoriteMethod: string | null;
  favoriteBrewer: string | null;
  favoriteGrinder: string | null;
  favoriteOrigin: string | null;
  averageRatio: string | null;
  averageTemperature: number | null;
  mostBrewedCoffee: string | null;
  longestStreak: number;
  currentStreak: number;
  recentBrews: Array<{
    id: string;
    coffeeName: string | null;
    brewMethod: string | null;
    rating: number | null;
    favorite: boolean;
    createdAt: string;
  }>;
  bestBrew: {
    id: string;
    coffeeName: string | null;
    rating: number | null;
    brewMethod: string | null;
    createdAt: string;
  } | null;
  favoriteCoffee: string | null;
};

export type BrewSessionRecipeStats = {
  sessionCount: number;
  averageRating: number | null;
  mostRecent: {
    id: string;
    rating: number | null;
    notes: string | null;
    createdAt: string;
  } | null;
  recentSessions: Array<{
    id: string;
    rating: number | null;
    notes: string | null;
    brewMethod: string | null;
    createdAt: string;
  }>;
};

export type AdminBrewSessionAnalytics = {
  totalSessions: number;
  popularMethods: Array<{ name: string; count: number }>;
  popularBrewers: Array<{ name: string; count: number }>;
  popularGrinders: Array<{ name: string; count: number }>;
  popularOrigins: Array<{ name: string; count: number }>;
  popularRecipes: Array<{ name: string; count: number }>;
};

export type BrewSessionExport = {
  version: 1;
  exportedAt: string;
  sessions: Array<{
    recipeId: string | null;
    coffeeName: string | null;
    roaster: string | null;
    origin: string | null;
    roastLevel: string | null;
    processing: string | null;
    brewMethod: string | null;
    grinder: string | null;
    brewer: string | null;
    kettle: string | null;
    filter: string | null;
    grinderSetting: string | null;
    dose: number | null;
    water: number | null;
    ratio: string | null;
    temperature: number | null;
    bloomTime: string | null;
    brewTime: string | null;
    yieldAmount: number | null;
    tds: number | null;
    extractionYield: number | null;
    notes: string | null;
    rating: number | null;
    favorite: boolean;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    steps: Array<{
      stepNumber: number;
      action: string;
      waterAdded: number | null;
      duration: string | null;
      notes: string | null;
    }>;
    photos: Array<{ imageUrl: string; caption: string | null }>;
  }>;
};

export type BrewSessionSearchParams = {
  query?: string;
  method?: string;
  origin?: string;
  roaster?: string;
  rating?: number;
  favorite?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sort?: "newest" | "oldest" | "highest_rated" | "most_brewed";
  page?: number;
  pageSize?: number;
};

export type DbBrewSessionRow = {
  id: string;
  user_id: string;
  recipe_id: string | null;
  coffee_name: string | null;
  roaster: string | null;
  origin: string | null;
  roast_level: string | null;
  processing: string | null;
  brew_method: string | null;
  grinder: string | null;
  brewer: string | null;
  kettle: string | null;
  filter: string | null;
  grinder_setting: string | null;
  dose: number | null;
  water: number | null;
  ratio: string | null;
  temperature: number | null;
  bloom_time: string | null;
  brew_time: string | null;
  yield: number | null;
  tds: number | null;
  extraction_yield: number | null;
  notes: string | null;
  rating: number | null;
  favorite: boolean;
  created_at: string;
  updated_at: string;
  recipes: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
  brew_session_steps: DbBrewSessionStepRow[] | null;
  brew_session_photos: DbBrewSessionPhotoRow[] | null;
  brew_session_tags: DbBrewSessionTagRow[] | null;
  brew_session_ai_analysis: DbBrewSessionAiAnalysisRow[] | null;
};

export type DbBrewSessionStepRow = {
  id: string;
  session_id: string;
  step_number: number;
  action: string;
  water_added: number | null;
  duration: string | null;
  notes: string | null;
};

export type DbBrewSessionPhotoRow = {
  id: string;
  session_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export type DbBrewSessionTagRow = {
  id: string;
  session_id: string;
  tag: string;
};

export type DbBrewSessionAiAnalysisRow = {
  id: string;
  session_id: string;
  summary: string;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  created_at: string;
};

export type DbBrewSessionSearchRow = {
  id: string;
  user_id: string;
  recipe_id: string | null;
  recipe_title: string | null;
  recipe_slug: string | null;
  coffee_name: string | null;
  roaster: string | null;
  origin: string | null;
  roast_level: string | null;
  processing: string | null;
  brew_method: string | null;
  grinder: string | null;
  brewer: string | null;
  rating: number | null;
  favorite: boolean;
  dose: number | null;
  water: number | null;
  ratio: string | null;
  temperature: number | null;
  yield: number | null;
  created_at: string;
  tag_count: number;
  total_count: number;
};
