/**
 * The canonical shape every locale's UI dictionary must match. Both
 * `lib/i18n/dictionaries/en.ts` (the source of truth) and
 * `lib/i18n/dictionaries/ar.ts` (and any future locale) are typed
 * against this interface, so TypeScript guarantees no key is ever
 * missing, extra, or misspelled in a translation -- a mismatch is a
 * build-time type error, not a silent runtime fallback to English.
 *
 * Values are plain `string` (not string literals) so every dictionary
 * can supply its own translated text while satisfying the same shape.
 * A `{placeholder}` inside a value is interpolated by `t()` -- see
 * `lib/i18n/format.ts`.
 */
export type Dictionary = {
  nav: {
    home: string;
    recipes: string;
    methods: string;
    origins: string;
    roasters: string;
    devices: string;
    culture: string;
    pricing: string;
    faq: string;
    dashboard: string;
    community: string;
    profile: string;
    settings: string;
    joinPremium: string;
    login: string;
    signup: string;
    logout: string;
    skipToMainContent: string;
  };
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    remove: string;
    close: string;
    confirm: string;
    continue: string;
    back: string;
    next: string;
    done: string;
    submit: string;
    search: string;
    filter: string;
    clearFilters: string;
    loading: string;
    saving: string;
    viewAll: string;
    viewDetails: string;
    learnMore: string;
    readMore: string;
    share: string;
    copy: string;
    copied: string;
    yes: string;
    no: string;
    language: string;
  };
  forms: {
    required: string;
    optional: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    title: string;
    description: string;
    notes: string;
    selectPlaceholder: string;
    invalidEmail: string;
    passwordTooShort: string;
    passwordsDoNotMatch: string;
    fieldRequired: string;
  };
  auth: {
    login: string;
    signup: string;
    logout: string;
    email: string;
    password: string;
    forgotPassword: string;
    resetPassword: string;
    noAccount: string;
    haveAccount: string;
    signInWithGoogle: string;
    loginSuccess: string;
    signupSuccess: string;
    invalidCredentials: string;
    sessionExpired: string;
  };
  dashboard: {
    title: string;
    welcomeBack: string;
    myRecipes: string;
    newRecipe: string;
    brewHistory: string;
    tasteProfile: string;
    coffeeSetup: string;
    stats: string;
    totalBrews: string;
    recipesCreated: string;
    avgRating: string;
    brewScore: string;
  };
  recipes: {
    title: string;
    newRecipe: string;
    editRecipe: string;
    ingredients: string;
    instructions: string;
    steps: string;
    brewNotes: string;
    tastingNotes: string;
    tips: string;
    warnings: string;
    difficulty: string;
    brewTime: string;
    brewRatio: string;
    origin: string;
    roaster: string;
    method: string;
    rating: string;
    reviews: string;
    save: string;
    saved: string;
    like: string;
    liked: string;
    publish: string;
    draft: string;
    published: string;
    aiSummary: string;
    similarRecipes: string;
    recommendedForYou: string;
  };
  brewLogs: {
    title: string;
    logBrew: string;
    brewedAt: string;
    device: string;
    method: string;
    rating: string;
    notes: string;
    markFavorite: string;
    edit: string;
    delete: string;
    empty: string;
  };
  ai: {
    title: string;
    recommendations: string;
    recommendedForYou: string;
    similarRecipes: string;
    discoverTitle: string;
    discoverPlaceholder: string;
    discoverSubmit: string;
    tasteProfile: string;
    refreshProfile: string;
    whyRecommended: string;
    matchScore: string;
    noRecommendationsYet: string;
  };
  culture: {
    title: string;
    uaeCoffeeCulture: string;
    arabicCoffee: string;
    tea: string;
    exploreSection: string;
    topics: string;
    relatedTopics: string;
  };
  community: {
    title: string;
    followers: string;
    following: string;
    follow: string;
    unfollow: string;
    leaderboards: string;
    topBrewers: string;
    mostActive: string;
    trending: string;
    badges: string;
    activityFeed: string;
    notifications: string;
    markAllRead: string;
    noNotifications: string;
  };
  profile: {
    title: string;
    editProfile: string;
    displayName: string;
    bio: string;
    country: string;
    favoriteBrewMethod: string;
    favoriteOrigin: string;
    favoriteCoffee: string;
    favoriteRoaster: string;
    favoriteGrinder: string;
    favoriteBrewer: string;
    ownsXbloom: string;
    stats: string;
  };
  settings: {
    title: string;
    account: string;
    language: string;
    languageDescription: string;
    notifications: string;
    privacy: string;
    deleteAccount: string;
  };
  errors: {
    generic: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    networkError: string;
    tryAgain: string;
    goHome: string;
  };
  emptyStates: {
    noRecipes: string;
    noResults: string;
    noResultsHint: string;
    noFavorites: string;
    noReviews: string;
    noBadgesYet: string;
    startExploring: string;
  };
};

/** Dot-notation key path into a `Dictionary`, e.g. `"nav.recipes"` or `"dashboard.welcomeBack"`. Used by `t()`. */
export type DictionaryKey = {
  [K in keyof Dictionary]: `${K & string}.${keyof Dictionary[K] & string}`;
}[keyof Dictionary];
