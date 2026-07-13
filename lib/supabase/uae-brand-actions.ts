"use server";

import { revalidatePath } from "next/cache";
import {
  upsertHeritageHighlight,
  upsertUaeCoffeeMapLocation,
} from "@/lib/data/uae-brand";
import { createClient } from "@/lib/supabase/server";
import { UAE_HERITAGE_CATEGORIES, UAE_MAP_LOCATION_TYPES } from "@/types/uae-brand";
import type { HeritageCategory, UaeCoffeeMapLocationType } from "@/types/uae-brand";

/**
 * Admin-only Server Actions for managing UAE brand content (heritage
 * highlights, coffee-map locations). Mirrors the shape of the other
 * `lib/supabase/*-actions.ts` files: parse `FormData`, delegate to the
 * data layer (where RLS is enforced), revalidate, return a
 * `{ error }` / `{ success }` state. No admin UI exists yet -- these are
 * groundwork for one, matching the pattern used elsewhere in this
 * codebase for not-yet-wired-up admin tooling.
 */

export type UaeBrandActionState = { error?: string; success?: string } | undefined;

function requiredString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isHeritageCategory(value: string | null): value is HeritageCategory {
  return !!value && (UAE_HERITAGE_CATEGORIES as readonly string[]).includes(value);
}

function isMapLocationType(value: string | null): value is UaeCoffeeMapLocationType {
  return !!value && (UAE_MAP_LOCATION_TYPES as readonly string[]).includes(value);
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { supabase, error: "You must be signed in." } as const;
  return { supabase, error: null } as const;
}

/** Creates or updates a heritage highlight card. RLS on `uae_heritage_highlights` restricts this to admins regardless of what this action allows through. */
export async function saveHeritageHighlightAction(
  _prevState: UaeBrandActionState,
  formData: FormData,
): Promise<UaeBrandActionState> {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const slug = requiredString(formData, "slug");
  const categoryRaw = requiredString(formData, "category");
  const title = requiredString(formData, "title");
  const summary = requiredString(formData, "summary");
  if (!slug) return { error: "slug is required." };
  if (!isHeritageCategory(categoryRaw)) {
    return { error: `category must be one of: ${UAE_HERITAGE_CATEGORIES.join(", ")}.` };
  }
  if (!title) return { error: "title is required." };
  if (!summary) return { error: "summary is required." };

  const positionRaw = optionalString(formData, "position");
  const saved = await upsertHeritageHighlight(supabase, {
    slug,
    category: categoryRaw,
    title,
    summary,
    iconKey: optionalString(formData, "iconKey"),
    relatedSectionSlug: optionalString(formData, "relatedSectionSlug"),
    relatedTopicSlug: optionalString(formData, "relatedTopicSlug"),
    position: positionRaw ? Number(positionRaw) : undefined,
  });

  if (!saved) return { error: "Failed to save the heritage highlight." };

  revalidatePath("/culture");
  return { success: "Heritage highlight saved." };
}

/** Creates or updates a coffee-map location. RLS on `uae_coffee_map_locations` restricts this to admins regardless of what this action allows through. */
export async function saveUaeCoffeeMapLocationAction(
  _prevState: UaeBrandActionState,
  formData: FormData,
): Promise<UaeBrandActionState> {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const slug = requiredString(formData, "slug");
  const name = requiredString(formData, "name");
  const locationTypeRaw = requiredString(formData, "locationType");
  const emirate = requiredString(formData, "emirate");
  const latitudeRaw = requiredString(formData, "latitude");
  const longitudeRaw = requiredString(formData, "longitude");

  if (!slug) return { error: "slug is required." };
  if (!name) return { error: "name is required." };
  if (!isMapLocationType(locationTypeRaw)) {
    return { error: `locationType must be one of: ${UAE_MAP_LOCATION_TYPES.join(", ")}.` };
  }
  if (!emirate) return { error: "emirate is required." };
  if (!latitudeRaw || !longitudeRaw) return { error: "latitude and longitude are required." };

  const saved = await upsertUaeCoffeeMapLocation(supabase, {
    slug,
    name,
    locationType: locationTypeRaw,
    emirate,
    city: optionalString(formData, "city"),
    address: optionalString(formData, "address"),
    latitude: Number(latitudeRaw),
    longitude: Number(longitudeRaw),
    description: optionalString(formData, "description"),
    website: optionalString(formData, "website"),
    roasterId: optionalString(formData, "roasterId"),
    featured: formData.get("featured") === "true",
  });

  if (!saved) return { error: "Failed to save the coffee-map location." };

  return { success: "Coffee-map location saved." };
}
