import type { SupabaseClient } from "@supabase/supabase-js";
import { getDefaultEquipmentItem, getUserBrewingSetup } from "@/lib/data/brewing-setup";
import type {
  AdminBrewSessionAnalytics,
  BrewSessionDetail,
  BrewSessionExport,
  BrewSessionRecipeStats,
  BrewSessionSearchParams,
  BrewSessionSearchResult,
  BrewSessionSummary,
  BrewSessionUserAnalytics,
  DbBrewSessionAiAnalysisRow,
  DbBrewSessionPhotoRow,
  DbBrewSessionRow,
  DbBrewSessionSearchRow,
  DbBrewSessionStepRow,
  DbBrewSessionTagRow,
} from "@/types/brew-sessions";

const SESSION_DETAIL_SELECT = `
  id, user_id, recipe_id, coffee_name, roaster, origin, roast_level, processing,
  brew_method, grinder, brewer, kettle, filter, grinder_setting, dose, water, ratio,
  temperature, bloom_time, brew_time, yield, tds, extraction_yield, notes, rating,
  favorite, created_at, updated_at,
  recipes ( id, title, slug ),
  brew_session_steps ( id, session_id, step_number, action, water_added, duration, notes ),
  brew_session_photos ( id, session_id, image_url, caption, created_at ),
  brew_session_tags ( id, session_id, tag ),
  brew_session_ai_analysis ( id, session_id, summary, strengths, weaknesses, recommendations, created_at )
`;

function mapSearchRow(row: DbBrewSessionSearchRow): BrewSessionSummary {
  return {
    id: row.id,
    userId: row.user_id,
    recipeId: row.recipe_id,
    recipeTitle: row.recipe_title,
    recipeSlug: row.recipe_slug,
    coffeeName: row.coffee_name,
    roaster: row.roaster,
    origin: row.origin,
    roastLevel: row.roast_level,
    processing: row.processing,
    brewMethod: row.brew_method,
    grinder: row.grinder,
    brewer: row.brewer,
    rating: row.rating,
    favorite: row.favorite,
    dose: row.dose,
    water: row.water,
    ratio: row.ratio,
    temperature: row.temperature,
    yieldAmount: row.yield,
    createdAt: row.created_at,
    tagCount: Number(row.tag_count),
  };
}

function normalizeRecipeJoin(
  recipes: DbBrewSessionRow["recipes"],
): { id: string; title: string; slug: string } | null {
  if (!recipes) return null;
  if (Array.isArray(recipes)) return recipes[0] ?? null;
  return recipes;
}

function mapDetailRow(row: DbBrewSessionRow): BrewSessionDetail {
  const steps = (row.brew_session_steps ?? [])
    .slice()
    .sort((a, b) => a.step_number - b.step_number)
    .map((step: DbBrewSessionStepRow) => ({
      id: step.id,
      sessionId: step.session_id,
      stepNumber: step.step_number,
      action: step.action,
      waterAdded: step.water_added,
      duration: step.duration,
      notes: step.notes,
    }));

  const photos = (row.brew_session_photos ?? []).map((photo: DbBrewSessionPhotoRow) => ({
    id: photo.id,
    sessionId: photo.session_id,
    imageUrl: photo.image_url,
    caption: photo.caption,
    createdAt: photo.created_at,
  }));

  const tags = (row.brew_session_tags ?? []).map((tag: DbBrewSessionTagRow) => ({
    id: tag.id,
    sessionId: tag.session_id,
    tag: tag.tag,
  }));

  const analyses = row.brew_session_ai_analysis ?? [];
  const latestAnalysis = analyses
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] as
    | DbBrewSessionAiAnalysisRow
    | undefined;

  return {
    id: row.id,
    userId: row.user_id,
    recipeId: row.recipe_id,
    recipeTitle: normalizeRecipeJoin(row.recipes)?.title ?? null,
    recipeSlug: normalizeRecipeJoin(row.recipes)?.slug ?? null,
    coffeeName: row.coffee_name,
    roaster: row.roaster,
    origin: row.origin,
    roastLevel: row.roast_level,
    processing: row.processing,
    brewMethod: row.brew_method,
    grinder: row.grinder,
    brewer: row.brewer,
    kettle: row.kettle,
    filter: row.filter,
    grinderSetting: row.grinder_setting,
    dose: row.dose,
    water: row.water,
    ratio: row.ratio,
    temperature: row.temperature,
    bloomTime: row.bloom_time,
    brewTime: row.brew_time,
    yieldAmount: row.yield,
    tds: row.tds,
    extractionYield: row.extraction_yield,
    notes: row.notes,
    rating: row.rating,
    favorite: row.favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tagCount: tags.length,
    steps,
    photos,
    tags,
    aiAnalysis: latestAnalysis
      ? {
          id: latestAnalysis.id,
          sessionId: latestAnalysis.session_id,
          summary: latestAnalysis.summary,
          strengths: latestAnalysis.strengths,
          weaknesses: latestAnalysis.weaknesses,
          recommendations: latestAnalysis.recommendations,
          createdAt: latestAnalysis.created_at,
        }
      : null,
  };
}

