/**
 * Types for the BrewAtlas AI Coach module: chat, brew memory,
 * preferences, and module-specific responses.
 */

export const AI_COACH_MODES = [
  "chat",
  "brew_doctor",
  "guided_brew",
  "recipe_generator",
  "knowledge",
  "analyzer",
] as const;
export type AiCoachMode = (typeof AI_COACH_MODES)[number];

export const AI_COACH_MESSAGE_ROLES = ["user", "assistant", "system"] as const;
export type AiCoachMessageRole = (typeof AI_COACH_MESSAGE_ROLES)[number];

export const AI_COACH_MESSAGE_FEEDBACK = ["like", "dislike"] as const;
export type AiCoachMessageFeedback = (typeof AI_COACH_MESSAGE_FEEDBACK)[number];

export const BREW_DOCTOR_SYMPTOMS = [
  "sour",
  "bitter",
  "weak",
  "strong",
  "dry",
  "astringent",
  "hollow",
  "salty",
  "fastDrawdown",
  "slowDrawdown",
  "overExtraction",
  "underExtraction",
] as const;
export type BrewDoctorSymptom = (typeof BREW_DOCTOR_SYMPTOMS)[number];

export const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export type AiCoachConversation = {
  id: string;
  userId: string;
  title: string;
  mode: AiCoachMode;
  isPinned: boolean;
  isFavorite: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type AiCoachMessage = {
  id: string;
  conversationId: string;
  userId: string;
  role: AiCoachMessageRole;
  content: string;
  feedback: AiCoachMessageFeedback | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AiCoachPreferences = {
  userId: string;
  favoriteBrewer: string | null;
  favoriteGrinder: string | null;
  favoriteRoast: string | null;
  favoriteOrigin: string | null;
  favoriteRatio: string | null;
  preferredLanguage: string;
  experienceLevel: ExperienceLevel | null;
  updatedAt: string;
};

export type AiCoachBrewSession = {
  id: string;
  userId: string;
  title: string;
  recipe: Record<string, unknown>;
  coffee: string | null;
  grinder: string | null;
  water: string | null;
  temperatureC: number | null;
  rating: number | null;
  tasteNotes: string | null;
  adjustments: string | null;
  notes: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AiCoachSettings = {
  isEnabled: boolean;
  freeDailyLimit: number;
};

export type AiCoachUsageSummary = {
  used: number;
  limit: number | null;
  remaining: number | null;
  isUnlimited: boolean;
};

export type BrewDoctorInput = {
  symptom: BrewDoctorSymptom;
  method?: string | null;
  doseG?: number | null;
  waterG?: number | null;
  grindSize?: string | null;
  temperatureC?: number | null;
  brewTime?: string | null;
  notes?: string | null;
};

export type BrewDoctorRecommendation = {
  category: "grind" | "water" | "temperature" | "pour" | "bloom" | "ratio" | "time" | "filter";
  action: string;
  why: string;
};

export type BrewDoctorResult = {
  symptom: BrewDoctorSymptom;
  summary: string;
  recommendations: BrewDoctorRecommendation[];
  confidence: "low" | "medium" | "high";
};

export type GuidedBrewInput = {
  method: string;
  origin?: string | null;
  processing?: string | null;
  roastLevel?: string | null;
  doseG?: number | null;
  waterG?: number | null;
  grinder?: string | null;
  grinderClicks?: string | null;
  filter?: string | null;
  temperatureC?: number | null;
  desiredFlavor?: string | null;
  currentIssue?: string | null;
};

export type GuidedBrewResult = {
  summary: string;
  recommendations: string[];
  parameters: Record<string, string>;
  whyItWorks: string;
};

export type SessionAnalyzerInput = {
  doseG: number;
  yieldG?: number | null;
  timeSeconds?: number | null;
  grindSize?: string | null;
  temperatureC?: number | null;
  flavorNotes?: string | null;
  method?: string | null;
};

export type SessionAnalyzerResult = {
  extraction: string;
  strength: string;
  balance: string;
  recommendations: string[];
  summary: string;
};

export type RecipeGeneratorInput = {
  method: string;
  coffee?: string | null;
  roast?: string | null;
  processing?: string | null;
  grinder?: string | null;
  water?: string | null;
  experienceLevel?: ExperienceLevel | null;
  flavorPreference?: string | null;
};

export type GeneratedRecipe = {
  title: string;
  method: string;
  doseG: number;
  waterG: number;
  ratio: string;
  grindSize: string;
  temperatureC: number;
  brewTime: string;
  steps: string[];
  whyItWorks: string;
  expectedFlavor: string;
  adjustments: string[];
};

export type AiCoachChatRequest = {
  message: string;
  conversationId?: string | null;
  mode?: AiCoachMode;
  context?: Record<string, unknown>;
};

export type AiCoachChatResponse = {
  content: string;
  conversationId: string;
  messageId: string;
  metadata?: Record<string, unknown>;
};

export type AiCoachAnalyticsEvent =
  | "chat_started"
  | "recipe_generated"
  | "brew_analyzed"
  | "session_saved"
  | "quick_action_clicked"
  | "premium_upgrade_click";

/** Adapter interface for future LLM providers. */
export type AiCoachModuleAdapter = {
  readonly provider: string;
  chat(request: AiCoachChatRequest & { history: AiCoachMessage[] }): Promise<AiCoachChatResponse>;
  brewDoctor(input: BrewDoctorInput): Promise<BrewDoctorResult>;
  guidedBrew(input: GuidedBrewInput): Promise<GuidedBrewResult>;
  generateRecipe(input: RecipeGeneratorInput): Promise<GeneratedRecipe>;
  analyzeSession(input: SessionAnalyzerInput): Promise<SessionAnalyzerResult>;
  answerKnowledge(question: string): Promise<string>;
};

export const QUICK_QUESTIONS = [
  "Why is my coffee sour?",
  "Why is my coffee bitter?",
  "How do I improve sweetness?",
  "How should I grind finer?",
  "How does bloom work?",
  "Explain extraction.",
  "Explain bypass brewing.",
  "What temperature should I use?",
  "Best V60 recipe?",
  "Best espresso ratio?",
  "Best grinder?",
  "Water chemistry?",
] as const;
