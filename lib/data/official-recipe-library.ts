import type { SupabaseClient } from "@supabase/supabase-js";
import { mapDbRecipeToFullDetail, RECIPE_SELECT, generateUniqueRecipeSlug } from "@/lib/data/db-recipes";
import type { Locale } from "@/types/i18n";
import type {
  OfficialRecipeLibraryFilters,
  OfficialRecipeLibraryRecord,
  OfficialRecipeLibraryWriteInput,
  OfficialRecipePour,
  OfficialRecipePourTranslation,
  OfficialRecipeTranslation,
  RecipeServingStyle,
  RecipeSourceVerificationStatus,
} from "@/types/official-recipe-library";
import type { DbRecipeRow, PourRow } from "@/types/recipe";

const LIBRARY_SELECT = `
  ${RECIPE_SELECT.trim()},
  roasters:roaster_id ( id, name, slug, country )
`;

type DbOfficialRecipeRow = DbRecipeRow & {
  roaster_id: string | null;
  serving_style: RecipeServingStyle;
  grinder_setting: string | null;
  agitation_instructions: string | null;
  drawdown_target: string | null;
  source_url: string | null;
  source_verification_status: RecipeSourceVerificationStatus;
  source_verified_at: string | null;
  source_verified_by: string | null;
  recipe_author_name: string | null;
  roasters: { id: string; name: string; slug: string | null; country: string | null } | null;
  recipe_pours: Array<
    PourRow & {
      duration_seconds: number | null;
      agitation: string | null;
      pour_target: string | null;
    }
  > | null;
};

function mapPour(row: PourRow): OfficialRecipePour {
  return {
    id: row.id,
    pourNumber: row.pour_number,
    waterAmount: row.water_amount,
    timeLabel: row.time_label,
    notes: row.notes,
    durationSeconds: row.duration_seconds ?? null,
    agitation: row.agitation ?? null,
    pourTarget: row.pour_target ?? null,
  };
}

function mapOfficialRecipeRow(
  row: DbOfficialRecipeRow,
  translations: OfficialRecipeTranslation[],
): OfficialRecipeLibraryRecord {
  const detail = mapDbRecipeToFullDetail(row);
  const pours = (row.recipe_pours ?? [])
    .slice()
    .sort((a, b) => a.pour_number - b.pour_number)
    .map(mapPour);

  const linkedRoaster = row.roasters ?? row.coffees?.roasters ?? null;

  return {
    id: detail.id,
    slug: detail.slug,
    title: detail.title,
    description: detail.description,
    roasterId: row.roaster_id ?? detail.roasterId,
    roasterName: linkedRoaster?.name ?? detail.roasterName,
    roasterSlug: row.roasters?.slug ?? null,
    roasterCountry: row.roasters?.country ?? row.coffees?.origins?.country ?? null,
    coffeeId: detail.coffeeId,
    coffeeName: detail.coffeeName,
    originId: detail.originId,
    originCountry: row.coffees?.origins?.country ?? null,
    originRegion: row.coffees?.origins?.region ?? null,
    farm: detail.farm,
    producer: detail.producer,
    variety: detail.variety,
    process: detail.process,
    roastLevel: detail.roastLevel,
    brewingMethodId: detail.brewingMethodId,
    brewingMethodName: detail.brewingMethodName,
    brewingMethodSlug: row.brewing_methods?.slug ?? null,
    servingStyle: row.serving_style ?? "hot",
    deviceId: detail.deviceId,
    deviceName: detail.deviceName,
    grinderId: detail.grinderId,
    grinderName: detail.grinderName,
    grindSize: detail.grindSize,
    grinderSetting: row.grinder_setting ?? null,
    coffeeDose: detail.coffeeDose,
    waterAmount: detail.waterAmount,
    iceAmount: detail.iceAmount,
    waterTemperature: detail.waterTemperature,
    bloomAmount: detail.bloomAmount,
    bloomTime: detail.bloomTime,
    totalBrewTime: detail.totalBrewTime,
    ratio: detail.ratio,
    agitationInstructions: row.agitation_instructions ?? null,
    drawdownTarget: row.drawdown_target ?? null,
    pourStructure: detail.pourStructure ?? null,
    pours,
    tastingNotes: detail.tastingNotes,
    beverageWeight: detail.beverageWeight,
    tds: detail.tds,
    extractionPercentage: detail.extractionPercentage,
    authorId: detail.authorId,
    recipeAuthorName: row.recipe_author_name ?? null,
    sourceUrl: row.source_url ?? null,
    sourceVerificationStatus: row.source_verification_status ?? "unverified",
    sourceVerifiedAt: row.source_verified_at ?? null,
    sourceVerifiedBy: row.source_verified_by ?? null,
    recipeKind: detail.recipeKind ?? "community",
    verificationStatus: detail.verificationStatus ?? "draft",
    verifiedAt: detail.verifiedAt ?? null,
    verifiedBy: null,
    versionLabel: detail.versionLabel ?? "1.0",
    featured: detail.featured,
    premiumOnly: detail.premiumOnly,
    difficulty: detail.difficulty,
    coverImageUrl: detail.coverImageUrl,
    images: detail.images,
    tags: detail.tags,
    translations,
    defaultLocale: "en",
  };
}