export async function searchBrewSessions(
  supabase: SupabaseClient,
  userId: string,
  params: BrewSessionSearchParams = {},
): Promise<BrewSessionSearchResult> {
  const pageSize = Math.min(Math.max(params.pageSize ?? 20, 1), 50);
  const page = Math.max(params.page ?? 1, 1);
  const offset = (page - 1) * pageSize;

  const { data, error } = await supabase.rpc("search_brew_sessions", {
    p_user_id: userId,
    p_query: params.query ?? null,
    p_method: params.method ?? null,
    p_origin: params.origin ?? null,
    p_roaster: params.roaster ?? null,
    p_rating: params.rating ?? null,
    p_favorite: params.favorite ?? null,
    p_date_from: params.dateFrom ?? null,
    p_date_to: params.dateTo ?? null,
    p_sort: params.sort ?? "newest",
    p_limit: pageSize,
    p_offset: offset,
  });

  if (error) {
    console.error("searchBrewSessions failed", error);
    return { sessions: [], totalCount: 0 };
  }

  const rows = (data ?? []) as DbBrewSessionSearchRow[];
  const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;
  return {
    sessions: rows.map(mapSearchRow),
    totalCount,
  };
}

export async function getBrewSessionById(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<BrewSessionDetail | null> {
  const { data, error } = await supabase
    .from("brew_sessions")
    .select(SESSION_DETAIL_SELECT)
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDetailRow(data as unknown as DbBrewSessionRow);
}

export async function getSimilarBrewSessions(
  supabase: SupabaseClient,
  userId: string,
  session: Pick<BrewSessionDetail, "id" | "recipeId" | "origin" | "brewMethod" | "coffeeName">,
  limit = 5,
): Promise<BrewSessionSummary[]> {
  let query = supabase
    .from("brew_sessions")
    .select(
      "id, user_id, recipe_id, coffee_name, roaster, origin, roast_level, processing, brew_method, grinder, brewer, rating, favorite, dose, water, ratio, temperature, yield, created_at, recipes ( title, slug )",
    )
    .eq("user_id", userId)
    .neq("id", session.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (session.recipeId) {
    query = query.eq("recipe_id", session.recipeId);
  } else if (session.origin) {
    query = query.ilike("origin", session.origin);
  } else if (session.brewMethod) {
    query = query.ilike("brew_method", session.brewMethod);
  } else if (session.coffeeName) {
    query = query.ilike("coffee_name", session.coffeeName);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    const recipeJoin = row.recipes as { title: string; slug: string } | { title: string; slug: string }[] | null;
    const recipes = Array.isArray(recipeJoin) ? recipeJoin[0] ?? null : recipeJoin;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      recipeId: row.recipe_id as string | null,
      recipeTitle: recipes?.title ?? null,
      recipeSlug: recipes?.slug ?? null,
      coffeeName: row.coffee_name as string | null,
      roaster: row.roaster as string | null,
      origin: row.origin as string | null,
      roastLevel: row.roast_level as string | null,
      processing: row.processing as string | null,
      brewMethod: row.brew_method as string | null,
      grinder: row.grinder as string | null,
      brewer: row.brewer as string | null,
      rating: row.rating as number | null,
      favorite: row.favorite as boolean,
      dose: row.dose as number | null,
      water: row.water as number | null,
      ratio: row.ratio as string | null,
      temperature: row.temperature as number | null,
      yieldAmount: row.yield as number | null,
      createdAt: row.created_at as string,
      tagCount: 0,
    };
  });
}

