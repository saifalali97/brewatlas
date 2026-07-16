"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { requireAdmin } from "@/lib/auth/is-admin";
import { recordAdminAudit } from "@/lib/data/admin-audit";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = readString(formData, key);
  return value.length > 0 ? value : null;
}

function readBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true";
}

function readId(formData: FormData): string | null {
  const value = formData.get("id");
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readInt(formData: FormData, key: string, fallback = 0): number {
  const raw = readString(formData, key);
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function gate() {
  return requireAdmin("/admin/homepage");
}

function revalidateHomepage() {
  revalidatePath("/");
  revalidatePath(ADMIN_CMS_PATHS.homepage);
  revalidatePath(ADMIN_CMS_PATHS.heroBanners);
  revalidatePath(ADMIN_CMS_PATHS.featuredRecipes);
  revalidatePath(ADMIN_CMS_PATHS.homepageSections);
}

export async function createHomepageHeroAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const title = readString(formData, "title");
  if (!title) redirect(ADMIN_CMS_PATHS.heroBanners);

  const { data, error } = await supabase
    .from("homepage_hero_banners")
    .insert({
      locale: readString(formData, "locale") || "en",
      eyebrow: readOptionalString(formData, "eyebrow"),
      title,
      subtitle: readOptionalString(formData, "subtitle"),
      image_url: readOptionalString(formData, "imageUrl"),
      media_asset_id: readOptionalString(formData, "mediaAssetId"),
      cta_label: readOptionalString(formData, "ctaLabel"),
      cta_href: readOptionalString(formData, "ctaHref"),
      published: readBoolean(formData, "published"),
      position: readInt(formData, "position"),
    })
    .select("id")
    .single();

  if (!error && data) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_hero",
      targetId: data.id,
      action: "homepage_hero_created",
    });
    revalidateHomepage();
    redirect(`${ADMIN_CMS_PATHS.heroBanners}/${data.id}/edit`);
  }

  revalidateHomepage();
  redirect(ADMIN_CMS_PATHS.heroBanners);
}

export async function updateHomepageHeroAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateHomepage();
    return;
  }

  const { error } = await supabase
    .from("homepage_hero_banners")
    .update({
      locale: readString(formData, "locale") || "en",
      eyebrow: readOptionalString(formData, "eyebrow"),
      title: readString(formData, "title"),
      subtitle: readOptionalString(formData, "subtitle"),
      image_url: readOptionalString(formData, "imageUrl"),
      media_asset_id: readOptionalString(formData, "mediaAssetId"),
      cta_label: readOptionalString(formData, "ctaLabel"),
      cta_href: readOptionalString(formData, "ctaHref"),
      published: readBoolean(formData, "published"),
      position: readInt(formData, "position"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_hero",
      targetId: id,
      action: "homepage_hero_updated",
    });
  }

  revalidateHomepage();
  redirect(`${ADMIN_CMS_PATHS.heroBanners}/${id}/edit`);
}

export async function deleteHomepageHeroAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateHomepage();
    return;
  }

  const { error } = await supabase.from("homepage_hero_banners").delete().eq("id", id);
  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_hero",
      targetId: id,
      action: "homepage_hero_deleted",
    });
  }

  revalidateHomepage();
  redirect(ADMIN_CMS_PATHS.heroBanners);
}

export async function toggleHomepageHeroPublishAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateHomepage();
    return;
  }

  const published = readBoolean(formData, "published");
  const { error } = await supabase
    .from("homepage_hero_banners")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_hero",
      targetId: id,
      action: published ? "homepage_hero_published" : "homepage_hero_unpublished",
    });
  }

  revalidateHomepage();
}

export async function createHomepageFeaturedRecipeAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const { data, error } = await supabase
    .from("homepage_featured_recipes")
    .insert({
      locale: readString(formData, "locale") || "en",
      recipe_id: readOptionalString(formData, "recipeId"),
      display_name: readOptionalString(formData, "displayName"),
      display_image_url: readOptionalString(formData, "displayImageUrl"),
      media_asset_id: readOptionalString(formData, "mediaAssetId"),
      display_country: readOptionalString(formData, "displayCountry"),
      display_origin: readOptionalString(formData, "displayOrigin"),
      display_brew_method: readOptionalString(formData, "displayBrewMethod"),
      display_notes: readOptionalString(formData, "displayNotes"),
      published: readBoolean(formData, "published"),
      position: readInt(formData, "position"),
    })
    .select("id")
    .single();

  if (!error && data) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_featured_recipe",
      targetId: data.id,
      action: "homepage_featured_created",
    });
    revalidateHomepage();
    redirect(`${ADMIN_CMS_PATHS.featuredRecipes}/${data.id}/edit`);
  }

  revalidateHomepage();
  redirect(ADMIN_CMS_PATHS.featuredRecipes);
}

export async function updateHomepageFeaturedRecipeAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateHomepage();
    return;
  }

  const { error } = await supabase
    .from("homepage_featured_recipes")
    .update({
      locale: readString(formData, "locale") || "en",
      recipe_id: readOptionalString(formData, "recipeId"),
      display_name: readOptionalString(formData, "displayName"),
      display_image_url: readOptionalString(formData, "displayImageUrl"),
      media_asset_id: readOptionalString(formData, "mediaAssetId"),
      display_country: readOptionalString(formData, "displayCountry"),
      display_origin: readOptionalString(formData, "displayOrigin"),
      display_brew_method: readOptionalString(formData, "displayBrewMethod"),
      display_notes: readOptionalString(formData, "displayNotes"),
      published: readBoolean(formData, "published"),
      position: readInt(formData, "position"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_featured_recipe",
      targetId: id,
      action: "homepage_featured_updated",
    });
  }

  revalidateHomepage();
  redirect(`${ADMIN_CMS_PATHS.featuredRecipes}/${id}/edit`);
}

export async function deleteHomepageFeaturedRecipeAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateHomepage();
    return;
  }

  const { error } = await supabase.from("homepage_featured_recipes").delete().eq("id", id);
  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_featured_recipe",
      targetId: id,
      action: "homepage_featured_deleted",
    });
  }

  revalidateHomepage();
  redirect(ADMIN_CMS_PATHS.featuredRecipes);
}

export async function toggleHomepageFeaturedPublishAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateHomepage();
    return;
  }

  const published = readBoolean(formData, "published");
  const { error } = await supabase
    .from("homepage_featured_recipes")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_featured_recipe",
      targetId: id,
      action: published ? "homepage_featured_published" : "homepage_featured_unpublished",
    });
  }

  revalidateHomepage();
}

export async function saveHomepageSectionAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const locale = readString(formData, "locale") || "en";
  const sectionKey = readString(formData, "sectionKey");
  const json = readString(formData, "contentJson");
  if (!sectionKey || !json) {
    redirect(ADMIN_CMS_PATHS.homepageSections);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    redirect(`${ADMIN_CMS_PATHS.homepageSections}/${sectionKey}?error=invalid_json`);
  }

  const { data: existing } = await supabase
    .from("homepage_sections")
    .select("id")
    .eq("locale", locale)
    .eq("section_key", sectionKey)
    .maybeSingle();

  const payload = {
    locale,
    section_key: sectionKey,
    title: readOptionalString(formData, "title"),
    content: parsed,
    published: readBoolean(formData, "published"),
    position: readInt(formData, "position"),
    updated_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabase.from("homepage_sections").update(payload).eq("id", existing.id)
    : await supabase.from("homepage_sections").insert(payload);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_section",
      targetId: existing?.id ?? sectionKey,
      action: "homepage_section_saved",
      metadata: { sectionKey, locale },
    });
  }

  revalidateHomepage();
  redirect(`${ADMIN_CMS_PATHS.homepageSections}/${sectionKey}`);
}

export async function deleteHomepageSectionAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateHomepage();
    return;
  }

  const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "homepage_section",
      targetId: id,
      action: "homepage_section_deleted",
    });
  }

  revalidateHomepage();
  redirect(ADMIN_CMS_PATHS.homepageSections);
}
