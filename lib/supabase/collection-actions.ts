"use server";

import { revalidatePath } from "next/cache";
import { getUserCollections } from "@/lib/data/collections";
import { getMembershipSummary } from "@/lib/data/membership";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { canCreateCollection } from "@/lib/membership/access";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for recipe collections (`recipe_collections` /
 * `recipe_collection_items`), backing `/account/collections`.
 */

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function revalidateCollections(collectionId?: string) {
  revalidatePath("/account");
  revalidatePath("/account/collections");
  if (collectionId) {
    revalidatePath(`/account/collections/${collectionId}`);
  }
}

export type CollectionActionState = { error?: string; success?: string } | undefined;

/** Creates a new collection for the caller. */
export async function createCollectionAction(
  _prevState: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const c = dictionary.collectionsPage;
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: c.signInRequired };
  }

  const name = optionalString(formData, "name");
  if (!name) {
    return { error: c.nameRequired };
  }

  const [membership, collections] = await Promise.all([
    getMembershipSummary(supabase, authData.user.id),
    getUserCollections(supabase, authData.user.id),
  ]);

  if (!canCreateCollection(membership, collections.length)) {
    return { error: c.limitReached };
  }

  const { data: inserted, error } = await supabase
    .from("recipe_collections")
    .insert({ user_id: authData.user.id, name })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: c.duplicateName };
    }
    return { error: error.message || c.createFailed };
  }

  revalidateCollections(inserted?.id as string | undefined);
  return { success: c.collectionCreated };
}

/** Renames a collection the caller owns. */
export async function renameCollectionAction(
  _prevState: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const c = dictionary.collectionsPage;
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: c.signInRequired };
  }

  const collectionId = optionalString(formData, "collectionId");
  const name = optionalString(formData, "name");
  if (!collectionId) return { error: c.missingCollectionId };
  if (!name) return { error: c.nameRequired };

  const { error } = await supabase
    .from("recipe_collections")
    .update({ name })
    .eq("id", collectionId)
    .eq("user_id", authData.user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: c.duplicateName };
    }
    return { error: error.message || c.renameFailed };
  }

  revalidateCollections(collectionId);
  return { success: c.collectionRenamed };
}

/** Deletes a collection the caller owns (items cascade). */
export async function deleteCollectionAction(
  _prevState: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const c = dictionary.collectionsPage;
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: c.signInRequired };
  }

  const collectionId = optionalString(formData, "collectionId");
  if (!collectionId) return { error: c.missingCollectionId };

  const { error } = await supabase
    .from("recipe_collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", authData.user.id);

  if (error) {
    return { error: error.message || c.deleteFailed };
  }

  revalidateCollections();
  return { success: c.collectionDeleted };
}

/** Adds a recipe to a collection the caller owns. */
export async function addRecipeToCollectionAction(
  _prevState: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const c = dictionary.collectionsPage;
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: c.signInRequired };
  }

  const collectionId = optionalString(formData, "collectionId");
  const recipeId = optionalString(formData, "recipeId");
  if (!collectionId) return { error: c.missingCollectionId };
  if (!recipeId) return { error: c.recipeRequired };

  const { data: owned } = await supabase
    .from("recipe_collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (!owned) {
    return { error: c.notFound };
  }

  const { error } = await supabase
    .from("recipe_collection_items")
    .upsert({ collection_id: collectionId, recipe_id: recipeId }, { onConflict: "collection_id,recipe_id", ignoreDuplicates: true });

  if (error) {
    return { error: error.message || c.addRecipeFailed };
  }

  revalidateCollections(collectionId);
  return { success: c.recipeAdded };
}

/** Removes a recipe from a collection the caller owns. */
export async function removeRecipeFromCollectionAction(
  _prevState: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const c = dictionary.collectionsPage;
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: c.signInRequired };
  }

  const collectionId = optionalString(formData, "collectionId");
  const recipeId = optionalString(formData, "recipeId");
  if (!collectionId) return { error: c.missingCollectionId };
  if (!recipeId) return { error: c.recipeRequired };

  const { data: owned } = await supabase
    .from("recipe_collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (!owned) {
    return { error: c.notFound };
  }

  const { error } = await supabase
    .from("recipe_collection_items")
    .delete()
    .eq("collection_id", collectionId)
    .eq("recipe_id", recipeId);

  if (error) {
    return { error: error.message || c.removeRecipeFailed };
  }

  revalidateCollections(collectionId);
  return { success: c.recipeRemoved };
}