export async function getBrewSessionUserAnalytics(
  supabase: SupabaseClient,
  userId: string,
): Promise<BrewSessionUserAnalytics> {
  const { data, error } = await supabase.rpc("brew_session_user_analytics", { p_user_id: userId });
  if (error || !data) {
    console.error("getBrewSessionUserAnalytics failed", error);
    return {
      brewsThisWeek: 0,
      brewsThisMonth: 0,
      averageRating: null,
      favoriteMethod: null,
      favoriteBrewer: null,
      favoriteGrinder: null,
      favoriteOrigin: null,
      averageRatio: null,
      averageTemperature: null,
      mostBrewedCoffee: null,
      longestStreak: 0,
      currentStreak: 0,
      recentBrews: [],
      bestBrew: null,
      favoriteCoffee: null,
    };
  }

  const parsed = data as BrewSessionUserAnalytics;
  return {
    brewsThisWeek: Number(parsed.brewsThisWeek ?? 0),
    brewsThisMonth: Number(parsed.brewsThisMonth ?? 0),
    averageRating: parsed.averageRating != null ? Number(parsed.averageRating) : null,
    favoriteMethod: parsed.favoriteMethod ?? null,
    favoriteBrewer: parsed.favoriteBrewer ?? null,
    favoriteGrinder: parsed.favoriteGrinder ?? null,
    favoriteOrigin: parsed.favoriteOrigin ?? null,
    averageRatio: parsed.averageRatio ?? null,
    averageTemperature: parsed.averageTemperature != null ? Number(parsed.averageTemperature) : null,
    mostBrewedCoffee: parsed.mostBrewedCoffee ?? null,
    longestStreak: Number(parsed.longestStreak ?? 0),
    currentStreak: Number(parsed.currentStreak ?? 0),
    recentBrews: parsed.recentBrews ?? [],
    bestBrew: parsed.bestBrew ?? null,
    favoriteCoffee: parsed.favoriteCoffee ?? null,
  };
}

export async function getBrewSessionRecipeStats(
  supabase: SupabaseClient,
  userId: string,
  recipeId: string,
): Promise<BrewSessionRecipeStats | null> {
  const { data, error } = await supabase.rpc("brew_session_recipe_stats", {
    p_user_id: userId,
    p_recipe_id: recipeId,
  });

  if (error || !data) return null;

  const parsed = data as BrewSessionRecipeStats;
  return {
    sessionCount: Number(parsed.sessionCount ?? 0),
    averageRating: parsed.averageRating != null ? Number(parsed.averageRating) : null,
    mostRecent: parsed.mostRecent ?? null,
    recentSessions: parsed.recentSessions ?? [],
  };
}

export async function getAdminBrewSessionAnalytics(
  supabase: SupabaseClient,
  limit = 10,
): Promise<AdminBrewSessionAnalytics> {
  const { data, error } = await supabase.rpc("admin_brew_session_analytics", { p_limit: limit });
  if (error || !data) {
    console.error("getAdminBrewSessionAnalytics failed", error);
    return {
      totalSessions: 0,
      popularMethods: [],
      popularBrewers: [],
      popularGrinders: [],
      popularOrigins: [],
      popularRecipes: [],
    };
  }

  const parsed = data as AdminBrewSessionAnalytics;
  return {
    totalSessions: Number(parsed.totalSessions ?? 0),
    popularMethods: parsed.popularMethods ?? [],
    popularBrewers: parsed.popularBrewers ?? [],
    popularGrinders: parsed.popularGrinders ?? [],
    popularOrigins: parsed.popularOrigins ?? [],
    popularRecipes: parsed.popularRecipes ?? [],
  };
}