async function loadRecipeTranslations(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<OfficialRecipeTranslation[]> {
  const { data, error } = await supabase
    .from("recipe_translations")
    .select(
      "locale, title, description, brew_notes, tasting_notes, tips, warnings, steps, agitation_instructions, drawdown_target, ai_summary, is_machine_translated",
    )
    .eq("recipe_id", recipeId);

  if (error) {
    console.error("loadRecipeTranslations failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    locale: row.locale as string,
    title: (row.title as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    brewNotes: (row.brew_notes as string | null) ?? null,
    tastingNotes: (row.tasting_notes as string | null) ?? null,
    tips: (row.tips as string | null) ?? null,
    warnings: (row.warnings as string | null) ?? null,
    steps: (row.steps as string | null) ?? null,
    agitationInstructions: (row.agitation_instructions as string | null) ?? null,
    drawdownTarget: (row.drawdown_target as string | null) ?? null,
    aiSummary: (row.ai_summary as string | null) ?? null,
    isMachineTranslated: Boolean(row.is_machine_translated),
  }));
}

async function loadPourTranslations(
  supabase: SupabaseClient,
  pourIds: string[],
): Promise<OfficialRecipePourTranslation[]> {
  if (pourIds.length === 0) return [];

  const { data, error } = await supabase
    .from("recipe_pour_translations")
    .select("pour_id, locale, notes, agitation, pour_target, is_machine_translated")
    .in("pour_id", pourIds);

  if (error) {
    console.error("loadPourTranslations failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    pourId: row.pour_id as string,
    locale: row.locale as string,
    notes: (row.notes as string | null) ?? null,
    agitation: (row.agitation as string | null) ?? null,
    pourTarget: (row.pour_target as string | null) ?? null,
    isMachineTranslated: Boolean(row.is_machine_translated),
  }));
}

/** Fetch a single official library recipe with pours and translations. */
export async function getOfficialRecipeLibraryRecord(
  supabase: SupabaseClient,
  slug: string,
): Promise<OfficialRecipeLibraryRecord | null> {
  const { data, error } = await supabase.from("recipes").select(LIBRARY_SELECT).eq("slug", slug).maybeSingle();

  if (error || !data) {
    if (error) console.error("getOfficialRecipeLibraryRecord failed", error);
    return null;
  }

  const row = data as unknown as DbOfficialRecipeRow;
  const translations = await loadRecipeTranslations(supabase, row.id);
  return mapOfficialRecipeRow(row, translations);
}

/** List official library recipes with optional filters. */
export async function listOfficialRecipeLibraryRecords(
  supabase: SupabaseClient,
  filters: OfficialRecipeLibraryFilters = {},
  options: { limit?: number; offset?: number; locale?: Locale } = {},
): Promise<OfficialRecipeLibraryRecord[]> {
  const limit = options.limit ?? 24;
  const offset = options.offset ?? 0;

  let query = supabase
    .from("recipes")
    .select(LIBRARY_SELECT)
    .eq("status", "published")
    .in("recipe_kind", ["official", "competition"])
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.roasterId) query = query.eq("roaster_id", filters.roasterId);
  if (filters.country) query = query.eq("roasters.country", filters.country);
  if (filters.brewingMethodId) query = query.eq("brewing_method_id", filters.brewingMethodId);
  if (filters.servingStyle) query = query.eq("serving_style", filters.servingStyle);
  if (filters.featuredOnly) query = query.eq("featured", true);
  if (filters.verifiedOnly) {
    query = query.in("verification_status", ["verified", "competition_tested"]);
  }
  if (filters.search?.trim()) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }

  const { data, error } = await query;
  if (error || !data) {
    if (error) console.error("listOfficialRecipeLibraryRecords failed", error);
    return [];
  }

  const rows = data as unknown as DbOfficialRecipeRow[];
  const translationResults = await Promise.all(rows.map((row) => loadRecipeTranslations(supabase, row.id)));

  return rows.map((row, index) => mapOfficialRecipeRow(row, translationResults[index] ?? []));
}

