"use server";

import { revalidatePath } from "next/cache";
import { analyzeBrewSessionJournal } from "@/lib/ai/brew-session-analyzer";
import {
  exportBrewSessions,
  getBrewSessionById,
  getSimilarBrewSessions,
} from "@/lib/data/brew-sessions";
import { getUserBrewingSetup } from "@/lib/data/brewing-setup";
import { checkAiCoachAccess } from "@/lib/membership/ai-coach-limits";
import { updateTasteProfile } from "@/lib/data/ai";
import { evaluateAndAwardBadges, recordActivity, refreshCommunityStats } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import type { BrewSessionExport } from "@/types/brew-sessions";

export type BrewSessionActionState = { error?: string; success?: string } | undefined;

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRating(formData: FormData, invalidMessage: string): { value: number | null } | { error: string } {
  const raw = optionalString(formData, "rating");
  if (raw === null) return { value: null };
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) return { error: invalidMessage };
  return { value: parsed };
}

function parseTags(formData: FormData): string[] {
  const raw = optionalString(formData, "tags");
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function parseSteps(formData: FormData) {
  const raw = optionalString(formData, "stepsJson");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{
      stepNumber: number;
      action: string;
      waterAdded?: number | null;
      duration?: string | null;
      notes?: string | null;
    }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((step) => step.action?.trim())
      .slice(0, 30)
      .map((step, index) => ({
        step_number: step.stepNumber ?? index + 1,
        action: step.action.trim(),
        water_added: step.waterAdded ?? null,
        duration: step.duration ?? null,
        notes: step.notes ?? null,
      }));
  } catch {
    return [];
  }
}

function parsePhotos(formData: FormData) {
  const raw = optionalString(formData, "photosJson");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{ imageUrl: string; caption?: string | null }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((photo) => photo.imageUrl?.trim())
      .slice(0, 12)
      .map((photo) => ({
        image_url: photo.imageUrl.trim(),
        caption: photo.caption?.trim() || null,
      }));
  } catch {
    return [];
  }
}

function sessionPayload(formData: FormData, invalidRating: string) {
  const rating = parseRating(formData, invalidRating);
  if ("error" in rating) return { error: rating.error } as const;

  return {
    payload: {
      recipe_id: optionalString(formData, "recipeId"),
      coffee_name: optionalString(formData, "coffeeName"),
      roaster: optionalString(formData, "roaster"),
      origin: optionalString(formData, "origin"),
      roast_level: optionalString(formData, "roastLevel"),
      processing: optionalString(formData, "processing"),
      brew_method: optionalString(formData, "brewMethod"),
      grinder: optionalString(formData, "grinder"),
      brewer: optionalString(formData, "brewer"),
      kettle: optionalString(formData, "kettle"),
      filter: optionalString(formData, "filter"),
      grinder_setting: optionalString(formData, "grinderSetting"),
      dose: parseNumber(optionalString(formData, "dose")),
      water: parseNumber(optionalString(formData, "water")),
      ratio: optionalString(formData, "ratio"),
      temperature: parseNumber(optionalString(formData, "temperature")),
      bloom_time: optionalString(formData, "bloomTime"),
      brew_time: optionalString(formData, "brewTime"),
      yield: parseNumber(optionalString(formData, "yieldAmount")),
      tds: parseNumber(optionalString(formData, "tds")),
      extraction_yield: parseNumber(optionalString(formData, "extractionYield")),
      notes: optionalString(formData, "notes"),
      rating: rating.value,
      favorite: formData.get("favorite") === "on" || formData.get("favorite") === "true",
    },
    tags: parseTags(formData),
    steps: parseSteps(formData),
    photos: parsePhotos(formData),
  } as const;
}

function revalidateBrewSessionPaths(sessionId?: string) {
  revalidatePath("/account");
  revalidatePath("/account/brew-sessions");
  if (sessionId) {
    revalidatePath(`/account/brew-sessions/${sessionId}`);
    revalidatePath(`/account/brew-sessions/${sessionId}/edit`);
  }
}

async function replaceSessionChildren(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  tags: string[],
  steps: ReturnType<typeof parseSteps>,
  photos: ReturnType<typeof parsePhotos>,
) {
  await Promise.all([
    supabase.from("brew_session_tags").delete().eq("session_id", sessionId),
    supabase.from("brew_session_steps").delete().eq("session_id", sessionId),
    supabase.from("brew_session_photos").delete().eq("session_id", sessionId),
  ]);

  if (tags.length > 0) {
    await supabase.from("brew_session_tags").insert(tags.map((tag) => ({ session_id: sessionId, tag })));
  }
  if (steps.length > 0) {
    await supabase.from("brew_session_steps").insert(steps.map((step) => ({ session_id: sessionId, ...step })));
  }
  if (photos.length > 0) {
    await supabase.from("brew_session_photos").insert(photos.map((photo) => ({ session_id: sessionId, ...photo })));
  }
}

