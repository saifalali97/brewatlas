export type RecipeDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  image: string;
  brewingMethod: string;
  origin: string;
  roaster: string;
  roastLevel: string;
  process: string;
  coffeeDose: string;
  waterAmount: string;
  brewTime: string;
  difficulty: RecipeDifficulty;
  rating: number;
};