/** Upsert pour rows for a recipe — unlimited ordered pours. */
export async function replaceOfficialRecipePours(
  supabase: SupabaseClient,
  recipeId: string,
  pours: OfficialRecipePour[],
): Promise<void> {
  await supabase.from("recipe_pours").delete().eq("recipe_id", recipeId);
  if (pours.length === 0) return;

  await supabase.from("recipe_pours").insert(
    pours.map((pour) => ({
      recipe_id: recipeId,
      pour_number: pour.pourNumber,
      water_amount: pour.waterAmount,
      time_label: pour.timeLabel,
      notes: pour.notes,
      duration_seconds: pour.durationSeconds,
      agitation: pour.agitation,
      pour_target: pour.pourTarget,
    })),
  );
}

/** Build a Supabase insert/update payload from official library write input. */
export function officialRecipeLibraryPayload(input: OfficialRecipeLibraryWriteInput): Record<string, unknown> {
  return {
    title: input.title,
    description: input.description ?? null,
    roaster_id: input.roasterId ?? null,
    coffee_id: input.coffeeId ?? null,
    brewing_method_id: input.brewingMethodId,
    serving_style: input.servingStyle,
    device_id: input.deviceId ?? null,
    grinder_id: input.grinderId ?? null,
    grind_size: input.grindSize ?? null,
    grinder_setting: input.grinderSetting ?? null,
    coffee_dose: input.coffeeDose ?? null,
    water_amount: input.waterAmount ?? null,
    ice_amount: input.iceAmount ?? null,
    water_temperature: input.waterTemperature ?? null,
    bloom_amount: input.bloomAmount ?? null,
    bloom_time: input.bloomTime ?? null,
    total_brew_time: input.totalBrewTime ?? null,
    ratio: input.ratio ?? null,
    agitation_instructions: input.agitationInstructions ?? null,
    drawdown_target: input.drawdownTarget ?? null,
    pour_structure: input.pourStructure ?? null,
    tasting_notes: input.tastingNotes ?? null,
    instructions: input.instructions ?? null,
    recipe_author_name: input.recipeAuthorName ?? null,
    source_url: input.sourceUrl ?? null,
    source_verification_status: input.sourceVerificationStatus ?? "unverified",
    recipe_kind: input.recipeKind ?? "official",
    verification_status: input.verificationStatus ?? "draft",
    version_label: input.versionLabel ?? "1.0",
    featured: input.featured ?? false,
    premium_only: input.premiumOnly ?? false,
    difficulty: input.difficulty ?? null,
  };
}

/** Create a new official library recipe (no content seeding — caller supplies data). */
export async function createOfficialRecipeLibraryRecord(
  supabase: SupabaseClient,
  input: OfficialRecipeLibraryWriteInput,
  options: { authorId: string; slug?: string },
): Promise<{ id?: string; slug?: string; error?: string }> {
  const slug = options.slug ?? input.slug ?? (await generateUniqueRecipeSlug(supabase, input.title));
  const payload = {
    ...officialRecipeLibraryPayload(input),
    slug,
    author_id: options.authorId,
    status: "draft",
    published: false,
  };

  const { data, error } = await supabase.from("recipes").insert(payload).select("id, slug").single();
  if (error || !data) {
    return { error: error?.message ?? "Failed to create recipe." };
  }

  const recipeId = data.id as string;
  if (input.pours?.length) {
    await replaceOfficialRecipePours(
      supabase,
      recipeId,
      input.pours.map((pour, index) => ({
        id: "",
        pourNumber: pour.pourNumber ?? index + 1,
        waterAmount: pour.waterAmount ?? null,
        timeLabel: pour.timeLabel ?? null,
        notes: pour.notes ?? null,
        durationSeconds: pour.durationSeconds ?? null,
        agitation: pour.agitation ?? null,
        pourTarget: pour.pourTarget ?? null,
      })),
    );
  }

  return { id: recipeId, slug: data.slug as string };
}

/** Update an existing official library recipe. */
export async function updateOfficialRecipeLibraryRecord(
  supabase: SupabaseClient,
  recipeId: string,
  input: OfficialRecipeLibraryWriteInput,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("recipes").update(officialRecipeLibraryPayload(input)).eq("id", recipeId);
  if (error) return { error: error.message };

  if (input.pours) {
    await replaceOfficialRecipePours(
      supabase,
      recipeId,
      input.pours.map((pour, index) => ({
        id: "",
        pourNumber: pour.pourNumber ?? index + 1,
        waterAmount: pour.waterAmount ?? null,
        timeLabel: pour.timeLabel ?? null,
        notes: pour.notes ?? null,
        durationSeconds: pour.durationSeconds ?? null,
        agitation: pour.agitation ?? null,
        pourTarget: pour.pourTarget ?? null,
      })),
    );
  }

  return {};
}

export { loadPourTranslations };