async function syncLegacyBrewLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  session: {
    recipe_id: string | null;
    coffee_name: string | null;
    grinder: string | null;
    grinder_setting: string | null;
    water: number | null;
    brew_time: string | null;
    brewer: string | null;
    brew_method: string | null;
    rating: number | null;
    favorite: boolean;
    notes: string | null;
  },
) {
  const [{ data: grinderRow }, { data: deviceRow }, { data: methodRow }] = await Promise.all([
    session.grinder
      ? supabase.from("grinders").select("id").ilike("name", session.grinder).limit(1).maybeSingle()
      : Promise.resolve({ data: null }),
    session.brewer
      ? supabase.from("devices").select("id").ilike("name", session.brewer).limit(1).maybeSingle()
      : Promise.resolve({ data: null }),
    session.brew_method
      ? supabase.from("brewing_methods").select("id").ilike("name", session.brew_method).limit(1).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  await supabase.from("user_brew_logs").insert({
    user_id: userId,
    recipe_id: session.recipe_id,
    coffee_name: session.coffee_name,
    grinder_id: grinderRow?.id ?? null,
    grind_size: session.grinder_setting,
    water_amount: session.water,
    brew_time: session.brew_time,
    brewing_device_id: deviceRow?.id ?? null,
    brewing_method_id: methodRow?.id ?? null,
    rating: session.rating,
    is_favorite: session.favorite,
    notes: session.notes,
    brewed_at: new Date().toISOString(),
  });
}

async function afterSessionMutation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  recipeId: string | null,
  rating: number | null,
) {
  await Promise.allSettled([
    refreshCommunityStats(supabase, userId),
    evaluateAndAwardBadges(supabase, userId),
    recordActivity(supabase, {
      userId,
      activityType: "brewed_recipe",
      recipeId,
      metadata: rating ? { rating } : {},
    }),
    updateTasteProfile(supabase, userId),
  ]);
}

export async function createBrewSessionAction(
  _prev: BrewSessionActionState,
  formData: FormData,
): Promise<BrewSessionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewSessionsPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const parsed = sessionPayload(formData, labels.invalidRating);
  if ("error" in parsed) return { error: parsed.error };

  const { data, error } = await supabase
    .from("brew_sessions")
    .insert({ user_id: authData.user.id, ...parsed.payload })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message || labels.saveFailed };

  await replaceSessionChildren(supabase, data.id, parsed.tags, parsed.steps, parsed.photos);
  await syncLegacyBrewLog(supabase, authData.user.id, parsed.payload);
  await afterSessionMutation(supabase, authData.user.id, parsed.payload.recipe_id, parsed.payload.rating);
  revalidateBrewSessionPaths(data.id);
  return { success: labels.sessionSaved };
}

export async function updateBrewSessionAction(
  _prev: BrewSessionActionState,
  formData: FormData,
): Promise<BrewSessionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewSessionsPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const sessionId = optionalString(formData, "sessionId");
  if (!sessionId) return { error: labels.saveFailed };

  const parsed = sessionPayload(formData, labels.invalidRating);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase
    .from("brew_sessions")
    .update(parsed.payload)
    .eq("id", sessionId)
    .eq("user_id", authData.user.id);

  if (error) return { error: error.message || labels.saveFailed };

  await replaceSessionChildren(supabase, sessionId, parsed.tags, parsed.steps, parsed.photos);
  await afterSessionMutation(supabase, authData.user.id, parsed.payload.recipe_id, parsed.payload.rating);
  revalidateBrewSessionPaths(sessionId);
  return { success: labels.sessionUpdated };
}

export async function deleteBrewSessionAction(
  _prev: BrewSessionActionState,
  formData: FormData,
): Promise<BrewSessionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewSessionsPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const sessionId = optionalString(formData, "sessionId");
  if (!sessionId) return { error: labels.saveFailed };

  const { error } = await supabase.from("brew_sessions").delete().eq("id", sessionId).eq("user_id", authData.user.id);
  if (error) return { error: error.message || labels.saveFailed };

  revalidateBrewSessionPaths();
  return { success: labels.sessionDeleted };
}

export async function duplicateBrewSessionAction(
  _prev: BrewSessionActionState,
  formData: FormData,
): Promise<BrewSessionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewSessionsPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const sessionId = optionalString(formData, "sessionId");
  if (!sessionId) return { error: labels.saveFailed };

  const source = await getBrewSessionById(supabase, authData.user.id, sessionId);
  if (!source) return { error: labels.saveFailed };

  const { data, error } = await supabase
    .from("brew_sessions")
    .insert({
      user_id: authData.user.id,
      recipe_id: source.recipeId,
      coffee_name: source.coffeeName,
      roaster: source.roaster,
      origin: source.origin,
      roast_level: source.roastLevel,
      processing: source.processing,
      brew_method: source.brewMethod,
      grinder: source.grinder,
      brewer: source.brewer,
      kettle: source.kettle,
      filter: source.filter,
      grinder_setting: source.grinderSetting,
      dose: source.dose,
      water: source.water,
      ratio: source.ratio,
      temperature: source.temperature,
      bloom_time: source.bloomTime,
      brew_time: source.brewTime,
      yield: source.yieldAmount,
      tds: source.tds,
      extraction_yield: source.extractionYield,
      notes: source.notes,
      rating: source.rating,
      favorite: source.favorite,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message || labels.saveFailed };

  await replaceSessionChildren(
    supabase,
    data.id,
    source.tags.map((tag) => tag.tag),
    source.steps.map((step) => ({
      step_number: step.stepNumber,
      action: step.action,
      water_added: step.waterAdded,
      duration: step.duration,
      notes: step.notes,
    })),
    source.photos.map((photo) => ({ image_url: photo.imageUrl, caption: photo.caption })),
  );

  revalidateBrewSessionPaths(data.id);
  return { success: labels.sessionDuplicated };
}