export type BrewSessionDefaults = {
  brewer: string;
  grinder: string;
  kettle: string;
  filter: string;
  ratio: string;
  temperature: string;
  waterProfile: string;
};

export async function getBrewSessionDefaultsFromSetup(
  supabase: SupabaseClient,
  userId: string,
): Promise<BrewSessionDefaults> {
  const setup = await getUserBrewingSetup(supabase, userId);
  const profile = setup.profile;
  const brewer = getDefaultEquipmentItem(setup, "brewer");
  const grinder = getDefaultEquipmentItem(setup, "grinder");
  const kettle = getDefaultEquipmentItem(setup, "kettle");
  const filter = getDefaultEquipmentItem(setup, "filter");

  return {
    brewer: brewer?.displayName ?? "",
    grinder: grinder?.displayName ?? "",
    kettle: kettle?.displayName ?? "",
    filter: filter?.displayName ?? "",
    ratio: profile?.favoriteBrewRatio ?? "",
    temperature: profile?.favoriteTemperatureC != null ? String(profile.favoriteTemperatureC) : "",
    waterProfile: profile?.preferredWaterProfileName ?? "",
  };
}

export async function exportBrewSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<BrewSessionExport> {
  const { data, error } = await supabase
    .from("brew_sessions")
    .select(SESSION_DETAIL_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const sessions = ((data ?? []) as unknown as DbBrewSessionRow[]).map((row) => {
    const detail = mapDetailRow(row);
    return {
      recipeId: detail.recipeId,
      coffeeName: detail.coffeeName,
      roaster: detail.roaster,
      origin: detail.origin,
      roastLevel: detail.roastLevel,
      processing: detail.processing,
      brewMethod: detail.brewMethod,
      grinder: detail.grinder,
      brewer: detail.brewer,
      kettle: detail.kettle,
      filter: detail.filter,
      grinderSetting: detail.grinderSetting,
      dose: detail.dose,
      water: detail.water,
      ratio: detail.ratio,
      temperature: detail.temperature,
      bloomTime: detail.bloomTime,
      brewTime: detail.brewTime,
      yieldAmount: detail.yieldAmount,
      tds: detail.tds,
      extractionYield: detail.extractionYield,
      notes: detail.notes,
      rating: detail.rating,
      favorite: detail.favorite,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
      tags: detail.tags.map((tag) => tag.tag),
      steps: detail.steps.map(({ stepNumber, action, waterAdded, duration, notes }) => ({
        stepNumber,
        action,
        waterAdded,
        duration,
        notes,
      })),
      photos: detail.photos.map(({ imageUrl, caption }) => ({ imageUrl, caption })),
    };
  });

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
  };
}

export function brewSessionsToCsv(exportData: BrewSessionExport): string {
  const headers = [
    "coffee_name",
    "roaster",
    "origin",
    "roast_level",
    "processing",
    "brew_method",
    "grinder",
    "brewer",
    "dose",
    "water",
    "ratio",
    "temperature",
    "yield",
    "tds",
    "rating",
    "favorite",
    "notes",
    "created_at",
  ];

  const escape = (value: string | number | boolean | null | undefined) => {
    const str = value == null ? "" : String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(",")];
  for (const session of exportData.sessions) {
    lines.push(
      [
        session.coffeeName,
        session.roaster,
        session.origin,
        session.roastLevel,
        session.processing,
        session.brewMethod,
        session.grinder,
        session.brewer,
        session.dose,
        session.water,
        session.ratio,
        session.temperature,
        session.yieldAmount,
        session.tds,
        session.rating,
        session.favorite,
        session.notes,
        session.createdAt,
      ]
        .map(escape)
        .join(","),
    );
  }
  return lines.join("\n");
}