export async function toggleBrewSessionFavoriteAction(
  _prev: BrewSessionActionState,
  formData: FormData,
): Promise<BrewSessionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewSessionsPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const sessionId = optionalString(formData, "sessionId");
  const favorite = formData.get("favorite") === "true";
  if (!sessionId) return { error: labels.saveFailed };

  const { error } = await supabase
    .from("brew_sessions")
    .update({ favorite })
    .eq("id", sessionId)
    .eq("user_id", authData.user.id);

  if (error) return { error: error.message || labels.saveFailed };
  revalidateBrewSessionPaths(sessionId);
  return { success: favorite ? labels.favorited : labels.unfavorited };
}

export async function analyzeBrewSessionAction(sessionId: string): Promise<
  BrewSessionActionState & {
    markdown?: string;
    analysis?: { summary: string; strengths: string; weaknesses: string; recommendations: string };
  }
> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewSessionsPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const access = await checkAiCoachAccess(supabase, authData.user.id);
  const session = await getBrewSessionById(supabase, authData.user.id, sessionId);
  if (!session) return { error: labels.saveFailed };

  const [setup, similarSessions] = await Promise.all([
    getUserBrewingSetup(supabase, authData.user.id),
    getSimilarBrewSessions(supabase, authData.user.id, session),
  ]);

  const analysis = analyzeBrewSessionJournal({
    session,
    setup,
    similarSessions: similarSessions,
    recipeTitle: session.recipeTitle,
    aiEnabled: access.allowed,
  });

  if (!analysis) return { success: labels.analysisSkipped };

  await supabase.from("brew_session_ai_analysis").insert({
    session_id: sessionId,
    summary: analysis.summary,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    recommendations: analysis.recommendations,
  });

  revalidateBrewSessionPaths(sessionId);
  return {
    success: labels.analysisComplete,
    markdown: analysis.markdown,
    analysis: {
      summary: analysis.summary,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
    },
  };
}

export async function importBrewSessionsAction(
  _prev: BrewSessionActionState,
  formData: FormData,
): Promise<BrewSessionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewSessionsPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const raw = optionalString(formData, "importJson");
  if (!raw) return { error: labels.importInvalid };

  let parsed: BrewSessionExport;
  try {
    parsed = JSON.parse(raw) as BrewSessionExport;
    if (parsed.version !== 1 || !Array.isArray(parsed.sessions)) throw new Error("Invalid export");
  } catch {
    return { error: labels.importInvalid };
  }

  for (const session of parsed.sessions.slice(0, 200)) {
    const { data, error } = await supabase
      .from("brew_sessions")
      .insert({
        user_id: authData.user.id,
        recipe_id: session.recipeId,
        coffee_name: session.coffeeName,
        roaster: session.roaster,
        origin: session.origin,
        roast_level: session.roastLevel,
        processing: session.processing,
        brew_method: session.brewMethod,
        grinder: session.grinder,
        brewer: session.brewer,
        kettle: session.kettle,
        filter: session.filter,
        grinder_setting: session.grinderSetting,
        dose: session.dose,
        water: session.water,
        ratio: session.ratio,
        temperature: session.temperature,
        bloom_time: session.bloomTime,
        brew_time: session.brewTime,
        yield: session.yieldAmount,
        tds: session.tds,
        extraction_yield: session.extractionYield,
        notes: session.notes,
        rating: session.rating,
        favorite: session.favorite,
      })
      .select("id")
      .single();

    if (error || !data) continue;

    await replaceSessionChildren(
      supabase,
      data.id,
      session.tags ?? [],
      (session.steps ?? []).map((step) => ({
        step_number: step.stepNumber,
        action: step.action,
        water_added: step.waterAdded,
        duration: step.duration,
        notes: step.notes,
      })),
      (session.photos ?? []).map((photo) => ({ image_url: photo.imageUrl, caption: photo.caption })),
    );
  }

  revalidateBrewSessionPaths();
  return { success: labels.importComplete };
}

export async function exportBrewSessionsJsonAction(): Promise<{ json?: string; error?: string }> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewSessionsPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const payload = await exportBrewSessions(supabase, authData.user.id);
  return { json: JSON.stringify(payload, null, 2) };
}

export async function exportBrewSessionsCsvAction(): Promise<{ csv?: string; error?: string }> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewSessionsPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const payload = await exportBrewSessions(supabase, authData.user.id);
  const { brewSessionsToCsv } = await import("@/lib/data/brew-sessions");
  return { csv: brewSessionsToCsv(payload) };
}
